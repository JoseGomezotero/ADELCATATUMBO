/* =========================================================
   CARRITO DE COMPRAS · ADEL Catatumbo
   El carrito se guarda en el navegador del visitante y el pedido
   se envía por WhatsApp (o correo) a la agencia. No cobra en línea.
   Número de WhatsApp y opciones de entrega: bloque SITIO en componentes.js
   ========================================================= */
const CLAVE_CARRITO = "adel_carrito_v1";
const pesos = n => "$" + Math.round(n).toLocaleString("es-CO");

const Carrito = {
  items: [],
  cargar(){ try{ this.items = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || []; }catch(e){ this.items = []; } },
  guardar(){ try{ localStorage.setItem(CLAVE_CARRITO, JSON.stringify(this.items)); }catch(e){} this.pintar(); },
  agregar(p, cant=1){
    const it = this.items.find(i=>i.id===p.id);
    if(it) it.cant += cant; else this.items.push({id:p.id, nombre:p.nombre, precio:p.precio, unidad:p.unidad, cant});
    this.guardar(); avisar(`Agregado: ${p.nombre}`);
  },
  cambiar(id, d){ const it=this.items.find(i=>i.id===id); if(!it) return; it.cant+=d; if(it.cant<=0) this.quitar(id); else this.guardar(); },
  quitar(id){ this.items = this.items.filter(i=>i.id!==id); this.guardar(); },
  vaciar(){ this.items = []; this.guardar(); },
  cantidad(){ return this.items.reduce((s,i)=>s+i.cant,0); },
  subtotal(){ return this.items.reduce((s,i)=>s+i.cant*i.precio,0); },
  envio(){ const e = (SITIO.entregas||[]).find(x=>x.id===(document.querySelector('input[name="entrega"]:checked')||{}).value); return e ? e.costo : 0; },

  pintar(){
    const n = this.cantidad();
    document.querySelectorAll(".contador-carrito").forEach(b=>{ b.textContent=n; b.style.display=n?"grid":"none"; });
    const lista = document.getElementById("carritoLista"); if(!lista) return;
    if(!this.items.length){
      lista.innerHTML = `<div class="carrito-vacio"><p>Tu carrito está vacío.</p><a class="btn btn-teal" href="tienda.html">Ir a la tienda</a></div>`;
      document.getElementById("carritoPie").style.display="none"; return;
    }
    document.getElementById("carritoPie").style.display="block";
    lista.innerHTML = this.items.map(i=>`
      <div class="item-carrito">
        <div><b>${i.nombre}</b><small>${pesos(i.precio)} / ${i.unidad}</small></div>
        <div class="cant">
          <button aria-label="Quitar uno" onclick="Carrito.cambiar('${i.id}',-1)">−</button><span>${i.cant}</span><button aria-label="Agregar uno" onclick="Carrito.cambiar('${i.id}',1)">+</button>
        </div>
        <div class="total-item">${pesos(i.precio*i.cant)}<button class="quitar" onclick="Carrito.quitar('${i.id}')">Quitar</button></div>
      </div>`).join("");
    const env = this.envio();
    document.getElementById("carritoTotales").innerHTML = `
      <div><span>Subtotal</span><span>${pesos(this.subtotal())}</span></div>
      <div><span>Entrega</span><span>${env?pesos(env):"Sin costo"}</span></div>
      <div class="gran"><span>Total</span><span>${pesos(this.subtotal()+env)}</span></div>`;
  },

  mensaje(f){
    const sel = document.querySelector('input[name="entrega"]:checked');
    const ent = (SITIO.entregas||[]).find(x=>x.id===(sel&&sel.value));
    const lineas = this.items.map(i=>`• ${i.cant} x ${i.nombre} (${i.unidad}) = ${pesos(i.precio*i.cant)}`).join("\n");
    return `Hola ADEL Catatumbo, quiero hacer este pedido:\n\n${lineas}\n\nSubtotal: ${pesos(this.subtotal())}\nEntrega: ${ent?ent.nombre:""}${ent&&ent.costo?" ("+pesos(ent.costo)+")":""}\nTOTAL: ${pesos(this.subtotal()+(ent?ent.costo:0))}\n\nNombre: ${f.get("nombre")}\nTeléfono: ${f.get("telefono")}\nMunicipio: ${f.get("municipio")}\nDirección: ${f.get("direccion")||"—"}\nPago: ${f.get("pago")}\nNotas: ${f.get("notas")||"—"}`;
  }
};

