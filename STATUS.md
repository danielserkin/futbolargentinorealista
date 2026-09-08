# Estado del proyecto

Última actualización: **8 de septiembre de 2026 (UTC)**.

## Funcionando

- Aplicación React/Vite terminada y responsive.
- Tabla de temporadas 2025/26 y 2026/27 con resultados reales.
- Sólo se computan fases regulares; los playoffs están excluidos.
- Todos los clubes clasificados de 2025/26 tienen 32 PJ.
- Copa Argentina, Supercopa, excluidos y participación parcial implementados.
- Partidos recientes comprobados automáticamente cada treinta minutos y actualización completa diaria.
- Radar de temporada con mejor ataque, defensa, forma, mayor diferencia, resultados recientes y próximos partidos.
- Fichas compartibles de clubes, rachas, evolución de posiciones y comparador cara a cara.
- Guía editorial de estadísticas incorporada al sitemap.
- Integración intercambiable para AdSense o banners de Adsterra, desactivada por defecto.
- Pruebas: 34 aprobadas; build con validación de HTML, fichas, sitemap, RSS e imágenes sociales.
- GitHub Pages publicado en el dominio propio con HTTPS válido.
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
- El dominio responde HTTP 200 mediante HTTPS válido.
- El dominio personalizado ya está guardado en Pages. `https_enforced` continúa en `false`; la integración actual denegó su modificación (HTTP 403).

## Descubrimiento y difusión (v0.2.0)

- La tabla completa se genera en HTML con datos para hidratar la aplicación sin una segunda descarga inicial.
- 32 fichas públicas de clubes con estadísticas de ambas temporadas, participación parcial identificada y enlaces al comparador.
- Directorio de clubes, Novedades, feed RSS y 33 imágenes PNG para compartir.
- Sitemap generado con 42 páginas; botones de WhatsApp/X y enlaces con UTM.
- Banners existentes conservados; mismas unidades Adsterra en las fichas, directorio y Novedades.
- IndexNow integrado al despliegue: verificación del dominio y notificación de cambios reales, sin llamadas a IA. Se conserva un comprobante HTTP en los artefactos del workflow.
- Borradores de difusión generados en `.growth/posts.json`, conservados como artefacto `difusion` durante siete días. No son mensajes enviados.
- La prueba de navegador verifica tabla sin JavaScript, navegación, historial, selección de temporada, enlaces y diseño móvil.
- Falta acceso autenticado de marca para publicar en redes y acceso a las métricas de Cloudflare/Adsterra para atribuir visitas e ingresos. No hay visitas nuevas verificadas ni una cifra de tokens facturados disponible.
- Operación y limitaciones: [docs/DIFUSION.md](docs/DIFUSION.md).

## Publicidad pendiente

- Google AdSense rechazó el sitio por “contenido de poco valor” el 6 de septiembre de 2026.
- El bloque responsivo de Google AdSense permanece desactivado mediante `VITE_ADSENSE_ENABLED`.
- La portada se verifica con la metaetiqueta y no carga el script publicitario ni muestra espacios vacíos.
- Publisher ID conectado: `ca-pub-4747589340489317`.
- La metaetiqueta y `ads.txt` están integrados; el script sólo se inyectará después de la aprobación y con contenido suficiente.
- El workflow toma el identificador del bloque desde la variable de GitHub `ADSENSE_SLOT`.
- Acerca del sitio, Contacto y Privacidad/cookies están publicados y enlazados desde el pie.
- La política incluye un acceso para volver a abrir las preferencias de la CMP de Google.
- Se recibieron y configuraron dos unidades de banner de Adsterra (escritorio y móvil) aisladas dentro de iframes.
- Próximos pasos:
  1. Publicar las nuevas herramientas y comprobarlas en producción.
  2. Revisar en producción la calidad de las creatividades y las métricas de carga.
  3. Desactivar inmediatamente las unidades si aparecen redirecciones, contenido engañoso o categorías inadecuadas.
  4. Esperar a que Google indexe el nuevo contenido antes de solicitar otra revisión de AdSense.

## Seguridad

- No guardar en el repositorio claves fiscales, contraseñas, tarjetas ni códigos 2FA.
- El identificador `ca-pub-...` será público; las credenciales de AdSense no lo son.
- Las cuentas de NIC Argentina, Cloudflare, GitHub y AdSense deben permanecer a nombre del propietario.
