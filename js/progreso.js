/* ============================================================
   Progreso del estudiante — guardado en el propio dispositivo.
   No se envía nada a ningún servidor.

   Cada parte del cuento tiene 4 pasos. Cada paso resuelto da
   1 llave. El porcentaje de la parte premia la puntería:
     · paso resuelto sin fallar → 25 %
     · paso resuelto con fallos → 15 %
   Así una parte terminada vale entre 60 % y 100 %, y el niño
   siempre avanza aunque se equivoque.
   ============================================================ */

(function () {
  'use strict';

  var CLAVE = 'polya.progreso.v2';
  var PASOS_POR_PARTE = 4;

  var vacio = { partes: {}, medallas: [], ultima: null };

  function leer() {
    try {
      var s = localStorage.getItem(CLAVE);
      if (!s) return JSON.parse(JSON.stringify(vacio));
      return Object.assign(JSON.parse(JSON.stringify(vacio)), JSON.parse(s));
    } catch (e) { return JSON.parse(JSON.stringify(vacio)); }
  }
  function guardar(d) {
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) {}
  }

  var P = {
    datos: leer(),

    clave: function (cuento, n) { return cuento + ':' + n; },

    /* { llaves, limpios, porcentaje, terminada } */
    dePart: function (cuento, n) {
      return this.datos.partes[this.clave(cuento, n)] ||
             { llaves: 0, limpios: 0, porcentaje: 0, terminada: false };
    },

    porcentaje: function (cuento, n) { return this.dePart(cuento, n).porcentaje; },
    llavesDeParte: function (cuento, n) { return this.dePart(cuento, n).llaves; },

    /* La parte 1 siempre está abierta; las demás, al terminar la anterior. */
    desbloqueada: function (cuento, n) {
      return n === 1 || this.dePart(cuento, n - 1).terminada;
    },

    llavesDeCuento: function (cuento) {
      var t = 0, d = this.datos.partes;
      Object.keys(d).forEach(function (k) {
        if (k.indexOf(cuento + ':') === 0) t += d[k].llaves;
      });
      return t;
    },

    llavesTotales: function () {
      var t = 0, d = this.datos.partes;
      Object.keys(d).forEach(function (k) { t += d[k].llaves; });
      return t;
    },

    partesTerminadas: function (cuento) {
      var t = 0, d = this.datos.partes;
      Object.keys(d).forEach(function (k) {
        if (k.indexOf(cuento + ':') === 0 && d[k].terminada) t++;
      });
      return t;
    },

    /* Se llama al terminar una parte. `limpios` = pasos resueltos
       a la primera. Solo mejora el registro anterior, nunca lo empeora. */
    registrar: function (cuento, n, limpios) {
      var k = this.clave(cuento, n);
      var pct = Math.round((limpios * 25) + ((PASOS_POR_PARTE - limpios) * 15));
      var previo = this.datos.partes[k];
      if (!previo || pct > previo.porcentaje) {
        this.datos.partes[k] = {
          llaves: PASOS_POR_PARTE, limpios: limpios,
          porcentaje: pct, terminada: true
        };
      } else {
        previo.terminada = true;
        previo.llaves = PASOS_POR_PARTE;
      }
      this.datos.ultima = k;
      guardar(this.datos);
      return this.revisarMedallas(limpios);
    },

    tieneMedalla: function (id) { return this.datos.medallas.indexOf(id) !== -1; },

    revisarMedallas: function (limpios) {
      var nuevas = [], self = this;
      function dar(id) {
        if (!self.tieneMedalla(id)) { self.datos.medallas.push(id); nuevas.push(id); }
      }
      if (this.llavesTotales() > 0) dar('primera');
      if (this.llavesDeCuento('caperucita') >= 20) dar('caperucita');
      if (this.llavesDeCuento('patito') >= 20) dar('patito');
      if (limpios === PASOS_POR_PARTE) dar('perfecto');
      if (this.llavesTotales() >= 40) dar('maestro');
      guardar(this.datos);
      return nuevas;
    },

    reiniciar: function () {
      this.datos = JSON.parse(JSON.stringify(vacio));
      guardar(this.datos);
    }
  };

  window.PROGRESO = P;
})();