function avisar(t){
  let a=document.getElementById("aviso"); if(!a){ a=document.createElement("div"); a.id="aviso"; document.body.appendChild(a); }
  a.textContent=t; a.classList.add("ver"); clearTimeout(a._t); a._t=setTimeout(()=>a.classList.remove("ver"),2200);
}
function abrirCarrito(paso){ document.body.classList.add("carrito-abierto"); mostrarPaso(paso||1); }
function cerrarCarrito(){ document.body.classList.remove("carrito-abierto"); }
function mostrarPaso(n){
  document.getElementById("paso1").style.display = n===1?"flex":"none";
  document.getElementById("formPedido").style.display = n===2?"block":"none";
}
function enviarPedido(e, canal){
  e.preventDefault();
  const form = document.getElementById("formPedido");
  if(!form.reportValidity()) return false;
  const msg = Carrito.mensaje(new FormData(form));
  if(canal==="correo") location.href = `mailto:${SITIO.correo}?subject=${encodeURIComponent("Pedido tienda en línea")}&body=${encodeURIComponent(msg)}`;
  else window.open(`https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  avisar("Pedido listo para enviar. Te confirmaremos disponibilidad y pago.");
  return false;
}

/* ---------- Panel lateral del carrito (se inserta en todas las páginas) ---------- */
(function(){
  if (!SITIO.tiendaAbierta) return;   /* tienda cerrada: no se agrega el panel */
  Carrito.cargar();
  const entregas = (SITIO.entregas||[]).map((x,i)=>`<label class="opcion"><input type="radio" name="entrega" value="${x.id}" ${i===0?"checked":""} onchange="Carrito.pintar()"> <span><b>${x.nombre}</b><small>${x.detalle}${x.costo?" · "+pesos(x.costo):" · sin costo"}</small></span></label>`).join("");
  document.body.insertAdjacentHTML("beforeend", `
  <div class="velo" onclick="cerrarCarrito()"></div>
  <aside class="panel-carrito" aria-label="Carrito de compras">
    <div class="panel-cab"><h3>Tu pedido</h3><button aria-label="Cerrar" onclick="cerrarCarrito()">✕</button></div>
    <div id="paso1" class="paso-carrito">
      <div id="carritoLista" class="carrito-lista"></div>
      <div id="carritoPie" class="carrito-pie">
        <p class="sub">Entrega</p>${entregas}
        <div id="carritoTotales" class="totales"></div>
        <button class="btn btn-teal ancho" onclick="mostrarPaso(2)">Continuar con el pedido →</button>
        <button class="vaciar" onclick="if(confirm('¿Vaciar el carrito?'))Carrito.vaciar()">Vaciar carrito</button>
      </div>
    </div>
    <form id="formPedido" class="paso-carrito" style="display:none" onsubmit="return enviarPedido(event,'whatsapp')">
      <div id="paso2" class="paso2">
        <button type="button" class="volver" onclick="mostrarPaso(1)">← Volver al carrito</button>
        <p class="sub">Datos para la entrega</p>
        <label>Nombre completo<input name="nombre" required></label>
        <label>Teléfono / WhatsApp<input name="telefono" required inputmode="tel"></label>
        <label>Municipio<input name="municipio" required placeholder="Ej. Ocaña"></label>
        <label>Dirección (si es a domicilio)<input name="direccion"></label>
        <label>Forma de pago<select name="pago">${(SITIO.pagos||["Efectivo contra entrega"]).map(p=>`<option>${p}</option>`).join("")}</select></label>
        <label>Notas<textarea name="notas" rows="2" placeholder="Horario, indicaciones…"></textarea></label>
        <label class="check"><input type="checkbox" required> Autorizo el tratamiento de mis datos (Ley 1581 de 2012).</label>
        <button class="btn btn-verde ancho" type="submit">Enviar pedido por WhatsApp</button>
        <button class="btn btn-sec ancho" type="button" onclick="enviarPedido(event,'correo')">Enviar por correo</button>
        <p class="letra">Te confirmamos disponibilidad, fecha de entrega y pago antes de despachar.</p>
      </div>
    </form>
  </aside>`);
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") cerrarCarrito(); });
  Carrito.pintar();
})();
