/* =========================================================
   MEDICIÓN · Google Tag Manager / Google Analytics 4 · ADEL Catatumbo
   ---------------------------------------------------------
   GTM_ID: contenedor de Google Tag Manager (empieza por GTM-).
           Dentro de Tag Manager se configura la etiqueta de Google
           Analytics 4 y lo demás, sin tocar el sitio.
   GA_ID:  solo si NO se usa Tag Manager: ID de Analytics (G-...).
   Si ambos están vacíos, no se mide nada.
   La intranet NO carga este archivo (privacidad de los trabajadores).
   ========================================================= */
const GA_ID  = "G-Q8G562T5W1";   // Google Analytics 4 de ADEL Catatumbo (activo)
const GTM_ID = "";               // Tag Manager disponible: "GTM-53LJKG3Z". Si lo activa, configure
                                 // la etiqueta de GA4 dentro de Tag Manager y deje GA_ID vacío,
                                 // para no contar dos veces cada visita.

(function(){
  const usaGTM = /^GTM-[A-Z0-9]{4,}$/.test(GTM_ID) && !GA_ID;
  const usaGA = !usaGTM && /^G-[A-Z0-9]{6,}$/.test(GA_ID);
  if(!usaGTM && !usaGA) return;

  const CLAVE = "adel_cookies_v1";
  const leer = () => { try { return localStorage.getItem(CLAVE); } catch(e){ return null; } };
  const guardar = v => { try { localStorage.setItem(CLAVE, v); } catch(e){} };

  /* --- Google tag con modo de consentimiento: no guarda cookies hasta que el visitante acepte --- */
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  const eleccion = leer();
  gtag("consent", "default", {
    analytics_storage: eleccion === "si" ? "granted" : "denied",
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied"
  });
  gtag("set", "url_passthrough", false);
  const s = document.createElement("script");
  s.async = true;
  if(usaGTM){
    dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
  } else {
    gtag("js", new Date());
    gtag("config", GA_ID);
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  }
  document.head.appendChild(s);

  /* --- Eventos útiles para ADEL --- */
  /* Con Tag Manager los eventos llegan como "Evento personalizado" (dataLayer);
     con GA4 directo, como eventos de gtag. */
  const evento = (nombre, datos) => usaGTM ? dataLayer.push(Object.assign({ event: nombre }, datos || {})) : gtag("event", nombre, datos || {});
  document.addEventListener("click", e => {
    const a = e.target.closest("a, button"); if(!a) return;
    const href = a.getAttribute("href") || "";
    const texto = (a.textContent || "").trim().slice(0, 60);
    if(href.includes("wa.me"))                evento("clic_whatsapp", {texto});
    else if(href.startsWith("mailto:"))       evento("clic_correo", {texto});
    else if(/\.pdf($|\?)/i.test(href))        evento("descarga_pdf", {archivo: href.split("/").pop()});
    else if(href.includes("convocatorias.html?c=")) evento("ver_convocatoria", {codigo: decodeURIComponent(href.split("c=")[1]||"")});
    else if(a.matches(".agregar .btn"))       evento("agregar_carrito", {texto});
  }, true);
  document.addEventListener("submit", e => evento("enviar_formulario", {formulario: e.target.className || "formulario"}), true);

  /* --- Aviso de cookies (Ley 1581 de 2012) --- */
  if(eleccion) return;
  const mostrar = () => {
    const b = document.createElement("div");
    b.className = "aviso-cookies";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Uso de cookies");
    b.innerHTML = `<p>Usamos cookies de Google Analytics para conocer cómo se usa el sitio y mejorarlo. No vendemos ni compartimos tus datos.</p>
      <div><button class="btn btn-sec" data-c="no">Rechazar</button><button class="btn btn-teal" data-c="si">Aceptar</button></div>`;
    b.addEventListener("click", e => {
      const btn = e.target.closest("button[data-c]"); if(!btn) return;
      const v = btn.dataset.c; guardar(v);
      gtag("consent", "update", {analytics_storage: v === "si" ? "granted" : "denied"});
      if(usaGTM) dataLayer.push({ event: "consentimiento_actualizado", analitica: v });
      b.remove();
    });
    document.body.appendChild(b);
  };
  if(document.body) mostrar(); else document.addEventListener("DOMContentLoaded", mostrar);
})();
