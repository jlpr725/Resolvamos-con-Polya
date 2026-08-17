/* ============================================================
   Resolvamos con Pólya — PWA
   Recorrido: portada → instrucciones → cuentos → capítulos
              → narración → llamada a Pólya → 4 pasos → festejo
   ============================================================ */

(function () {
'use strict';

var D = window.DATOS, P = window.PROGRESO;
var vista     = document.getElementById('vista');
var cabecera  = document.getElementById('cabecera');
var cabLogo   = document.getElementById('cabeceraLogo');
var titulo    = document.getElementById('tituloVista');
var subtitulo = document.getElementById('subVista');
var contador  = document.getElementById('contador');
var totalLl   = document.getElementById('totalLlaves');
var btnPolya  = document.getElementById('btnPolya');
var pieFijo   = document.getElementById('pieFijo');
var btnAtras  = document.getElementById('btnAtras');
var btnInfo   = document.getElementById('btnInfo');
var btnSonido = document.getElementById('btnSonido');
var modal     = document.getElementById('modal');
var modalCaja = document.getElementById('modalCaja');

var IMG = 'assets/img/';
var est = { pantalla:'portada', cuento:null, parte:null, bloque:0,
            paso:1, fallos:0, limpios:0, falloPaso:false };
var regreso = null;      // a dónde volver al cerrar las instrucciones
var slider  = null;      // temporizador del carrusel de imágenes

function esc(s){ return String(s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function icono(n){ return '<span class="material-symbols-rounded">' + n + '</span>'; }
function cuentoPorId(id){
  for (var i=0;i<D.CUENTOS.length;i++) if (D.CUENTOS[i].id===id) return D.CUENTOS[i];
  return null;
}
function parteActual(){
  var c = cuentoPorId(est.cuento); if (!c) return null;
  for (var i=0;i<c.escenas.length;i++) if (c.escenas[i].n===est.parte) return c.escenas[i];
  return null;
}
function mezclar(a){
  a=a.slice();
  for (var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}

/* ---------------- Audio ---------------- */
var SND = window.SONIDO;
var pitido = function (t) { SND.pitido(t); };

SND.alCambiarEstado = function () {
  var b = document.getElementById('btnPlay');
  if (b) {
    var i = b.querySelector('.material-symbols-rounded');
    if (i) i.textContent = SND.hablando() ? 'pause' : 'play_arrow';
  }
  var s = document.getElementById('btnSonido');
  if (s) {
    s.querySelector('.material-symbols-rounded').textContent =
      SND.activo ? 'volume_up' : 'volume_off';
    s.setAttribute('aria-pressed', SND.activo ? 'false' : 'true');
    s.setAttribute('aria-label', SND.activo ? 'Silenciar el sonido' : 'Activar el sonido');
  }
};

function rutaVoz(tipo){
  var k = est.cuento+':'+est.parte+':'+tipo;
  return D.VOCES[k] || D.VOCES_COMPLETAS.narracion;
}

function confeti(){
  var cols=['#e06b38','#f5b731','#4f9d69','#d94f4f','#5b8fd4'];
  var caja=document.createElement('div'); caja.className='confeti';
  for(var i=0;i<48;i++){
    var s=document.createElement('span');
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
  var propias = e.slides && e.slides[tipo];
  return propias && propias.length ? propias : D.SLIDES_POR_DEFECTO[tipo];
}

function pararSlider(){
  if (slider && slider.id) clearTimeout(slider.id);
  slider = null;
}

function pausarSlider(){
  if (!slider || slider.pausado) return;
  clearTimeout(slider.id);
  slider.restante -= (Date.now() - slider.desde);
  slider.pausado = true;
}

function seguirSlider(){
  if (!slider || !slider.pausado) return;
  slider.pausado = false;
  programarSlide(Math.max(slider.restante, 400));
}

function programarSlide(ms){
  slider.desde = Date.now();
  slider.restante = ms;
  slider.id = setTimeout(function(){
    slider.i = (slider.i + 1) % slider.lista.length;
    mostrarSlide();
    programarSlide(slider.lista[slider.i].seg * 1000);
  }, ms);
}

function mostrarSlide(){
  var caja = document.getElementById('lienzoSlide');
  if (!caja || !slider) return;
  var s = slider.lista[slider.i];
  caja.innerHTML = '<img src="'+s.img+'" alt="">';
  var ps = document.getElementById('slidePuntos');
  if (ps) {
    ps.innerHTML = slider.lista.map(function(_,i){
      return '<i'+(i===slider.i?' data-activo="1"':'')+'></i>'; }).join('');
  }
}

function arrancarSlider(lista, autoplay){
  pararSlider();
  slider = { lista: lista, i: 0, id: null, desde: 0, restante: 0, pausado: !autoplay };
  mostrarSlide();
  if (autoplay && lista.length > 1) programarSlide(lista[0].seg * 1000);
}

/* La narración manda: al reproducir corre el carrusel, al pausar se detiene. */
function alternarNarracion(){
  if (SND.hablando()){ SND.pausarVoz(); pausarSlider(); return; }
  if (SND.voz){ SND.reanudarVoz(); seguirSlider(); return; }
  var e = parteActual(); if (!e) return;
  var tipo = est.bloque === 0 ? 'narracion' : 'problema';
  arrancarSlider(slidesDe(e, tipo), true);
  SND.reproducirVoz(rutaVoz('narracion'), function(){ pausarSlider(); });
}

function alternarVozSimple(ruta){
  if (SND.hablando()) return SND.pausarVoz();
  if (SND.voz) return SND.reanudarVoz();
  SND.reproducirVoz(ruta);
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
  SND.ambiente(!!op.musicaFuerte);
  if (SND.alCambiarEstado) SND.alCambiarEstado();
}

function pintar(html){
  vista.innerHTML = html;
  vista.classList.remove('vista'); void vista.offsetWidth; vista.classList.add('vista');
}

/* ============================================================
   1. PORTADA
   ============================================================ */
function verPortada(){
  SND.pararVoz(); pararSlider(); est.pantalla='portada'; est.cuento=null;
  chrome({ musicaFuerte:true });
  SND.iniciarMusica();
  pintar(
    '<div class="portada">' +
      '<div class="portada__orbita">' +
        
        '<img class="portada__logo" src="'+IMG+'logo.webp" alt="Resolvamos con Pólya">' +
      '</div>' +
      '<p class="portada__desc">'+esc(D.APP.descripcion)+'</p>' +
      '<button class="btn btn--grande" data-ir="cuentos">'+icono('play_arrow')+' Iniciar</button>' +
      '<button class="enlace" data-ir="instrucciones">' +
        '<span class="enlace__i">'+icono('question_mark')+'</span> Conoce cómo usar la herramienta</button>' +
      '<p class="portada__creditos">'+esc(D.APP.autoria)+'</p>' +
    '</div>');
}

/* ============================================================
   2. INSTRUCCIONES
   ============================================================ */
function verInstrucciones(desde){
  /* Guarda dónde estaba el usuario para devolverlo al mismo punto. */
  if (desde !== false && est.pantalla !== 'instrucciones'){
    var d = JSON.parse(JSON.stringify(est));
    regreso = function(){
      est = d;
      switch(d.pantalla){
        case 'portada':    return verPortada();
        case 'cuentos':    return verCuentos();
        case 'capitulos':  return verCapitulos(d.cuento);
        case 'narracion':  return verNarracion();
        case 'reto':       return verPaso();
        case 'festejo':    return verCapitulos(d.cuento);
        default:           return verPortada();
      }
    };
  }
  SND.pararVoz(); pararSlider(); est.pantalla='instrucciones';
  chrome({ cabecera:true, logo:true, titulo:'Cómo se usa', pie:true, atras:true, musicaFuerte:true });
  var I = D.INSTRUCCIONES;

  var h = '<div class="bloque">' +
      '<h2 class="bloque__titulo">'+esc(I.objetivo.titulo)+'</h2>' +
      '<p class="bloque__texto">'+esc(I.objetivo.texto)+'</p></div>';

  h += '<div class="bloque"><h2 class="bloque__titulo">El recorrido, paso a paso</h2>' +
       '<div class="pasos-lista">';
  I.recorrido.forEach(function(r){
    h += '<div class="paso-num"><span class="paso-num__n">'+r.n+'</span>' +
         '<span><b>'+esc(r.titulo)+'</b><span>'+esc(r.texto)+'</span></span></div>';
  });
  h += '</div></div>';

  h += '<div class="bloque"><h2 class="bloque__titulo">Los botones y qué hacen</h2>' +
       '<div class="iconos-lista">';
  I.iconos.forEach(function(i){
    var caja = i.icono==='vpn_key'
      ? '<span class="icono-fila__caja"><img src="'+IMG+'llave.svg" alt=""></span>'
      : i.icono==='inventory_2'
      ? '<span class="icono-fila__caja"><img src="'+IMG+'tesoro.webp" alt=""></span>'
      : i.icono==='psychology'
      ? '<span class="icono-fila__caja"><img src="'+IMG+'avance-llamada.webp" alt=""></span>'
      : '<span class="icono-fila__caja">'+icono(i.icono)+'</span>';
    h += '<div class="icono-fila">'+caja+
         '<span><b>'+esc(i.nombre)+'</b><span>'+esc(i.texto)+'</span></span></div>';
  });
  h += '</div></div>';

  h += '<div class="bloque" style="display:flex;gap:14px;align-items:center">' +
       '<img src="'+IMG+'martin.webp" alt="Martín" style="width:clamp(60px,10vh,110px)">' +
       '<p class="bloque__texto">'+esc(I.consejo)+'</p></div>';

  h += '<div class="acciones"><button class="btn btn--ancho" id="btnVolverDe">' +
       icono('arrow_back')+' Volver a donde estaba</button></div>';

  pintar('<div class="centrado">'+h+'</div>');
}

/* ============================================================
   3. SELECCIÓN DE CUENTO
   ============================================================ */
function verCuentos(){
  SND.pararVoz(); pararSlider(); est.pantalla='cuentos'; est.cuento=null;
  chrome({ cabecera:true, logo:true, llaves:true, pie:true, atras:true, musicaFuerte:true });
  cabLogo.hidden = true;

  var h = '<div style="text-align:center;margin-bottom:clamp(8px,1.6vh,18px)">' +
      '<img src="'+IMG+'logo.webp" alt="Ir a la portada" class="logo-enlace" data-ir="portada" ' +
      'style="width:clamp(110px,18vh,230px)"></div>' +
    '<p class="intro">'+esc(D.SELECTOR_INTRO_NUEVO)+'</p>' +
    '<div class="cuentos">';
  D.CUENTOS.forEach(function(c){
    var hechas = P.partesTerminadas(c.id);
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
  SND.pararVoz(); pararSlider();
  est.pantalla='capitulos'; est.cuento=id;
  var c = cuentoPorId(id); if(!c) return verCuentos();
  chrome({ cabecera:true, llaves:true, pie:true, atras:true });

  var llaves = P.llavesDeCuento(id), tope = D.LLAVES_POR_CUENTO;

  var h = '<div style="text-align:center;margin-bottom:clamp(6px,1.2vh,14px)">' +
      '<img src="'+IMG+'logo.webp" alt="Ir a la portada" class="logo-enlace" data-ir="portada" ' +
      'style="width:clamp(90px,15vh,190px)"></div>' +
    '<h2 class="titulo-cuento">'+esc(c.titulo)+'</h2>' +
    '<p class="intro">Selecciona un capítulo y sigue ganando llaves.<br>' +
      '¿Sabes cuántas llaves te faltan para abrir el tesoro?</p>' +
    '<div class="capitulos">';

  c.escenas.forEach(function(e){
    var libre = P.desbloqueada(id, e.n);
    var p = P.porcentaje(id, e.n);
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
  verNarracion();
}

function verNarracion(){
  est.pantalla='narracion';
  var c = cuentoPorId(est.cuento), e = parteActual();
  if(!e) return verCapitulos(est.cuento);
  var bl = bloquesDe(e), b = bl[est.bloque];
  var ultimo = est.bloque === bl.length-1;

  chrome({ cabecera:true, logo:true, titulo:c.titulo,
           sub:e.rotulo+' – Capítulo '+e.n, llaves:true,
           polya:true, polyaActivo:ultimo, pie:true, atras:true });

  var texto = esc(b.texto);
  if (b.destacar) texto = texto.replace(esc(b.destacar), '<b>'+esc(b.destacar)+'</b>');

  var avisoPolya = ultimo
    ? '<div class="aviso-polya">' +
        '<img src="'+IMG+'avance-llamada.webp" alt="">' +
        '<p><b>¡Ya conocemos el problema!</b> Vamos a llamar al profesor Pólya. ' +
        'Toca el botón que se encendió arriba '+icono('arrow_upward')+'</p>' +
      '</div>'
    : '';

  var puntos = '<div class="puntos" id="bloquePuntos">' + bl.map(function(_,i){
      return '<i'+(i===est.bloque?' data-activo="1"':'')+'></i>'; }).join('') + '</div>';

  pintar(
    '<div class="escena">' +
      '<div class="escena__ilustracion">' +
        '<div class="slide" id="lienzoSlide"></div>' +
        '<div class="slide-puntos" id="slidePuntos"></div>' +
      '</div>' +
      '<div class="hoja">' +
        '<h2 class="hoja__titulo">'+esc(b.titulo)+'</h2>' +
        '<p class="hoja__texto">'+texto+'</p>' +
        avisoPolya +
      '</div>' +
      '<div class="martin">' +
        '<img class="martin__figura" src="'+IMG+'martin.webp" alt="Martín">' +
        puntos +
        '<div class="martin__controles">' +
          '<button class="martin__btn" id="btnPrev" aria-label="Capítulo anterior"'+
            (est.bloque===0?' disabled':'')+'>'+icono('fast_rewind')+'</button>' +
          '<button class="martin__btn" id="btnPlay" aria-label="Escuchar la narración">'+
            icono('play_arrow')+'</button>' +
          '<button class="martin__btn" id="btnNext" aria-label="Siguiente"'+
            (ultimo?' disabled':'')+'>'+icono('fast_forward')+'</button>' +
        '</div>' +
      '</div>' +
    '</div>');

  /* El carrusel arranca en pausa: avanza cuando suena la voz. */
  arrancarSlider(slidesDe(e, est.bloque===0 ? 'narracion' : 'problema'), false);
}

function moverBloque(d){
  var e = parteActual(); if(!e) return;
  var bl = bloquesDe(e);
  var n = est.bloque + d;
  if (n<0 || n>=bl.length) return;
  SND.pararVoz(); pararSlider(); est.bloque = n; pitido('clic'); verNarracion();
}

/* ============================================================
   6. LA APARICIÓN DE PÓLYA
   ============================================================ */
function abrirPolya(){
  SND.pararVoz(); pararSlider();
  var h = '<div class="polya-modal">' +
    '<img class="polya-modal__figura" src="'+IMG+'polya.webp" alt="Profesor Pólya">' +
    '<div>' +
      '<p class="globo" id="modalTitulo">'+esc(D.POLYA_ASESOR.presentacion)+'</p>';
  D.PASOS.forEach(function(p){
    h += '<div class="paso-fila">' +
      '<span class="paso-fila__icono">'+icono(p.icono)+'</span>' +
      '<p class="paso-fila__texto"><b>'+p.n+'. '+esc(p.nombre)+':</b> '+esc(p.detalle)+'</p>' +
      '</div>';
  });
  h += '<div class="acciones">' +
      '<button class="btn btn--claro" id="btnOirPolya">'+icono('play_arrow')+' Escuchar</button>' +
      '<button class="btn" id="btnResolver">Vamos a resolver el problema '+icono('arrow_forward')+'</button>' +
    '</div></div></div>';
  modalCaja.innerHTML = h;
  modal.hidden = false;
}
function cerrarModal(){ modal.hidden = true; SND.pararVoz(); pararSlider(); }

/* ============================================================
   7. LA RESOLUCIÓN, PASO A PASO
   ============================================================ */
function verPaso(){
  est.pantalla='reto';
  var c = cuentoPorId(est.cuento), e = parteActual();
  if(!e) return verCapitulos(est.cuento);
  chrome({ cabecera:true, logo:true, titulo:c.titulo,
           sub:'Capítulo '+est.parte+' · Paso '+est.paso+' de 4 · '+D.PASOS[est.paso-1].nombre,
           llaves:true, pie:true, atras:true });

  var tira = '<div class="pasos-tira">' + D.PASOS.map(function(p){
      var a = p.n===est.paso ? ' data-activo="1"' : (p.n<est.paso ? ' data-hecho="1"' : '');
      return '<div class="pasos-tira__item"'+a+'>'+icono(p.icono)+'<span>'+esc(p.corto)+'</span></div>';
    }).join('') + '</div>';

  var cuerpo = '';

  if (est.paso===1){
    var opciones = mezclar(
      e.datos.map(function(d){ return { v:d.v, e:d.e, bueno:1 }; })
        .concat(e.distractores.map(function(d){ return { v:d.v, e:d.e, bueno:0 }; })));
    var fichas = opciones.map(function(o){
      return '<button class="ficha" data-num="'+o.v+'" data-bueno="'+o.bueno+'">' +
             '<b>'+o.v+'</b><span>'+esc(o.e)+'</span></button>';
    }).join('');
    cuerpo =
      '<p class="rotulo">El problema</p>' +
      '<p class="enunciado">'+esc(e.problema)+'</p>' +
      '<p class="pregunta">¿Cuáles son los datos que sí importan?</p>' +
      '<div class="fichas">'+fichas+'</div>';
  }

  if (est.paso===2){
    cuerpo =
      '<p class="rotulo">La pregunta</p>' +
      '<p class="pregunta">'+esc(e.pregunta)+'</p>' +
      '<p class="enunciado">Tus datos: <b>'+e.datos[0].v+'</b> y <b>'+e.datos[1].v+'</b></p>' +
      '<p class="rotulo">¿Qué operación vas a realizar?</p>' +
      '<div class="opciones">' +
        '<button class="opcion" data-plan="suma"><span class="opcion__letra">+</span>' +
          '<span>Juntar los dos números<small>los reúno para saber cuántos hay en total</small></span></button>' +
        '<button class="opcion" data-plan="resta"><span class="opcion__letra">−</span>' +
          '<span>Quitar un número del otro<small>los comparo o separo una parte</small></span></button>' +
      '</div>';
  }

  if (est.paso===3){
    var ops = e.opciones.map(function(o,k){
      return '<button class="opcion" data-opcion="'+k+'">' +
        '<span class="opcion__letra">'+'ab'[k]+'</span><span>'+esc(o)+'</span></button>';
    }).join('');
    cuerpo =
      '<p class="rotulo">Tu plan</p>' +
      '<div class="cuenta">'+esc(e.cuenta)+' <em>= ?</em></div>' +
      '<p class="pregunta">'+esc(e.pregunta)+'</p>' +
      '<div class="opciones">'+ops+'</div>';
  }

  if (est.paso===4){
    cuerpo =
      '<p class="rotulo">Lo que respondiste</p>' +
      '<div class="cuenta">'+esc(e.cuenta)+' <em>= '+e.resultado+'</em></div>' +
      '<p class="enunciado">'+esc(e.opciones[e.correcta])+'</p>' +
      '<p class="pregunta">¿Tu respuesta responde la pregunta?</p>' +
      '<div class="opciones">' +
        '<button class="opcion" data-revisar="1"><span class="opcion__letra">'+icono('check')+'</span>' +
          '<span>Sí, revisé la cuenta y responde la pregunta</span></button>' +
        '<button class="opcion" data-revisar="0"><span class="opcion__letra">'+icono('replay')+'</span>' +
          '<span>Quiero leer el problema otra vez</span></button>' +
      '</div>';
  }

  pintar(
    '<div class="reto">' +
      '<div class="reto__lado">' +
        '<div class="reto__ilustracion"><img src="'+e.arte+'" alt=""></div>' +
      '</div>' +
      '<div class="reto__panel">' + tira + cuerpo +
        '<div id="pista"></div>' +
      '</div>' +
    '</div>');
}

/* ============================================================
   RETROALIMENTACIÓN
   Nunca se dice solo "está mal": se explica en qué fijarse.
   El aviso se queda en pantalla el tiempo suficiente para que el
   docente pueda comentarlo, con una barra que muestra cuánto
   falta y un botón para seguir antes si ya se entendió.
   ============================================================ */
var ESPERA = { bien: 7000, pista: 9000 };   // milisegundos; ajustables
var temporizador = null;

function pista(tipo, texto, alSeguir){
  var caja = document.getElementById('pista'); if(!caja) return;
  var espera = ESPERA[tipo] || 7000;
  var cara = tipo==='bien' ? IMG+'avance-llamada.webp' : IMG+'avance-llamada.webp';

  caja.innerHTML =
    '<div class="pista" data-tipo="'+tipo+'">' +
      '<img class="pista__cara" src="'+cara+'" alt="">' +
      '<div class="pista__cuerpo">' +
        '<p>'+texto+'</p>' +
        (alSeguir
          ? '<div class="pista__seguir">' +
              '<span class="pista__barra"><i id="pistaBarra"></i></span>' +
              '<button class="btn btn--pequeno" id="btnSeguir">Continuar '+
                icono('arrow_forward')+'</button>' +
            '</div>'
          : '') +
      '</div>' +
    '</div>';

  if (!alSeguir) return;

  var barra = document.getElementById('pistaBarra');
  if (barra) requestAnimationFrame(function(){
    barra.style.transitionDuration = espera + 'ms';
    barra.style.width = '100%';
  });

  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(function(){ seguirAhora(alSeguir); }, espera);
  caja.dataset.seguir = '1';
  caja._seguir = alSeguir;
}

function seguirAhora(fn){
  if (temporizador) { clearTimeout(temporizador); temporizador = null; }
  var caja = document.getElementById('pista');
  if (caja) { delete caja.dataset.seguir; caja._seguir = null; }
  fn();
}

function llaveGanada(){
  var caja = document.getElementById('pista'); if(!caja) return;
  SND.pitido('llave');
  var cuerpo = caja.querySelector('.pista__cuerpo') || caja;
  cuerpo.insertAdjacentHTML('afterbegin',
    '<div class="llave-premio"><img src="'+IMG+'llave.svg" alt="">¡Ganaste una llave!</div>');
  totalLl.textContent = P.llavesDeCuento(est.cuento) + est.paso;
}

function pasarDePaso(){
  if(!est.falloPaso) est.limpios++;
  est.falloPaso = false;
  est.paso++;
  if (est.paso>4) return festejar();
  verPaso();
}

/* ============================================================
   8. FESTEJO Y AVANCE
   ============================================================ */
function festejar(){
  var c = cuentoPorId(est.cuento), e = parteActual();
  var nuevas = P.registrar(est.cuento, est.parte, est.limpios);
  pitido('bien'); confeti();

  var llaves = '';
  for (var i=0;i<4;i++) llaves += '<img src="'+IMG+'llave.svg" alt="">';

  var animo = est.limpios===4
    ? '¡Perfecto! Resolviste los cuatro pasos sin equivocarte. Pólya estaría muy orgulloso de ti.'
    : est.limpios>=2
    ? '¡Muy bien! Te equivocaste en algún paso, pero volviste a intentarlo y lo lograste. Así se aprende de verdad.'
    : '¡Lo lograste! Al principio costó, pero seguiste los cuatro pasos hasta el final. Eso es lo importante.';

  var ultimo = est.parte === c.escenas.length;
  var siguiente = ultimo ? null : est.parte + 1;
  var total = P.llavesDeCuento(est.cuento);
  var tope  = D.LLAVES_POR_CUENTO;
  var tesoroAbierto = total >= tope;

  chrome({ cabecera:true, logo:true, titulo:'¡Capítulo '+est.parte+' completado!',
           llaves:true, pie:true, atras:true });

  var h = '<div class="festejo">';

  if (tesoroAbierto){
    h += '<h2 class="festejo__titulo">¡Abriste el tesoro!</h2>' +
      '<div class="tesoro-final">' +
        '<img class="tesoro-final__cofre" src="'+IMG+'tesoro.webp" alt="Tesoro abierto">' +
        '<img class="tesoro-final__polya" src="'+IMG+'polya.webp" alt="Profesor Pólya">' +
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
      var m = D.MEDALLAS.filter(function(x){return x.id===id;})[0];
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
}

/* Barra del camino al tesoro, compartida por el festejo y los capítulos. */
function caminoHTML(llaves, tope, abierto){
  var pct = Math.round(llaves/tope*100);
  return '<div class="camino">' +
      '<span class="camino__extremo camino__extremo--ini" id="caminoMartin">' +
        '<img src="'+IMG+'avance-llamada.webp" alt="Tu avance"></span>' +
      '<span class="camino__pista">' +
        '<span class="camino__relleno" data-w="'+pct+'"></span>' +
        '<span class="camino__cifra">'+llaves+'/'+tope+' llaves</span>' +
      '</span>' +
      '<span class="camino__extremo camino__extremo--fin"'+(abierto?' data-abierto="1"':'')+
        '><img src="'+IMG+'tesoro.webp" alt="Tesoro"></span>' +
    '</div>';
}

function animarCamino(){
  document.querySelectorAll('[data-w]').forEach(function(el){
    el.style.width = el.dataset.w + '%';
  });
  var m = document.getElementById('caminoMartin');
  var pista = document.querySelector('.camino__pista');
  var rell = document.querySelector('.camino__relleno');
  if (m && pista && rell){
    m.style.left = Math.round(pista.offsetWidth * Number(rell.dataset.w)/100) + 'px';
  }
}

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
function atras(){
  SND.pararVoz(); pararSlider();
  switch(est.pantalla){
    case 'instrucciones':
      if (regreso){ var r = regreso; regreso = null; return r(); }
      return verPortada();
    case 'cuentos':       return verPortada();
    case 'capitulos':     return verCuentos();
    case 'narracion':     return verCapitulos(est.cuento);
    case 'reto':
      if (est.paso>1){ est.paso--; return verPaso(); }
      return verNarracion();
    default: return verPortada();
  }
}

document.addEventListener('click', function(ev){
  var t = ev.target;

  var ir = t.closest('[data-ir]');
  if (ir){
    pitido('clic');
    var d = ir.dataset.ir;
    if (d==='portada')       return verPortada();
    if (d==='cuentos')       return verCuentos();
    if (d==='instrucciones') return verInstrucciones();
    if (d==='capitulos')     return verCapitulos(est.cuento, true);
    return verPortada();
  }

  var bc = t.closest('[data-cuento]');
  if (bc){ pitido('clic'); return verCapitulos(bc.dataset.cuento); }

  var bp = t.closest('[data-parte]');
  if (bp){
    if (bp.dataset.bloqueado){ pitido('mal'); return; }
    pitido('clic');
    return empezarParte(est.cuento, Number(bp.dataset.parte));
  }

  var bs = t.closest('[data-parte-sig]');
  if (bs){ pitido('clic'); return empezarParte(est.cuento, Number(bs.dataset.parteSig)); }

  if (t.closest('#btnVolverDe')){
    pitido('clic');
    if (regreso){ var r = regreso; regreso = null; return r(); }
    return verPortada();
  }
  if (t.closest('#btnSeguir')){
    var cj = document.getElementById('pista');
    if (cj && cj._seguir) return seguirAhora(cj._seguir);
    return;
  }
  if (t.closest('#btnPrev')) return moverBloque(-1);
  if (t.closest('#btnNext')) return moverBloque(1);
  if (t.closest('#btnPlay')) return alternarNarracion();
  if (t.closest('#btnOirPolya')) return alternarVozSimple(D.VOCES_COMPLETAS.polya);
  if (t.closest('#btnResolver')){ cerrarModal(); est.paso=1; return verPaso(); }

  /* --- Paso 1: los datos --- */
  var f = t.closest('[data-num]');
  if (f){
    var e1 = parteActual();
    if (f.dataset.bueno==='1'){
      if (f.dataset.elegida) return;
      f.dataset.elegida='1'; pitido('clic');
      var ya = document.querySelectorAll('.ficha[data-elegida]').length;
      if (ya===2){
        pitido('bien');
        pista('bien','<b>¡Esos son!</b> '+e1.datos[0].v+' y '+e1.datos[1].v+
          ' son los números que aparecen en el problema. Esos son los ' +
          '<b>datos relevantes</b>: los que sí necesitamos para resolver.',
          pasarDePaso);
        llaveGanada();
      } else {
        pista('pista','Muy bien, ese dato sirve. Busca <b>uno más</b> en el problema.');
      }
    } else {
      f.dataset.mala='1'; est.fallos++; est.falloPaso=true; pitido('mal');
      var dis = e1.distractores.filter(function(d){ return d.v===Number(f.dataset.num); })[0];
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
  var pl = t.closest('[data-plan]');
  if (pl){
    var e2 = parteActual();
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
  var op = t.closest('[data-opcion]');
  if (op){
    var e3 = parteActual();
    if (Number(op.dataset.opcion)===e3.correcta){
      document.querySelectorAll('[data-opcion]').forEach(function(b){ b.disabled=true; });
      op.dataset.estado='bien'; pitido('bien');
      pista('bien','<b>¡Correcto!</b> '+esc(e3.cuenta)+' = '+e3.resultado+'. ' +
        'Ya tienes la respuesta, pero todavía falta el paso más importante: revisarla.',
        pasarDePaso);
      llaveGanada();
    } else {
      op.dataset.estado='mal'; op.disabled=true; est.fallos++; est.falloPaso=true; pitido('mal');
      var otra = e3.opciones[1-e3.correcta];
      pista('pista','Esa no es. Haz la cuenta <b>'+esc(e3.cuenta)+'</b> con calma: puedes ' +
        'contar con los dedos o dibujar. Vuelve a intentarlo.');
    }
    return;
  }

  /* --- Paso 4: revisar --- */
  var rv = t.closest('[data-revisar]');
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
btnSonido.addEventListener('click', function(){ SND.alternarTodo(); });
btnPolya.addEventListener('click', function(){
  if (btnPolya.dataset.activo!=='1'){ pitido('mal'); return; }
  pitido('clic'); abrirPolya();
});
document.addEventListener('keydown', function(ev){
  if (ev.key==='Escape'){ if(!modal.hidden) cerrarModal(); else atras(); }
});

/* ---------------- Instalación ---------------- */
var evtInstalar=null, cajaInstalar=document.getElementById('instalar');
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

verPortada();
})();
