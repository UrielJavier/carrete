# Changelog

Cambios notables de **Maqueta** (antes *Carrete*), editor de carruseles para
Instagram.

El formato se inspira en [Keep a Changelog](https://keepachangelog.com/es/).
La versión se muestra en la cabecera de la app, así que el número que ves en
https://urieljavier.github.io/carrete/ dice qué build está desplegado.

Las versiones **1.0.0 – 3.13.2** son de la versión original de un solo fichero
HTML (el antiguo Carrete), conservada en `reference/carrete-3.13.2.html`.

## 4.40.1 — 24 ago 2026 · aviso de portada más claro

### Cambiado
- **La guía 3:4 de la primera página se explica mejor.** El rótulo pasa de "recorte
  3:4 · cuadrícula" a **"en tu perfil, esta portada se recorta a 3:4"**: deja claro
  que la 1ª página es la portada y que Instagram la recorta a 3:4 en la cuadrícula
  del perfil (por eso la guía solo sale ahí).

## 4.40.0 — 24 ago 2026 · aviso de color en cristiano y progreso al importar

### Cambiado
- **El aviso de color ya no es jerga.** En vez de "N fotos no están en sRGB…", ahora
  dice que esas fotos **pueden verse con colores apagados o distintos en Instagram**,
  el botón pasa a **«Ajustar colores»** y se aclara que **tu archivo original no se
  toca**.
- **Progreso al importar varias fotos/vídeos.** En vez de un "Leyendo…" fijo, muestra
  un contador **«Leyendo 2/5…»**, para que con vídeos grandes no parezca colgada.

## 4.39.1 — 24 ago 2026 · separación de páginas más clara en grupos

### Cambiado
- **Las páginas de un grupo que cruza páginas ya no se ven continuas.** El límite
  entre páginas pasa de una línea fina a una **banda del color del fondo** (como el
  hueco entre diapositivas del carrusel), para que se distinga bien cada página. Es
  solo visual (encima de la foto): por debajo la foto sigue continua y el encuadre no
  se descuadra.

## 4.39.0 — 24 ago 2026 · cambio de panel más claro y límite de página en grupos

### Cambiado
- **Se nota más el cambio del panel de abajo.** Al cambiar de nivel (o al abrir/
  cerrar una herramienta), el panel de herramientas se re-anima (aparece subiendo y
  creciendo un poco), para que quede claro que su contenido ha cambiado. Antes solo
  se animaba al cambiar de nivel y era muy sutil.
- **El foco de un grupo que cruza páginas marca el límite de cada página.** La foto
  se sigue viendo continua, pero ahora una línea señala el «doblez» entre páginas
  (donde el carrusel corta al deslizar), para no colocar ahí lo importante. Sin meter
  hueco extra: el espacio queda optimizado y el encuadre no se descuadra.

## 4.38.0 — 24 ago 2026 · encuadrar grupos que cruzan páginas

### Cambiado
- **Al encuadrar un grupo que cruza páginas, ahora se ve el grupo entero.** Antes se
  editaba «en su sitio» y solo se veía la página centrada, así que la otra mitad
  quedaba fuera y encuadrabas a ciegas. Ahora esos grupos se abren en un foco propio
  con las páginas que abarca puestas **lado a lado** (sin costura, como en el feed),
  escaladas para caber; el grupo completo queda a la vista mientras ajustas (mover,
  pinza, tercios). Los grupos de una sola página se siguen editando en su sitio.

## 4.37.0 — 24 ago 2026 · menos ruido, tercios en grupo

### Cambiado
- **Fuera la línea de metadatos del área de trabajo** (fecha/proyecto · páginas ·
  tamaño): no aportaba y quitaba aire. Ese alto se lo queda el lienzo.

### Corregido
- **La regla de los tercios ya funciona al encuadrar un grupo.** Antes solo salía
  al encuadrar una foto suelta; al ajustar la foto compartida de un grupo (en su
  sitio) el botón «tercios» no dibujaba nada. Ahora la rejilla se pinta sobre la
  región del grupo.

## 4.36.1 — 24 ago 2026 · sin "editar" mientras editas

### Corregido
- **El chip azul "editar" ya no aparece cuando ya estás editando.** Al encuadrar la
  foto de un grupo en su sitio (nivel Foto), la tira no se atenúa y el chip "editar"
  seguía saliendo sobre la celda seleccionada, aunque ya estuvieras editando. Ahora
  se oculta en nivel Foto.

## 4.36.0 — 24 ago 2026 · tocar el fondo sube un nivel

### Cambiado
- **Tocar el fondo negro sube un nivel de navegación.** Generaliza el gesto que ya
  sacaba del foco: ahora, en cualquier nivel, tocar el negro alrededor del contenido
  primero **cierra la herramienta** abierta (subpanel) y, si no hay ninguna, **sube
  en la jerarquía de composición** (Foto/Texto → Página → Post). En Post, que es lo
  más externo, no hace nada. Funciona en la tira de páginas, en el foco de Foto/Texto
  y en el rail de Post, sin robar los toques de celdas, miniaturas ni botones.

## 4.35.0 — 24 ago 2026 · aviso de resolución insuficiente

### Añadido
- **Aviso "baja res".** Cuando una foto no llega a la resolución de su hueco a
  1080 px, Instagram la ampliará y sale borrosa (la causa nº1 de carruseles
  borrosos). Ahora aparece una etiqueta **baja res** en la celda y un aviso en la
  hoja de export contando cuántas fotos lo sufren, para poder usar una foto más
  grande o darle un hueco más pequeño.

### Corregido
- **`upscaleReport` calcula bien la ampliación** con el modelo actual (*contain* a
  1080 px de ancho, vía `drawnWidth`), incluyendo la foto compartida de un grupo
  contra la caja del grupo. Antes seguía con la fórmula del modelo *cover* viejo.

## 4.34.1 — 24 ago 2026 · máxima calidad: original sin recomprimir

### Añadido
- **Export "máxima calidad" (passthrough del original).** Cuando una página es una
  **foto o vídeo a marco completo sin recomponer** (una sola celda, sin recorte,
  zoom, giro/espejo ni grupo, y con el mismo aspecto que el post), se entrega el
  **fichero original sin recomprimir** en vez de re-encodarlo. Beneficios:
  - No añadimos una generación de pérdida nuestra (canvas) antes de la única
    recompresión de Instagram.
  - **Fotos:** conserva la gama amplia **Display P3** de iPhone (antes la
    aplanábamos a sRGB).
  - **Vídeo:** conserva **códec, bitrate, HDR y AUDIO**, y se salta el transcode.
    (Solo si el vídeo no está recortado; con trim se sigue re-encodando.)
  - En la hoja de export, esos archivos se marcan como **original**.
- **Aviso de calidad en el export:** recuerda activar en Instagram *Ajustes ›
  Calidad de carga › Subir con la máxima calidad*, y que IG recomprime una vez.

### Notas
- El caso recompuesto (rejilla, recorte, grupos) se sigue exportando a PNG/1080,
  que ya era lo óptimo. El passthrough solo entra cuando no aporta nada re-encodar.

## 4.34.0 — 24 ago 2026 · tarjeta al compartir, README y tests de flujo

### Añadido
- **Tarjeta social (Open Graph).** Al compartir el enlace ahora sale una imagen de
  previsualización (`public/og.png`, 1200×630, coherente con la app) más meta tags
  `og:`/`twitter:` en `index.html`. El fuente reproducible está en `design/og.html`
  (se rasteriza con Chrome headless).
- **Tests de flujo (integración).** Nueva carpeta `tests/flows/` que recorre viajes
  de usuario completos por el reducer + `drawRegion`: ciclo de vida de un grupo
  (unir → añadir → quitar → disolver), grupo entre páginas, deshacer/rehacer, y un
  round-trip real de persistencia con `fake-indexeddb` que blinda que la foto de un
  grupo no se pierde al refrescar. 171 tests en total.

### Cambiado
- **README reescrito**: más presentable y al día (qué hace, las dos ideas que lo
  sostienen, estructura, decisiones de diseño), sin las partes ya obsoletas.

## 4.33.3 — 23 ago 2026 · chapas de grupo y tamaño sin repetir

### Corregido
- **La chapa del grupo (número + color) se ve aunque la celda esté vacía.** Antes
  solo aparecía si la celda tenía foto, así que un grupo recién creado sin foto no
  mostraba a qué grupo pertenecían sus celdas. Ahora se ve siempre que la celda
  esté unida.

### Cambiado
- **El tamaño de la foto ya no se repite en cada celda de un grupo.** Como el
  grupo comparte una sola foto, el rótulo de tamaño (p. ej. «1537×2048 · 296 k»)
  se muestra solo en la primera celda del grupo. Las celdas sueltas lo siguen
  mostrando cada una.

## 4.33.2 — 23 ago 2026 · grupos como herramientas

### Cambiado
- **Los grupos se pintan como herramientas (ToolBox), con estado tipo radio.**
  Cada grupo es una caja (cuadradito de color con su número + nº de celdas); solo
  uno puede estar activo a la vez. Elegir uno lo enciende para editarlo; no abre
  ningún subpanel.
- **El aviso «toca 2 o más celdas» solo sale en el estado vacío** (cuando aún no
  hay grupos). Si ya hay grupos, se da por sabido: el botón «Unir» aparece solo
  cuando ya has marcado 2+ celdas para un grupo nuevo.

## 4.33.1 — 23 ago 2026 · grupos: radios y foto persistente

### Corregido
- **La foto de un grupo ya no se pierde al refrescar.** Al calcular qué fotos
  usa un proyecto (para guardarlas, cargarlas y barrer huérfanas) solo se miraban
  las de las celdas, no la foto compartida de cada grupo: se borraba del disco
  como huérfana y al recargar no se volvía a cargar. Ahora hay una fuente única
  (`docImageIds`) que incluye celdas **y** grupos, usada en el barrido, la carga
  y la medida de tamaño. (Las fotos ya perdidas en refrescos anteriores no se
  pueden recuperar.)

### Cambiado
- **Los grupos se eligen como radios.** En la herramienta «grupos», los grupos
  existentes salen como una lista de radios: solo uno activo a la vez. Elegir uno
  lo enciende para editarlo (añadir/quitar celdas); tocarlo otra vez lo apaga.
- Se quita el botón «Separar grupo»: para deshacer un grupo, quítale celdas hasta
  que quede con menos de dos y se disuelve solo.

## 4.33.0 — 23 ago 2026 · gestión de grupos

### Cambiado
- **La herramienta «grupos» ahora se explica sola y lista tus grupos.**
  - Si aún no hay grupos, el panel solo explica cómo crear el primero (marca
    2+ celdas → Unir).
  - Si ya hay grupos, salen como chips (número + color + nº de celdas). Tocas
    el que quieras editar y su chip se **ilumina** (grupo activo), sin abrir
    ningún subpanel.
  - Con un grupo activo: tocar una celda libre la **añade** al grupo y tocar
    una celda suya la **quita**. El grupo activo se resalta en el lienzo y el
    resto se atenúa para ver de cuál se trata.
  - Botón **«Separar grupo N»** para deshacerlo entero.
- Crear un grupo ya no cierra la herramienta: el grupo nuevo aparece como chip
  y puedes seguir gestionando.

### Corregido
- **Ya no se separa una celda por error.** Antes, tocar una celda unida en la
  herramienta la separaba directamente. Ahora, si intentas «unir» una celda que
  ya pertenece a un grupo, sale un aviso (toast) en vez de sacarla sin querer;
  para quitarla, abres su grupo y la tocas.

## 4.32.2 — 23 ago 2026 · resalte del grupo

### Cambiado
- **El grupo entero se ilumina al seleccionar una de sus celdas.** En Página, al
  tocar una celda unida ya no se atenúan sus celdas hermanas: todo el grupo queda
  iluminado (editar su contenido edita el grupo entero). El resto de la página
  sigue atenuado para dar jerarquía.

### Corregido
- **El encuadre de grupo ya no encierra huecos ajenos.** El recuadro azul del
  encuadre dibujaba el *bounding box* del grupo, metiendo dentro celdas vacías del
  medio que no eran del grupo. Ahora el resalte de acento va **por cada celda del
  grupo**, así dibuja su forma real; la capa de gesto sigue capturando el arrastre
  sobre toda la región (lo necesita el paneo), pero sin borde engañoso.

## 4.32.1 — 23 ago 2026 · deshacer navega al cambio

### Añadido
- **Deshacer/Rehacer te llevan a donde ocurrió el cambio.** Cada entrada del
  historial guarda también la ubicación (modo Editar, nivel post/página/texto,
  página abierta y selección), así que al deshacer o rehacer la app te sitúa en
  la jerarquía donde se hizo el cambio para que lo veas en vez de dejarte en
  una pantalla distinta. Si el cambio afectaba a una foto que ya no existe, se
  cae con gracia al nivel Página.

## 4.32.0 — 23 ago 2026 · usabilidad

- **Rehacer**: botón junto a deshacer (un cambio nuevo invalida el rehacer). Experimentar
  sin miedo.
- **Estados vacíos guiados**: en una página sin fotos, los huecos **parpadean** suave
  para invitar a añadir la primera (y el hueco dice "añadir foto").
- **Señal de gesto**: al seleccionar una foto en Página aparece un botón **editar** —
  además del doble-toque— para que se vea que se puede abrir a encuadrar.

## 4.31.2 — 22 ago 2026

- Al editar la foto de un grupo, ahora se **atenúan las celdas que no son del grupo**,
  así solo destacan las suyas (antes se veía toda la página igual de destacada).

## 4.31.1 — 22 ago 2026

- Arreglado **borrar** la foto de un grupo (en Foto): antes quitaba la foto compartida
  pero las celdas volvían a mostrar su foto de antes de unir y quedabas atascado. Ahora
  vacía la foto del grupo **y** las de sus celdas (grupo vacío limpio) y sale a Página.

## 4.31.0 — 22 ago 2026 · unir entre páginas

- **Unir celdas entre páginas**: en la herramienta **grupos** puedes deslizar a otras
  páginas y seguir sumando celdas al grupo (la selección se conserva al cambiar de
  página). La foto compartida cubre la región aunque cruce la costura entre páginas —el
  clásico carrusel "sin costuras".
- El encuadre del grupo funciona igual aunque cruce páginas (se ajusta desde la parte
  visible y mapea sobre la región completa).

## 4.30.0 — 22 ago 2026

- Editar la foto de un grupo es ahora como una foto normal: **doble toque** en una
  celda unida entra en **Foto** y ahí encuadras (arrastrar/pinza), y usas **girar,
  espejo, tercios, centrar, mover…** sobre la foto compartida. Sin botón "encuadrar"
  aparte. El encuadre sigue haciéndose **en su sitio** (sin superfoco), sobre la región
  del grupo, para ver la composición.

## 4.29.0 — 22 ago 2026 · encuadre del grupo

- La foto compartida de un grupo ahora se **encuadra** (mover + ampliar). Con una celda
  unida seleccionada, botón **encuadrar**: se ajusta **en su sitio** (sin superfoco),
  arrastrando/pellizcando sobre la región del grupo, viendo la composición entera. Doble
  toque centra.
- Modelo *contain* como las fotos: a tamaño 1 la foto entra entera en la región del
  grupo; amplías para llenar. Se ve igual en editor, feed, perfil y export.

## 4.28.1 — 22 ago 2026

- En **grupos**, tocar una celda unida saca **solo esa celda** del grupo (antes deshacía
  todo el grupo). Si el grupo queda con menos de dos celdas, se disuelve entero.

## 4.28.0 — 22 ago 2026

- La herramienta se llama ahora **grupos** y hace las dos cosas: tocas celdas sueltas
  para **unirlas**; tocas una celda ya unida para **separarla** (sin botón aparte). El
  botón "desunir" desaparece: separar se hace desde la propia herramienta.

## 4.27.1 — 22 ago 2026

- **Desunir** más claro: al tocar una celda unida sale un botón **Desunir** (antes era
  un enlace pequeño y fácil de perder). Además, una celda unida ya no se abre a Foto por
  error (se edita como grupo).

## 4.27.0 — 22 ago 2026

- **Unir arregla los huecos vacíos**: en modo unir, tocar una celda vacía la
  selecciona para el grupo (antes abría el selector de fotos). Puedes unir celdas
  vacías y **luego añadir una foto**, que se asigna a **todo el grupo**.
- Las celdas de un mismo grupo llevan un **distintivo** (número + color propio) para
  ver de un vistazo qué va junto. Paleta segura, sin rojos/ámbar de aviso.

## 4.26.0 — 22 ago 2026 · unir celdas (foto compartida), fase A.1

- Nueva herramienta **unir** (nivel Página): tocas **celdas contiguas** de una página y
  al confirmar **comparten una foto** que cubre toda la región; cada celda enseña su
  trozo y los huecos hacen de rejilla (efecto puzzle/máscara). Adopta la foto de la
  primera celda con imagen.
- Al tocar una celda unida sale una **cajita de info** ("grupo de N") con **deshacer
  unión**.
- Se ve igual en editor, feed, perfil, miniaturas y **export** (imagen y vídeo).
- Falta (fase A.2): unir **entre páginas** y **encuadre** del grupo (pan/zoom).

## 4.25.0 — 22 ago 2026 · fondo con foto desenfocada

- Nuevo **relleno de huecos** para el modo *contain*: además de color plano, ahora
  puedes rellenar las franjas con la **propia foto ampliada y desenfocada** (el efecto
  clásico de IG/TikTok). Se elige en **color → relleno de huecos: Color / Foto borrosa**.
- Se ve igual en el editor, feed, perfil, miniaturas y **export** (imagen y vídeo);
  misma fuente de verdad (`drawRegion`). El color sigue usándose en la separación entre
  fotos.

## 4.24.0 — 22 ago 2026

- **Márgenes de seguridad del sistema** (`safe-area-inset`): el contenido ya no queda
  tapado por la **barra de gestos de Android** (abajo) ni por el notch (arriba en
  pantalla completa). Aplicado al layout general y a la hoja de export.

## 4.23.1 — 22 ago 2026

- El selector de **proporción** vuelve a ir en **una sola fila** (con scroll si hace
  falta): al añadir el 9:16, la rejilla de 4 columnas lo dejaba caer solo a una segunda
  fila.

## 4.23.0 — 22 ago 2026 · vistas para Stories

- Con proporción **9:16** la app se adapta a **stories** (no son un carrusel de feed):
  - La pestaña **Perfil** desaparece (las stories no salen en la cuadrícula).
  - **Feed** pasa a **Stories**: un reproductor a **pantalla completa** con **barritas de
    progreso** arriba y **tap a los lados** para pasar, como en Instagram.
  - El **export** cambia el texto: cada página es una story; en Compartir se elige
    **Historia** (no Feed) y se suben en orden.

## 4.22.0 — 22 ago 2026

- Nueva proporción **9:16** para **stories/reels** (pantalla completa, 1080×1920).
- Cada proporción muestra ahora una **descripción** al elegirla: cuadrado (clásico),
  vertical, la más alargada (máximo feed), apaisado (paisajes), pantalla completa
  (stories). Sustituye la vieja nota fija del 3:4.

## 4.21.2 — 21 ago 2026

- "Tocar fuera para salir" ahora también funciona en el **eje vertical** (franja negra
  de arriba/abajo). El área de trabajo no ocupaba de forma fiable todo el alto (la
  altura en % de un hijo flex no siempre se resolvía), así que ese negro quedaba fuera
  del backdrop. Ahora el área se ancla a todo el alto y el toque sale desde cualquier
  parte.

## 4.21.1 — 21 ago 2026

- "Tocar fuera para salir" en modo foco ahora cubre **todo el negro** del área (antes
  solo respondía en parte): un backdrop capta el toque en cualquier zona vacía y sube a
  Página; el lienzo del foto/texto queda por encima, así que sus gestos no lo disparan.

## 4.21.0 — 21 ago 2026

- En modo foco (**Texto** y **Foto**), tocar el **fondo negro** (fuera de la página/celda)
  sube un nivel: vuelve a **Página**. Patrón "toca fuera para cerrar", además del
  breadcrumb.

## 4.20.2 — 21 ago 2026

- El modo foco de texto ya **no recorta arriba/abajo**: en vez de escalar la página
  dentro de la tira (que la recortaba), ahora se dibuja la **página entera en un lienzo
  propio** fuera de la tira —igual que el foco de foto—, a su máximo tamaño en la
  proporción. Se ve completa y lo más grande posible.

## 4.20.1 — 21 ago 2026

- Arreglado el modo foco de texto: en vez de un zoom fijo (que dejaba márgenes enormes y
  recortaba en formatos altos), la página se **agranda hasta llenar el área**, limitada
  por ancho y alto a la vez, así ocupa todo el espacio sin recortes.

## 4.20.0 — 21 ago 2026

- Al editar un texto se entra en **modo foco** (como con las fotos), pero enfocando la
  **página entera**: las páginas vecinas se desvanecen, la activa se agranda un poco y
  la tira se bloquea, para colocar y ajustar el texto sin distracción.

## 4.19.0 — 21 ago 2026 · miniaturas y visor en la Biblioteca

- Cada archivo de la Biblioteca muestra ahora una **miniatura** (en vídeos, el fotograma
  con un indicador de play).
- Al tocarla se abre un **visor a pantalla**: la foto entera, o el vídeo con controles
  para revisarlo. Todo desde el propio fichero local (Object URL, sin copiarlo).

## 4.18.0 — 21 ago 2026 · muchos más layouts

- El catálogo de rejillas pasa de 12 a **28 layouts**: 2 celdas (iguales y desiguales),
  3, 4, 5, 6 (3×2 y 2×3) y **9 (3×3)**, además de asimétricos (izq./arriba grande + resto,
  1 grande + esquina, etc.). **Todos gratis** — aquí no hay layouts de pago.
- El selector de layout ahora **envuelve en cuadrícula** con scroll, en vez de una tira
  horizontal, para verlos de un vistazo.
- Guardarraíl: un test comprueba que cada layout **parte la página** sin huecos ni
  solapes.

## 4.17.2 — 21 ago 2026

- Texto del espacio en la Biblioteca más claro: **"N archivos · X usados · el navegador
  te deja hasta ~Y"**. Antes ponía dos cifras casi iguales (nuestra suma y la del
  navegador) junto al tope, y parecía que el máximo eran ~60 MB en vez de los GB reales.

