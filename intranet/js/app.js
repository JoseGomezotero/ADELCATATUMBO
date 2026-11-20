/* =========================================================
   INTRANET ADEL CATATUMBO · Aplicación
   Módulos: Escritorio, Mis cartas, Mi hoja de vida, Gestión de cartas,
   Talento humano, CRM de aliados, Página web, Usuarios, Bitácora, Mi cuenta
   ========================================================= */
(async function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fecha = d => d ? new Date(String(d).length === 10 ? d + "T12:00:00" : d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fechaHora = d => d ? new Date(d).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
  const pesos = n => n == null || n === "" ? "—" : "$" + Number(n).toLocaleString("es-CO");
  const iniciales = n => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();
  const hoyISO = () => new Date().toISOString().slice(0, 10);
  const ROLES = Datos.ROLES;

  /* ---------- Íconos ---------- */
  const I = {
    inicio: '<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    carta: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    sello: '<path d="M9 12l2 2 4-4"/><path d="M12 3l2.4 1.8 3-.2.9 2.9 2.5 1.7-.9 2.8.9 2.8-2.5 1.7-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9-2.5-1.7.9-2.8-.9-2.8 2.5-1.7.9-2.9 3 .2z"/>',
    equipo: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.5 1.5-4.5 4-4.5s3 1.5 3 4.5"/>',
    aliados: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    web: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    usuarios: '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    bitacora: '<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>',
    mas: '<path d="M12 5v14M5 12h14"/>', buscar: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    cerrar: '<path d="M18 6 6 18M6 6l12 12"/>', editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    borrar: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    descargar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>', ok: '<path d="M20 6 9 17l-5-5"/>',
    calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', megafono: '<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1zM16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/>',
    externo: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>', grafica: '<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>',
    check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    carpeta: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    tablero: '<rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="4" height="8" rx="1"/>',
    lista: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    gantt: '<path d="M3 3v18h18"/><rect x="7" y="6" width="8" height="3" rx="1"/><rect x="10" y="12" width="9" height="3" rx="1"/>',
    dinero: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
    meta: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    comentario: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    llave: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2"/>'
  };
  const ic = (n, cl = "i") => `<svg class="${cl}" viewBox="0 0 24 24">${I[n] || ""}</svg>`;

  /* ---------- Sesión ---------- */
  let YO;
  try { YO = await Datos.perfil(); } catch (e) { YO = null; }
  if (!YO || YO.pendiente) { location.replace("index.html"); return; }
  const es = (...r) => r.includes(YO.rol);
  const ERP_ACTIVO = ((window.INTRANET || {}).modulos || {}).erp === true;   /* módulo encendido en config.js */
  const ERP = ERP_ACTIVO && (es("admin", "coordinacion") || !!YO.erp);       /* acceso al módulo de proyectos */

  /* ---------- Módulos y permisos ---------- */
  const MODULOS = [
    { grupo: "Mi espacio" },
    { id: "inicio", titulo: "Escritorio", icono: "inicio", roles: Object.keys(ROLES) },
    { id: "mis-cartas", titulo: "Mis cartas laborales", icono: "carta", roles: Object.keys(ROLES) },
    { id: "mi-hoja", titulo: "Mi hoja de vida", icono: "persona", roles: Object.keys(ROLES) },
    { id: "mis-tareas", titulo: "Mis tareas", icono: "check", roles: Object.keys(ROLES), contadorTareas: true, moduloErp: true },
    { grupo: "Proyectos · ERP" },
    { id: "proyectos", titulo: "Portafolio de proyectos", icono: "carpeta", erp: true, roles: [], moduloErp: true },
    { grupo: "Talento humano" },
    { id: "cartas", titulo: "Gestión de cartas", icono: "sello", roles: ["admin", "talento_humano"], contador: true },
    { id: "empleados", titulo: "Trabajadores", icono: "equipo", roles: ["admin", "talento_humano"] },
    { grupo: "Relacionamiento" },
    { id: "crm", titulo: "CRM de aliados", icono: "aliados", roles: ["admin", "coordinacion", "comunicaciones"] },
    { grupo: "Comunicaciones" },
    { id: "pagina", titulo: "Página web", icono: "web", roles: ["admin", "comunicaciones"] },
    { grupo: "Administración" },
    { id: "usuarios", titulo: "Usuarios y perfiles", icono: "usuarios", roles: ["admin"] },
    { id: "bitacora", titulo: "Bitácora", icono: "bitacora", roles: ["admin"] }
  ];
  const ve = m => (m.moduloErp && !ERP_ACTIVO) ? false : m.erp ? ERP : m.roles.includes(YO.rol);
  const disponibles = MODULOS.filter(m => m.id && ve(m));
  const puedeVer = id => disponibles.some(m => m.id === id) || id === "cuenta";

  let tareasAbiertas = 0;
  function pintarMenu(pendientes = 0) {
    const html = [];
    MODULOS.forEach((m, i) => {
      if (m.grupo) { const sig = MODULOS.slice(i + 1); const hay = sig.findIndex(x => x.grupo); const del = (hay < 0 ? sig : sig.slice(0, hay)).some(ve); if (del) html.push(`<div class="grupo">${m.grupo}</div>`); return; }
      if (!ve(m)) return;
      const n = m.contador ? pendientes : m.contadorTareas ? tareasAbiertas : 0;
      html.push(`<a href="#/${m.id}" data-m="${m.id}">${ic(m.icono)}${m.titulo}${n ? `<span class="cuenta">${n}</span>` : ""}</a>`);
    });
    $("#menu").innerHTML = html.join("");
    marcarMenu();
  }
  const marcarMenu = () => { const r = ruta()[0]; $$("#menu a").forEach(a => a.classList.toggle("activo", a.dataset.m === r)); };
  async function refrescarContador() {
    if (ERP_ACTIVO) { try { tareasAbiertas = (await Datos.listar("tareas", { responsable: YO.id })).filter(t => t.estado !== "hecha").length; } catch (e) { tareasAbiertas = 0; } }
    if (!es("admin", "talento_humano")) return pintarMenu();
    try { const c = await Datos.listar("cartas", { estado: "pendiente" }); pintarMenu(c.length); } catch (e) { pintarMenu(); }
  }

  /* ---------- Utilidades de interfaz ---------- */
  function notif(t, err) { const n = document.createElement("div"); n.className = "notif" + (err ? " err" : ""); n.textContent = t; $("#notifs").append(n); setTimeout(() => n.remove(), err ? 6000 : 3200); }
  const fallo = e => notif(e.message || String(e), true);
  function abrirCajon(titulo, cuerpo, pie = "") {
    $("#cajon").innerHTML = `<div class="cc"><h3>${titulo}</h3><button class="bt bt-sec bt-icono" data-cerrar aria-label="Cerrar">${ic("cerrar")}</button></div><div class="cb">${cuerpo}</div>${pie ? `<div class="cp">${pie}</div>` : ""}`;
    $("#cajon").classList.add("abierto"); $("#velo").classList.add("abierto"); $("#cajon").setAttribute("aria-hidden", "false");
    $$("[data-cerrar]", $("#cajon")).forEach(b => b.onclick = cerrarCajon);
    setTimeout(() => { const f = $("#cajon input:not([type=hidden]), #cajon select, #cajon textarea"); f && f.focus(); }, 260);
    return $("#cajon");
  }
  function cerrarCajon() { $("#cajon").classList.remove("abierto"); $("#velo").classList.remove("abierto"); $("#cajon").setAttribute("aria-hidden", "true"); }
  $("#velo").onclick = cerrarCajon;
  document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarCajon(); });
  function leerForm(f) {
    const o = {};
    $$("[name]", f).forEach(el => {
      if (el.type === "checkbox") o[el.name] = el.checked;
      else if (el.type === "number") o[el.name] = el.value === "" ? null : Number(el.value);
      else o[el.name] = el.value.trim() === "" ? null : el.value.trim();
    });
    return o;
  }
  async function conBoton(b, fn) { const t = b.innerHTML; b.disabled = true; b.innerHTML = "Guardando…"; try { await fn(); } catch (e) { fallo(e); } finally { b.disabled = false; b.innerHTML = t; } }
  const opciones = (lista, sel) => lista.map(o => { const [v, t] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(sel ?? "") === String(v) ? "selected" : ""}>${esc(t)}</option>`; }).join("");
  const campo = (lbl, html, ayuda = "") => `<div class="campo"><label>${lbl}</label>${html}${ayuda ? `<span class="ayuda">${ayuda}</span>` : ""}</div>`;
  const inp = (name, v, attrs = "") => `<input name="${name}" value="${esc(v ?? "")}" ${attrs}>`;
  const vacio = (t, icono = "carta") => `<div class="vacio">${ic(icono)}<p>${t}</p></div>`;
  function descargarCSV(nombre, filas, cols) {
    const csv = [cols.map(c => c[1]).join(";"), ...filas.map(f => cols.map(c => `"${String(f[c[0]] ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`).join(";"))].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })); a.download = nombre; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- Catálogos ---------- */
  const TIPO_CARTA = { basica: "Laboral básica", salario: "Laboral con salario", funciones: "Laboral con funciones", retiro: "De retiro (ya no labora)" };
  const EST_CARTA = { pendiente: ["pend", "Pendiente"], aprobada: ["ok", "Aprobada"], rechazada: ["mal", "Rechazada"] };
  const chipCarta = e => `<span class="chip ${EST_CARTA[e][0]}">${EST_CARTA[e][1]}</span>`;
  const CONTRATOS = ["Término indefinido", "Término fijo", "Obra o labor", "Prestación de servicios", "Aprendizaje"];
  const TIPO_CONT = { cooperante: "Cooperante", entidad_publica: "Entidad pública", alcaldia: "Alcaldía", proveedor: "Proveedor", asociacion: "Asociación / organización", beneficiario: "Beneficiario", aliado: "Aliado", empresa: "Empresa privada", otro: "Otro" };
  const EST_CONT = { prospecto: ["info", "Prospecto"], activo: ["ok", "Activo"], inactivo: ["gris", "Inactivo"] };
  const TIPO_INT = { reunion: "Reunión", llamada: "Llamada", correo: "Correo", visita: "Visita", convenio: "Convenio / acuerdo", otro: "Otro" };
  const MUNICIPIOS = ["Ocaña", "Ábrego", "La Playa", "Hacarí", "San Calixto", "Teorama", "El Tarra", "Tibú", "Sardinata", "Convención", "El Carmen", "Cúcuta", "Otro"];

  /* =========================================================
     ESCRITORIO
     ========================================================= */
  async function vInicio() {
    const hora = new Date().getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
    const tareas = [];
    const kpis = [];
    const [mias, todas, emps, conts, ints] = await Promise.all([
      YO.empleado_id ? Datos.listar("cartas", { empleado_id: YO.empleado_id }) : [],
      es("admin", "talento_humano") ? Datos.listar("cartas") : [],
      es("admin", "talento_humano") ? Datos.listar("empleados") : [],
      es("admin", "coordinacion", "comunicaciones") ? Datos.listar("contactos") : [],
      es("admin", "coordinacion", "comunicaciones") ? Datos.listar("interacciones") : []
    ]);
    if (es("admin", "talento_humano")) {
      const pend = todas.filter(c => c.estado === "pendiente").length;
      kpis.push(`<a class="kpi" href="#/cartas"><div class="ic a">${ic("sello")}</div><div><b>${pend}</b><span>Cartas por aprobar</span></div></a>`);
      kpis.push(`<a class="kpi" href="#/empleados"><div class="ic">${ic("equipo")}</div><div><b>${emps.filter(e => e.estado === "activo").length}</b><span>Trabajadores activos</span></div></a>`);
      if (pend) tareas.push(`<li><div class="fecha">${ic("sello")}</div><div class="txt"><b>${pend} carta${pend > 1 ? "s" : ""} laboral${pend > 1 ? "es" : ""} pendiente${pend > 1 ? "s" : ""} de aprobación</b><span><a href="#/cartas">Revisar ahora →</a></span></div></li>`);
    }
    if (es("admin", "coordinacion", "comunicaciones")) {
      kpis.push(`<a class="kpi" href="#/crm"><div class="ic v">${ic("aliados")}</div><div><b>${conts.filter(c => c.estado === "activo").length}</b><span>Aliados activos</span></div></a>`);
      const prox = ints.filter(i => i.fecha_proximo && i.fecha_proximo >= hoyISO()).sort((a, b) => a.fecha_proximo.localeCompare(b.fecha_proximo));
      kpis.push(`<a class="kpi" href="#/crm"><div class="ic z">${ic("calendario")}</div><div><b>${prox.length}</b><span>Seguimientos programados</span></div></a>`);
      prox.slice(0, 4).forEach(i => { const c = conts.find(x => x.id === i.contacto_id); const d = new Date(i.fecha_proximo + "T12:00:00");
        tareas.push(`<li><div class="fecha"><b>${d.getDate()}</b>${d.toLocaleDateString("es-CO", { month: "short" })}</div><div class="txt"><b>${esc(i.proximo_paso || "Seguimiento")}</b><span>${c ? `<a href="#/crm/${c.id}">${esc(c.nombre)}</a>` : ""}</span></div></li>`); });
    }
    if (es("admin", "comunicaciones")) {
      const abiertas = (window.CONVOCATORIAS || []).filter(c => c.estado === "abierta").length;
      kpis.push(`<a class="kpi" href="#/pagina"><div class="ic">${ic("megafono")}</div><div><b>${abiertas}</b><span>Convocatorias abiertas en la web</span></div></a>`);
    }
    if (ERP_ACTIVO) try {
      const mt = (await Datos.listar("tareas", { responsable: YO.id })).filter(t => t.estado !== "hecha");
      if (mt.length) kpis.unshift(`<a class="kpi" href="#/mis-tareas"><div class="ic z">${ic("check")}</div><div><b>${mt.length}</b><span>Mis tareas abiertas${mt.filter(t => t.fecha_limite && t.fecha_limite < hoyISO()).length ? ` · ${mt.filter(t => t.fecha_limite && t.fecha_limite < hoyISO()).length} vencidas` : ""}</span></div></a>`);
      mt.filter(t => t.fecha_limite).sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite)).slice(0, 3).forEach(t => { const d = new Date(t.fecha_limite + "T12:00:00");
        tareas.unshift(`<li><div class="fecha"><b>${d.getDate()}</b>${d.toLocaleDateString("es-CO", { month: "short" })}</div><div class="txt"><b>${esc(t.titulo)}</b><span><a href="#/mis-tareas">${t.fecha_limite < hoyISO() ? "Vencida · " : ""}Ver mis tareas →</a></span></div></li>`); });
    } catch (e) {}
    if (YO.empleado_id) {
      const ult = mias[0];
      kpis.push(`<a class="kpi" href="#/mis-cartas"><div class="ic">${ic("carta")}</div><div><b>${mias.length}</b><span>Mis cartas solicitadas</span></div></a>`);
      if (ult && ult.estado === "aprobada") tareas.push(`<li><div class="fecha">${ic("ok")}</div><div class="txt"><b>Su carta ${esc(TIPO_CARTA[ult.tipo].toLowerCase())} está lista</b><span><a href="carta.html?id=${ult.id}" target="_blank">Descargar PDF →</a></span></div></li>`);
    }
    const accesos = [
      ["proyectos", "carpeta", "Portafolio de proyectos", "Avance físico, financiero y tareas"],
      ["mis-tareas", "check", "Mis tareas", "Lo que tiene asignado en los proyectos"],
      ["mis-cartas", "carta", "Solicitar carta laboral", "Pida su certificación en un minuto"],
      ["cartas", "sello", "Aprobar cartas", "Revise y firme las solicitudes"],
      ["empleados", "equipo", "Trabajadores", "Hojas de vida y contratos"],
      ["crm", "aliados", "CRM de aliados", "Cooperantes, alcaldías y proveedores"],
      ["pagina", "web", "Página web", "Convocatorias, noticias y textos"],
      ["usuarios", "usuarios", "Usuarios y perfiles", "Active cuentas y asigne permisos"]
    ].filter(a => puedeVer(a[0]));
    $("#vista").innerHTML = `
      <div class="cab"><div><h1>${saludo}, ${esc(YO.nombre.split(" ")[0] || "")}</h1><p>Perfil: <b>${ROLES[YO.rol]}</b> · ${new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div></div>
      <div class="kpis">${kpis.slice(0, 4).join("")}</div>
      <div class="dos-col">
        <div class="panel"><div class="panel-cab"><h3>Accesos rápidos</h3></div><div class="panel-cuerpo"><div class="accesos">${accesos.map(a => `<a class="acceso" href="#/${a[0]}"><div class="ic">${ic(a[1])}</div><b>${a[2]}</b><span>${a[3]}</span></a>`).join("")}</div></div></div>
        <div class="panel"><div class="panel-cab"><h3>Pendientes y próximos</h3></div><div class="panel-cuerpo">${tareas.length ? `<ul class="lista-simple">${tareas.join("")}</ul>` : vacio("No tiene pendientes. ¡Todo al día!", "ok")}</div></div>
      </div>
      ${!YO.empleado_id ? `<div class="msg msg-info">Su usuario aún no está vinculado a una hoja de vida de trabajador. Pida a Talento Humano o al administrador que lo vincule para poder solicitar cartas laborales.</div>` : ""}`;
  }

  /* =========================================================
     MIS CARTAS (todos)
     ========================================================= */
  async function vMisCartas() {
    if (!YO.empleado_id) { $("#vista").innerHTML = `<div class="cab"><div><h1>Mis cartas laborales</h1></div></div><div class="msg msg-info">Su usuario no está vinculado a una hoja de vida. Pida a Talento Humano que lo vincule en <b>Usuarios y perfiles</b>.</div>`; return; }
    const [cartas, emp] = await Promise.all([Datos.listar("cartas", { empleado_id: YO.empleado_id }), Datos.obtener("empleados", YO.empleado_id)]);
    $("#vista").innerHTML = `
      <div class="cab"><div><h1>Mis cartas laborales</h1><p>Solicite su certificación. Talento Humano la revisa y, al aprobarla, puede descargarla en PDF con código de verificación.</p></div>
        <div class="acciones"><button class="bt bt-pri" id="nueva">${ic("mas")}Solicitar carta</button></div></div>
      <div class="panel"><div class="tabla-env">${cartas.length ? `<table class="tabla"><thead><tr><th>Tipo</th><th>Dirigida a</th><th>Solicitada</th><th>Estado</th><th></th></tr></thead><tbody>
        ${cartas.map(c => `<tr><td><b>${TIPO_CARTA[c.tipo]}</b><span class="sec">${esc(c.motivo || "")}</span></td><td>${esc(c.dirigida_a)}</td><td>${fecha(c.fecha_solicitud)}</td>
          <td>${chipCarta(c.estado)}${c.estado === "rechazada" && c.observacion ? `<span class="sec">${esc(c.observacion)}</span>` : ""}</td>
          <td class="acc">${c.estado === "aprobada" ? `<a class="bt bt-ok bt-sm" href="carta.html?id=${c.id}" target="_blank">${ic("descargar")}Descargar</a>` : ""}
          ${c.estado === "pendiente" ? `<button class="bt bt-peligro bt-sm" data-cancelar="${c.id}">Cancelar</button>` : ""}</td></tr>`).join("")}</tbody></table>`
        : vacio("Aún no ha solicitado cartas laborales.")}</div></div>`;
    $("#nueva").onclick = () => formCarta(emp ? [emp] : [], emp);
    $$("[data-cancelar]").forEach(b => b.onclick = async () => { if (!confirm("¿Cancelar esta solicitud?")) return; try { await Datos.eliminar("cartas", b.dataset.cancelar); notif("Solicitud cancelada"); render(); } catch (e) { fallo(e); } });
  }
  function formCarta(empleados, fijo) {
    const c = abrirCajon("Solicitar carta laboral", `<form id="fc">
      ${fijo ? `<input type="hidden" name="empleado_id" value="${fijo.id}"><div class="msg msg-info">Carta para <b>${esc(fijo.nombres + " " + fijo.apellidos)}</b> · ${esc(fijo.cargo)}</div>`
        : campo("Trabajador", `<select name="empleado_id" required><option value="">Seleccione…</option>${opciones(empleados.map(e => [e.id, e.apellidos + " " + e.nombres + " · " + e.cargo]))}</select>`)}
      ${campo("Tipo de carta", `<select name="tipo" required>${opciones(Object.entries(TIPO_CARTA), fijo && fijo.estado === "retirado" ? "retiro" : "basica")}</select>`, "La carta con salario incluye el valor mensual; la de funciones, la lista de funciones del cargo.")}
      ${campo("Dirigida a", inp("dirigida_a", "A quien interese", "required maxlength=120"), "Ej.: A quien interese · Banco Agrario de Colombia · Embajada de…")}
      ${campo("Motivo (opcional)", `<textarea name="motivo" maxlength="300" placeholder="Ej.: Trámite de crédito"></textarea>`)}
    </form>`, `<button class="bt bt-sec" data-cerrar>Cancelar</button><button class="bt bt-pri" id="enviar">Enviar solicitud</button>`);
    $("#enviar", c).onclick = e => { const f = $("#fc", c); if (!f.reportValidity()) return;
      conBoton(e.currentTarget, async () => { await Datos.guardar("cartas", leerForm(f)); cerrarCajon(); notif("Solicitud enviada a Talento Humano"); refrescarContador(); render(); }); };
  }

  /* =========================================================
     MI HOJA DE VIDA
     ========================================================= */
  async function vMiHoja() {
    const e = YO.empleado_id ? await Datos.obtener("empleados", YO.empleado_id) : null;
    $("#vista").innerHTML = `<div class="cab"><div><h1>Mi hoja de vida</h1><p>Información registrada por Talento Humano. Si algo está desactualizado, solicite la corrección.</p></div>
      ${e ? `<div class="acciones"><a class="bt bt-sec" href="mailto:${esc((window.SITIO_CMS || {}).correo || "")}?subject=${encodeURIComponent("Actualización de hoja de vida – " + e.nombres + " " + e.apellidos)}">${ic("editar")}Solicitar corrección</a></div>` : ""}</div>
      ${e ? fichaEmpleado(e) : `<div class="msg msg-info">Su usuario no está vinculado a una hoja de vida de trabajador.</div>`}`;
  }
  function fichaEmpleado(e) {
    const d = [["Documento", `${e.tipo_doc} ${e.documento}${e.expedida_en ? " de " + e.expedida_en : ""}`], ["Cargo", e.cargo], ["Área", e.area], ["Tipo de contrato", e.tipo_contrato],
      ["Fecha de ingreso", fecha(e.fecha_ingreso)], ["Fecha de retiro", e.fecha_retiro ? fecha(e.fecha_retiro) : "—"], ["Salario / honorarios", pesos(e.salario)], ["Estado", e.estado === "activo" ? "Activo" : "Retirado"],
      ["Correo", e.correo], ["Teléfono", e.telefono], ["Dirección", [e.direccion, e.municipio].filter(Boolean).join(", ")], ["EPS", e.eps], ["Fondo de pensiones", e.pension]];
    return `<div class="panel"><div class="panel-cab"><div class="usuario" style="cursor:default;border:none;padding:0"><div class="av" style="width:46px;height:46px;font-size:1rem">${iniciales(e.nombres + " " + e.apellidos)}</div></div><div><h3>${esc(e.nombres + " " + e.apellidos)}</h3><span style="color:var(--gris);font-size:.85rem">${esc(e.cargo)}</span></div></div>
      <div class="panel-cuerpo"><dl class="ficha">${d.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v || "—")}</dd></div>`).join("")}</dl>
      ${e.funciones ? `<div class="form-titulo" style="margin-top:22px">Funciones</div><p style="white-space:pre-line">${esc(e.funciones)}</p>` : ""}</div></div>`;
  }

  /* =========================================================
     GESTIÓN DE CARTAS (Talento Humano)
     ========================================================= */
  let tabCartas = "pendiente";
  async function vCartas() {
    const [cartas, emps] = await Promise.all([Datos.listar("cartas"), Datos.listar("empleados")]);
    const nom = id => { const e = emps.find(x => x.id === id); return e ? e.nombres + " " + e.apellidos : "—"; };
    const cuenta = s => cartas.filter(c => c.estado === s).length;
    const filas = cartas.filter(c => c.estado === tabCartas);
    $("#vista").innerHTML = `
      <div class="cab"><div><h1>Gestión de cartas laborales</h1><p>Apruebe o rechace las solicitudes. Al aprobar, la carta toma los datos actuales de la hoja de vida y recibe un código de verificación.</p></div>
        <div class="acciones"><button class="bt bt-pri" id="nueva">${ic("mas")}Expedir carta</button></div></div>
      <div class="panel"><div class="tabs">${Object.keys(EST_CARTA).map(s => `<button data-t="${s}" class="${s === tabCartas ? "activa" : ""}">${EST_CARTA[s][1]}s<span class="n">${cuenta(s)}</span></button>`).join("")}</div>
      <div class="tabla-env">${filas.length ? `<table class="tabla"><thead><tr><th>Trabajador</th><th>Tipo</th><th>Dirigida a</th><th>Solicitada</th><th>${tabCartas === "pendiente" ? "" : "Respuesta"}</th><th></th></tr></thead><tbody>
      ${filas.map(c => `<tr><td><b>${esc(nom(c.empleado_id))}</b><span class="sec">${esc(c.motivo || "")}</span></td><td>${TIPO_CARTA[c.tipo]}</td><td>${esc(c.dirigida_a)}</td><td>${fecha(c.fecha_solicitud)}</td>
        <td>${c.fecha_respuesta ? fecha(c.fecha_respuesta) : ""}${c.estado === "aprobada" ? `<span class="sec">${esc(c.codigo)}</span>` : c.observacion ? `<span class="sec">${esc(c.observacion)}</span>` : ""}</td>
        <td class="acc">${c.estado === "pendiente" ? `<button class="bt bt-ok bt-sm" data-ap="${c.id}">${ic("ok")}Aprobar</button> <button class="bt bt-peligro bt-sm" data-re="${c.id}">Rechazar</button>`
          : c.estado === "aprobada" ? `<a class="bt bt-sec bt-sm" href="carta.html?id=${c.id}" target="_blank">${ic("ojo")}Ver PDF</a>` : ""}
          ${es("admin") ? ` <button class="bt bt-txt bt-sm" data-del="${c.id}" title="Eliminar">${ic("borrar")}</button>` : ""}</td></tr>`).join("")}
      </tbody></table>` : vacio(tabCartas === "pendiente" ? "No hay solicitudes pendientes." : "No hay cartas en este estado.")}</div></div>`;
    $$("[data-t]").forEach(b => b.onclick = () => { tabCartas = b.dataset.t; vCartas(); });
    $("#nueva").onclick = () => formCartaTH(emps);
    $$("[data-ap]").forEach(b => b.onclick = () => { const c = cartas.find(x => x.id === b.dataset.ap); const e = emps.find(x => x.id === c.empleado_id);
      if (c.tipo === "salario" && !e?.salario) return notif("La hoja de vida no tiene salario registrado. Complétela antes de aprobar.", true);
      if (c.tipo === "funciones" && !e?.funciones) return notif("La hoja de vida no tiene funciones registradas. Complétela antes de aprobar.", true);
      conBoton(b, async () => { await Datos.responderCarta(c.id, true); notif("Carta aprobada"); await refrescarContador(); vCartas(); }); });
    $$("[data-re]").forEach(b => b.onclick = () => { const motivo = prompt("Motivo del rechazo (lo verá el trabajador):"); if (motivo === null) return;
      conBoton(b, async () => { await Datos.responderCarta(b.dataset.re, false, motivo); notif("Solicitud rechazada"); await refrescarContador(); vCartas(); }); });
    $$("[data-del]").forEach(b => b.onclick = async () => { if (!confirm("¿Eliminar esta carta? El código de verificación dejará de ser válido.")) return; try { await Datos.eliminar("cartas", b.dataset.del); refrescarContador(); vCartas(); } catch (e) { fallo(e); } });
  }
  function formCartaTH(emps) {
    const c = abrirCajon("Expedir carta laboral", `<form id="fc">
      ${campo("Trabajador", `<select name="empleado_id" required><option value="">Seleccione…</option>${opciones(emps.map(e => [e.id, e.apellidos + " " + e.nombres + " · " + e.cargo + (e.estado === "retirado" ? " (retirado)" : "")]))}</select>`)}
      ${campo("Tipo de carta", `<select name="tipo" required>${opciones(Object.entries(TIPO_CARTA))}</select>`)}
      ${campo("Dirigida a", inp("dirigida_a", "A quien interese", "required maxlength=120"))}
      ${campo("Motivo (opcional)", `<textarea name="motivo" maxlength="300"></textarea>`)}
    </form>`, `<button class="bt bt-sec" data-cerrar>Cancelar</button><button class="bt bt-pri" id="enviar">Expedir y aprobar</button>`);
    $("#enviar", c).onclick = e => { const f = $("#fc", c); if (!f.reportValidity()) return; const d = leerForm(f); const emp = emps.find(x => x.id === d.empleado_id);
      if (d.tipo === "salario" && !emp.salario) return notif("La hoja de vida no tiene salario registrado.", true);
      if (d.tipo === "funciones" && !emp.funciones) return notif("La hoja de vida no tiene funciones registradas.", true);
      conBoton(e.currentTarget, async () => { const nueva = await Datos.guardar("cartas", d); await Datos.responderCarta(nueva.id, true); cerrarCajon(); notif("Carta expedida"); tabCartas = "aprobada"; vCartas(); window.open("carta.html?id=" + nueva.id, "_blank"); }); };
  }

  /* =========================================================
     TRABAJADORES (Talento Humano)
     ========================================================= */
  let filtroEmp = { q: "", estado: "activo" };
  async function vEmpleados() {
    const emps = await Datos.listar("empleados");
    const pinta = () => {
      const q = filtroEmp.q.toLowerCase();
      const f = emps.filter(e => (!filtroEmp.estado || e.estado === filtroEmp.estado) && (!q || [e.nombres, e.apellidos, e.documento, e.cargo, e.area].join(" ").toLowerCase().includes(q)));
      $("#tEmp").innerHTML = f.length ? `<table class="tabla"><thead><tr><th>Trabajador</th><th>Documento</th><th>Cargo / área</th><th>Contrato</th><th>Ingreso</th><th>Estado</th></tr></thead><tbody>
        ${f.map(e => `<tr class="clic" data-id="${e.id}"><td><b>${esc(e.apellidos + " " + e.nombres)}</b><span class="sec">${esc(e.correo || "")}</span></td><td class="nw">${esc(e.tipo_doc + " " + e.documento)}</td>
          <td>${esc(e.cargo)}<span class="sec">${esc(e.area || "")}</span></td><td>${esc(e.tipo_contrato)}</td><td class="nw">${fecha(e.fecha_ingreso)}</td>
          <td>${e.estado === "activo" ? '<span class="chip ok">Activo</span>' : '<span class="chip gris">Retirado</span>'}</td></tr>`).join("")}</tbody></table>` : vacio("No hay trabajadores con ese filtro.", "equipo");
      $$("#tEmp tr.clic").forEach(tr => tr.onclick = () => formEmpleado(emps.find(x => x.id === tr.dataset.id)));
    };
    $("#vista").innerHTML = `<div class="cab"><div><h1>Trabajadores</h1><p>Hojas de vida del personal. Estos datos se usan para generar las cartas laborales.</p></div>
      <div class="acciones"><button class="bt bt-sec" id="csv">${ic("descargar")}Exportar</button><button class="bt bt-pri" id="nuevo">${ic("mas")}Nuevo trabajador</button></div></div>
      <div class="panel"><div class="panel-cab"><div class="filtros"><div class="buscar">${ic("buscar")}<input id="q" placeholder="Buscar nombre, documento, cargo…" value="${esc(filtroEmp.q)}"></div>
        <select id="fe">${opciones([["", "Todos"], ["activo", "Activos"], ["retirado", "Retirados"]], filtroEmp.estado)}</select></div><div class="der"><span style="color:var(--gris);font-size:.85rem">${emps.length} registrados</span></div></div>
      <div class="tabla-env" id="tEmp"></div></div>`;
    $("#q").oninput = e => { filtroEmp.q = e.target.value; pinta(); };
    $("#fe").onchange = e => { filtroEmp.estado = e.target.value; pinta(); };
    $("#nuevo").onclick = () => formEmpleado(null);
    $("#csv").onclick = () => descargarCSV("trabajadores-adel.csv", emps, [["apellidos", "Apellidos"], ["nombres", "Nombres"], ["tipo_doc", "Tipo doc"], ["documento", "Documento"], ["cargo", "Cargo"], ["area", "Área"], ["tipo_contrato", "Contrato"], ["fecha_ingreso", "Ingreso"], ["fecha_retiro", "Retiro"], ["salario", "Salario"], ["correo", "Correo"], ["telefono", "Teléfono"], ["municipio", "Municipio"], ["eps", "EPS"], ["pension", "Pensión"], ["estado", "Estado"]]);
    pinta();
  }
  function formEmpleado(e) {
    const v = e || { tipo_doc: "CC", tipo_contrato: "Término fijo", estado: "activo", municipio: "Ocaña" };
    const c = abrirCajon(e ? "Hoja de vida" : "Nuevo trabajador", `<form id="fe">
      <input type="hidden" name="id" value="${esc(v.id || "")}">
      <div class="form-titulo">Datos personales</div>
      <div class="fila2">${campo("Nombres *", inp("nombres", v.nombres, "required"))}${campo("Apellidos *", inp("apellidos", v.apellidos, "required"))}</div>
      <div class="fila3">${campo("Tipo doc.", `<select name="tipo_doc">${opciones(["CC", "CE", "PPT", "PA", "TI"], v.tipo_doc)}</select>`)}${campo("Número *", inp("documento", v.documento, 'required pattern="[0-9A-Za-z.]{4,20}"'))}${campo("Expedido en", inp("expedida_en", v.expedida_en))}</div>
      <div class="fila3">${campo("Género", `<select name="genero">${opciones([["", "—"], ["F", "Femenino"], ["M", "Masculino"]], v.genero)}</select>`, "Para redactar la carta.")}${campo("Correo", inp("correo", v.correo, 'type="email"'))}${campo("Teléfono", inp("telefono", v.telefono))}</div>
      <div class="fila2">${campo("Dirección", inp("direccion", v.direccion))}${campo("Municipio", `<select name="municipio">${opciones(["", ...MUNICIPIOS], v.municipio)}</select>`)}</div>
      <div class="form-titulo">Vinculación</div>
      <div class="fila2">${campo("Cargo *", inp("cargo", v.cargo, "required"))}${campo("Área", inp("area", v.area, 'list="areas"'))}</div>
      <datalist id="areas">${opciones(["Dirección", "Administrativa", "Proyectos", "Comunicaciones", "Contabilidad"])}</datalist>
      <div class="fila2">${campo("Tipo de contrato", `<select name="tipo_contrato">${opciones(CONTRATOS, v.tipo_contrato)}</select>`)}${campo("Salario / honorarios mensual", inp("salario", v.salario, 'type="number" min="0" step="1"'))}</div>
      <div class="fila3">${campo("Fecha de ingreso *", inp("fecha_ingreso", v.fecha_ingreso, 'type="date" required'))}${campo("Fecha de retiro", inp("fecha_retiro", v.fecha_retiro, 'type="date"'))}${campo("Estado", `<select name="estado">${opciones([["activo", "Activo"], ["retirado", "Retirado"]], v.estado)}</select>`)}</div>
      ${campo("Funciones del cargo", `<textarea name="funciones" rows="4" placeholder="Una función por línea">${esc(v.funciones || "")}</textarea>`, "Aparecen en la carta laboral con funciones.")}
      <div class="form-titulo">Seguridad social</div>
      <div class="fila2">${campo("EPS", inp("eps", v.eps))}${campo("Fondo de pensiones", inp("pension", v.pension))}</div>
      ${campo("Notas internas", `<textarea name="notas" rows="2">${esc(v.notas || "")}</textarea>`)}
    </form>`, `${e && es("admin") ? `<button class="bt bt-peligro izq" id="borrar">${ic("borrar")}Eliminar</button>` : ""}${e ? `<button class="bt bt-sec" id="carta">${ic("carta")}Expedir carta</button>` : ""}<button class="bt bt-sec" data-cerrar>Cancelar</button><button class="bt bt-pri" id="guardar">Guardar</button>`);
    $("#guardar", c).onclick = ev => { const f = $("#fe", c); if (!f.reportValidity()) return; const d = leerForm(f);
      if (d.fecha_retiro && d.fecha_retiro < d.fecha_ingreso) return notif("La fecha de retiro no puede ser anterior al ingreso.", true);
      if (d.estado === "retirado" && !d.fecha_retiro) return notif("Indique la fecha de retiro.", true);
      conBoton(ev.currentTarget, async () => { await Datos.guardar("empleados", d); cerrarCajon(); notif("Hoja de vida guardada"); vEmpleados(); }); };
    if (e) $("#carta", c).onclick = async () => { cerrarCajon(); formCartaTH(await Datos.listar("empleados")); setTimeout(() => { const s = $('#cajon [name="empleado_id"]'); if (s) s.value = e.id; }, 50); };
    if (e && es("admin")) $("#borrar", c).onclick = async () => { if (!confirm(`¿Eliminar a ${e.nombres} ${e.apellidos}? También se eliminarán sus cartas. Esta acción no se puede deshacer.`)) return;
      try { await Datos.eliminar("empleados", e.id); cerrarCajon(); notif("Trabajador eliminado"); vEmpleados(); } catch (err) { fallo(err); } };
  }

  /* =========================================================
     CRM DE ALIADOS
     ========================================================= */
  const editaCRM = () => es("admin", "coordinacion");
  let filtroCRM = { q: "", tipo: "", estado: "" };
  async function vCRM() {
    const [conts, ints] = await Promise.all([Datos.listar("contactos"), Datos.listar("interacciones")]);
    const ultima = id => ints.filter(i => i.contacto_id === id).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    const pinta = () => {
      const q = filtroCRM.q.toLowerCase();
      const f = conts.filter(c => (!filtroCRM.tipo || c.tipo === filtroCRM.tipo) && (!filtroCRM.estado || c.estado === filtroCRM.estado) && (!q || [c.nombre, c.organizacion, c.municipio, c.etiquetas, c.correo].join(" ").toLowerCase().includes(q)));
      $("#tCRM").innerHTML = f.length ? `<table class="tabla"><thead><tr><th>Aliado / contacto</th><th>Tipo</th><th>Municipio</th><th>Última gestión</th><th>Estado</th></tr></thead><tbody>
        ${f.map(c => { const u = ultima(c.id); return `<tr class="clic" data-id="${c.id}"><td><b>${esc(c.nombre)}</b><span class="sec">${esc(c.organizacion || "")}</span></td><td><span class="chip teal sin">${TIPO_CONT[c.tipo]}</span></td><td>${esc(c.municipio || "—")}</td>
          <td>${u ? `${fecha(u.fecha)}<span class="sec">${esc(TIPO_INT[u.tipo])}</span>` : '<span class="sec">Sin gestiones</span>'}</td><td><span class="chip ${EST_CONT[c.estado][0]}">${EST_CONT[c.estado][1]}</span></td></tr>`; }).join("")}</tbody></table>` : vacio("No hay contactos con ese filtro.", "aliados");
      $$("#tCRM tr.clic").forEach(tr => tr.onclick = () => location.hash = "#/crm/" + tr.dataset.id);
    };
    const prox = ints.filter(i => i.fecha_proximo && i.fecha_proximo >= hoyISO()).length;
    const vencidos = ints.filter(i => i.fecha_proximo && i.fecha_proximo < hoyISO()).length;
    $("#vista").innerHTML = `<div class="cab"><div><h1>CRM de aliados</h1><p>Cooperantes, entidades públicas, alcaldías, proveedores, asociaciones y beneficiarios, con el historial de cada relación.</p></div>
      <div class="acciones"><button class="bt bt-sec" id="csv">${ic("descargar")}Exportar</button>${editaCRM() ? `<button class="bt bt-pri" id="nuevo">${ic("mas")}Nuevo contacto</button>` : ""}</div></div>
      <div class="kpis">
        <div class="kpi"><div class="ic v">${ic("aliados")}</div><div><b>${conts.filter(c => c.estado === "activo").length}</b><span>Activos</span></div></div>
        <div class="kpi"><div class="ic z">${ic("buscar")}</div><div><b>${conts.filter(c => c.estado === "prospecto").length}</b><span>Prospectos</span></div></div>
        <div class="kpi"><div class="ic">${ic("calendario")}</div><div><b>${prox}</b><span>Seguimientos próximos</span></div></div>
        <div class="kpi"><div class="ic a">${ic("bitacora")}</div><div><b>${vencidos}</b><span>Seguimientos vencidos</span></div></div></div>
      <div class="panel"><div class="panel-cab"><div class="filtros"><div class="buscar">${ic("buscar")}<input id="q" placeholder="Buscar nombre, organización, etiqueta…" value="${esc(filtroCRM.q)}"></div>
        <select id="ft">${opciones([["", "Todos los tipos"], ...Object.entries(TIPO_CONT)], filtroCRM.tipo)}</select>
        <select id="fs">${opciones([["", "Todos los estados"], ...Object.entries(EST_CONT).map(([k, v]) => [k, v[1]])], filtroCRM.estado)}</select></div></div>
      <div class="tabla-env" id="tCRM"></div></div>`;
    $("#q").oninput = e => { filtroCRM.q = e.target.value; pinta(); };
    $("#ft").onchange = e => { filtroCRM.tipo = e.target.value; pinta(); };
    $("#fs").onchange = e => { filtroCRM.estado = e.target.value; pinta(); };
    if (editaCRM()) $("#nuevo").onclick = () => formContacto(null);
    $("#csv").onclick = () => descargarCSV("crm-aliados-adel.csv", conts.map(c => ({ ...c, tipo: TIPO_CONT[c.tipo] })), [["nombre", "Nombre"], ["tipo", "Tipo"], ["organizacion", "Organización"], ["cargo", "Cargo"], ["municipio", "Municipio"], ["correo", "Correo"], ["telefono", "Teléfono"], ["estado", "Estado"], ["etiquetas", "Etiquetas"], ["notas", "Notas"]]);
    pinta();
  }
  function formContacto(c0) {
    const v = c0 || { tipo: "aliado", estado: "activo" };
    const c = abrirCajon(c0 ? "Editar contacto" : "Nuevo contacto", `<form id="fk"><input type="hidden" name="id" value="${esc(v.id || "")}">
      ${campo("Nombre del aliado o contacto *", inp("nombre", v.nombre, "required"))}
      <div class="fila2">${campo("Tipo", `<select name="tipo">${opciones(Object.entries(TIPO_CONT), v.tipo)}</select>`)}${campo("Estado", `<select name="estado">${opciones(Object.entries(EST_CONT).map(([k, x]) => [k, x[1]]), v.estado)}</select>`)}</div>
      <div class="fila2">${campo("Organización / dependencia", inp("organizacion", v.organizacion))}${campo("Persona de contacto y cargo", inp("cargo", v.cargo))}</div>
      <div class="fila3">${campo("Municipio", `<select name="municipio">${opciones(["", ...MUNICIPIOS], v.municipio)}</select>`)}${campo("Correo", inp("correo", v.correo, 'type="email"'))}${campo("Teléfono", inp("telefono", v.telefono))}</div>
      ${campo("Etiquetas", inp("etiquetas", v.etiquetas), "Separadas por coma. Ej.: cebolla, convenio, mujeres")}
      ${campo("Notas", `<textarea name="notas">${esc(v.notas || "")}</textarea>`)}</form>`,
      `${c0 && es("admin") ? `<button class="bt bt-peligro izq" id="borrar">${ic("borrar")}Eliminar</button>` : ""}<button class="bt bt-sec" data-cerrar>Cancelar</button><button class="bt bt-pri" id="guardar">Guardar</button>`);
    $("#guardar", c).onclick = ev => { const f = $("#fk", c); if (!f.reportValidity()) return;
      conBoton(ev.currentTarget, async () => { const r = await Datos.guardar("contactos", leerForm(f)); cerrarCajon(); notif("Contacto guardado"); location.hash = "#/crm/" + r.id; render(); }); };
    if (c0 && es("admin")) $("#borrar", c).onclick = async () => { if (!confirm(`¿Eliminar ${c0.nombre} y todo su historial?`)) return; try { await Datos.eliminar("contactos", c0.id); cerrarCajon(); location.hash = "#/crm"; } catch (e) { fallo(e); } };
  }
  async function vContacto(id) {
    const [c, ints, perfs] = await Promise.all([Datos.obtener("contactos", id), Datos.listar("interacciones", { contacto_id: id }), Datos.listar("perfiles").catch(() => [])]);
    if (!c) { $("#vista").innerHTML = vacio("El contacto no existe o no tiene permiso para verlo.", "aliados"); return; }
    const autor = uid => (perfs.find(p => p.id === uid) || {}).nombre || "";
    const d = [["Tipo", TIPO_CONT[c.tipo]], ["Organización", c.organizacion], ["Contacto / cargo", c.cargo], ["Municipio", c.municipio], ["Correo", c.correo], ["Teléfono", c.telefono], ["Etiquetas", c.etiquetas], ["Actualizado", fecha(c.actualizado)]];
    $("#vista").innerHTML = `<div class="cab"><div><p><a href="#/crm">← CRM de aliados</a></p><h1>${esc(c.nombre)}</h1><p><span class="chip ${EST_CONT[c.estado][0]}">${EST_CONT[c.estado][1]}</span></p></div>
      <div class="acciones">${c.correo ? `<a class="bt bt-sec" href="mailto:${esc(c.correo)}">Escribir correo</a>` : ""}${editaCRM() ? `<button class="bt bt-sec" id="editar">${ic("editar")}Editar</button><button class="bt bt-pri" id="gestion">${ic("mas")}Registrar gestión</button>` : ""}</div></div>
      <div class="dos-col">
        <div class="panel"><div class="panel-cab"><h3>Historial de gestiones</h3><span class="chip gris sin">${ints.length}</span></div><div class="panel-cuerpo">
          ${ints.length ? `<div class="linea-t">${ints.map(i => `<div class="it"><div class="meta"><b>${fecha(i.fecha)}</b><span class="chip teal sin">${TIPO_INT[i.tipo]}</span>${autor(i.autor) ? `<span>por ${esc(autor(i.autor))}</span>` : ""}
            ${editaCRM() && (es("admin") || i.autor === YO.id) ? `<button class="bt bt-txt bt-sm" data-bi="${i.id}" title="Eliminar">${ic("borrar")}</button>` : ""}</div>
            <p>${esc(i.resumen)}</p>${i.proximo_paso ? `<span class="prox">Próximo paso: ${esc(i.proximo_paso)}${i.fecha_proximo ? " · " + fecha(i.fecha_proximo) : ""}</span>` : ""}</div>`).join("")}</div>` : vacio("Aún no hay gestiones registradas.", "bitacora")}
        </div></div>
        <div class="panel"><div class="panel-cab"><h3>Datos del contacto</h3></div><div class="panel-cuerpo"><dl class="ficha" style="grid-template-columns:1fr 1fr">${d.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v || "—")}</dd></div>`).join("")}</dl>
          ${c.notas ? `<div class="form-titulo" style="margin-top:18px">Notas</div><p style="white-space:pre-line">${esc(c.notas)}</p>` : ""}</div></div>
      </div>`;
    if (editaCRM()) {
      $("#editar").onclick = () => formContacto(c);
      $("#gestion").onclick = () => { const k = abrirCajon("Registrar gestión", `<form id="fi"><input type="hidden" name="contacto_id" value="${c.id}">
        <div class="fila2">${campo("Fecha", inp("fecha", hoyISO(), 'type="date" required'))}${campo("Tipo", `<select name="tipo">${opciones(Object.entries(TIPO_INT))}</select>`)}</div>
        ${campo("¿Qué se hizo? *", `<textarea name="resumen" required placeholder="Resumen de la reunión, llamada o acuerdo"></textarea>`)}
        <div class="fila2">${campo("Próximo paso", inp("proximo_paso", ""))}${campo("Fecha del próximo paso", inp("fecha_proximo", "", 'type="date"'))}</div></form>`,
        `<button class="bt bt-sec" data-cerrar>Cancelar</button><button class="bt bt-pri" id="g">Guardar</button>`);
        $("#g", k).onclick = ev => { const f = $("#fi", k); if (!f.reportValidity()) return; conBoton(ev.currentTarget, async () => { await Datos.guardar("interacciones", leerForm(f)); await Datos.guardar("contactos", { id: c.id, estado: c.estado === "prospecto" ? "activo" : c.estado }); cerrarCajon(); notif("Gestión registrada"); vContacto(id); }); }; };
      $$("[data-bi]").forEach(b => b.onclick = async () => { if (!confirm("¿Eliminar esta gestión?")) return; try { await Datos.eliminar("interacciones", b.dataset.bi); vContacto(id); } catch (e) { fallo(e); } });
    }
  }

  /* =========================================================
     PÁGINA WEB (Comunicaciones)
     ========================================================= */
  async function vPagina() {
    const L = (window.INTRANET || {}).enlaces || {};
    const conv = window.CONVOCATORIAS || [], not = window.NOTICIAS || [], pro = window.PROYECTOS || [], prod = window.PRODUCTOS || [];
    const S = window.SITIO_CMS || {};
    const EC = { proxima: ["info", "Próximamente"], abierta: ["ok", "Abierta"], evaluacion: ["pend", "En evaluación"], cerrada: ["gris", "Cerrada"] };
    const acc = [[L.panel, "editar", "Panel de contenido", "Editar textos, convocatorias, noticias, fotos y secciones (Pages CMS)"],
      [L.vistaPrevia, "ojo", "Vista previa", "Ver los cambios guardados antes de publicarlos"],
      [(window.INTRANET || {}).sitio, "web", "Sitio oficial", "adelcatatumbo.org"],
      [L.analytics, "grafica", "Google Analytics", "Visitas y métricas del sitio"],
      [L.netlify, "externo", "Netlify", "Publicaciones y dominio"],
      [L.github, "externo", "GitHub", "Repositorio e historial de cambios"]].filter(a => a[0]);
    $("#vista").innerHTML = `<div class="cab"><div><h1>Página web</h1><p>Estado del contenido publicado y accesos para actualizar el sitio.</p></div></div>
      <div class="kpis">
        <div class="kpi"><div class="ic">${ic("megafono")}</div><div><b>${conv.filter(c => c.estado === "abierta").length} / ${conv.length}</b><span>Convocatorias abiertas</span></div></div>
        <div class="kpi"><div class="ic v">${ic("carta")}</div><div><b>${not.length}</b><span>Noticias publicadas</span></div></div>
        <div class="kpi"><div class="ic z">${ic("grafica")}</div><div><b>${pro.length}</b><span>Proyectos en la web</span></div></div>
        <div class="kpi"><div class="ic a">${ic("web")}</div><div><b>${S.tiendaAbierta ? "Abierta" : "Pronto"}</b><span>Tienda (${prod.length} productos)</span></div></div></div>
      <div class="panel"><div class="panel-cab"><h3>Herramientas</h3></div><div class="panel-cuerpo"><div class="accesos">${acc.map(a => `<a class="acceso" href="${esc(a[0])}" target="_blank" rel="noopener"><div class="ic">${ic(a[1])}</div><b>${a[2]} ↗</b><span>${a[3]}</span></a>`).join("")}</div></div></div>
      <div class="dos-col">
        <div class="panel"><div class="panel-cab"><h3>Convocatorias en la web</h3></div><div class="tabla-env">${conv.length ? `<table class="tabla"><thead><tr><th>Convocatoria</th><th>Cierre</th><th>Estado</th></tr></thead><tbody>
          ${conv.map(c => { const d = c.cierre ? Math.round((new Date(c.cierre + "T00:00:00") - new Date(hoyISO() + "T00:00:00")) / 864e5) : null;
            return `<tr><td><b>${esc(c.titulo)}</b><span class="sec">${esc(c.codigo)}</span></td><td>${fecha(c.cierre)}${c.prorrogada ? `<span class="sec">ampliado (antes ${fecha(c.cierre_original)})</span>` : ""}${c.estado === "abierta" && d != null && d >= 0 ? `<span class="sec">faltan ${d} días</span>` : ""}</td><td><span class="chip ${(EC[c.estado] || EC.cerrada)[0]}">${(EC[c.estado] || EC.cerrada)[1]}</span><span class="sec">${c.estado_manual ? "fijado a mano" : "automático"}</span></td></tr>`; }).join("")}</tbody></table>` : vacio("No hay convocatorias publicadas.", "megafono")}</div></div>
        <div class="panel"><div class="panel-cab"><h3>Cómo publicar un cambio</h3></div><div class="panel-cuerpo"><ol class="pasos-guia">
          <li>Entre al <b>Panel de contenido</b> y abra la rama «edicion».</li><li>Edite el texto, la convocatoria o la noticia y suba las fotos o PDF. Guarde con <b>Save</b>.</li>
          <li>Revise la <b>Vista previa</b> (1 a 2 minutos después).</li><li>Si todo está bien, use el botón <b>🚀 Publicar en adelcatatumbo.org</b> del panel.</li>
          <li>Junte varios cambios antes de publicar: el plan gratuito permite unas 20 publicaciones al mes.</li></ol></div></div>
      </div>
      <div class="panel"><div class="panel-cab"><h3>Últimas noticias</h3></div><div class="tabla-env">${not.length ? `<table class="tabla"><tbody>${not.slice(0, 5).map(n => `<tr><td><b>${esc(n.titulo)}</b><span class="sec">${esc(n.categoria || "")}</span></td><td>${fecha(n.fecha)}</td><td class="acc"><a class="bt bt-txt bt-sm" href="../noticias.html?id=${encodeURIComponent(n.id)}" target="_blank">Ver ↗</a></td></tr>`).join("")}</tbody></table>` : vacio("Sin noticias.")}</div></div>`;
  }

  /* =========================================================
     USUARIOS Y PERFILES (Administrador)
     ========================================================= */
  async function vUsuarios() {
    const [perfs, emps] = await Promise.all([Datos.listar("perfiles"), Datos.listar("empleados")]);
    const pend = perfs.filter(p => !p.activo || !p.rol);
    const fila = p => `<tr data-id="${p.id}"><td><b>${esc(p.nombre || "(sin nombre)")}</b><span class="sec">${esc(p.correo)}</span></td>
      <td><select data-k="rol" class="sel"><option value="">— Sin perfil —</option>${opciones(Object.entries(ROLES), p.rol)}</select></td>
      <td><select data-k="empleado_id" class="sel"><option value="">— No vinculado —</option>${opciones(emps.map(e => [e.id, e.apellidos + " " + e.nombres]), p.empleado_id)}</select></td>
      ${ERP_ACTIVO ? `<td><label style="display:flex;gap:6px;align-items:center;cursor:pointer" title="Acceso al módulo de proyectos (ERP)"><input type="checkbox" data-k="erp" ${p.erp || ["admin", "coordinacion"].includes(p.rol) ? "checked" : ""} ${["admin", "coordinacion"].includes(p.rol) ? "disabled" : ""}> ERP</label></td>` : ""}
      <td><label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" data-k="activo" ${p.activo ? "checked" : ""}> ${p.activo ? "Activo" : "Inactivo"}</label></td>
      <td class="acc"><button class="bt bt-pri bt-sm" data-g>Guardar</button>${p.id !== YO.id ? ` <button class="bt bt-txt bt-sm" data-b title="Eliminar">${ic("borrar")}</button>` : ""}</td></tr>`;
    const M = { inicio: "Escritorio", "mis-cartas": "Mis cartas", ...(ERP_ACTIVO ? { "mis-tareas": "Mis tareas", proyectos: "Proyectos (ERP)" } : {}), cartas: "Aprobar cartas", empleados: "Trabajadores", crm: "CRM de aliados", pagina: "Página web", usuarios: "Usuarios", bitacora: "Bitácora" };
    const permiso = (m, r) => { const mod = MODULOS.find(x => x.id === m); if (mod.erp) return ["admin", "coordinacion"].includes(r) ? '<span class="si">✓</span>' : '<span class="ver">Si se activa</span>'; if (!mod.roles.includes(r)) return '<span class="no">—</span>'; if (m === "crm" && r === "comunicaciones") return '<span class="ver">Consulta</span>'; return '<span class="si">✓</span>'; };
    $("#vista").innerHTML = `<div class="cab"><div><h1>Usuarios y perfiles</h1><p>Active las cuentas nuevas, asigne el perfil y vincule a cada usuario con su hoja de vida.</p></div>
</div>
      ${pend.length ? `<div class="msg msg-info"><b>${pend.length} cuenta${pend.length > 1 ? "s" : ""} esperando activación.</b> Asigne un perfil, marque «Activo» y guarde.</div>` : ""}
      <div class="msg msg-info">Las personas crean su cuenta en la página de ingreso de la intranet (botón «Crear cuenta») y aparecen aquí como inactivas hasta que usted las active.</div>
      <div class="panel"><div class="tabla-env"><table class="tabla"><thead><tr><th>Usuario</th><th>Perfil</th><th>Hoja de vida vinculada</th>${ERP_ACTIVO ? "<th>Proyectos</th>" : ""}<th>Estado</th><th></th></tr></thead><tbody>${perfs.map(fila).join("")}</tbody></table></div></div>
      <div class="panel"><div class="panel-cab"><h3>Qué ve cada perfil</h3></div><div class="panel-cuerpo tabla-env"><table class="permisos"><thead><tr><th>Módulo</th>${Object.values(ROLES).map(r => `<th>${r}</th>`).join("")}</tr></thead>
        <tbody>${Object.entries(M).map(([m, t]) => `<tr><td>${t}</td>${Object.keys(ROLES).map(r => `<td>${permiso(m, r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
    $$("tr[data-id]").forEach(tr => {
      const p = perfs.find(x => x.id === tr.dataset.id);
      $("[data-g]", tr).onclick = e => conBoton(e.currentTarget, async () => {
        const d = { id: p.id, rol: $('[data-k="rol"]', tr).value || null, empleado_id: $('[data-k="empleado_id"]', tr).value || null, activo: $('[data-k="activo"]', tr).checked };
        if (ERP_ACTIVO) d.erp = $('[data-k="erp"]', tr).checked && !$('[data-k="erp"]', tr).disabled;
        if (d.activo && !d.rol) throw new Error("Asigne un perfil antes de activar la cuenta.");
        await Datos.guardar("perfiles", d); notif("Usuario actualizado"); vUsuarios(); });
      const b = $("[data-b]", tr); if (b) b.onclick = async () => { if (!confirm(`¿Eliminar el acceso de ${p.nombre || p.correo}?`)) return; try { await Datos.eliminar("perfiles", p.id); notif("Acceso eliminado"); vUsuarios(); } catch (e) { fallo(e); } };
    });
  }

  /* =========================================================
     BITÁCORA (Administrador)
     ========================================================= */
  async function vBitacora() {
    const b = await Datos.listar("bitacora");
    const T = { empleados: "Trabajadores", cartas: "Cartas", contactos: "CRM", interacciones: "CRM · gestiones", perfiles: "Usuarios" };
    const A = { crear: ["ok", "Creó"], modificar: ["info", "Modificó"], eliminar: ["mal", "Eliminó"] };
    $("#vista").innerHTML = `<div class="cab"><div><h1>Bitácora</h1><p>Registro automático de quién creó, modificó o eliminó información (últimos 300 movimientos).</p></div>
      <div class="acciones"><button class="bt bt-sec" id="csv">${ic("descargar")}Exportar</button></div></div>
      <div class="panel"><div class="tabla-env">${b.length ? `<table class="tabla"><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Módulo</th><th>Registro</th></tr></thead><tbody>
      ${b.map(x => `<tr><td>${fechaHora(x.fecha)}</td><td>${esc(x.correo || "Sistema")}</td><td><span class="chip ${(A[x.accion] || A.modificar)[0]}">${(A[x.accion] || A.modificar)[1]}</span></td><td>${T[x.tabla] || esc(x.tabla)}</td><td>${esc(x.detalle || "")}</td></tr>`).join("")}</tbody></table>` : vacio("Aún no hay movimientos.", "bitacora")}</div></div>`;
    $("#csv").onclick = () => descargarCSV("bitacora-intranet.csv", b, [["fecha", "Fecha"], ["correo", "Usuario"], ["accion", "Acción"], ["tabla", "Módulo"], ["detalle", "Registro"]]);
  }

  /* =========================================================
     MI CUENTA
     ========================================================= */
  async function vCuenta() {
    $("#vista").innerHTML = `<div class="cab"><div><h1>Mi cuenta</h1><p>${esc(YO.correo)} · Perfil ${ROLES[YO.rol]}</p></div></div>
      <div class="dos-col"><div class="panel"><div class="panel-cab"><h3>Datos</h3></div><div class="panel-cuerpo"><form id="fn">${campo("Nombre completo", inp("nombre", YO.nombre, "required"))}<button class="bt bt-pri" type="submit">Guardar</button></form></div></div>
      <div class="panel"><div class="panel-cab"><h3>Cambiar contraseña</h3></div><div class="panel-cuerpo"><form id="fp">${campo("Nueva contraseña", '<input type="password" name="c1" minlength="8" required autocomplete="new-password">')}${campo("Repítala", '<input type="password" name="c2" minlength="8" required autocomplete="new-password">')}<button class="bt bt-pri" type="submit">${ic("llave")}Cambiar contraseña</button></form></div></div></div>`;
    $("#fn").onsubmit = e => { e.preventDefault(); conBoton($("#fn button"), async () => { const r = await Datos.guardar("perfiles", { id: YO.id, nombre: e.target.nombre.value.trim() }); YO.nombre = r.nombre; pintarUsuario(); notif("Datos guardados"); }); };
    $("#fp").onsubmit = e => { e.preventDefault(); const f = e.target; if (f.c1.value !== f.c2.value) return notif("Las contraseñas no coinciden.", true);
      conBoton($("#fp button"), async () => { await Datos.cambiarClave(f.c1.value); f.reset(); notif("Contraseña actualizada"); }); };
  }

  /* =========================================================
     PROYECTOS · ERP (portafolio, Kanban, lista, cronograma,
     presupuesto, indicadores) y MIS TAREAS
     ========================================================= */
  const EST_PROY = { formulacion: ["info", "Formulación"], ejecucion: ["ok", "En ejecución"], suspendido: ["mal", "Suspendido"], cierre: ["pend", "En cierre"], finalizado: ["gris", "Finalizado"] };
  const EST_TAREA = { pendiente: ["gris", "Pendiente"], en_curso: ["info", "En curso"], revision: ["pend", "En revisión"], hecha: ["ok", "Hecha"] };
  const PRIOR = { baja: ["gris", "Baja"], media: ["info", "Media"], alta: ["pend", "Alta"], urgente: ["mal", "Urgente"] };
  const RUBROS = ["Talento humano", "Arriendos y servicios", "Insumos y materiales", "Equipos", "Transporte y viáticos", "Talleres y eventos", "Comunicaciones", "Administrativos", "Otros"];
  const COLORES = ["#449890", "#6d9243", "#385f69", "#c97a1b", "#2b6cb0", "#8e44ad", "#c0392b"];
  const chip = (m, k) => `<span class="chip ${(m[k] || ["gris", k])[0]}">${(m[k] || ["gris", k])[1]}</span>`;
  const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;
  const barra = (v, cls = "") => `<div class="barra-p ${cls}"><span style="width:${Math.max(0, Math.min(100, v))}%"></span></div>`;
  const vencida = t => t.fecha_limite && t.estado !== "hecha" && t.fecha_limite < hoyISO();
  const diasHasta = d => Math.round((new Date(d + "T12:00:00") - new Date(hoyISO() + "T12:00:00")) / 864e5);
  let PERFILES_CACHE = null;
  async function perfiles() { if (!PERFILES_CACHE) PERFILES_CACHE = await Datos.listar("perfiles").catch(() => [YO]); return PERFILES_CACHE; }
  const nombreDe = (ps, id) => (ps.find(p => p.id === id) || {}).nombre || "";
  const avatar = (ps, id) => id ? `<span class="av-mini" title="${esc(nombreDe(ps, id))}">${iniciales(nombreDe(ps, id) || "?")}</span>` : `<span class="av-mini vacio" title="Sin responsable">?</span>`;
  function metricas(p, tareas, gastos) {
    const t = tareas.filter(x => x.proyecto_id === p.id), g = gastos.filter(x => x.proyecto_id === p.id);
    const ejecutado = g.reduce((s, x) => s + Number(x.valor || 0), 0);
    const fisico = t.length ? Math.round(t.reduce((s, x) => s + (x.estado === "hecha" ? 100 : Number(x.avance || 0)), 0) / t.length) : 0;
    let tiempo = 0;
    if (p.fecha_inicio && p.fecha_fin) { const a = new Date(p.fecha_inicio), b = new Date(p.fecha_fin), h = new Date(hoyISO()); tiempo = Math.max(0, Math.min(100, Math.round((h - a) / (b - a) * 100))); }
    return { t, g, ejecutado, fisico, tiempo, financiero: pct(ejecutado, Number(p.presupuesto || 0)), hechas: t.filter(x => x.estado === "hecha").length, vencidas: t.filter(vencida).length };
  }
  function semaforo(m, p) {
    if (p.estado === "finalizado") return ["gris", "Finalizado"];
    if (m.vencidas >= 3 || (p.fecha_fin && p.fecha_fin < hoyISO() && m.fisico < 100)) return ["mal", "En riesgo"];
    if (m.vencidas || m.tiempo - m.fisico > 20 || m.financiero - m.fisico > 25) return ["pend", "Requiere atención"];
    return ["ok", "Al día"];
  }

  /* ---------- MIS TAREAS (todos) ---------- */
  async function vMisTareas() {
    const [tareas, proys] = await Promise.all([Datos.listar("tareas", { responsable: YO.id }), Datos.listar("proyectos").catch(() => [])]);
    const proy = id => proys.find(p => p.id === id) || {};
    const grupos = [
      ["Vencidas", tareas.filter(vencida)],
      ["Próximos 7 días", tareas.filter(t => t.estado !== "hecha" && !vencida(t) && t.fecha_limite && diasHasta(t.fecha_limite) <= 7)],
      ["Más adelante", tareas.filter(t => t.estado !== "hecha" && t.fecha_limite && diasHasta(t.fecha_limite) > 7)],
      ["Sin fecha", tareas.filter(t => t.estado !== "hecha" && !t.fecha_limite)],
      ["Terminadas", tareas.filter(t => t.estado === "hecha")]
    ];
    $("#vista").innerHTML = `<div class="cab"><div><h1>Mis tareas</h1><p>Tareas de proyectos que tiene asignadas. Actualice el estado, el avance y la lista de chequeo, y deje comentarios.</p></div></div>
      <div class="kpis">
        <div class="kpi"><div class="ic">${ic("check")}</div><div><b>${tareas.filter(t => t.estado !== "hecha").length}</b><span>Por hacer</span></div></div>
        <div class="kpi"><div class="ic a">${ic("bitacora")}</div><div><b>${grupos[0][1].length}</b><span>Vencidas</span></div></div>
        <div class="kpi"><div class="ic z">${ic("calendario")}</div><div><b>${grupos[1][1].length}</b><span>Vencen esta semana</span></div></div>
        <div class="kpi"><div class="ic v">${ic("ok")}</div><div><b>${grupos[4][1].length}</b><span>Terminadas</span></div></div></div>
      ${tareas.length ? grupos.filter(g => g[1].length).map(([tit, l]) => `<div class="panel"><div class="panel-cab"><h3>${tit}</h3><span class="chip gris sin">${l.length}</span></div><div class="tabla-env"><table class="tabla"><tbody>
        ${l.map(t => `<tr class="clic" data-t="${t.id}"><td><b>${esc(t.titulo)}</b><span class="sec">${esc(proy(t.proyecto_id).nombre || "")}${t.componente ? " · " + esc(t.componente) : ""}</span></td>
          <td>${chip(PRIOR, t.prioridad)}</td><td class="nw">${t.fecha_limite ? `<span class="${vencida(t) ? "rojo" : ""}">${fecha(t.fecha_limite)}</span>` : "—"}</td>
          <td style="min-width:140px">${barra(t.estado === "hecha" ? 100 : t.avance)}<span class="sec">${t.estado === "hecha" ? 100 : t.avance}%</span></td><td>${chip(EST_TAREA, t.estado)}</td></tr>`).join("")}
      </tbody></table></div></div>`).join("") : `<div class="panel">${vacio("No tiene tareas asignadas por ahora.", "check")}</div>`}`;
    $$("[data-t]").forEach(tr => tr.onclick = () => { const t = tareas.find(x => x.id === tr.dataset.t); abrirTarea(t, proy(t.proyecto_id), vMisTareas); });
  }

  /* ---------- PORTAFOLIO ---------- */
  let filtroPortafolio = "activos";
  async function vPortafolio() {
    const [proys, tareas, gastos, ps] = await Promise.all([Datos.listar("proyectos"), Datos.listar("tareas"), Datos.listar("gastos"), perfiles()]);
    const lista = proys.filter(p => filtroPortafolio === "todos" || (filtroPortafolio === "activos" ? !["finalizado"].includes(p.estado) : p.estado === filtroPortafolio));
    const activos = proys.filter(p => p.estado === "ejecucion");
    const presup = activos.reduce((s, p) => s + Number(p.presupuesto || 0), 0);
    const ejec = gastos.filter(g => activos.some(p => p.id === g.proyecto_id)).reduce((s, g) => s + Number(g.valor || 0), 0);
    const venc = tareas.filter(vencida).length;
    const semana = tareas.filter(t => t.estado !== "hecha" && t.fecha_limite && !vencida(t) && diasHasta(t.fecha_limite) <= 7).length;
    $("#vista").innerHTML = `<div class="cab"><div><h1>Portafolio de proyectos</h1><p>Seguimiento físico, financiero y de tiempos de todos los proyectos de la agencia.</p></div>
      <div class="acciones"><button class="bt bt-sec" id="csv">${ic("descargar")}Exportar</button><button class="bt bt-pri" id="nuevo">${ic("mas")}Nuevo proyecto</button></div></div>
      <div class="kpis">
        <div class="kpi"><div class="ic">${ic("carpeta")}</div><div><b>${activos.length}</b><span>Proyectos en ejecución</span></div></div>
        <div class="kpi"><div class="ic v">${ic("dinero")}</div><div><b>${pct(ejec, presup)}%</b><span>Ejecución presupuestal (${pesos(ejec)} de ${pesos(presup)})</span></div></div>
        <div class="kpi"><div class="ic a">${ic("bitacora")}</div><div><b>${venc}</b><span>Tareas vencidas</span></div></div>
        <div class="kpi"><div class="ic z">${ic("calendario")}</div><div><b>${semana}</b><span>Tareas que vencen esta semana</span></div></div></div>
      <div class="panel"><div class="tabs">${[["activos", "Activos"], ["formulacion", "Formulación"], ["ejecucion", "En ejecución"], ["cierre", "En cierre"], ["finalizado", "Finalizados"], ["todos", "Todos"]]
        .map(([k, t]) => `<button data-f="${k}" class="${filtroPortafolio === k ? "activa" : ""}">${t}</button>`).join("")}</div>
      <div class="panel-cuerpo">${lista.length ? `<div class="proy-grid-erp">${lista.map(p => { const m = metricas(p, tareas, gastos), sem = semaforo(m, p);
        return `<a class="proy-erp" href="#/proyectos/${p.id}" style="--c:${esc(p.color || "#449890")}">
          <div class="pe-cab"><span class="pe-cod">${esc(p.codigo || "")}</span>${chip(EST_PROY, p.estado)}</div>
          <h3>${esc(p.nombre)}</h3><p class="pe-fin">${esc(p.financiador || "")}</p>
          <div class="pe-met"><div><span>Avance físico</span><b>${m.fisico}%</b>${barra(m.fisico)}</div><div><span>Ejecución financiera</span><b>${m.financiero}%</b>${barra(m.financiero, "v")}</div><div><span>Tiempo transcurrido</span><b>${m.tiempo}%</b>${barra(m.tiempo, "g")}</div></div>
          <div class="pe-pie"><span class="chip ${sem[0]}">${sem[1]}</span><span>${m.hechas}/${m.t.length} tareas${m.vencidas ? ` · <b class="rojo">${m.vencidas} vencidas</b>` : ""}</span>${avatar(ps, p.responsable)}</div></a>`; }).join("")}</div>`
        : vacio(proys.length ? "No hay proyectos con ese filtro." : "Aún no hay proyectos. Cree el primero con «Nuevo proyecto».", "carpeta")}</div></div>`;
    $$("[data-f]").forEach(b => b.onclick = () => { filtroPortafolio = b.dataset.f; vPortafolio(); });
    $("#nuevo").onclick = () => formProyecto(null, ps);
    $("#csv").onclick = () => descargarCSV("portafolio-proyectos-adel.csv", proys.map(p => { const m = metricas(p, tareas, gastos); return { ...p, estado: EST_PROY[p.estado][1], responsable: nombreDe(ps, p.responsable), ejecutado: m.ejecutado, fisico: m.fisico + "%", financiero: m.financiero + "%", tareas: m.t.length, vencidas: m.vencidas }; }),
      [["codigo", "Código"], ["nombre", "Proyecto"], ["estado", "Estado"], ["financiador", "Financiador"], ["responsable", "Responsable"], ["fecha_inicio", "Inicio"], ["fecha_fin", "Fin"], ["presupuesto", "Presupuesto"], ["ejecutado", "Ejecutado"], ["financiero", "% financiero"], ["fisico", "% físico"], ["tareas", "Tareas"], ["vencidas", "Vencidas"]]);
  }
  function formProyecto(p0, ps) {
    const v = p0 || { estado: "ejecucion", color: COLORES[0], responsable: YO.id, fecha_inicio: hoyISO() };
    const c = abrirCajon(p0 ? "Editar proyecto" : "Nuevo proyecto", `<form id="fp"><input type="hidden" name="id" value="${esc(v.id || "")}">
      <div class="fila2">${campo("Código", inp("codigo", v.codigo, 'placeholder="Ej.: ADEL-P-2026-01"'))}${campo("Estado", `<select name="estado">${opciones(Object.entries(EST_PROY).map(([k, x]) => [k, x[1]]), v.estado)}</select>`)}</div>
      ${campo("Nombre del proyecto *", inp("nombre", v.nombre, "required"))}
      ${campo("Objetivo / descripción", `<textarea name="descripcion">${esc(v.descripcion || "")}</textarea>`)}
      <div class="fila2">${campo("Financiador", inp("financiador", v.financiador))}${campo("Aliados", inp("aliados", v.aliados))}</div>
      <div class="fila2">${campo("Línea", inp("linea", v.linea, 'list="lineas"'))}${campo("Municipios", inp("municipios", v.municipios))}</div>
      <datalist id="lineas">${opciones(["Hortofrutícola", "Café", "Cacao", "Mujeres y tejido social", "Cultura", "Asesoría institucional", "Sostenibilidad"])}</datalist>
      <div class="fila3">${campo("Inicio", inp("fecha_inicio", v.fecha_inicio, 'type="date"'))}${campo("Fin", inp("fecha_fin", v.fecha_fin, 'type="date"'))}${campo("Presupuesto (COP)", inp("presupuesto", v.presupuesto || 0, 'type="number" min="0" step="1"'))}</div>
      <div class="fila2">${campo("Responsable", `<select name="responsable"><option value="">—</option>${opciones(ps.filter(x => x.activo).map(x => [x.id, x.nombre || x.correo]), v.responsable)}</select>`)}
        ${campo("Color", `<div class="colores">${COLORES.map(col => `<label><input type="radio" name="color" value="${col}" ${v.color === col ? "checked" : ""}><span style="background:${col}"></span></label>`).join("")}</div>`)}</div></form>`,
      `${p0 && es("admin") ? `<button class="bt bt-peligro izq" id="borrar">${ic("borrar")}Eliminar</button>` : ""}<button class="bt bt-sec" data-cerrar>Cancelar</button><button class="bt bt-pri" id="g">Guardar</button>`);
    $("#g", c).onclick = ev => { const f = $("#fp", c); if (!f.reportValidity()) return; const d = leerForm(f); d.color = ($('[name="color"]:checked', c) || {}).value || COLORES[0];
      if (d.fecha_fin && d.fecha_inicio && d.fecha_fin < d.fecha_inicio) return notif("La fecha de fin no puede ser anterior al inicio.", true);
      d.presupuesto = d.presupuesto || 0;
      conBoton(ev.currentTarget, async () => { const r = await Datos.guardar("proyectos", d); cerrarCajon(); notif("Proyecto guardado"); location.hash = "#/proyectos/" + r.id; if (p0) render(); }); };
    if (p0 && es("admin")) $("#borrar", c).onclick = async () => { if (!confirm(`¿Eliminar el proyecto «${p0.nombre}» con todas sus tareas, gastos e indicadores? No se puede deshacer.`)) return;
      try { await Datos.eliminar("proyectos", p0.id); cerrarCajon(); location.hash = "#/proyectos"; } catch (e) { fallo(e); } };
  }

  /* ---------- PROYECTO (detalle) ---------- */
  async function vProyecto(id, sub) {
    const [p, tareasT, gastosT, inds, ps] = await Promise.all([Datos.obtener("proyectos", id), Datos.listar("tareas", { proyecto_id: id }), Datos.listar("gastos", { proyecto_id: id }), Datos.listar("indicadores", { proyecto_id: id }), perfiles()]);
    if (!p) { $("#vista").innerHTML = vacio("El proyecto no existe o no tiene permiso para verlo.", "carpeta"); return; }
    const m = metricas(p, tareasT, gastosT), sem = semaforo(m, p);
    const TABS = [["tablero", "tablero", "Tablero"], ["lista", "lista", "Lista"], ["cronograma", "gantt", "Cronograma"], ["presupuesto", "dinero", "Presupuesto"], ["indicadores", "meta", "Indicadores"]];
    $("#ruta").innerHTML = `Intranet / <a href="#/proyectos">Portafolio</a> / <b>${esc(p.codigo || p.nombre)}</b>`;
    $("#vista").innerHTML = `<div class="cab"><div><p><a href="#/proyectos">← Portafolio de proyectos</a></p><h1><span class="punto" style="background:${esc(p.color)}"></span>${esc(p.nombre)}</h1>
        <p>${chip(EST_PROY, p.estado)} <span class="chip ${sem[0]}">${sem[1]}</span> ${p.financiador ? "· " + esc(p.financiador) : ""} ${p.fecha_inicio ? "· " + fecha(p.fecha_inicio) + " → " + fecha(p.fecha_fin) : ""} ${p.responsable ? "· Responsable: " + esc(nombreDe(ps, p.responsable)) : ""}</p></div>
      <div class="acciones"><button class="bt bt-sec" id="editar">${ic("editar")}Editar</button><button class="bt bt-pri" id="nuevaT">${ic("mas")}Nueva tarea</button></div></div>
      <div class="resumen-p">
        <div><span>Avance físico</span><b>${m.fisico}%</b>${barra(m.fisico)}</div>
        <div><span>Ejecución financiera</span><b>${m.financiero}%</b>${barra(m.financiero, "v")}<small>${pesos(m.ejecutado)} de ${pesos(p.presupuesto)}</small></div>
        <div><span>Tiempo transcurrido</span><b>${m.tiempo}%</b>${barra(m.tiempo, "g")}</div>
        <div><span>Tareas</span><b>${m.hechas}/${m.t.length}</b><small>${m.vencidas ? `<span class="rojo">${m.vencidas} vencidas</span>` : "ninguna vencida"}</small></div></div>
      ${p.descripcion ? `<p class="lead-p">${esc(p.descripcion)}</p>` : ""}
      <div class="panel"><div class="tabs">${TABS.map(([k, i, t]) => `<button data-sub="${k}" class="${sub === k ? "activa" : ""}">${ic(i)} ${t}</button>`).join("")}</div><div id="subvista"></div></div>`;
    $$("[data-sub]").forEach(b => b.onclick = () => { location.hash = `#/proyectos/${id}/${b.dataset.sub}`; });
    $("#editar").onclick = () => formProyecto(p, ps);
    const recargar = () => vProyecto(id, sub);
    $("#nuevaT").onclick = () => abrirTarea(null, p, recargar, ps);
    const sv = $("#subvista");
    ({ tablero: subTablero, lista: subLista, cronograma: subCronograma, presupuesto: subPresupuesto, indicadores: subIndicadores }[sub] || subTablero)(sv, p, tareasT, gastosT, inds, ps, recargar);
  }

  function tarjetaT(t, ps) {
    const ch = Array.isArray(t.checklist) ? t.checklist : [];
    return `<div class="kt ${vencida(t) ? "venc" : ""}" draggable="true" data-id="${t.id}">
      <div class="kt-top">${t.componente ? `<span class="kt-comp">${esc(t.componente)}</span>` : ""}<span class="kt-pri ${t.prioridad}" title="Prioridad ${PRIOR[t.prioridad][1]}"></span></div>
      <b>${esc(t.titulo)}</b>
      ${t.estado !== "hecha" && t.avance ? barra(t.avance) : ""}
      <div class="kt-pie">${t.fecha_limite ? `<span class="${vencida(t) ? "rojo" : ""}">${ic("calendario")}${fecha(t.fecha_limite)}</span>` : "<span></span>"}
        ${ch.length ? `<span>${ic("check")}${ch.filter(x => x.hecho).length}/${ch.length}</span>` : ""}${avatar(ps, t.responsable)}</div></div>`;
  }
  function subTablero(sv, p, tareas, g, i, ps, recargar) {
    const cols = Object.keys(EST_TAREA);
    sv.innerHTML = `<div class="kanban">${cols.map(e => { const l = tareas.filter(t => t.estado === e).sort((a, b) => a.orden - b.orden);
      return `<div class="kcol" data-estado="${e}"><div class="kcol-cab">${chip(EST_TAREA, e)}<span>${l.length}</span></div><div class="kcol-lista">${l.map(t => tarjetaT(t, ps)).join("")}</div>
        ${e === "pendiente" ? `<form class="k-rapida"><input placeholder="+ Agregar tarea rápida" maxlength="200"></form>` : ""}</div>`; }).join("")}</div>
      <p class="ayuda-k">Arrastre las tarjetas entre columnas para cambiar su estado. Haga clic en una tarjeta para ver el detalle, la lista de chequeo y los comentarios.</p>`;
    $$(".kt", sv).forEach(el => {
      el.onclick = () => abrirTarea(tareas.find(t => t.id === el.dataset.id), p, recargar, ps);
      el.ondragstart = e => { e.dataTransfer.setData("text/plain", el.dataset.id); el.classList.add("arrastrando"); };
      el.ondragend = () => el.classList.remove("arrastrando");
    });
    $$(".kcol", sv).forEach(col => {
      col.ondragover = e => { e.preventDefault(); col.classList.add("sobre"); };
      col.ondragleave = () => col.classList.remove("sobre");
      col.ondrop = async e => { e.preventDefault(); col.classList.remove("sobre");
        const t = tareas.find(x => x.id === e.dataTransfer.getData("text/plain")); if (!t || t.estado === col.dataset.estado) return;
        const enCol = tareas.filter(x => x.estado === col.dataset.estado);
        const d = { id: t.id, estado: col.dataset.estado, orden: (enCol.reduce((mx, x) => Math.max(mx, x.orden || 0), 0)) + 1 };
        if (d.estado === "hecha") d.avance = 100;
        try { await Datos.guardar("tareas", d); notif(`«${t.titulo}» → ${EST_TAREA[d.estado][1]}`); recargar(); } catch (err) { fallo(err); } };
    });
    $(".k-rapida", sv).onsubmit = async e => { e.preventDefault(); const v = e.target.querySelector("input").value.trim(); if (!v) return;
      try { await Datos.guardar("tareas", { proyecto_id: p.id, titulo: v, estado: "pendiente", prioridad: "media", orden: Date.now() / 1e10 }); recargar(); } catch (err) { fallo(err); } };
  }
  function subLista(sv, p, tareas, g, i, ps, recargar) {
    const comps = [...new Set(tareas.map(t => t.componente || "Sin componente"))].sort();
    sv.innerHTML = `<div class="panel-cuerpo" style="padding-bottom:0"><div class="filtros"><select id="fr"><option value="">Todos los responsables</option>${opciones(ps.filter(x => tareas.some(t => t.responsable === x.id)).map(x => [x.id, x.nombre]))}</select>
      <select id="fe">${opciones([["", "Todos los estados"], ...Object.entries(EST_TAREA).map(([k, x]) => [k, x[1]])])}</select><button class="bt bt-sec bt-sm" id="csv">${ic("descargar")}Exportar</button></div></div><div id="tl"></div>`;
    const pinta = () => { const r = $("#fr").value, e = $("#fe").value; const f = tareas.filter(t => (!r || t.responsable === r) && (!e || t.estado === e));
      $("#tl").innerHTML = f.length ? comps.map(c => { const l = f.filter(t => (t.componente || "Sin componente") === c); if (!l.length) return "";
        return `<div class="grupo-l">${esc(c)} <span>${l.length}</span></div><div class="tabla-env"><table class="tabla"><thead><tr><th>Tarea</th><th>Responsable</th><th>Prioridad</th><th>Inicio</th><th>Límite</th><th>Avance</th><th>Estado</th></tr></thead><tbody>
        ${l.map(t => `<tr class="clic" data-id="${t.id}"><td><b>${esc(t.titulo)}</b></td><td>${esc(nombreDe(ps, t.responsable) || "—")}</td><td>${chip(PRIOR, t.prioridad)}</td><td class="nw">${fecha(t.fecha_inicio)}</td>
          <td class="nw ${vencida(t) ? "rojo" : ""}">${fecha(t.fecha_limite)}</td><td style="min-width:110px">${barra(t.estado === "hecha" ? 100 : t.avance)}</td><td>${chip(EST_TAREA, t.estado)}</td></tr>`).join("")}</tbody></table></div>`; }).join("")
        : vacio("No hay tareas con ese filtro.", "lista");
      $$("#tl tr.clic").forEach(tr => tr.onclick = () => abrirTarea(tareas.find(t => t.id === tr.dataset.id), p, recargar, ps)); };
    $("#fr").onchange = pinta; $("#fe").onchange = pinta; pinta();
    $("#csv").onclick = () => descargarCSV(`tareas-${p.codigo || "proyecto"}.csv`, tareas.map(t => ({ ...t, responsable: nombreDe(ps, t.responsable), estado: EST_TAREA[t.estado][1], prioridad: PRIOR[t.prioridad][1] })),
      [["componente", "Componente"], ["titulo", "Tarea"], ["responsable", "Responsable"], ["prioridad", "Prioridad"], ["fecha_inicio", "Inicio"], ["fecha_limite", "Límite"], ["avance", "Avance %"], ["estado", "Estado"]]);
  }
  function subCronograma(sv, p, tareas, g, i, ps, recargar) {
    const conFecha = tareas.filter(t => t.fecha_limite || t.fecha_inicio);
    const fechas = [p.fecha_inicio, p.fecha_fin, ...conFecha.flatMap(t => [t.fecha_inicio, t.fecha_limite])].filter(Boolean).sort();
    if (!fechas.length) { sv.innerHTML = vacio("Agregue fechas al proyecto y a las tareas para ver el cronograma.", "gantt"); return; }
    const ini = new Date(fechas[0].slice(0, 7) + "-01T12:00:00"), finD = new Date(fechas[fechas.length - 1] + "T12:00:00");
    const meses = []; for (let d = new Date(ini); d <= finD; d.setMonth(d.getMonth() + 1)) meses.push(new Date(d));
    const finMes = new Date(meses[meses.length - 1]); finMes.setMonth(finMes.getMonth() + 1);
    const total = finMes - ini, pos = f => Math.max(0, Math.min(100, (new Date(f + "T12:00:00") - ini) / total * 100));
    const hoyP = pos(hoyISO());
    const filas = conFecha.sort((a, b) => String(a.fecha_inicio || a.fecha_limite).localeCompare(String(b.fecha_inicio || b.fecha_limite)));
    sv.innerHTML = `<div class="gantt" style="--meses:${meses.length}"><div class="g-cab"><div class="g-nom">Tarea</div><div class="g-tl">${meses.map((mm, k) => `<span>${mm.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}${k === 0 || mm.getMonth() === 0 ? " " + String(mm.getFullYear()).slice(2) : ""}</span>`).join("")}</div></div>
      ${p.fecha_inicio && p.fecha_fin ? `<div class="g-fila g-proy"><div class="g-nom"><b>${esc(p.nombre)}</b></div><div class="g-tl"><div class="g-barra" style="left:${pos(p.fecha_inicio)}%;width:${Math.max(.8, pos(p.fecha_fin) - pos(p.fecha_inicio))}%;background:${esc(p.color)}"></div></div></div>` : ""}
      ${filas.map(t => { const a = t.fecha_inicio || t.fecha_limite, b = t.fecha_limite || t.fecha_inicio;
        return `<div class="g-fila clic" data-id="${t.id}"><div class="g-nom">${esc(t.titulo)}<span>${esc(nombreDe(ps, t.responsable))}</span></div><div class="g-tl">
          <div class="g-barra e-${t.estado} ${vencida(t) ? "venc" : ""}" style="left:${pos(a)}%;width:${Math.max(.8, pos(b) - pos(a))}%" title="${fecha(a)} → ${fecha(b)}"><i style="width:${t.estado === "hecha" ? 100 : t.avance}%"></i></div></div></div>`; }).join("")}
      <div class="g-hoy" style="left:calc(var(--gnom) + (100% - var(--gnom)) * ${hoyP / 100})"><span>Hoy</span></div></div>
      ${tareas.length > filas.length ? `<p class="ayuda-k">${tareas.length - filas.length} tarea(s) sin fechas no aparecen en el cronograma.</p>` : ""}
      <div class="g-ley"><span class="e-pendiente"></span>Pendiente <span class="e-en_curso"></span>En curso <span class="e-revision"></span>En revisión <span class="e-hecha"></span>Hecha <span class="venc"></span>Vencida</div>`;
    $$(".g-fila.clic", sv).forEach(f => f.onclick = () => abrirTarea(tareas.find(t => t.id === f.dataset.id), p, recargar, ps));
  }
  function subPresupuesto(sv, p, tareas, gastos, i, ps, recargar) {
    const total = gastos.reduce((s, x) => s + Number(x.valor), 0), saldo = Number(p.presupuesto || 0) - total;
    const porRubro = RUBROS.map(r => [r, gastos.filter(x => x.rubro === r).reduce((s, x) => s + Number(x.valor), 0)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    sv.innerHTML = `<div class="panel-cuerpo"><div class="resumen-p" style="margin:0 0 18px">
        <div><span>Presupuesto</span><b>${pesos(p.presupuesto)}</b></div><div><span>Ejecutado</span><b>${pesos(total)}</b>${barra(pct(total, p.presupuesto), "v")}</div>
        <div><span>Saldo</span><b class="${saldo < 0 ? "rojo" : ""}">${pesos(saldo)}</b></div><div><span>% ejecución</span><b>${pct(total, p.presupuesto)}%</b></div></div>
      ${saldo < 0 ? `<div class="msg msg-error">Los gastos superan el presupuesto del proyecto en ${pesos(-saldo)}.</div>` : ""}
      <div class="dos-col"><div><div class="filtros" style="margin-bottom:10px"><button class="bt bt-pri bt-sm" id="nuevoG">${ic("mas")}Registrar gasto</button><button class="bt bt-sec bt-sm" id="csv">${ic("descargar")}Exportar</button></div>
        <div class="tabla-env">${gastos.length ? `<table class="tabla"><thead><tr><th>Fecha</th><th>Concepto</th><th>Rubro</th><th style="text-align:right">Valor</th><th></th></tr></thead><tbody>
        ${gastos.map(x => `<tr><td class="nw">${fecha(x.fecha)}</td><td>${esc(x.concepto)}${x.soporte ? `<span class="sec">${esc(x.soporte)}</span>` : ""}</td><td>${esc(x.rubro)}</td><td style="text-align:right" class="nw">${pesos(x.valor)}</td>
          <td class="acc"><button class="bt bt-txt bt-sm" data-bg="${x.id}" title="Eliminar">${ic("borrar")}</button></td></tr>`).join("")}</tbody></table>` : vacio("Aún no hay gastos registrados.", "dinero")}</div></div>
      <div><h4 style="margin-bottom:10px">Ejecución por rubro</h4>${porRubro.length ? porRubro.map(([r, v]) => `<div class="rubro"><span>${esc(r)}</span><b>${pesos(v)}</b>${barra(pct(v, total), "v")}</div>`).join("") : '<p class="sec">Sin datos.</p>'}</div></div></div>`;
    $("#nuevoG").onclick = () => { const c = abrirCajon("Registrar gasto", `<form id="fg"><input type="hidden" name="proyecto_id" value="${p.id}">
      <div class="fila2">${campo("Fecha", inp("fecha", hoyISO(), 'type="date" required'))}${campo("Valor (COP) *", inp("valor", "", 'type="number" min="1" step="1" required'))}</div>
      ${campo("Concepto *", inp("concepto", "", "required"))}${campo("Rubro", `<select name="rubro">${opciones(RUBROS)}</select>`)}
      ${campo("Soporte", inp("soporte", "", 'placeholder="N.º de factura, comprobante o enlace"'))}</form>`, `<button class="bt bt-sec" data-cerrar>Cancelar</button><button class="bt bt-pri" id="g">Guardar</button>`);
      $("#g", c).onclick = ev => { const f = $("#fg", c); if (!f.reportValidity()) return; conBoton(ev.currentTarget, async () => { await Datos.guardar("gastos", leerForm(f)); cerrarCajon(); notif("Gasto registrado"); recargar(); }); }; };
    $$("[data-bg]", sv).forEach(b => b.onclick = async () => { if (!confirm("¿Eliminar este gasto?")) return; try { await Datos.eliminar("gastos", b.dataset.bg); recargar(); } catch (e) { fallo(e); } });
    $("#csv").onclick = () => descargarCSV(`gastos-${p.codigo || "proyecto"}.csv`, gastos, [["fecha", "Fecha"], ["concepto", "Concepto"], ["rubro", "Rubro"], ["valor", "Valor"], ["soporte", "Soporte"]]);
  }
  function subIndicadores(sv, p, tareas, g, inds, ps, recargar) {
    sv.innerHTML = `<div class="panel-cuerpo"><div class="filtros" style="margin-bottom:14px"><button class="bt bt-pri bt-sm" id="nuevoI">${ic("mas")}Nuevo indicador</button></div>
      ${inds.length ? `<div class="inds">${inds.map(x => { const v = pct(Number(x.logrado), Number(x.meta)); return `<div class="ind clic" data-id="${x.id}"><div class="ind-cab"><b>${esc(x.nombre)}</b><span>${v}%</span></div>${barra(v, v >= 100 ? "v" : "")}
        <small>${Number(x.logrado).toLocaleString("es-CO")} de ${Number(x.meta).toLocaleString("es-CO")} ${esc(x.unidad)}${x.fecha_corte ? " · corte " + fecha(x.fecha_corte) : ""}</small></div>`; }).join("")}</div>`
        : vacio("Registre las metas del proyecto (familias atendidas, hectáreas, talleres, etc.) para medir su cumplimiento.", "meta")}</div>`;
    const form = x0 => { const v = x0 || { unidad: "familias" }; const c = abrirCajon(x0 ? "Editar indicador" : "Nuevo indicador", `<form id="fi"><input type="hidden" name="id" value="${esc(v.id || "")}"><input type="hidden" name="proyecto_id" value="${p.id}">
      ${campo("Indicador *", inp("nombre", v.nombre, 'required placeholder="Ej.: Familias productoras fortalecidas"'))}
      <div class="fila3">${campo("Meta", inp("meta", v.meta ?? 0, 'type="number" min="0" step="any" required'))}${campo("Logrado", inp("logrado", v.logrado ?? 0, 'type="number" min="0" step="any" required'))}${campo("Unidad", inp("unidad", v.unidad))}</div>
      ${campo("Fecha de corte", inp("fecha_corte", v.fecha_corte || hoyISO(), 'type="date"'))}</form>`,
      `${x0 ? `<button class="bt bt-peligro izq" id="b">${ic("borrar")}Eliminar</button>` : ""}<button class="bt bt-sec" data-cerrar>Cancelar</button><button class="bt bt-pri" id="g">Guardar</button>`);
      $("#g", c).onclick = ev => { const f = $("#fi", c); if (!f.reportValidity()) return; conBoton(ev.currentTarget, async () => { await Datos.guardar("indicadores", leerForm(f)); cerrarCajon(); notif("Indicador guardado"); recargar(); }); };
      if (x0) $("#b", c).onclick = async () => { if (!confirm("¿Eliminar este indicador?")) return; try { await Datos.eliminar("indicadores", x0.id); cerrarCajon(); recargar(); } catch (e) { fallo(e); } }; };
    $("#nuevoI").onclick = () => form(null);
    $$(".ind", sv).forEach(el => el.onclick = () => form(inds.find(x => x.id === el.dataset.id)));
  }

  /* ---------- FICHA DE TAREA (ERP: edición completa; responsable: estado, avance, chequeo y comentarios) ---------- */
  async function abrirTarea(t0, proyecto, alGuardar, ps) {
    ps = ps || await perfiles();
    const completo = ERP, nueva = !t0;
    const v = t0 ? { ...t0, checklist: Array.isArray(t0.checklist) ? t0.checklist.map(x => ({ ...x })) : [] } : { proyecto_id: proyecto.id, estado: "pendiente", prioridad: "media", avance: 0, checklist: [], responsable: "" };
    const comentarios = t0 ? await Datos.listar("tarea_comentarios", { tarea_id: t0.id }).catch(() => []) : [];
    const lectura = (k, val) => `<div><dt>${k}</dt><dd>${val || "—"}</dd></div>`;
    const c = abrirCajon(nueva ? "Nueva tarea" : esc(v.titulo), `
      <p class="sec" style="margin:-6px 0 14px;color:var(--gris)">${esc((proyecto || {}).nombre || "")}</p>
      <form id="ft">
      ${completo ? `<input type="hidden" name="id" value="${esc(v.id || "")}"><input type="hidden" name="proyecto_id" value="${esc(v.proyecto_id)}">
        ${campo("Tarea *", inp("titulo", v.titulo, "required maxlength=200"))}
        ${campo("Descripción", `<textarea name="descripcion">${esc(v.descripcion || "")}</textarea>`)}
        <div class="fila2">${campo("Componente / fase", inp("componente", v.componente, 'placeholder="Ej.: Componente 1 · Producción"'))}${campo("Responsable", `<select name="responsable"><option value="">— Sin asignar —</option>${opciones(ps.filter(x => x.activo).map(x => [x.id, x.nombre || x.correo]), v.responsable)}</select>`)}</div>
        <div class="fila3">${campo("Inicio", inp("fecha_inicio", v.fecha_inicio, 'type="date"'))}${campo("Fecha límite", inp("fecha_limite", v.fecha_limite, 'type="date"'))}${campo("Prioridad", `<select name="prioridad">${opciones(Object.entries(PRIOR).map(([k, x]) => [k, x[1]]), v.prioridad)}</select>`)}</div>`
      : `<dl class="ficha" style="grid-template-columns:1fr 1fr;margin-bottom:16px">${lectura("Componente", esc(v.componente))}${lectura("Prioridad", chip(PRIOR, v.prioridad))}${lectura("Inicio", fecha(v.fecha_inicio))}${lectura("Fecha límite", `<span class="${vencida(v) ? "rojo" : ""}">${fecha(v.fecha_limite)}</span>`)}</dl>
        ${v.descripcion ? `<p style="white-space:pre-line;margin-bottom:16px">${esc(v.descripcion)}</p>` : ""}`}
        <div class="fila2">${campo("Estado", `<select name="estado">${opciones(Object.entries(EST_TAREA).map(([k, x]) => [k, x[1]]), v.estado)}</select>`)}
          ${campo(`Avance: <b id="avTxt">${v.avance}%</b>`, `<input type="range" name="avance" min="0" max="100" step="5" value="${v.avance}">`)}</div>
      </form>
      <div class="form-titulo">Lista de chequeo</div>
      <ul class="chequeo" id="chk"></ul>
      <form id="fchk" class="chk-nuevo"><input placeholder="+ Agregar ítem" maxlength="200"><button class="bt bt-sec bt-sm">Agregar</button></form>
      ${t0 ? `<div class="form-titulo" style="margin-top:20px">Comentarios</div>
        <div class="comentarios">${comentarios.length ? comentarios.map(k => `<div class="cm"><span class="av-mini">${iniciales(nombreDe(ps, k.autor) || "?")}</span><div><b>${esc(nombreDe(ps, k.autor) || "Usuario")}</b> <small>${fechaHora(k.creado)}</small><p>${esc(k.texto)}</p></div></div>`).join("") : '<p class="sec" style="color:var(--gris)">Sin comentarios.</p>'}</div>
        <form id="fcm" class="chk-nuevo"><textarea placeholder="Escriba un comentario…" maxlength="4000" rows="2"></textarea><button class="bt bt-sec bt-sm">Comentar</button></form>` : ""}`,
      `${t0 && completo ? `<button class="bt bt-peligro izq" id="b">${ic("borrar")}Eliminar</button>` : ""}<button class="bt bt-sec" data-cerrar>Cerrar</button><button class="bt bt-pri" id="g">${nueva ? "Crear tarea" : "Guardar"}</button>`);
    const pintaChk = () => { $("#chk", c).innerHTML = v.checklist.map((x, i) => `<li><label><input type="checkbox" data-i="${i}" ${x.hecho ? "checked" : ""}> <span>${esc(x.texto)}</span></label><button type="button" class="bt bt-txt bt-sm" data-q="${i}">${ic("cerrar")}</button></li>`).join("") || '<li class="sec" style="color:var(--gris)">Sin ítems.</li>';
      $$("[data-i]", c).forEach(el => el.onchange = () => { v.checklist[el.dataset.i].hecho = el.checked; sugerirAvance(); });
      $$("[data-q]", c).forEach(el => el.onclick = () => { v.checklist.splice(el.dataset.q, 1); pintaChk(); }); };
    const rango = $('[name="avance"]', c);
    const sugerirAvance = () => { if (v.checklist.length) { rango.value = Math.round(v.checklist.filter(x => x.hecho).length / v.checklist.length * 100 / 5) * 5; $("#avTxt", c).textContent = rango.value + "%"; } };
    rango.oninput = () => $("#avTxt", c).textContent = rango.value + "%";
    $('[name="estado"]', c).onchange = e => { if (e.target.value === "hecha") { rango.value = 100; $("#avTxt", c).textContent = "100%"; } };
    pintaChk();
    $("#fchk", c).onsubmit = e => { e.preventDefault(); const i = e.target.querySelector("input"); if (!i.value.trim()) return; v.checklist.push({ texto: i.value.trim(), hecho: false }); i.value = ""; pintaChk(); };
    if (t0) $("#fcm", c).onsubmit = async e => { e.preventDefault(); const ta = e.target.querySelector("textarea"); if (!ta.value.trim()) return;
      try { await Datos.guardar("tarea_comentarios", { tarea_id: t0.id, texto: ta.value.trim() }); notif("Comentario agregado"); abrirTarea({ ...t0, ...leerForm($("#ft", c)), checklist: v.checklist }, proyecto, alGuardar, ps); } catch (err) { fallo(err); } };
    $("#g", c).onclick = ev => { const f = $("#ft", c); if (!f.reportValidity()) return; const d = leerForm(f); d.avance = Number(rango.value); d.checklist = v.checklist;
      if (d.fecha_limite && d.fecha_inicio && d.fecha_limite < d.fecha_inicio) return notif("La fecha límite no puede ser anterior al inicio.", true);
      if (d.estado === "hecha") d.avance = 100;
      conBoton(ev.currentTarget, async () => {
        if (completo) { if (nueva) d.orden = Date.now() / 1e10; await Datos.guardar("tareas", d); }
        else await Datos.actualizarMiTarea(t0.id, { estado: d.estado, avance: d.avance, checklist: d.checklist });
        cerrarCajon(); notif(nueva ? "Tarea creada" : "Tarea actualizada"); refrescarContador(); alGuardar && alGuardar(); }); };
    if (t0 && completo) $("#b", c).onclick = async () => { if (!confirm("¿Eliminar esta tarea y sus comentarios?")) return; try { await Datos.eliminar("tareas", t0.id); cerrarCajon(); refrescarContador(); alGuardar && alGuardar(); } catch (e) { fallo(e); } };
  }

  /* ---------- Enrutador ---------- */
  const VISTAS = { inicio: vInicio, "mis-cartas": vMisCartas, "mi-hoja": vMiHoja, cartas: vCartas, empleados: vEmpleados, crm: vCRM, pagina: vPagina, usuarios: vUsuarios, bitacora: vBitacora, cuenta: vCuenta, "mis-tareas": vMisTareas, proyectos: vPortafolio };
  function ruta() { const p = location.hash.replace(/^#\/?/, "").split("/"); return [p[0] || "inicio", p[1], p[2]]; }
  async function render() {
    const [r, id, sub] = ruta();
    cerrarCajon(); $("#lateral").classList.remove("abierto");
    if (!VISTAS[r] || !puedeVer(r)) { location.hash = "#/inicio"; return; }
    const titulo = (MODULOS.find(m => m.id === r) || { titulo: "Mi cuenta" }).titulo;
    $("#ruta").innerHTML = `Intranet / <b>${titulo}</b>`; document.title = titulo + " · Intranet ADEL Catatumbo";
    marcarMenu();
    $("#vista").innerHTML = `<div class="cargando">Cargando…</div>`;
    try { if (r === "crm" && id) await vContacto(id); else if (r === "proyectos" && id) await vProyecto(id, sub || "tablero"); else await VISTAS[r](); }
    catch (e) { $("#vista").innerHTML = `<div class="msg msg-error">${esc(e.message)}</div>`; }
    window.scrollTo(0, 0);
  }
  function pintarUsuario() { $("#uAv").textContent = iniciales(YO.nombre || YO.correo); $("#uNom").innerHTML = `${esc(YO.nombre || YO.correo)}<small>${ROLES[YO.rol]}</small>`; }

  /* ---------- Arranque ---------- */
  pintarUsuario();
  $("#usuario").onclick = e => { if (!e.target.closest(".menu-usuario")) $("#menuUsuario").classList.toggle("abierto"); };
  document.addEventListener("click", e => { if (!e.target.closest("#usuario")) $("#menuUsuario").classList.remove("abierto"); });
  $("#btnSalir").onclick = async () => { await Datos.salir(); location.replace("index.html"); };
  $("#btnMenu").onclick = () => $("#lateral").classList.toggle("abierto");
  /* cierre de sesión automático tras 30 minutos sin actividad */
  let inactivo; const reloj = () => { clearTimeout(inactivo); inactivo = setTimeout(async () => { await Datos.salir(); alert("Su sesión se cerró por inactividad."); location.replace("index.html"); }, 30 * 60 * 1000); };
  ["click", "keydown", "scroll"].forEach(ev => document.addEventListener(ev, reloj, { passive: true })); reloj();
  window.addEventListener("hashchange", render);
  $("#arranque").remove(); $("#app").classList.remove("oculto");
  await refrescarContador();
  render();
})();
