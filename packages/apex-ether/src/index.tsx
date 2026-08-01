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
export type ApexEtherLocale = 'es' | 'en';
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
const LocaleContext = createContext<ApexEtherLocale>('es');

export function ApexEtherLocaleProvider({
  locale,
  children,
}: PropsWithChildren<{ readonly locale: ApexEtherLocale }>) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useApexEtherLocale(): ApexEtherLocale {
  return useContext(LocaleContext);
}

export function etherText(locale: ApexEtherLocale, es: string, en: string): string {
  return locale === 'en' ? en : es;
}

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
  const locale = useApexEtherLocale();
  const scaleMaximum = Math.max(1, Math.ceil(maximumRpm / 1000));
  const normalizedRpm = Math.min(1, Math.max(0, rpm / (scaleMaximum * 1000)));
  const normalizedRedline = Math.min(1, Math.max(0, maximumRpm / (scaleMaximum * 1000)));
  const ticks = useMemo(() => Array.from({ length: scaleMaximum + 1 }, (_, index) => index), [scaleMaximum]);
  const style = {
    '--apex-ether-rpm': normalizedRpm,
    '--apex-ether-redline': normalizedRedline,
    '--apex-ether-tach-columns': ticks.length,
  } as CSSProperties;
  const rpmLabel = (rpm / 1000).toFixed(1).replace('.', locale === 'es' ? ',' : '.');
  return <div className="apex-ether-tachometer" style={style}>
    <div><span>RPM ×1000</span><strong>{rpmLabel}</strong></div>
    <i
      role="progressbar"
      aria-label={etherText(locale, 'Revoluciones por minuto', 'Revolutions per minute')}
      aria-valuemin={0}
      aria-valuemax={maximumRpm}
      aria-valuenow={Math.round(rpm)}
    ><b /><em /></i>
    <ol aria-hidden="true">{ticks.map(tick => <li key={tick}>{tick}</li>)}</ol>
  </div>;
});

export const ApexEtherSpeed = memo(({ motion, mode = 'glass' }: { motion: ApexEtherMotion; mode?: ApexEtherSurfaceMode }) => {
  const locale = useApexEtherLocale();
  return <ApexEtherSurface mode={mode} className="apex-ether-speed" ariaLabel={etherText(locale, 'Conducción', 'Driving')}>
    <div className="apex-ether-speed__main"><strong>{Math.round(motion.speedKmh)}</strong><span>km/h</span></div>
    <div className="apex-ether-speed__meta"><b>{motion.gear}</b><span>{etherText(locale, 'Marcha', 'Gear')}</span></div>
    <ApexEtherTachometer rpm={motion.rpm} maximumRpm={motion.maximumRpm} />
    <div className="apex-ether-pedals" aria-label={etherText(locale, 'Entrada de controles', 'Control input')}>
      <i style={{ '--apex-ether-level': motion.throttle } as CSSProperties}>{etherText(locale, 'Acel.', 'Throttle')}</i>
      <i style={{ '--apex-ether-level': motion.brake } as CSSProperties}>{etherText(locale, 'Freno', 'Brake')}</i>
    </div>
  </ApexEtherSurface>;
});

export const ApexEtherRaceClock = memo(({ race, mode = 'glass' }: { race: ApexEtherRace; mode?: ApexEtherSurfaceMode }) => {
  const locale = useApexEtherLocale();
  return <ApexEtherSurface title={etherText(locale, 'Vuelta actual', 'Current lap')} mode={mode} className="apex-ether-clock">
    <strong data-semantic="highlight">{race.elapsed}</strong>
    <div>
      <span data-semantic="info">{etherText(locale, 'Mejor', 'Best')} {race.bestLap ?? '—'}</span>
      <b data-tone={race.deltaTone ?? 'neutral'}>{race.delta ?? etherText(locale, 'Sin referencia', 'No reference')}</b>
    </div>
    <ol aria-label={etherText(locale, 'Sectores', 'Sectors')}>{Array.from({ length: race.sectorCount }, (_, index) => <li key={index} data-active={index === race.sector - 1 || undefined} data-complete={index < race.sector - 1 || undefined} />)}</ol>
  </ApexEtherSurface>;
});

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
  const locale = useApexEtherLocale();
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
    ? etherText(locale, 'Más rápido que tu mejor vuelta', 'Faster than your best lap')
    : safeDelta > 0
      ? etherText(locale, 'Más lento que tu mejor vuelta', 'Slower than your best lap')
      : etherText(locale, 'Igual que tu mejor vuelta', 'Matching your best lap');
  const style = { '--apex-ether-delta': magnitude } as CSSProperties;
  return <ApexEtherSurface
    eyebrow={sector}
    title={etherText(locale, 'Diferencia de vuelta', 'Lap delta')}
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
      aria-label={`${comparison}: ${deltaLabel} ${etherText(locale, 'segundos', 'seconds')}`}
    >
      <div aria-hidden="true"><i /><b /></div>
      <ol aria-hidden="true"><li>{etherText(locale, 'Más rápido', 'Faster')}</li><li>{etherText(locale, 'Referencia', 'Reference')}</li><li>{etherText(locale, 'Más lento', 'Slower')}</li></ol>
    </div>
  </ApexEtherSurface>;
});

