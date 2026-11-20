-- Al terminar, Supabase recarga las tablas nuevas (ver la última línea).
-- =====================================================================
--  INTRANET ADEL CATATUMBO · Módulo ERP de seguimiento de proyectos
--  Ejecutar UNA VEZ en Supabase → SQL Editor → New query → Run,
--  DESPUÉS de esquema.sql. Se puede volver a ejecutar sin dañar datos.
--
--  Acceso ERP: perfiles Administrador y Coordinación de proyectos, más
--  cualquier usuario al que el administrador le active "Acceso ERP".
--  Los demás solo ven y actualizan las tareas que tienen asignadas.
-- =====================================================================

-- ---------- Permiso ERP en el perfil ----------
alter table public.perfiles add column if not exists erp boolean not null default false;

create or replace function public.tiene_erp() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select activo and (rol in ('admin','coordinacion') or erp)
                   from public.perfiles where id = auth.uid()), false)
$$;

-- Solo el admin cambia el permiso ERP (se amplía la protección existente)
create or replace function public.proteger_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(public.mi_rol(),'') <> 'admin' and auth.uid() is not null then
    if new.rol is distinct from old.rol or new.activo is distinct from old.activo
       or new.empleado_id is distinct from old.empleado_id or new.correo is distinct from old.correo
       or new.erp is distinct from old.erp then
      raise exception 'Solo el administrador puede cambiar perfiles, estados, permisos o vínculos.';
    end if;
  end if;
  if old.rol = 'admin' and old.activo and (new.rol is distinct from 'admin' or not new.activo)
     and (select count(*) from public.perfiles where rol='admin' and activo and id <> old.id) = 0 then
    raise exception 'Debe quedar al menos un administrador activo.';
  end if;
  return new;
end $$;

-- ---------- Tablas ----------
create table if not exists public.proyectos (
  id            uuid primary key default gen_random_uuid(),
  codigo        text unique,
  nombre        text not null,
  descripcion   text,
  financiador   text,
  aliados       text,
  linea         text,
  municipios    text,
  fecha_inicio  date,
  fecha_fin     date,
  presupuesto   numeric(16,0) not null default 0 check (presupuesto >= 0),
  estado        text not null default 'ejecucion'
                check (estado in ('formulacion','ejecucion','suspendido','cierre','finalizado')),
  responsable   uuid references public.perfiles(id) on delete set null,
  color         text not null default '#449890',
  creado        timestamptz not null default now(),
  actualizado   timestamptz not null default now(),
  check (fecha_fin is null or fecha_inicio is null or fecha_fin >= fecha_inicio)
);

create table if not exists public.tareas (
  id            uuid primary key default gen_random_uuid(),
  proyecto_id   uuid not null references public.proyectos(id) on delete cascade,
  titulo        text not null,
  descripcion   text,
  componente    text,                                  -- fase, componente o actividad del marco lógico
  estado        text not null default 'pendiente' check (estado in ('pendiente','en_curso','revision','hecha')),
  prioridad     text not null default 'media' check (prioridad in ('baja','media','alta','urgente')),
  responsable   uuid references public.perfiles(id) on delete set null,
  fecha_inicio  date,
  fecha_limite  date,
  avance        int not null default 0 check (avance between 0 and 100),
  orden         double precision not null default 0,
  checklist     jsonb not null default '[]'::jsonb,
  creado_por    uuid references public.perfiles(id) on delete set null default auth.uid(),
  creado        timestamptz not null default now(),
  actualizado   timestamptz not null default now()
);

create table if not exists public.tarea_comentarios (
  id        uuid primary key default gen_random_uuid(),
  tarea_id  uuid not null references public.tareas(id) on delete cascade,
  autor     uuid references public.perfiles(id) on delete set null default auth.uid(),
  texto     text not null check (length(texto) between 1 and 4000),
  creado    timestamptz not null default now()
);

