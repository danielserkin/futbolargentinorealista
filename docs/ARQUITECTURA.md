# Arquitectura y distribución del sitio

Este documento explica cómo se publica y mantiene Fútbol Argentino Realista.

## Mapa general

```text
Visitante
   │
   ▼
futbolrealista.com.ar
   │
   ▼
Cloudflare DNS (plan gratuito)
   │
   ▼
GitHub Pages
   │
   ├── Aplicación React/Vite
   └── Instantánea estática de resultados
             ▲
             │ cada 30 minutos (reciente) + diario (completo)
        GitHub Actions
             │
             ▼
   Marcador público de ESPN
```

## Responsabilidad de cada servicio

### NIC Argentina

- Registra y mantiene la titularidad de `futbolrealista.com.ar`.
- Cobra el alta y la renovación anual del dominio.
- Delega el DNS a los servidores informados por Cloudflare.
- La cuenta, CUIT/CUIL y medios de pago pertenecen exclusivamente al propietario.

### Cloudflare

- Administra el DNS en el plan gratuito.
- Conecta el dominio y `www` con GitHub Pages.
- No guarda el código ni reemplaza el hosting.
- Puede aportar resolución DNS rápida, HTTPS y protección básica.

Servidores DNS asignados y delegados desde NIC Argentina:

- `drake.ns.cloudflare.com`
- `uma.ns.cloudflare.com`

Registros previstos en la zona:

- Cuatro registros `A` para el dominio raíz hacia las IP oficiales de GitHub Pages.
- Un registro `CNAME` de `www` hacia `danielserkin.github.io`.
- Todos permanecen inicialmente en modo **DNS only**.

### GitHub

- El repositorio contiene todo el código y la documentación.
- GitHub Actions fusiona los partidos recientes cada treinta minutos y descarga el historial completo una vez al día.
- Ejecuta las pruebas y genera la versión de producción.
- GitHub Pages publica los archivos estáticos.
- Si una actualización falla, la última publicación válida permanece online.

### Fuente deportiva

- Los datos se obtienen del marcador público de ESPN mediante un adaptador propio.
- La web no consulta ESPN cada vez que entra un visitante.
- Se publica una instantánea local para mejorar velocidad y estabilidad.
- Sólo se computan partidos de fase regular; los playoffs quedan excluidos.

### Publicidad

- La capa de monetización puede usar Google AdSense o banners clásicos de Adsterra.
- El proveedor se selecciona con `AD_PROVIDER`; todos los anuncios permanecen apagados mientras `ADS_ENABLED` sea falso.
- AdSense utiliza el Publisher ID y el slot responsivo. Adsterra admite una unidad 728×90 para escritorio y otra 320×50 para móvil.
- Las unidades de Adsterra se ejecutan en iframes aislados para que su script no modifique la aplicación.
- La aplicación solicita un bloque después de cargar correctamente una tabla con contenido suficiente. Formato, Metodología, Estadísticas y el análisis de temporada incluyen una única unidad responsive; las páginas legales, Contacto y Acerca permanecen sin anuncios.
- Acerca del sitio, Contacto y Privacidad/cookies son páginas estáticas incluidas en cada despliegue. Las nuevas fichas de clubes, el directorio y Novedades usan las mismas unidades responsivas de Adsterra.
- Los identificadores de anuncio son públicos; las credenciales de las cuentas nunca se guardan en el repositorio.

## Estado actual

| Componente | Estado |
| --- | --- |
| Aplicación y tabla | Activo |
| Datos automáticos | Activo, cada 30 minutos; sincronización completa diaria |
| GitHub Pages | Activo en el dominio propio |
| Dominio comprado | Activo en NIC Argentina |
| Cloudflare DNS | Activo; registros públicos verificados |
| Dominio conectado a GitHub | Configurado y respondiendo HTTP 200 |
| HTTPS del dominio | Certificado válido; Enforce HTTPS sigue desactivado, su modificación requiere un acceso con permisos de Pages |
| Google AdSense | Rechazado por contenido de poco valor; puede volver a solicitarse después de indexar las mejoras |
| Adsterra | Dos banners configurados; pendiente de revisión visual en producción |

## Direcciones previstas

- Principal: `https://futbolrealista.com.ar/`
- Alternativa: `https://www.futbolrealista.com.ar/`
- Temporal: `https://danielserkin.github.io/futbolargentinorealista/`

## Propiedad y seguridad

- NIC Argentina, Cloudflare, GitHub y AdSense deben quedar en cuentas del propietario.
- No se comparten contraseñas, claves fiscales, tarjetas ni códigos de autenticación.
- Los tokens o secretos futuros se guardarán como secretos de GitHub, nunca dentro del código.
- Cualquier cambio de proveedor DNS o hosting debe actualizarse primero en este documento.

## Descubrimiento y distribución de contenido

El build genera la tabla completa en HTML y una instantánea JSON para hidratar React con el mismo contenido. No solicita de nuevo el JSON al abrir una página prerenderizada. Los anuncios de la aplicación se activan al montar el navegador, conservando la configuración del workflow.

Las fichas en `/clubes/`, el directorio y `/novedades.html` son HTML estático con banners, metadatos sociales, imágenes PNG y enlace canónico propio. Se incluyen en el sitemap. `/feed.xml` contiene resultados con IDs estables de partidos.

El despliegue conserva el archivo de verificación IndexNow y compara las huellas del contenido deportivo anterior con el nuevo. Después de publicar comprueba la versión disponible en el dominio y envía sólo cambios a los buscadores participantes. La actualización de la fecha de verificación por sí sola no dispara notificaciones. Se registra la respuesta HTTP sin equipararla con indexación o visitas.

Los artefactos `difusion` y `indexnow-receipt` documentan borradores y envíos. No se incorporan APIs de IA ni publicaciones automáticas en redes sociales. Ver [DIFUSION.md](DIFUSION.md) para accesos y medición pendientes.
