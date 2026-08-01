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

export interface ApexEtherWheel {
  readonly id: 'FL' | 'FR' | 'RL' | 'RR';
  readonly temperatureC: number;
  readonly pressurePsi: number;
  readonly loadKn: number;
  readonly gripPercent: number;
  readonly tone?: ApexEtherTone;
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
  title, eyebrow, mode = 'glass', tone = 'neutral', className = '', children,
}: ApexEtherSurfaceProps) => (
  <section className={`apex-ether-panel apex-ether-surface apex-ether-panel--${mode} apex-ether-surface--${mode} apex-ether-panel--${tone} apex-ether-surface--${tone} ${className}`.trim()}>
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

export const ApexEtherSpeed = memo(({ motion, mode = 'glass' }: { motion: ApexEtherMotion; mode?: ApexEtherSurfaceMode }) => {
  const rpm = Math.min(1, Math.max(0, motion.rpm / Math.max(1, motion.maximumRpm)));
  return <ApexEtherSurface title="Conducción" mode={mode} className="apex-ether-speed">
    <div className="apex-ether-speed__main"><strong>{Math.round(motion.speedKmh)}</strong><span>km/h</span></div>
    <div className="apex-ether-speed__meta"><b>{motion.gear}</b><span>Marcha</span><i style={{ '--apex-ether-rpm': rpm } as CSSProperties} /></div>
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
