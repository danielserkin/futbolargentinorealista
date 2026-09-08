# Fútbol Argentino Realista

Una tabla alternativa del fútbol argentino construida exclusivamente con resultados reales: temporada larga de julio a junio, 20 puestos visibles, clasificación a copas y descensos claros.

Además de la tabla, el sitio calcula forma reciente, rachas, líderes estadísticos y evolución de posiciones. Cada club tiene una ficha compartible y puede compararse con cualquier otro participante de la misma temporada.

## Desarrollo

```bash
npm install
npm run fetch-data
npm run dev
```

## Verificación

```bash
npm test
npm run build
```

Los datos se obtienen del marcador público de ESPN y se guardan como una instantánea estática. GitHub Actions comprueba los partidos recientes cada treinta minutos y realiza una actualización completa diaria. Si la descarga o la validación fallan, el despliegue se detiene y la última versión válida permanece online.

## Reglas

- Temporadas de julio a junio.
- Tres puntos por victoria y uno por empate.
- Sólo se computan fases regulares; los playoffs no suman puntos ni partidos.
- Los clubes que participaron en un solo semestre figuran como participación parcial y no integran la tabla.
- Desempates por diferencia de gol, goles a favor, victorias y nombre.
- Puestos 1–6: Libertadores; 7–12: Sudamericana; 17: promoción; 18–20: descenso.
- Los equipos por debajo del puesto 20 aparecen como excluidos.

Proyecto independiente, no afiliado a AFA ni a sus competencias.

## Publicidad

La integración admite AdSense o banners de Adsterra mediante variables de entorno. En la aplicación, los anuncios sólo se muestran cuando los datos cargaron correctamente; las páginas editoriales con contenido sustancial incluyen una única unidad responsive. Para Adsterra se usan exclusivamente banners clásicos y permanecen desactivados Popunder, Social Bar y SmartLink.

Dominio principal: [futbolrealista.com.ar](https://futbolrealista.com.ar/)

La distribución del dominio, DNS, hosting, datos y publicidad está documentada en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

Para retomar el trabajo rápidamente, consultar [STATUS.md](STATUS.md).
