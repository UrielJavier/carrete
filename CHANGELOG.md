# Changelog

Cambios notables de **Maqueta** (antes *Carrete*), editor de carruseles para
Instagram.

El formato se inspira en [Keep a Changelog](https://keepachangelog.com/es/).
La versión se muestra en la cabecera de la app, así que el número que ves en
https://urieljavier.github.io/carrete/ dice qué build está desplegado.

Las versiones **1.0.0 – 3.13.2** son de la versión original de un solo fichero
HTML (el antiguo Carrete), conservada en `reference/carrete-3.13.2.html`.

## 4.16.0 — 21 ago 2026 · menú de navegación

- Nuevo **menú hamburguesa** en la cabecera para los destinos "meta", sin ensuciar la
  barra de trabajo (Editar/Feed/Perfil + Exportar se quedan como están).
- Por ahora: **Proyectos** y **Comentarios**. Los comentarios abren tu app de correo
  (**mailto:**) con la versión ya puesta: sin servidor, nada sale del dispositivo salvo
  lo que tú escribas y envíes.
- Preparado para la **Biblioteca** (ver todos los archivos y su uso), que llega en la
  siguiente entrega.

## 4.15.0 — 21 ago 2026 · área segura del texto

- Nueva herramienta **área segura** (nivel Carrusel): un **margen guía** dentro del que
  colocar el texto, para no dejarlo pegado a los bordes que Instagram recorta. Se dibuja
  como rectángulo punteado en el editor y es **solo guía: no se exporta**.
- El texto se **imanta a las paredes** del margen: al arrastrar, sus bordes se pegan al
  rectángulo (tope blando). Si el texto es más grande que el margen, puede salirse.
- Ajustable en pasos (off · 3% · 5% · 7% · 10% del ancho).

## 4.14.1 — 21 ago 2026

- La **caja del texto se ajusta al contenido** en vez de ocupar un ancho fijo del 80%:
  la selección queda pegada a las letras, sin espacio muerto ni sensación de invadir
  la foto de al lado. Las líneas se parten solo con **Enter** (en "escribir").

## 4.14.0 — 21 ago 2026 · imanes (snapping) del texto

- Al **arrastrar** un texto, su centro se **imanta** a los centros vertical/horizontal
  de la **página** y de **cada foto**. Pasas cerca y se pega, sigues y se suelta;
  mientras está pegado aparece una **línea guía** y un toque háptico al enganchar.
- Cada eje es independiente (puedes quedar centrado en X pero libre en Y).

## 4.13.0 — 21 ago 2026

- Nueva herramienta **estilo**: **negrita** y **cursiva** por texto (toggles). Inter y
  Serif traen cursiva propia; la Escrita se inclina de forma sintética (no tiene
  cursiva real).
- Nueva herramienta **interlineado**: espacio entre líneas, con puntitos (se nota en
  textos de varias líneas).

## 4.12.1 — 21 ago 2026

- **Giro** del texto con **botones** (vuelta 0/90/180/270 + ajuste fino ±½°), igual que
  la foto, para más precisión.
- **Tamaño** con **puntitos** (deslizador por pasos, como el gap), mostrando el % del
  alto de página.
- **Alineación** separada de **escribir**: cada una es su propia herramienta.

## 4.12.0 — 21 ago 2026 · texto como nivel propio

- **Texto es ahora un nivel** en el breadcrumb: `Carrusel › Página › Texto`, igual que
  Foto. Al añadir o tocar un texto se entra en ese nivel; se sube tocando **Página**.
- El panel deja de amontonar todos los ajustes (que obligaba a hacer scroll en el
  móvil): ahora es una **fila de herramientas** y cada una abre su mini-panel —
  **escribir** (contenido + alineación), **fuente**, **tamaño**, **color**, **giro** y
  **orden**. Cada glifo muestra el valor actual (la "Aa" en su tipografía, el color, el
  ángulo…).
- El **orden (capa) entre textos** es su propia herramienta: adelante/atrás de uno en
  uno, siempre por encima de las fotos.

## 4.11.0 — 21 ago 2026 · textos, fase 1

- Nueva herramienta **texto** en el nivel Página: añade textos que van **siempre por
  encima** de las fotos. Cada texto elige por separado **fuente** (Sans/Serif/Escrita/
  Mono), **color**, **tamaño**, **giro** y **alineación**.
- Se **arrastra** sobre la página para colocarlo; su panel permite editar el contenido
  y ordenar los textos entre sí **de uno en uno** (adelante/atrás), no de golpe.
- Se ve igual en el editor, el feed, la miniatura del perfil y el **export** (imagen y
  vídeo): misma fuente de verdad. Las fuentes van **empaquetadas en local** (sin CDN),
  solo el subconjunto latino.
- (Texto en el nivel Foto queda descartado a propósito.)

## 4.10.2 — 20 ago 2026

- Los avisos (foto repetida, sin audio) se mueven a la esquina **superior derecha**,
  separados de los **metadatos** (dimensiones/peso), que se quedan abajo-izquierda.
  Así dejan de pisarse.

## 4.10.1 — 20 ago 2026

- El badge de "sin audio" ahora es **igual que el de foto repetida** (mismo tamaño,
  color y esquina) en vez del fondo neutro anterior. El aviso de duplicado se queda
  en su sitio y el de audio va al lado.

## 4.10.0 — 20 ago 2026

- Los vídeos muestran un **iconito de "sin audio"** en la celda (como el aviso de foto
  repetida), para recordar que el export va mudo en esta versión.
- Nueva herramienta **audio** en el nivel Foto (solo vídeos): de momento al pulsarla
  sale un aviso de que esta versión todavía no admite audio. Deja el hueco listo para
  cuando se pueda quitar/poner sonido.

## 4.9.0 — 20 ago 2026

- Export de vídeo con **FPS originales**: antes se remuestreaba todo a 30 fps
  (duplicando o tirando fotogramas). Ahora se recorren los fotogramas reales del
  vídeo y cada uno entra con su timestamp/duración propios, así que se conserva la
  cadencia original (60 fps siguen siendo 60; también VFR).
- **Más calidad**: el codificador sube a `QUALITY_VERY_HIGH` para reducir la pérdida
  del re-encode (ficheros algo más grandes; Instagram recomprime igual, pero parte
  de una fuente más limpia).

## 4.8.1 — 20 ago 2026

- Arreglado: los vídeos **verticales de móvil** se exportaban **girados 90° y
  estirados**. Los móviles graban el fotograma en horizontal + una marca "rota 90°
  al mostrar"; ahora el export aplica esa rotación al componer (usa `VideoSample.draw`
  en vez del fotograma crudo), así que el clip sale con la orientación y proporción
  correctas.

