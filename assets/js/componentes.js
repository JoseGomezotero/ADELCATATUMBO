/* =========================================================
   ADEL CATATUMBO · Componentes compartidos
   Aquí se definen el MENÚ, el ENCABEZADO y el PIE DE PÁGINA
   de todas las páginas. Si cambias algo aquí, cambia en todo el sitio.
   ========================================================= */

const SITIO = {
  correo: "catatumbosistemasadel@gmail.com",  // TEMPORAL: cambiar a contacto@adelcatatumbo.org cuando esté activo
  telefono: "+57 300 377 2153",            // TEMPORAL: número que se muestra en el sitio
  direccion: "Calle 6 # 16-41, Ocaña, Norte de Santander",
  facebook: "#", instagram: "#", youtube: "#",
  whatsapp: "573003772153",                // TEMPORAL: 57 + celular, sin espacios ni "+" (recibe los pedidos de la tienda)
  /* TIENDA: true = abierta (muestra productos y carrito)
             false = cerrada (muestra "Muy pronto" y oculta el carrito) */
  tiendaAbierta: false,
  /* Tienda: opciones de entrega y de pago */
  entregas: [
    { id:"sede",     nombre:"Recoger en la sede",  detalle:"Calle 6 # 16-41, Ocaña", costo:0 },
    { id:"ocana",    nombre:"Domicilio en Ocaña",  detalle:"Entrega en 24 a 48 horas",              costo:5000 },
    { id:"regional", nombre:"Envío a otro municipio", detalle:"Costo se confirma por WhatsApp",     costo:0 }
  ],
  pagos: ["Efectivo contra entrega", "Transferencia bancaria", "Nequi", "Daviplata"]
};

/* Los datos que se editan en el panel (datos/sitio.json) reemplazan a los de arriba */
if (window.SITIO_CMS) for (const [k,v] of Object.entries(window.SITIO_CMS)) {
  if (v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && !v.length)) SITIO[k] = v;
}

const correoVisible = () => SITIO.correo_institucional || SITIO.correo;

