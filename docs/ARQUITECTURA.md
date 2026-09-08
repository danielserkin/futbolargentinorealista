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
- Los bloques sólo solicitan anuncios en la Liga, después de cargar correctamente una tabla con contenido suficiente.
- Acerca del sitio, Contacto y Privacidad/cookies son páginas estáticas incluidas en cada despliegue.
- Los identificadores de anuncio son públicos; las credenciales de las cuentas nunca se guardan en el repositorio.

## Estado actual

| Componente | Estado |
| --- | --- |
| Aplicación y tabla | Activo |
| Datos automáticos | Activo, cada 30 minutos; sincronización completa diaria |
| GitHub Pages | Activo en la URL temporal |
| Dominio comprado | Activo en NIC Argentina |
| Cloudflare DNS | Activo; registros públicos verificados |
| Dominio conectado a GitHub | DNS listo; falta guardar el dominio en Settings → Pages |
| HTTPS del dominio | Pendiente de validación y emisión del certificado por GitHub |
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
