-- =====================================================================
--  INTRANET ADEL CATATUMBO · Esquema de base de datos (Supabase)
--  Cómo usarlo: Supabase → SQL Editor → New query → pegar TODO este
--  archivo → Run. Se puede ejecutar más de una vez sin dañar datos.
--
--  Perfiles: admin · talento_humano · coordinacion · comunicaciones · trabajador
--  La seguridad la hace la base de datos (Row Level Security): aunque
--  alguien manipule la página, solo puede ver lo que su perfil permite.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tablas ----------
create table if not exists public.empleados (
  id              uuid primary key default gen_random_uuid(),
  nombres         text not null,
  apellidos       text not null,
  tipo_doc        text not null default 'CC' check (tipo_doc in ('CC','CE','PPT','PA','TI')),
  documento       text not null unique,
  expedida_en     text,
  genero          text check (genero in ('F','M')),
  cargo           text not null,
  area            text,
  tipo_contrato   text not null default 'Término fijo'
                  check (tipo_contrato in ('Término indefinido','Término fijo','Obra o labor','Prestación de servicios','Aprendizaje')),
  fecha_ingreso   date not null,
  fecha_retiro    date,
  salario         numeric(14,0) check (salario is null or salario >= 0),
  funciones       text,
  correo          text,
  telefono        text,
  direccion       text,
  municipio       text,
  eps             text,
  pension         text,
  estado          text not null default 'activo' check (estado in ('activo','retirado')),
  notas           text,
  creado          timestamptz not null default now(),
  actualizado     timestamptz not null default now()
);

create table if not exists public.perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null default '',
  correo      text not null default '',
  rol         text check (rol in ('admin','talento_humano','coordinacion','comunicaciones','trabajador')),
  activo      boolean not null default false,   -- el administrador lo activa
  empleado_id uuid references public.empleados(id) on delete set null,
  creado      timestamptz not null default now()
);

create table if not exists public.cartas (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique default ('ADEL-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,10))),
  empleado_id      uuid not null references public.empleados(id) on delete cascade,
  solicitante      uuid references auth.users(id) on delete set null,
  tipo             text not null check (tipo in ('basica','salario','funciones','retiro')),
  dirigida_a       text not null default 'A quien interese',
  motivo           text,
  estado           text not null default 'pendiente' check (estado in ('pendiente','aprobada','rechazada')),
  observacion      text,
  contenido        jsonb,               -- copia de los datos del trabajador al aprobar
  aprobada_por     uuid references auth.users(id) on delete set null,
  fecha_solicitud  timestamptz not null default now(),
  fecha_respuesta  timestamptz
);

create table if not exists public.contactos (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  tipo          text not null default 'aliado'
                check (tipo in ('cooperante','entidad_publica','alcaldia','proveedor','asociacion','beneficiario','aliado','empresa','otro')),
  organizacion  text,
  cargo         text,
  municipio     text,
  correo        text,
  telefono      text,
  estado        text not null default 'activo' check (estado in ('prospecto','activo','inactivo')),
  etiquetas     text,
  notas         text,
  responsable   uuid references auth.users(id) on delete set null,
  creado        timestamptz not null default now(),
  actualizado   timestamptz not null default now()
);

create table if not exists public.interacciones (
  id             uuid primary key default gen_random_uuid(),
  contacto_id    uuid not null references public.contactos(id) on delete cascade,
  fecha          date not null default current_date,
  tipo           text not null default 'reunion' check (tipo in ('reunion','llamada','correo','visita','convenio','otro')),
  resumen        text not null,
  proximo_paso   text,
  fecha_proximo  date,
  autor          uuid references auth.users(id) on delete set null default auth.uid(),
  creado         timestamptz not null default now()
);

create table if not exists public.bitacora (
  id        bigint generated always as identity primary key,
  fecha     timestamptz not null default now(),
  usuario   uuid,
  correo    text,
  accion    text not null,
  tabla     text not null,
  registro  text,
  detalle   text
);

create index if not exists cartas_empleado_idx on public.cartas(empleado_id);
create index if not exists cartas_estado_idx on public.cartas(estado);
create index if not exists interacciones_contacto_idx on public.interacciones(contacto_id);
create index if not exists perfiles_empleado_idx on public.perfiles(empleado_id);

-- columnas agregadas en versiones posteriores (para bases ya creadas)
alter table public.empleados add column if not exists genero text check (genero in ('F','M'));
alter table public.perfiles add column if not exists erp boolean not null default false;

-- ---------- Funciones de apoyo ----------
create or replace function public.mi_rol() returns text
language sql stable security definer set search_path = public as $$
  select rol from public.perfiles where id = auth.uid() and activo
$$;

create or replace function public.mi_empleado() returns uuid
language sql stable security definer set search_path = public as $$
  select empleado_id from public.perfiles where id = auth.uid() and activo
$$;

create or replace function public.tiene_erp() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select activo and (rol in ('admin','coordinacion') or erp)
                   from public.perfiles where id = auth.uid()), false)
