/* =========================================================
   MAPA DE COBERTURA INTERACTIVO · ADEL Catatumbo
   - Límites reales de los municipios (DANE, MGN) en datos/mapa-catatumbo.js
   - Mapas base de Esri (Relieve, Satélite, Calles): no requieren clave.
   - Pasa el mouse o toca un municipio para ver población y área;
     haz clic para acercarte. Botón ⤢ = ver toda la región, ⛶ = pantalla completa.
   ========================================================= */
(function(){
  const cont = document.getElementById("mapa");
  if(!cont) return;
  const D = window.MAPA_CATATUMBO;
  const lista = document.getElementById("listaMunis");
  const num = n => Number(n).toLocaleString("es-CO");

  if(!window.L || !D){ // respaldo si la librería o los datos no cargan
    cont.innerHTML='<iframe title="Mapa Catatumbo" style="width:100%;height:100%;border:0;border-radius:22px" loading="lazy" src="https://www.google.com/maps?q=Oca%C3%B1a,+Norte+de+Santander&z=9&output=embed"></iframe>';
    return;
  }

  const css = getComputedStyle(document.documentElement);
  const teal = css.getPropertyValue("--teal").trim()||"#449890";
  const verde = css.getPropertyValue("--verde").trim()||"#6d9243";
  const pizarra = css.getPropertyValue("--pizarra-osc").trim()||"#1f3b42";

  const feats = D.municipios.features;
  const adel = feats.filter(f=>f.properties.grupo==="adel").sort((a,b)=>(b.properties.sede-a.properties.sede)||a.properties.n.localeCompare(b.properties.n));
  const total = adel.reduce((t,f)=>({pob:t.pob+f.properties.pob, km2:t.km2+f.properties.km2}),{pob:0,km2:0});

  /* ---------- Mapas base (Esri, sin clave) ---------- */
  const esri = (svc, extra) => L.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/${svc}/MapServer/tile/{z}/{y}/{x}`,
    Object.assign({maxZoom:18, attribution:'Mapa base © Esri · Límites: DANE (MGN)'}, extra||{}));
  const capas = {
    "Relieve": esri("World_Topo_Map"),
    "Satélite": L.layerGroup([esri("World_Imagery"), esri("Reference/World_Boundaries_and_Places",{opacity:.9})]),
    "Calles": esri("World_Street_Map")
  };

  const mapa = L.map(cont,{scrollWheelZoom:false, zoomSnap:.25, layers:[capas["Relieve"]], attributionControl:true});
  L.control.layers(capas,null,{position:"topright"}).addTo(mapa);
  L.control.scale({imperial:false, position:"bottomleft"}).addTo(mapa);

  // Rueda del mouse: solo después de hacer clic en el mapa (para no "atrapar" la página)
  mapa.on("click", ()=>mapa.scrollWheelZoom.enable());
  cont.addEventListener("mouseleave", ()=>mapa.scrollWheelZoom.disable());

  /* ---------- Atenuar todo lo que está fuera de Norte de Santander ---------- */
  const anillos = D.departamento.coordinates.map(p=>p[0].map(([x,y])=>[y,x]));
  L.polygon([[[-90,-180],[-90,180],[90,180],[90,-180]], ...anillos],
    {stroke:false, fillColor:"#0e2228", fillOpacity:.28, interactive:false}).addTo(mapa);
  L.geoJSON(D.departamento,{style:{color:pizarra, weight:2.2, fill:false, opacity:.8}, interactive:false}).addTo(mapa);

  /* ---------- Municipios con su forma real ---------- */
  const estilo = f => {
    const p=f.properties;
    if(p.grupo==="adel") return {color:"#fff", weight:2, fillColor:p.sede?verde:teal, fillOpacity:p.sede?.72:.55};
    if(p.grupo==="catatumbo") return {color:verde, weight:1.2, dashArray:"5 5", fillColor:"#9bbf71", fillOpacity:.18};
    return {color:"#7f9aa0", weight:.7, fillColor:"#ffffff", fillOpacity:.08};
  };
  const etiquetaGrupo = p => p.sede ? "Sede de ADEL Catatumbo" : p.grupo==="adel" ? "Municipio con presencia de ADEL" : p.grupo==="catatumbo" ? "Región del Catatumbo" : "Norte de Santander";
  const ficha = p => `<b class="mf-nombre">${p.n}</b><span class="mf-grupo ${p.grupo}">${etiquetaGrupo(p)}</span>
    <dl><dt>Población</dt><dd>${num(p.pob)} hab.</dd><dt>Área</dt><dd>${num(p.km2)} km²</dd><dt>Densidad</dt><dd>${num(Math.round(p.pob/p.km2))} hab./km²</dd></dl>`;

  let fijo = null;
  const capaMun = L.geoJSON(D.municipios,{
    style: estilo,
    onEachFeature: (f, capa) => {
      const p=f.properties;
      if(p.grupo==="adel"){
        capa.bindTooltip(p.n,{permanent:true, direction:"center", className:"etq-muni"+(p.sede?" sede":"")});
      } else {
        capa.bindTooltip(p.n,{sticky:true, className:"etq-hover"});
      }
      capa.on({
        mouseover: e => { e.target.setStyle({weight:3, color:pizarra, fillOpacity:p.grupo==="adel"?.8:.35}); e.target.bringToFront(); info.mostrar(p); },
        mouseout:  e => { if(fijo!==e.target){ capaMun.resetStyle(e.target); } info.mostrar(fijo?fijo.feature.properties:null); },
        click:     e => seleccionar(e.target)
      });
    }
  }).addTo(mapa);

  const capaPorCod = {};
  capaMun.eachLayer(l=>capaPorCod[l.feature.properties.cod]=l);
  const limitesADEL = L.featureGroup(adel.map(f=>capaPorCod[f.properties.cod])).getBounds();
  // deja espacio para el panel de información (arriba a la izquierda) y el mini mapa (abajo a la derecha)
  const margen = () => cont.clientWidth > 640 ? {paddingTopLeft:[220,16], paddingBottomRight:[96,16]} : {paddingTopLeft:[8,96], paddingBottomRight:[8,8]};

  function seleccionar(capa, volar=true){
    if(fijo && fijo!==capa) capaMun.resetStyle(fijo);
    fijo = capa;
    const p = capa.feature.properties;
    capa.setStyle({weight:3.5, color:pizarra, fillOpacity:p.grupo==="adel"?.82:.4}); capa.bringToFront();
    info.mostrar(p);
    if(volar) mapa.flyToBounds(capa.getBounds(),Object.assign({duration:.8, maxZoom:11},margen()));
    document.querySelectorAll("#listaMunis button").forEach(b=>b.classList.toggle("activo", b.dataset.cod===p.cod));
  }
  function verRegion(){
    if(fijo){ capaMun.resetStyle(fijo); fijo=null; }
    document.querySelectorAll("#listaMunis button").forEach(b=>b.classList.remove("activo"));
    info.mostrar(null);
    mapa.flyToBounds(limitesADEL,Object.assign({duration:.8},margen()));
  }

  /* ---------- Panel de información ---------- */
  const info = L.control({position:"topleft"});
  info.onAdd = function(){ this._div = L.DomUtil.create("div","info-mapa"); L.DomEvent.disableClickPropagation(this._div); this.mostrar(null); return this._div; };
  info.mostrar = function(p){
    if(!this._div) return;
    this._div.innerHTML = p ? ficha(p) :
      `<b class="mf-nombre">Cobertura ADEL Catatumbo</b><span class="mf-grupo adel">${adel.length} municipios</span>
       <dl><dt>Población</dt><dd>${num(total.pob)} hab.</dd><dt>Área</dt><dd>${num(total.km2)} km²</dd></dl>
       <small class="mf-ayuda">Pasa el mouse o toca un municipio</small>`;
  };
  info.addTo(mapa);

  /* ---------- Botones: ver región y pantalla completa ---------- */
  const Botones = L.Control.extend({ options:{position:"topright"},
    onAdd(){
      const g=L.DomUtil.create("div","leaflet-bar botones-mapa");
      g.innerHTML='<a href="#" title="Ver toda la región" data-a="region">⤢</a><a href="#" title="Pantalla completa" data-a="full">⛶</a>';
      L.DomEvent.disableClickPropagation(g);
      L.DomEvent.on(g,"click",e=>{ const a=e.target.closest("a"); if(!a) return; L.DomEvent.preventDefault(e);
        if(a.dataset.a==="region") verRegion();
        else { cont.classList.toggle("mapa-full"); document.body.classList.toggle("sin-scroll"); setTimeout(()=>{mapa.invalidateSize(); verRegion();},120); }
      });
      return g; } });
  mapa.addControl(new Botones());
  document.addEventListener("keydown",e=>{ if(e.key==="Escape" && cont.classList.contains("mapa-full")){ cont.classList.remove("mapa-full"); document.body.classList.remove("sin-scroll"); setTimeout(()=>mapa.invalidateSize(),120); } });

  /* ---------- Leyenda ---------- */
  const Leyenda = L.Control.extend({ options:{position:"bottomleft"},
    onAdd(){ const d=L.DomUtil.create("div","leyenda-mapa");
      d.innerHTML=`<span><i style="background:${verde}"></i>Sede (Ocaña)</span>
        <span><i style="background:${teal}"></i>Presencia ADEL</span>
        <span><i class="area" style="border-color:${verde}"></i>Región del Catatumbo</span>
        <span><i class="area" style="border-color:${pizarra};border-style:solid"></i>Norte de Santander</span>`;
      return d; } });
  mapa.addControl(new Leyenda());

  /* ---------- Ubicación en Colombia (mini mapa) ---------- */
  const Ubicacion = L.Control.extend({ options:{position:"bottomright"},
    onAdd(){ const d=L.DomUtil.create("div","ubicacion-mapa"); const c=D.colombia;
      d.innerHTML=`<svg viewBox="0 0 ${c.w} ${c.h}" role="img" aria-label="Ubicación de Norte de Santander en Colombia"><path d="${c.otros}" fill="#dfe7e7" stroke="#fff" stroke-width=".6"/><path d="${c.nds}" fill="${teal}" stroke="${pizarra}" stroke-width="1"/></svg><small>Norte de Santander</small>`;
      return d; } });
  mapa.addControl(new Ubicacion());

  mapa.fitBounds(limitesADEL,margen());

  /* ---------- Lista de municipios (fuera del mapa) ---------- */
  if(lista){
    lista.innerHTML = adel.map(f=>{ const p=f.properties;
      return `<li><button class="${p.sede?'sede':''}" data-cod="${p.cod}"><span>${p.n}${p.sede?' (sede)':''}</span><small>${num(p.pob)} hab.</small></button></li>`; }).join("");
    lista.addEventListener("click",e=>{
      const b=e.target.closest("button"); if(!b) return;
      seleccionar(capaPorCod[b.dataset.cod]);
      if(window.innerWidth<980) cont.scrollIntoView({behavior:"smooth",block:"center"});
    });
  }
})();