export const ApexEtherPosition = memo(({ race, mode = 'glass' }: { race: ApexEtherRace; mode?: ApexEtherSurfaceMode }) => {
  const locale = useApexEtherLocale();
  return <ApexEtherSurface title={etherText(locale, 'Posición', 'Position')} mode={mode} className="apex-ether-position">
    <strong>{race.position}</strong><span>/ {race.entrants}</span>
    <em>{etherText(locale, 'Vuelta', 'Lap')} {race.lap} {etherText(locale, 'de', 'of')} {race.lapCount}</em>
  </ApexEtherSurface>;
});

export const ApexEtherLeaderboard = memo(({ entries, mode = 'solid' }: { entries: readonly { readonly name: string; readonly gap: string; readonly active?: boolean }[]; mode?: ApexEtherSurfaceMode }) => {
  const locale = useApexEtherLocale();
  return <ApexEtherSurface title={etherText(locale, 'Clasificación', 'Standings')} eyebrow={etherText(locale, 'En directo', 'Live')} mode={mode} className="apex-ether-leaderboard">
    <ApexEtherPanelList ordered label={etherText(locale, 'Clasificación de pilotos', 'Driver standings')}>
      {entries.map((entry, index) => <ApexEtherPanelRow
        key={entry.name}
        leading={index + 1}
        label={entry.name}
        value={entry.gap}
        active={entry.active}
      />)}
    </ApexEtherPanelList>
  </ApexEtherSurface>;
});

export const ApexEtherObjectives = memo(({ items, mode = 'glass' }: { items: readonly { readonly label: string; readonly progress?: string; readonly complete?: boolean }[]; mode?: ApexEtherSurfaceMode }) => {
  const locale = useApexEtherLocale();
  return <ApexEtherSurface title={etherText(locale, 'Objetivos', 'Objectives')} mode={mode} className="apex-ether-objectives">
    <ApexEtherPanelList label={etherText(locale, 'Objetivos de sesión', 'Session objectives')}>
      {items.map(item => <ApexEtherPanelRow
        key={item.label}
        leading={<i aria-hidden="true" data-complete={item.complete || undefined} />}
        label={item.label}
        value={item.progress}
        tone={item.complete ? 'positive' : 'neutral'}
      />)}
    </ApexEtherPanelList>
  </ApexEtherSurface>;
});

export const ApexEtherWheelHealth = memo(({ wheels, mode = 'solid' }: { wheels: readonly ApexEtherWheel[]; mode?: ApexEtherSurfaceMode }) => {
  const locale = useApexEtherLocale();
  return <ApexEtherSurface title={etherText(locale, 'Neumáticos', 'Tires')} eyebrow={etherText(locale, 'Contacto', 'Contact')} mode={mode} className="apex-ether-wheels">
    <div>{wheels.map(wheel => <article key={wheel.id} data-tone={wheel.tone ?? 'neutral'}><b>{wheel.id}</b><strong>{Math.round(wheel.temperatureC)}°</strong><span>{wheel.pressurePsi.toFixed(1).replace('.', locale === 'es' ? ',' : '.')} psi · {wheel.loadKn.toFixed(1).replace('.', locale === 'es' ? ',' : '.')} kN</span><i><em style={{ width: `${wheel.gripPercent}%` }} /></i></article>)}</div>
  </ApexEtherSurface>;
});

const vehicleWheelLabels = (locale: ApexEtherLocale): Record<ApexEtherContactWheel['id'], { readonly short: string; readonly full: string }> => ({
  FL: { short: locale === 'es' ? 'DI' : 'FL', full: etherText(locale, 'Delantera izquierda', 'Front left') },
  FR: { short: locale === 'es' ? 'DD' : 'FR', full: etherText(locale, 'Delantera derecha', 'Front right') },
  RL: { short: locale === 'es' ? 'TI' : 'RL', full: etherText(locale, 'Trasera izquierda', 'Rear left') },
  RR: { short: locale === 'es' ? 'TD' : 'RR', full: etherText(locale, 'Trasera derecha', 'Rear right') },
});