## 4.8.0 — 20 ago 2026 · vídeo, fase 3 (export a MP4)

- **Export mixto foto + vídeo**: al exportar, cada página se codifica según lo que
  tenga. Una página **con vídeo** sale como **MP4** (H.264, 1080 px, sin audio en
  esta v1); una página **solo de fotos** sigue saliendo como imagen (PNG/JPG). Así
  un carrusel puede mezclar clips y fotos, en el orden que montaste.
- El vídeo se decodifica fotograma a fotograma con Mediabunny, **recortado a
  \[inicio, fin]**, y se compone con las demás celdas usando la misma fuente de
  verdad que el preview (`drawRegion`) — las fotos de esa página van a resolución de
  export, no la miniatura.
- La hoja de export ya distingue **imágenes/vídeos/archivos**, reproduce los clips
  en las miniaturas, y **Compartir** manda los ficheros mixtos a Instagram → Feed.
  El progreso muestra el **% del fotograma** mientras codifica cada vídeo.
- Fuera el **spike (beta)** de export a vídeo: ya existe la función real.

## 4.7.1 — 20 ago 2026

- Recorte: fuera la previsualización propia de la timeline — **el área de trabajo es
  el preview** y ahora reproduce en bucle solo el trozo elegido (inicio/fin). Y la
  barra se separa de los bordes de la pantalla, para no chocar con el gesto de
  "atrás" de Android.

## 4.7.0 — 20 ago 2026 · vídeo, fase 2 (recortar)

- Herramienta **recortar** para celdas de vídeo (nivel Foto): una línea de tiempo
  con dos manijas para elegir **inicio y fin**, con el clip limitado a **30 s**. Al
  arrastrar, la previsualización busca ese fotograma. En vídeos, girar/espejo se
  ocultan (son para píxeles de foto). El recorte se aplicará en el export (fase 3).

## 4.6.0 — 20 ago 2026 · vídeo, fase 1 (importar + previsualizar)

- Las celdas ya **aceptan vídeos** (además de fotos): el `+` y "cambiar" abren
  fotos o vídeos. El vídeo se **previsualiza reproduciéndose** en la celda, con el
  mismo encuadre (contain/zoom) que una foto, y se guarda/recarga con el proyecto.
- Miniaturas, feed y perfil muestran un **póster** (primer fotograma) del vídeo.
- Todavía **no** hay recortar (in/out) ni export a vídeo: una página con vídeo se
  exporta de momento como el póster estático. Eso llega en las fases 2 y 3.

## 4.5.0 — 20 ago 2026

- **Spike (beta) de export a vídeo**: en la hoja de export, un botón que codifica las
  páginas como un MP4 (H.264) en el propio dispositivo, con WebCodecs + Mediabunny.
  Sirve para MEDIR si el móvil aguanta antes de construir la función real
  (foto + vídeo en un layout). Mediabunny se carga bajo demanda (chunk aparte), así
  que no pesa en el arranque. Solo aparece si el navegador puede codificar (iOS 16.4+
  / Chrome 94+). Sin audio todavía. Nada sale del dispositivo.

## 4.4.0 — 20 ago 2026

- **Fuera las pestañas Post/Página/Foto**; en su lugar un **breadcrumb**
  `Carrusel › Página N › Foto`. Se baja tocando contenido (una página, una foto) y
  se sube tocando un tramo del camino. Quita el nivel de navegación abstracto: la
  selección y el camino lo cuentan. Siempre hay forma de volver a Carrusel.

## 4.3.1 — 20 ago 2026

- Ajuste del feedback de selección: la atenuación de las demás fotos es más suave
  (menos agresiva) y la animación del panel al cambiar de nivel, más marcada.

