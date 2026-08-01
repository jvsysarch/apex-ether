import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ApexEtherInput,
  ApexEtherLocaleProvider,
  ApexEtherLeaderboard,
  ApexEtherMetric,
  ApexEtherObjectives,
  ApexEtherPosition,
  ApexEtherRaceClock,
  ApexEtherReferenceDelta,
  ApexEtherRoute,
  ApexEtherSpeed,
  ApexEtherSurface,
  ApexEtherWheelHealth,
  type ApexEtherLocale,
  type ApexEtherSurfaceMode,
  type ApexEtherTelemetry,
} from '@jvsysarch/apex-ether';
import '@jvsysarch/apex-ether/styles.css';
import { ExpandedCatalog } from './expanded-catalog';
import { StudioLocaleProvider, useStudioText } from './i18n';
import mountainBackground from './assets/ether-mountain-route-v1.png';
import nightBackground from './assets/ether-riverside-night-v1.png';
import './catalog.css';
import './expanded-catalog.css';

const catalogBackgrounds = Object.freeze({
  mountain: mountainBackground,
  night: nightBackground,
});

const fontOptions = Object.freeze([
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Source Sans 3',
  'IBM Plex Sans',
  'Manrope',
  'Noto Sans',
  'Work Sans',
  'Figtree',
  'Public Sans',
  'DM Sans',
  'Plus Jakarta Sans',
  'Atkinson Hyperlegible',
  'Lexend',
  'Nunito Sans',
  'Barlow',
  'Archivo',
  'Rubik',
  'Space Grotesk',
]);

const fontWeights = Object.freeze([400, 500, 600, 700, 800]);
const figureFontOptions = Object.freeze(['Manrope', 'Plus Jakarta Sans']);
type TypographyLevel = 'title' | 'hero' | 'speed' | 'figures' | 'subtitle' | 'small';
interface TypographyValue {
  readonly family: string;
  readonly weight: number;
  readonly size: number;
  readonly lineHeight: number;
  readonly letterSpacing: number;
  readonly marginBefore: number;
  readonly marginAfter: number;
}
type TypographySettings = Readonly<Record<TypographyLevel, TypographyValue>>;

type PaletteRole = 'highlight' | 'positive' | 'info' | 'warning' | 'danger' | 'neutral';
type PaletteSettings = Readonly<Record<PaletteRole, string>>;

interface BoxShadowValue {
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly spread: number;
  readonly opacity: number;
}

interface TextShadowValue {
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly opacity: number;
}

interface ShadowSettings {
  readonly solid: BoxShadowValue;
  readonly glass: BoxShadowValue;
  readonly text: TextShadowValue;
}

interface GlassSettings {
  readonly colorStart: string;
  readonly opacityStart: number;
  readonly colorEnd: string;
  readonly opacityEnd: number;
  readonly gradientAngle: number;
  readonly backdropBlur: number;
  readonly borderColor: string;
  readonly borderOpacity: number;
  readonly borderWidth: number;
  readonly textStrokeColor: string;
  readonly textStrokeOpacity: number;
  readonly textStrokeWidth: number;
}

const defaultShadows: ShadowSettings = Object.freeze({
  solid: Object.freeze({ x: 0, y: 18, blur: 44, spread: 0, opacity: 16 }),
  glass: Object.freeze({ x: 8, y: 13, blur: 24, spread: -7, opacity: 23 }),
  text: Object.freeze({ x: 0, y: 1, blur: 14, opacity: 20 }),
});

const defaultGlass: GlassSettings = Object.freeze({
  colorStart: '#ffffff',
  opacityStart: 13,
  colorEnd: '#000000',
  opacityEnd: 23,
  gradientAngle: 167,
  backdropBlur: 3,
  borderColor: '#ffffff',
  borderOpacity: 18,
  borderWidth: 2,
  textStrokeColor: '#000000',
  textStrokeOpacity: 28,
  textStrokeWidth: 0.35,
});

const defaultPalette: PaletteSettings = Object.freeze({
  highlight: '#ff941a',
  positive: '#31a300',
  info: '#0778cf',
  warning: '#ffc800',
  danger: '#ff0033',
  neutral: '#707070',
});

const paletteLabels = {
  highlight: [['Highlight', 'Highlight'], ['Selección, foco y dato actual', 'Selection, focus and current data']],
  positive: [['Positivo', 'Positive'], ['Mejora, listo y completado', 'Improvement, ready and complete']],
  info: [['Información', 'Information'], ['Contexto, navegación y ayuda', 'Context, navigation and help']],
  warning: [['Warning', 'Warning'], ['Atención y límite próximo', 'Attention and approaching limit']],
  danger: [['Peligro', 'Danger'], ['Falla, crítico y acción inmediata', 'Failure, critical state and immediate action']],
  neutral: [['Neutral', 'Neutral'], ['Datos secundarios e inactivos', 'Secondary and inactive data']],
} as const satisfies Readonly<Record<PaletteRole, readonly [readonly [string, string], readonly [string, string]]>>;

const fontSizeRanges: Readonly<Record<TypographyLevel, { readonly min: number; readonly max: number }>> = Object.freeze({
  title: Object.freeze({ min: 12, max: 72 }),
  hero: Object.freeze({ min: 18, max: 120 }),
  speed: Object.freeze({ min: 48, max: 240 }),
  figures: Object.freeze({ min: 20, max: 160 }),
  subtitle: Object.freeze({ min: 12, max: 64 }),
  small: Object.freeze({ min: 10, max: 40 }),
});

const defaultTypography: TypographySettings = Object.freeze({
  title: Object.freeze({ family: 'Manrope', weight: 600, size: 23, lineHeight: 1.08, letterSpacing: -0.005, marginBefore: 0, marginAfter: 0 }),
  hero: Object.freeze({ family: 'Space Grotesk', weight: 500, size: 41, lineHeight: 0.92, letterSpacing: -0.065, marginBefore: 0, marginAfter: 0 }),
  speed: Object.freeze({ family: 'Manrope', weight: 500, size: 48, lineHeight: 0.82, letterSpacing: -0.045, marginBefore: 0, marginAfter: 0 }),
  figures: Object.freeze({ family: 'Manrope', weight: 500, size: 24, lineHeight: 0.87, letterSpacing: -0.065, marginBefore: 0, marginAfter: 0 }),
  subtitle: Object.freeze({ family: 'Nunito Sans', weight: 400, size: 16, lineHeight: 1.3, letterSpacing: 0.02, marginBefore: 0, marginAfter: 0 }),
  small: Object.freeze({ family: 'Inter', weight: 400, size: 12, lineHeight: 1.25, letterSpacing: 0.065, marginBefore: 0, marginAfter: 0 }),
});

const typographyLabels: Readonly<Record<TypographyLevel, readonly [string, string]>> = Object.freeze({
  title: ['Títulos', 'Titles'],
  hero: ['Panel hero', 'Hero panel'],
  speed: ['Velocímetro', 'Speedometer'],
  figures: ['Cifras y telemetría', 'Figures and telemetry'],
  subtitle: ['Subtítulos y filas', 'Subtitles and rows'],
  small: ['Etiquetas y unidades', 'Labels and units'],
});

