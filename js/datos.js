/* ============================================================
   Aprendo con Pólya — CONTENIDO
   Los textos son los originales de la aplicación de 2019,
   recuperados del SWF. No se han reescrito.
   ============================================================ */

const APP = {
  titulo: 'Aprendo con Pólya',
  lema: 'Me enseña a resolver problemas matemáticos',
  descripcion:
    'Aplicación para estudiantes de grado segundo para la introducción ' +
    'en la resolución de problemas del tipo aditivo.',
  autoria:
    'Aplicación educativa elaborada por: Yasmín Raquel Rodríguez Bautista y ' +
    'María Elena Semanate Álvarez. Para aspirar al título de Magíster en ' +
    'Gestión de la Tecnología Educativa. Universidad de Santander UDES.',
  version: '3.0 · PWA'
};

/* Los cuatro pasos del método, con el enunciado original. */
const PASOS = [
  { n: 1, nombre: 'Leo y comprendo el problema', icono: 'search', corto: 'Leo',
    /* Título y puntos tal como estaban en la aplicación de 2019 */
    titulo: '1. Leer y comprender el problema',
    puntos: [
      { icono: 'help',            texto: '¿Qué sé del problema?' },
      { icono: 'bar_chart',       texto: '¿Distingo los datos relevantes?' },
      { icono: 'edit',            texto: 'Hago una lista o un dibujo' },
      { icono: 'contact_support', texto: '¿Qué me preguntan?' }
    ],
    voz: 'assets/audio/voces/polya_paso1.mp3',
    guia: 'Busca en el problema los dos números que sí importan. No todos los números sirven.' },

  { n: 2, nombre: 'Pienso un plan', icono: 'lightbulb', corto: 'Planeo',
    titulo: '2. Trazar un plan',
    puntos: [
      { icono: 'lightbulb', texto: '¿Qué debo hacer para responder la pregunta?' }
    ],
    voz: 'assets/audio/voces/polya_paso2.mp3',
    guia: '¿Hay que juntar los números o hay que quitar uno del otro?' },

  { n: 3, nombre: 'Ejecuto el plan', icono: 'calculate', corto: 'Resuelvo',
    titulo: '3. Ejecutar el plan',
    puntos: [
      { icono: 'schedule', texto: 'Me tomo un tiempo adecuado' }
    ],
    voz: 'assets/audio/voces/polya_paso3.mp3',
    guia: 'Haz la cuenta con calma y elige la respuesta correcta.' },

  { n: 4, nombre: 'Vuelvo atrás', icono: 'fact_check', corto: 'Reviso',
    titulo: '4. Volver atrás',
    puntos: [
      { icono: 'quiz',       texto: '¿Será la solución correcta?' },
      { icono: 'fact_check', texto: '¿Que hice para llegar a la souclion?' },
      { icono: 'front_hand', texto: '¿Respondo a la respuesta?' }
    ],
    voz: 'assets/audio/voces/polya_paso4.mp3',
    guia: 'Comprueba que tu respuesta responde de verdad la pregunta.' }
];

/* Título común de la tarjeta de explicación, como en el original */
const PASOS_TITULO = 'Así resuelvo el problema';

/* ------------------------------------------------------------
   INSTRUCCIONES. Pantalla "Conoce cómo usar la herramienta".
   Explica el objetivo, los iconos y el recorrido completo.
   ------------------------------------------------------------ */
