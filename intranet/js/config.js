/* =========================================================
   CONFIGURACIÓN DE LA INTRANET · ADEL Catatumbo
   ---------------------------------------------------------
   Mientras supabaseUrl y supabaseKey estén vacíos, la intranet
   muestra "en configuración" y no permite ingresar.

   Pegue aquí los datos de su proyecto Supabase
   (Supabase → botón "Connect", o Project Settings → API Keys):
     supabaseUrl  = Project URL        (https://xxxxx.supabase.co)
     supabaseKey  = Publishable key    (empieza por sb_publishable_ ;
                                        en proyectos antiguos: clave "anon")
   Esa clave es pública: es seguro que esté en la página, la protección
   la hace la base de datos.
   ⚠ NUNCA pegue aquí una clave "secret" (sb_secret_) ni "service_role".
   ========================================================= */
window.INTRANET = {
  supabaseUrl: "https://vhltjxphotwntwrfscsi.supabase.co",
  supabaseKey: "sb_publishable_tpc1vOoHIUNJpoJ41Q5cTg_cdXrMLJX",

  /* Módulos opcionales: false = oculto (no aparece en el menú ni se consulta).
     erp: Proyectos (ERP) y Mis tareas. Para activarlo: ejecutar antes en Supabase
     intranet/supabase/02-erp-proyectos.sql y cambiar a true. */
  modulos: {
    erp: false
  },

  /* Quien firma las cartas laborales */
  firmante: {
    nombre: "NOMBRE DEL REPRESENTANTE LEGAL",
    cargo: "Director(a) Ejecutivo(a)"
  },
  ciudad: "Ocaña (Norte de Santander)",
  nit: "901.227.376-8",
  razonSocial: "CORPORACIÓN MIXTA AGENCIA DE DESARROLLO ECONÓMICO LOCAL DEL NORTE DE SANTANDER «ADEL CATATUMBO CON ENFOQUE DE FRONTERA»",
  sitio: "https://adelcatatumbo.org",

  /* Enlaces del módulo "Página web" */
  enlaces: {
    panel: "https://app.pagescms.org",
    vistaPrevia: "",                       // ej. https://edicion--adelcatatumbo.netlify.app
    netlify: "https://app.netlify.com",
    analytics: "https://analytics.google.com",
    github: "https://github.com",
    supabase: "https://supabase.com/dashboard"
  }
};