function TypographyPreview({
  level,
  value,
}: {
  readonly level: TypographyLevel;
  readonly value: TypographyValue;
}) {
  const t = useStudioText();
  const selectedStyle = {
    fontFamily: `"${value.family}", "Inter"`,
    fontSize: `${value.size}px`,
    fontWeight: value.weight,
    lineHeight: value.lineHeight,
    letterSpacing: `${value.letterSpacing}em`,
    marginBlockStart: `${value.marginBefore}px`,
    marginBlockEnd: `${value.marginAfter}px`,
  } as CSSProperties;
  const samples: Readonly<Record<TypographyLevel, ReactNode>> = {
    title: <><span>{t('DIAGNÓSTICO', 'DIAGNOSTICS')}</span><strong style={selectedStyle}>{t('Estado del vehículo', 'Vehicle status')}</strong></>,
    hero: <><span>{t('VEHÍCULO', 'VEHICLE')}</span><strong style={selectedStyle}>Apex GT</strong><small>{t('Tracción trasera · Sport+', 'Rear-wheel drive · Sport+')}</small></>,
    speed: <><span>{t('VELOCIDAD', 'SPEED')}</span><div><strong style={selectedStyle}>278</strong><small>km/h</small></div></>,
    figures: <><span>{t('RÉGIMEN', 'ENGINE SPEED')}</span><div><strong style={selectedStyle}>{t('6,8', '6.8')}</strong><small>RPM ×1000</small></div></>,
    subtitle: <><span>{t('CONFIGURACIÓN ACTIVA', 'ACTIVE SETUP')}</span><strong style={selectedStyle}>{t('Tracción trasera · Sport+', 'Rear-wheel drive · Sport+')}</strong></>,
    small: <><span style={selectedStyle}>{t('TEMPERATURA', 'TEMPERATURE')}</span><div><strong>85</strong><small style={selectedStyle}>°C</small></div></>,
  };
  return <div className="typography-lab__preview" data-level={level}>{samples[level]}</div>;
}

function LabNumberInput({
  value,
  min,
  max,
  step,
  onChange,
}: {
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return undefined;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      input.focus({ preventScroll: true });
      const current = Number(input.value);
      const direction = event.deltaY < 0 ? 1 : -1;
      const decimalPlaces = step.toString().split('.')[1]?.length ?? 0;
      const next = Math.min(max, Math.max(min, Number((current + direction * step).toFixed(decimalPlaces))));
      if (next !== current) onChange(next);
    };
    input.addEventListener('wheel', handleWheel, { passive: false });
    return () => input.removeEventListener('wheel', handleWheel);
  }, [max, min, onChange, step]);
  return <input
    ref={inputRef}
    type="number"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={event => onChange(Number(event.target.value))}
  />;
}

function TypographyLab({
  value,
  onChange,
}: {
  readonly value: TypographySettings;
  readonly onChange: (value: TypographySettings) => void;
}) {
  const t = useStudioText();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [isOpen, setIsOpen] = useState(
    () => new URLSearchParams(window.location.search).get('section') === 'typography',
  );
  const [selectedLevel, setSelectedLevel] = useState<TypographyLevel>('speed');
  const update = (
    level: TypographyLevel,
    patch: Partial<TypographyValue>,
  ) => onChange(Object.freeze({
    ...value,
    [level]: Object.freeze({ ...value[level], ...patch }),
  }));
  const copySettings = async () => {
    const css = [
      ':root {',
      `  --ether-font-title: "${value.title.family}", sans-serif;`,
      `  --ether-weight-title: ${value.title.weight};`,
      `  --ether-size-title: ${value.title.size}px;`,
      `  --ether-line-height-title: ${value.title.lineHeight};`,
      `  --ether-letter-spacing-title: ${value.title.letterSpacing}em;`,
      `  --ether-margin-before-title: ${value.title.marginBefore}px;`,
      `  --ether-margin-after-title: ${value.title.marginAfter}px;`,
      `  --ether-font-hero: "${value.hero.family}", sans-serif;`,
      `  --ether-weight-hero: ${value.hero.weight};`,
      `  --ether-size-hero: ${value.hero.size}px;`,
      `  --ether-line-height-hero: ${value.hero.lineHeight};`,
      `  --ether-letter-spacing-hero: ${value.hero.letterSpacing}em;`,
      `  --ether-margin-before-hero: ${value.hero.marginBefore}px;`,
      `  --ether-margin-after-hero: ${value.hero.marginAfter}px;`,
      `  --ether-font-speed: "${value.speed.family}", sans-serif;`,
      `  --ether-weight-speed: ${value.speed.weight};`,
      `  --ether-size-speed: ${value.speed.size}px;`,
      `  --ether-line-height-speed: ${value.speed.lineHeight};`,
      `  --ether-letter-spacing-speed: ${value.speed.letterSpacing}em;`,
      `  --ether-margin-before-speed: ${value.speed.marginBefore}px;`,
      `  --ether-margin-after-speed: ${value.speed.marginAfter}px;`,
      `  --ether-font-figures: "${value.figures.family}", sans-serif;`,
      `  --ether-weight-figures: ${value.figures.weight};`,
      `  --ether-size-figures: ${value.figures.size}px;`,
      `  --ether-line-height-figures: ${value.figures.lineHeight};`,
      `  --ether-letter-spacing-figures: ${value.figures.letterSpacing}em;`,
      `  --ether-margin-before-figures: ${value.figures.marginBefore}px;`,
      `  --ether-margin-after-figures: ${value.figures.marginAfter}px;`,
      `  --ether-font-subtitle: "${value.subtitle.family}", sans-serif;`,
      `  --ether-weight-subtitle: ${value.subtitle.weight};`,
      `  --ether-size-subtitle: ${value.subtitle.size}px;`,
      `  --ether-line-height-subtitle: ${value.subtitle.lineHeight};`,
      `  --ether-letter-spacing-subtitle: ${value.subtitle.letterSpacing}em;`,
      `  --ether-margin-before-subtitle: ${value.subtitle.marginBefore}px;`,
      `  --ether-margin-after-subtitle: ${value.subtitle.marginAfter}px;`,
      `  --ether-font-small: "${value.small.family}", sans-serif;`,
      `  --ether-weight-small: ${value.small.weight};`,
      `  --ether-size-small: ${value.small.size}px;`,
      `  --ether-line-height-small: ${value.small.lineHeight};`,
      `  --ether-letter-spacing-small: ${value.small.letterSpacing}em;`,
      `  --ether-margin-before-small: ${value.small.marginBefore}px;`,
      `  --ether-margin-after-small: ${value.small.marginAfter}px;`,
      '}',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(css);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
    }
  };
  return <details className="typography-lab" open={isOpen} onToggle={event => setIsOpen(event.currentTarget.open)}>
    <summary><span>{t('Tipografía', 'Typography')}</span><b>{t('Seis niveles · forma, escala y ritmo', 'Six levels · form, scale and rhythm')}</b></summary>
    <div className="typography-lab__content">
      <header>
        <div><span>APEX ETHER</span><strong>{t('Jerarquía de lectura', 'Reading hierarchy')}</strong></div>
        <p>{t('Vista previa 1:1 en píxeles CSS lógicos. Cada valor puede escribirse directamente.', '1:1 preview in logical CSS pixels. Every value can be entered directly.')}</p>
        <button type="button" onClick={() => void copySettings()}>
          {copyState === 'copied'
            ? t('Configuración copiada', 'Configuration copied')
            : copyState === 'error'
              ? t('No se pudo copiar', 'Could not copy')
              : t('Copiar configuración', 'Copy configuration')}
        </button>
        <output aria-live="polite">
          {copyState === 'copied' ? t('Los tokens CSS están en el portapapeles.', 'CSS tokens are in the clipboard.') : ''}
        </output>
      </header>
      <div className="typography-lab__controls">
        <nav className="typography-lab__level-tabs" aria-label={t('Nivel tipográfico', 'Typography level')}>
          {(Object.keys(typographyLabels) as TypographyLevel[]).map(level => (
            <button key={level} type="button" aria-pressed={selectedLevel === level} onClick={() => setSelectedLevel(level)}>
              {t(...typographyLabels[level])}
            </button>
          ))}
        </nav>
        <fieldset>
            <legend>{t(...typographyLabels[selectedLevel])}</legend>
            <label>
              <span>{t('Familia', 'Family')}</span>
              <select
                value={value[selectedLevel].family}
                onChange={event => update(selectedLevel, { family: event.target.value })}
              >
                {(selectedLevel === 'figures' || selectedLevel === 'speed' ? figureFontOptions : fontOptions).map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('Peso', 'Weight')}</span>
              <select
                value={value[selectedLevel].weight}
                onChange={event => update(selectedLevel, { weight: Number(event.target.value) })}
              >
                {fontWeights.map(weight => <option key={weight} value={weight}>{weight}</option>)}
              </select>
            </label>
            <label>
              <span>{t('Tamaño · px', 'Size · px')}</span>
              <LabNumberInput
                min={fontSizeRanges[selectedLevel].min}
                max={fontSizeRanges[selectedLevel].max}
                step={1}
                value={value[selectedLevel].size}
                onChange={size => update(selectedLevel, { size })}
              />
            </label>
            <label>
              <span>{t('Interlineado', 'Line height')}</span>
              <LabNumberInput
                min={0.75}
                max={2}
                step={0.01}
                value={value[selectedLevel].lineHeight}
                onChange={lineHeight => update(selectedLevel, { lineHeight })}
              />
            </label>
            <label>
              <span>Tracking · em</span>
              <LabNumberInput
                min={-0.12}
                max={0.2}
                step={0.005}
                value={value[selectedLevel].letterSpacing}
                onChange={letterSpacing => update(selectedLevel, { letterSpacing })}
              />
            </label>
            <label>
              <span>{t('Margen superior · px', 'Top margin · px')}</span>
              <LabNumberInput
                min={0}
                max={48}
                step={1}
                value={value[selectedLevel].marginBefore}
                onChange={marginBefore => update(selectedLevel, { marginBefore })}
              />
            </label>
            <label>
              <span>{t('Margen inferior · px', 'Bottom margin · px')}</span>
              <LabNumberInput
                min={0}
                max={48}
                step={1}
                value={value[selectedLevel].marginAfter}
                onChange={marginAfter => update(selectedLevel, { marginAfter })}
              />
            </label>
            <TypographyPreview level={selectedLevel} value={value[selectedLevel]} />
          </fieldset>
      </div>
    </div>
  </details>;
}