$$;

-- Al registrarse alguien, se crea su perfil INACTIVO (sin acceso hasta que el admin lo active)
create or replace function public.nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, correo, rol, activo)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', ''), coalesce(new.email,''), null, false)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.nuevo_usuario();

-- Fecha de actualización
create or replace function public.marcar_actualizado() returns trigger language plpgsql as $$
begin new.actualizado = now(); return new; end $$;
drop trigger if exists t_empleados_act on public.empleados;
create trigger t_empleados_act before update on public.empleados for each row execute function public.marcar_actualizado();
drop trigger if exists t_contactos_act on public.contactos;
create trigger t_contactos_act before update on public.contactos for each row execute function public.marcar_actualizado();

-- Bitácora (quién hizo qué)
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
do $$ declare t text; begin
  foreach t in array array['empleados','cartas','contactos','interacciones','perfiles'] loop
    execute format('drop trigger if exists t_bitacora on public.%I', t);
    execute format('create trigger t_bitacora after insert or update or delete on public.%I for each row execute function public.registrar_bitacora()', t);
  end loop;
end $$;

-- Protección: nadie (salvo admin) puede cambiar rol, activo o empleado de un perfil
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
drop trigger if exists t_proteger_perfil on public.perfiles;
create trigger t_proteger_perfil before update on public.perfiles for each row execute function public.proteger_perfil();

-- ---------- Cartas: aprobar, rechazar y verificar ----------
create or replace function public.responder_carta(p_id uuid, p_aprobar boolean, p_observacion text default null)
returns public.cartas
language plpgsql security definer set search_path = public as $$
declare c public.cartas; e public.empleados;
begin
  if coalesce(public.mi_rol(),'') not in ('admin','talento_humano') then
    raise exception 'No tiene permiso para responder cartas.';
  end if;
  select * into c from public.cartas where id = p_id for update;
  if not found then raise exception 'La carta no existe.'; end if;
  if c.estado <> 'pendiente' then raise exception 'La carta ya fue respondida.'; end if;
  select * into e from public.empleados where id = c.empleado_id;
  update public.cartas set
    estado = case when p_aprobar then 'aprobada' else 'rechazada' end,
    observacion = p_observacion,
    aprobada_por = auth.uid(),
    fecha_respuesta = now(),
    contenido = case when p_aprobar then jsonb_build_object(
      'nombre', e.nombres || ' ' || e.apellidos, 'tipo_doc', e.tipo_doc, 'documento', e.documento,
      'expedida_en', e.expedida_en, 'genero', e.genero, 'cargo', e.cargo, 'area', e.area, 'tipo_contrato', e.tipo_contrato,
      'fecha_ingreso', e.fecha_ingreso, 'fecha_retiro', e.fecha_retiro, 'salario', e.salario,
      'funciones', e.funciones, 'estado', e.estado) else null end
  where id = p_id returning * into c;
  return c;
end $$;

-- Verificación pública de autenticidad (página verificar.html). Solo devuelve datos mínimos.
create or replace function public.verificar_carta(p_codigo text)
returns table (codigo text, nombre text, cargo text, tipo text, fecha date, vigente boolean)
language sql stable security definer set search_path = public as $$
  select c.codigo, c.contenido->>'nombre', c.contenido->>'cargo', c.tipo,
         (c.fecha_respuesta at time zone 'America/Bogota')::date, true
  from public.cartas c
  where c.codigo = upper(trim(p_codigo)) and c.estado = 'aprobada'
$$;

-- ---------- Seguridad por filas (RLS) ----------
alter table public.perfiles      enable row level security;
alter table public.empleados     enable row level security;
alter table public.cartas        enable row level security;
alter table public.contactos     enable row level security;
alter table public.interacciones enable row level security;
alter table public.bitacora      enable row level security;

