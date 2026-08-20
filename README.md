# Maqueta

Editor de carruseles para Instagram. Páginas con rejilla, encuadre con máscara,
y export al tamaño nativo de Instagram (1080 px de ancho).

Nació como **Carrete**, un solo fichero HTML iterado sobre el móvil. Esa versión,
funcional y probada, está en `reference/carrete-3.13.2.html` y sigue abriéndose con
doble clic sin servidor ni instalación. Este repo es el paso siguiente, ya como
Maqueta.

En marcha: <https://urieljavier.github.io/carrete/>

## Empezar

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # 63 tests sobre la lógica pura
npm run build    # bundle en dist/
```

## Las dos ideas que sostienen el resto

**1. Espacio del post.** El post es un lienzo continuo. Las celdas no pertenecen
a una página: viven en espacio de post, donde `x` se mide en unidades de página
(0..N) e `y` en 0..1. Una página no es un contenedor, es una **ventana de recorte**:
la página *i* es la región `[i, i+1]`. Una celda con `{x: 0.5, w: 1}` ocupa media
página 1 y media página 2, y `drawRegion` ya la dibuja bien.

Consecuencia práctica: los layouts a caballo entre páginas no requieren tocar el
renderizador ni el export. Solo una interfaz que genere esos rectángulos.

**2. Todo relativo.** Ni el preview ni el clamp usan píxeles medidos. La foto se
coloca en múltiplos del tamaño de su celda y su encuadre se guarda normalizado
como `{scale, fx, fy}`, donde `scale: 1` es el *cover* exacto. Lo que ajustas
sobre un preview de 1600 px se aplica idéntico al exportar desde el original.

Hay un test que verifica ese invariante sobre cientos de combinaciones de
proporciones, zooms y puntos focales: la desviación máxima entre preview y export
es 0.

## Calidad de imagen

El `File` original nunca se modifica. Al exportar se vuelve a decodificar desde
él, a la escala que necesita cada celda. Aun así, el resultado **no es idéntico
al original** y no puede serlo:

| pérdida | ¿evitable? |
|---|---|
| reescalado a 1080 px | no, pero es el ancho que sirve Instagram, así que no hay pasada extra |
| recompresión JPEG | sí, y **PNG es el formato por defecto** |
| remuestreo al girar | no, pero se hace a 1,6× y eso lo mitiga |
| ampliar con la pinza | no |

**PNG por defecto** es una decisión deliberada: montar un carrusel no debería añadir
una generación de recompresión encima de la que ya trae el fichero de origen. Cada
página pesa unos 4 MB en lugar de 800 kB, y por eso existe el ZIP.

**Ancho de exportación fijo a 1080 px** — es el ancho con el que Instagram sirve el
feed orgánico. Antes se exportaba a 1440 y era un overshoot: IG lo reducía a 1080
igualmente, con una pasada extra de remuestreo. A 1080 se le da a IG justo lo que va
a mostrar. La proporción sigue saliendo de `RATIOS`; el ancho solo decide los
píxeles, vía `exportSize(ratio)` en `src/core/post.js` (con tests).

**Nota de calidad:** con el modelo *contain*, una foto entra entera y rara vez se
amplía; solo lo hace si haces zoom para llenar más allá de su resolución.
`upscaleReport()` en `src/core/post.js` calcula ese dato (pendiente: sigue con la
fórmula del modelo *cover* antiguo, hay que actualizarlo a *contain*).

## Estructura

Cuatro capas, y cada una solo conoce a la de debajo.

```
src/core/          lógica pura, sin DOM ni React. Es lo que está testeado.
  layouts.js         rejillas y constantes del dominio
  geometry.js        encuadre, clamp, gap, espacio de post, dibujo de regiones
  color.js           detección y conversión de perfil ICC a sRGB
  image.js           previews, giro y espejo sobre píxeles, huella por contenido
  post.js            modelo del post, duplicados, informe de ampliación, medida
  format.js          formato de cifras (kB / MB / GB)
  db.js              IndexedDB: proyectos y ficheros

src/state/         reducer del post y del historial de deshacer

src/hooks/         lo que necesita navegador, aislado del aspecto
  useElementWidth    medidas reales del contenedor y del viewport
  usePageSwipe       una página por gesto, con resistencia en los extremos
  useProjects        persistencia, apertura y borrado de proyectos
  useImageLibrary    importar, girar, voltear, convertir perfil
  useTapGuard        evita el click-through al abrir una página
  useHaptics         pulsos del motor de vibración
  useFullscreen      API de pantalla completa con sus prefijos

src/styles/        sistema de diseño
  tokens.css         LA fuente de valores: color, tipo, espacio, motion, capas
  base.css           reset y valores por elemento

src/ui/            piezas sin conocimiento del dominio
  primitives/        Button, SegmentedControl, ToolBox, Field, Notice, Toast,
                     Dialog, FileInput, NotchSlider, ColorSwatches, Text
  layout/            AppShell: cabecera de dos niveles, Section, Busy
  icons.jsx          iconos y glifos de valor

src/features/      cada vista, con su CSS Module al lado
  editor/            Stage, Cell, Peek, PostRail, PageBar, LevelPanel + 3 paneles
  feed/ profile/     previsualizaciones
  projects/          lista de proyectos
  export/            hoja de resultados y la rutina de exportado
  changelog/         versión y prueba de vibración

