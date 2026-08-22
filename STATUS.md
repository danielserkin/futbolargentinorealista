# Estado del proyecto

Última actualización: **22 de agosto de 2026 (UTC)**.

## Funcionando

- Aplicación React/Vite terminada y responsive.
- Tabla de temporadas 2025/26 y 2026/27 con resultados reales.
- Sólo se computan fases regulares; los playoffs están excluidos.
- Todos los clubes clasificados de 2025/26 tienen 32 PJ.
- Copa Argentina, Supercopa, excluidos y participación parcial implementados.
- Partidos recientes comprobados automáticamente cada treinta minutos y actualización completa diaria.
- Pruebas: 6 aprobadas.
- GitHub Pages publicado en la URL temporal.
- Último workflow verificado: exitoso.

## URLs

- Temporal activa: <https://danielserkin.github.io/futbolargentinorealista/>
- Dominio definitivo: <https://futbolrealista.com.ar/>
- Repositorio: <https://github.com/danielserkin/futbolargentinorealista>

## Dominio y DNS

- `futbolrealista.com.ar` fue comprado en NIC Argentina.
- Zona DNS creada en Cloudflare Free.
- Nameservers delegados desde NIC Argentina:
  - `drake.ns.cloudflare.com`
  - `uma.ns.cloudflare.com`
- Registros `A` del dominio raíz configurados hacia GitHub Pages.
- Registro `CNAME` de `www` configurado hacia `danielserkin.github.io`.
- Proxy configurado como **DNS only** (nube gris).
- Cloudflare muestra la zona como **Active**.
- DNS público verificado:
  - `NS`: `drake.ns.cloudflare.com` y `uma.ns.cloudflare.com`.
  - Dominio raíz: las cuatro IP oficiales de GitHub Pages.
  - `www`: `CNAME` hacia `danielserkin.github.io`.
- GitHub Pages todavía responde `404` para el dominio y el certificado HTTPS aún no incluye `futbolrealista.com.ar`.
- Falta guardar el dominio personalizado en la configuración de Pages del repositorio.

## Próximo paso exacto

1. Abrir `Settings → Pages` en el repositorio de GitHub.
2. En **Custom domain**, ingresar `futbolrealista.com.ar` y pulsar **Save**.
3. Esperar a que finalice el DNS check y GitHub emita el certificado.
4. Activar **Enforce HTTPS** cuando la opción quede disponible.
5. Confirmar que el dominio raíz y `www` abren la web y que `www` redirige al dominio raíz.
6. Actualizar este archivo y `docs/ARQUITECTURA.md` con el estado definitivo.

## Publicidad pendiente

- El bloque responsivo de Google AdSense está desactivado durante la revisión mediante `VITE_ADSENSE_ENABLED`.
- La portada se verifica con la metaetiqueta y no carga el script publicitario ni muestra espacios vacíos.
- Publisher ID conectado: `ca-pub-4747589340489317`.
- La metaetiqueta y `ads.txt` están integrados; el script sólo se inyectará después de la aprobación y con contenido suficiente.
- El workflow toma el identificador del bloque desde la variable de GitHub `ADSENSE_SLOT`.
- Acerca del sitio, Contacto y Privacidad/cookies están publicados y enlazados desde el pie.
- La política incluye un acceso para volver a abrir las preferencias de la CMP de Google.
- Cuando el dominio y HTTPS estén activos:
  1. Publicar los cambios y esperar a que Google rastree las páginas editoriales.
  2. Solicitar una nueva revisión de `futbolrealista.com.ar` en Google AdSense.
  3. Después de la aprobación, cargar `ADSENSE_SLOT` y `ADSENSE_ENABLED=true` en GitHub Actions Variables.

## Seguridad

- No guardar en el repositorio claves fiscales, contraseñas, tarjetas ni códigos 2FA.
- El identificador `ca-pub-...` será público; las credenciales de AdSense no lo son.
- Las cuentas de NIC Argentina, Cloudflare, GitHub y AdSense deben permanecer a nombre del propietario.