## 4.3.0 — 20 ago 2026

- Más feedback de selección (estilo Figma), primer paso hacia menos dependencia de
  las pestañas: al seleccionar una foto en Página, **las demás se atenúan** (siguen
  tocables), y el **panel de herramientas entra con una pequeña animación** al
  cambiar de nivel, para que se note que ha cambiado.

## 4.2.1 — 20 ago 2026

- La hoja de export **explica el flujo de compartir**: toca Compartir → Instagram →
  Feed y se suben como carrusel en orden. El truco no era evidente; ahora hay un
  texto claro sobre el botón. El ZIP queda como alternativa secundaria.

## 4.2.0 — 20 ago 2026

- **Botón "Compartir"** en la hoja de export (móvil): abre la hoja de compartir
  nativa con todas las páginas. Al elegir Instagram → Feed, las sube como un
  **carrusel** en orden. Usa la Web Share API; solo aparece si el navegador
  soporta compartir ficheros. El ZIP y las descargas siguen como alternativa.

## 4.1.0 — 20 ago 2026

- **Renombrado de Carrete a Maqueta**: nombre de producto, título, marca de la
  cabecera, README, `package.json` y el nombre por defecto del ZIP. La base de
  datos local (IndexedDB) sigue llamándose `carrete` a propósito, para no perder
  los proyectos ya guardados.
- **Export fijo a 1080 px de ancho**, el tamaño nativo del feed de Instagram (4:5 →
  1080×1350, 3:4 → 1080×1440). Antes eran 1440 y IG los reducía a 1080 igualmente.
  Se retira la opción de tamaño: sale de `exportSize(ratio)`.
- Este `CHANGELOG.md` con todo el historial (incluida la versión de un solo fichero).

## 4.0.0 — 18–20 ago 2026 · reescritura en React + Vite

- Reescrito en **React + Vite**. La lógica pura (geometría, color, modelo del
  post) vive en `src/core` y está cubierta por tests.
- **Contain**: al añadir una foto entra entera, sin recorte forzado; el zoom es
  opcional y los huecos muestran el color de fondo del post.
- Nivel **Página** como tira horizontal con scroll: todas las páginas montadas,
  ~3 visibles, la del centro es la activa. Añadir y borrar página; reordenar
  arrastrando.
- Nivel **Foto**: se ve solo la celda seleccionada, a su forma, llenando el área
  de trabajo (aprovecha todo el alto de la pantalla). Herramienta **mover**
  (ajuste fino con flechas) y retícula de **tercios**.
- Transiciones entre Post / Página / Foto y micro-interacciones al pulsar y al
  seleccionar (ratio, formato, pestañas).
- Cabecera simplificada: nombre + versión y pantalla completa. El historial deja
  de estar dentro de la app y pasa a este archivo.
- Sub-paneles con **título + subtítulo** y explicaciones breves de cada
  herramienta.
- **Despliegue** automático en GitHub Pages en cada push a `main`.

---

## Historial de la versión de un solo fichero


### 3.13.2 — 18 ago
- Abrir una página ya no dispara el selector de fotos. El toque que la abre se resolvía después de repintar y caía sobre el input de la celda vacía, que ocupa toda la superficie. Ahora hay una guarda de 400 ms tras abrir una página, añadir una nueva o cambiar de nivel.

### 3.13.1 — 18 ago
- Arreglado el salto al soltar el deslizamiento: la fila completaba el recorrido y luego hacía un segundo viaje animado de vuelta a su sitio, ya con la página nueva. Ahora el reposicionamiento va sin transición y es invisible.

### 3.13.0 — 18 ago
- Al deslizar, la página vecina entra entera. Antes los asomos eran cajas de 51px recortadas, así que solo asomaba ese trozo y detrás quedaba el fondo negro.
- Engancha al pasar del 45% del ancho de la página, o con un gesto rápido, y completa el recorrido con animación antes de repintar, sin salto.

### 3.12.1 — 18 ago
- Fuera la herramienta de navegar: en el nivel Página se desliza para cambiar de página siempre, sin entrar en ningún modo.
- Los gestos se separan por tipo en lugar de por modo: arrastrar lo atiende el lienzo y cambia de página; tocar lo atiende la foto y la selecciona. La celda escucha click en lugar de pointerdown, así que un arrastre nunca selecciona.

### 3.12.0 — 18 ago
- Nueva herramienta "páginas" en el nivel Página: dentro de ella se desliza el lienzo para cambiar de página, una por gesto, sin salir a Post ni usar las flechas.
- Mientras deslizas, el lienzo acompaña al dedo y los asomos de las vecinas entran con él. En la primera y la última hay resistencia.
- Dentro de esa herramienta las fotos no responden al toque, así que no hay duda entre navegar y seleccionar.

### 3.11.0 — 18 ago
- Formato de salida elegible: JPG al 95% o PNG sin pérdida, para no añadir recompresión al montar. Se guarda con el proyecto.
- El export genera blobs en lugar de cadenas base64, que con PNG serían varios megas por página, y los libera al cerrar la hoja.

