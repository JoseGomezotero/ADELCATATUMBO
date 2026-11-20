/* =========================================================
   CONSTRUCCIÓN · ADEL Catatumbo
   Netlify ejecuta este script en cada publicación:
   convierte los archivos datos/*.json (que se editan desde el
   panel Pages CMS) en datos/*.js, que son los que leen las páginas.
   Uso local:  node scripts/construir.js
   No necesita instalar nada.
   ========================================================= */
const fs = require("fs");
const path = require("path");
const raiz = path.join(__dirname, "..");

const ARCHIVOS = {
  "convocatorias": { variable: "CONVOCATORIAS", lista: true },
  "proyectos":     { variable: "PROYECTOS",     lista: true },
  "noticias":      { variable: "NOTICIAS",      lista: true },
  "productos":     { variable: "PRODUCTOS",     lista: true },
  "equipo":        { variable: "EQUIPO",        lista: true },
  "documentos":    { variable: "DOCUMENTOS",    lista: true },
  "paginas-extra": { variable: "PAGINAS_EXTRA", lista: true },
  "paginas":       { variable: "PAGINAS",       lista: false },
  "sitio":         { variable: "SITIO_CMS",     lista: false }
};


/* Estado automático de las convocatorias (se calcula en el navegador de cada
   visitante, con la hora de Colombia, cada vez que abre la página). */
const ESTADO_CONVOCATORIAS = `
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
    var hora = /^\\d{1,2}:\\d{2}$/.test(c.hora_cierre || "") ? ("0" + c.hora_cierre).slice(-5) : "23:59";
    var finEval = c.fin_evaluacion && c.fin_evaluacion >= (c.cierre || "") ? c.fin_evaluacion : (c.cierre ? masDias(c.cierre, 7) : "");
    if (modo === "abierta" || modo === "evaluacion" || modo === "cerrada") { c.estado = modo; c.estado_manual = true; return; }
    if (c.apertura && ahora < c.apertura + "T00:00") c.estado = "proxima";
    else if (!c.cierre || ahora <= c.cierre + "T" + hora) c.estado = "abierta";
    else if (ahora <= finEval + "T23:59") c.estado = "evaluacion";
    else c.estado = "cerrada";
  });
})();
`;

let errores = 0;
for (const [nombre, cfg] of Object.entries(ARCHIVOS)) {
  const origen = path.join(raiz, "datos", nombre + ".json");
  const destino = path.join(raiz, "datos", nombre + ".js");
  let datos;
  try {
    const texto = fs.existsSync(origen) ? fs.readFileSync(origen, "utf8").trim() : "";
    datos = texto ? JSON.parse(texto) : (cfg.lista ? [] : {});
  } catch (e) {
    console.error(`✗ ${nombre}.json tiene un error: ${e.message}`);
    errores++;
    continue;
  }
  if (cfg.lista && !Array.isArray(datos)) datos = [];
  if (cfg.lista) datos = datos.filter(x => x && typeof x === "object" && x.publicado !== false);
  /* documentos de transparencia: solo los que ya tienen su PDF subido */
  if (nombre === "documentos") datos = datos.filter(x => x.archivo && (/^https?:/.test(x.archivo) ||
    fs.existsSync(path.join(raiz, String(x.archivo).replace(/^\//, "")))));
  const js = `/* ARCHIVO GENERADO AUTOMÁTICAMENTE desde datos/${nombre}.json — no editar aquí.\n   Edita el contenido en el panel (app.pagescms.org) o en el .json. */\n` +
             `window.${cfg.variable} = ${JSON.stringify(datos, null, 1)};\n` +
             (nombre === "convocatorias" ? ESTADO_CONVOCATORIAS : "");
  fs.writeFileSync(destino, js);
  console.log(`✓ ${nombre}.js (${cfg.lista ? datos.length + " elementos" : "ok"})`);
}
/* ---------- Vista previa (rama "edicion") ----------
   Netlify: CONTEXT = "production" para adelcatatumbo.org y "branch-deploy" para la rama edicion.
   Cloudflare Pages: CF_PAGES_BRANCH = "main" es producción; cualquier otra rama es vista previa.
   En la vista previa: aviso visible y Google no la indexa. */
const previa = (!!process.env.NETLIFY && process.env.CONTEXT && process.env.CONTEXT !== "production")
  || (!!process.env.CF_PAGES && process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== "main");   /* Cloudflare Pages */
fs.appendFileSync(path.join(raiz, "datos", "sitio.js"), `window.VISTA_PREVIA = ${previa};\n`);
if (previa) {
  fs.appendFileSync(path.join(raiz, "_headers"), "\n/*\n  X-Robots-Tag: noindex, nofollow\n");
  fs.writeFileSync(path.join(raiz, "robots.txt"), "User-agent: *\nDisallow: /\n");
  console.log("✓ Vista previa: aviso activado y bloqueo para buscadores");
}

if (errores) process.exit(1);
