import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ApexEtherMetric,
  ApexEtherMetricGrid,
  ApexEtherPanelList,
  ApexEtherPanelRow,
  ApexEtherProgress,
  ApexEtherSurface,
  ApexEtherTachometer,
  ApexEtherVehicleContact,
  type ApexEtherSurfaceMode,
  type ApexEtherTone,
} from '@jvsysarch/apex-ether';
import mountainBackground from './assets/ether-mountain-route-v1.png';
import nightBackground from './assets/ether-riverside-night-v1.png';
import { useStudioText } from './i18n';

type CatalogBackground = 'mountain' | 'night';

const backgroundImage = (background: CatalogBackground) => (
  `url("${background === 'mountain' ? mountainBackground : nightBackground}")`
);

function ConceptFrame({
  title,
  subtitle,
  mode,
  background,
  children,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly mode: ApexEtherSurfaceMode;
  readonly background: CatalogBackground;
  readonly children: ReactNode;
}) {
  const t = useStudioText();
  return <article
    className="catalog-frame expanded-frame"
    data-mode={mode}
    style={{ '--catalog-image': backgroundImage(background) } as CSSProperties}
  >
    <header>
      <div><span>{subtitle}</span><h2>{title}</h2></div>
      <b>{mode === 'glass' ? t('VIDRIO CLARO', 'CLEAR GLASS') : t('BLANCO OPACO', 'OPAQUE WHITE')}</b>
    </header>
    <div className="catalog-frame__scene expanded-frame__scene" data-mode={mode}>{children}</div>
  </article>;
}

function SemanticBadge({ children, tone }: { readonly children: ReactNode; readonly tone: ApexEtherTone }) {
  return <span className="expanded-badge" data-tone={tone}>{children}</span>;
}

interface TrendLine {
  readonly label: string;
  readonly tone: Extract<ApexEtherTone, 'positive' | 'info' | 'warning' | 'danger' | 'emphasis'>;
  readonly values: readonly number[];
}

function TrendChart({ title, lines }: { readonly title: string; readonly lines: readonly TrendLine[] }) {
  const points = (values: readonly number[]) => values.map((value, index) => (
    `${(index / Math.max(1, values.length - 1)) * 300},${104 - value * 82}`
  )).join(' ');
  return <figure className="expanded-trend">
    <figcaption>{title}</figcaption>
    <svg viewBox="0 0 300 112" role="img" aria-label={title}>
      <path d="M0 22H300 M0 63H300 M0 104H300" />
      {lines.map(line => <polyline key={line.label} points={points(line.values)} data-tone={line.tone} />)}
    </svg>
    <div>{lines.map(line => <span key={line.label} data-tone={line.tone}>{line.label}</span>)}</div>
  </figure>;
}