### 3.10.3 — 18 ago
- La pestaña de Foto se ve apagada sin foto seleccionada, y al tocarla avisa de que hay que tocar una foto de la página.
- Mismo trato para las demás opciones apagadas: mover sin dos fotos, o duplicar al llegar al límite de páginas. Un botón deshabilitado no puede explicar por qué no funciona.

### 3.10.2 — 18 ago
- Las dos filas del giro comparten una retícula de cuatro columnas: los cuatro bloques de vuelta arriba, y abajo medio grado, el ángulo ocupando las dos columnas centrales, y medio grado. Todo alineado a la misma cuadrícula.

### 3.10.1 — 18 ago
- El giro se descompone en vuelta y ajuste, que ahora son independientes: si has enderezado +1,5° y pulsas 90°, quedas en 91,5° en lugar de perder el ajuste.
- La fila de ajuste se reduce a tres controles y ya no hay que deslizarla: medio grado a cada lado y el ángulo en medio, que además es el botón de volver a recto.

### 3.10.0 — 18 ago
- Giro libre: además de 0, 90, 180 y 270, ajuste de medio grado en medio grado para endilar un horizonte, con la desviación respecto al cuarto de giro más cercano y un botón para volver a recto.
- El encuadre gira con la foto en cualquier ángulo, no solo en múltiplos de 90.
- Con ángulos libres el preview pasa a PNG, porque JPEG no tiene transparencia y pintaría de negro las esquinas vacías.
- Al exportar se decodifica el original a la escala que necesita la caja girada, sin traerse la foto entera a memoria.

### 3.9.3 — 18 ago
- Arreglado: en Post no se podía seleccionar una página. Fuera de la herramienta de mover, el primer movimiento del dedo anulaba el toque, y cualquier toque real mueve un píxel. Ahora solo lo anula el navegador cuando se queda el gesto para desplazar el carrusel.

### 3.9.2 — 18 ago
- Arreglado el intercambio de fotos en el nivel Página: al soltar se apagaban las marcas antes de leer el destino, y esa misma función es la que lo guarda, así que el destino llegaba vacío y no se intercambiaba nada.

### 3.9.1 — 18 ago
- Duplicar y borrar salen de la fila de herramientas y aparecen como dos iconos justo encima de la página seleccionada, así que se desplazan con el carrusel y se ve sobre qué actúan.
- Se ocultan dentro de la herramienta de mover, donde estorbarían al arrastre.

### 3.9.0 — 18 ago
- Mover es una herramienta, en Post y en Página: solo se arrastra dentro de ella, así que fuera no hay duda entre desplazar y reordenar.
- Arreglado de paso: fuera de la herramienta, el carrusel de Post se desplaza arrastrando sobre las miniaturas. Antes solo se podía por los huecos entre ellas.
- Fuera las asas de las fotos: dentro de la herramienta de mover se arrastra la foto entera, y el lienzo queda limpio.
- Las flechas izq/der pasan dentro de la herramienta de mover; duplicar y borrar quedan como cajas del nivel Post.

### 3.8.2 — 18 ago
- Fuera la herramienta de rellenar huecos del nivel Página: las fotos se ponen tocando cada hueco.

### 3.8.1 — 18 ago
- Al empezar a arrastrar una foto o una página, la marca de selección pasa a la que estás moviendo. Antes podía quedarse en otra y se confundía qué estabas moviendo con qué ibas a editar.

### 3.8.0 — 18 ago
- Al salir de Página a Post, el carrusel se coloca de golpe con esa página centrada y el alejamiento parte de ella: se lee como una sola cámara que retrocede.
- El origen del zoom se toma de la posición real de la miniatura ya con el desplazamiento aplicado, así que en la primera y la última página, donde no se puede centrar, el efecto sigue saliendo del sitio correcto.
- Salir de Post por la pestaña se comporta igual que tocar la miniatura.

### 3.7.4 — 18 ago
- El icono del gap es una cota completa: bloque, línea azul, la cifra, línea azul, bloque. El número va dentro del dibujo.
- La caja de layout dibuja la rejilla elegida con su proporción real centrada en el cuadro; antes se aplastaba al forzarla a cuadrada y no se distinguía.

### 3.7.3 — 18 ago
- Fuera los distintivos de texto: el dibujo es el valor y la etiqueta el nombre de la herramienta. El cuadrado cambia de color pero sigue diciendo "color"; el de layout muestra la rejilla elegida.
- El icono de girar muestra la orientación real de la foto, con una marca en el borde que era el de arriba.
- Un solo sitio para añadir páginas: el rectángulo de línea discontinua al final del carrusel de Post. Fuera el + pequeño de la barra de página.
- Eliminadas tres funciones duplicadas que se habían colado en parches anteriores.

### 3.7.1 — 18 ago
- Cada caja dice las dos cosas: la etiqueta, qué hace la herramienta; un distintivo arriba a la derecha, cómo está ahora. Así ratio muestra 3:4, gap su valor, girar los grados y espejo o tercios si están puestos.
- El dibujo del gap pasa a ser dos bloques con líneas de cota a los lados del hueco, como en un plano, para que se entienda que lo que se ajusta es esa distancia.
- La caja de layout muestra la rejilla actual y cuántos huecos tiene.

