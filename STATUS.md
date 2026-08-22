# Estado del proyecto

Última actualización: **22 de agosto de 2026 (UTC)**.

## Funcionando

- Aplicación React/Vite terminada y responsive.
- Tabla de temporadas 2025/26 y 2026/27 con resultados reales.
- Sólo se computan fases regulares; los playoffs están excluidos.
- Todos los clubes clasificados de 2025/26 tienen 32 PJ.
- Copa Argentina, Supercopa, excluidos y participación parcial implementados.
- Datos deportivos actualizados automáticamente cada seis horas.
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
- Estado observado al actualizar este archivo: Cloudflare espera la propagación y el DNS público aún devuelve `NXDOMAIN`.

## Próximo paso exacto

1. Esperar a que Cloudflare muestre el dominio como **Active**.
2. Verificar públicamente `NS`, `A` y `CNAME`.
3. Reintentar la validación de `futbolrealista.com.ar` en GitHub Pages.
4. Activar **Enforce HTTPS** cuando GitHub emita el certificado.
5. Confirmar que el dominio raíz y `www` abren la web.
6. Actualizar este archivo y `docs/ARQUITECTURA.md` con el estado definitivo.

## Publicidad pendiente

- El banner actual es solamente visual y todavía no genera ingresos.
- Cuando el dominio y HTTPS estén activos:
  1. Agregar Acerca del sitio, Contacto y Política de privacidad/cookies.
  2. Registrar `futbolrealista.com.ar` en Google AdSense.
  3. Obtener el identificador público `ca-pub-...`.
  4. Integrar el código de AdSense, consentimiento y `ads.txt`.
  5. Enviar el sitio a revisión de Google.

## Seguridad

- No guardar en el repositorio claves fiscales, contraseñas, tarjetas ni códigos 2FA.
- El identificador `ca-pub-...` será público; las credenciales de AdSense no lo son.
- Las cuentas de NIC Argentina, Cloudflare, GitHub y AdSense deben permanecer a nombre del propietario.
