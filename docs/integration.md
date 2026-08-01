# Integración con Apex

## Modelo de integración

Apex Ether recibe datos ya normalizados. La aplicación anfitriona crea un adaptador entre su motor o transporte de telemetría y los contratos del paquete.

```text
fuente Apex → adaptador del host → contratos Ether → paneles React
```

El adaptador es el único lugar que debe conocer ambos mundos. Esto evita que el HUD dependa de estructuras internas de Apex Physics, Apex Run o Apex Drive.

## Dependencia dentro del workspace

Hasta que el paquete se distribuya públicamente, agregalo como dependencia de workspace:

```json
{
  "dependencies": {
    "@jvsysarch/apex-ether": "workspace:*"
  }
}
```

React y React DOM son `peerDependencies`; el host proporciona una única instancia de ambos.

## Estilos

Importá los estilos una sola vez en el punto de entrada de la aplicación:

```tsx
import '@jvsysarch/apex-ether/styles.css';
```

## Opción 1: composición con propiedades

Para snapshots, previews o pantallas con estado propio, los paneles aceptan contratos tipados directamente:

```tsx
import {
  ApexEtherPanel,
  ApexEtherMetric,
  ApexEtherMetricGrid,
  ApexEtherSpeed,
  type ApexEtherMotion,
} from '@jvsysarch/apex-ether';

const motion: ApexEtherMotion = {
  speedKmh: 278,
  rpm: 6840,
  maximumRpm: 9000,
  gear: '4',
  throttle: 0.74,
  brake: 0.18,
  steering: 8.4,
};

export function DrivingHud() {
  return (
    <>
      <ApexEtherSpeed motion={motion} mode="glass" />
      <ApexEtherPanel title="Estado del vehículo" mode="solid">
        <ApexEtherMetricGrid columns={2}>
          <ApexEtherMetric label="Combustible" value="64" unit="%" />
          <ApexEtherMetric label="Autonomía" value="142" unit="km" />
        </ApexEtherMetricGrid>
      </ApexEtherPanel>
    </>
  );
}
```

## Opción 2: telemetría continua por segmentos

Creá el store fuera del render, entregalo al proveedor y suscribí cada panel al segmento que necesita.

```tsx
import {
  ApexEtherProvider,
  ApexEtherSpeed,
  ApexEtherTelemetryStore,
  useApexEtherSlice,
} from '@jvsysarch/apex-ether';

const telemetryStore = new ApexEtherTelemetryStore();

function LiveSpeed() {
  const motion = useApexEtherSlice('motion');
  return motion ? <ApexEtherSpeed motion={motion} mode="glass" /> : null;
}

export function ApexHudRoot() {
  return (
    <ApexEtherProvider store={telemetryStore}>
      <LiveSpeed />
    </ApexEtherProvider>
  );
}
```

El adaptador publica una nueva referencia únicamente cuando cambia ese segmento:

```ts
telemetryStore.publish('motion', {
  speedKmh: 278,
  rpm: 6840,
  maximumRpm: 9000,
  gear: '4',
  throttle: 0.74,
  brake: 0.18,
  steering: 8.4,
});
```

## Opción 3: HUD declarativo

`ApexEtherHud` permite elegir paneles con una lista estable. Es útil para composiciones guardadas o presets:

```tsx
import { ApexEtherHud, type ApexEtherTelemetry } from '@jvsysarch/apex-ether';

export function RacePreset({ telemetry }: { telemetry: ApexEtherTelemetry }) {
  return (
    <ApexEtherHud
      telemetry={telemetry}
      panels={['position', 'race-clock', 'speed', 'route']}
      mode="glass"
    />
  );
}
```

La lista tipada incluye conceptos adicionales reservados para la expansión del catálogo. En la versión inicial, `ApexEtherHud` renderiza `speed`, `race-clock`, `position`, `vehicle-health`/`tires`, `route` e `input`; los demás identificadores todavía no tienen implementación en el compositor declarativo.

## Responsabilidades del adaptador

- Convertir unidades externas a las unidades del contrato.
- Limitar valores normalizados como acelerador y freno al rango esperado de `0` a `1`.
- Elegir una cadencia de publicación adecuada para la pantalla.
- Mantener referencias cuando un segmento no cambió.
- Traducir estados de negocio a tonos semánticos públicos.
- Desconectarse de la fuente y liberar suscripciones al desmontar el host.

## Modos de superficie

- `glass`: superficie transparente con texto claro, pensada para convivir con la escena.
- `solid`: superficie blanca con texto oscuro, pensada para máxima estabilidad visual.

Ambos modos comparten estructura, escala tipográfica y semántica. El host puede elegirlos por composición o por panel.

## Integración gradual recomendada

1. Montar el paquete en una ruta o capa aislada de Apex Drive.
2. Integrar primero `motion` y un único panel de velocidad.
3. Medir frecuencia, commits y estabilidad de frame.
4. Agregar `race`, `wheels`, `session` y `route` de forma independiente.
5. Convertir la composición validada en un preset declarativo.

Este recorrido conserva una frontera clara y permite encontrar el costo de cada grupo de datos antes de construir un HUD completo.

## Integración disponible en Apex Drive

Drive implementa la frontera en `apex-drive/src/ui/ether`: contrato propio, adaptador, store segmentado y runtime React. Ether no importa tipos de física ni conoce el bucle de simulación.

El flujo activo es:

```text
Apex Physics / carrera → ApexHudAdapter → ApexHudStore → ApexEtherHudRuntime → componentes Ether
```

El adaptador publica conducción a 30 Hz y estado a 10 Hz. Además, consulta la demanda derivada de los paneles visibles antes de solicitar un snapshot de física. La composición puede usarse localmente en Drive con `?ether=true`; ese modo desconecta la UI técnica anterior para evitar dos HUD superpuestos.