### 3.7.0 — 18 ago
- Los tres niveles funcionan igual: una fila de cajas cuadradas iguales, entras en una y vuelves con la flecha.
- En Página, el layout es una herramienta: entras y ves la lista completa de rejillas. Rellenar huecos es otra caja.
- En Post, las cajas de proporción, gap y fondo muestran el valor actual dentro: la forma del ratio, el dibujo de la separación real y el color elegido.

### 3.6.0 — 18 ago
- Las herramientas tienen subniveles: entras en una, ajustas lo suyo y vuelves con la flecha al listado.
- En Post, la proporción, el gap y el fondo son tres cajas en lugar de tres filas apiladas.
- En Foto, girar abre un selector de ángulo: 0, 90, 180 o 270 grados, en lugar de ir sumando 90 a ciegas.
- Al cambiar de nivel se vuelve siempre al listado de herramientas.

### 3.5.3 — 18 ago
- En Post, el carrusel de páginas se desplaza para dejar a la vista la página abierta cuando navegas con las flechas o la mueves con izq/der.
- Si has desplazado el carrusel a mano, se respeta: solo se recentra cuando cambia la página abierta.

### 3.5.2 — 18 ago
- El tamaño de la foto vuelve a estar pegado a la esquina, agrupado con el aviso de foto repetida en un mismo bloque.
- El destino del intercambio se marca con esquinas verdes discontinuas en las dos esquinas libres, no con el color de la etiqueta de tamaño. Selección: azul continuo; destino: verde discontinuo.

### 3.5.1 — 18 ago
- Fuera los tercios en el nivel Página: solo se dibujan sobre la foto seleccionada, desde el nivel Foto, que es cuando sirven para encuadrar.

### 3.5.0 — 18 ago
- El gap se ve en tiempo real también en el nivel Post: antes solo repintaba el lienzo, que ahí no es lo que se muestra.
- El fondo vuelve a tener su propia fila, aunque la zona de herramientas tenga que deslizarse.
- La selección se marca con esquinas azules en lugar de un recuadro blanco, que podía leerse como parte del gap.

### 3.4.2 — 18 ago
- Al abrir una página desde Post, el acercamiento sale de la miniatura que has tocado y no del centro del área.

### 3.4.1 — 18 ago
- Las pestañas ya no bailan al cambiar de nivel: en Post se ocultaba la barra de página y eso subía todo 46px, medidos sobre las capturas. La barra se queda en los tres niveles.
- Animación al pasar de Página a Post y al revés: alejarse entra desde grande y acercarse desde pequeño, con el origen del zoom en la página que tenías abierta.

### 3.4.0 — 18 ago
- En Foto los asomos se cierran y la página crece un 22% para ocupar ese espacio: acercarse a la foto ahora se nota.
- El área se dimensiona para el caso Foto, así que en Página la página es la pequeña y sobra aire. El hueco sigue siendo idéntico en los tres niveles.
- El cambio de nivel se anima, para que se lea como un acercamiento y no como un salto.
- Añadida una garantía: si la cabecera y las herramientas ocupan más de lo previsto, el área cede lo justo para que la página no haga scroll.

### 3.3.0 — 18 ago
- En el nivel Página asoma una quinta parte de la página anterior y de la siguiente, a la misma escala, suficiente para ver qué layout tienen.
- La zona de herramientas tiene altura fija en los tres niveles y hace scroll por dentro cuando un nivel tiene más controles. El área de trabajo ya no cambia nunca de tamaño.

### 3.2.0 — 18 ago
- En Post caben unas 4 páginas y media a la vez: el tamaño se calcula desde cuántas deben verse, no desde una fracción de la altura.
- Al arrastrar una página hasta el borde, el carrusel se desplaza solo, con velocidad según lo cerca que esté el dedo. Sin eso no había forma de llevar la página 10 a la primera posición.
- El destino se sigue recalculando mientras el carrusel se mueve, aunque tengas el dedo quieto.
- Tras reordenar, la página movida queda centrada a la vista.

### 3.1.5 — 18 ago
- Las miniaturas de Post salían deformadas: medidas sobre una captura, una de ellas tenía proporción 0,49 en lugar de 0,75. El ancho se calculaba a partir de la proporción intrínseca del canvas y no siempre se resolvía; ahora alto y ancho van en píxeles.

### 3.1.4 — 18 ago
- El área de trabajo mide exactamente lo mismo en Post, Página y Foto. Su altura se calcula en píxeles en lugar de depender de una cadena de porcentajes que en Post colapsaba al alto del contenido.
- El contenido va centrado en horizontal y en vertical dentro del área, así que en Post lo que sobra es aire alrededor de las miniaturas.
- La altura se recalcula al girar el móvil o al ocultarse la barra del navegador.

### 3.1.3 — 18 ago
- La página mantiene exactamente el mismo tamaño en Página y en Foto. Al ocultar los asomos se reserva su hueco: antes desaparecían del flujo y el lienzo se ensanchaba 30px, dando la impresión de que cambiaba la proporción.

### 3.1.2 — 18 ago
- Los avisos flotantes son opacos: el tinte de color se superpone al panel en lugar de sustituirlo.
- En el nivel Post, un toque selecciona la página y el segundo la abre en el nivel Página. El doble clic también.