const INSTRUCCIONES = {
  objetivo: {
    titulo: '¿De qué se trata?',
    texto: 'Vas a recorrer dos cuentos junto a Martín. En cada parte del ' +
           'cuento aparece un problema de matemáticas. El profesor Pólya te ' +
           'enseña cuatro pasos para resolverlo, y por cada paso que superes ' +
           'ganas una llave. Reúne las 20 llaves de un cuento y abrirás el tesoro.'
  },
  /* Iconografía. Elegida para que cada símbolo sea reconocible por sí solo
     y pueda reutilizarse en las fichas impresas de clase. */
  iconos: [
    { icono:'play_arrow',   nombre:'Iniciar',        texto:'Empieza la aventura desde la portada.' },
    { icono:'arrow_back',   nombre:'Volver',         texto:'Regresa a la pantalla anterior. Nunca pierdes tu avance.' },
    { icono:'help',         nombre:'Ayuda',          texto:'Abre estas instrucciones. Al cerrarlas vuelves a donde estabas.' },
    { icono:'volume_up',    nombre:'Sonido',         texto:'Enciende o apaga la música y las voces.' },
    { icono:'vpn_key',      nombre:'Llaves',         texto:'Cuenta las llaves ganadas. Están arriba a la derecha.' },
    { icono:'fast_rewind',  nombre:'Volver a oír',   texto:'Escucha otra vez la parte anterior del cuento.' },
    { icono:'play_arrow',   nombre:'Escuchar',       texto:'Martín lee el cuento y las imágenes van cambiando. Tócalo otra vez para pausar.' },
    { icono:'fast_forward', nombre:'Continuar',      texto:'Pasa a la siguiente parte de la narración.' },
    { icono:'psychology',   nombre:'Llamar a Pólya', texto:'Se enciende y late cuando termina el cuento. Tócalo y el profesor viene a ayudarte.' },
    { icono:'search',       nombre:'Paso 1: Leo',    texto:'Busco los datos que sí importan en el problema.' },
    { icono:'lightbulb',    nombre:'Paso 2: Planeo', texto:'Decido qué operación voy a hacer.' },
    { icono:'calculate',    nombre:'Paso 3: Resuelvo', texto:'Hago la cuenta y elijo la respuesta.' },
    { icono:'fact_check',   nombre:'Paso 4: Reviso', texto:'Compruebo que mi respuesta responde la pregunta.' },
    { icono:'inventory_2',  nombre:'Tesoro',         texto:'Está al final del camino. Se abre con las 20 llaves del cuento.' }
  ],
  recorrido: [
    { n: 1, titulo: 'Elige un cuento',   texto: 'Caperucita Roja o El Patito Feo. Puedes cambiar cuando quieras.' },
    { n: 2, titulo: 'Elige un capítulo', texto: 'Cada cuento tiene cinco capítulos. Se desbloquean uno tras otro.' },
    { n: 3, titulo: 'Escucha el cuento', texto: 'Martín narra la historia y las imágenes van cambiando.' },
    { n: 4, titulo: 'Llama a Pólya',     texto: 'Cuando termine el cuento, toca el botón que se enciende.' },
    { n: 5, titulo: 'Resuelve en cuatro pasos', texto: 'Leo, planeo, resuelvo y reviso. Cada paso te da una llave.' },
    { n: 6, titulo: 'Avanza al tesoro',  texto: 'Mira cómo tu personaje se acerca al cofre con cada llave.' }
  ],
  consejo: 'Si te equivocas no pasa nada: Pólya te explica en qué fijarte y ' +
           'puedes intentarlo otra vez. Equivocarse también es aprender.'
};

const SELECTOR_INTRO_NUEVO =
  'Selecciona un cuento, resuelve problemas y gana llaves para abrir el tesoro.';

/* ------------------------------------------------------------
   DIAPOSITIVAS
   Cada capítulo tiene una secuencia de imágenes que van cambiando
   mientras Martín narra. `seg` son los segundos que dura cada una.
   AJUSTA ESOS SEGUNDOS para sincronizar con tu grabación de voz:
   la suma de un bloque debe coincidir con la duración del audio.
   Mientras no haya imágenes definitivas, todas apuntan a los
   marcadores de posición entregados.
   ------------------------------------------------------------ */
/* Respaldo por si un capítulo no declara sus propias diapositivas.
   Los diez capítulos ya tienen las suyas, así que esto no se usa;
   queda como red de seguridad si añades un cuento nuevo. */