function TimingView({ mode }: { readonly mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  const splits = [
    ['S1', '24.812', '24.930', '−0.118', 'positive'],
    ['S2', '27.440', '27.824', '−0.384', 'positive'],
    ['S3', '26.901', '26.744', '+0.157', 'danger'],
  ] as const;
  return <div className="expanded-layout expanded-layout--timing">
    <ApexEtherSurface title={t('Vuelta activa', 'Active lap')} eyebrow={t('Cronometraje', 'Timing')} mode={mode} className="expanded-timing-now">
      <ApexEtherMetric label={t('Tiempo', 'Time')} value="01:24.560" tone="emphasis" />
      <ApexEtherMetric label={t('Delta acumulado', 'Cumulative delta')} value="−0.345" unit="s" tone="positive" detail={t('Respecto de tu mejor vuelta', 'Against your best lap')} />
      <ApexEtherProgress label={t('Puntos de control', 'Checkpoints')} value={0.7} valueLabel="7 / 10" detail={t('Sector 3 · entrada', 'Sector 3 · entry')} tone="emphasis" />
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Parciales', 'Splits')} eyebrow={t('Actual / referencia', 'Current / reference')} mode={mode} className="expanded-splits">
      <ApexEtherPanelList label={t('Parciales de la vuelta', 'Lap splits')}>
        {splits.map(([sector, current, best, delta, tone], index) => <ApexEtherPanelRow
          key={sector}
          leading={sector}
          label={`${current} · ref. ${best}`}
          value={delta}
          active={index === 2}
          tone={tone}
        />)}
      </ApexEtherPanelList>
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Historial de sesión', 'Session history')} eyebrow={t('Persistencia local', 'Local persistence')} mode={mode} className="expanded-records">
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label={t('Mejor', 'Best')} value="01:18.732" tone="info" />
        <ApexEtherMetric label={t('Última', 'Last')} value="01:19.077" />
      </ApexEtherMetricGrid>
      <ApexEtherPanelList label={t('Datos del récord', 'Record data')}>
        <ApexEtherPanelRow label={t('Registro', 'Record')} value={t('01 AGO · 18:42', 'AUG 01 · 18:42')} tone="info" />
        <ApexEtherPanelRow label={t('Vuelta', 'Lap')} value="2 / 8" />
        <ApexEtherPanelRow label={t('Estado', 'Status')} value={t('Válida', 'Valid')} tone="positive" />
      </ApexEtherPanelList>
    </ApexEtherSurface>
  </div>;
}

const wheelStates = [
  { id: 'FL', temperatureC: 91, pressurePsi: 27.8, loadKn: 5.2, gripPercent: 93.2, slipPercent: 6.8, steeringAngleDeg: 7, compression: .82, tone: 'info' },
  { id: 'FR', temperatureC: 86, pressurePsi: 27.5, loadKn: 3.2, gripPercent: 97.7, slipPercent: 2.3, steeringAngleDeg: 6.4, compression: .34, tone: 'positive' },
  { id: 'RL', temperatureC: 94, pressurePsi: 28.1, loadKn: 4.9, gripPercent: 91.1, slipPercent: 8.9, steeringAngleDeg: 0, compression: .78, tone: 'warning' },
  { id: 'RR', temperatureC: 85, pressurePsi: 27.4, loadKn: 3.1, gripPercent: 97.2, slipPercent: 2.8, steeringAngleDeg: 0, compression: .38, tone: 'positive' },
] as const;

function DynamicsView({ mode }: { readonly mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  return <div className="expanded-layout expanded-layout--dynamics" id="vehicle-contact">
    <ApexEtherVehicleContact wheels={wheelStates} mode={mode} />
    <ApexEtherSurface title={t('Dinámica instantánea', 'Instant dynamics')} eyebrow={t('Valores de decisión', 'Decision values')} mode={mode} className="expanded-dynamics-summary">
      <ApexEtherTachometer rpm={6840} maximumRpm={8200} />
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label={t('Dirección', 'Steering')} value={t('+7,0', '+7.0')} unit="°" tone="info" />
        <ApexEtherMetric label={t('Carga total', 'Total load')} value={t('16,2', '16.2')} unit="kN" />
        <ApexEtherMetric label={t('Slip máximo', 'Maximum slip')} value={t('11,2', '11.2')} unit="%" tone="warning" />
        <ApexEtherMetric label={t('Apoyo', 'Contact')} value="4 / 4" tone="positive" />
      </ApexEtherMetricGrid>
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Evolución del contacto', 'Contact evolution')} eyebrow={t('Ventana corta', 'Short window')} mode={mode} className="expanded-slip-trend">
      <TrendChart title={t('Slip por rueda', 'Slip by wheel')} lines={[
        { label: 'FL', tone: 'positive', values: [.21, .26, .31, .29, .34, .30, .28] },
        { label: 'FR', tone: 'info', values: [.18, .22, .25, .28, .33, .36, .31] },
        { label: 'RL', tone: 'warning', values: [.28, .35, .48, .61, .73, .65, .58] },
        { label: 'RR', tone: 'danger', values: [.14, .20, .28, .24, .35, .41, .37] },
      ]} />
    </ApexEtherSurface>
  </div>;
}

function TireEnergyView({ mode }: { readonly mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  const energy = [
    ['FL', '1,18 kW', '42,6 kJ', .42, 'positive'],
    ['FR', '1,34 kW', '46,1 kJ', .48, 'info'],
    ['RL', '3,86 kW', '92,8 kJ', .82, 'warning'],
    ['RR', '1,72 kW', '55,4 kJ', .55, 'positive'],
  ] as const;
  return <div className="expanded-layout expanded-layout--tires">
    <ApexEtherSurface title={t('Energía de neumáticos', 'Tire energy')} eyebrow={t('Disipación instantánea', 'Instant dissipation')} mode={mode} className="expanded-energy">
      <div className="expanded-energy-grid">{energy.map(([id, power, total, level, tone]) => <article key={id} data-tone={tone}>
        <strong>{id}</strong><span>{power}</span><small>{t('Acumulada', 'Accumulated')} · {total}</small>
        <ApexEtherProgress label={t('Intensidad', 'Intensity')} value={level} tone={tone} />
      </article>)}</div>
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Recorrido de suspensión', 'Suspension travel')} eyebrow={t('Compresión / extensión', 'Compression / extension')} mode={mode} className="expanded-suspension">
      <ApexEtherProgress label={t('Delantera izquierda', 'Front left')} value={.58} valueLabel="58%" tone="info" />
      <ApexEtherProgress label={t('Delantera derecha', 'Front right')} value={.64} valueLabel="64%" tone="info" />
      <ApexEtherProgress label={t('Trasera izquierda', 'Rear left')} value={.83} valueLabel="83%" tone="warning" detail={t('Cerca del límite operativo', 'Near the operating limit')} />
      <ApexEtherProgress label={t('Trasera derecha', 'Rear right')} value={.61} valueLabel="61%" tone="positive" />
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Ventana operativa', 'Operating window')} eyebrow={t('Configuración activa', 'Active setup')} mode={mode} className="expanded-tire-operating">
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label={t('Compuesto', 'Compound')} value="Semi-slick" variant="hero" />
        <ApexEtherMetric label={t('Modelo', 'Model')} value="TMeasy V1" variant="hero" />
        <ApexEtherMetric label={t('Presión', 'Pressure')} value={t('30,0', '30.0')} unit="psi" tone="positive" />
        <ApexEtherMetric label={t('Temperatura', 'Temperature')} value="85" unit="°C" tone="positive" />
        <ApexEtherMetric label={t('Escala de grip', 'Grip scale')} value={t('1,06', '1.06')} unit="×" tone="info" />
        <ApexEtherMetric label={t('Contactos', 'Contacts')} value={t('8 / rueda', '8 / wheel')} />
      </ApexEtherMetricGrid>
    </ApexEtherSurface>
  </div>;
}

function PowertrainView({ mode }: { readonly mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  return <div className="expanded-layout expanded-layout--powertrain">
    <ApexEtherSurface title={t('Transmisión', 'Transmission')} eyebrow={t('Acoplamiento', 'Engagement')} mode={mode} className="expanded-transmission">
      <div className="expanded-state-heading"><SemanticBadge tone="positive">{t('Acoplado', 'Engaged')}</SemanticBadge><strong>{t('Marcha 4', 'Gear 4')}</strong></div>
      <ApexEtherProgress label={t('Embrague', 'Clutch')} value={.94} valueLabel="94%" tone="positive" detail={t('Entrega estable', 'Stable delivery')} />
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label="RPM ×1000" value={t('6,84', '6.84')} tone="emphasis" />
        <ApexEtherMetric label={t('Cambio', 'Shift')} value={t('Listo', 'Ready')} tone="positive" />
      </ApexEtherMetricGrid>
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Entrega de par', 'Torque delivery')} eyebrow={t('Solicitado / aplicado', 'Requested / applied')} mode={mode} className="expanded-torque">
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label={t('Motor solicitado', 'Engine requested')} value="742" unit="Nm" />
        <ApexEtherMetric label={t('Motor entregado', 'Engine delivered')} value="718" unit="Nm" tone="positive" />
      </ApexEtherMetricGrid>
      <ApexEtherProgress label={t('Eje delantero', 'Front axle')} value={.45} valueLabel="45%" tone="info" />
      <ApexEtherProgress label={t('Eje trasero', 'Rear axle')} value={.55} valueLabel="55%" tone="emphasis" />
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Carga aerodinámica', 'Aerodynamic load')} eyebrow={t('Alta velocidad', 'High speed')} mode={mode} className="expanded-aero">
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label={t('Arrastre', 'Drag')} value={t('1,42', '1.42')} unit="kN" />
        <ApexEtherMetric label={t('Carga total', 'Total load')} value={t('3,86', '3.86')} unit="kN" />
        <ApexEtherMetric label={t('Balance delantero', 'Front balance')} value="42" unit="%" tone="info" />
        <ApexEtherMetric label={t('Balance trasero', 'Rear balance')} value="58" unit="%" tone="emphasis" />
      </ApexEtherMetricGrid>
    </ApexEtherSurface>
  </div>;
}

function PredictiveRoute() {
  const t = useStudioText();
  return <figure className="expanded-predictive-route">
    <svg viewBox="0 0 320 260" role="img" aria-label={t('Ruta predictiva y próxima acción', 'Predictive route and next action')}>
      <path d="M54 244 C48 190 94 185 104 143 C116 92 72 64 105 27 C139 -9 220 25 218 83 C216 136 167 142 178 191 C187 230 239 220 270 180" />
      <circle cx="104" cy="143" r="8" data-tone="warning" />
      <circle cx="178" cy="191" r="8" data-tone="info" />
      <polygon points="54,223 43,247 65,247" />
    </svg>
    <div><SemanticBadge tone="warning">{t('Frenada · 86 m', 'Braking · 86 m')}</SemanticBadge><SemanticBadge tone="info">{t('Vértice · derecha', 'Apex · right')}</SemanticBadge></div>
  </figure>;
}

function CommandBars() {
  const t = useStudioText();
  return <div className="expanded-commands">
    <ApexEtherProgress label={t('Acelerador', 'Throttle')} value={.74} valueLabel="74%" tone="emphasis" />
    <ApexEtherProgress label={t('Freno', 'Brake')} value={.18} valueLabel="18%" tone="danger" />
    <ApexEtherProgress label={t('Dirección', 'Steering')} value={.58} valueLabel={t('+8,4°', '+8.4°')} tone="info" />
  </div>;
}

function AutonomousView({ mode }: { readonly mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  return <div className="expanded-layout expanded-layout--autonomous">
    <ApexEtherSurface title={t('Estrategia autónoma', 'Autonomous strategy')} eyebrow={t('Próxima decisión', 'Next decision')} mode={mode} className="expanded-ai-decision">
      <div className="expanded-state-heading"><SemanticBadge tone="positive">{t('Asistencia activa', 'Assist active')}</SemanticBadge><strong>{t('Vuelta aprendida 6', 'Learned lap 6')}</strong></div>
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label={t('Velocidad', 'Speed')} value="278" unit="km/h" />
        <ApexEtherMetric label={t('Objetivo', 'Target')} value="264" unit="km/h" tone="warning" />
        <ApexEtherMetric label={t('Fase', 'Phase')} value={t('Entrada', 'Entry')} variant="hero" tone="info" />
        <ApexEtherMetric label={t('Margen', 'Margin')} value="86" unit="m" tone="warning" />
      </ApexEtherMetricGrid>
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Lectura predictiva', 'Predictive reading')} eyebrow={t('140 m por delante', '140 m ahead')} mode={mode} className="expanded-ai-route">
      <PredictiveRoute />
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Comandos aplicados', 'Applied commands')} eyebrow={t('Salida del controlador', 'Controller output')} mode={mode} className="expanded-ai-commands">
      <CommandBars />
      <ApexEtherPanelList label={t('Estado de control', 'Control status')}>
        <ApexEtherPanelRow label={t('Línea deseada', 'Target line')} value={t('+0,32 m', '+0.32 m')} tone="info" />
        <ApexEtherPanelRow label={t('Error lateral', 'Lateral error')} value={t('0,18 m', '0.18 m')} tone="positive" />
        <ApexEtherPanelRow label={t('Mirada adelante', 'Look-ahead')} value={t('42,0 m', '42.0 m')} />
      </ApexEtherPanelList>
    </ApexEtherSurface>
  </div>;
}

function LearningView({ mode }: { readonly mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  const rows = Array.from({ length: 10 }, (_, index) => {
    const current = 6.82 + index * .17;
    const delta = index === 6 ? .21 : index % 3 === 0 ? -.12 : -.04;
    return {
      id: `S${index + 1}`,
      current: current.toFixed(3),
      best: (current - delta).toFixed(3),
      delta: `${delta > 0 ? '+' : '−'}${Math.abs(delta).toFixed(3)}`,
      tone: delta > 0 ? 'danger' : 'positive',
      active: index === 6,
    } as const;
  });
  return <div className="expanded-layout expanded-layout--learning">
    <ApexEtherSurface title={t('Aprendizaje por zona', 'Learning by zone')} eyebrow={t('Memoria de conducción', 'Driving memory')} mode={mode} className="expanded-learning-zone">
      <div className="expanded-state-heading"><SemanticBadge tone="info">{t('Zona 7 / 10', 'Zone 7 / 10')}</SemanticBadge><strong>{t('Validada', 'Validated')}</strong></div>
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label={t('Mínima validada', 'Validated minimum')} value="214" unit="km/h" tone="positive" />
        <ApexEtherMetric label={t('Máxima validada', 'Validated maximum')} value="238" unit="km/h" tone="info" />
        <ApexEtherMetric label={t('Próximo objetivo', 'Next target')} value="242" unit="km/h" tone="emphasis" />
        <ApexEtherMetric label={t('Potencial', 'Potential')} value={t('0,18', '0.18')} unit="s" tone="positive" />
      </ApexEtherMetricGrid>
      <ApexEtherProgress label={t('Cobertura aprendida', 'Learned coverage')} value={.84} valueLabel="84%" tone="info" detail={t('6 vueltas limpias', '6 clean laps')} />
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Parciales de aprendizaje', 'Learning splits')} eyebrow={t('10 segmentos', '10 segments')} mode={mode} className="expanded-learning-splits">
      <ApexEtherPanelList label={t('Tiempos por segmento', 'Times by segment')}>
        {rows.map(row => <ApexEtherPanelRow key={row.id} leading={row.id} label={`${row.current} · ref. ${row.best}`} value={row.delta} tone={row.tone} active={row.active} />)}
      </ApexEtherPanelList>
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Calidad de aprendizaje', 'Learning quality')} eyebrow={t('Sesión actual', 'Current session')} mode={mode} className="expanded-learning-quality">
      <ApexEtherMetricGrid columns={2}>
        <ApexEtherMetric label={t('Pasadas limpias', 'Clean passes')} value="18" tone="positive" />
        <ApexEtherMetric label={t('Incidentes', 'Incidents')} value="2" tone="warning" />
        <ApexEtherMetric label={t('Vuelta actual', 'Current lap')} value="01:19.077" />
        <ApexEtherMetric label={t('Mejor', 'Best')} value="01:18.732" tone="info" />
      </ApexEtherMetricGrid>
      <ApexEtherPanelList label={t('Estado de memoria', 'Memory status')}>
        <ApexEtherPanelRow label="Ghost" value={t('Disponible', 'Available')} tone="positive" />
        <ApexEtherPanelRow label={t('Base', 'Baseline')} value={t('Confirmada', 'Confirmed')} tone="info" />
        <ApexEtherPanelRow label={t('Optimización', 'Optimization')} value={t('En progreso', 'In progress')} tone="emphasis" />
      </ApexEtherPanelList>
    </ApexEtherSurface>
  </div>;
}

function RuntimeView({ mode }: { readonly mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  return <div className="expanded-layout expanded-layout--runtime">
    <ApexEtherSurface title={t('Rendimiento del runtime', 'Runtime performance')} eyebrow={t('Presupuesto de frame', 'Frame budget')} mode={mode} className="expanded-runtime-primary">
      <ApexEtherMetricGrid columns={4}>
        <ApexEtherMetric label="FPS" value="118" tone="positive" />
        <ApexEtherMetric label="Frame" value={t('8,47', '8.47')} unit="ms" tone="positive" />
        <ApexEtherMetric label="P95" value={t('11,80', '11.80')} unit="ms" tone="info" />
        <ApexEtherMetric label={t('Máximo', 'Maximum')} value={t('19,24', '19.24')} unit="ms" tone="warning" />
      </ApexEtherMetricGrid>
      <div className="expanded-budget-grid">
        <ApexEtherProgress label={t('Simulación', 'Simulation')} value={2.1 / 16.67} valueLabel={t('2,10 ms', '2.10 ms')} tone="positive" />
        <ApexEtherProgress label={t('Neumático visual', 'Visual tire')} value={1.2 / 16.67} valueLabel={t('1,20 ms', '1.20 ms')} tone="info" />
        <ApexEtherProgress label={t('Preparación de render', 'Render preparation')} value={3.8 / 16.67} valueLabel={t('3,80 ms', '3.80 ms')} tone="emphasis" />
        <ApexEtherProgress label={t('Escena e interfaz', 'Scene and interface')} value={1.37 / 16.67} valueLabel={t('1,37 ms', '1.37 ms')} tone="positive" />
      </div>
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Salud de ejecución', 'Runtime health')} eyebrow={t('Diagnóstico', 'Diagnostics')} mode={mode} className="expanded-runtime-health">
      <div className="expanded-runtime-badges"><SemanticBadge tone="positive">360 Hz</SemanticBadge><SemanticBadge tone="info">WASM</SemanticBadge><SemanticBadge tone="emphasis">WebGPU</SemanticBadge></div>
      <ApexEtherPanelList label={t('Estado del runtime', 'Runtime status')}>
        <ApexEtherPanelRow label={t('Backend de neumáticos', 'Tire backend')} value={t('Compilado', 'Compiled')} tone="positive" />
        <ApexEtherPanelRow label={t('Contactos evaluados', 'Evaluated contacts')} value="32 / 32" tone="positive" />
        <ApexEtherPanelRow label={t('Saltos recientes', 'Recent skips')} value="1" tone="warning" />
        <ApexEtherPanelRow label={t('Diagnóstico', 'Diagnostics')} value={t('Estable', 'Stable')} tone="positive" />
      </ApexEtherPanelList>
    </ApexEtherSurface>
    <ApexEtherSurface title={t('Contexto de conducción', 'Driving context')} eyebrow={t('Sistemas disponibles', 'Available systems')} mode={mode} className="expanded-context">
      <ApexEtherPanelList label={t('Contexto de ejecución', 'Runtime context')}>
        <ApexEtherPanelRow label={t('Entorno', 'Environment')} value="Altas Cumbres" tone="info" />
        <ApexEtherPanelRow label={t('Cámara', 'Camera')} value={t('Exterior dinámica', 'Dynamic exterior')} />
        <ApexEtherPanelRow label={t('Audio de motor', 'Engine audio')} value="18%" />
        <ApexEtherPanelRow label={t('Control', 'Controller')} value={t('Conectado', 'Connected')} tone="positive" />
        <ApexEtherPanelRow label={t('Asistencia', 'Assistance')} value={t('Disponible', 'Available')} tone="info" />
      </ApexEtherPanelList>
    </ApexEtherSurface>
  </div>;
}

export function ExpandedCatalog() {
  const t = useStudioText();
  const query = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState<ApexEtherSurfaceMode>(query.get('mode') === 'solid' ? 'solid' : 'glass');
  const requestedPanel = query.get('panel');
  const concepts = [
    { id: 'timing', title: t('Cronometraje profundo', 'Advanced timing'), subtitle: t('Vuelta · checkpoints · récords', 'Lap · checkpoints · records'), background: 'night', content: <TimingView mode={mode} /> },
    { id: 'dynamics', title: t('Dinámica y contacto', 'Dynamics and contact'), subtitle: t('Carga · slip · apoyo', 'Load · slip · contact'), background: 'mountain', content: <DynamicsView mode={mode} /> },
    { id: 'tires', title: t('Neumáticos y suspensión', 'Tires and suspension'), subtitle: t('Energía · recorrido · ventana operativa', 'Energy · travel · operating window'), background: 'night', content: <TireEnergyView mode={mode} /> },
    { id: 'powertrain', title: t('Transmisión y aerodinámica', 'Transmission and aerodynamics'), subtitle: t('Acoplamiento · par · carga', 'Engagement · torque · load'), background: 'mountain', content: <PowertrainView mode={mode} /> },
    { id: 'autonomous', title: t('Estrategia autónoma', 'Autonomous strategy'), subtitle: t('Decisión · anticipación · comandos', 'Decision · anticipation · commands'), background: 'night', content: <AutonomousView mode={mode} /> },
    { id: 'learning', title: t('Aprendizaje y parciales', 'Learning and splits'), subtitle: t('Zonas · memoria · calidad', 'Zones · memory · quality'), background: 'mountain', content: <LearningView mode={mode} /> },
    { id: 'runtime', title: t('Runtime y contexto', 'Runtime and context'), subtitle: t('Frame-time · backend · sistemas', 'Frame time · backend · systems'), background: 'night', content: <RuntimeView mode={mode} /> },
  ] as const;
  const visibleConcepts = requestedPanel
    ? concepts.filter(concept => concept.id === requestedPanel)
    : concepts;
  useEffect(() => {
    if (window.location.hash !== '#expanded-catalog') return;
    window.requestAnimationFrame(() => document.getElementById('expanded-catalog')?.scrollIntoView());
  }, []);
  return <section id="expanded-catalog" className="expanded-catalog">
    <header className="expanded-catalog__header">
      <div><span>{t('Biblioteca de telemetría', 'Telemetry library')}</span><h2>{t('Una vista clara para cada decisión', 'A clear view for every decision')}</h2><p>{t('Cronometraje, dinámica, neumáticos, potencia, asistencia y rendimiento organizados en composiciones especializadas.', 'Timing, dynamics, tires, power, assistance and performance organized into specialized compositions.')}</p></div>
      <div className="expanded-mode-switch" role="group" aria-label={t('Apariencia de los paneles', 'Panel appearance')}>
        <button type="button" data-active={mode === 'glass' || undefined} onClick={() => setMode('glass')}>Glass</button>
        <button type="button" data-active={mode === 'solid' || undefined} onClick={() => setMode('solid')}>{t('Opaco', 'Opaque')}</button>
      </div>
    </header>
    <div className="catalog-frames expanded-catalog__frames">
      {visibleConcepts.map(concept => <ConceptFrame
        key={concept.id}
        title={concept.title}
        subtitle={concept.subtitle}
        mode={mode}
        background={concept.background}
      >{concept.content}</ConceptFrame>)}
    </div>
  </section>;
}
