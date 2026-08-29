/* ============================================================
   Resolvamos con Pólya — PWA
   Recorrido: portada → instrucciones → cuentos → capítulos
              → narración → llamada a Pólya → 4 pasos → festejo
   ============================================================ */

(function () {
'use strict';

let D = window.DATOS, P = window.PROGRESO, G = window.GRAFICOS, SND = window.SONIDO;
let vista     = document.getElementById('vista');
let cabecera  = document.getElementById('cabecera');
let cabLogo   = document.getElementById('cabeceraLogo');
let titulo    = document.getElementById('tituloVista');
let subtitulo = document.getElementById('subVista');
let contador  = document.getElementById('contador');
let totalLl   = document.getElementById('totalLlaves');
let btnPolya  = document.getElementById('btnPolya');
let pieFijo   = document.getElementById('pieFijo');
let btnAtras  = document.getElementById('btnAtras');
let btnInfo   = document.getElementById('btnInfo');
let modal     = document.getElementById('modal');
let modalCaja = document.getElementById('modalCaja');

let IMG = 'assets/img/';
let regreso = null;      // a dónde volver al cerrar las instrucciones
let slider  = null;      // temporizador del carrusel de imágenes

/* Estado de la sesión: dónde está el niño y cómo va el capítulo. */
let est = { pantalla:'portada', cuento:null, parte:null, bloque:0,
            paso:1, fallos:0, limpios:0, falloPaso:false,
            avisoListo:false,      // el aviso «llamemos a Pólya» ya se puede mostrar
            explicando:false,      // mostrando la tarjeta del paso
            cierreSonado:false };  // el desenlace del cuento ya sonó

function esc(s){ return String(s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function icono(n){ return '<span class="material-symbols-rounded">' + n + '</span>'; }
function cuentoPorId(id){
  for (let i=0;i<D.CUENTOS.length;i++) if (D.CUENTOS[i].id===id) return D.CUENTOS[i];
  return null;
}
function parteActual(){
  let c = cuentoPorId(est.cuento); if (!c) return null;
  for (let i=0;i<c.escenas.length;i++) if (c.escenas[i].n===est.parte) return c.escenas[i];
  return null;
}
function mezclar(a){
  a=a.slice();
  for (let i=a.length-1;i>0;i--){ let j=Math.floor(Math.random()*(i+1)); let t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}

/* ---------------- Audio ---------------- */
let pitido = function (t) { SND.pitido(t); };

SND.alCambiarEstado = function () {
  let sonando = SND.hablando();
  let b = document.getElementById('btnPlay');
  if (b) {
    let i = b.querySelector('.material-symbols-rounded');
    if (i) i.textContent = sonando ? 'pause' : 'play_arrow';
    b.setAttribute('aria-label', sonando ? 'Pausar la narración' : 'Escuchar la narración');
  }
  let ia = document.getElementById('iconoVozAyuda');
  if (ia) ia.textContent = sonando ? 'pause' : 'play_arrow';
  let ta = document.getElementById('textoVozAyuda');
  if (ta) ta.textContent = sonando ? 'Pausar' : 'Escuchar a Martín';
  let ip = document.getElementById('iconoOirPolya');
  if (ip) ip.textContent = sonando ? 'pause' : 'play_arrow';
  let tp = document.getElementById('textoOirPolya');
  if (tp) tp.textContent = sonando ? 'Pausar' : 'Escuchar';
};

function rutaVoz(tipo){
  return D.VOCES[est.cuento+':'+est.parte+':'+tipo] || D.VOCES_COMPLETAS.narracion;
}
/* El bloque actual: 0 = la historia, 1 = el problema. */
function tipoBloque(){ return est.bloque === 0 ? 'narracion' : 'problema'; }

function confeti(){
  let cols=['#e06b38','#f5b731','#4f9d69','#d94f4f','#5b8fd4'];
  let caja=document.createElement('div'); caja.className='confeti';
  for(let i=0;i<48;i++){
    let s=document.createElement('span');
    s.style.left=Math.random()*100+'%';
    s.style.background=cols[i%cols.length];
    s.style.animationDuration=(1.6+Math.random()*1.4)+'s';
    s.style.animationDelay=(Math.random()*.5)+'s';
    caja.appendChild(s);
  }
  document.body.appendChild(caja);
  setTimeout(function(){ caja.remove(); },3400);
}

/* ============================================================
   CARRUSEL DE IMÁGENES DEL CUENTO
   Las imágenes van cambiando mientras Martín narra. Los tiempos
   viven en datos.js (campo `seg` de cada diapositiva), así que
   sincronizar con una grabación nueva es solo cambiar números.
   Si se pausa la voz, el carrusel se pausa en el mismo punto y
   continúa desde ahí: imagen y audio nunca se desincronizan.
   ============================================================ */
function slidesDe(e, tipo){
  let propias = e.slides && e.slides[tipo];
  return propias && propias.length ? propias : D.SLIDES_POR_DEFECTO[tipo];
}

function pararSlider(){
  slider = null;
}

function sincronizarSlider(){
  if(!slider || !SND.voz) return;
  let tiempoActual = SND.voz.currentTime;
  let tiempoAcumulado = 0;
  let indiceActual = 0;
  
  for(let i = 0; i < slider.lista.length; i++) {
    tiempoAcumulado += slider.lista[i].seg;
    if (tiempoActual < tiempoAcumulado || i === slider.lista.length - 1) {
      indiceActual = i;
      break;
    }
  }
  
  if (indiceActual !== slider.i) {
    slider.i = indiceActual;
    mostrarSlide();
  }
}

function mostrarSlide(){
  let caja = document.getElementById('lienzoSlide');
  if (!caja || !slider) return;
  caja.innerHTML = '<img src="'+slider.lista[slider.i].img+'" alt="">';
}

function arrancarSlider(lista){
  pararSlider();
  slider = { lista: lista, i: 0 };
  mostrarSlide();
}

/* La narración manda: al reproducir corre el carrusel, al pausar se detiene. */
/* ============================================================
   EL CUENTO DE CORRIDO
   Martín narra la historia; al terminar su voz, la pantalla pasa
   sola al problema y sigue leyendo. Cuando termina el problema
   aparece el aviso para llamar a Pólya. Se siente como un cuento
   continuo en vez de tres pasos sueltos.
   ============================================================ */
function alternarNarracion(){
  if (SND.hablando()){ SND.pausarVoz(); pararAutoScroll(); return; }
  if (SND.voz){ SND.reanudarVoz(); arrancarAutoScroll(); return; }
  reproducirBloque();
}

function reproducirBloque(){
  let e = parteActual(); if (!e) return;
  let tipo = tipoBloque();
  arrancarSlider(slidesDe(e, tipo));
  arrancarAutoScroll();
  SND.reproducirVoz(rutaVoz(tipo), alTerminarBloque);
  if(SND.voz) {
    SND.voz.addEventListener('timeupdate', sincronizarSlider);
  }
}

function alTerminarBloque(){
  pararAutoScroll();
  if (est.pantalla !== 'narracion') return;

  let e = parteActual(); if (!e) return;
  let ultimo = est.bloque >= bloquesDe(e).length - 1;

  if (!ultimo){
    /* Terminó la historia: pasa solo al problema y sigue narrando. */
    est.bloque++;
    transicion(verNarracion);
    setTimeout(function(){
      if (est.pantalla === 'narracion') reproducirBloque();
    }, 1100);
    return;
  }

  /* Terminó el problema: ahora sí se invita a llamar a Pólya. */
  mostrarAvisoPolya();
}

function mostrarAvisoPolya(){
  if (est.avisoListo) return;
  est.avisoListo = true;
  if (est.pantalla === 'narracion') transicion(verNarracion);
  setTimeout(function(){ pitido('bien'); }, SALIDA);
}

function alternarVozSimple(ruta){
  if (SND.hablando()) return SND.pausarVoz();
  if (SND.voz) return SND.reanudarVoz();
  SND.reproducirVoz(ruta);
}

/* ============================================================
   DESPLAZAMIENTO AUTOMÁTICO DEL TEXTO (móvil)
   Cuando el cuento no cabe en pantalla, baja solo mientras
   Martín narra, para que el niño no tenga que arrastrar.
   Se detiene si el niño toca el texto, y sigue al soltarlo.
   VELOCIDAD: píxeles por segundo. Súbelo si va lento,
   bájalo si va rápido.
   ============================================================ */
let VELOCIDAD_TEXTO = 14;      // px por segundo
let ESPERA_INICIAL   = 2500;   // ms antes de empezar a bajar

let autoScroll = { id:null, caja:null, manual:false };

function pararAutoScroll(){
  if (autoScroll.id) cancelAnimationFrame(autoScroll.id);
  autoScroll.id = null;
}

function arrancarAutoScroll(){
  pararAutoScroll();
  let caja = document.getElementById('textoCuento');
  if (!caja) return;
  if (caja.scrollHeight <= caja.clientHeight + 4) return;   // cabe entero
  autoScroll.caja = caja;
  autoScroll.manual = false;

  caja.addEventListener('pointerdown', function(){ autoScroll.manual = true; });

  let inicio = performance.now() + ESPERA_INICIAL;
  let base = caja.scrollTop;
  (function paso(t){
    if (!document.getElementById('textoCuento')) return;
    if (!autoScroll.manual && t > inicio){
      let avance = (t - inicio) / 1000 * VELOCIDAD_TEXTO;
      caja.scrollTop = base + avance;
      if (caja.scrollTop + caja.clientHeight >= caja.scrollHeight - 2) return;
    }
    autoScroll.id = requestAnimationFrame(paso);
  })(performance.now());
}

/* ---------------- Chrome de la pantalla ---------------- */
function chrome(op){
  op = op || {};
  cabecera.hidden = !op.cabecera;
  cabLogo.hidden  = !op.logo;
  titulo.textContent = op.titulo || '';
  subtitulo.hidden = !op.sub;
  subtitulo.textContent = op.sub || '';
  contador.hidden = !op.llaves;
  totalLl.textContent = est.cuento ? P.llavesDeCuento(est.cuento) : P.llavesTotales();
  btnPolya.hidden = !op.polya;
  btnPolya.dataset.activo = op.polyaActivo ? '1' : '0';
  pieFijo.hidden = !op.pie;
  btnAtras.hidden = !op.atras;
  if (SND.alCambiarEstado) SND.alCambiarEstado();
}

function pintar(html){
  vista.innerHTML = html;
  vista.classList.remove('vista'); void vista.offsetWidth; vista.classList.add('vista');
}

/* ============================================================
   TRANSICIÓN SUAVE
   Para los cambios encadenados del cuento (historia → problema →
   aviso). El contenido actual se desvanece, se reemplaza mientras
   no se ve, y entra el nuevo. Sin esto el salto es seco.
   ============================================================ */
let SALIDA = 260;   // milisegundos del desvanecido

function transicion(dibujar){
  let caja = vista.firstElementChild;
  if (!caja){ dibujar(); return; }
  caja.classList.add('saliendo');
  setTimeout(function(){
    dibujar();
    let nueva = vista.firstElementChild;
    if (nueva){
      nueva.classList.add('entrando');
      setTimeout(function(){ nueva.classList.remove('entrando'); }, 40);
    }
  }, SALIDA);
}

/* ============================================================
   1. PORTADA
   ============================================================ */
function verPortada(){
  SND.pararVoz(); pararSlider(); pararAutoScroll(); est.pantalla='portada'; est.cuento=null;
  chrome({});
  pintar(
    '<div class="portada">' +
      '<img class="portada__logo" src="'+IMG+'logo.webp" alt="Resolvamos con Pólya">' +
      '<p class="portada__desc">'+esc(D.APP.descripcion)+'</p>' +
      '<button class="btn btn--grande" data-ir="cuentos">'+icono('play_arrow')+' Iniciar</button>' +
      '<button class="enlace" data-ir="instrucciones">' +
        '<span class="enlace__i">'+icono('help')+'</span> Conoce cómo usar la herramienta</button>' +
    '</div>' +
    '<p class="portada__creditos">'+esc(D.APP.autoria)+'</p>');
}

/* ============================================================
   2. INSTRUCCIONES
   ============================================================ */
function verInstrucciones(desde){
  /* Guarda dónde estaba el usuario: el botón de volver del pie lo devuelve
     exactamente al mismo punto. */
  if (desde !== false && est.pantalla !== 'instrucciones'){
    let d = JSON.parse(JSON.stringify(est));
    regreso = function(){
      est = d;
      switch(d.pantalla){
        case 'portada':    return verPortada();
        case 'cuentos':    return verCuentos();
        case 'capitulos':  return verCapitulos(d.cuento);
        case 'narracion':  return verNarracion();
        case 'reto':       return verPaso();
        default:           return verPortada();
      }
    };
  }
  SND.pararVoz(); pararSlider(); pararAutoScroll();
  est.pantalla='instrucciones';
  chrome({ cabecera:true, logo:true, titulo:'Cómo se usa', pie:true, atras:true });
  let I = D.INSTRUCCIONES;

  /* Punto 12: el saludo de Martín encabeza la pantalla y trae su
     propio botón de play/pausa. */
  let h = '<div class="bloque saludo">' +
      '<img class="saludo__cara" src="'+(D.MARTIN_RETRATO || IMG+'martin.webp')+'" alt="Martín">' +
      '<div class="saludo__cuerpo">' +
        '<p class="bloque__texto">'+esc(I.consejo)+'</p>' +
        '<button class="btn btn--claro btn--audio" id="btnVozAyuda">' +
          '<span class="material-symbols-rounded" id="iconoVozAyuda">play_arrow</span>' +
          '<span id="textoVozAyuda">Escuchar a Martín</span></button>' +
      '</div>' +
    '</div>';

  h += '<div class="bloque">' +
      '<h2 class="bloque__titulo">'+esc(I.objetivo.titulo)+'</h2>' +
      '<p class="bloque__texto">'+esc(I.objetivo.texto)+'</p></div>';

  h += '<div class="bloque"><h2 class="bloque__titulo">El recorrido, paso a paso</h2>' +
       '<div class="pasos-lista">';
  I.recorrido.forEach(function(r){
    h += '<div class="paso-num"><span class="paso-num__n">'+r.n+'</span>' +
         '<span class="paso-num__txt"><b>'+esc(r.titulo)+'</b>' +
         '<span>'+esc(r.texto)+'</span></span></div>';
  });
  h += '</div></div>';

  h += '<div class="bloque"><h2 class="bloque__titulo">Los botones y qué hacen</h2>' +
       '<div class="iconos-lista">';
  I.iconos.forEach(function(i){
    let caja = i.icono==='vpn_key'
      ? '<span class="icono-fila__caja"><img src="'+IMG+'llave.svg" alt=""></span>'
      : i.icono==='inventory_2'
      ? '<span class="icono-fila__caja"><img src="'+IMG+'tesoro.webp" alt=""></span>'
      : i.icono==='psychology'
      ? '<span class="icono-fila__caja"><img src="'+IMG+'avance-llamada.webp" alt=""></span>'
      : '<span class="icono-fila__caja">'+icono(i.icono)+'</span>';
    h += '<div class="icono-fila">'+caja+
         '<span class="icono-fila__txt"><b>'+esc(i.nombre)+'</b>' +
         '<span>'+esc(i.texto)+'</span></span></div>';
  });
  h += '</div></div>';

  /* Punto 14: en lugar del botón de volver, la firma del autor. */
  h += '<p class="firma">Powered by ' +
       '<a href="https://joseloportfolio.netlify.app/" target="_blank" rel="noopener">origen</a></p>';

  pintar('<div class="centrado">'+h+'</div>');

  /* La voz de Martín arranca sola al entrar. */
  if (SND.activo) reproducirVozAyuda();
}

function reproducirVozAyuda(){
  SND.reproducirVoz(D.VOCES_COMPLETAS.ayuda || D.VOCES_COMPLETAS.narrador, pintarVozAyuda);
  pintarVozAyuda();
}
function pintarVozAyuda(){
  let i = document.getElementById('iconoVozAyuda');
  let t = document.getElementById('textoVozAyuda');
  let sonando = SND.hablando();
  if (i) i.textContent = sonando ? 'pause' : 'play_arrow';
  if (t) t.textContent = sonando ? 'Pausar' : 'Escuchar a Martín';
}

/* ============================================================
   3. SELECCIÓN DE CUENTO
   ============================================================ */
function verCuentos(){
  SND.pararVoz(); pararSlider(); pararAutoScroll(); est.pantalla='cuentos'; est.cuento=null;
  chrome({ cabecera:true, logo:true, llaves:true, pie:true, atras:true });
  cabLogo.hidden = true;

  let h = '<div style="text-align:center;margin-bottom:clamp(8px,1.6vh,18px)">' +
      '<img src="'+IMG+'logo.webp" alt="Ir a la portada" class="logo-enlace" data-ir="portada" ' +
      'style="width:clamp(110px,18vh,230px)"></div>' +
    '<p class="intro">'+esc(D.SELECTOR_INTRO_NUEVO)+'</p>' +
    '<div class="cuentos">';
  D.CUENTOS.forEach(function(c){
    let hechas = P.partesTerminadas(c.id);
    h += '<button class="cuento" data-cuento="'+c.id+'">' +
      '<span class="cuento__marco"><img src="'+c.portada+'" alt=""></span>' +
      '<span class="cuento__nombre">'+esc(c.titulo)+'</span>' +
      '<span class="cuento__estado">'+P.llavesDeCuento(c.id)+' de '+D.LLAVES_POR_CUENTO+
      ' llaves · '+hechas+'/'+c.escenas.length+' partes</span>' +
      '</button>';
  });
  h += '</div>';
  pintar('<div class="centrado">'+h+'</div>');
}

/* ============================================================
   4. AVANCE DEL CUENTO (capítulos + camino al tesoro)
   ============================================================ */
function verCapitulos(id, animar){
  SND.pararVoz(); pararSlider(); pararAutoScroll();
  est.pantalla='capitulos'; est.cuento=id;
  let c = cuentoPorId(id); if(!c) return verCuentos();
  chrome({ cabecera:true, llaves:true, pie:true, atras:true });

  let llaves = P.llavesDeCuento(id), tope = D.LLAVES_POR_CUENTO;

  let h = '<div style="text-align:center;margin-bottom:clamp(6px,1.2vh,14px)">' +
      '<img src="'+IMG+'logo.webp" alt="Ir a la portada" class="logo-enlace" data-ir="portada" ' +
      'style="width:clamp(90px,15vh,190px)"></div>' +
    '<h2 class="titulo-cuento">'+esc(c.titulo)+'</h2>' +
    '<p class="intro">Selecciona un capítulo y sigue ganando llaves.<br>' +
      '¿Sabes cuántas llaves te faltan para abrir el tesoro?</p>' +
    '<div class="capitulos">';

  c.escenas.forEach(function(e){
    let libre = P.desbloqueada(id, e.n);
    let p = P.porcentaje(id, e.n);
    h += '<button class="capitulo" data-parte="'+e.n+'"'+(libre?'':' data-bloqueado="1"')+
      ' aria-label="Capítulo '+e.n+': '+esc(e.rotulo)+
      (libre ? ', '+p+' por ciento completado' : ', bloqueado')+'">' +
      '<span class="capitulo__relleno" data-w="'+(libre?p:0)+'"></span>' +
      '<span class="capitulo__nombre">'+(libre?'':icono('lock')+' ')+'Capítulo '+e.n+'</span>' +
      '<span class="capitulo__pct">'+(libre?p+'%':'')+'</span></button>';
  });
  h += '</div>' + caminoHTML(llaves, tope, llaves>=tope);

  pintar('<div class="centrado">'+h+'</div>');
  setTimeout(animarCamino, animar ? 380 : 60);
}

/* ============================================================
   5. LA NARRACIÓN DEL CUENTO
   ============================================================ */
function bloquesDe(e){
  return [
    { titulo: e.titulo, texto: e.narracion, img: e.arte, tipo:'narracion' },
    { titulo: 'Y entonces…', texto: e.problema, img: e.arte, tipo:'problema', destacar:e.pregunta }
  ];
}

function empezarParte(id, n){
  est.cuento=id; est.parte=n; est.bloque=0;
  est.paso=1; est.fallos=0; est.limpios=0; est.falloPaso=false;
  est.avisoListo=false; est.cierreSonado=false; est.explicando=false;
  verNarracion();
}

function verNarracion(){
  est.pantalla='narracion';
  let c = cuentoPorId(est.cuento), e = parteActual();
  if(!e) return verCapitulos(est.cuento);
  let bl = bloquesDe(e), b = bl[est.bloque];
  let ultimo = est.bloque === bl.length-1;

  chrome({ cabecera:true, logo:true, titulo:c.titulo,
           sub:e.rotulo+' – Capítulo '+e.n, llaves:true,
           polya:true, polyaActivo:est.avisoListo, pie:true, atras:true });

  let texto = esc(b.texto);
  if (b.destacar) texto = texto.replace(esc(b.destacar), '<b>'+esc(b.destacar)+'</b>');

  /* El aviso de Pólya sale del globo: así el globo se ajusta al texto
     y el aviso puede colocarse donde estorbe menos. */
  let avisoPolya = est.avisoListo
    ? '<div class="aviso-polya">' +
        '<img src="'+IMG+'avance-llamada.webp" alt="">' +
        '<p><b>¡Ya conocemos el problema!</b> Vamos a llamar al profesor Pólya. ' +
        'Toca el botón que se encendió arriba '+icono('arrow_upward')+'</p>' +
      '</div>'
    : '';

  pintar(
    '<div class="escena">' +
      '<div class="escena__ilustracion" id="lienzoSlide"></div>' +
      '<div class="escena__centro">' +
        '<div class="globo-cuento">' +
          '<h2 class="globo-cuento__titulo">'+esc(b.titulo)+'</h2>' +
          '<div class="globo-cuento__scroll" id="textoCuento">' +
            '<p class="globo-cuento__texto">'+texto+'</p>' +
          '</div>' +
        '</div>' +
        avisoPolya +
      '</div>' +
      '<div class="martin">' +
        '<img class="martin__figura" src="'+IMG+'martin.webp" alt="Martín">' +
        '<div class="martin__controles">' +
          '<button class="martin__btn" id="btnPrev" aria-label="Parte anterior del cuento"'+
            (est.bloque===0?' disabled':'')+'>'+icono('fast_rewind')+'</button>' +
          '<button class="martin__btn" id="btnPlay" aria-label="Escuchar la narración">'+
            icono('play_arrow')+'</button>' +
          '<button class="martin__btn" id="btnNext" aria-label="Siguiente parte"'+
            (ultimo?' disabled':'')+'>'+icono('fast_forward')+'</button>' +
        '</div>' +
      '</div>' +
    '</div>');

  arrancarSlider(slidesDe(e, est.bloque===0 ? 'narracion' : 'problema'), false);
}

function moverBloque(d){
  let e = parteActual(); if(!e) return;
  let bl = bloquesDe(e);
  let n = est.bloque + d;
  if (n<0 || n>=bl.length) return;
  SND.pararVoz(); pararSlider(); pararAutoScroll();
  est.bloque = n;
  /* Si llega al problema por su cuenta (sin escuchar el audio o
     saltándolo), el aviso se muestra igual: nadie debe quedarse
     encerrado esperando una voz que quizá no exista. */
  if (n >= bl.length - 1) est.avisoListo = true;
  pitido('clic');
  verNarracion();
}

/* ============================================================
   6. LA APARICIÓN DE PÓLYA
   ============================================================ */
function abrirPolya(){
  SND.pararVoz(); pararSlider(); pararAutoScroll();

  /* Tarjeta de presentación: figura, nombre, lo que dice y los dos
     botones. Los cuatro pasos ya no se listan aquí: cada uno se
     explica en su momento, justo antes de resolverlo. */
  modalCaja.innerHTML =
    '<div class="polya-modal">' +
      '<img class="polya-modal__figura" src="'+IMG+'polya.webp" alt="Profesor Pólya">' +
      '<div class="polya-modal__lado">' +
        '<h2 class="polya-modal__nombre" id="modalTitulo">George Pólya</h2>' +
        '<p class="globo">'+esc(D.POLYA_ASESOR.presentacion)+'</p>' +
        '<div class="acciones">' +
          '<button class="btn btn--claro" id="btnOirPolya">' +
            '<span class="material-symbols-rounded" id="iconoOirPolya">play_arrow</span>' +
            '<span id="textoOirPolya">Escuchar</span></button>' +
          '<button class="btn" id="btnResolver">Vamos a resolverlo '+icono('arrow_forward')+'</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  modal.hidden = false;

  /* Su voz arranca sola al llamarlo: el niño no tiene que buscar el botón. */
  if (SND.activo) SND.reproducirVoz(D.VOCES_COMPLETAS.polya);
}

function cerrarModal(){ modal.hidden = true; SND.pararVoz(); pararSlider(); pararAutoScroll(); }

/* ============================================================
   7. LA RESOLUCIÓN, PASO A PASO
   ============================================================ */
function verPaso(){
  est.pantalla='reto';
  let c = cuentoPorId(est.cuento), e = parteActual();
  if(!e) return verCapitulos(est.cuento);
  let p = D.PASOS[est.paso-1];

  chrome({ cabecera:true, logo:true, titulo:c.titulo,
           sub:'Capítulo '+est.parte+' · Paso '+est.paso+' de 4 · '+p.nombre,
           llaves:true, pie:true, atras:true });

  /* Antes de que el niño pueda tocar nada, Pólya explica el paso.
     Es la tarjeta «Así resuelvo el problema» del original. */
  if (est.explicando) return explicarPaso(e, p);

  let tira = tiraDePasos();

  /* --- Lo que va DENTRO del panel: solo pasos y enunciado --- */
  let panel = '', fuera = '';

  if (est.paso===1){
    panel = '<p class="rotulo">El problema</p>' +
            '<p class="enunciado">'+esc(e.problema)+'</p>';
    let opciones = mezclar(
      e.datos.map(function(d){ return { v:d.v, e:d.e, bueno:1 }; })
        .concat(e.distractores.map(function(d){ return { v:d.v, e:d.e, bueno:0 }; })));
    fuera = '<p class="pregunta">¿Cuáles son los datos que sí importan?</p>' +
      '<div class="fichas">' + opciones.map(function(o){
        return '<button class="ficha" data-num="'+o.v+'" data-bueno="'+o.bueno+'">' +
               '<b>'+o.v+'</b><span>'+esc(o.e)+'</span></button>';
      }).join('') + '</div>';
  }

  if (est.paso===2){
    panel = '<p class="rotulo">La pregunta</p>' +
            '<p class="pregunta">'+esc(e.pregunta)+'</p>' +
            '<p class="rotulo">Tus datos</p>' +
            G.datosDelProblema(e);
    fuera = '<p class="pregunta">¿Qué operación vas a realizar?</p>' +
      '<div class="opciones opciones--par">' +
        '<button class="opcion opcion--plan" data-plan="suma"><span class="opcion__letra">+</span>' +
          '<span class="opcion__cuerpo">Juntar las dos cantidades' +
          '<small>los reúno para saber cuántos hay en total</small>' +
          G.miniPlan(e,'suma') + '</span></button>' +
        '<button class="opcion opcion--plan" data-plan="resta"><span class="opcion__letra">−</span>' +
          '<span class="opcion__cuerpo">Debes quitar una cantidad de otra.' +
          '<small>tienes una cantidad y necesitas quitar una parte</small>' +
          G.miniPlan(e,'resta') + '</span></button>' +
      '</div>';
  }

  if (est.paso===3){
    panel = '<p class="rotulo">Tu plan</p>' +
            '<div class="cuenta">'+esc(e.cuenta)+' <em>= ?</em></div>' +
            G.operacion(e);
    fuera = '<p class="pregunta">'+esc(e.pregunta)+'</p>' +
      '<div class="opciones opciones--par">' + e.opciones.map(function(o,k){
        return '<button class="opcion" data-opcion="'+k+'">' +
          '<span class="opcion__letra">'+'ab'[k]+'</span><span>'+esc(o)+'</span></button>';
      }).join('') + '</div>';
  }

  if (est.paso===4){
    panel = '<p class="rotulo">Lo que respondiste</p>' +
            '<div class="cuenta">'+esc(e.cuenta)+' <em>= '+e.resultado+'</em></div>' +
            G.resultado(e) +
            '<p class="enunciado">'+esc(e.opciones[e.correcta])+'</p>';
    fuera = '<p class="pregunta">¿Tu respuesta responde la pregunta?</p>' +
      '<div class="opciones opciones--par">' +
        '<button class="opcion" data-revisar="1"><span class="opcion__letra">'+icono('check')+'</span>' +
          '<span>Sí, revisé la cuenta y responde la pregunta</span></button>' +
        '<button class="opcion" data-revisar="0"><span class="opcion__letra">'+icono('replay')+'</span>' +
          '<span>Quiero leer el problema otra vez</span></button>' +
      '</div>';
  }

  /* Punto 10: la ilustración y el enunciado arriba; las opciones y la
     retroalimentación abajo, fuera del contenedor de texto. */
  /* En el último capítulo, el paso 4 es también el desenlace del cuento:
     ahí suena el cierre antes de pasar a la celebración. */
  if (est.paso === 4){
    let cierre = D.VOCES[est.cuento+':'+est.parte+':cierre'];
    if (cierre && SND.activo && !est.cierreSonado){
      est.cierreSonado = true;
      setTimeout(function(){
        if (est.pantalla === 'reto') SND.reproducirVoz(cierre);
      }, 600);
    }
  }

  pintar(
    '<div class="reto">' +
      '<div class="reto__arriba">' +
        '<div class="reto__ilustracion"><img src="'+e.arte+'" alt=""></div>' +
        '<div class="reto__panel">' + tira + panel + '</div>' +
      '</div>' +
      '<div class="reto__abajo">' + fuera +
        '<div id="pista"></div>' +
      '</div>' +
    '</div>');
}

/* La tira de pastillas de siempre. Con `hablando`, la pastilla del
   paso actual respira: da la sensación de que Pólya habla a través
   de ella, sin añadir ningún elemento extra. */
function tiraDePasos(hablando){
  return '<div class="pasos-tira">' + D.PASOS.map(function(p){
    let estado = p.n===est.paso ? ' data-activo="1"'
               : (p.n<est.paso ? ' data-hecho="1"' : '');
    if (hablando && p.n===est.paso) estado += ' data-hablando="1"';
    return '<div class="pasos-tira__item"'+estado+' title="'+esc(p.nombre)+'">' +
           icono(p.icono) + '<span>'+esc(p.corto)+'</span></div>';
  }).join('') + '</div>';
}

/* Tarjeta de explicación del paso, con la voz de Pólya. */
function explicarPaso(e, p){
  let puntos = (p.puntos || []).map(function(x){
    return '<li class="punto">' +
             '<span class="punto__icono">'+icono(x.icono)+'</span>' +
             '<span class="punto__texto">'+esc(x.texto)+'</span>' +
           '</li>';
  }).join('');

  /* Misma estructura de dos columnas que el resto del ejercicio:
     la ilustración a la izquierda y, a la derecha, las pastillas
     con la explicación debajo. */
  pintar(
    '<div class="reto">' +
      '<div class="reto__ilustracion"><img src="'+e.arte+'" alt=""></div>' +
      '<div class="reto__panel reto__panel--explica">' +
        tiraDePasos(true) +
        '<div class="explica">' +
          '<h2 class="explica__titulo">'+esc(D.PASOS_TITULO)+'</h2>' +
          '<p class="explica__paso">'+esc(p.titulo)+'</p>' +
          '<ul class="explica__puntos">'+puntos+'</ul>' +
        '</div>' +
        '<button class="btn btn--verde explica__boton" id="btnEmpezarPaso">' +
          'Continuar '+icono('arrow_forward')+'</button>' +
      '</div>' +
    '</div>');

  /* La explicación hablada solo en los dos primeros capítulos de cada
     cuento: ahí el niño está aprendiendo el método. Después ya lo conoce
     y volver a escucharlo lo demora. La tarjeta con el texto y los iconos
     sigue apareciendo siempre, en los cuatro pasos de todos los capítulos. */
  var CAPITULOS_CON_VOZ = 2;
  if (SND.activo && p.voz && est.parte <= CAPITULOS_CON_VOZ) {
    SND.reproducirVoz(p.voz);
  }
}

/* ============================================================
   RETROALIMENTACIÓN
   Nunca se dice solo "está mal": se explica en qué fijarse.
   El aviso se queda en pantalla el tiempo suficiente para que el
   docente pueda comentarlo, con una barra que muestra cuánto
   falta y un botón para seguir antes si ya se entendió.
   ============================================================ */
/* El avance entre pasos es siempre manual: el niño (o el docente)
   decide cuándo seguir con el botón Continuar. */

function pista(tipo, texto, alSeguir){
  let caja = document.getElementById('pista'); if(!caja) return;

  caja.innerHTML =
    '<div class="pista" data-tipo="'+tipo+'">' +
      '<img class="pista__cara" src="'+IMG+'avance-llamada.webp" alt="">' +
      '<div class="pista__cuerpo">' +
        '<p>'+texto+'</p>' +
        (alSeguir
          ? '<div class="pista__seguir">' +
              '<button class="btn btn--pequeno" id="btnSeguir">Continuar '+
                icono('arrow_forward')+'</button>' +
            '</div>'
          : '') +
      '</div>' +
    '</div>';

  if (alSeguir) caja._seguir = alSeguir;
}

function seguirAhora(fn){
  let caja = document.getElementById('pista');
  if (caja) caja._seguir = null;
  fn();
}

function llaveGanada(){
  let caja = document.getElementById('pista'); if(!caja) return;
  SND.pitido('llave');
  let cuerpo = caja.querySelector('.pista__cuerpo') || caja;
  cuerpo.insertAdjacentHTML('afterbegin',
    '<div class="llave-premio"><img src="'+IMG+'llave.svg" alt="">¡Ganaste una llave!</div>');
  totalLl.textContent = P.llavesDeCuento(est.cuento) + est.paso;
}

function pasarDePaso(){
  if(!est.falloPaso) est.limpios++;
  est.falloPaso = false;
  est.paso++;
  if (est.paso>4) return festejar();
  est.explicando = true;    /* el siguiente paso vuelve a explicarse */
  verPaso();
}

/* ============================================================
   8. FESTEJO Y AVANCE
   ============================================================ */
function festejar(){
  let c = cuentoPorId(est.cuento), e = parteActual();
  let nuevas = P.registrar(est.cuento, est.parte, est.limpios);
  pitido('bien'); confeti();

  let llaves = '';
  for (let i=0;i<4;i++) llaves += '<img src="'+IMG+'llave.svg" alt="">';

  let animo = est.limpios===4
    ? '¡Perfecto! Resolviste los cuatro pasos sin equivocarte. Pólya estaría muy orgulloso de ti.'
    : est.limpios>=2
    ? '¡Muy bien! Te equivocaste en algún paso, pero volviste a intentarlo y lo lograste. Así se aprende de verdad.'
    : '¡Lo lograste! Al principio costó, pero seguiste los cuatro pasos hasta el final. Eso es lo importante.';

  let ultimo = est.parte === c.escenas.length;
  let siguiente = ultimo ? null : est.parte + 1;
  let total = P.llavesDeCuento(est.cuento);
  let tope  = D.LLAVES_POR_CUENTO;
  let tesoroAbierto = total >= tope;

  chrome({ cabecera:true, logo:true, titulo:'¡Capítulo '+est.parte+' completado!',
           llaves:true, pie:true, atras:true });

  let h = '<div class="festejo">';

  if (tesoroAbierto){
    h += '<h2 class="festejo__titulo">¡Abriste el tesoro!</h2>' +
      '<div class="tesoro-final">' +
        '<img class="tesoro-final__cofre" src="'+IMG+'cofre_abierto.webp" alt="Tesoro abierto">' +
      '</div>' +
      '<p class="festejo__texto"><b>¡Reuniste las '+tope+' llaves de '+esc(c.titulo)+'!</b><br>' +
      'Aprendiste a leer con atención, a pensar un plan antes de calcular, a resolver ' +
      'con calma y a revisar tu respuesta. Eso es exactamente lo que hacen los ' +
      'matemáticos de verdad. ¡Felicitaciones!</p>';
  } else {
    h += '<img class="festejo__martin" src="'+IMG+'martin.webp" alt="Martín">' +
      '<h2 class="festejo__titulo">¡Ganaste 4 llaves!</h2>' +
      '<div class="festejo__llaves">'+llaves+'</div>' +
      '<p class="festejo__texto">'+esc(animo)+'</p>';
  }

  /* El camino al tesoro, siempre visible al terminar un capítulo. */
  h += caminoHTML(total, tope, tesoroAbierto);

  if (nuevas.length){
    nuevas.forEach(function(id){
      let m = D.MEDALLAS.filter(function(x){return x.id===id;})[0];
      if(m) h += '<p class="festejo__medalla">'+icono('military_tech')+
        ' <b>Nueva medalla:</b> '+esc(m.nombre)+' — '+esc(m.desc)+'</p>';
    });
  }

  h += '<div class="acciones" style="max-width:660px;width:100%;margin-inline:auto">' +
    '<button class="btn btn--claro" data-ir="capitulos">'+icono('list')+' Ver capítulos</button>' +
    (siguiente
      ? '<button class="btn btn--verde" data-parte-sig="'+siguiente+'">Siguiente capítulo '+
        icono('arrow_forward')+'</button>'
      : '<button class="btn" data-ir="cuentos">'+icono('menu_book')+' Elegir otro cuento</button>') +
    '</div></div>';

  pintar('<div class="centrado">'+h+'</div>');
  setTimeout(animarCamino, 420);

  /* Primero la fanfarria y, al terminar, la voz de Martín cerrando
     el capítulo (capX_fin / patX_fin). Si no existe el archivo, la
     fanfarria suena igual y no pasa nada más. */
  if (SND.activo) SND.festejar(D.VOCES[est.cuento+':'+est.parte+':fin']);
}

/* Barra del camino al tesoro, compartida por el festejo y los capítulos. */
function caminoHTML(llaves, tope, abierto){
  let pct = Math.round(llaves/tope*100);
  /* La cifra va encima de la barra: cuando Pólya avanzaba por el
     centro tapaba el número y no se leía nada. */
  return '<div class="camino-bloque">' +
      '<p class="camino__cifra">'+llaves+' de '+tope+' llaves</p>' +
      '<div class="camino">' +
        '<span class="camino__pista">' +
          '<span class="camino__relleno" data-w="'+pct+'"></span>' +
        '</span>' +
        '<span class="camino__extremo camino__extremo--ini" id="caminoMartin">' +
          '<img src="'+IMG+'avance-llamada.webp" alt="Tu avance"></span>' +
        '<span class="camino__extremo camino__extremo--fin"'+(abierto?' data-abierto="1"':'')+
          '><img src="'+IMG+'tesoro.webp" alt="Tesoro"></span>' +
      '</div>' +
    '</div>';
}

function animarCamino(){
  document.querySelectorAll('[data-w]').forEach(function(el){
    el.style.width = el.dataset.w + '%';
  });
  let m = document.getElementById('caminoMartin');
  let pista = document.querySelector('.camino__pista');
  let rell = document.querySelector('.camino__relleno');
  if (m && pista && rell){
    /* Pólya se mueve dentro de la pista, sin salirse por los extremos. */
    let pct = Number(rell.dataset.w);
    let recorrido = pista.offsetWidth - m.offsetWidth;
    m.style.left = Math.round(pista.offsetLeft + recorrido * pct / 100) + 'px';
    /* Al llegar al 100 % se esconde tras el cofre: si no, quedaba
       montado sobre él con un leve desfase. */
    if (pct >= 100) m.dataset.oculto = '1'; else delete m.dataset.oculto;
  }
}

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
function atras(){
  SND.pararVoz(); pararSlider(); pararAutoScroll();
  switch(est.pantalla){
    case 'instrucciones':
      if (regreso){ let r = regreso; regreso = null; return r(); }
      return verPortada();
    case 'cuentos':       return verPortada();
    case 'capitulos':     return verCuentos();
    case 'narracion':     return verCapitulos(est.cuento);
    case 'reto':
      if (est.explicando && est.paso===1){ est.explicando=false; return verNarracion(); }
      if (est.explicando){ est.explicando=false; return verPaso(); }
      if (est.paso>1){ est.paso--; est.explicando=true; return verPaso(); }
      return verNarracion();
    default: return verPortada();
  }
}

document.addEventListener('click', function(ev){
  let t = ev.target;

  let ir = t.closest('[data-ir]');
  if (ir){
    pitido('clic');
    let d = ir.dataset.ir;
    if (d==='portada')       return verPortada();
    if (d==='cuentos')       return verCuentos();
    if (d==='instrucciones') return verInstrucciones();
    if (d==='capitulos')     return verCapitulos(est.cuento, true);
    return verPortada();
  }

  let bc = t.closest('[data-cuento]');
  if (bc){ pitido('clic'); return verCapitulos(bc.dataset.cuento); }

  let bp = t.closest('[data-parte]');
  if (bp){
    if (bp.dataset.bloqueado){ pitido('mal'); return; }
    pitido('clic');
    return empezarParte(est.cuento, Number(bp.dataset.parte));
  }

  let bs = t.closest('[data-parte-sig]');
  if (bs){ pitido('clic'); return empezarParte(est.cuento, Number(bs.dataset.parteSig)); }

  if (t.closest('#btnVozAyuda')){
    if (SND.hablando()){ SND.pausarVoz(); return pintarVozAyuda(); }
    if (SND.voz){ SND.reanudarVoz(); return pintarVozAyuda(); }
    return reproducirVozAyuda();
  }
  if (t.closest('#btnEmpezarPaso')){
    SND.pararVoz();
    est.explicando = false;
    pitido('clic');
    return verPaso();
  }
  if (t.closest('#btnSeguir')){
    let cj = document.getElementById('pista');
    if (cj && cj._seguir) return seguirAhora(cj._seguir);
    return;
  }
  if (t.closest('#btnPrev')) return moverBloque(-1);
  if (t.closest('#btnNext')) return moverBloque(1);
  if (t.closest('#btnPlay')) return alternarNarracion();
  if (t.closest('#btnOirPolya')) return alternarVozSimple(D.VOCES_COMPLETAS.polya);
  if (t.closest('#btnResolver')){ cerrarModal(); est.paso=1; est.explicando=true; return verPaso(); }

  /* --- Paso 1: los datos --- */
  let f = t.closest('[data-num]');
  if (f){
    let e1 = parteActual();
    if (f.dataset.bueno==='1'){
      if (f.dataset.elegida) return;
      f.dataset.elegida='1'; pitido('clic');
      let ya = document.querySelectorAll('.ficha[data-elegida]').length;
      if (ya===2){
        pitido('bien');
        pista('bien','<b>¡Esos son!</b> '+e1.datos[0].v+' y '+e1.datos[1].v+
          ' son los números que aparecen en el problema. Esos son los ' +
          '<b>datos relevantes</b>: los que sí necesitamos para resolver.' +
          G.datosDelProblema(e1),
          pasarDePaso);
        llaveGanada();
      } else {
        pista('pista','Muy bien, ese dato sirve. Busca <b>uno más</b> en el problema.');
      }
    } else {
      f.dataset.mala='1'; est.fallos++; est.falloPaso=true; pitido('mal');
      let dis = e1.distractores.filter(function(d){ return d.v===Number(f.dataset.num); })[0];
      pista('pista', dis && dis.tipo==='resultado'
        ? 'Cuidado: <b>'+dis.v+' '+esc(dis.e)+'</b> es justo lo que tenemos que ' +
          '<b>averiguar</b>. Todavía no lo sabemos, así que no puede ser un dato. ' +
          'Los datos son los números que el problema ya te dice.'
        : '<b>'+(dis?dis.v+' '+esc(dis.e):'Ese número')+'</b> no es lo que necesitamos aquí. ' +
          'Vuelve a leer el problema y busca las cantidades que sí se nombran.');
      setTimeout(function(){ delete f.dataset.mala; },420);
    }
    return;
  }

  /* --- Paso 2: la operación --- */
  let pl = t.closest('[data-plan]');
  if (pl){
    let e2 = parteActual();
    if (pl.dataset.plan===e2.operacion){
      pl.dataset.estado='bien'; pitido('bien');
      pista('bien', e2.operacion==='suma'
        ? '<b>¡Exacto!</b> Hay que reunir las dos cantidades, así que tu plan es ' +
          'una <b>suma</b>: '+esc(e2.cuenta)+'.'
        : '<b>¡Exacto!</b> Hay que comparar o quitar una cantidad, así que tu plan es ' +
          'una <b>resta</b>: '+esc(e2.cuenta)+'.',
        pasarDePaso);
      document.querySelectorAll('[data-plan]').forEach(function(b){ b.disabled=true; });
      llaveGanada();
    } else {
      pl.dataset.estado='mal'; est.fallos++; est.falloPaso=true; pitido('mal');
      pista('pista', e2.operacion==='suma'
        ? 'Todavía no. Fíjate: en el problema <b>aparecen dos grupos</b> y te preguntan ' +
          'cuántos hay <b>en total</b>. Cuando hay que reunir, se suma.'
        : 'Todavía no. Fíjate: te preguntan <b>cuántos faltan, cuántos quedan o cuál es ' +
          'la diferencia</b>. Cuando hay que comparar o quitar, se resta.');
      setTimeout(function(){ delete pl.dataset.estado; pl.disabled=false; },1600);
    }
    return;
  }

  /* --- Paso 3: la respuesta --- */
  let op = t.closest('[data-opcion]');
  if (op){
    let e3 = parteActual();
    if (Number(op.dataset.opcion)===e3.correcta){
      document.querySelectorAll('[data-opcion]').forEach(function(b){ b.disabled=true; });
      op.dataset.estado='bien'; pitido('bien');
      pista('bien','<b>¡Correcto!</b> '+esc(e3.cuenta)+' = '+e3.resultado+'. ' +
        'Ya tienes la respuesta, pero todavía falta el paso más importante: revisarla.',
        pasarDePaso);
      llaveGanada();
    } else {
      op.dataset.estado='mal'; op.disabled=true; est.fallos++; est.falloPaso=true; pitido('mal');
      let otra = e3.opciones[1-e3.correcta];
      pista('pista','Esa no es. Haz la cuenta <b>'+esc(e3.cuenta)+'</b> con calma: puedes ' +
        'contar con los dedos o dibujar. Vuelve a intentarlo.');
    }
    return;
  }

  /* --- Paso 4: revisar --- */
  let rv = t.closest('[data-revisar]');
  if (rv){
    if (rv.dataset.revisar==='1'){
      rv.dataset.estado='bien'; pitido('bien');
      document.querySelectorAll('[data-revisar]').forEach(function(b){ b.disabled=true; });
      pista('bien','<b>¡Muy bien!</b> Revisar al final es lo que hacen los buenos ' +
        'matemáticos. Completaste los cuatro pasos de Pólya.',
        pasarDePaso);
      llaveGanada();
      return;
    }
    /* "Quiero leer el problema otra vez": vuelve al cuento sin castigo. */
    est.paso=1; est.falloPaso=true; return verNarracion();
  }

  if (t === modal) cerrarModal();
});

btnAtras.addEventListener('click', atras);
btnInfo.addEventListener('click', function(){ pitido('clic'); verInstrucciones(); });
btnPolya.addEventListener('click', function(){
  if (btnPolya.dataset.activo!=='1'){ pitido('mal'); return; }
  pitido('clic'); abrirPolya();
});
document.addEventListener('keydown', function(ev){
  if (ev.key==='Escape'){ if(!modal.hidden) cerrarModal(); else atras(); }
});

/* ---------------- Instalación ---------------- */
let evtInstalar=null, cajaInstalar=document.getElementById('instalar');
window.addEventListener('beforeinstallprompt', function(ev){
  ev.preventDefault(); evtInstalar=ev;
  if(!localStorage.getItem('polya.noInstalar')) cajaInstalar.hidden=false;
});
document.getElementById('btnInstalar').addEventListener('click', function(){
  cajaInstalar.hidden=true; if(evtInstalar){ evtInstalar.prompt(); evtInstalar=null; }
});
document.getElementById('btnNoInstalar').addEventListener('click', function(){
  cajaInstalar.hidden=true;
  try{ localStorage.setItem('polya.noInstalar','1'); }catch(e){}
});

if ('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

/* ============================================================
   PANTALLA DE CARGA
   Precarga las imágenes pesadas y muestra el avance. Al terminar
   entra la portada y Martín da la bienvenida.
   ============================================================ */
function arrancar(){
  let splash = document.getElementById('splash');
  let barra  = document.getElementById('splashBarra');

  /* Cuánto dura como mínimo la pantalla de carga, en milisegundos.
     4000 = 4 segundos. Súbelo o bájalo a gusto. */
  let DURACION_MINIMA = 4000;

  /* Tope absoluto: pase lo que pase, a los 12 s se entra igual. */
  let TOPE = 12000;

  let recursos = [ IMG+'logo.webp', IMG+'martin.webp', IMG+'polya.webp',
                   IMG+'tesoro.webp', IMG+'cofre_abierto.webp',
                   IMG+'avance-llamada.webp', IMG+'background.webp' ];
  D.CUENTOS.forEach(function(c){
    if (c.portada) recursos.push(c.portada);
    c.escenas.forEach(function(e){ if (e.arte) recursos.push(e.arte); });
  });

  let listos = 0, total = recursos.length, terminado = false;
  let inicio = Date.now();

  /* Se cuenta igual si la imagen carga o si falla: lo que importa es
     que el intento terminó. Si una imagen faltara, la carga no se
     queda colgada. */
  recursos.forEach(function(ruta){
    let img = new Image();
    img.onload = img.onerror = function(){ listos++; };
    img.src = ruta;
  });

  function entrar(){
    if (terminado) return;
    terminado = true;
    if (barra) barra.style.width = '100%';
    setTimeout(function(){
      if (splash) splash.dataset.listo = '1';
      verPortada();
      /* Los navegadores no dejan sonar nada antes de que el usuario
         toque la pantalla. Se prueba con un audio mudo: si el navegador
         lo permite, la bienvenida suena de una vez; si lo rechaza, queda
         esperando al primer toque (que será el botón Iniciar). */
      if (SND.activo && D.VOCES_COMPLETAS.bienvenida){
        var bienvenidaDada = false;
        var darBienvenida = function(){
          if (bienvenidaDada) return;
          bienvenidaDada = true;
          SND.reproducirVoz(D.VOCES_COMPLETAS.bienvenida);
        };
        setTimeout(function(){
          var prueba = new Audio(D.VOCES_COMPLETAS.bienvenida);
          prueba.volume = 0;
          prueba.play().then(function(){
            prueba.pause();
            darBienvenida();
          }).catch(function(){
            document.addEventListener('pointerdown', darBienvenida, { once: true });
          });
        }, 700);
      }
    }, 350);
  }

  /* La barra avanza por tiempo, y espera a las imágenes solo si van
     más lentas. Nunca marca 100 % antes de que todo esté listo. */
  (function pintar(){
    if (terminado) return;
    let transcurrido = Date.now() - inicio;
    let porTiempo    = transcurrido / DURACION_MINIMA;
    let porArchivos  = total ? listos / total : 1;
    let pct = Math.min(porTiempo, porArchivos, 1);

    if (transcurrido >= TOPE) pct = 1;          // red de seguridad
    if (barra) barra.style.width = (pct*100).toFixed(1) + '%';

    if (pct >= 1) entrar();
    else requestAnimationFrame(pintar);
  })();
}

arrancar();

// Lógica para el PWA Update
/* Solo tiene sentido con la app publicada en un servidor. Abierta con
   doble clic (file://) el navegador lo rechaza, así que se omite. */
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Hay una actualización disponible
          let toast = document.getElementById('toastActualizacion');
          if(toast) {
            toast.hidden = false;
            let btnAct = document.getElementById('btnActualizarApp');
            if(btnAct) {
              btnAct.addEventListener('click', () => {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                toast.hidden = true;
              });
            }
          }
        }
      });
    });
  });

  let refreshing;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

})();