const SLIDES_POR_DEFECTO = {
  narracion: [ { img: 'assets/img/logo.webp', seg: 12 } ],
  problema:  [ { img: 'assets/img/logo.webp', seg: 12 } ]
};

/* ------------------------------------------------------------
   CUENTOS. Campos por escena:
     narracion / problema / opciones  → textos originales
     datos      → los dos números del problema (para el paso 1)
     operacion  → 'suma' | 'resta'    (para el paso 2)
     cuenta     → la operación escrita (para el paso 3)
     correcta   → índice de la opción correcta
   ------------------------------------------------------------ */
const CUENTOS = [
  {
    id: 'caperucita',
    titulo: 'Caperucita Roja',
    tituloLargo: 'El cumpleaños de Caperucita Roja',
    portada: 'assets/img/portada_caperucita.webp',
    acento: '#c46bd6',
    escenas: [
      {
        martinIntro: 'Llegamos a la casa de Caperucita, y hoy hay fiesta.',
        martinAnte: 'Caperucita encontró dos bolsas de globos y quedó pensando.',
        titulo: 'Hoy hay fiesta.',
        n: 1, rotulo: 'El arco de globos',
        arte: 'assets/img/cap1_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/cap1_a.webp', seg: 22 } ],
          problema:  [ { img: 'assets/img/cap1_b.webp', seg: 15 } ]
        },
        narracion: 'Como ya sabemos, Caperucita Roja era una adorable niña a quien su abuelita amaba muchísimo. Cuando cumplió los siete años le hizo una hermosa fiesta, adornó la sala con serpentinas de colores, en la mesa había una deliciosa torta y sobre ella un hermoso arco de globos elaborado con sus dos colores favoritos.',
        problema: 'Estando allí, Caperucita halló dos bolsas y le llamó la atención que en una bolsa decía: 25 globos rojos y en la otra bolsa, 12 globos azules color cielo. Se preguntó: ¿con cuántos globos hicieron el arco?',
        pregunta: '¿Con cuántos globos hicieron el arco?',
        datos: [{ v: 25, e: 'globos rojos', img: 'globo_rojo' }, { v: 12, e: 'globos azules', img: 'globo_azul' }],
        distractores: [
          { v: 2, e: 'bolsas de globos', tipo: 'otro' },
          { v: 37, e: 'globos en total', tipo: 'resultado' },
        ],
        operacion: 'suma', cuenta: '25 + 12', resultado: 37,
        opciones: ['El arco fue hecho con 37 globos', 'El arco fue hecho con 25 globos'],
        correcta: 0
      },
      {
        martinIntro: 'Para una fiesta hay que invitar a los amigos.',
        martinAnte: 'La abuelita compró tarjetas, pero ¿cuántas en total?',
        titulo: 'Hay que invitar a los amigos.',
        n: 2, rotulo: 'Las tarjetas',
        arte: 'assets/img/cap2_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/cap2_a.webp', seg: 6 } ],
          problema:  [ { img: 'assets/img/cap2_b.webp', seg: 10 } ]
        },
        narracion: 'A la fiesta se invitaron a los mejores amigos de Caperucita, con lindas tarjetas.',
        problema: 'Para esto la abuelita compró 24 tarjetas de invitación para niños y 25 tarjetas más para niñas. ¿Cuántas tarjetas compró la abuelita?',
        pregunta: '¿Cuántas tarjetas compró la abuelita?',
        datos: [{ v: 24, e: 'tarjetas para niños', img: 'invitacion_azul' }, { v: 25, e: 'tarjetas para niñas', img: 'invitacion_rosa' }],
        distractores: [
          { v: 2, e: 'grupos de amigos', tipo: 'otro' },
          { v: 49, e: 'tarjetas en total', tipo: 'resultado' },
        ],
        operacion: 'suma', cuenta: '24 + 25', resultado: 49,
        opciones: ['La abuelita compró 94 tarjetas en total', 'La abuelita compró 49 tarjetas en total'],
        correcta: 1
      },
      {
        martinIntro: 'Ahora toca repartir todas esas tarjetas por el pueblo.',
        martinAnte: 'La abuelita repartió en la mañana y en la tarde.',
        titulo: 'A repartir por el pueblo.',
        n: 3, rotulo: 'La entrega de tarjetas',
        arte: 'assets/img/cap3_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/cap3_a.webp', seg: 6 } ],
          problema:  [ { img: 'assets/img/cap3_b.webp', seg: 9 } ]
        },
        narracion: 'Para entregar las tarjetas la abuelita gastó todo un día.',
        problema: 'En la mañana la abuelita repartió 20 tarjetas y en la tarde 29 tarjetas más. ¿Cuántas tarjetas en total repartió la abuelita?',
        pregunta: '¿Cuántas tarjetas en total repartió la abuelita?',
        datos: [{ v: 20, e: 'en la mañana', img: 'invitaciones' }, { v: 29, e: 'en la tarde', img: 'invitaciones' }],
        distractores: [
          { v: 1, e: 'día de reparto', tipo: 'otro' },
          { v: 49, e: 'tarjetas repartidas', tipo: 'resultado' },
        ],
        operacion: 'suma', cuenta: '20 + 29', resultado: 49,
        opciones: ['La abuelita repartió 49 tarjetas en total', 'La abuelita repartió 39 tarjetas en total'],
        correcta: 0
      },
      {
        martinIntro: 'Conoce a María, una amiga muy especial de Caperucita.',
        martinAnte: 'María sacó unas muñecas para regalar y le quedaron otras.',
        titulo: 'El regalo de María.',
        n: 4, rotulo: 'María, la amiga de Caperucita',
        arte: 'assets/img/cap4_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/cap4_a.webp', seg: 11 } ],
          problema:  [ { img: 'assets/img/cap4_b.webp', seg: 9 } ]
        },
        narracion: '¿Saben? Los padres de María, una amiguita de Caperucita, no tenían dinero para comprar un regalo, así que forraron una caja con un hermoso papel de colores.',
        problema: 'María sacó 8 muñecas pequeñas para regalar a Caperucita y aún le quedaron 15. ¿Cuántas muñecas tenía María en su colección?',
        pregunta: '¿Cuántas muñecas tenía María en su colección?',
        datos: [{ v: 8, e: 'muñecas regaladas', img: 'muneca' }, { v: 15, e: 'muñecas que quedaron', img: 'muneca_varias' }],
        distractores: [
          { v: 1, e: 'caja de regalo', tipo: 'otro' },
          { v: 23, e: 'muñecas de la colección', tipo: 'resultado' },
        ],
        operacion: 'suma', cuenta: '8 + 15', resultado: 23,
        opciones: ['María tenía 32 muñecas en su colección', 'María tenía 23 muñecas en su colección'],
        correcta: 1
      },
      {
        martinIntro: 'Llegó el gran día de la fiesta.',
        martinAnte: 'Caperucita recordó su primer cumpleaños y comparó los invitados.',
        titulo: '¡Llegó el gran día!',
        n: 5, rotulo: 'Colorín colorado',
        arte: 'assets/img/cap5_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/cap5_a.webp', seg: 22 } ],
          problema:  [ { img: 'assets/img/cap5_b.webp', seg: 18 } ]
        },
        narracion: 'El día de la fiesta, Caperucita recibió muchos regalos; se divirtieron, comieron torta, dulces y helado, jugaron, saltaron y bailaron animados por un payaso que los hizo reír todo el tiempo. Al finalizar todos se fueron con un regalo sorpresa y un globo rojo para las niñas y azul cielo para los niños.',
        problema: 'Todo esto me recuerda otra linda fiesta que tuvo Caperucita: cuando cumplió un año asistieron 14 invitados, y cuando cumplió los siete años asistieron 35 más que cuando cumplió un año. ¿Cuántos invitados asistieron a la fiesta de los siete años?',
        pregunta: '¿Cuántos invitados asistieron a la fiesta de los siete años?',
        datos: [{ v: 14, e: 'invitados al primer año', img: 'invitados_pocos' }, { v: 35, e: 'invitados más', img: 'invitados_muchos' }],
        distractores: [
          { v: 7, e: 'años que cumplió', tipo: 'otro' },
          { v: 49, e: 'invitados en total', tipo: 'resultado' },
        ],
        operacion: 'suma', cuenta: '14 + 35', resultado: 49,
        opciones: ['A la fiesta de los 7 años asistieron 49 invitados', 'A la fiesta de los 7 años asistieron 21 invitados'],
        correcta: 0,
        cierre: '¡Colorín colorado, este cuento se ha acabado!'
      }
    ]
  },
  {
    id: 'patito',
    titulo: 'El Patito Feo',
    tituloLargo: 'El nacimiento del Patito Feo',
    portada: 'assets/img/portada_patito.webp',
    acento: '#37a0b3',
    escenas: [
      {
        martinIntro: 'Cambiamos de cuento: estamos en la granja de don Ramón.',
        martinAnte: 'Empezaron a nacer los patitos, pero no todos los huevos se abrieron.',
        titulo: 'En la granja de don Ramón.',
        n: 1, rotulo: '10 lindos patitos',
        arte: 'assets/img/pat1_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/pat1_a.webp', seg: 9 } ],
          problema:  [ { img: 'assets/img/pat1_b.webp', seg: 8 } ]
        },
        narracion: 'En la granja de don Ramón, la señora pata empolló sus huevos con mucha paciencia hasta que empezaron a nacer los primeros patitos.',
        problema: 'De 26 huevos empollados nacieron 10 lindos paticos. ¿Cuántos huevos faltan por romper? Se preguntó don Ramón.',
        pregunta: '¿Cuántos huevos faltan por romper?',
        datos: [{ v: 26, e: 'huevos empollados', img: 'huevo' }, { v: 10, e: 'paticos nacidos', img: 'patico_naciendo' }],
        distractores: [
          { v: 1, e: 'señora pata', tipo: 'otro' },
          { v: 16, e: 'huevos sin romper', tipo: 'resultado' },
        ],
        operacion: 'resta', cuenta: '26 − 10', resultado: 16,
        opciones: ['Faltan por romper 36 huevos', 'Faltan por romper 16 huevos'],
        correcta: 1
      },
      {
        martinIntro: 'Don Ramón ama los números y no para de hacer cuentas.',
        martinAnte: 'Papá pato y mamá pata cuidan grupos distintos de paticos.',
        titulo: 'Don Ramón hace cuentas.',
        n: 2, rotulo: 'Más paticos',
        arte: 'assets/img/pat2_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/pat2_a.webp', seg: 15 } ],
          problema:  [ { img: 'assets/img/pat2_b.webp', seg: 12 } ]
        },
        narracion: 'Los paticos llenaban de felicidad a los papás, a sus amigos y a don Ramón. Y con paciencia esperaban que todos nacieran. Como don Ramón amaba los números, hacía sus cuentas para distraerse un poco, y observó que:',
        problema: 'Papá pato cuidaba a los 10 paticos nacidos y a mamá pata le nacieron otros 4 paticos. ¿Cuántos paticos más tiene el pato que mamá pata? Nuevamente se preguntaba don Ramón.',
        pregunta: '¿Cuántos paticos más tiene papá pato que mamá pata?',
        datos: [{ v: 10, e: 'paticos de papá pato', img: 'patico_naciendo' }, { v: 4, e: 'paticos de mamá pata', img: 'patico' }],
        distractores: [
          { v: 2, e: 'nidos en la granja', tipo: 'otro' },
          { v: 6, e: 'paticos de diferencia', tipo: 'resultado' },
        ],
        operacion: 'resta', cuenta: '10 − 4', resultado: 6,
        opciones: ['Papá pato tiene 14 paticos más que mamá pata', 'Papá pato tiene 6 paticos más que mamá pata'],
        correcta: 1
      },
      {
        martinIntro: 'Pasó el tiempo y siguieron naciendo más paticos.',
        martinAnte: 'Ahora mamá pata cuida más paticos que papá pato.',
        titulo: 'Siguen naciendo paticos.',
        n: 3, rotulo: 'Otros paticos',
        arte: 'assets/img/pat3_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/pat3_a.webp', seg: 6 } ],
          problema:  [ { img: 'assets/img/pat3_b.webp', seg: 11 } ]
        },
        narracion: 'Al cabo de un corto tiempo nació otro y luego otro y así sucesivamente.',
        problema: 'Mamá pata ya cuidaba de 13 paticos y papá pato seguía con sus 10 paticos. ¿Cuántos paticos menos tiene papá pato que mamá pata? Se preguntaba don Ramón.',
        pregunta: '¿Cuántos paticos menos tiene papá pato que mamá pata?',
        datos: [{ v: 13, e: 'paticos de mamá pata', img: 'patico' }, { v: 10, e: 'paticos de papá pato', img: 'patico' }],
        distractores: [
          { v: 2, e: 'papás pato', tipo: 'otro' },
          { v: 3, e: 'paticos de diferencia', tipo: 'resultado' },
        ],
        operacion: 'resta', cuenta: '13 − 10', resultado: 3,
        opciones: ['Papá pato tiene 3 paticos menos que mamá pata', 'Papá pato tiene 23 paticos menos que mamá pata'],
        correcta: 0
      },
      {
        martinIntro: 'Entre cascarones rotos, don Ramón sigue contando.',
        martinAnte: 'Quiere saber la diferencia entre los huevos y los paticos.',
        titulo: 'Entre cascarones rotos.',
        n: 4, rotulo: '23 paticos',
        arte: 'assets/img/pat4_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/pat4_a.webp', seg: 6 } ],
          problema:  [ { img: 'assets/img/pat4_b.webp', seg: 11 } ]
        },
        narracion: 'Entre cascarones rotos y vacíos don Ramón seguía haciendo sus cuentas.',
        problema: 'La señora pata calentó 26 huevos y han nacido 23. ¿Qué diferencia hay entre el número de huevos que tenía al inicio y el número de huevos que ya han reventado?',
        pregunta: '¿Qué diferencia hay entre los huevos del inicio y los que ya reventaron?',
        datos: [{ v: 26, e: 'huevos calentados', img: 'huevo' }, { v: 23, e: 'paticos nacidos', img: 'patico_naciendo' }],
        distractores: [
          { v: 1, e: 'señora pata', tipo: 'otro' },
          { v: 3, e: 'huevos sin abrir', tipo: 'resultado' },
        ],
        operacion: 'resta', cuenta: '26 − 23', resultado: 3,
        opciones: ['La diferencia entre el número de huevos es 3', 'La diferencia entre el número de huevos es 49'],
        correcta: 0
      },
      {
        martinIntro: 'Queda un último huevo, y es el más grande de todos.',
        martinAnte: 'De todos los huevos, solo uno seguía sin abrirse.',
        titulo: 'Queda un huevo grande.',
        n: 5, rotulo: 'Un huevo grande',
        arte: 'assets/img/pat5_b.webp',
        slides: {
          narracion: [ { img: 'assets/img/pat5_a.webp', seg: 11 } ],
          problema:  [ { img: 'assets/img/pat5_b.webp', seg: 7 } ]
        },
        narracion: 'Todos los animales de la granja estaban muy contentos y celebraban junto con los padres y don Ramón semejante acontecimiento, pero no se habían dado cuenta que:',
        problema: 'De los 26 huevos, 1 —el más grande de todos— aún permanecía intacto. ¿Cuántos huevos eran pequeños?',
        pregunta: '¿Cuántos huevos eran pequeños?',
        datos: [{ v: 26, e: 'huevos en total', img: 'huevo' }, { v: 1, e: 'huevo grande', img: 'huevo', tam: 'grande' }],
        distractores: [
          { v: 2, e: 'papás pato', tipo: 'otro' },
          { v: 25, e: 'huevos pequeños', tipo: 'resultado' },
        ],
        operacion: 'resta', cuenta: '26 − 1', resultado: 25,
        opciones: ['27 huevos eran pequeños', '25 huevos eran pequeños'],
        correcta: 1,
        cierre: 'Y todos, incluso los patitos recién nacidos, concentraron su atención en el huevo, a ver cuándo se rompería. Al cabo de algunos minutos, el huevo empezó a moverse y luego se pudo ver el pico, luego el cuerpo y las patas del sonriente pato. Era el más grande y, para sorpresa de todos, ¡muy distinto de los demás! Y colorín colorado, ¡todos quedaron admirados!'
      }
    ]
  }
];