### 3.1.1 — 18 ago
- La altura del área ahora tiene en cuenta también el ancho disponible: antes en 4:5 reservaba 575px para un lienzo de 414 y dejaba franjas muertas.

### 3.1.0 — 18 ago
- El área de trabajo mantiene siempre la misma altura en los tres niveles: nada salta al cambiar de distancia.
- En Post las páginas van en carrusel horizontal, no en rejilla, al 64% de la altura y centradas, con aire alrededor.
- La zona de herramientas tiene altura mínima común, y en Post el gap y el fondo comparten fila para no crecer tanto.

### 3.0.1 — 18 ago
- Botones de mover a izquierda y derecha en el nivel Post, además del arrastre: paso a paso es más preciso y no depende del pulso.

### 3.0.0 — 18 ago
- El nivel ahora también es una distancia. Post se aleja y muestra las páginas en pequeño, en rejilla, para verlas todas de un vistazo.
- Las páginas se reordenan arrastrando una sobre la posición de otra: se mueve e inserta, no se intercambia. El destino se marca en verde y vibra.
- Duplicar y borrar página pasan al panel del nivel Post, y desaparece el menú de tres puntos.
- En el nivel Página asoman las vecinas; en Foto se ocultan.

### 2.4.0 — 18 ago
- Botón de pantalla completa en la cabecera: oculta la barra del navegador y la de estado, y el lienzo aprovecha esa altura.
- El icono cambia según el estado y se sincroniza si sales con el gesto de atrás.

### 2.3.2 — 18 ago
- Los avisos flotantes ocupan el ancho de la pantalla con un margen, y toman el color del icono que los abre: naranja el de foto repetida, ámbar los límites.
- Una barra inferior va vaciándose para mostrar el tiempo que queda.

### 2.3.1 — 18 ago
- Vibración del selector de separación más firme (12 ms en lugar de 8) y un pulso más largo al llegar al primer o último paso, como cuando una ruedita hace fondo.
- En el Historial hay una prueba de vibración, para saber si no se nota por el navegador o por los ajustes del móvil.

### 2.3.0 — 18 ago
- El aviso de fotos repetidas ya no ocupa una franja permanente bajo el lienzo: queda el cuadradito naranja en la foto y, al tocarlo, sale un aviso superpuesto arriba con las páginas donde está.
- Los avisos flotantes salen arriba y duran cinco segundos.

### 2.2.3 — 18 ago
- Las herramientas de foto van en una fila deslizable con botones del mismo ancho, así que su tamaño no depende de cuántas haya.
- Vuelve el botón de cambiar foto, junto a quitar: uno reemplaza y el otro deja el hueco vacío.

### 2.2.2 — 18 ago
- Fuera el botón de cambiar foto: quitar y tocar el hueco son dos pasos, pero permiten dejarlo vacío y liberan espacio abajo.

### 2.2.1 — 18 ago
- Convención de escritorio: fuera del nivel Foto, un toque en la imagen la selecciona y el segundo la abre para editarla. El doble clic también abre.
- Así en Página se ve qué foto está seleccionada antes de bajar a Foto.

### 2.2.0 — 18 ago
- Las tres pestañas se eligen libremente. Antes el nivel se forzaba a Foto en cada render mientras hubiera una foto seleccionada, así que tocar Página no hacía nada y no había forma de volver.
- Terminar un intercambio ya no salta a Foto: sigues en Página ordenando.
- Encuadrar y ampliar son del nivel Foto. Tocar una foto en cualquier otro nivel entra en Foto con esa foto seleccionada.

### 2.1.1 — 18 ago
- Fuera el botón de capas: el nombre Carrete ya lleva al inicio.

### 2.1.0 — 18 ago
- Efecto espejo en el nivel Foto, junto a girar. Se aplica sobre lo que ves, así que combina con cualquier giro.
- El encuadre se voltea con la imagen: lo que estaba a un tercio del borde izquierdo queda a un tercio del derecho.
- El espejo entra en el historial de deshacer, se guarda con el proyecto y se aplica también al exportar desde el original.

### 2.0.3 — 18 ago
- Recuperados dos estilos que se perdieron en una limpieza: el de los avisos, cuyo icono se estiraba hasta ocupar la pantalla, y el de la cuadrícula de tercios, que era la razón real de que no se viera nada al activarla.
- Los iconos llevan ahora tamaño propio, así que ninguno puede volver a estirarse por falta de CSS.

### 2.0.2 — 18 ago
- Arreglado: el lienzo se dibujaba con el nivel del render anterior, así que lo que mostraba no coincidía con el panel. Ahora el nivel se resuelve antes de dibujar.
- La cuadrícula de tercios vuelve a estar en el nivel Página, sobre la página entera, además de en Foto sobre la foto seleccionada.

### 2.0.1 — 18 ago
- Al arrastrar el asa, el hueco de destino se marca en verde con borde discontinuo y un tinte, para no confundirlo con el borde blanco de selección.
- Un pulso de vibración al entrar en cada hueco nuevo, así se confirma el destino sin mirar.

