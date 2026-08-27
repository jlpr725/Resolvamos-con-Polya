/* ============================================================
   Sonido: voces, fanfarria y efectos.

   Ya no hay música de fondo: distraía y competía con la
   narración. Solo suenan las voces, el festejo de fin de
   capítulo y los pitidos de acierto y error.
   ============================================================ */

(function () {
  'use strict';

  var VOL_FESTEJO = 0.55;   // fanfarria al terminar un capítulo

  var S = {
    activo: true,
    voz: null,
    alTerminarVoz: null,
    alCambiarEstado: null,   // lo usa la interfaz para repintar botones

    /* ---------- voz ---------- */
    hablando: function () { return !!(this.voz && !this.voz.paused); },

    reproducirVoz: function (ruta, alTerminar) {
      this.pararVoz();
      if (!ruta) { if (alTerminar) alTerminar(); return false; }
      this.voz = new Audio(ruta);
      this.voz.volume = this.activo ? 1 : 0;
      this.alTerminarVoz = alTerminar || null;
      var self = this;
      var yaCerrado = false;

      /* El encadenado del cuento depende de que esto se llame SIEMPRE.
         Si el archivo no existe o el navegador bloquea la reproducción,
         `onended` nunca dispararía y la secuencia se quedaría colgada:
         por eso se cierra también ante un error. */
      function cerrar () {
        if (yaCerrado) return;
        yaCerrado = true;
        self.voz = null;
        if (self.alTerminarVoz) self.alTerminarVoz();
        if (self.alCambiarEstado) self.alCambiarEstado();
      }

      this.voz.onended = cerrar;
      this.voz.onerror = cerrar;

      this.voz.play().catch(function () { cerrar(); });
      if (this.alCambiarEstado) this.alCambiarEstado();
      return true;
    },

    pausarVoz: function () {
      if (this.voz && !this.voz.paused) this.voz.pause();
      if (this.alCambiarEstado) this.alCambiarEstado();
    },

    reanudarVoz: function () {
      if (!this.voz) return false;
      this.voz.play().catch(function () {});
      if (this.alCambiarEstado) this.alCambiarEstado();
      return true;
    },

    pararVoz: function () {
      if (this.voz) { this.voz.pause(); this.voz = null; }
      if (this.alCambiarEstado) this.alCambiarEstado();
    },

    /* ---------- fanfarria de fin de capítulo ----------
       Suena primero el festejo y, cuando termina, entra la voz de
       Martín cerrando el capítulo. Así no se pisan. */
    festejar: function (vozDespues) {
      var self = this;
      if (!this.activo) return;
      var f = new Audio('assets/audio/festejo.mp3');
      f.volume = VOL_FESTEJO;
      f.onended = function () {
        if (vozDespues) self.reproducirVoz(vozDespues);

      };
      f.play().catch(function () {
        /* Si el navegador bloquea el audio, la voz igual debe sonar */
        if (vozDespues) self.reproducirVoz(vozDespues);
      });
    },

    /* ---------- efectos ---------- */
    pitido: (function () {
      var ctx = null;
      return function (tipo) {
        if (!S.activo) return;
        try {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          var notas = tipo === 'bien' ? [523, 659, 784]
                    : tipo === 'mal'  ? [392, 311]
                    : tipo === 'llave'? [659, 880, 1047] : [660];
          notas.forEach(function (f, i) {
            var o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = f;
            o.connect(g); g.connect(ctx.destination);
            var t = ctx.currentTime + i * 0.1;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.13, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
            o.start(t); o.stop(t + 0.24);
          });
        } catch (e) {}
      };
    })()
  };

  try { S.activo = localStorage.getItem('polya.sonido') !== '0'; } catch (e) {}
  window.SONIDO = S;
})();