/* ------------------------------------------------------------
   GUION DE LOS PERSONAJES (texto nuevo, no del original).
   Martín narra y acompaña; Pólya asesora sobre el método.
   Los textos originales del cuento no se tocan: viven en
   `narracion`, `problema` y `opciones`.
   ------------------------------------------------------------ */
/* Retrato de Martín para el consejo del menú de ayuda.
   Cuando tengas un recorte de su cara (cuadrado, fondo transparente),
   guárdalo como assets/img/martin-cara.webp y cambia esta línea por:
   const MARTIN_RETRATO = 'assets/img/martin-cara.webp'; */
const MARTIN_RETRATO = 'assets/img/martin.webp';

const POLYA_ASESOR = {
  presentacion: 'Mucho gusto, yo soy George Pólya. Todo problema de ' +
                'matemáticas se puede resolver si sigues cuatro pasos ' +
                'siempre en el mismo orden. Te los voy a enseñar.',
  cierre: 'Recuerda: nunca empieces por la cuenta. Primero se entiende, ' +
          'después se planea, y solo entonces se calcula. ¿Listo?',
  pasoEntra: {
    1: 'Primero vamos a entender. Busca en el problema los dos números que sí importan.',
    2: 'Ya tenemos los datos. Ahora piensa: ¿hay que juntarlos o hay que quitarlos?',
    3: 'Tenemos el plan. Ahora sí, haz la cuenta con calma.',
    4: 'Nunca entregues sin revisar. Comprueba que tu respuesta responde la pregunta.'
  }
};

