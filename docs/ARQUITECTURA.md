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
             │ cada 6 horas
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
- GitHub Actions descarga y valida los resultados cada seis horas.
- Ejecuta las pruebas y genera la versión de producción.
- GitHub Pages publica los archivos estáticos.
- Si una actualización falla, la última publicación válida permanece online.

### Fuente deportiva

- Los datos se obtienen del marcador público de ESPN mediante un adaptador propio.
- La web no consulta ESPN cada vez que entra un visitante.
- Se publica una instantánea local para mejorar velocidad y estabilidad.
- Sólo se computan partidos de fase regular; los playoffs quedan excluidos.

### Google AdSense

- Será la red publicitaria cuando el dominio esté conectado y el sitio aprobado.
- Requerirá páginas legales, consentimiento, código de verificación y `ads.txt`.
- El Publisher ID, la verificación del sitio y `ads.txt` están integrados.
- El bloque responsivo empieza a solicitar anuncios cuando recibe `ADSENSE_SLOT` durante el build.
- Acerca del sitio, Contacto y Privacidad/cookies son páginas estáticas incluidas en cada despliegue.
- El identificador público será del tipo `ca-pub-...`; las credenciales nunca se guardan en el repositorio.

## Estado actual

| Componente | Estado |
| --- | --- |
| Aplicación y tabla | Activo |
| Datos automáticos | Activo, cada 6 horas |
| GitHub Pages | Activo en la URL temporal |
| Dominio comprado | Activo en NIC Argentina |
| Cloudflare DNS | Activo; registros públicos verificados |
| Dominio conectado a GitHub | DNS listo; falta guardar el dominio en Settings → Pages |
| HTTPS del dominio | Pendiente de validación y emisión del certificado por GitHub |
| Google AdSense | Pendiente de dominio y aprobación |

## Direcciones previstas

- Principal: `https://futbolrealista.com.ar/`
- Alternativa: `https://www.futbolrealista.com.ar/`
- Temporal: `https://danielserkin.github.io/futbolargentinorealista/`

## Propiedad y seguridad

- NIC Argentina, Cloudflare, GitHub y AdSense deben quedar en cuentas del propietario.
- No se comparten contraseñas, claves fiscales, tarjetas ni códigos de autenticación.
- Los tokens o secretos futuros se guardarán como secretos de GitHub, nunca dentro del código.
- Cualquier cambio de proveedor DNS o hosting debe actualizarse primero en este documento.
