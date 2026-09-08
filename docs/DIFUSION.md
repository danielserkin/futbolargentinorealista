# Difusión y visitas reales

Actualizado el 8 de septiembre de 2026. Objetivo: atraer lectores interesados en fútbol para aumentar el uso del sitio y las impresiones legítimas de sus banners.

## Resultado verificado del primer despliegue

- Versión publicada desde el commit `7978b30`: [ejecución exitosa](https://github.com/danielserkin/futbolargentinorealista/actions/runs/34179674334).
- IndexNow recibió 35 URLs a las 02:20:21 UTC del 8 de septiembre de 2026 y respondió HTTP 202. El comprobante indica `accepted: true`, `indexed: not_verified`: queda pendiente la validación del buscador, no hay visitas atribuibles verificadas.
- Prueba de navegador en el dominio real aprobada: tabla y fichas sin JavaScript, navegación interactiva, vuelta atrás, temporada en enlaces y diseño móvil. Las solicitudes de analítica y publicidad fueron bloqueadas en esta prueba funcional.
- La selección de formato del banner dentro del iframe ahora la comunica la página contenedora, evitando que el ancho inicial provisional cargue una unidad móvil en escritorio. Las dos unidades originales se mantienen.

## Cierre de la implementación

- Corrección de formato de banners publicada desde `916874a`: [despliegue exitoso](https://github.com/danielserkin/futbolargentinorealista/actions/runs/34179901013).
- El último comprobante IndexNow respondió HTTP 200 a las 02:24:16 UTC del 8 de septiembre de 2026 para las mismas 35 URLs. Esto confirma recepción, no indexación ni visitas.
- [Anuncio público v0.2.0](https://github.com/danielserkin/futbolargentinorealista/releases/tag/v0.2.0), con enlaces de campaña a la web, publicado en GitHub.
- 37 pruebas aprobadas. En la comprobación local con respuestas publicitarias simuladas se solicitaron las unidades originales correctas en portada, ficha, Novedades y guía, tanto en escritorio como en móvil.
- La comprobación puntual con Adsterra real no confirmó entrega de creatividades: el script móvil respondió HTTP 200 sin contenido, y en la portada el espacio quedó blanco. Una petición HTTP adicional con Referer fue rechazada con 403. Son observaciones desde este entorno; no prueban que todos los visitantes reciban la misma respuesta ni permiten diagnosticar el estado de la cuenta. No se modificaron las claves ni se desactivaron los banners. Verificar cobertura, estado de unidades e impresiones requiere acceso al panel del proveedor.
- No se realizaron clics en anuncios ni se contabilizaron las pruebas como visitas conseguidas. En ese momento estaban pendientes la cuenta de marca y el acceso a métricas; la publicación posterior en Nostr y Telegraph se detalla abajo. No se confirmó tráfico nuevo atribuible.

## Publicación autónoma en canales externos — 8 de septiembre de 2026

Se creó una identidad de marca en Nostr sin correo ni teléfono y una cuenta de autor en Telegraph. Las credenciales están en archivos privados del workspace, excluidos de Git; los documentos públicos sólo contienen identificadores y comprobantes públicos.

- [Perfil de la marca en Nostr](https://primal.net/p/npub1m9e2k4v2ftsekncwkjhjtwk94rs8x299f29muywqgklw9ddfmdwq2e8q7l).
- [Hilo de presentación de cinco mensajes](https://primal.net/e/2bca206c65d4af9c99acf24c814553edfc6de8e211c693e4ef377985a146f593): presentación, Boca–River, Racing–Independiente, Central–Newell's y metodología. Los cuatro mensajes siguientes responden al propio hilo; no son comentarios enviados a desconocidos.
- [Artículo de presentación en Telegraph](https://telegra.ph/El-fútbol-argentino-en-una-temporada-larga-una-tabla-alternativa-con-resultados-reales-09-08), firmado por el proyecto y con enlaces de campaña hacia la web.
- Los cinco mensajes fueron aceptados y luego leídos desde al menos un relay. El perfil y el hilo también se comprobaron en Primal con navegador. El artículo se verificó mediante su API y mediante HTTP público.
- Un relay (Damus) limitó la frecuencia al último mensaje. No se reintentó; Primal ya había aceptado y devuelto ese mensaje. No realizar nuevos envíos en ráfaga.
- El perfil indica que las publicaciones son automatizadas y que el sitio es independiente de AFA. El artículo identifica la presentación como propia y declara la asistencia de IA.
- La portada, las fichas de clubes y Novedades enlazan el perfil de marca para que los lectores puedan seguirlo.
- Registro público de textos, URLs y verificación: [publicaciones-2026-09-08.json](difusion/publicaciones-2026-09-08.json).
- No se configuraron publicaciones periódicas, no se compró tráfico y no se verificaron visitas nuevas al sitio. La existencia del hilo no confirma alcance ni ingresos.

Para continuar con la misma identidad, conservar `.growth/private/nostr.json` y `.growth/private/telegraph.json` (permisos 600). No imprimirlos en logs, no adjuntarlos a issues y no agregarlos a Git. Los scripts locales están en `.growth/social-runtime/`. Si se elimina el workspace sin respaldo privado, se puede perder el acceso a estas cuentas.

## Qué se automatiza

- El mismo despliegue que actualiza los partidos genera la tabla completa en HTML, 32 fichas de clubes, el directorio, Novedades, vistas previas PNG y un feed RSS.
- Las fichas y Novedades conservan la integración de banners Adsterra 728×90 y 320×50. La aplicación mantiene los banners configurados en el workflow. AdSense conserva su estado anterior.
- `scripts/search-indexing.mjs prepare` recupera la verificación IndexNow y la versión anterior del contenido antes del despliegue. La clave se publica como archivo de verificación en el dominio; no se guarda en el código fuente.
- Después de publicar, `notify` comprueba que el contenido esté disponible y envía a IndexNow exclusivamente las URLs nuevas, modificadas o eliminadas. Un cambio de fecha de verificación sin cambios deportivos no produce envíos.
- El comprobante distingue recepción (HTTP 200/202) de indexación y visitas, que no pueden darse por confirmadas. Los errores no retiran la web publicada y no generan reintentos en bucle. Un envío fallido requiere revisar el comprobante; el sitemap sigue siendo accesible.
- El feed usa IDs de partidos estables para evitar novedades duplicadas.
- Cada build genera tres borradores de difusión en `.growth/posts.json`; el workflow los guarda durante siete días como artefacto `difusion`. Son borradores, no publicaciones enviadas.
- Estas tareas se ejecutan mediante scripts en GitHub Actions, sin llamadas a modelos ni consumo recurrente de tokens de IA. No se contrató publicidad ni un servicio de automatización pago; el uso de infraestructura sigue sujeto a los planes existentes del propietario.

## Páginas para difundir

- [Tabla](https://futbolrealista.com.ar/)
- [Fichas de clubes](https://futbolrealista.com.ar/clubes/)
- [Boca Juniors](https://futbolrealista.com.ar/clubes/boca-juniors-5.html)
- [River Plate](https://futbolrealista.com.ar/clubes/river-plate-16.html)
- [Novedades](https://futbolrealista.com.ar/novedades.html)
- [Feed RSS](https://futbolrealista.com.ar/feed.xml)

Cada ficha tiene una imagen social propia y enlaces para compartir en WhatsApp y X. La tabla conserva los parámetros de club y temporada al compartir. Los enlaces incorporan UTM por canal; esto prepara la atribución, pero no crea por sí solo un panel de conversiones.

## Primera publicación preparada

> ¿Y si el fútbol argentino tuviera una temporada larga, sin zonas ni playoffs? En Fútbol Argentino Realista reunimos resultados reales en una tabla alternativa. Mirá dónde queda tu club.

Enlace: <https://futbolrealista.com.ar/?utm_source=x&utm_medium=social&utm_campaign=lanzamiento-fichas>

Identidad propuesta: **Fútbol Argentino Realista**, cuenta del proyecto. Bio: “Resultados reales. Una temporada larga. Tabla alternativa, rachas y comparador de clubes. Proyecto independiente, no afiliado a AFA”. No atribuir el proyecto a una persona ficticia ni presentar promoción propia como una recomendación independiente.

## Canales y accesos

- El sitio y su repositorio son los canales propios disponibles. El README enlaza las páginas públicas.
- No hay una conexión autenticada de X, Reddit, Bluesky ni correo de marca disponible en esta sesión. Sí se crearon y utilizaron Nostr y Telegraph, con los comprobantes enlazados arriba. No se publicaron mensajes en X, Reddit ni Bluesky.
- No se recomienda publicar el lanzamiento en r/fulbo: sus reglas incluyen restricciones específicas a las discusiones repetitivas sobre una primera división de 20 equipos. Se revisaron sus [reglas](https://www.reddit.com/r/fulbo/about/rules.json) el 8 de septiembre de 2026.
- X prohíbe las respuestas automatizadas no solicitadas. La propuesta es publicar contenido propio desde la marca, según sus [reglas de automatización](https://help.x.com/es/rules-and-policies/x-automation).
- La integración de GitHub disponible denegó (HTTP 403) la lectura de tráfico, la modificación de metadatos del repositorio, la configuración HTTPS de Pages y la consulta de secretos. Esas acciones no deben registrarse como realizadas.

## Medición y criterio de continuidad

Cloudflare Web Analytics está instalado, pero no hay acceso autenticado a su panel. No hay una línea de base de visitantes disponible. No confundir visitas del repositorio con visitas del sitio ni envíos a buscadores con lectores obtenidos.

Al tener acceso a métricas, comparar siete días anteriores y siete posteriores: visitantes, páginas vistas, referentes, páginas de entrada y las impresiones/ingresos del panel de Adsterra. Los parámetros UTM pueden requerir otra herramienta de atribución; no asumir que Cloudflare los desglosa. No se implementó medición de clics en el comparador ni de clics publicitarios.

Continuar en los canales que aporten lectores y abandonar los que consuman trabajo sin resultados. No comprar tráfico, generar visitas artificiales ni hacer clic en los anuncios propios. Las verificaciones automáticas del navegador bloquean por defecto analítica y redes publicitarias; una comprobación puntual de entrega real de banners debe quedar diferenciada del tráfico obtenido.

No hay acceso al saldo ni a la facturación de tokens de esta conversación. Nunca registrar un costo estimado como si fuese el cargo real.

Referencia técnica de notificación: [IndexNow](https://www.indexnow.org/documentation).
