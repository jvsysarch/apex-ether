import * as React from 'react';
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

export type ApexEtherSurfaceMode = 'glass' | 'solid';
export type ApexEtherTone = 'neutral' | 'positive' | 'info' | 'warning' | 'danger' | 'emphasis';
export type ApexEtherPanelId =
  | 'speed'
  | 'race-clock'
  | 'position'
  | 'leaderboard'
  | 'objectives'
  | 'vehicle-health'
  | 'tires'
  | 'route'
  | 'input'
  | 'assists'
  | 'energy'
  | 'weather'
  | 'session'
  | 'notification'
  | 'split'
  | 'reference-delta'
  | 'camera';

export interface ApexEtherMetricValue {
  readonly label: string;
  readonly value: string | number;
  readonly unit?: string;
  readonly detail?: string;
  readonly tone?: ApexEtherTone;
  /** `hero` is for prominent textual values such as track, vehicle or condition. */
  readonly variant?: 'metric' | 'hero';
}

export interface ApexEtherMotion {
  readonly speedKmh: number;
  readonly rpm: number;
  readonly maximumRpm: number;
  readonly gear: string;
  readonly throttle: number;
  readonly brake: number;
  readonly steering?: number;
}

export interface ApexEtherRace {
  readonly position: number;
  readonly entrants: number;
  readonly lap: number;
  readonly lapCount: number;
  readonly elapsed: string;
  readonly bestLap?: string;
  readonly delta?: string;
  readonly deltaTone?: ApexEtherTone;
  readonly sector: number;
  readonly sectorCount: number;
}

export interface ApexEtherContactWheel {
  readonly id: 'FL' | 'FR' | 'RL' | 'RR';
  readonly loadKn: number;
  readonly gripPercent: number;
  /** Percentage of longitudinal/lateral slip reported by the host. */
  readonly slipPercent?: number;
  /** Visual steering angle for the wheel representation. */
  readonly steeringAngleDeg?: number;
  /** Normalized suspension compression, from 0 to 1. */
  readonly compression?: number;
  readonly tone?: ApexEtherTone;
}

export interface ApexEtherWheel extends ApexEtherContactWheel {
  readonly temperatureC: number;
  readonly pressurePsi: number;
}

export interface ApexEtherRoutePoint { readonly x: number; readonly y: number; }

export interface ApexEtherSession {
  readonly trackName: string;
  readonly vehicleName: string;
  readonly mode: string;
  readonly weather: string;
  readonly condition: string;
}

export interface ApexEtherTelemetry {
  readonly motion: ApexEtherMotion;
  readonly race: ApexEtherRace;
  readonly wheels: readonly ApexEtherWheel[];
  readonly session: ApexEtherSession;
  readonly route?: readonly ApexEtherRoutePoint[];
}

export type ApexEtherTelemetrySlice = keyof ApexEtherTelemetry;
type Listener = () => void;

/**
 * A host-side external store. Publish only changed, immutable slices. This keeps
 * React work proportional to the visible panels rather than the simulation tick.
 */
export class ApexEtherTelemetryStore {
  private readonly values: Partial<ApexEtherTelemetry> = {};
  private readonly listeners: Record<ApexEtherTelemetrySlice, Set<Listener>> = {
    motion: new Set(), race: new Set(), wheels: new Set(), session: new Set(), route: new Set(),
  };

  subscribe(slice: ApexEtherTelemetrySlice, listener: Listener): () => void {
    this.listeners[slice].add(listener);
    return () => this.listeners[slice].delete(listener);
  }

  getSnapshot<K extends ApexEtherTelemetrySlice>(slice: K): ApexEtherTelemetry[K] | undefined {
    return this.values[slice] as ApexEtherTelemetry[K] | undefined;
  }

  publish<K extends ApexEtherTelemetrySlice>(slice: K, value: ApexEtherTelemetry[K]): void {
    if (Object.is(this.values[slice], value)) return;
    this.values[slice] = value;
    this.listeners[slice].forEach(listener => listener());
  }
}

const StoreContext = createContext<ApexEtherTelemetryStore | null>(null);

