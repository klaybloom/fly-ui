import * as React from 'react';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');
/** useLayoutEffect in the browser, useEffect on the server (no warning during server rendering). */
const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/* ---------- Button ---------- */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = graphite fill, once per view · secondary = sunken fill · plain = text only · danger = destructive */
  variant?: 'primary' | 'secondary' | 'plain' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Optional leading icon (an inline SVG drawn with currentColor). */
  icon?: React.ReactNode;
  /** Shows a spinner in place of the icon, keeps the width, and blocks clicks. */
  loading?: boolean;
}
/** The one button. Secondary is the default; primary at most once per view. */
export function Button({ variant = 'secondary', size = 'md', icon, loading, className, children, type = 'button', disabled, onClick, ...rest }: ButtonProps) {
  return (
    <button {...rest} type={type} disabled={disabled} aria-busy={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      className={cx('fly-btn', 'fly-btn--' + variant, 'fly-btn--' + size, !children && 'fly-btn--icon', loading && 'is-loading', className)}>
      {loading ? <span className="fly-btn__icon" aria-hidden="true"><span className="fly-spinner fly-spinner--inline" /></span>
        : icon ? <span className="fly-btn__icon" aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
}

/* ---------- TextField ---------- */
/** Shared by TextField and Select: where the label sits and how big the box is. */
export interface FieldLayoutProps {
  /** start = label on the same line, left of the box (default) · top = label above, for long forms and narrow columns. */
  labelPosition?: 'start' | 'top';
  /** Fixed label column width for `start`, so a stack of fields lines up (e.g. 64). */
  labelWidth?: number | string;
  /** md = 32px (default) · sm = 28px for toolbars and dense filters. */
  size?: 'sm' | 'md';
}
const fieldShell = (l: FieldLayoutProps, error?: string, extra?: string) => ({
  className: cx('fly-field', 'fly-field--' + (l.labelPosition || 'start'), 'fly-field--' + (l.size || 'md'), error && 'fly-field--error', extra),
  style: l.labelWidth !== undefined ? ({ ['--fly-label-w' as any]: typeof l.labelWidth === 'number' ? l.labelWidth + 'px' : l.labelWidth } as React.CSSProperties) : undefined,
});
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, FieldLayoutProps {
  label: string;
  hint?: string;
  error?: string;
}
/** A labelled single-line input with an optional hint or error underneath. */
export function TextField({ label, hint, error, id, className, labelPosition, labelWidth, size, ...rest }: TextFieldProps) {
  const auto = React.useId();
  const fid = id || 'fly-tf-' + auto;
  const note = error || hint;
  const shell = fieldShell({ labelPosition, labelWidth, size }, error, className);
  return (
    <div className={shell.className} style={shell.style}>
      <label className="fly-field__label" htmlFor={fid}>{label}</label>
      <input {...rest} id={fid} className="fly-field__input" aria-invalid={error ? true : undefined} aria-describedby={note ? fid + '-note' : undefined} />
      {note ? <p className="fly-field__note" id={fid + '-note'}>{error ? <span aria-hidden="true">⚠︎ </span> : null}{note}</p> : null}
    </div>
  );
}

/* ---------- SegmentedControl ---------- */
export interface SegmentedControlProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}
/** Two to five mutually exclusive views or filters, switched in place. */
export function SegmentedControl({ options, value, defaultValue, onChange, size = 'md', ...aria }: SegmentedControlProps) {
  const [inner, setInner] = React.useState(defaultValue ?? options[0]?.value);
  const current = value ?? inner;
  const idx = Math.max(0, options.findIndex(o => o.value === current));
  const pick = (v: string) => { if (value === undefined) setInner(v); onChange?.(v); };
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (idx + d + options.length) % options.length;
    pick(options[n].value);
    const btns = (e.currentTarget as HTMLElement).querySelectorAll('button');
    (btns[n] as HTMLElement | undefined)?.focus();
  };
  return (
    <div role="radiogroup" aria-label={aria['aria-label']} className={cx('fly-seg', 'fly-seg--' + size)} onKeyDown={onKey}
      style={{ ['--fly-seg-n' as any]: options.length, ['--fly-seg-i' as any]: idx }}>
      <span className="fly-seg__thumb" aria-hidden="true" />
      {options.map((o, i) => (
        <button key={o.value} type="button" role="radio" aria-checked={i === idx} tabIndex={i === idx ? 0 : -1}
          className={cx('fly-seg__item', i === idx && 'is-selected')} onClick={() => pick(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

/* ---------- Switch ---------- */
export interface SwitchProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}
/** An immediate on/off setting with its label on the left. */
export function Switch({ label, checked, defaultChecked = false, disabled, onChange }: SwitchProps) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked ?? inner;
  const toggle = () => { if (disabled) return; if (checked === undefined) setInner(!on); onChange?.(!on); };
  return (
    <label className={cx('fly-switch', disabled && 'is-disabled')}>
      <span className="fly-switch__label">{label}</span>
      <button type="button" role="switch" aria-checked={on} disabled={disabled} className={cx('fly-switch__track', on && 'is-on')} onClick={toggle}>
        <span className="fly-switch__knob" />
      </button>
    </label>
  );
}

/* ---------- Badge ---------- */
export interface BadgeProps {
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  children?: React.ReactNode;
}
/** One or two words of status; the word carries the meaning, colour only supports it. */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={'fly-badge fly-badge--' + tone}>{children}</span>;
}

/* ---------- Card ---------- */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  /** Controls placed at the top right of the card header. */
  actions?: React.ReactNode;
  as?: 'section' | 'article' | 'div';
}
/** A stable, opaque content surface. Never glass. */
export function Card({ title, subtitle, actions, as = 'section', className, children, ...rest }: CardProps) {
  const Tag = as as any;
  return (
    <Tag {...rest} className={cx('fly-card', className)}>
      {title || actions ? (
        <header className="fly-card__head">
          <div>
            {title ? <h3 className="fly-card__title">{title}</h3> : null}
            {subtitle ? <p className="fly-card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="fly-card__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="fly-card__body">{children}</div>
    </Tag>
  );
}

/* ---------- Toolbar ---------- */
export interface ToolbarProps {
  title?: string;
  subtitle?: string;
  /** Leading slot: back button, sidebar toggle. */
  leading?: React.ReactNode;
  /** Centre slot: a SegmentedControl or a search field. */
  center?: React.ReactNode;
  /** Trailing slot: actions, at most one primary. */
  trailing?: React.ReactNode;
  /** bar = full-width top bar; floating = capsule over content. */
  variant?: 'bar' | 'floating';
}
/** The glass chrome layer: navigation and actions floating above content. */
export function Toolbar({ title, subtitle, leading, center, trailing, variant = 'bar' }: ToolbarProps) {
  return (
    <div role="toolbar" aria-label={title} className={cx('fly-toolbar', 'fly-toolbar--' + variant)}>
      <div className="fly-toolbar__start">
        {leading}
        {title ? (
          <div className="fly-toolbar__titles">
            <span className="fly-toolbar__title">{title}</span>
            {subtitle ? <span className="fly-toolbar__subtitle">{subtitle}</span> : null}
          </div>
        ) : null}
      </div>
      {center ? <div className="fly-toolbar__center">{center}</div> : null}
      <div className="fly-toolbar__end">{trailing}</div>
    </div>
  );
}

/* ---------- shared: icons, outside click ---------- */
const Ico = ({ d }: { d: string }) => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const CHEVRON = 'M6 8l4 4 4-4';
const CHECK = 'M4.5 10.5l3.5 3.5 7.5-8';
const CLOSE = 'M5 5l10 10M15 5L5 15';
const ALERT = 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM10 6.5v4M10 13.5h.01';
function useOutside(ref: React.RefObject<HTMLElement>, on: boolean, fn: () => void) {
  React.useEffect(() => {
    if (!on) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) fn(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [on, fn, ref]);
}

/**
 * Places a popover with position: fixed next to its anchor, so scrolling containers (a table) never clip it.
 * Below by default, above when there isn't room below; follows the anchor on scroll and resize.
 */
function usePlacement(anchor: React.RefObject<HTMLElement>, pop: React.RefObject<HTMLElement>, open: boolean, align: 'start' | 'end' = 'start', matchWidth = false) {
  const [pos, setPos] = React.useState<{ style: React.CSSProperties; above: boolean }>({ style: { visibility: 'hidden' }, above: false });
  useIsoLayoutEffect(() => {
    if (!open) { setPos({ style: { visibility: 'hidden' }, above: false }); return; }
    const place = () => {
      const a = anchor.current, p = pop.current;
      if (!a || !p) return;
      const r = a.getBoundingClientRect();
      const vw = document.documentElement.clientWidth, vh = window.innerHeight;
      const need = p.offsetHeight + 8;
      const above = r.bottom + need > vh && r.top - need > 0;
      const style: React.CSSProperties = { position: 'fixed' };
      if (above) style.bottom = vh - r.top + 4; else style.top = r.bottom + 4;
      if (align === 'end') style.right = Math.max(4, vw - r.right); else style.left = Math.max(4, Math.min(r.left, vw - p.offsetWidth - 4));
      if (matchWidth) style.minWidth = r.width;
      setPos({ style, above });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); };
  }, [open, anchor, pop, align, matchWidth]);
  return pos;
}

/* ---------- Spinner & Skeleton ---------- */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Read out to assistive tech and shown beside the spinner when `showLabel`. */
  label?: string;
  showLabel?: boolean;
}
/** An indeterminate wait of under a few seconds, where the layout of the result is unknown. */
export function Spinner({ size = 'md', label = '加载中', showLabel }: SpinnerProps) {
  return (
    <span className={cx('fly-spinner-wrap')} role="status">
      <span className={cx('fly-spinner', 'fly-spinner--' + size)} aria-hidden="true" />
      {showLabel ? <span className="fly-spinner__label">{label}</span> : <span className="fly-sr">{label}</span>}
    </span>
  );
}
export interface SkeletonProps {
  /** Number of text lines; the last one is shorter. Ignored when `height` is set. */
  lines?: number;
  width?: number | string;
  height?: number | string;
  radius?: 'sm' | 'md' | 'lg' | 'full';
}
/** A placeholder in the shape of content that is about to load. */
export function Skeleton({ lines = 1, width, height, radius = 'sm' }: SkeletonProps) {
  if (height !== undefined) return <span className={'fly-skel fly-skel--r-' + radius} style={{ width: width ?? '100%', height }} aria-hidden="true" />;
  return (
    <span className="fly-skel-lines" style={{ width: width ?? '100%' }} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => <span key={i} className="fly-skel fly-skel--line" style={{ width: lines > 1 && i === lines - 1 ? '60%' : '100%' }} />)}
    </span>
  );
}

/* ---------- EmptyState ---------- */
export interface EmptyStateProps {
  /** A 20×20 line icon drawn with currentColor. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** One button that gets the person out of the empty state. */
  action?: React.ReactNode;
  tone?: 'neutral' | 'danger';
  compact?: boolean;
}
/** What a list, table or page shows when it has nothing, or when loading it failed. */
export function EmptyState({ icon, title, description, action, tone = 'neutral', compact }: EmptyStateProps) {
  return (
    <div className={cx('fly-empty', compact && 'fly-empty--compact', tone === 'danger' && 'fly-empty--danger')} role={tone === 'danger' ? 'alert' : undefined}>
      {icon ? <span className="fly-empty__icon" aria-hidden="true">{icon}</span> : null}
      <p className="fly-empty__title">{title}</p>
      {description ? <p className="fly-empty__desc">{description}</p> : null}
      {action ? <div className="fly-empty__action">{action}</div> : null}
    </div>
  );
}

/* ---------- Checkbox ---------- */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  /** Mixed state, e.g. a "select all" header when only some rows are selected. */
  indeterminate?: boolean;
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
}
/** A native checkbox, styled: one of several independent choices, or a row selection. */
export function Checkbox({ label, indeterminate, className, onChange, ...rest }: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  const box = (
    <span className="fly-check">
      <input {...rest} ref={ref} type="checkbox" className="fly-check__input" aria-checked={indeterminate ? 'mixed' : undefined}
        onChange={(e) => onChange?.(e.target.checked, e)} />
      <span className="fly-check__box" aria-hidden="true">
        <svg viewBox="0 0 20 20" className="fly-check__tick"><path d={CHECK} /></svg>
        <svg viewBox="0 0 20 20" className="fly-check__dash"><path d="M5 10h10" /></svg>
      </span>
    </span>
  );
  if (!label) return box;
  return <label className={cx('fly-check-label', rest.disabled && 'is-disabled', className)}>{box}<span>{label}</span></label>;
}

/* ---------- Select ---------- */
export interface SelectOption { value: string; label: string; description?: string; disabled?: boolean }
export interface SelectProps extends FieldLayoutProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  'aria-label'?: string;
}
/** Pick one value from a list of up to ~15 options; a popover listbox with full keyboard support. */
export function Select({ label, options, value, defaultValue, onChange, placeholder = '请选择', hint, error, disabled, size = 'md', labelPosition, labelWidth, ...aria }: SelectProps) {
  const auto = React.useId();
  const id = 'fly-sel-' + auto;
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(root, open, close);
  const place = usePlacement(trigger, listRef, open, 'start', true);
  React.useEffect(() => {
    if (open && active >= 0) listRef.current?.querySelector('#' + CSS.escape(id + '-o' + active))?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);
  const sel = options.find(o => o.value === current);
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter(i => i >= 0);
  const openList = () => {
    if (disabled) return;
    const i = options.findIndex(o => o.value === current);
    setActive(i >= 0 ? i : enabled[0] ?? -1);
    setOpen(true);
  };
  const pick = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    if (value === undefined) setInner(o.value);
    onChange?.(o.value);
    setOpen(false);
    trigger.current?.focus();
  };
  const move = (d: number) => {
    const pos = enabled.indexOf(active);
    const n = enabled[Math.min(enabled.length - 1, Math.max(0, (pos < 0 ? -1 : pos) + d))];
    if (n !== undefined) setActive(n);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(enabled[0]); }
    else if (e.key === 'End') { e.preventDefault(); setActive(enabled[enabled.length - 1]); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(active); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); }
  };
  const note = error || hint;
  const shell = fieldShell({ labelPosition: label ? labelPosition : 'top', labelWidth, size }, error, cx('fly-select', open && 'is-open'));
  return (
    <div className={shell.className} style={shell.style} ref={root}>
      {label ? <label className="fly-field__label" id={id + '-label'} htmlFor={id}>{label}</label> : null}
      <div className="fly-select__anchor">
      <button ref={trigger} id={id} type="button" disabled={disabled}
        className={cx('fly-field__input', 'fly-select__trigger')}
        role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={id + '-list'}
        aria-label={label ? undefined : aria['aria-label']} aria-labelledby={label ? id + '-label ' + id : undefined}
        aria-activedescendant={open && active >= 0 ? id + '-o' + active : undefined}
        aria-invalid={error ? true : undefined} aria-describedby={note ? id + '-note' : undefined}
        onClick={() => (open ? setOpen(false) : openList())} onKeyDown={onKey}>
        <span className={cx('fly-select__value', !sel && 'is-placeholder')}>{sel ? sel.label : placeholder}</span>
        <span className="fly-select__chevron"><Ico d={CHEVRON} /></span>
      </button>
      {open ? (
        <ul ref={listRef} style={place.style} className={cx('fly-popover', 'fly-select__list', place.above && 'fly-popover--above')} role="listbox" id={id + '-list'} aria-labelledby={label ? id + '-label' : undefined} tabIndex={-1}>
          {options.map((o, i) => (
            <li key={o.value} id={id + '-o' + i} role="option" aria-selected={o.value === current} aria-disabled={o.disabled || undefined}
              className={cx('fly-option', i === active && 'is-active', o.value === current && 'is-selected', o.disabled && 'is-disabled')}
              onMouseEnter={() => !o.disabled && setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(i)}>
              <span className="fly-option__text">
                <span>{o.label}</span>
                {o.description ? <span className="fly-option__desc">{o.description}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      </div>
      {note ? <p className="fly-field__note" id={id + '-note'}>{error ? <span aria-hidden="true">⚠︎ </span> : null}{note}</p> : null}
    </div>
  );
}

/* ---------- Tabs ---------- */
export interface TabItem { value: string; label: string; count?: number; disabled?: boolean; content?: React.ReactNode }
export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  'aria-label'?: string;
}
/** Switch between peer sections of one page; the underline slides to the selected tab. */
export function Tabs({ items, value, defaultValue, onChange, ...aria }: TabsProps) {
  const auto = React.useId();
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.value);
  const current = value ?? inner;
  const list = React.useRef<HTMLDivElement>(null);
  const [bar, setBar] = React.useState<{ x: number; w: number } | null>(null);
  const idx = Math.max(0, items.findIndex(t => t.value === current));
  useIsoLayoutEffect(() => {
    const el = list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[idx];
    if (el) setBar({ x: el.offsetLeft, w: el.offsetWidth });
  }, [idx, items]);
  const pick = (v: string) => { if (value === undefined) setInner(v); onChange?.(v); };
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    let n = idx;
    for (let k = 0; k < items.length; k++) { n = (n + d + items.length) % items.length; if (!items[n].disabled) break; }
    pick(items[n].value);
    list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[n]?.focus();
  };
  const panel = items[idx]?.content;
  return (
    <div className="fly-tabs">
      <div className="fly-tabs__list" role="tablist" aria-label={aria['aria-label']} ref={list} onKeyDown={onKey}>
        {items.map((t, i) => (
          <button key={t.value} type="button" role="tab" id={'fly-tab-' + auto + i} aria-selected={i === idx} aria-controls={panel !== undefined ? 'fly-tp-' + auto : undefined}
            tabIndex={i === idx ? 0 : -1} disabled={t.disabled} className={cx('fly-tab', i === idx && 'is-selected')} onClick={() => pick(t.value)}>
            {t.label}{t.count !== undefined ? <span className="fly-tab__count">{t.count}</span> : null}
          </button>
        ))}
        {bar ? <span className="fly-tabs__bar" aria-hidden="true" style={{ width: bar.w, transform: 'translateX(' + bar.x + 'px)' }} /> : null}
      </div>
      {panel !== undefined ? <div className="fly-tabs__panel" role="tabpanel" id={'fly-tp-' + auto} aria-labelledby={'fly-tab-' + auto + idx} tabIndex={0}>{panel}</div> : null}
    </div>
  );
}

/* ---------- Table ---------- */
export interface TableColumn<T = any> {
  key: string;
  title: string;
  width?: number | string;
  align?: 'start' | 'end' | 'center';
  /** Allows sorting by this column. Uncontrolled sorting compares `row[key]`. */
  sortable?: boolean;
  /** Renders the cell; defaults to `row[key]`. */
  render?: (row: T) => React.ReactNode;
  /** Render the cell in the mono `code` style (IDs, amounts). */
  mono?: boolean;
  /** Let long text wrap; cells stay on one line by default. */
  wrap?: boolean;
  /** Keep this column in view while the table scrolls sideways. `start` columns should come first, `end` columns last. */
  fixed?: 'start' | 'end';
}
export interface TableSort { key: string; dir: 'asc' | 'desc' }
export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  rows: T[];
  /** Field that identifies a row; default "id". */
  rowKey?: string;
  density?: 'regular' | 'compact';
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (keys: string[]) => void;
  sort?: TableSort | null;
  defaultSort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  /** Fixed height of the scrolling body (header included); rows scroll inside, the header stays. */
  height?: number | string;
  /** Skeleton rows drawn while loading; match the page size so the layout doesn't jump. Default 5. */
  loadingRows?: number;
  /** Shown in place of the rows when there are none. */
  empty?: React.ReactNode;
  'aria-label'?: string;
}
/** Rows of records to scan, sort, select and open. Opaque content surface; header sticks. */
export function Table<T extends Record<string, any>>({ columns, rows, rowKey = 'id', density = 'regular', selectable, selected, onSelectedChange,
  sort, defaultSort = null, onSortChange, onRowClick, loading, loadingRows = 5, empty, height, ...aria }: TableProps<T>) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [pin, setPin] = React.useState<Record<string, React.CSSProperties>>({});
  const hasFixed = columns.some(c => c.fixed);
  const edges = () => {
    const w = wrapRef.current;
    if (!w) return;
    w.classList.toggle('is-scrolled-start', w.scrollLeft > 0);
    w.classList.toggle('is-scrolled-end', w.scrollLeft + w.clientWidth < w.scrollWidth - 1);
  };
  useIsoLayoutEffect(() => {
    const w = wrapRef.current;
    if (!w) return;
    const measure = () => {
      // Offsets come from summed column widths, not offsetLeft, which a stuck cell reports at its pinned position.
      const ths = Array.from(w.querySelectorAll<HTMLElement>('thead th'));
      const widths = ths.map(th => th.offsetWidth);
      const next: Record<string, React.CSSProperties> = {};
      ths.forEach((th, i) => {
        const f = th.dataset.fixed;
        if (!f) return;
        const sum = (from: number, to: number) => widths.slice(from, to).reduce((a, b) => a + b, 0);
        next[th.dataset.key!] = f === 'end' ? { right: sum(i + 1, ths.length) } : { left: sum(0, i) };
      });
      setPin(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      edges();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(w);
    return () => ro.disconnect();
  });
  const [innerSort, setInnerSort] = React.useState<TableSort | null>(defaultSort);
  const [innerSel, setInnerSel] = React.useState<string[]>([]);
  const s = sort !== undefined ? sort : innerSort;
  const sel = selected ?? innerSel;
  const setSel = (k: string[]) => { if (selected === undefined) setInnerSel(k); onSelectedChange?.(k); };
  const view = React.useMemo(() => {
    if (!s || onSortChange) return rows;
    const out = rows.slice().sort((a, b) => {
      const x = a[s.key], y = b[s.key];
      const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'zh');
      return s.dir === 'asc' ? c : -c;
    });
    return out;
  }, [rows, s, onSortChange]);
  const cycle = (key: string) => {
    const next: TableSort | null = !s || s.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null;
    if (sort === undefined) setInnerSort(next);
    onSortChange?.(next);
  };
  const keys = view.map(r => String(r[rowKey]));
  const all = keys.length > 0 && keys.every(k => sel.includes(k));
  const some = !all && keys.some(k => sel.includes(k));
  const cols = columns.length + (selectable ? 1 : 0);
  const align = (a?: string) => (a === 'end' ? 'is-end' : a === 'center' ? 'is-center' : undefined);
  const starts = columns.filter(c => c.fixed === 'start'), ends = columns.filter(c => c.fixed === 'end');
  const lastStart = starts.length ? starts[starts.length - 1].key : null, firstEnd = ends.length ? ends[0].key : null;
  const edgeOf = (k: string) => (k === lastStart ? 'is-edge-start' : k === firstEnd ? 'is-edge-end' : undefined);
  return (
    <div ref={wrapRef} onScroll={edges} style={height !== undefined ? { height } : undefined}
      className={cx('fly-table-wrap', 'fly-table--' + density, hasFixed && 'has-fixed', height !== undefined && 'has-height')}>
      <table className="fly-table" aria-label={aria['aria-label']} aria-busy={loading || undefined}>
        <thead>
          <tr>
            {selectable ? (
              <th className="fly-table__sel is-fixed-start" scope="col">
                <Checkbox aria-label="全选" checked={all} indeterminate={some} disabled={!keys.length}
                  onChange={(c) => setSel(c ? Array.from(new Set([...sel, ...keys])) : sel.filter(k => !keys.includes(k)))} />
              </th>
            ) : null}
            {columns.map(c => {
              const dir = s && s.key === c.key ? s.dir : null;
              return (
                <th key={c.key} scope="col" data-key={c.key} data-fixed={c.fixed} style={{ width: c.width, minWidth: c.width, ...pin[c.key] }}
                  className={cx(align(c.align), c.fixed && 'is-fixed-' + c.fixed, edgeOf(c.key))}
                  aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : c.sortable ? 'none' : undefined}>
                  {c.sortable ? (
                    <button type="button" className={cx('fly-table__sort', dir && 'is-sorted')} onClick={() => cycle(c.key)}>
                      {c.title}
                      <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" className={cx('fly-table__arrow', dir === 'desc' && 'is-desc')}
                        fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M10 15V5M6 9l4-4 4 4" /></svg>
                    </button>
                  ) : c.title}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? Array.from({ length: loadingRows }, (_, i) => (
            <tr key={'sk' + i} className="fly-table__skel">
              {Array.from({ length: cols }, (_, j) => <td key={j} className={j === 0 && selectable ? 'fly-table__sel is-fixed-start' : undefined}><Skeleton width={j === 0 && selectable ? 16 : (60 + ((i * 7 + j * 13) % 35)) + '%'} /></td>)}
            </tr>
          )) : view.length === 0 ? (
            <tr><td colSpan={cols} className="fly-table__empty">{empty ?? <EmptyState compact title="暂无数据" />}</td></tr>
          ) : view.map(r => {
            const k = String(r[rowKey]);
            const on = sel.includes(k);
            return (
              <tr key={k} className={cx(on && 'is-selected', onRowClick && 'is-clickable')} aria-selected={selectable ? on : undefined}
                onClick={onRowClick ? (e) => { if (!(e.target as HTMLElement).closest('button, a, input, label')) onRowClick(r); } : undefined}>
                {selectable ? (
                  <td className="fly-table__sel is-fixed-start"><Checkbox aria-label="选择此行" checked={on} onChange={(c) => setSel(c ? [...sel, k] : sel.filter(x => x !== k))} /></td>
                ) : null}
                {columns.map(c => (
                  <td key={c.key} style={pin[c.key]} className={cx(align(c.align), c.mono && 'is-mono', c.wrap && 'is-wrap', c.fixed && 'is-fixed-' + c.fixed, edgeOf(c.key))}>{c.render ? c.render(r) : r[c.key]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Dialog ---------- */
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Buttons, right-aligned: cancel first, the confirming action last. */
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Close when the scrim is clicked; default true. Turn off when the dialog holds unsaved input. */
  dismissible?: boolean;
}
/** A modal panel for a short task or a confirmation that must be answered before going on. */
export function Dialog({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const auto = React.useId();
  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // First focus: the first field in the body, else the first footer button (取消), never the close icon.
      const first = d.querySelector<HTMLElement>('.fly-dialog__body input, .fly-dialog__body textarea, .fly-dialog__body select, .fly-dialog__body button, .fly-dialog__foot button');
      (first || d.querySelector<HTMLElement>('.fly-dialog__panel'))?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className={cx('fly-dialog', 'fly-dialog--' + size)} aria-labelledby={'fly-dlg-' + auto} aria-describedby={description ? 'fly-dlgd-' + auto : undefined}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (dismissible && e.target === ref.current) onClose(); }}>
      <div className="fly-dialog__panel" tabIndex={-1}>
        <header className="fly-dialog__head">
          <h2 className="fly-dialog__title" id={'fly-dlg-' + auto}>{title}</h2>
          <button type="button" className="fly-btn fly-btn--plain fly-btn--sm fly-btn--icon" aria-label="关闭" onClick={onClose}><span className="fly-btn__icon"><Ico d={CLOSE} /></span></button>
        </header>
        {description ? <p className="fly-dialog__desc" id={'fly-dlgd-' + auto}>{description}</p> : null}
        {children ? <div className="fly-dialog__body">{children}</div> : null}
        {footer ? <footer className="fly-dialog__foot">{footer}</footer> : null}
      </div>
    </dialog>
  );
}

/* ---------- Toast ---------- */
export interface ToastOptions {
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  /** One undo-style action, e.g. { label: '撤销', onClick }. */
  action?: { label: string; onClick: () => void };
  /** ms before it hides; 0 keeps it until closed. Default 4000, 6000 with an action. */
  duration?: number;
}
interface ToastItem extends ToastOptions { id: number; message: string; leaving?: boolean }
let toastSeq = 0;
let toastItems: ToastItem[] = [];
const toastSubs = new Set<(t: ToastItem[]) => void>();
const toastEmit = () => toastSubs.forEach(f => f(toastItems));
function dismissToast(id: number) {
  toastItems = toastItems.map(t => (t.id === id ? { ...t, leaving: true } : t)); toastEmit();
  setTimeout(() => { toastItems = toastItems.filter(t => t.id !== id); toastEmit(); }, 200);
}
/** Show a brief, non-blocking confirmation. Needs one <Toaster /> mounted in the app. Returns a function that hides it. */
export function toast(message: string, opts: ToastOptions = {}) {
  const id = ++toastSeq;
  toastItems = [...toastItems.slice(-2), { id, message, ...opts }];
  toastEmit();
  const ms = opts.duration ?? (opts.action ? 6000 : 4000);
  if (ms > 0) setTimeout(() => dismissToast(id), ms);
  return () => dismissToast(id);
}
export interface ToasterProps { position?: 'bottom' | 'top' }
/** The single place toasts appear; mount once near the app root. */
export function Toaster({ position = 'bottom' }: ToasterProps) {
  const [items, setItems] = React.useState<ToastItem[]>(toastItems);
  React.useEffect(() => { toastSubs.add(setItems); return () => { toastSubs.delete(setItems); }; }, []);
  const icon: Record<string, string> = { success: CHECK, warning: ALERT, danger: ALERT };
  return (
    <div className={cx('fly-toaster', 'fly-toaster--' + position)} role="region" aria-label="通知">
      {items.map(t => (
        <div key={t.id} className={cx('fly-toast', 'fly-toast--' + (t.tone || 'neutral'), t.leaving && 'is-leaving')}
          role={t.tone === 'danger' ? 'alert' : 'status'}>
          {t.tone && t.tone !== 'neutral' ? <span className="fly-toast__icon"><Ico d={icon[t.tone]} /></span> : null}
          <span className="fly-toast__msg">{t.message}</span>
          {t.action ? <button type="button" className="fly-toast__action" onClick={() => { t.action!.onClick(); dismissToast(t.id); }}>{t.action.label}</button> : null}
          <button type="button" className="fly-toast__close" aria-label="关闭通知" onClick={() => dismissToast(t.id)}><Ico d={CLOSE} /></button>
        </div>
      ))}
    </div>
  );
}

/* ---------- Sidebar ---------- */
export interface SidebarItem { id: string; label: string; icon?: React.ReactNode; badge?: number | string; href?: string }
export interface SidebarSection { title?: string; items: SidebarItem[] }
export interface SidebarProps {
  sections: SidebarSection[];
  value?: string;
  onChange?: (id: string) => void;
  /** Product name or workspace switcher at the top. */
  header?: React.ReactNode;
  /** Account, settings at the bottom. */
  footer?: React.ReactNode;
  collapsed?: boolean;
  /** Shows a collapse / expand button at the top right of the sidebar. */
  onCollapsedChange?: (collapsed: boolean) => void;
  'aria-label'?: string;
}
const PANEL = 'M3.5 4.5h13v11h-13zM8 4.5v11';
/** The fixed left navigation of an admin app or workbench. Opaque, never glass. */
export function Sidebar({ sections, value, onChange, header, footer, collapsed, onCollapsedChange, ...aria }: SidebarProps) {
  const toggle = onCollapsedChange ? (
    <button type="button" className="fly-btn fly-btn--plain fly-btn--sm fly-btn--icon fly-sidebar__toggle" aria-expanded={!collapsed}
      aria-label={collapsed ? '展开侧栏' : '收起侧栏'} title={collapsed ? '展开侧栏' : '收起侧栏'} onClick={() => onCollapsedChange(!collapsed)}>
      <span className="fly-btn__icon" aria-hidden="true"><Ico d={PANEL} /></span>
    </button>
  ) : null;
  return (
    <nav className={cx('fly-sidebar', collapsed && 'is-collapsed')} aria-label={aria['aria-label'] || '主导航'}>
      {header || toggle ? (
        <div className="fly-sidebar__head">
          {header && !(collapsed && toggle) ? <div className="fly-sidebar__brand">{header}</div> : null}
          {toggle}
        </div>
      ) : null}
      <div className="fly-sidebar__scroll">
        {sections.map((sec, i) => (
          <div className="fly-sidebar__section" key={i}>
            {sec.title ? <p className="fly-sidebar__title">{sec.title}</p> : null}
            <ul>
              {sec.items.map(it => {
                const on = it.id === value;
                const inner = (
                  <>
                    {it.icon ? <span className="fly-sidebar__icon" aria-hidden="true">{it.icon}</span> : null}
                    <span className="fly-sidebar__label">{it.label}</span>
                    {it.badge !== undefined ? <span className="fly-sidebar__badge">{it.badge}</span> : null}
                  </>
                );
                const props = { className: cx('fly-sidebar__item', on && 'is-current'), 'aria-current': on ? ('page' as const) : undefined,
                  title: collapsed ? it.label : undefined, onClick: (e: React.MouseEvent) => { if (onChange) { if (!it.href) e.preventDefault(); onChange(it.id); } } };
                return <li key={it.id}>{it.href ? <a href={it.href} {...props}>{inner}</a> : <button type="button" {...props}>{inner}</button>}</li>;
              })}
            </ul>
          </div>
        ))}
      </div>
      {footer ? <div className="fly-sidebar__foot">{footer}</div> : null}
    </nav>
  );
}

/* ---------- Menu ---------- */
export type MenuEntry =
  | { id: string; label: string; icon?: React.ReactNode; shortcut?: string; danger?: boolean; disabled?: boolean }
  | { type: 'separator' }
  | { type: 'group'; title: string };
export interface MenuProps {
  items: MenuEntry[];
  onSelect: (id: string) => void;
  /** Trigger text. Leave out for an icon-only "更多" button (then `aria-label` is required). */
  label?: string;
  icon?: React.ReactNode;
  variant?: 'secondary' | 'plain';
  size?: 'sm' | 'md';
  /** Which edge of the trigger the menu lines up with. */
  align?: 'start' | 'end';
  disabled?: boolean;
  'aria-label'?: string;
}
const MORE = 'M5 10h.01M10 10h.01M15 10h.01';
/** A short list of actions behind one button — row actions, "更多", overflow from a toolbar. */
export function Menu({ items, onSelect, label, icon, variant = 'plain', size = 'sm', align = 'end', disabled, ...aria }: MenuProps) {
  const auto = React.useId();
  const id = 'fly-menu-' + auto;
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const list = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(root, open, close);
  const place = usePlacement(trigger, list, open, align);
  const actions = items.map((it, i) => ('id' in it && !it.disabled ? i : -1)).filter(i => i >= 0);
  React.useEffect(() => { if (open) list.current?.focus({ preventScroll: true }); }, [open]);
  const openAt = (where: 'first' | 'last') => {
    if (disabled) return;
    setActive(where === 'first' ? actions[0] ?? -1 : actions[actions.length - 1] ?? -1);
    setOpen(true);
  };
  const finish = (focusBack = true) => { setOpen(false); if (focusBack) trigger.current?.focus(); };
  const choose = (i: number) => {
    const it = items[i];
    if (!it || !('id' in it) || it.disabled) return;
    finish();
    onSelect(it.id);
  };
  const move = (d: number) => {
    const pos = actions.indexOf(active);
    const n = actions[(pos + d + actions.length) % actions.length];
    if (n !== undefined) setActive(n);
  };
  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt('first'); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); openAt('last'); }
  };
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(actions[0]); }
    else if (e.key === 'End') { e.preventDefault(); setActive(actions[actions.length - 1]); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape') { e.preventDefault(); finish(); }
    else if (e.key === 'Tab') { finish(false); }
    else if (e.key.length === 1) {
      const k = e.key.toLowerCase();
      const pos = actions.indexOf(active);
      const order = actions.slice(pos + 1).concat(actions.slice(0, pos + 1));
      const hit = order.find(i => (items[i] as { label: string }).label.toLowerCase().startsWith(k));
      if (hit !== undefined) setActive(hit);
    }
  };
  return (
    <div className="fly-menu" ref={root}>
      <button ref={trigger} type="button" disabled={disabled} id={id + '-btn'}
        className={cx('fly-btn', 'fly-btn--' + variant, 'fly-btn--' + size, !label && 'fly-btn--icon', open && 'is-open')}
        aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={label ? undefined : aria['aria-label'] || '更多操作'}
        onClick={() => (open ? finish(false) : openAt('first'))} onKeyDown={onTriggerKey}>
        {icon || !label ? <span className="fly-btn__icon" aria-hidden="true">{icon || <Ico d={MORE} />}</span> : null}
        {label}
        {label ? <span className="fly-menu__chevron" aria-hidden="true"><Ico d={CHEVRON} /></span> : null}
      </button>
      {open ? (
        <div ref={list} id={id} role="menu" tabIndex={-1} style={place.style} aria-labelledby={id + '-btn'}
          aria-activedescendant={active >= 0 ? id + '-i' + active : undefined} onKeyDown={onListKey}
          className={cx('fly-popover', 'fly-menu__list', 'fly-menu__list--' + align, place.above && 'fly-popover--above')}>
          {items.map((it, i) => {
            if ('type' in it && it.type === 'separator') return <div key={'s' + i} role="separator" className="fly-menu__sep" />;
            if ('type' in it && it.type === 'group') return <div key={'g' + i} role="presentation" className="fly-menu__group">{it.title}</div>;
            const m = it as Extract<MenuEntry, { id: string }>;
            return (
              <div key={m.id} id={id + '-i' + i} role="menuitem" aria-disabled={m.disabled || undefined}
                className={cx('fly-menu__item', i === active && 'is-active', m.danger && 'is-danger', m.disabled && 'is-disabled')}
                onMouseEnter={() => !m.disabled && setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)}>
                <span className="fly-menu__icon" aria-hidden="true">{m.icon}</span>
                <span className="fly-menu__label">{m.label}</span>
                {m.shortcut ? <kbd className="fly-menu__kbd">{m.shortcut}</kbd> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Pagination ---------- */
export interface PaginationProps {
  /** Current page, starting at 1. */
  page: number;
  onChange: (page: number) => void;
  /** Total number of records. */
  total: number;
  pageSize?: number;
  /** Offer a page-size picker with these sizes, e.g. [20, 50, 100]. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** simple = ‹ 3 / 20 › for narrow spaces. */
  variant?: 'full' | 'simple';
  /** Hide the "共 N 条" summary. */
  hideTotal?: boolean;
}
/** Builds the page list: 1 … 4 5 6 … 20, always 7 slots once there are more than 7 pages. */
function pageList(page: number, count: number): Array<number | 'gap'> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'gap', count];
  if (page >= count - 3) return [1, 'gap', count - 4, count - 3, count - 2, count - 1, count];
  return [1, 'gap', page - 1, page, page + 1, 'gap', count];
}
const PREV = 'M12.5 4.5 7 10l5.5 5.5';
const NEXT = 'M7.5 4.5 13 10l-5.5 5.5';
/** Moves through pages of a long list; sits below the Table it controls. */
export function Pagination({ page, onChange, total, pageSize = 20, pageSizeOptions, onPageSizeChange, variant = 'full', hideTotal }: PaginationProps) {
  const count = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(Math.max(1, page), count);
  const go = (p: number) => { const n = Math.min(Math.max(1, p), count); if (n !== cur) onChange(n); };
  const from = total === 0 ? 0 : (cur - 1) * pageSize + 1;
  const to = Math.min(total, cur * pageSize);
  const arrow = (d: number, lab: string, path: string) => (
    <button type="button" className="fly-page__btn fly-page__arrow" aria-label={lab} disabled={d < 0 ? cur <= 1 : cur >= count} onClick={() => go(cur + d)}><Ico d={path} /></button>
  );
  return (
    <nav className={cx('fly-page', 'fly-page--' + variant)} aria-label="分页">
      {!hideTotal ? <span className="fly-page__total">{total === 0 ? '共 0 条' : '第 ' + from + '–' + to + ' 条，共 ' + total + ' 条'}</span> : null}
      <div className="fly-page__pages">
        {arrow(-1, '上一页', PREV)}
        {variant === 'simple' ? (
          <span className="fly-page__simple" aria-live="polite"><b>{cur}</b> / {count}</span>
        ) : (
          <ul>
            {pageList(cur, count).map((p, i) => p === 'gap'
              ? <li key={'g' + i} className="fly-page__gap" aria-hidden="true">…</li>
              : <li key={p}><button type="button" className={cx('fly-page__btn', p === cur && 'is-current')} aria-current={p === cur ? 'page' : undefined}
                  aria-label={'第 ' + p + ' 页'} onClick={() => go(p)}>{p}</button></li>)}
          </ul>
        )}
        {arrow(1, '下一页', NEXT)}
      </div>
      {pageSizeOptions && onPageSizeChange ? (
        <div className="fly-page__size">
          <Select size="sm" aria-label="每页条数" value={String(pageSize)} onChange={(v) => onPageSizeChange(Number(v))}
            options={pageSizeOptions.map(n => ({ value: String(n), label: n + ' 条/页' }))} />
        </div>
      ) : null}
    </nav>
  );
}

/* ---------- AppShell ---------- */
export interface AppShellProps {
  /** Usually a <Sidebar onCollapsedChange …/>. Its divider and fill are dropped: it sits on the frame. */
  sidebar?: React.ReactNode;
  /** Usually a <Toolbar />, laid on the frame above the panel without its glass or bottom line. */
  toolbar?: React.ReactNode;
  /** Page content, placed in the rounded content panel, which scrolls on its own. */
  children?: React.ReactNode;
  /** Remove the panel's inner padding, for content that runs edge to edge (a full-bleed table or map). */
  flush?: boolean;
  /** Height of the whole shell; default fills the viewport (100vh). */
  height?: number | string;
}
/** The frame of an admin app: sidebar and toolbar on the frame colour with no dividers, content in one rounded panel. */
export function AppShell({ sidebar, toolbar, children, flush, height }: AppShellProps) {
  return (
    <div className="fly-shell" style={height !== undefined ? { height } : undefined}>
      {sidebar ? <div className="fly-shell__side">{sidebar}</div> : null}
      <div className="fly-shell__main">
        {toolbar ? <div className="fly-shell__bar">{toolbar}</div> : null}
        <main className={cx('fly-shell__panel', flush && 'is-flush')}>{children}</main>
      </div>
    </div>
  );
}

/* ---------- Drawer ---------- */
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** One line under the title: who, what, when. */
  description?: string;
  children?: React.ReactNode;
  /** Buttons, pinned to the bottom: cancel first, the main action last. */
  footer?: React.ReactNode;
  /** Controls at the top right, before the close button (a Menu, a "在新页打开" button). */
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Close when the scrim is clicked; default true. Turn off while it holds unsaved input. */
  dismissible?: boolean;
}
/** A panel that slides in from the right to show or edit one record without leaving the list. */
export function Drawer({ open, onClose, title, description, children, footer, actions, size = 'md', dismissible = true }: DrawerProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const auto = React.useId();
  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.querySelector<HTMLElement>('.fly-drawer__panel')?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className={cx('fly-drawer', 'fly-drawer--' + size)} aria-labelledby={'fly-dwr-' + auto} aria-describedby={description ? 'fly-dwrd-' + auto : undefined}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (dismissible && e.target === ref.current) onClose(); }}>
      <div className="fly-drawer__panel" tabIndex={-1}>
        <header className="fly-drawer__head">
          <div className="fly-drawer__titles">
            <h2 className="fly-drawer__title" id={'fly-dwr-' + auto}>{title}</h2>
            {description ? <p className="fly-drawer__desc" id={'fly-dwrd-' + auto}>{description}</p> : null}
          </div>
          <div className="fly-drawer__actions">
            {actions}
            <button type="button" className="fly-btn fly-btn--plain fly-btn--sm fly-btn--icon" aria-label="关闭" onClick={onClose}><span className="fly-btn__icon"><Ico d={CLOSE} /></span></button>
          </div>
        </header>
        <div className="fly-drawer__body">{children}</div>
        {footer ? <footer className="fly-drawer__foot">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