/* Voces recuperadas del SWF original. */
/* Pistas generales. Sustituye estos archivos por los tuyos manteniendo
   el nombre, o cambia la ruta. */
const VOCES_COMPLETAS = {
  narracion:  'assets/audio/voces/voz_0787.mp3',  // respaldo si falta la del capítulo
  polya:      'assets/audio/voces/polya_metodo.mp3',
  ayuda:      'assets/audio/voces/martin_ayuda.mp3',
  bienvenida: 'assets/audio/voces/martin_bienvenida.mp3',  // suena al entrar a la portada
  narrador:   'assets/audio/voces/voz_0068.mp3'
};

/* ------------------------------------------------------------
   VOCES POR CAPÍTULO
   Copia los MP3 en assets/audio/voces/ con estos nombres exactos.
   Lo que no exista todavía cae en la pista de respaldo, así que
   puedes ir grabando de a poco sin romper nada.

   La clave es  cuento : capítulo : bloque
     narracion → la historia
     problema  → el enunciado del problema
     fin       → la felicitación al completar el capítulo
   ------------------------------------------------------------ */
const VOCES = {
  // Caperucita Roja
  'caperucita:1:narracion': 'assets/audio/voces/cap1_cuento.mp3',
  'caperucita:1:problema':  'assets/audio/voces/cap1_problema.mp3',
  'caperucita:1:fin':       'assets/audio/voces/cap1_fin.mp3',
  'caperucita:2:narracion': 'assets/audio/voces/cap2_cuento.mp3',
  'caperucita:2:problema':  'assets/audio/voces/cap2_problema.mp3',
  'caperucita:2:fin':       'assets/audio/voces/cap2_fin.mp3',
  'caperucita:3:narracion': 'assets/audio/voces/cap3_cuento.mp3',
  'caperucita:3:problema':  'assets/audio/voces/cap3_problema.mp3',
  'caperucita:3:fin':       'assets/audio/voces/cap3_fin.mp3',
  'caperucita:4:narracion': 'assets/audio/voces/cap4_cuento.mp3',
  'caperucita:4:problema':  'assets/audio/voces/cap4_problema.mp3',
  'caperucita:4:fin':       'assets/audio/voces/cap4_fin.mp3',
  'caperucita:5:narracion': 'assets/audio/voces/cap5_cuento.mp3',
  'caperucita:5:problema':  'assets/audio/voces/cap5_problema.mp3',
  /* cierre → el desenlace del cuento. Suena en el paso 4 (Reviso),
     antes de la celebración. Solo lo tienen los capítulos finales. */
  'caperucita:5:cierre':    'assets/audio/voces/cap5_cierre.mp3',
  'caperucita:5:fin':       'assets/audio/voces/cap5_fin.mp3',

  // El Patito Feo
  'patito:1:narracion': 'assets/audio/voces/pat1_cuento.mp3',
  'patito:1:problema':  'assets/audio/voces/pat1_problema.mp3',
  'patito:1:fin':       'assets/audio/voces/pat1_fin.mp3',
  'patito:2:narracion': 'assets/audio/voces/pat2_cuento.mp3',
  'patito:2:problema':  'assets/audio/voces/pat2_problema.mp3',
  'patito:2:fin':       'assets/audio/voces/pat2_fin.mp3',
  'patito:3:narracion': 'assets/audio/voces/pat3_cuento.mp3',
  'patito:3:problema':  'assets/audio/voces/pat3_problema.mp3',
  'patito:3:fin':       'assets/audio/voces/pat3_fin.mp3',
  'patito:4:narracion': 'assets/audio/voces/pat4_cuento.mp3',
  'patito:4:problema':  'assets/audio/voces/pat4_problema.mp3',
  'patito:4:fin':       'assets/audio/voces/pat4_fin.mp3',
  'patito:5:narracion': 'assets/audio/voces/pat5_cuento.mp3',
  'patito:5:problema':  'assets/audio/voces/pat5_problema.mp3',
  'patito:5:cierre':    'assets/audio/voces/pat5_cierre.mp3',
  'patito:5:fin':       'assets/audio/voces/pat5_fin.mp3'
};

