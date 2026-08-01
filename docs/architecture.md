# Arquitectura de Apex Ether

## Frontera del producto

Apex Ether no depende de la interfaz principal de Apex Drive. Su única superficie pública de integración es `packages/apex-ether`.

```text
apps/apex-ether-studio
        │
        ▼
packages/apex-ether
        │
        ▼
aplicaciones consumidoras, incluido Apex Drive
```

## Biblioteca

`packages/apex-ether` contiene componentes presentacionales, tipos de telemetría y tokens. No debe importar código de Studio ni conocer el entorno que produce los datos.

## Studio

`apps/apex-ether-studio` es el entorno de exploración del sistema. Actualmente contiene:

- catálogo de composiciones;
- modos Glass y opaco;
- laboratorio de tipografía, paleta, sombras y superficie;
- vistas conceptuales de telemetría.

## Futuro compositor de interfaces

El futuro editor de HUD personalizados vivirá en Studio. Su configuración deberá producir un esquema serializable que seleccione componentes y propiedades públicas de `packages/apex-ether`, sin generar dependencias inversas desde la biblioteca hacia el editor.
