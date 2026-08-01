# Apex Ether

Sistema modular de HUD y telemetría automotriz creado por **Jonathan Villaverde**.

Apex Ether se desarrolla como producto independiente de Apex Drive. El repositorio contiene una biblioteca React integrable y una aplicación Studio para revisar, combinar y ajustar sus componentes visuales.

## Estructura

- `packages/apex-ether`: componentes React, contratos, tokens y estilos reutilizables.
- `apps/apex-ether-studio`: catálogo visual y laboratorio de configuración.
- `docs/architecture.md`: fronteras actuales y preparación para el futuro compositor de interfaces.

## Aplicación

- `/`: catálogo completo, sin herramientas de laboratorio.
- `/?lab=true`: catálogo con Tipografía, Paleta, Sombras y Glass.
- `/lab`: ruta alternativa del laboratorio.
- `/lab?section=typography`: laboratorio con Tipografía desplegada.

## Desarrollo

```bash
corepack pnpm install
corepack pnpm dev
```

La aplicación se publica exclusivamente mediante GitHub Pages usando el workflow incluido en `.github/workflows/pages.yml`.

## Autoría

Diseño, dirección y desarrollo: **Jonathan Villaverde**  
Contacto: `jv.sys.arch@gmail.com`  
Copyright © 2026 Jonathan Villaverde.

## Licencias

- Código fuente: PolyForm Noncommercial License 1.0.0.
- Diseño visual, imágenes y documentación: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International.

Consultá [LICENSE.md](LICENSE.md) para conocer el alcance exacto.