/* Cada parte del cuento tiene 4 pasos y cada paso da 1 llave:
   4 pasos × 5 partes = 20 llaves por cuento. */
const LLAVES_POR_CUENTO = 20;

const MEDALLAS = [
  { id: 'primera',   icono: 'vpn_key',    nombre: 'Primera llave',   desc: 'Ganaste tu primera llave' },
  { id: 'caperucita',icono: 'cake',       nombre: 'Tesoro de la fiesta', desc: 'Abriste el tesoro de Caperucita Roja' },
  { id: 'patito',    icono: 'egg',        nombre: 'Tesoro de la granja', desc: 'Abriste el tesoro de El Patito Feo' },
  { id: 'perfecto',  icono: 'stars',     nombre: 'Puntería',        desc: 'Resolviste un capítulo completo sin fallar' },
  { id: 'maestro',   icono: 'workspace_premium', nombre: 'Maestro Pólya', desc: 'Reuniste las 40 llaves de los dos cuentos' }
];

window.DATOS = { APP, PASOS, PASOS_TITULO, INSTRUCCIONES, SELECTOR_INTRO_NUEVO, CUENTOS, VOCES,
                 SLIDES_POR_DEFECTO,
                 VOCES_COMPLETAS, MEDALLAS, MARTIN_RETRATO, POLYA_ASESOR,
                 LLAVES_POR_CUENTO };
