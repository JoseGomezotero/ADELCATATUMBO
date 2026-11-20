/* Convierte un número entero en letras (español), en mayúsculas. Ej.: 2500000 → "DOS MILLONES QUINIENTOS MIL" */
function numeroALetras(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  const U = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE",
    "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO",
    "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
  const D = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const C = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
  const decenas = x => x < 30 ? U[x] : D[Math.floor(x / 10)] + (x % 10 ? " Y " + U[x % 10] : "");
  const centenas = x => x === 100 ? "CIEN" : (C[Math.floor(x / 100)] + " " + decenas(x % 100)).trim();
  const miles = x => { const m = Math.floor(x / 1000), r = x % 1000; return ((m === 0 ? "" : m === 1 ? "MIL" : apocope(centenas(m)) + " MIL") + " " + centenas(r)).trim(); };
  const apocope = t => t.replace(/VEINTIUNO$/, "VEINTIÚN").replace(/UNO$/, "UN");
  if (n === 0) return "CERO";
  const mill = Math.floor(n / 1e6), resto = n % 1e6;
  let t = "";
  if (mill) t = mill === 1 ? "UN MILLÓN" : apocope(miles(mill)) + " MILLONES";
  if (resto) t += " " + miles(resto);
  else if (mill) t += " DE";  /* "DOS MILLONES DE PESOS" */
  return t.trim();
}
if (typeof module !== "undefined") module.exports = numeroALetras;