export function ApexEtherProvider({ store, children }: PropsWithChildren<{ store: ApexEtherTelemetryStore }>) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useApexEtherSlice<K extends ApexEtherTelemetrySlice>(slice: K): ApexEtherTelemetry[K] | undefined {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Apex Ether requires ApexEtherProvider.');
  const subscribe = useCallback((listener: Listener) => store.subscribe(slice, listener), [slice, store]);
  const snapshot = useCallback(() => store.getSnapshot(slice), [slice, store]);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export interface ApexEtherSurfaceProps {
  readonly title?: string;
  readonly eyebrow?: string;
  readonly ariaLabel?: string;
  readonly mode?: ApexEtherSurfaceMode;
  readonly tone?: ApexEtherTone;
  readonly className?: string;
  readonly children: ReactNode;
}

export const ApexEtherPanelHeader = memo(({
  title,
  eyebrow,
}: {
  readonly title?: string;
  readonly eyebrow?: string;
}) => (
  title || eyebrow ? <header className="apex-ether-panel__header">
    <div>
      {eyebrow ? <span>{eyebrow}</span> : null}
      {title ? <h3>{title}</h3> : null}
    </div>
  </header> : null
));

export const ApexEtherPanelBody = memo(({
  children,
  className = '',
}: PropsWithChildren<{ readonly className?: string }>) => (
  <div className={`apex-ether-panel__body ${className}`.trim()}>{children}</div>
));

export const ApexEtherPanelList = memo(({
  children,
  ordered = false,
  className = '',
  label,
}: PropsWithChildren<{
  readonly ordered?: boolean;
  readonly className?: string;
  readonly label?: string;
}>) => {
  const Element = ordered ? 'ol' : 'ul';
  return <Element
    className={`apex-ether-panel-list ${className}`.trim()}
    aria-label={label}
  >{children}</Element>;
});

export const ApexEtherPanelRow = memo(({
  label,
  value,
  detail,
  leading,
  active = false,
  tone = 'neutral',
}: {
  readonly label: string;
  readonly value?: string;
  readonly detail?: string;
  readonly leading?: ReactNode;
  readonly active?: boolean;
  readonly tone?: ApexEtherTone;
}) => (
  <li
    className="apex-ether-panel-row"
    data-active={active || undefined}
    data-tone={tone}
  >
    {leading ? <b>{leading}</b> : null}
    <span>{label}</span>
    {detail ? <small>{detail}</small> : null}
    {value ? <strong>{value}</strong> : null}
  </li>
));

export const ApexEtherMetricGrid = memo(({
  children,
  columns = 2,
}: PropsWithChildren<{ readonly columns?: 1 | 2 | 3 | 4 }>) => (
  <div
    className="apex-ether-metric-grid"
    style={{ '--apex-ether-columns': columns } as CSSProperties}
  >{children}</div>
));

export const ApexEtherProgress = memo(({
  label,
  value,
  valueLabel,
  detail,
  tone = 'emphasis',
}: {
  readonly label: string;
  readonly value: number;
  readonly valueLabel?: string;
  readonly detail?: string;
  readonly tone?: ApexEtherTone;
}) => {
  const normalizedValue = Math.min(1, Math.max(0, value));
  return <div className="apex-ether-progress" data-tone={tone}>
    <div><span>{label}</span><strong>{valueLabel ?? `${Math.round(normalizedValue * 100)}%`}</strong></div>
    <i aria-hidden="true"><b style={{ transform: `scaleX(${normalizedValue})` }} /></i>
    {detail ? <small>{detail}</small> : null}
  </div>;
});

export const ApexEtherPanel = memo(({
  title, eyebrow, ariaLabel, mode = 'glass', tone = 'neutral', className = '', children,
}: ApexEtherSurfaceProps) => (
  <section aria-label={ariaLabel} className={`apex-ether-panel apex-ether-surface apex-ether-panel--${mode} apex-ether-surface--${mode} apex-ether-panel--${tone} apex-ether-surface--${tone} ${className}`.trim()}>
    <ApexEtherPanelHeader title={title} eyebrow={eyebrow} />
    <ApexEtherPanelBody>{children}</ApexEtherPanelBody>
  </section>
));

/** Compatibility name for the first Ether prototype. New code should use Panel. */
export const ApexEtherSurface = ApexEtherPanel;

export const ApexEtherMetric = memo(({ label, value, unit, detail, tone = 'neutral', variant = 'metric' }: ApexEtherMetricValue) => (
  <div className={`apex-ether-metric apex-ether-metric--${tone} apex-ether-metric--${variant}`}>
    <span>{label}</span>
    <strong>{value}<small>{unit}</small></strong>
    {detail ? <em>{detail}</em> : null}
  </div>
));

/** Compact tachometer shared by driving and vehicle-dynamics compositions. */
export const ApexEtherTachometer = memo(({
  rpm,
  maximumRpm,
}: {
  readonly rpm: number;
  readonly maximumRpm: number;
}) => {
  const scaleMaximum = Math.max(1, Math.ceil(maximumRpm / 1000));
  const normalizedRpm = Math.min(1, Math.max(0, rpm / (scaleMaximum * 1000)));
  const normalizedRedline = Math.min(1, Math.max(0, maximumRpm / (scaleMaximum * 1000)));
  const ticks = useMemo(() => Array.from({ length: scaleMaximum + 1 }, (_, index) => index), [scaleMaximum]);
  const style = {
    '--apex-ether-rpm': normalizedRpm,
    '--apex-ether-redline': normalizedRedline,
    '--apex-ether-tach-columns': ticks.length,
  } as CSSProperties;
  return <div className="apex-ether-tachometer" style={style}>
    <div><span>RPM ×1000</span><strong>{(rpm / 1000).toFixed(1).replace('.', ',')}</strong></div>
    <i
      role="progressbar"
      aria-label="Revoluciones por minuto"
      aria-valuemin={0}
      aria-valuemax={maximumRpm}
      aria-valuenow={Math.round(rpm)}
    ><b /><em /></i>
    <ol aria-hidden="true">{ticks.map(tick => <li key={tick}>{tick}</li>)}</ol>
  </div>;
});

export const ApexEtherSpeed = memo(({ motion, mode = 'glass' }: { motion: ApexEtherMotion; mode?: ApexEtherSurfaceMode }) => {
  return <ApexEtherSurface mode={mode} className="apex-ether-speed" ariaLabel="Conducción">
    <div className="apex-ether-speed__main"><strong>{Math.round(motion.speedKmh)}</strong><span>km/h</span></div>
    <div className="apex-ether-speed__meta"><b>{motion.gear}</b><span>Marcha</span></div>
    <ApexEtherTachometer rpm={motion.rpm} maximumRpm={motion.maximumRpm} />
    <div className="apex-ether-pedals" aria-label="Entrada de controles"><i style={{ '--apex-ether-level': motion.throttle } as CSSProperties}>Acel.</i><i style={{ '--apex-ether-level': motion.brake } as CSSProperties}>Freno</i></div>
  </ApexEtherSurface>;
});

export const ApexEtherRaceClock = memo(({ race, mode = 'glass' }: { race: ApexEtherRace; mode?: ApexEtherSurfaceMode }) => (
  <ApexEtherSurface title="Vuelta actual" mode={mode} className="apex-ether-clock">
    <strong data-semantic="highlight">{race.elapsed}</strong>
    <div><span data-semantic="info">Mejor {race.bestLap ?? '—'}</span><b data-tone={race.deltaTone ?? 'neutral'}>{race.delta ?? 'Sin referencia'}</b></div>
    <ol aria-label="Sectores">{Array.from({ length: race.sectorCount }, (_, index) => <li key={index} data-active={index === race.sector - 1 || undefined} data-complete={index < race.sector - 1 || undefined} />)}</ol>
  </ApexEtherSurface>
));

export const ApexEtherReferenceDelta = memo(({
  sector,
  deltaSeconds,
  maximumDeltaSeconds = 0.5,
  mode = 'glass',
}: {
  readonly sector: string;
  readonly deltaSeconds: number;
  readonly maximumDeltaSeconds?: number;
  readonly mode?: ApexEtherSurfaceMode;
}) => {
  const safeDelta = Number.isFinite(deltaSeconds) ? deltaSeconds : 0;
  const tone: ApexEtherTone = safeDelta < 0
    ? 'positive'
    : safeDelta > 0
      ? 'danger'
      : 'neutral';
  const magnitude = Math.min(
    1,
    Math.abs(safeDelta) / Math.max(0.001, maximumDeltaSeconds),
  );
  const deltaLabel = `${safeDelta < 0 ? '−' : safeDelta > 0 ? '+' : ''}${Math.abs(safeDelta).toFixed(3)}`;
  const comparison = safeDelta < 0
    ? 'Más rápido que tu mejor vuelta'
    : safeDelta > 0
      ? 'Más lento que tu mejor vuelta'
      : 'Igual que tu mejor vuelta';
  const style = { '--apex-ether-delta': magnitude } as CSSProperties;
  return <ApexEtherSurface
    eyebrow={sector}
    title="Diferencia de vuelta"
    mode={mode}
    className="apex-ether-reference-delta"
  >
    <div className="apex-ether-reference-delta__value" data-tone={tone}>
      <strong>{deltaLabel}</strong><span>s</span>
      <p><i aria-hidden="true" />{comparison}</p>
    </div>
    <div
      className="apex-ether-reference-delta__scale"
      data-direction={safeDelta < 0 ? 'gain' : safeDelta > 0 ? 'loss' : 'even'}
      data-tone={tone}
      style={style}
      aria-label={`${comparison}: ${deltaLabel} segundos`}
    >
      <div aria-hidden="true"><i /><b /></div>
      <ol aria-hidden="true"><li>Más rápido</li><li>Referencia</li><li>Más lento</li></ol>
    </div>
  </ApexEtherSurface>;
});

export const ApexEtherPosition = memo(({ race, mode = 'glass' }: { race: ApexEtherRace; mode?: ApexEtherSurfaceMode }) => (
  <ApexEtherSurface title="Posición" mode={mode} className="apex-ether-position">
    <strong>{race.position}</strong><span>/ {race.entrants}</span>
    <em>Vuelta {race.lap} de {race.lapCount}</em>
  </ApexEtherSurface>
));

export const ApexEtherLeaderboard = memo(({ entries, mode = 'solid' }: { entries: readonly { readonly name: string; readonly gap: string; readonly active?: boolean }[]; mode?: ApexEtherSurfaceMode }) => (
  <ApexEtherSurface title="Clasificación" eyebrow="En directo" mode={mode} className="apex-ether-leaderboard">
    <ApexEtherPanelList ordered label="Clasificación de pilotos">
      {entries.map((entry, index) => <ApexEtherPanelRow
        key={entry.name}
        leading={index + 1}
        label={entry.name}
        value={entry.gap}
        active={entry.active}
      />)}
    </ApexEtherPanelList>
  </ApexEtherSurface>
));

export const ApexEtherObjectives = memo(({ items, mode = 'glass' }: { items: readonly { readonly label: string; readonly progress?: string; readonly complete?: boolean }[]; mode?: ApexEtherSurfaceMode }) => (
  <ApexEtherSurface title="Objetivos" mode={mode} className="apex-ether-objectives">
    <ApexEtherPanelList label="Objetivos de sesión">
      {items.map(item => <ApexEtherPanelRow
        key={item.label}
        leading={<i aria-hidden="true" data-complete={item.complete || undefined} />}
        label={item.label}
        value={item.progress}
        tone={item.complete ? 'positive' : 'neutral'}
      />)}
    </ApexEtherPanelList>
  </ApexEtherSurface>
));

export const ApexEtherWheelHealth = memo(({ wheels, mode = 'solid' }: { wheels: readonly ApexEtherWheel[]; mode?: ApexEtherSurfaceMode }) => (
  <ApexEtherSurface title="Neumáticos" eyebrow="Contacto" mode={mode} className="apex-ether-wheels">
    <div>{wheels.map(wheel => <article key={wheel.id} data-tone={wheel.tone ?? 'neutral'}><b>{wheel.id}</b><strong>{Math.round(wheel.temperatureC)}°</strong><span>{wheel.pressurePsi.toFixed(1)} psi · {wheel.loadKn.toFixed(1)} kN</span><i><em style={{ width: `${wheel.gripPercent}%` }} /></i></article>)}</div>
  </ApexEtherSurface>
));

const vehicleWheelLabels: Record<ApexEtherContactWheel['id'], { readonly short: string; readonly full: string }> = {
  FL: { short: 'DI', full: 'Delantera izquierda' },
  FR: { short: 'DD', full: 'Delantera derecha' },
  RL: { short: 'TI', full: 'Trasera izquierda' },
  RR: { short: 'TD', full: 'Trasera derecha' },
};

const wheelStatusLabel = (tone: ApexEtherTone) => {
  switch (tone) {
    case 'positive': return 'Adherencia estable';
    case 'info': return 'Cerca del límite';
    case 'warning': return 'Deslizamiento';
    case 'danger': return 'Pérdida de agarre';
    default: return 'Contacto estable';
  }
};

/** Spatial, top-down vehicle contact view with slip and suspension state per wheel. */
export const ApexEtherVehicleContact = memo(({
  wheels,
  mode = 'glass',
}: {
  readonly wheels: readonly ApexEtherContactWheel[];
  readonly mode?: ApexEtherSurfaceMode;
}) => (
  <ApexEtherSurface title="Contacto y carga" eyebrow="Vista del vehículo" mode={mode} className="apex-ether-vehicle-contact">
    <div className="apex-ether-vehicle-contact__map" aria-label="Contacto, dirección y compresión de las cuatro ruedas">
      <div className="apex-ether-vehicle-contact__vehicle" aria-hidden="true">
        <i /><i /><span /><b />
      </div>
      {wheels.map(wheel => {
        const tone = wheel.tone ?? 'neutral';
        const labels = vehicleWheelLabels[wheel.id];
        const compression = Math.min(1, Math.max(0, wheel.compression ?? 0));
        const steeringAngle = wheel.steeringAngleDeg ?? 0;
        const slipPercent = wheel.slipPercent ?? Math.max(0, 100 - wheel.gripPercent);
        const wheelStyle = {
          '--apex-ether-wheel-angle': `${steeringAngle}deg`,
          '--apex-ether-compression': compression,
        } as CSSProperties;
        return <article
          key={wheel.id}
          data-wheel={wheel.id}
          data-tone={tone}
          style={wheelStyle}
          aria-label={`${labels.full}: ${wheelStatusLabel(tone)}, carga ${wheel.loadKn.toFixed(1)} kilonewtons, deslizamiento ${slipPercent.toFixed(1)} por ciento, compresión ${Math.round(compression * 100)} por ciento`}
        >
          <div className="apex-ether-vehicle-contact__hardware" aria-hidden="true">
            <div className="apex-ether-vehicle-contact__damper"><i><b /></i><span>{Math.round(compression * 100)}%</span></div>
            <i className="apex-ether-vehicle-contact__tire"><b /><b /><b /></i>
          </div>
          <div className="apex-ether-vehicle-contact__readout">
            <div><strong>{labels.short}</strong><b>{wheel.loadKn.toFixed(1)} kN</b></div>
            <span>{wheelStatusLabel(tone)}</span>
            <small>Slip {slipPercent.toFixed(1)}% · dirección {steeringAngle > 0 ? '+' : ''}{steeringAngle.toFixed(1)}°</small>
          </div>
          <i className="apex-ether-vehicle-contact__state" aria-hidden="true" />
        </article>;
      })}
    </div>
  </ApexEtherSurface>
));

export const ApexEtherRoute = memo(({ points, mode = 'glass' }: { points?: readonly ApexEtherRoutePoint[]; mode?: ApexEtherSurfaceMode }) => {
  const path = useMemo(() => points?.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ') ?? '', [points]);
  return <ApexEtherSurface title="Ruta" mode={mode} className="apex-ether-route"><svg viewBox="0 0 180 180" aria-label="Mapa de ruta"><path d={path} /><circle cx="94" cy="109" r="5" /></svg><span>Próxima curva · 240 m</span></ApexEtherSurface>;
});

export const ApexEtherInput = memo(({ motion, mode = 'solid' }: { motion: ApexEtherMotion; mode?: ApexEtherSurfaceMode }) => (
  <ApexEtherSurface title="Entrada" mode={mode} className="apex-ether-input">
    <ApexEtherMetric label="Acelerador" value={`${Math.round(motion.throttle * 100)}%`} tone="emphasis" />
    <ApexEtherMetric label="Freno" value={`${Math.round(motion.brake * 100)}%`} tone={motion.brake > .7 ? 'danger' : motion.brake > .35 ? 'warning' : 'neutral'} />
    <ApexEtherMetric label="Dirección" value={`${Math.round(motion.steering ?? 0)}°`} tone="info" />
  </ApexEtherSurface>
));

export interface ApexEtherHudProps { readonly telemetry: ApexEtherTelemetry; readonly panels: readonly ApexEtherPanelId[]; readonly mode?: ApexEtherSurfaceMode; }

/** Declarative HUD composition. Hosts can use it directly or compose its exported panels. */
export const ApexEtherHud = memo(({ telemetry, panels, mode = 'glass' }: ApexEtherHudProps) => (
  <div className="apex-ether-hud" data-mode={mode}>
    {panels.map(panel => {
      switch (panel) {
        case 'speed': return <ApexEtherSpeed key={panel} motion={telemetry.motion} mode={mode} />;
        case 'race-clock': return <ApexEtherRaceClock key={panel} race={telemetry.race} mode={mode} />;
        case 'position': return <ApexEtherPosition key={panel} race={telemetry.race} mode={mode} />;
        case 'tires': case 'vehicle-health': return <ApexEtherWheelHealth key={panel} wheels={telemetry.wheels} mode={mode} />;
        case 'route': return <ApexEtherRoute key={panel} points={telemetry.route} mode={mode} />;
        case 'input': return <ApexEtherInput key={panel} motion={telemetry.motion} mode={mode} />;
        default: return null;
      }
    })}
  </div>
));