create table if not exists public.gastos (
  id              uuid primary key default gen_random_uuid(),
  proyecto_id     uuid not null references public.proyectos(id) on delete cascade,
  fecha           date not null default current_date,
  rubro           text not null default 'Otros',
  concepto        text not null,
  valor           numeric(16,0) not null check (valor > 0),
  soporte         text,                                -- n.º de factura, comprobante o enlace
  registrado_por  uuid references public.perfiles(id) on delete set null default auth.uid(),
  creado          timestamptz not null default now()
);

create table if not exists public.indicadores (
  id           uuid primary key default gen_random_uuid(),
  proyecto_id  uuid not null references public.proyectos(id) on delete cascade,
  nombre       text not null,
  unidad       text not null default 'unidades',
  meta         numeric(14,2) not null default 0 check (meta >= 0),
  logrado      numeric(14,2) not null default 0 check (logrado >= 0),
  fecha_corte  date,
  creado       timestamptz not null default now(),
  actualizado  timestamptz not null default now()
);

create index if not exists tareas_proyecto_idx on public.tareas(proyecto_id);
create index if not exists tareas_responsable_idx on public.tareas(responsable);
create index if not exists comentarios_tarea_idx on public.tarea_comentarios(tarea_id);
create index if not exists gastos_proyecto_idx on public.gastos(proyecto_id);
create index if not exists indicadores_proyecto_idx on public.indicadores(proyecto_id);

-- fechas de actualización y bitácora
drop trigger if exists t_proyectos_act on public.proyectos;
create trigger t_proyectos_act before update on public.proyectos for each row execute function public.marcar_actualizado();
drop trigger if exists t_tareas_act on public.tareas;
create trigger t_tareas_act before update on public.tareas for each row execute function public.marcar_actualizado();
drop trigger if exists t_indicadores_act on public.indicadores;
create trigger t_indicadores_act before update on public.indicadores for each row execute function public.marcar_actualizado();
do $$ declare t text; begin
  foreach t in array array['proyectos','tareas','gastos','indicadores'] loop
    execute format('drop trigger if exists t_bitacora on public.%I', t);
    execute format('create trigger t_bitacora after insert or update or delete on public.%I for each row execute function public.registrar_bitacora()', t);
  end loop;
end $$;
-- la bitácora usa "nombre", "titulo" o "concepto" como detalle
create or replace function public.registrar_bitacora() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_fila jsonb;
begin
  v_fila := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  insert into public.bitacora (usuario, correo, accion, tabla, registro, detalle)
  values (auth.uid(), (select correo from public.perfiles where id = auth.uid()),
          case tg_op when 'INSERT' then 'crear' when 'UPDATE' then 'modificar' else 'eliminar' end,
          tg_table_name, v_fila->>'id',
          coalesce(v_fila->>'nombres' || ' ' || (v_fila->>'apellidos'), v_fila->>'nombre', v_fila->>'titulo',
                   v_fila->>'codigo', v_fila->>'concepto', v_fila->>'resumen'));
  return coalesce(new, old);
end $$;

-- ---------- El responsable de una tarea (sin acceso ERP) solo cambia estado, avance y checklist ----------
create or replace function public.actualizar_mi_tarea(p_id uuid, p_estado text, p_avance int, p_checklist jsonb)
returns public.tareas
language plpgsql security definer set search_path = public as $$
declare t public.tareas;
begin
  select * into t from public.tareas where id = p_id for update;
  if not found then raise exception 'La tarea no existe.'; end if;
  if not public.tiene_erp() and (t.responsable is distinct from auth.uid() or public.mi_rol() is null) then
    raise exception 'Solo el responsable de la tarea puede actualizarla.';
  end if;
  update public.tareas set
    estado = coalesce(p_estado, estado),
    avance = case when coalesce(p_estado, estado) = 'hecha' then 100 else coalesce(p_avance, avance) end,
    checklist = coalesce(p_checklist, checklist)
  where id = p_id returning * into t;
  return t;