tests/             63 tests sobre core y state
```

## El sistema de diseño

`src/styles/tokens.css` es la única fuente de valores: **ningún módulo escribe un
color, un tamaño de fuente o una duración a mano** — está verificado, cero hex
fuera de ese fichero. Cambiar el aspecto de la aplicación es cambiar ese fichero.

La paleta es deliberadamente neutra porque la aplicación muestra fotos y cualquier
color alrededor falsea cómo se perciben. El color solo significa estado, y cada
tono tiene **un** significado:

| token | color | significa |
|---|---|---|
| `--c-accent` | azul | selección |
| `--c-drop` | verde | destino de un arrastre |
| `--c-warn` | ámbar | límite o advertencia recuperable |
| `--c-dup` | naranja | foto repetida |
| `--c-danger` | rojo | acción destructiva |

Los estilos van en **CSS Modules** junto a su componente, así que no hay colisiones
de nombres ni una hoja global que crezca sin control. Lo compartido son los tokens,
que están disponibles en todas partes sin importar nada.

Las primitivas cubren un caso que se repite y que casi ninguna librería resuelve:
un control **apagado pero pulsable**. Un botón con el atributo `disabled` no emite
eventos, así que no puede explicar por qué no está disponible. `Button`, `ToolBox` y
`SegmentedControl` aceptan `disabledReason`, y entonces se ven apagados pero al
tocarlos avisan.

## Decisiones que parecen raras y no lo son

- **El gap es la separación visible, no un margen por celda.** En cada costura se
  reparte a medias entre las dos celdas; en el borde de la página va entero. Se
  probó tratar la frontera entre páginas como costura interior y se descartó:
  mirando una página sola, la imagen no quedaba centrada.
- **Giro y espejo se aplican a los píxeles**, no a la geometría. El resto del
  código los ignora, y el punto focal se transporta con `turnFocal`.
- **El historial retiene las fotos.** `unusedImageIds` compara contra el post
  *más* todas las entradas del historial: sin eso, deshacer un cambio de layout
  dejaba celdas apuntando a fotos ya liberadas.
- **La huella de una foto es un SHA-256 de su contenido**, no su id. Cada
  importación crea un id nuevo, así que sin el hash el aviso de fotos repetidas no
  detectaría el caso que importa: la misma foto metida dos veces por separado.
- **La conversión de ProPhoto lleva adaptación cromática de Bradford.** ProPhoto
  se define sobre D50 y la salida sRGB es D65; sin adaptar, el blanco salía en
  (255, 252, 221). Lo encontró un test.

## Huecos vacíos y transparencia

Una página a medio llenar **exporta la página completa**, no un recorte del
contenido: el lienzo se rellena entero y las fotos se dibujan en su sitio. Así, al
subirla, cada foto queda donde la colocaste dentro del marco 4:5. Hay tests que lo
comprueban con un `ctx` de mentira que apunta las llamadas de dibujado.

El fondo puede ser **transparente**: entonces no se rellena nada y los huecos salen
con alfa 0. El editor pinta un damero detrás para que se lea como "sin fondo" y no
como negro, y el formato pasa a PNG por narices, porque JPEG no tiene canal alfa y
pintaría los huecos de negro.

**Instagram no admite transparencia**: aplana el alfa al convertir. Esto sirve como
paso intermedio — exportar la página con el hueco vacío, componerla sobre un vídeo
en otra herramienta, y subir el resultado — no para subirlo tal cual.

## Export

Las páginas se empaquetan en un **ZIP** con una sola descarga, y también se pueden
guardar de una en una. Las imágenes van sin comprimir dentro del archivo: ya son PNG
o JPEG, así que pasarlas otra vez por deflate gasta CPU para no ahorrar nada.
Medido: tres PNG de 4 MB producen el ZIP en menos de 100 ms.

El nombre sale del proyecto, sin acentos ni caracteres raros: `verano-en-bermeo-6p.zip`.

## Espacio ocupado

La lista de proyectos muestra lo que ocupa cada uno. La medida se guarda en el
índice al escribir, así que la lista se pinta sin leer nada; solo se calcula a
demanda para proyectos guardados antes de que el índice la incluyera.

Dos avisos sobre cómo leer esos números:

- Una foto usada en varias celdas **cuenta una vez**: en disco hay un solo fichero.
- El almacén de ficheros es **compartido entre proyectos**, así que una foto que
  está en dos cuenta en los dos y la suma puede ser mayor que el espacio real.

Además se muestra `navigator.storage.estimate()`, que es la contabilidad del
navegador: incluye lo que aún no ha liberado, así que no tiene por qué cuadrar con
nuestra suma.

## Hoja de ruta

Por orden de valor:

1. **Servirlo por HTTPS** para poder instalarlo como PWA en `display: standalone`.
   Hoy compartirlo significa mandar un `.html` y explicar cómo abrirlo.
3. **No ampliar nunca.** Ver arriba.
4. **Primer uso.** Quien la abra sin explicación se encuentra un lienzo blanco y
   tres pestañas.
5. Ajustar las costuras arrastrándolas, voltear la rejilla, texto.

## Estado del port

`src/core` y `src/state` están portados y cubiertos por tests que pasan. La capa
de interfaz está portada estructuralmente pero **no se ha ejecutado en un
navegador**: hay que darle una pasada comparando con
`reference/carrete-3.13.2.html`, que es el comportamiento de referencia.
