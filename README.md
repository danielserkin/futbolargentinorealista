# Fútbol Argentino Realista

Una tabla alternativa del fútbol argentino construida exclusivamente con resultados reales: temporada larga de julio a junio, 20 puestos visibles, clasificación a copas y descensos claros.

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

Los datos se obtienen del marcador público de ESPN y se guardan como una instantánea estática. GitHub Actions actualiza y publica la web cada seis horas. Si la descarga o la validación fallan, el despliegue se detiene y la última versión válida permanece online.

## Reglas

- Temporadas de julio a junio.
- Tres puntos por victoria y uno por empate.
- Sólo se computan fases regulares; los playoffs no suman puntos ni partidos.
- Los clubes que participaron en un solo semestre figuran como participación parcial y no integran la tabla.
- Desempates por diferencia de gol, goles a favor, victorias y nombre.
- Puestos 1–6: Libertadores; 7–12: Sudamericana; 17: promoción; 18–20: descenso.
- Los equipos por debajo del puesto 20 aparecen como excluidos.

Proyecto independiente, no afiliado a AFA ni a sus competencias.

Dominio principal: [futbolrealista.com.ar](https://futbolrealista.com.ar/)