function ShadowRange({
  label,
  value,
  min,
  max,
  unit = 'px',
  step = 1,
  onChange,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly unit?: 'px' | '%' | '°';
  readonly step?: number;
  readonly onChange: (value: number) => void;
}) {
  return <label className="shadow-lab__range">
    <span>{label}<b>{value}{unit}</b></span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={event => onChange(Number(event.target.value))}
    />
  </label>;
}

function ShadowLab({
  value,
  onChange,
}: {
  readonly value: ShadowSettings;
  readonly onChange: (value: ShadowSettings) => void;
}) {
  const t = useStudioText();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const updateBox = (
    kind: 'solid' | 'glass',
    patch: Partial<BoxShadowValue>,
  ) => onChange(Object.freeze({
    ...value,
    [kind]: Object.freeze({ ...value[kind], ...patch }),
  }));
  const updateText = (patch: Partial<TextShadowValue>) => onChange(Object.freeze({
    ...value,
    text: Object.freeze({ ...value.text, ...patch }),
  }));
  const shadowCss = (shadow: BoxShadowValue) => (
    `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgb(0 0 0 / ${shadow.opacity}%)`
  );
  const copySettings = async () => {
    const css = [
      ':root {',
      `  --ether-shadow: ${shadowCss(value.solid)};`,
      `  --ether-glass-shadow: ${shadowCss(value.glass)};`,
      `  --ether-glass-text-shadow: ${value.text.x}px ${value.text.y}px ${value.text.blur}px rgb(0 0 0 / ${value.text.opacity}%);`,
      '}',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(css);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
    }
  };
  const boxControls = (kind: 'solid' | 'glass') => <>
    <ShadowRange label="X" value={value[kind].x} min={-24} max={24} onChange={x => updateBox(kind, { x })} />
    <ShadowRange label="Y" value={value[kind].y} min={-12} max={60} onChange={y => updateBox(kind, { y })} />
    <ShadowRange label="Blur" value={value[kind].blur} min={0} max={100} onChange={blur => updateBox(kind, { blur })} />
    <ShadowRange label={t('Expansión', 'Spread')} value={value[kind].spread} min={-24} max={40} onChange={spread => updateBox(kind, { spread })} />
    <ShadowRange label={t('Opacidad', 'Opacity')} value={value[kind].opacity} min={0} max={60} unit="%" onChange={opacity => updateBox(kind, { opacity })} />
  </>;
  return <details className="shadow-lab">
    <summary><span>{t('Sombras', 'Shadows')}</span><b>{t('Negro · configuración detallada', 'Black · detailed configuration')}</b></summary>
    <div className="shadow-lab__content">
      <fieldset><legend>{t('Panel sólido', 'Solid panel')}</legend>{boxControls('solid')}</fieldset>
      <fieldset><legend>Panel Glass</legend>{boxControls('glass')}</fieldset>
      <fieldset><legend>{t('Texto sobre Glass', 'Text over Glass')}</legend>
        <ShadowRange label="X" value={value.text.x} min={-8} max={8} onChange={x => updateText({ x })} />
        <ShadowRange label="Y" value={value.text.y} min={-8} max={12} onChange={y => updateText({ y })} />
        <ShadowRange label="Blur" value={value.text.blur} min={0} max={24} onChange={blur => updateText({ blur })} />
        <ShadowRange label={t('Opacidad', 'Opacity')} value={value.text.opacity} min={0} max={100} unit="%" onChange={opacity => updateText({ opacity })} />
      </fieldset>
      <div className="shadow-lab__actions">
        <button type="button" onClick={() => onChange(defaultShadows)}>{t('Restablecer', 'Reset')}</button>
        <button type="button" onClick={() => void copySettings()}>{copyState === 'copied' ? t('Sombras copiadas', 'Shadows copied') : copyState === 'error' ? t('No se pudo copiar', 'Could not copy') : t('Copiar sombras', 'Copy shadows')}</button>
      </div>
    </div>
  </details>;
}

