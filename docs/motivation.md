# Motivación

## El HUD como sistema, no como pantalla

En una experiencia de conducción, la interfaz convive con una escena en movimiento, cambios de luz y decisiones que deben tomarse en muy poco tiempo. Mostrar más datos no mejora necesariamente la experiencia: el desafío consiste en elegir la señal adecuada, darle una jerarquía inequívoca y actualizarla con un costo predecible.

Apex Ether nace para convertir ese problema en un sistema independiente y reusable, en vez de resolver cada HUD como una pantalla aislada dentro de Apex Drive.

## Los problemas de origen

### Acoplamiento

Cuando el HUD conoce el motor, el estado global y la estructura de una aplicación, cada cambio de producto obliga a modificar la capa visual. También dificulta probar los componentes con datos controlados o reutilizarlos en otra experiencia.

### Actualizaciones excesivas

La telemetría no cambia toda a la misma velocidad. La marcha o las revoluciones pueden variar muchas veces por segundo, mientras que el circuito, el clima o la cantidad de vueltas permanecen estables. Tratar todo como un único objeto empuja a React a revisar más interfaz de la necesaria.

### Falta de jerarquía

Velocidad, delta, advertencias y contexto de sesión no compiten con la misma prioridad. Sin una arquitectura tipográfica y semántica compartida, cada panel crea sus propias reglas y el HUD pierde coherencia.

### Composiciones rígidas

Una carrera, un entrenamiento, una prueba de vehículo y un análisis técnico necesitan conjuntos de información distintos. Un HUD monolítico obliga a ocultar partes de una estructura fija en lugar de componer sólo lo necesario.

## La propuesta

Apex Ether establece una frontera pequeña y explícita:

1. El ecosistema Apex produce la telemetría.
2. Un adaptador la convierte al contrato público de Ether.
3. El paquete renderiza paneles independientes y accesibles.
4. La aplicación anfitriona decide posición, visibilidad y contexto.

El catálogo funciona como inventario y banco de pruebas del lenguaje visual. El laboratorio permite ajustar sus fundamentos sin mezclar esas herramientas con la experiencia principal. Más adelante, el compositor de interfaces trabajará sobre las mismas primitivas y generará una configuración portable.

## Principios

- **Frontera independiente:** la biblioteca no importa código de Apex Drive ni del Studio.
- **Jerarquía primero:** cada dato tiene un propósito, un nivel tipográfico y un tono semántico definidos.
- **Composición por primitivas:** panel, encabezado, cuerpo, lista, fila, métrica y progreso forman una gramática común.
- **Rendimiento medible:** el trabajo de render debe crecer con los paneles afectados, no con toda la frecuencia del simulador.
- **Dos superficies coherentes:** Glass transparente para convivir con la escena y opaco blanco para máxima estabilidad visual.
- **Configuración portable:** las futuras interfaces personalizadas deberán poder describirse sin código específico del host.

## Qué no intenta resolver

Apex Ether no reemplaza al motor de física, al transporte de telemetría ni al sistema de escenas. Tampoco prescribe una única disposición de HUD. Su responsabilidad comienza cuando los datos ya fueron normalizados y termina en componentes React y estilos públicos listos para componer.
