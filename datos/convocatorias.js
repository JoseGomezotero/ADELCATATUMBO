/* ARCHIVO GENERADO AUTOMÁTICAMENTE desde datos/convocatorias.json — no editar aquí.
   Edita el contenido en el panel (app.pagescms.org) o en el .json. */
window.CONVOCATORIAS = [
 {
  "publicado": true,
  "codigo": "ADEL-PRO-003-2026",
  "titulo": "Arrendamiento de oficina operativa en Ocaña",
  "tipo": "Proveedores",
  "estado": "auto",
  "apertura": "2026-10-30",
  "cierre": "2026-11-09",
  "hora_cierre": "23:59",
  "fin_evaluacion": "2026-11-12",
  "prorroga": null,
  "prorroga_documento": null,
  "lugar": "Ocaña (casco urbano)",
  "resumen": "Selección de proveedor para el arrendamiento de una oficina operativa en Ocaña, equipada, con servicios básicos y conectividad a internet, para el proyecto Cebolla ocañera, raíz de paz.",
  "objeto": "ADEL Catatumbo invita a personas naturales o jurídicas a presentar propuestas para el arrendamiento de una oficina operativa en Ocaña, Norte de Santander, dotada del mobiliario y los elementos necesarios, destinada exclusivamente a las actividades del equipo técnico territorial del proyecto.",
  "proyecto": "Cebolla ocañera, raíz de paz: una apuesta por el desarrollo sostenible y el bienestar de las comunidades rurales en el Catatumbo",
  "financiador": "AECID, implementado por ASAD en asocio con la Red ADELCO",
  "presupuesto": "$50.400.000 COP sin IVA (un primer pago por 20 días y 14 pagos mensuales anticipados)",
  "plazo": "14 meses y 20 días, a partir de la suscripción del contrato",
  "imagen": "documentos/convocatorias/ADEL-PRO-003-2026.jpg",
  "terminos": "documentos/convocatorias/ADEL-PRO-003-2026.pdf",
  "correo": "catatumbosistemasadel@gmail.com",
  "asunto": "PROPUESTA ARRENDAMIENTO OFICINA OPERATIVA CEBOLLA OCAÑERA – [nombre]",
  "entregaFisica": "Sobre cerrado en la Calle 4 # 22-43, Barrio Marabel, Ocaña",
  "requisitos": [
   "Cédula (persona natural) o certificado de existencia y representación legal (persona jurídica), de máximo 30 días",
   "RUT actualizado",
   "Antecedentes disciplinarios, fiscales y judiciales vigentes",
   "Certificado de tradición y libertad del inmueble, de máximo 30 días",
   "Inmueble en el casco urbano de Ocaña con servicios públicos e internet de banda ancha",
   "Dotación básica: escritorios, sillas, archivadores y mesas de reunión",
   "Fotografías del inmueble y del mobiliario",
   "Certificación bancaria y paz y salvo del impuesto predial"
  ],
  "cronograma": [
   {
    "actividad": "Publicación de la invitación",
    "fecha": "30 de octubre de 2026"
   },
   {
    "actividad": "Preguntas y aclaraciones",
    "fecha": "Hasta el 2 de noviembre de 2026"
   },
   {
    "actividad": "Respuestas a aclaraciones",
    "fecha": "3 de noviembre de 2026"
   },
   {
    "actividad": "Cierre de recepción de propuestas",
    "fecha": "9 de noviembre de 2026, 11:59 p.m."
   },
   {
    "actividad": "Evaluación de propuestas",
    "fecha": "10 y 11 de noviembre de 2026"
   },
   {
    "actividad": "Comunicación al seleccionado",
    "fecha": "12 de noviembre de 2026"
   },
   {
    "actividad": "Suscripción del contrato",
    "fecha": "A partir del 13 de noviembre de 2026"
   }
  ]
 }
];

(function () {
  var L = window.CONVOCATORIAS || [];
  var ahora;
  try {
    ahora = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(" ", "T");
  } catch (e) { ahora = new Date().toISOString().slice(0, 16); }
  var masDias = function (f, n) { var d = new Date(f + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  L.forEach(function (c) {
    var modo = c.estado || "auto";
    c.estado_config = modo;
    c.cierre_original = c.cierre;
    if (c.prorroga && c.prorroga > (c.cierre || "")) { c.cierre = c.prorroga; c.prorrogada = true; }
    var hora = /^\d{1,2}:\d{2}$/.test(c.hora_cierre || "") ? ("0" + c.hora_cierre).slice(-5) : "23:59";
    var finEval = c.fin_evaluacion && c.fin_evaluacion >= (c.cierre || "") ? c.fin_evaluacion : (c.cierre ? masDias(c.cierre, 7) : "");
    if (modo === "abierta" || modo === "evaluacion" || modo === "cerrada") { c.estado = modo; c.estado_manual = true; return; }
    if (c.apertura && ahora < c.apertura + "T00:00") c.estado = "proxima";
    else if (!c.cierre || ahora <= c.cierre + "T" + hora) c.estado = "abierta";
    else if (ahora <= finEval + "T23:59") c.estado = "evaluacion";
    else c.estado = "cerrada";
  });
})();
