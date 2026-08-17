/* ============================================================
   Sonido: música de ambiente + voz + efectos.

   · La música suena en bucle, bajita, y NO compite con la voz:
     cuando Martín o Pólya hablan, la música baja sola (ducking)
     y vuelve a subir al terminar.
   · En la portada y en las instrucciones suena un poco más alto,
     porque ahí no hay narración.
   · Un solo interruptor silencia todo.
   ============================================================ */

(function () {
  'use strict';

  var VOL = {
    ambiente:   0.34,   // portada, instrucciones, menús
    juego:      0.16,   // dentro de un capítulo
    agachada:   0.05    // mientras alguien habla
  };
  var SUAVE = 900;      // milisegundos de transición de volumen

  var S = {
    activo: true,
    musica: null,
    voz: null,
    nivelBase: VOL.juego,
    alTerminarVoz: null,
    alCambiarEstado: null,   // lo usa la interfaz para repintar botones

    /* ---------- música ---------- */
    iniciarMusica: function () {
      if (this.musica) return;
      this.musica = new Audio('assets/audio/musica-fondo.mp3');
      this.musica.loop = true;
      this.musica.volume = 0;
      var self = this;
      this.musica.play().then(function () {
        self.subirA(self.activo ? self.nivelBase : 0);
      }).catch(function () {
        /* Los navegadores exigen un gesto del usuario: se reintenta al primer clic. */
        var reintento = function () {
          document.removeEventListener('pointerdown', reintento);
          if (!self.musica) return;
          self.musica.play().then(function () {
            self.subirA(self.activo ? self.nivelBase : 0);
          }).catch(function () {});
        };
        document.addEventListener('pointerdown', reintento, { once: true });
      });
    },

    ambiente: function (fuerte) {
      this.nivelBase = fuerte ? VOL.ambiente : VOL.juego;
      if (!this.hablando()) this.subirA(this.activo ? this.nivelBase : 0);
    },

    subirA: function (destino) {
      var m = this.musica; if (!m) return;
      var desde = m.volume, ini = performance.now();
      if (this._anim) cancelAnimationFrame(this._anim);
      var self = this;
      (function paso(t) {
        var k = Math.min((t - ini) / SUAVE, 1);
        m.volume = Math.max(0, Math.min(1, desde + (destino - desde) * k));
        if (k < 1) self._anim = requestAnimationFrame(paso);
      })(ini);
    },

    /* ---------- voz ---------- */
    hablando: function () { return !!(this.voz && !this.voz.paused); },

    reproducirVoz: function (ruta, alTerminar) {
      this.pararVoz();
      if (!ruta) { if (alTerminar) alTerminar(); return false; }
      this.voz = new Audio(ruta);
      this.voz.volume = this.activo ? 1 : 0;
      this.alTerminarVoz = alTerminar || null;
      var self = this;
      this.voz.onended = function () {
        self.voz = null;
        self.subirA(self.activo ? self.nivelBase : 0);
        if (self.alTerminarVoz) self.alTerminarVoz();
        if (self.alCambiarEstado) self.alCambiarEstado();
      };
      this.subirA(this.activo ? VOL.agachada : 0);
      this.voz.play().catch(function () {});
      if (this.alCambiarEstado) this.alCambiarEstado();
      return true;
    },

    pausarVoz: function () {
      if (this.voz && !this.voz.paused) this.voz.pause();
      this.subirA(this.activo ? this.nivelBase : 0);
      if (this.alCambiarEstado) this.alCambiarEstado();
    },

    reanudarVoz: function () {
      if (!this.voz) return false;
      this.voz.play().catch(function () {});
      this.subirA(this.activo ? VOL.agachada : 0);
      if (this.alCambiarEstado) this.alCambiarEstado();
      return true;
    },

    pararVoz: function () {
      if (this.voz) { this.voz.pause(); this.voz = null; }
      this.subirA(this.activo ? this.nivelBase : 0);
      if (this.alCambiarEstado) this.alCambiarEstado();
    },

    /* ---------- interruptor general ---------- */
    alternarTodo: function () {
      this.activo = !this.activo;
      if (this.voz) this.voz.volume = this.activo ? 1 : 0;
      this.subirA(this.activo ? (this.hablando() ? VOL.agachada : this.nivelBase) : 0);
      try { localStorage.setItem('polya.sonido', this.activo ? '1' : '0'); } catch (e) {}
      if (this.alCambiarEstado) this.alCambiarEstado();
      return this.activo;
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