const colorWithOpacity = (color: string, opacity: number): string => {
  const normalized = color.replace('#', '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgb(${red} ${green} ${blue} / ${opacity}%)`;
};

const glassGradientValue = (value: GlassSettings): string => (
  `linear-gradient(${value.gradientAngle}deg, ${colorWithOpacity(value.colorStart, value.opacityStart)}, ${colorWithOpacity(value.colorEnd, value.opacityEnd)})`
);

function GlassColorControl({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return <label className="glass-lab__color">
    <span>{label}</span>
    <input type="color" value={value} onChange={event => onChange(event.target.value)} />
    <b>{value}</b>
  </label>;
}

function GlassLab({
  value,
  onChange,
}: {
  readonly value: GlassSettings;
  readonly onChange: (value: GlassSettings) => void;
}) {
  const t = useStudioText();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const copySettings = async () => {
    const css = [
      ':root {',
      `  --ether-glass-fill-start: ${colorWithOpacity(value.colorStart, value.opacityStart)};`,
      `  --ether-glass-fill-end: ${colorWithOpacity(value.colorEnd, value.opacityEnd)};`,
      `  --ether-glass-gradient-angle: ${value.gradientAngle}deg;`,
      '  --ether-glass-fill: linear-gradient(var(--ether-glass-gradient-angle), var(--ether-glass-fill-start), var(--ether-glass-fill-end));',
      `  --ether-glass-backdrop-blur: ${value.backdropBlur}px;`,
      `  --ether-glass-border: ${colorWithOpacity(value.borderColor, value.borderOpacity)};`,
      `  --ether-glass-border-width: ${value.borderWidth}px;`,
      `  --ether-glass-text-stroke-color: ${colorWithOpacity(value.textStrokeColor, value.textStrokeOpacity)};`,
      `  --ether-glass-text-stroke-width: ${value.textStrokeWidth}px;`,
      '}',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(css);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
    }
  };
  return <details className="glass-lab">
    <summary><span>{t('Superficie Glass', 'Glass surface')}</span><b>{t('Gradiente', 'Gradient')} {value.opacityStart}% → {value.opacityEnd}% · blur {value.backdropBlur}px · {t('borde', 'border')} {value.borderWidth}px · {t('texto', 'text')} {value.textStrokeWidth}px</b></summary>
    <div className="glass-lab__content">
      <fieldset>
        <legend>{t('Fondo degradado', 'Gradient background')}</legend>
        <GlassColorControl label={t('Color inicial', 'Start color')} value={value.colorStart} onChange={colorStart => onChange(Object.freeze({ ...value, colorStart }))} />
        <ShadowRange label={t('Opacidad inicial', 'Start opacity')} value={value.opacityStart} min={0} max={100} unit="%" onChange={opacityStart => onChange(Object.freeze({ ...value, opacityStart }))} />
        <GlassColorControl label={t('Color final', 'End color')} value={value.colorEnd} onChange={colorEnd => onChange(Object.freeze({ ...value, colorEnd }))} />
        <ShadowRange label={t('Opacidad final', 'End opacity')} value={value.opacityEnd} min={0} max={100} unit="%" onChange={opacityEnd => onChange(Object.freeze({ ...value, opacityEnd }))} />
        <ShadowRange label={t('Ángulo', 'Angle')} value={value.gradientAngle} min={0} max={360} unit="°" onChange={gradientAngle => onChange(Object.freeze({ ...value, gradientAngle }))} />
        <ShadowRange label={t('Blur del fondo', 'Background blur')} value={value.backdropBlur} min={0} max={16} onChange={backdropBlur => onChange(Object.freeze({ ...value, backdropBlur }))} />
      </fieldset>
      <fieldset>
        <legend>{t('Bordes de panel y tipografía', 'Panel and typography borders')}</legend>
        <GlassColorControl label={t('Panel · color', 'Panel · color')} value={value.borderColor} onChange={borderColor => onChange(Object.freeze({ ...value, borderColor }))} />
        <ShadowRange label={t('Panel · opacidad', 'Panel · opacity')} value={value.borderOpacity} min={0} max={100} unit="%" onChange={borderOpacity => onChange(Object.freeze({ ...value, borderOpacity }))} />
        <ShadowRange label={t('Panel · grosor', 'Panel · width')} value={value.borderWidth} min={0} max={6} step={0.25} onChange={borderWidth => onChange(Object.freeze({ ...value, borderWidth }))} />
        <GlassColorControl label={t('Texto · color', 'Text · color')} value={value.textStrokeColor} onChange={textStrokeColor => onChange(Object.freeze({ ...value, textStrokeColor }))} />
        <ShadowRange label={t('Texto · opacidad', 'Text · opacity')} value={value.textStrokeOpacity} min={0} max={100} unit="%" onChange={textStrokeOpacity => onChange(Object.freeze({ ...value, textStrokeOpacity }))} />
        <ShadowRange label={t('Texto · grosor', 'Text · width')} value={value.textStrokeWidth} min={0} max={2} step={0.05} onChange={textStrokeWidth => onChange(Object.freeze({ ...value, textStrokeWidth }))} />
      </fieldset>
      <div
        className="glass-lab__sample"
        style={{
          background: glassGradientValue(value),
          borderColor: colorWithOpacity(value.borderColor, value.borderOpacity),
          borderWidth: value.borderWidth,
          backdropFilter: `blur(${value.backdropBlur}px)`,
          WebkitTextStroke: `${value.textStrokeWidth}px ${colorWithOpacity(value.textStrokeColor, value.textStrokeOpacity)}`,
        }}
        aria-label={t('Muestra del relleno Glass', 'Glass fill sample')}
      ><span>Aa</span><b>278</b></div>
      <div className="glass-lab__actions">
        <button type="button" onClick={() => onChange(defaultGlass)}>{t('Restablecer', 'Reset')}</button>
        <button type="button" onClick={() => void copySettings()}>{copyState === 'copied' ? t('Token copiado', 'Token copied') : copyState === 'error' ? t('No se pudo copiar', 'Could not copy') : t('Copiar token', 'Copy token')}</button>
      </div>
    </div>
  </details>;
}

const relativeLuminance = (hex: string): number => {
  const normalized = hex.replace('#', '');
  const channels = [0, 2, 4].map(offset => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map(channel => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
};

const contrastAgainstWhite = (hex: string): number => 1.05 / (relativeLuminance(hex) + 0.05);
const readableTextColor = (hex: string): string => contrastAgainstWhite(hex) >= 4.5 ? '#ffffff' : '#17221f';

function PaletteLab({
  value,
  onChange,
}: {
  readonly value: PaletteSettings;
  readonly onChange: (value: PaletteSettings) => void;
}) {
  const t = useStudioText();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const update = (role: PaletteRole, color: string) => onChange(Object.freeze({ ...value, [role]: color }));
  const copySettings = async () => {
    const css = [
      ':root {',
      `  --ether-highlight: ${value.highlight};`,
      `  --ether-positive: ${value.positive};`,
      `  --ether-info: ${value.info};`,
      `  --ether-warning: ${value.warning};`,
      `  --ether-danger: ${value.danger};`,
      `  --ether-neutral: ${value.neutral};`,
      '}',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(css);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
    }
  };
  return <details className="palette-lab">
    <summary><span>{t('Paleta semántica', 'Semantic palette')}</span><b>{t('Automotriz · accesible', 'Automotive · accessible')}</b></summary>
    <div className="palette-lab__content">
      {(Object.keys(paletteLabels) as PaletteRole[]).map(role => {
        const contrast = contrastAgainstWhite(value[role]);
        return <label
          className="palette-lab__swatch"
          key={role}
          style={{ background: value[role], color: readableTextColor(value[role]) }}
        >
          <span>{t(paletteLabels[role][0][0], paletteLabels[role][0][1])}</span>
          <strong>{t(paletteLabels[role][1][0], paletteLabels[role][1][1])}</strong>
          <input type="color" value={value[role]} onChange={event => update(role, event.target.value)} aria-label={`${t('Color', 'Color')} ${t(paletteLabels[role][0][0], paletteLabels[role][0][1])}`} />
          <b>{value[role]}</b>
          <small>{contrast.toFixed(2)}:1 {t('sobre blanco', 'on white')} · {contrast >= 4.5 ? 'AA' : t('contraste bajo', 'low contrast')}</small>
        </label>;
      })}
      <div className="palette-lab__actions">
        <button type="button" onClick={() => onChange(defaultPalette)}>{t('Restablecer', 'Reset')}</button>
        <button type="button" onClick={() => void copySettings()}>{copyState === 'copied' ? t('Paleta copiada', 'Palette copied') : copyState === 'error' ? t('No se pudo copiar', 'Could not copy') : t('Copiar paleta', 'Copy palette')}</button>
      </div>
    </div>
  </details>;
}

const telemetry: ApexEtherTelemetry = Object.freeze({
  motion: Object.freeze({ speedKmh: 278, rpm: 6840, maximumRpm: 8200, gear: '4', throttle: .84, brake: .18, steering: 7 }),
  race: Object.freeze({ position: 1, entrants: 12, lap: 2, lapCount: 3, elapsed: '01:24.560', bestLap: '01:18.732', delta: '−0.384', deltaTone: 'positive', sector: 2, sectorCount: 3 }),
  session: Object.freeze({ trackName: 'Altas Cumbres', vehicleName: 'Apex GT', mode: 'Práctica cronometrada', weather: 'Claro · 18°', condition: 'Asfalto seco' }),
  wheels: Object.freeze([
    { id: 'FL', temperatureC: 87, pressurePsi: 27.6, loadKn: 4.2, gripPercent: 93 },
    { id: 'FR', temperatureC: 90, pressurePsi: 27.8, loadKn: 4.5, gripPercent: 91 },
    { id: 'RL', temperatureC: 94, pressurePsi: 28.1, loadKn: 3.8, gripPercent: 84, tone: 'warning' },
    { id: 'RR', temperatureC: 92, pressurePsi: 28.0, loadKn: 3.7, gripPercent: 88 },
  ] as const),
  route: Object.freeze([{ x: 30, y: 148 }, { x: 56, y: 128 }, { x: 68, y: 78 }, { x: 118, y: 58 }, { x: 152, y: 82 }, { x: 132, y: 128 }, { x: 94, y: 150 }, { x: 48, y: 142 }]),
});

const leaders = Object.freeze([
  { name: 'J. Villaverde', gap: 'Líder', active: true }, { name: 'M. Anderson', gap: '+1.250' }, { name: 'L. Martínez', gap: '+2.463' }, { name: 'A. Wilson', gap: '+3.820' }, { name: 'R. Thompson', gap: '+4.256' },
]);
function Frame({ title, subtitle, mode, background, children }: { title: string; subtitle: string; mode: ApexEtherSurfaceMode; background: 'mountain' | 'night'; children: ReactNode }) {
  const t = useStudioText();
  return <article className="catalog-frame" data-mode={mode} style={{ '--catalog-image': `url("${catalogBackgrounds[background]}")` } as CSSProperties}>
    <header><div><span>{subtitle}</span><h2>{title}</h2></div><b>{mode === 'glass' ? t('VIDRIO CLARO', 'CLEAR GLASS') : t('BLANCO OPACO', 'OPAQUE WHITE')}</b></header>
    <div className="catalog-frame__scene" data-mode={mode}>{children}</div>
  </article>;
}

function RaceBroadcast({ mode }: { mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  const localizedLeaders = leaders.map(entry => entry.active ? { ...entry, gap: t('Líder', 'Leader') } : entry);
  const localizedObjectives = [
    { label: t('Completa el podio', 'Finish on the podium'), complete: true },
    { label: t('Mantén el ritmo objetivo', 'Maintain target pace'), progress: '02:14' },
    { label: t('Recupera energía en frenada', 'Recover energy under braking'), progress: '68%' },
  ];
  return <div className="hud-layout hud-layout--broadcast">
    <div className="hud-layout__identity" data-mode={mode}><span>{t('Práctica cronometrada', 'Timed practice')}</span><strong>{telemetry.session.trackName}</strong><em>{t('Claro · 18°', 'Clear · 18°')}</em></div>
    <ApexEtherPosition race={telemetry.race} mode={mode} />
    <ApexEtherRaceClock race={telemetry.race} mode={mode} />
    <ApexEtherLeaderboard entries={localizedLeaders} mode={mode} />
    <ApexEtherObjectives items={localizedObjectives} mode={mode} />
    <ApexEtherRoute points={telemetry.route} mode={mode} />
    <ApexEtherSpeed motion={telemetry.motion} mode={mode} />
  </div>;
}

function TrackAttack({ mode }: { mode: ApexEtherSurfaceMode }) {
  return <div className="hud-layout hud-layout--attack">
    <ApexEtherRaceClock race={telemetry.race} mode={mode} />
    <ApexEtherReferenceDelta sector="Sector 2" deltaSeconds={-0.384} mode={mode} />
    <ApexEtherRoute points={telemetry.route} mode={mode} />
    <ApexEtherSpeed motion={telemetry.motion} mode={mode} />
  </div>;
}

function CarCare({ mode }: { mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  return <div className="hud-layout hud-layout--care">
    <ApexEtherWheelHealth wheels={telemetry.wheels} mode={mode} />
    <ApexEtherInput motion={telemetry.motion} mode={mode} />
    <ApexEtherSurface title={t('Tren motriz', 'Powertrain')} eyebrow={t('Estado en vivo', 'Live status')} mode={mode} className="catalog-drivetrain"><ApexEtherMetric label={t('Potencia', 'Power')} value="742" unit={t('CV', 'hp')} /><ApexEtherMetric label={t('Par', 'Torque')} value="800" unit="Nm" /><ApexEtherMetric label={t('Aceite', 'Oil')} value="94" unit="°C" tone="positive" /><ApexEtherMetric label={t('Batería', 'Battery')} value="68" unit="%" tone="info" detail={t('Recuperación activa', 'Active recovery')} /></ApexEtherSurface>
    <ApexEtherSurface title={t('Asistencias', 'Assists')} mode={mode} className="catalog-assists"><div data-tone="positive"><b>ABS</b><strong>{t('Activo', 'Active')}</strong></div><div data-tone="emphasis"><b>{t('Tracción', 'Traction')}</b><strong>Sport</strong></div><div data-tone="info"><b>{t('Estabilidad', 'Stability')}</b><strong>{t('Dinámico', 'Dynamic')}</strong></div></ApexEtherSurface>
  </div>;
}

function SessionBrief({ mode }: { mode: ApexEtherSurfaceMode }) {
  const t = useStudioText();
  return <div className="hud-layout hud-layout--brief">
    <ApexEtherSurface title={t('Sesión', 'Session')} eyebrow={t('Antes de conducir', 'Before driving')} mode={mode} className="catalog-session"><ApexEtherMetric label={t('Circuito', 'Circuit')} value={telemetry.session.trackName} detail={t('5,8 km · 18 curvas', '5.8 km · 18 turns')} variant="hero" /><ApexEtherMetric label={t('Vehículo', 'Vehicle')} value={telemetry.session.vehicleName} detail={t('Tracción trasera · Sport+', 'Rear-wheel drive · Sport+')} variant="hero" /><ApexEtherMetric label={t('Condición', 'Condition')} value={t('Asfalto seco', 'Dry asphalt')} detail={t('Claro · 18°', 'Clear · 18°')} variant="hero" /></ApexEtherSurface>
    <ApexEtherObjectives items={[{ label: t('Completa el podio', 'Finish on the podium'), complete: true }, { label: t('Mantén el ritmo objetivo', 'Maintain target pace'), progress: '02:14' }, { label: t('Recupera energía en frenada', 'Recover energy under braking'), progress: '68%' }]} mode={mode} />
    <ApexEtherSurface title={t('Cámara', 'Camera')} mode={mode} className="catalog-camera"><div><b>{t('Exterior dinámica', 'Dynamic exterior')}</b><span>{t('FOV 74° · seguimiento suave', 'FOV 74° · smooth tracking')}</span></div><button type="button">{t('Cambiar vista', 'Change view')}</button></ApexEtherSurface>
  </div>;
}

function Library() {
  const t = useStudioText();
  const metrics = [
    [t('Rendimiento', 'Performance'), t('Potencia, par, rpm, velocidad máxima, 0–100, consumo, autonomía', 'Power, torque, rpm, top speed, 0–100, consumption, range')],
    [t('Carrera', 'Race'), t('Posición, vueltas, sectores, delta, clasificación, objetivos, sanciones', 'Position, laps, sectors, delta, standings, objectives, penalties')],
    [t('Vehículo', 'Vehicle'), t('Neumáticos, cargas, temperatura, presión, desgaste, daños, fluidos', 'Tires, loads, temperature, pressure, wear, damage, fluids')],
    [t('Navegación', 'Navigation'), t('Ruta, siguiente curva, distancia, punto de frenada, minimapa, brújula', 'Route, next turn, distance, braking point, minimap, compass')],
    [t('Sesión', 'Session'), t('Pista, clima, hora, cámara, modo, dificultad, tráfico, replay', 'Track, weather, time, camera, mode, difficulty, traffic, replay')],
    [t('Conducción', 'Driving'), t('Acelerador, freno, dirección, marcha, asistencias, energía, boost', 'Throttle, brake, steering, gear, assists, energy, boost')],
  ];
  return <section className="catalog-library"><header><span>{t('Sistema modular', 'Modular system')}</span><h2>{t('Catálogo de información', 'Information catalog')}</h2><p>{t('Las métricas se organizan por decisión del conductor. Cada bloque puede vivir solo, en overlay o dentro de una superficie de vidrio claro u opaca.', 'Metrics are organized around driver decisions. Each block can stand alone, appear as an overlay, or live inside a clear-glass or opaque surface.')}</p></header><div>{metrics.map(([title, text], index) => <article key={title}><b>{String(index + 1).padStart(2, '0')}</b><h3>{title}</h3><p>{text}</p></article>)}</div></section>;
}

function Motivation() {
  const t = useStudioText();
  const principles = [
    [t('Frontera independiente', 'Independent boundary'), t('La aplicación anfitriona decide qué mostrar. Ether lo representa con una jerarquía consistente, un costo de render acotado y sin añadir latencia perceptible. Ningún panel necesita conocer el motor físico, la escena o el ciclo de juego.', 'The host application decides what to show. Ether renders it with consistent hierarchy, bounded rendering cost and no perceptible added latency. No panel needs to know the physics engine, scene or game loop.')],
    [t('Jerarquía antes que volumen', 'Hierarchy before volume'), t('La información se organiza por decisiones del conductor. Cada composición muestra lo necesario para carrera, estrategia, diagnóstico o aprendizaje.', 'Information is organized around driver decisions. Each composition shows what is needed for racing, strategy, diagnostics or learning.')],
    [t('Costo de render predecible', 'Predictable rendering cost'), t('Los datos se publican por segmentos y cada panel escucha únicamente su porción. La frecuencia de la simulación no obliga a redibujar toda la interfaz.', 'Data is published by segment and each panel listens only to its own slice. Simulation frequency does not force the entire interface to redraw.')],
  ] as const;
  return <section className="catalog-motivation" id="motivation">
    <header><span>{t('Motivación', 'Motivation')}</span><h2>{t('La telemetría es compleja.', 'Telemetry is complex.')}<br />{t('La lectura no debería serlo.', 'Reading it should not be.')}</h2><p>{t('Una simulación puede producir cientos de miles de señales por segundo. El conductor sólo necesita las decisivas, presentadas en el instante correcto. Apex Ether transforma ese flujo en componentes legibles, configurables y desacoplados.', 'A simulation can produce hundreds of thousands of signals per second. The driver only needs the decisive ones, presented at the right moment. Apex Ether turns that flow into readable, configurable and decoupled components.')}</p></header>
    <div>{principles.map(([title, text], index) => <article key={title}><b>{String(index + 1).padStart(2, '0')}</b><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>;
}

function Ecosystem() {
  const t = useStudioText();
  return <section className="catalog-ecosystem" id="ecosystem">
    <header><span>{t('Integración con Apex', 'Integration with Apex')}</span><h2>{t('Una frontera clara entre datos y experiencia', 'A clear boundary between data and experience')}</h2><p>{t('Apex Ether recibe contratos de telemetría estables y devuelve componentes React. El resto del ecosistema conserva sus responsabilidades.', 'Apex Ether receives stable telemetry contracts and returns React components. The rest of the ecosystem keeps its responsibilities.')}</p></header>
    <div className="catalog-ecosystem__flow" aria-label={t('Flujo de integración de Apex Ether', 'Apex Ether integration flow')}>
      <article><span>{t('Fuentes', 'Sources')}</span><strong>Apex Physics<br />{t('Estado de carrera', 'Race state')}</strong><p>{t('Movimiento, controles, neumáticos, carrera, ruta y sesión.', 'Motion, controls, tires, race, route and session.')}</p></article>
      <i aria-hidden="true">→</i>
      <article><span>{t('Frontera del host', 'Host boundary')}</span><strong>{t('Adaptador de Apex Drive', 'Apex Drive adapter')}</strong><p>{t('Normaliza unidades y publica únicamente los segmentos modificados.', 'Normalizes units and publishes only changed segments.')}</p></article>
      <i aria-hidden="true">→</i>
      <article data-primary><span>{t('Sistema visual', 'Visual system')}</span><strong>@jvsysarch/apex-ether</strong><p>{t('Paneles, tokens, modos de superficie y suscripciones selectivas.', 'Panels, tokens, surface modes and selective subscriptions.')}</p></article>
      <i aria-hidden="true">→</i>
      <article><span>{t('Aplicaciones', 'Applications')}</span><strong>{t('HUD de Apex Drive', 'Apex Drive HUD')}<br />Ether Studio</strong><p>{t('Experiencia integrada, catálogo, Lab y futuras composiciones.', 'Integrated experience, catalog, Lab and future compositions.')}</p></article>
    </div>
  </section>;
}

function Performance() {
  const t = useStudioText();
  return <section className="catalog-performance"><span>{t('Presupuesto de rendimiento', 'Performance budget')}</span><h2>{t('Lectura clara y actualización estable', 'Clear reading and stable updates')}</h2><div><article><b>01</b><h3>{t('Datos segmentados', 'Segmented data')}</h3><p>{t('Movimiento, carrera, ruta y vehículo se publican por separado. Cada panel recibe únicamente la información que necesita.', 'Motion, race, route and vehicle data are published separately. Each panel receives only the information it needs.')}</p></article><article><b>02</b><h3>{t('Composición por demanda', 'On-demand composition')}</h3><p>{t('Se montan únicamente los paneles elegidos. Las rutas y los gráficos trabajan cuando están visibles.', 'Only selected panels are mounted. Routes and charts work only while visible.')}</p></article><article><b>03</b><h3>{t('Superficie liviana', 'Lightweight surface')}</h3><p>{t('El vidrio utiliza una capa semitransparente y el desenfoque se regula según el presupuesto visual disponible.', 'Glass uses a translucent layer and blur is adjusted to the available visual budget.')}</p></article><article><b>04</b><h3>{t('Números estables', 'Stable figures')}</h3><p>{t('Tipografía tabular, estructura compacta y transformaciones aisladas mantienen fluidos los datos de alta frecuencia.', 'Tabular figures, compact structure and isolated transforms keep high-frequency data fluid.')}</p></article></div></section>;
}

function ApexEtherStudioContent({
  locale,
  onLocaleChange,
}: {
  readonly locale: ApexEtherLocale;
  readonly onLocaleChange: (locale: ApexEtherLocale) => void;
}) {
  const t = useStudioText();
  const [typography, setTypography] = useState(defaultTypography);
  const [palette, setPalette] = useState(defaultPalette);
  const [shadows, setShadows] = useState(defaultShadows);
  const [glass, setGlass] = useState(defaultGlass);
  const boxShadow = (shadow: BoxShadowValue) => (
    `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgb(0 0 0 / ${shadow.opacity}%)`
  );
  const typographyStyle = {
    '--ether-font-title': `"${typography.title.family}", "Inter"`,
    '--ether-font-hero': `"${typography.hero.family}", "Manrope"`,
    '--ether-font-speed': `"${typography.speed.family}", "Inter"`,
    '--ether-font-figures': `"${typography.figures.family}", "Inter"`,
    '--ether-font-subtitle': `"${typography.subtitle.family}", "Inter"`,
    '--ether-font-small': `"${typography.small.family}", "Manrope"`,
    '--ether-weight-title': typography.title.weight,
    '--ether-weight-hero': typography.hero.weight,
    '--ether-weight-speed': typography.speed.weight,
    '--ether-weight-figures': typography.figures.weight,
    '--ether-weight-subtitle': typography.subtitle.weight,
    '--ether-weight-small': typography.small.weight,
    '--ether-size-title': `${typography.title.size}px`,
    '--ether-size-hero': `${typography.hero.size}px`,
    '--ether-size-speed': `${typography.speed.size}px`,
    '--ether-size-figures': `${typography.figures.size}px`,
    '--ether-size-subtitle': `${typography.subtitle.size}px`,
    '--ether-size-small': `${typography.small.size}px`,
    '--ether-line-height-title': typography.title.lineHeight,
    '--ether-line-height-hero': typography.hero.lineHeight,
    '--ether-line-height-speed': typography.speed.lineHeight,
    '--ether-line-height-figures': typography.figures.lineHeight,
    '--ether-line-height-subtitle': typography.subtitle.lineHeight,
    '--ether-line-height-small': typography.small.lineHeight,
    '--ether-letter-spacing-title': `${typography.title.letterSpacing}em`,
    '--ether-letter-spacing-hero': `${typography.hero.letterSpacing}em`,
    '--ether-letter-spacing-speed': `${typography.speed.letterSpacing}em`,
    '--ether-letter-spacing-figures': `${typography.figures.letterSpacing}em`,
    '--ether-letter-spacing-subtitle': `${typography.subtitle.letterSpacing}em`,
    '--ether-letter-spacing-small': `${typography.small.letterSpacing}em`,
    '--ether-margin-before-title': `${typography.title.marginBefore}px`,
    '--ether-margin-before-hero': `${typography.hero.marginBefore}px`,
    '--ether-margin-before-speed': `${typography.speed.marginBefore}px`,
    '--ether-margin-before-figures': `${typography.figures.marginBefore}px`,
    '--ether-margin-before-subtitle': `${typography.subtitle.marginBefore}px`,
    '--ether-margin-before-small': `${typography.small.marginBefore}px`,
    '--ether-margin-after-title': `${typography.title.marginAfter}px`,
    '--ether-margin-after-hero': `${typography.hero.marginAfter}px`,
    '--ether-margin-after-speed': `${typography.speed.marginAfter}px`,
    '--ether-margin-after-figures': `${typography.figures.marginAfter}px`,
    '--ether-margin-after-subtitle': `${typography.subtitle.marginAfter}px`,
    '--ether-margin-after-small': `${typography.small.marginAfter}px`,
    '--ether-highlight': palette.highlight,
    '--ether-accent': palette.highlight,
    '--ether-positive': palette.positive,
    '--ether-info': palette.info,
    '--ether-warning': palette.warning,
    '--ether-danger': palette.danger,
    '--ether-neutral': palette.neutral,
    '--ether-muted': palette.neutral,
    '--ether-shadow': boxShadow(shadows.solid),
    '--ether-glass-shadow': boxShadow(shadows.glass),
    '--ether-glass-text-shadow': `${shadows.text.x}px ${shadows.text.y}px ${shadows.text.blur}px rgb(0 0 0 / ${shadows.text.opacity}%)`,
    '--ether-glass-fill-start': colorWithOpacity(glass.colorStart, glass.opacityStart),
    '--ether-glass-fill-end': colorWithOpacity(glass.colorEnd, glass.opacityEnd),
    '--ether-glass-gradient-angle': `${glass.gradientAngle}deg`,
    '--ether-glass-fill': glassGradientValue(glass),
    '--ether-glass-backdrop-blur': `${glass.backdropBlur}px`,
    '--ether-glass-border': colorWithOpacity(glass.borderColor, glass.borderOpacity),
    '--ether-glass-border-width': `${glass.borderWidth}px`,
    '--ether-glass-text-stroke-color': colorWithOpacity(glass.textStrokeColor, glass.textStrokeOpacity),
    '--ether-glass-text-stroke-width': `${glass.textStrokeWidth}px`,
    '--catalog-hero-image': `url("${mountainBackground}")`,
  } as CSSProperties;
  const query = new URLSearchParams(window.location.search);
  const isLabRoute = window.location.pathname.replace(/\/+$/, '').endsWith('/lab');
  const labEnabled = isLabRoute || query.get('lab') === 'true';
  if (query.get('view') === 'expanded') {
    return <main className="catalog-shell" style={typographyStyle}><LanguageSwitcher locale={locale} onChange={onLocaleChange} /><ExpandedCatalog /></main>;
  }
  return <main className="catalog-shell" style={typographyStyle}>
    <LanguageSwitcher locale={locale} onChange={onLocaleChange} />
    {labEnabled ? <div className="catalog-controls">
      <TypographyLab value={typography} onChange={setTypography} />
      <PaletteLab value={palette} onChange={setPalette} />
      <ShadowLab value={shadows} onChange={setShadows} />
      <GlassLab value={glass} onChange={setGlass} />
    </div> : null}
    <section className="catalog-hero">
      <p>{t('Apex Ether · sistema de telemetría', 'Apex Ether · telemetry system')}</p>
      <h1>{t('Datos en tiempo real.', 'Real-time data.')}<br /><i>{t('Jerarquía para decidir.', 'Hierarchy for every decision.')}</i></h1>
      <p className="catalog-hero__lede">{t('Lectura inmediata de telemetría en superficies amplias, con cada dato organizado por relevancia y renderizado sin interferir con la conducción.', 'Immediate telemetry reading on large displays, with every data point organized by relevance and rendered without interfering with driving.')}</p>
      <div>
        <span>{t('Lectura rápida', 'Fast reading')}</span>
        <span>{t('Opaco o vidrio transparente', 'Opaque or transparent glass')}</span>
        <span>{t('Render selectivo de alto rendimiento', 'High-performance selective rendering')}</span>
      </div>
    </section>
    <section className="catalog-intro"><p>{t('Una familia de interfaces de conducción, carrera y diagnóstico. No es una sola pantalla recargada: cada composición responde a un momento de uso y puede elegir sus propios paneles.', 'A family of driving, racing and diagnostic interfaces. It is not one overloaded screen: each composition serves a moment of use and can select its own panels.')}</p></section>
    <Motivation />
    <section className="catalog-frames"><Frame title={t('Carrera en vivo', 'Live race')} subtitle={t('Composición completa · información periférica', 'Complete composition · peripheral information')} mode="glass" background="mountain"><RaceBroadcast mode="glass" /></Frame><Frame title={t('Ataque de vuelta', 'Lap attack')} subtitle={t('Foco absoluto · feedback inmediato', 'Absolute focus · immediate feedback')} mode="glass" background="night"><TrackAttack mode="glass" /></Frame><Frame title={t('Estado del vehículo', 'Vehicle status')} subtitle={t('Diagnóstico claro · datos comparables', 'Clear diagnostics · comparable data')} mode="solid" background="mountain"><CarCare mode="solid" /></Frame><Frame title={t('Brief de sesión', 'Session brief')} subtitle={t('Configuración · objetivos y contexto', 'Setup · objectives and context')} mode="solid" background="night"><SessionBrief mode="solid" /></Frame></section>
    <ExpandedCatalog />
    <Ecosystem />
    <Library /><Performance />
    <footer className="catalog-footer">
      <div>
        <strong>Apex Ether</strong>
        <span>
          © Jonathan Villaverde 2026 · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license">CC BY-NC-SA 4.0</a>
        </span>
      </div>
      <nav aria-label={t('Navegación y autoría', 'Navigation and authorship')}>
        <a href={`${import.meta.env.BASE_URL}?lang=${locale}`}>{t('Catálogo', 'Catalog')}</a>
        <a href={`${import.meta.env.BASE_URL}?lab=true&lang=${locale}`}>Lab</a>
        <a href="https://github.com/jvsysarch" rel="author noopener noreferrer" target="_blank">GitHub</a>
        <a href="https://ar.linkedin.com/in/jonathanvillaverde" rel="author noopener noreferrer" target="_blank">LinkedIn</a>
      </nav>
    </footer>
  </main>;
}

function LanguageSwitcher({
  locale,
  onChange,
}: {
  readonly locale: ApexEtherLocale;
  readonly onChange: (locale: ApexEtherLocale) => void;
}) {
  return <nav className="catalog-language" aria-label={locale === 'es' ? 'Idioma' : 'Language'}>
    <button type="button" aria-pressed={locale === 'es'} onClick={() => onChange('es')}>ES</button>
    <button type="button" aria-pressed={locale === 'en'} onClick={() => onChange('en')}>EN</button>
  </nav>;
}

const initialLocale = (): ApexEtherLocale => {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (requested === 'es' || requested === 'en') return requested;
  const stored = localStorage.getItem('apex-ether.locale');
  return stored === 'en' ? 'en' : 'es';
};

export function ApexEtherStudio() {
  const [locale, setLocale] = useState<ApexEtherLocale>(initialLocale);
  const updateLocale = (nextLocale: ApexEtherLocale) => {
    setLocale(nextLocale);
    localStorage.setItem('apex-ether.locale', nextLocale);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLocale);
    window.history.replaceState(null, '', url);
  };
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = locale === 'en' ? 'Apex Ether — Studio' : 'Apex Ether — Studio';
  }, [locale]);
  return <StudioLocaleProvider locale={locale}>
    <ApexEtherLocaleProvider locale={locale}>
      <ApexEtherStudioContent locale={locale} onLocaleChange={updateLocale} />
    </ApexEtherLocaleProvider>
  </StudioLocaleProvider>;
}