## 4.17.1 — 21 ago 2026

- Arreglado el **parpadeo** de la Biblioteca: el autoguardado renovaba el array de
  proyectos y la lista se recargaba en bucle. Ahora carga una sola vez (y a mano tras
  borrar), sin parpadear.

## 4.17.0 — 21 ago 2026 · Biblioteca

- Nueva sección **Biblioteca** (en el menú): todos los archivos del dispositivo —fotos
  y vídeos— con su **peso**, en cuántos proyectos se usan y cuándo se usaron por última
  vez.
- **Barra de espacio ocupado** que reparte el total entre **fotos** y **vídeos**, con la
  reserva del navegador si está disponible.
- **Ordenar** por **peso**, por **uso** o por **recientes**, para localizar rápido lo que
  más ocupa o lo que ya no usas.
- Borrar un archivo suelto (avisa si está en uso) o **borrar de golpe los no usados**.
  Todo local; nada sale del dispositivo.

## 4.16.3 — 21 ago 2026

- El botón **nuevo proyecto** ahora es **grande y fijo abajo (centrado)**, siempre a
  mano; la franja se difumina hacia el fondo para separarlo de la lista al hacer scroll.

## 4.16.2 — 21 ago 2026

- El **número de versión** sale de la cabecera y vive en el **pie del menú**. El título
  **Maqueta** ya no es un botón: la navegación es la hamburguesa.
- Menú con **más aire**: más espaciado, **secciones** con rótulo (Trabajo / Ayuda) y
  elementos más cómodos de tocar.

## 4.16.1 — 21 ago 2026

- Quitado el **correo hardcodeado** del feedback: el repo es público y no debe llevar
  ninguna dirección escrita. El `mailto:` abre el correo **sin destinatario** y tú
  eliges a quién enviarlo.

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