### 2.0.0 — 18 ago
- Los ajustes se organizan en tres niveles con un solo panel: Post (proporción, gap, fondo), Página (rejilla y orden de las fotos) y Foto (girar, tercios, centrar, cambiar, quitar).
- El nivel lo decide la selección: tocar una foto baja a Foto, deseleccionar vuelve a Página. No hay modos que recordar.
- El lienzo queda limpio: los botones que tapaban la imagen se han ido al panel.
- El asa de intercambio pasa a ser del nivel Página y aparece en todas las fotos, no solo en la seleccionada.

### 1.10.0 — 18 ago
- Intercambiar fotos entre huecos: la celda seleccionada muestra un asa arriba a la derecha y se arrastra hasta otro hueco. El destino se marca con línea discontinua y el origen se atenúa.
- El gesto arranca en el asa y no sobre la foto, así que no choca con el encuadre y no hace falta un modo aparte.
- El encuadre viaja con la foto; si el hueco destino tiene otra proporción se reencuadra al entrar.
- Vale también para mover a un hueco vacío, y es un solo paso de deshacer.

### 1.9.4 — 18 ago
- El menú de la página va sin separadores: la caja ya delimita el bloque y quedaba abierto por arriba. Las opciones se distinguen por espaciado.

### 1.9.3 — 17 ago
- El botón de proyectos y el nombre Carrete llevan al inicio: es navegación, no una vista más que se alterna.
- Todos los proyectos de la lista tienen botón de abrir, también el último que estuvieses editando. Fuera la etiqueta de "abierto".

### 1.9.2 — 17 ago
- Cada proporción muestra su forma dibujada, todas a la misma escala, para ver de un golpe cuál es más vertical y cuál más apaisada.

### 1.9.1 — 17 ago
- El botón de proyectos sube a la fila del nombre y la versión: es un nivel por encima del editor, no una acción del documento.
- En Proyectos y en Historial se oculta la fila de vistas, Exportar y los datos del post: solo se ve la lista.

### 1.9.0 — 17 ago
- La proporción sale de la cabecera y se agrupa con el gap y el fondo en "Ajustes del post", plegable: son las tres cosas que se fijan una vez por post.
- Plegado muestra el estado actual (4:5 · gap 0 · blanco), así que no hay que abrirlo para comprobarlo.
- Cabecera: el nombre a la izquierda y la versión al final de su fila. Debajo, las vistas a la izquierda y proyectos, deshacer y Exportar a la derecha.
- La cuadrícula de tercios pasa a la barra bajo el lienzo, junto a lo que afecta.

### 1.8.2 — 17 ago
- El botón de opciones de la página era invisible: sus tres puntos eran trazos de longitud cero y el navegador no los pintaba. Por eso el de añadir parecía suelto.
- La barra de página se alinea con la misma columna de 16px que el resto de los controles.
- Arreglado también el punto del triángulo de aviso de fotos repetidas.

### 1.8.1 — 17 ago
- Sin barra de scroll en el selector de layouts: una línea menos en pantalla.

### 1.8.0 — 17 ago
- Fuera la tira de miniaturas de abajo: el lienzo gana ese espacio.
- En su lugar, una barra fina bajo el lienzo con la página actual, flechas para navegar, añadir página y un menú de opciones.
- El menú de la página incluye mover, duplicar y borrar. Borrar la 2 deja la 3 convertida en 2.
- Navegar sigue siendo de un toque en los asomos laterales.

### 1.7.1 — 17 ago
- Tope de 20 páginas, el máximo que admite un carrusel de Instagram: el botón de añadir se apaga al llegar y el contador aparece a partir de la 16.

### 1.7.0 — 17 ago
- Asoma el borde de la página anterior y la siguiente a los lados del lienzo, para juzgar la continuidad del carrusel mientras montas.
- Tocar el asomo salta a esa página.
- El hueco de los asomos se reserva también en la primera y la última, así el lienzo no salta al navegar.

### 1.6.1 — 17 ago
- El botón de nueva página ocupa exactamente el mismo recuadro que una miniatura, con cualquier ratio.
- El separador de los accesos rápidos llega de arriba abajo de la barra.
- Los glifos de layout tienen zona tocable de 44px: Chrome avisaba de que estaban demasiado juntos para saber a cuál apuntabas.
- El icono de cambiar foto se lee mejor.

### 1.6.0 — 17 ago
- La tira de páginas se queda pegada abajo y en una sola fila, con mover y borrar a la derecha: cambiar de página ya no obliga a bajar scroll.
- El lienzo se ajusta a la altura disponible, así que en un móvil normal todo cabe sin scroll. En pantallas cortas se encoge en lugar de empujar las herramientas fuera de la vista.
- El selector de layout y el gap siguen en el flujo normal: se tocan una vez por página y no merecen quitarle altura al lienzo.

### 1.5.3 — 17 ago
- Cabecera reorganizada para móvil: la versión va bajo el logo y los datos del proyecto en su propia línea, en horizontal sobre el lienzo. Antes el nombre partía en tres líneas y Exportar se salía de la pantalla.
- La pestaña de la cuadrícula del perfil se llama Perfil, para que las tres quepan sin cortarse.