end $$;

-- ---------- Seguridad por filas ----------
alter table public.proyectos         enable row level security;
alter table public.tareas            enable row level security;
alter table public.tarea_comentarios enable row level security;
alter table public.gastos            enable row level security;
alter table public.indicadores       enable row level security;

do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname='public'
           and tablename in ('proyectos','tareas','tarea_comentarios','gastos','indicadores') loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- proyectos: ERP ve y edita todo; quien tenga tareas asignadas ve el nombre del proyecto
create policy proyectos_ver on public.proyectos for select to authenticated
  using (public.tiene_erp() or exists (select 1 from public.tareas t where t.proyecto_id = proyectos.id and t.responsable = auth.uid()));
create policy proyectos_crear on public.proyectos for insert to authenticated with check (public.tiene_erp());
create policy proyectos_editar on public.proyectos for update to authenticated using (public.tiene_erp()) with check (public.tiene_erp());
create policy proyectos_borrar on public.proyectos for delete to authenticated using (public.mi_rol() = 'admin');

-- tareas: ERP todo; el responsable ve las suyas (y las actualiza con actualizar_mi_tarea)
create policy tareas_ver on public.tareas for select to authenticated
  using (public.tiene_erp() or (public.mi_rol() is not null and responsable = auth.uid()));
create policy tareas_crear on public.tareas for insert to authenticated with check (public.tiene_erp());
create policy tareas_editar on public.tareas for update to authenticated using (public.tiene_erp()) with check (public.tiene_erp());
create policy tareas_borrar on public.tareas for delete to authenticated using (public.tiene_erp());

-- comentarios: quien puede ver la tarea puede leer y comentar; cada quien borra los suyos
create policy comentarios_ver on public.tarea_comentarios for select to authenticated
  using (exists (select 1 from public.tareas t where t.id = tarea_id));
create policy comentarios_crear on public.tarea_comentarios for insert to authenticated
  with check (autor = auth.uid() and exists (select 1 from public.tareas t where t.id = tarea_id));
create policy comentarios_borrar on public.tarea_comentarios for delete to authenticated
  using (autor = auth.uid() or public.mi_rol() = 'admin');

-- presupuesto e indicadores: solo ERP
create policy gastos_ver on public.gastos for select to authenticated using (public.tiene_erp());
create policy gastos_crear on public.gastos for insert to authenticated with check (public.tiene_erp());
create policy gastos_editar on public.gastos for update to authenticated using (public.tiene_erp()) with check (public.tiene_erp());
create policy gastos_borrar on public.gastos for delete to authenticated using (public.tiene_erp());
create policy indicadores_ver on public.indicadores for select to authenticated using (public.tiene_erp());
create policy indicadores_crear on public.indicadores for insert to authenticated with check (public.tiene_erp());
create policy indicadores_editar on public.indicadores for update to authenticated using (public.tiene_erp()) with check (public.tiene_erp());
create policy indicadores_borrar on public.indicadores for delete to authenticated using (public.tiene_erp());

-- los perfiles con ERP necesitan ver la lista de personas para asignar tareas
drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = auth.uid() or public.mi_rol() in ('admin','talento_humano') or public.tiene_erp());

-- ---------- Permisos ----------
grant select, insert, update, delete on public.proyectos, public.tareas, public.tarea_comentarios,
  public.gastos, public.indicadores to authenticated;
revoke all on public.proyectos, public.tareas, public.tarea_comentarios, public.gastos, public.indicadores from anon;
revoke all on function public.actualizar_mi_tarea(uuid, text, int, jsonb) from public, anon;
grant execute on function public.actualizar_mi_tarea(uuid, text, int, jsonb) to authenticated;
grant execute on function public.tiene_erp() to authenticated;

-- Recargar el catálogo de la API para que la intranet vea las tablas nuevas de inmediato
notify pgrst, 'reload schema';
