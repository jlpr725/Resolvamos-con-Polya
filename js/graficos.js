/* ============================================================
   GRÁFICOS DE LOS PROBLEMAS
   Cada cantidad se muestra como UN objeto del cuento acompañado
   de su número: «25 🎈». No se repite el objeto 25 veces.

   Es lo que pidieron los docentes y además evita un problema
   pedagógico: si el niño puede contar los dibujos, cuenta en
   lugar de sumar. Con un icono y el número, la cantidad se lee,
   no se cuenta.

   Cuando dos cantidades del mismo objeto deben distinguirse
   (los 26 huevos y el huevo grande), se diferencian por tamaño.
   ============================================================ */

(function () {
  'use strict';

  var RUTA = 'assets/img/obj_';

  function imagen(dato) {
    var tam = dato.tam ? ' data-tam="' + dato.tam + '"' : '';
    return '<img class="objeto" src="' + RUTA + (dato.img || 'globo_rojo') + '.webp" ' +
           'alt=""' + tam + '>';
  }

  /* ---------- Una cantidad: número + objeto + etiqueta ---------- */
  function grupo(dato, opciones) {
    opciones = opciones || {};
    return '<figure class="grupo' + (opciones.clase ? ' ' + opciones.clase : '') + '">' +
             '<div class="grupo__caja">' +
               '<b class="grupo__num">' + dato.v + '</b>' +
               imagen(dato) +
             '</div>' +
             (dato.e ? '<figcaption class="grupo__pie">' + dato.e + '</figcaption>' : '') +
           '</figure>';
  }

  /* ---------- Paso 1: los dos datos ---------- */
  function datosDelProblema(e) {
    return '<div class="grafico grafico--datos">' +
             grupo(e.datos[0]) +
             '<span class="grafico__union">y</span>' +
             grupo(e.datos[1]) +
           '</div>';
  }

  /* ---------- Paso 2: qué significa juntar y qué significa quitar ----------
     Usa los objetos del problema que se está resolviendo, no unos
     genéricos: así el niño relaciona la operación con SU cuento. */
  function miniPlan(e, tipo) {
    var a = e.datos[0], b = e.datos[1];
    /* En la resta se parte siempre de la cantidad mayor */
    if (tipo === 'resta' && b.v > a.v) { var t = a; a = b; b = t; }
    var signo = tipo === 'suma' ? '+' : '−';
    return '<span class="mini">' +
             '<b>' + a.v + '</b>' + imagen(a) +
             '<i class="mini__signo">' + signo + '</i>' +
             '<b>' + b.v + '</b>' + imagen(b) +
           '</span>';
  }

  /* ---------- Paso 3: la operación completa ---------- */
  function operacion(e) {
    var a = e.datos[0], b = e.datos[1];
    if (e.operacion === 'resta' && b.v > a.v) { var t = a; a = b; b = t; }
    return '<div class="grafico grafico--operacion">' +
             grupo(a) +
             '<span class="grafico__signo">' + (e.operacion === 'suma' ? '+' : '−') + '</span>' +
             grupo(b) +
             '<span class="grafico__signo">=</span>' +
             '<span class="grafico__incognita">?</span>' +
           '</div>';
  }

  /* ---------- Paso 4: el resultado ---------- */
  function resultado(e) {
    /* El objeto del resultado es el de la cantidad mayor: en
       «26 huevos − 1 grande = 25 pequeños» el resultado son huevos. */
    var base = e.datos[0].v >= e.datos[1].v ? e.datos[0] : e.datos[1];
    return '<div class="grafico grafico--resultado">' +
             grupo({ v: e.resultado, img: base.img, e: e.unidad || '' },
                   { clase: 'grupo--resultado' }) +
           '</div>';
  }

  window.GRAFICOS = {
    imagen: imagen,
    grupo: grupo,
    datosDelProblema: datosDelProblema,
    miniPlan: miniPlan,
    operacion: operacion,
    resultado: resultado
  };
})();