const MENU = [
  { id:"inicio",        texto:"Inicio",         url:"index.html" },
  { id:"quienes-somos", texto:"Quiénes somos",  url:"quienes-somos.html" },
  { id:"proyectos",     texto:"Proyectos",      url:"proyectos.html" },
  { id:"convocatorias", texto:"Convocatorias",  url:"convocatorias.html", contador:true },
  { id:"tienda",        texto:"Tienda",         url:"tienda.html", pronto:true },
  { id:"noticias",      texto:"Noticias",       url:"noticias.html" },
  { id:"contacto",      texto:"Contáctanos",    url:"contacto.html", cta:true }
];
/* Páginas nuevas creadas en el panel con "Mostrar en el menú" activo */
(window.PAGINAS_EXTRA||[]).filter(p=>p.slug && p.en_menu).forEach(p=>
  MENU.splice(MENU.length-1, 0, { id:"extra-"+p.slug, texto:String(p.menu||p.titulo).replace(/\*/g,"").replace(/[<>&"]/g,""), url:"pagina.html?p="+encodeURIComponent(p.slug) }));

/* ---------- Utilidades ---------- */
const foto = (url, w=1200) => !url ? "" : /images\.unsplash\.com/.test(url) && !/[?&]w=/.test(url) ? `${url}${url.includes("?")?"&":"?"}auto=format&fit=crop&w=${w}&q=72` : url;
const imgTag = (url, alt="", w) => url ? `<img src="${foto(url,w)}" alt="${alt}" loading="lazy" onerror="this.remove()">` : "";
const fmtFecha = d => new Date(d+"T12:00:00").toLocaleDateString("es-CO",{day:"numeric",month:"long",year:"numeric"});
const fmtCorta = d => new Date(d+"T12:00:00").toLocaleDateString("es-CO",{day:"numeric",month:"short",year:"numeric"});
const diasPara = d => { const hoy=new Date(); hoy.setHours(0,0,0,0); return Math.round((new Date(d+"T00:00:00") - hoy)/86400000); };
const param = n => new URLSearchParams(location.search).get(n);

/* ---------- Tarjetas reutilizables ---------- */
const ETQ_CONV = {proxima:"Próximamente", abierta:"Abierta", evaluacion:"En evaluación", cerrada:"Cerrada"};
function postularHref(c){
  const asunto = c.asunto || ("Postulación " + c.codigo);
  return `mailto:${c.correo||correoVisible()}?subject=${encodeURIComponent(asunto)}`;
}
function tarjetaConvocatoria(c){
  const d = diasPara(c.cierre);
  const aviso = c.estado==="abierta" && d>=0 ? ` · ${d===0?"cierra hoy":"quedan "+d+" días"}` : "";
  const detalle = `convocatorias.html?c=${encodeURIComponent(c.codigo)}`;
  const resultados = c.resultados ? `<a class="btn btn-sec" href="${c.resultados}" target="_blank" rel="noopener">Resultados</a>` : "";
  return `<article class="conv${c.imagen?" con-imagen":""}">
    ${c.imagen ? `<a class="conv-img" href="${detalle}"><img src="${c.imagen}" alt="Pieza gráfica ${c.codigo}" loading="lazy"></a>` : ""}
    <div class="top"><span class="tag ${c.estado}">${ETQ_CONV[c.estado]}</span><span class="tipo">${c.tipo}</span></div>
    <h3><a href="${detalle}">${c.titulo}</a></h3><p>${c.resumen}</p>
    <div class="meta"><span><b>Código:</b> ${c.codigo}</span><span><b>Lugar:</b> ${c.lugar}</span><span><b>${c.estado==="proxima"?"Apertura":"Cierre"}:</b> ${c.estado==="proxima"?fmtCorta(c.apertura):fmtCorta(c.cierre)}${c.prorrogada&&c.estado!=="proxima"?' <em class="prorroga">(ampliado)</em>':""}${aviso}</span></div>
    <div class="acciones">
      <a class="btn btn-teal" href="${detalle}">Ver detalle</a>
      <a class="btn btn-sec" href="${c.terminos||'#'}" target="_blank" rel="noopener">Términos (PDF)</a>
      ${c.estado==="abierta" ? `<a class="btn btn-verde" href="${postularHref(c)}">Postularme</a>` : resultados}
    </div></article>`;
}
const ETQ_PROY = {ejecucion:"En ejecución", finalizado:"Finalizado"};
function tarjetaProyecto(p){
  return `<a class="proy-card" href="proyectos.html?id=${p.id}">
    <div class="foto">${imgTag(p.foto,p.titulo,800)}</div>
    <div class="cuerpo"><span class="tag ${p.estado}">${ETQ_PROY[p.estado]}</span>
    <h3>${p.titulo}</h3><p>${p.resumen}</p>
    <div class="meta">${[p.linea,p.municipios].filter(Boolean).join(" · ")}</div></div></a>`;
}
function tarjetaNoticia(n){
  return `<a class="nota" href="noticias.html?id=${n.id}">
    <div class="foto">${imgTag(n.foto,n.titulo,800)}</div>
    <div class="cuerpo"><time>${n.categoria} · ${fmtCorta(n.fecha)}</time>
    <h3>${n.titulo}</h3><p>${n.resumen}</p><span class="mas">Leer más →</span></div></a>`;
}

/* ---------- Encabezado ---------- */
function pintarEncabezado(){
  const actual = document.body.dataset.pagina==="extra" ? "extra-"+param("p") : document.body.dataset.pagina;
  const abiertas = (window.CONVOCATORIAS||[]).filter(c=>c.estado==="abierta").length;
  const items = MENU.filter(m=>m.id!=="tienda" || SITIO.tiendaAbierta).map(m=>`<li><a href="${m.url}" class="${m.cta?'cta ':''}${m.id===actual?'activo':''}">${m.texto}${m.contador&&abiertas?` <span class="badge">${abiertas}</span>`:""}${m.pronto&&!SITIO.tiendaAbierta?` <span class="badge badge-pronto">Pronto</span>`:""}</a></li>`).join("");
  document.getElementById("encabezado").innerHTML = `
  <div class="topbar"><div class="wrap">
    <div class="izq"><span>Ocaña, Norte de Santander</span><span>Miembro de la Red Adelco</span><a class="ingreso-trab" href="intranet/index.html" rel="nofollow">🔒 Ingreso trabajadores</a></div>
    <div>${abiertas?`<a class="pill" href="convocatorias.html">${abiertas} convocatoria${abiertas>1?"s":""} abierta${abiertas>1?"s":""}</a> &nbsp; `:""}<a href="mailto:${correoVisible()}">${correoVisible()}</a></div>
  </div></div>
  <header class="nav"><div class="wrap">
    <a class="logo" href="index.html" aria-label="ADEL Catatumbo - inicio">
      <img src="assets/img/logo-adel-catatumbo.png" alt="Logo ADEL Catatumbo">
      <span><b>ADEL Catatumbo</b><small>Agencia de Desarrollo Económico Local</small></span>
    </a>
    <div class="acciones-nav">
    ${SITIO.tiendaAbierta ? `<button class="btn-carrito" aria-label="Ver carrito" onclick="abrirCarrito()"><svg viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.2a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.5L22 7H6"/></svg><span class="contador-carrito">0</span></button>` : ""}
    <button class="menu-btn" aria-label="Abrir menú" onclick="document.getElementById('menu').classList.toggle('abierto')">☰</button>
    </div>
    <nav><ul id="menu">${items}</ul></nav>
  </div></header>`;
}

/* ---------- Pie de página ---------- */
function pintarPie(){
  document.getElementById("pie").innerHTML = `
  <footer><div class="wrap">
    <div class="grid">
      <div>
        <a class="logo-pie" href="index.html"><img src="assets/img/logo-adel-catatumbo.png" alt="ADEL Catatumbo"></a>
        <p><b>ADEL Catatumbo</b> es la sigla de la ${esc(SITIO.razon_social||"")}, entidad sin ánimo de lucro de Ocaña, Norte de Santander.</p>
        <div class="redes">
          <a href="${SITIO.facebook}" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg></a>
          <a href="${SITIO.instagram}" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.5-9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6zm4 14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4z"/></svg></a>
          <a href="${SITIO.youtube}" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5 31 31 0 0 0 .6 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.5 31 31 0 0 0-.4-4.5zM9.8 15V9l5.2 3z"/></svg></a>
        </div>
      </div>
      <div><h4>La agencia</h4><ul><li><a href="quienes-somos.html">Quiénes somos</a></li><li><a href="quienes-somos.html#cobertura">Cobertura</a></li><li><a href="quienes-somos.html#transparencia">Transparencia</a></li><li><a href="quienes-somos.html#equipo">Equipo</a></li><li><a href="quienes-somos.html#ingreso">Cómo hacer parte</a></li><li><a href="verificar.html">Verificar carta laboral</a></li><li><a href="intranet/index.html" rel="nofollow">Intranet (trabajadores)</a></li></ul></div>
      <div><h4>Nuestro trabajo</h4><ul><li><a href="proyectos.html">Proyectos</a></li><li><a href="convocatorias.html">Convocatorias</a></li>${SITIO.tiendaAbierta?'<li><a href="tienda.html">Tienda</a></li>':''}<li><a href="noticias.html">Noticias</a></li><li><a href="contacto.html">Contacto</a></li></ul></div>
      <div><h4>Contacto</h4><ul><li>${esc(SITIO.direccion)}</li><li><a href="mailto:${correoVisible()}">${correoVisible()}</a></li><li>${esc(SITIO.telefono)}</li><li><a href="https://redadelco.org" target="_blank" rel="noopener">Red Adelco ↗</a></li></ul></div>
    </div>
    <div class="identidad">
      <p><b>${esc(SITIO.razon_social||"")}</b> (${esc(SITIO.nombre_corto||"ADEL Catatumbo")})</p>
      <p>NIT ${esc(SITIO.nit||"")} · ${esc(SITIO.naturaleza||"")} · Dirección: ${esc(SITIO.direccion)} · Tel. ${esc(SITIO.telefono)} · ${correoVisible()} · <a href="quienes-somos.html#datos-entidad">Datos de la entidad</a></p>
    </div>
    <div class="legal"><span>© ${new Date().getFullYear()} ADEL Catatumbo. Todos los derechos reservados.</span><span><a href="quienes-somos.html#transparencia">Transparencia y documentos legales</a> · Algunas fotografías: Unsplash</span></div>
  </div></footer>`;
}

/* ---------- Formularios (abren el correo) ---------- */
function enviarContacto(e){
  e.preventDefault(); const f=new FormData(e.target);
  const asunto=encodeURIComponent(`Contacto web – ${f.get('tipo')} – ${f.get('nombre')}`);
  const cuerpo=encodeURIComponent(`Nombre: ${f.get('nombre')}\nCorreo: ${f.get('correo')}\nTeléfono: ${f.get('telefono')||''}\nMunicipio: ${f.get('municipio')||''}\nTipo: ${f.get('tipo')}\n\n${f.get('mensaje')}`);
  location.href=`mailto:${correoVisible()}?subject=${asunto}&body=${cuerpo}`; return false;
}
function suscribir(e){
  e.preventDefault(); const c=new FormData(e.target).get('correo');
  location.href=`mailto:${correoVisible()}?subject=${encodeURIComponent('Suscripción a convocatorias')}&body=${encodeURIComponent('Deseo recibir alertas de convocatorias en: '+c)}`; return false;
}


/* =========================================================
   CONTENIDO EDITABLE DESDE EL PANEL (Pages CMS)
   datos/paginas.json  → textos del encabezado de cada página
                          y SECCIONES NUEVAS
   datos/equipo.json, datos/documentos.json → Quiénes somos
   ========================================================= */
const esc = t => String(t??"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sinMarcas = t => String(t??"").replace(/\*/g,"");
const resaltar = t => esc(t).replace(/\*(.+?)\*/g, "<span>$1</span>");

/* Convierte texto del editor (HTML o Markdown sencillo) en HTML seguro */
function textoRico(t){
  t = String(t||"").trim(); if(!t) return "";
  if(!/^\s*</.test(t)){                       // Markdown sencillo
    const linea = x => esc(x).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\*(.+?)\*/g,"<i>$1</i>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2">$1</a>');
    t = t.split(/\n{2,}/).map(b=>{
      const ls=b.split("\n");
      if(ls.every(l=>/^\s*[-*•]\s+/.test(l))) return "<ul>"+ls.map(l=>"<li>"+linea(l.replace(/^\s*[-*•]\s+/,""))+"</li>").join("")+"</ul>";
      if(/^#{1,3}\s/.test(b)) return "<h3>"+linea(b.replace(/^#+\s*/,""))+"</h3>";
      return "<p>"+ls.map(linea).join("<br>")+"</p>";
    }).join("");
  }
  const tpl=document.createElement("template"); tpl.innerHTML=t;
  tpl.content.querySelectorAll("script,style,iframe,object,embed,form,link,meta").forEach(n=>n.remove());
  tpl.content.querySelectorAll("*").forEach(n=>[...n.attributes].forEach(a=>{
    if(/^on/i.test(a.name) || (/^(href|src)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))) n.removeAttribute(a.name);
  }));
  tpl.content.querySelectorAll('a[href^="http"]').forEach(a=>{a.target="_blank";a.rel="noopener";});
  return tpl.innerHTML;
}
const idYoutube = u => (String(u||"").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)||[])[1];

/* Dibuja una sección creada en el panel */
function seccionHTML(s, i){
  const fondo = {suave:"bg-suave", oscuro:"cms-oscuro", verde:"cms-verde"}[s.fondo] || "";
  const cab = (s.eyebrow||s.titulo) ? `<div class="${s.tipo==="texto_imagen"?"":"centro"}">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:""}${s.titulo?`<h2 class="h2">${resaltar(s.titulo)}</h2>`:""}</div>` : "";
  const texto = s.texto ? `<div class="cms-texto">${textoRico(s.texto)}</div>` : "";
  const boton = s.boton_texto && s.boton_enlace ? `<div class="hero-btns"><a class="btn ${s.fondo==="oscuro"||s.fondo==="verde"?"btn-blanco":"btn-verde"}" href="${esc(s.boton_enlace)}"${/^https?:/.test(s.boton_enlace)?' target="_blank" rel="noopener"':""}>${esc(s.boton_texto)}</a></div>` : "";
  let cuerpo = "";
  switch(s.tipo){
    case "texto_imagen":
      cuerpo = `<div class="cms-fila ${s.lado_imagen==="izquierda"?"img-izq":""}"><div>${cab}${texto}${boton}</div>
        <div class="cms-foto">${s.imagen?`<img src="${esc(foto(s.imagen,1000))}" alt="${esc(sinMarcas(s.titulo))}" loading="lazy">`:""}</div></div>`; break;
    case "tarjetas":
      cuerpo = `${cab}${texto}<div class="cms-tarjetas">${(s.tarjetas||[]).map(t=>{
        const inner=`${t.imagen?`<div class="cms-tfoto"><img src="${esc(foto(t.imagen,700))}" alt="" loading="lazy"></div>`:""}<div class="cms-tcuerpo"><h3>${esc(t.titulo)}</h3>${t.texto?`<p>${esc(t.texto)}</p>`:""}${t.enlace?`<span class="cms-mas">Ver más →</span>`:""}</div>`;
        return t.enlace?`<a class="cms-tarjeta" href="${esc(t.enlace)}">${inner}</a>`:`<div class="cms-tarjeta">${inner}</div>`;}).join("")}</div>${boton}`; break;
    case "galeria":
      cuerpo = `${cab}${texto}<div class="cms-galeria">${(s.galeria||[]).filter(Boolean).map(g=>`<a href="${esc(g)}" target="_blank"><img src="${esc(foto(g,600))}" alt="" loading="lazy"></a>`).join("")}</div>${boton}`; break;
    case "video": {
      const id=idYoutube(s.video);
      cuerpo = `${cab}${texto}${id?`<div class="cms-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${esc(sinMarcas(s.titulo)||"Video")}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`:""}${boton}`; break; }
    case "llamado":
      cuerpo = `<div class="unete"><div><h2>${resaltar(s.titulo||"")}</h2>${s.texto?textoRico(s.texto):""}</div><div class="btns">${s.boton_texto&&s.boton_enlace?`<a class="btn btn-blanco" href="${esc(s.boton_enlace)}">${esc(s.boton_texto)}</a>`:""}</div></div>`; break;
    default:
      cuerpo = `<div class="cms-angosto">${cab}${texto}${s.imagen?`<div class="cms-foto ancha"><img src="${esc(foto(s.imagen,1400))}" alt="" loading="lazy"></div>`:""}${boton}</div>`;
  }
  return `<section class="cms-sec ${fondo}" id="${esc(s.ancla||"seccion-"+(i+1))}"><div class="wrap">${cuerpo}</div></section>`;
}
function pintarSecciones(lista, alInicio, alFinal){
  (lista||[]).forEach((s,i)=>{
    if(!s || s.visible===false) return;
    const html = seccionHTML(s,i);
    if(s.ubicacion==="inicio" && alInicio) alInicio.insertAdjacentHTML("beforebegin", html);
    else if(alFinal) alFinal.insertAdjacentHTML("beforebegin", html);
  });
}

function aplicarCMS(){
  const pag = (document.body.dataset.pagina||"").replace(/-/g,"_");
  const datos = (window.PAGINAS||{})[pag];
  const hero = document.querySelector("section.hero, section.banner");
  const pie = document.getElementById("pie");
  if(datos && hero){
    const set=(sel,val,fn)=>{ const el=hero.querySelector(sel); if(el && val) fn(el,val); };
    set(".eyebrow", datos.eyebrow, (el,v)=>el.textContent=v);
    set("h1", datos.titulo, (el,v)=>el.innerHTML=resaltar(v));
    set("h1 + p", datos.texto, (el,v)=>el.textContent=v);
    if(datos.imagen){
      let f=hero.querySelector(".foto"); if(!f){ hero.insertAdjacentHTML("afterbegin",'<div class="foto"></div>'); f=hero.querySelector(".foto"); }
      const im=f.querySelector("img");
      if(im) im.src=foto(datos.imagen,2000); else f.innerHTML=`<img src="${esc(foto(datos.imagen,2000))}" alt="" onerror="this.remove()">`;
      const cr=hero.querySelector(".credito"); if(cr && !/unsplash/.test(datos.imagen)) cr.remove();
    }
  }
  document.querySelectorAll("[data-cms]").forEach(el=>{ const v=datos&&datos[el.dataset.cms]; if(v) el.textContent=v; });
  /* Quiénes somos: equipo y documentos */
  const eq=document.querySelector(".equipo");
  if(eq && Array.isArray(window.EQUIPO)) eq.innerHTML = window.EQUIPO.map(p=>{
    const ini=(p.nombre||"").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
    return `<div class="persona">${p.foto?`<img class="avatar" src="${esc(foto(p.foto,300))}" alt="${esc(p.nombre)}" loading="lazy">`:`<div class="avatar">${esc(ini)}</div>`}<h4>${esc(p.nombre)}</h4><span>${esc(p.cargo)}</span></div>`;}).join("");
  const docs=document.querySelector(".docs");
  if(docs && Array.isArray(window.DOCUMENTOS) && !window.DOCUMENTOS.filter(d=>d.archivo).length)
    docs.outerHTML = `<div class="docs-solicitud"><p>Los documentos legales de la entidad (certificado de existencia y representación legal de la Cámara de Comercio, RUT, estatutos y estados financieros) están disponibles a solicitud.</p><a class="btn btn-teal" href="mailto:${correoVisible()}?subject=${encodeURIComponent("Solicitud de documentos legales ADEL Catatumbo")}">Solicitar documentos</a></div>`;
  else if(docs && Array.isArray(window.DOCUMENTOS)) docs.innerHTML = window.DOCUMENTOS.filter(d=>d.archivo).map(d=>{
    const ext=(d.archivo.split(".").pop()||"").toUpperCase().slice(0,4);
    return `<a class="doc" href="${esc(d.archivo)}" target="_blank"><span class="ext">${esc(ext)}</span><span><b>${esc(d.titulo)}</b><span>${esc(d.detalle||"")}</span></span></a>`;}).join("");
  /* Secciones nuevas */
  if(datos && hero) pintarSecciones(datos.secciones, hero.nextElementSibling, pie);
}

pintarEncabezado();
pintarPie();
if (window.VISTA_PREVIA) document.body.insertAdjacentHTML("afterbegin",
  `<div class="aviso-previa">👁 <b>Vista previa</b> — estos cambios todavía no están publicados en adelcatatumbo.org. Para publicarlos usa el botón «Publicar» del panel.</div>`);
if (document.body.dataset.pagina !== "extra") aplicarCMS();