### 1.5.2 — 17 ago
- Borrar el último proyecto ya deja el estado vacío de verdad, en lugar de recrear uno y parecer que no ha hecho nada.
- Sin proyecto abierto, el editor y el export quedan desactivados y se ve la lista.
- Arreglado un guardado pendiente que podía resucitar un proyecto recién borrado.

### 1.5.1 — 17 ago
- Cada foto muestra en pequeño las dimensiones y el peso del archivo original.

### 1.5.0 — 17 ago
- Varios proyectos: lista con nombre editable, abrir, duplicar y borrar. Empezar uno nuevo ya no destruye el anterior.
- El nombre del proyecto abierto se ve en la cabecera.
- Al cambiar de proyecto solo se cargan en memoria sus fotos; las del resto se liberan.
- Las fotos en disco se borran solo cuando no las usa ningún proyecto.

### 1.4.0 — 17 ago
- Cuadrícula de tercios opcional para encuadrar: sobre la celda seleccionada, o sobre la página entera si no hay ninguna.
- Fuera el aviso de nitidez al ampliar: al ampliar ya se ve.
- IndexedDB reutiliza una sola conexión en lugar de abrir una por operación.

### 1.3.0 — 17 ago
- El post sobrevive a recargar o cerrar el navegador: se guarda en el dispositivo, fotos incluidas.
- Botón de deshacer, hasta 40 pasos. Cubre layouts, páginas, añadir y quitar fotos, girar, encuadrar y el gap. Un encuadre completo cuenta como un paso, no uno por píxel.
- Acción de rellenar huecos cuando la página tiene dos o más libres, ahí sí con selección múltiple.
- En el Historial, opción de empezar un post nuevo y borrar lo guardado.

### 1.2.0 — 17 ago
- Aviso de fotos repetidas: un cuadradito naranja en la esquina de cada copia y una línea indicando en qué páginas está.
- La repetición se detecta por el contenido del archivo, así que también la pilla si has importado la misma foto dos veces por separado.
- El fondo ahora es blanco, negro o un color personalizado con el selector del sistema, y el elegido lleva un tick.

### 1.1.3 — 17 ago
- El feed avanza exactamente una página por gesto, por muy fuerte que sea el swipe. Antes la inercia podía saltarse varias.
- Resistencia al arrastrar más allá de la primera o la última.

### 1.1.2 — 17 ago
- Cambiar a un layout con menos huecos avisa antes, diciendo cuántas fotos se conservan y cuántas se quitan. Si los huecos que desaparecen estaban vacíos, no pregunta.
- Las fotos que dejan de usarse liberan memoria en lugar de quedarse cargadas.

### 1.1.1 — 17 ago
- Cada slide vuelve a llevar su borde completo: mirando una sola, la imagen queda centrada.

### 1.1.0 — 17 ago
- El gap ahora es la separación real: el valor elegido es lo que se ve, tanto entre fotos como en el borde. Antes la costura interior salía al doble que el borde.
- La separación se elige sobre una escala de puntos (0 a 48) con vibración en cada paso, en lugar de un deslizador continuo.

### 1.0.9 — 17 ago
- Historial de versiones como sección propia, con el detalle de cada cambio.

### 1.0.8 — 17 ago
- Marca de versión visible en la cabecera y en el título de la pestaña.

### 1.0.7 — 17 ago
- El selector de fotos ya no permite multiselección: una celda, una foto.

### 1.0.6 — 17 ago
- El feed ya no muestra la barra de scroll.
- Las bolitas siguen el swipe y llevan a su página al tocarlas.

### 1.0.5 — 17 ago
- Fuera el panel de zoom: ampliar y encuadrar se hacen solo con gestos.
- Girar, cambiar y quitar la foto, en tres cuadraditos sobre la celda.
- El aviso de resolución solo aparece cuando de verdad afecta al resultado.

### 1.0.4 — 17 ago
- Arreglado el encuadre del área de trabajo: perdía el aspecto de la celda y descartaba la posición vertical, así que arrastrar en vertical no hacía nada.
- Preview y export coinciden al píxel, verificado sobre cientos de combinaciones.

### 1.0.3 — 17 ago
- Girar conserva el zoom y rota el punto focal con la foto.
- Al exportar una foto girada ya no se decodifica a resolución completa.

### 1.0.2 — 17 ago
- El lienzo usa aspect-ratio y las celdas van en porcentajes: ya no depende de medir el contenedor.
- Los previews de feed y cuadrícula renderizan a resolución fija.

### 1.0.1 — 17 ago
- Inputs de fichero reales sobre cada celda, fuera del sandbox de artifacts.
- Los errores de lectura se muestran en pantalla en lugar de fallar en silencio.

### 1.0.0 — 17 ago
- Páginas con layout propio y 12 rejillas, sobre un lienzo de post continuo.
- Celdas con máscara: la foto cubre su hueco y no puede invadir el vecino.
- Selector de ratio, gap entre fotos y color de fondo.
- Vistas de feed y de cuadrícula del perfil con el recorte 3:4 real.
- Export a 1440 px decodificando siempre desde el original.
- Aviso y conversión a sRGB para fotos en Adobe RGB, Display P3 o ProPhoto.

