/* =========================================================
   INTRANET ADEL · Capa de datos
   Misma API en dos modos:
     · Supabase: usuarios, base de datos y permisos reales
     · Si config.js no tiene la conexión, la intranet muestra
       "en configuración" y no guarda nada.
   ========================================================= */
(function () {
  const CFG = window.INTRANET || {};
  const REAL = !!(CFG.supabaseUrl && CFG.supabaseKey && window.supabase);
  const ROLES = {
    admin: "Administrador",
    talento_humano: "Talento Humano",
    coordinacion: "Coordinación de proyectos",
    comunicaciones: "Comunicaciones",
    trabajador: "Trabajador"
  };
  const TABLAS = ["perfiles", "empleados", "cartas", "contactos", "interacciones", "bitacora",
    "proyectos", "tareas", "tarea_comentarios", "gastos", "indicadores"];
  const ORDEN = {
    empleados: ["apellidos", true], cartas: ["fecha_solicitud", false], contactos: ["nombre", true],
    interacciones: ["fecha", false], perfiles: ["nombre", true], bitacora: ["fecha", false],
    proyectos: ["nombre", true], tareas: ["orden", true], tarea_comentarios: ["creado", true],
    gastos: ["fecha", false], indicadores: ["nombre", true]
  };
  const SOLO_LECTURA = ["creado", "actualizado"];
  const SOLO_LECTURA_TABLA = { cartas: ["codigo", "contenido", "aprobada_por", "fecha_respuesta"] };

  /* ---------- Traducción de errores ---------- */
  function error(msg) {
    const m = String(msg && msg.message || msg || "");
    const t = [
      [/Invalid login credentials/i, "Correo o contraseña incorrectos."],
      [/Email not confirmed/i, "Debe confirmar su correo: revise su bandeja de entrada (y la carpeta de spam)."],
      [/User already registered/i, "Ya existe una cuenta con ese correo."],
      [/Password should be at least/i, "La contraseña debe tener al menos 8 caracteres."],
      [/row-level security|permission denied/i, "Su perfil no tiene permiso para esta acción."],
      [/duplicate key.*documento/i, "Ya existe un trabajador con ese número de documento."],
      [/duplicate key/i, "Ese registro ya existe."],
      [/rate limit/i, "Demasiados intentos. Espere unos minutos e intente de nuevo."],
      [/Could not find the (table|function)/i, "Falta actualizar la base de datos: el administrador debe ejecutar en Supabase (SQL Editor) el archivo intranet/supabase/02-erp-proyectos.sql."],
      [/Failed to fetch|NetworkError/i, "No hay conexión con el servidor. Revise su internet."]
    ];
    for (const [re, es] of t) if (re.test(m)) return new Error(es);
    return new Error(m || "Ocurrió un error inesperado.");
  }
  const limpiar = (obj, tabla) => { const o = { ...obj }; [...SOLO_LECTURA, ...(SOLO_LECTURA_TABLA[tabla] || [])].forEach(k => delete o[k]); return o; };

  /* =========================================================
     MODO REAL · Supabase
     ========================================================= */
  function moduloReal() {
    const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "adel-intranet" }
    });
    const uid = async () => (await sb.auth.getUser()).data.user?.id;
    const r = ({ data, error: e }) => { if (e) throw error(e); return data; };

    return {
      modo: "real", cliente: sb,
      async iniciar(correo, clave) {
        r(await sb.auth.signInWithPassword({ email: correo.trim(), password: clave }));
        const p = await this.perfil();
        if (!p) throw new Error("No se encontró su perfil. Contacte al administrador.");
        if (!p.activo || !p.rol) { await sb.auth.signOut(); throw new Error("Su cuenta está pendiente de aprobación. El administrador debe activarla y asignarle un perfil."); }
        return p;
      },
      async registrar(nombre, correo, clave) {
        const d = r(await sb.auth.signUp({ email: correo.trim(), password: clave,
          options: { data: { nombre: nombre.trim() }, emailRedirectTo: location.origin + location.pathname } }));
        await sb.auth.signOut();
        return d;
      },
      async recuperar(correo) {
        r(await sb.auth.resetPasswordForEmail(correo.trim(), { redirectTo: location.origin + location.pathname + "?nueva=1" }));
      },
      async cambiarClave(nueva) { r(await sb.auth.updateUser({ password: nueva })); },
      enRecuperacion(cb) { sb.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") cb(); }); },
      async salir() { await sb.auth.signOut(); },
      async perfil() {
        const id = await uid(); if (!id) return null;
        const { data } = await sb.from("perfiles").select("*").eq("id", id).maybeSingle();
        return data && data.activo && data.rol ? data : (data ? { ...data, pendiente: true } : null);
      },
      async listar(tabla, filtro) {
        const [c, asc] = ORDEN[tabla] || ["creado", false];
        let q = sb.from(tabla).select("*").order(c, { ascending: asc });
        if (filtro) for (const [k, v] of Object.entries(filtro)) q = q.eq(k, v);
        if (tabla === "bitacora") q = q.limit(300);
        return r(await q);
      },
      async obtener(tabla, id) { return r(await sb.from(tabla).select("*").eq("id", id).maybeSingle()); },
      async guardar(tabla, obj) {
        const o = limpiar(obj, tabla);
        if (o.id) { const id = o.id; delete o.id; return r(await sb.from(tabla).update(o).eq("id", id).select().single()); }
        delete o.id;
        if (tabla === "cartas") o.solicitante = await uid();
        if (tabla === "interacciones") o.autor = await uid();
        if (tabla === "contactos" && !o.responsable) o.responsable = await uid();
        return r(await sb.from(tabla).insert(o).select().single());
      },
      async eliminar(tabla, id) { r(await sb.from(tabla).delete().eq("id", id)); },
      async responderCarta(id, aprobar, obs) {
        return r(await sb.rpc("responder_carta", { p_id: id, p_aprobar: aprobar, p_observacion: obs || null }));
      },
      async actualizarMiTarea(id, cambios) {
        return r(await sb.rpc("actualizar_mi_tarea", { p_id: id, p_estado: cambios.estado ?? null,
          p_avance: cambios.avance ?? null, p_checklist: cambios.checklist ?? null }));
      },
      async verificarCarta(codigo) {
        const d = r(await sb.rpc("verificar_carta", { p_codigo: codigo }));
        return d && d[0] || null;
      },
    };
  }

  /* =========================================================
     SIN CONEXIÓN · la base de datos aún no está configurada
     ========================================================= */
  function moduloSinConexion() {
    const motivo = !(CFG.supabaseUrl && CFG.supabaseKey)
      ? "Falta conectar la base de datos (Supabase). Esto no es un error: el ingreso se habilita cuando el administrador termine la configuración."
      : "No se pudo cargar el servicio de la intranet. Revise su conexión a internet y recargue la página.";
    const no = async () => { throw new Error(motivo); };
    return { modo: "sin-conexion", motivo, iniciar: no, registrar: no, recuperar: no, cambiarClave: no, enRecuperacion() {},
      async salir() {}, async perfil() { return null; }, listar: no, obtener: no, guardar: no, eliminar: no,
      responderCarta: no, verificarCarta: no, actualizarMiTarea: no };
  }

  window.Datos = Object.assign(REAL ? moduloReal() : moduloSinConexion(), { ROLES, TABLAS });
})();