do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies where schemaname='public'
           and tablename in ('perfiles','empleados','cartas','contactos','interacciones','bitacora') loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- perfiles: cada quien ve el suyo; el admin ve y edita todos
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = auth.uid() or public.mi_rol() in ('admin','talento_humano') or public.tiene_erp());
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = auth.uid() or public.mi_rol() = 'admin') with check (id = auth.uid() or public.mi_rol() = 'admin');
create policy perfiles_borrar on public.perfiles for delete to authenticated
  using (public.mi_rol() = 'admin' and id <> auth.uid());

-- empleados: Talento Humano y admin todo; el trabajador solo su hoja de vida
create policy empleados_ver on public.empleados for select to authenticated
  using (public.mi_rol() in ('admin','talento_humano') or id = public.mi_empleado());
create policy empleados_crear on public.empleados for insert to authenticated
  with check (public.mi_rol() in ('admin','talento_humano'));
create policy empleados_editar on public.empleados for update to authenticated
  using (public.mi_rol() in ('admin','talento_humano')) with check (public.mi_rol() in ('admin','talento_humano'));
create policy empleados_borrar on public.empleados for delete to authenticated
  using (public.mi_rol() = 'admin');

-- cartas: el trabajador ve y pide las suyas; TH y admin todas
create policy cartas_ver on public.cartas for select to authenticated
  using (public.mi_rol() in ('admin','talento_humano') or (public.mi_rol() is not null and empleado_id = public.mi_empleado()));
create policy cartas_pedir on public.cartas for insert to authenticated
  with check (
    estado = 'pendiente' and contenido is null and aprobada_por is null and fecha_respuesta is null
    and solicitante = auth.uid()
    and (empleado_id = public.mi_empleado() or public.mi_rol() in ('admin','talento_humano')));
create policy cartas_borrar on public.cartas for delete to authenticated
  using (public.mi_rol() = 'admin' or (solicitante = auth.uid() and estado = 'pendiente'));
-- (aprobar/rechazar solo con la función responder_carta)

-- CRM: coordinación y admin editan; comunicaciones consulta
create policy contactos_ver on public.contactos for select to authenticated
  using (public.mi_rol() in ('admin','coordinacion','comunicaciones'));
create policy contactos_crear on public.contactos for insert to authenticated
  with check (public.mi_rol() in ('admin','coordinacion'));
create policy contactos_editar on public.contactos for update to authenticated
  using (public.mi_rol() in ('admin','coordinacion')) with check (public.mi_rol() in ('admin','coordinacion'));
create policy contactos_borrar on public.contactos for delete to authenticated
  using (public.mi_rol() = 'admin');

create policy interacciones_ver on public.interacciones for select to authenticated
  using (public.mi_rol() in ('admin','coordinacion','comunicaciones'));
create policy interacciones_crear on public.interacciones for insert to authenticated
  with check (public.mi_rol() in ('admin','coordinacion'));
create policy interacciones_editar on public.interacciones for update to authenticated
  using (public.mi_rol() = 'admin' or (public.mi_rol() = 'coordinacion' and autor = auth.uid()));
create policy interacciones_borrar on public.interacciones for delete to authenticated
  using (public.mi_rol() = 'admin' or (public.mi_rol() = 'coordinacion' and autor = auth.uid()));

-- bitácora: solo el admin la consulta; nadie la modifica
create policy bitacora_ver on public.bitacora for select to authenticated using (public.mi_rol() = 'admin');

-- ---------- Permisos ----------
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on public.perfiles, public.empleados, public.cartas,
  public.contactos, public.interacciones to authenticated;
grant select on public.bitacora to authenticated;
revoke all on function public.responder_carta(uuid, boolean, text) from public, anon;
grant execute on function public.responder_carta(uuid, boolean, text) to authenticated;
grant execute on function public.verificar_carta(text) to anon, authenticated;
grant execute on function public.mi_rol(), public.mi_empleado(), public.tiene_erp() to authenticated;

-- =====================================================================
--  PRIMER ADMINISTRADOR
--  1. Regístrese en  https://adelcatatumbo.org/intranet/  (botón "Crear cuenta").
--  2. Ejecute esta línea cambiando el correo por el suyo:
--
--  update public.perfiles set rol = 'admin', activo = true where correo = 'catatumbosistemasadel@gmail.com';
--
--  Desde ahí, el administrador activa y asigna perfiles a los demás en
--  la intranet → Usuarios y perfiles.
-- =====================================================================