const wheelStatusLabel = (tone: ApexEtherTone, locale: ApexEtherLocale) => {
  switch (tone) {
    case 'positive': return etherText(locale, 'Adherencia estable', 'Stable grip');
    case 'info': return etherText(locale, 'Cerca del límite', 'Near the limit');
    case 'warning': return etherText(locale, 'Deslizamiento', 'Sliding');
    case 'danger': return etherText(locale, 'Pérdida de agarre', 'Loss of grip');
    default: return etherText(locale, 'Contacto estable', 'Stable contact');
  }
};

/** Spatial, top-down vehicle contact view with slip and suspension state per wheel. */
export const ApexEtherVehicleContact = memo(({
  wheels,
  mode = 'glass',
}: {
  readonly wheels: readonly ApexEtherContactWheel[];
  readonly mode?: ApexEtherSurfaceMode;
}) => {
  const locale = useApexEtherLocale();
  const labelsByWheel = vehicleWheelLabels(locale);
  return <ApexEtherSurface title={etherText(locale, 'Contacto y carga', 'Contact and load')} eyebrow={etherText(locale, 'Vista del vehículo', 'Vehicle view')} mode={mode} className="apex-ether-vehicle-contact">
    <div className="apex-ether-vehicle-contact__map" aria-label={etherText(locale, 'Contacto, dirección y compresión de las cuatro ruedas', 'Contact, steering and compression for all four wheels')}>
      <div className="apex-ether-vehicle-contact__vehicle" aria-hidden="true">
        <i /><i /><span /><b />
      </div>
      {wheels.map(wheel => {
        const tone = wheel.tone ?? 'neutral';
        const labels = labelsByWheel[wheel.id];
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
          aria-label={`${labels.full}: ${wheelStatusLabel(tone, locale)}, ${etherText(locale, 'carga', 'load')} ${wheel.loadKn.toFixed(1)} kilonewtons, ${etherText(locale, 'deslizamiento', 'slip')} ${slipPercent.toFixed(1)} ${etherText(locale, 'por ciento', 'percent')}, ${etherText(locale, 'compresión', 'compression')} ${Math.round(compression * 100)} ${etherText(locale, 'por ciento', 'percent')}`}
        >
          <div className="apex-ether-vehicle-contact__hardware" aria-hidden="true">
            <div className="apex-ether-vehicle-contact__damper"><i><b /></i><span>{Math.round(compression * 100)}%</span></div>
            <i className="apex-ether-vehicle-contact__tire"><b /><b /><b /></i>
          </div>
          <div className="apex-ether-vehicle-contact__readout">
            <div><strong>{labels.short}</strong><b>{wheel.loadKn.toFixed(1)} kN</b></div>
            <span>{wheelStatusLabel(tone, locale)}</span>
            <small>{etherText(locale, 'Deslizamiento', 'Slip')} {slipPercent.toFixed(1)}% · {etherText(locale, 'dirección', 'steering')} {steeringAngle > 0 ? '+' : ''}{steeringAngle.toFixed(1)}°</small>
          </div>
          <i className="apex-ether-vehicle-contact__state" aria-hidden="true" />
        </article>;
      })}
    </div>
  </ApexEtherSurface>;
});

export const ApexEtherRoute = memo(({ points, mode = 'glass' }: { points?: readonly ApexEtherRoutePoint[]; mode?: ApexEtherSurfaceMode }) => {
  const locale = useApexEtherLocale();
  const path = useMemo(() => points?.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ') ?? '', [points]);
  return <ApexEtherSurface title={etherText(locale, 'Ruta', 'Route')} mode={mode} className="apex-ether-route"><svg viewBox="0 0 180 180" aria-label={etherText(locale, 'Mapa de ruta', 'Route map')}><path d={path} /><circle cx="94" cy="109" r="5" /></svg><span>{etherText(locale, 'Próxima curva', 'Next turn')} · 240 m</span></ApexEtherSurface>;
});

export const ApexEtherInput = memo(({ motion, mode = 'solid' }: { motion: ApexEtherMotion; mode?: ApexEtherSurfaceMode }) => {
  const locale = useApexEtherLocale();
  return <ApexEtherSurface title={etherText(locale, 'Entrada', 'Input')} mode={mode} className="apex-ether-input">
    <ApexEtherMetric label={etherText(locale, 'Acelerador', 'Throttle')} value={`${Math.round(motion.throttle * 100)}%`} tone="emphasis" />
    <ApexEtherMetric label={etherText(locale, 'Freno', 'Brake')} value={`${Math.round(motion.brake * 100)}%`} tone={motion.brake > .7 ? 'danger' : motion.brake > .35 ? 'warning' : 'neutral'} />
    <ApexEtherMetric label={etherText(locale, 'Dirección', 'Steering')} value={`${Math.round(motion.steering ?? 0)}°`} tone="info" />
  </ApexEtherSurface>;
});

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
