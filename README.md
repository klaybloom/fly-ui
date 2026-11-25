# Fly UI

A quiet, content-first React component library for admin systems, workbenches, internal tools and dashboards, with the Fly UI design tokens.

The components are built for admin products (app shell, sidebar, filter bars, tables, drawers). For blogs, portfolios and landing pages use only the tokens — `@klaybloom/fly-ui/tokens.css` — and write the site's own components; the Fly UI skill describes both. It follows Apple's interface principles — clear hierarchy, restrained controls, glass only on the control layer, motion only to explain a change — without imitating macOS.

Design rules and the full brand book live in the [Fly UI skill](https://github.com/klaybloom/apple-web-design-skill/tree/fly-ui).

## Install

```bash
npm install @klaybloom/fly-ui
```

React 18 or newer is a peer dependency.

## Use

```tsx
import '@klaybloom/fly-ui/styles.css';
import { AppShell, Sidebar, Toolbar, Button, Card, Table, Drawer, Toaster, toast } from '@klaybloom/fly-ui';

export function App() {
  return (
    <>
      <AppShell
        sidebar={<Sidebar value="tickets" onChange={go} onCollapsedChange={setCollapsed} collapsed={collapsed}
          header="Fly 客服" sections={[{ items: [{ id: 'tickets', label: '工单', badge: 17 }] }]} />}
        toolbar={<Toolbar title="工单" trailing={<Button variant="primary" size="sm">新建工单</Button>} />}
      >
        <Card title="列表">…</Card>
      </AppShell>
      <Toaster />
    </>
  );
}
```

Switch themes with `data-theme="light"` or `data-theme="dark"` on `<html>`.

### Stylesheets

| Import | What it holds |
| --- | --- |
| `@klaybloom/fly-ui/styles.css` | Everything below in one file — the usual choice |
| `@klaybloom/fly-ui/tokens.css` | Colour, type, spacing, radius, shadow and motion tokens as CSS custom properties, light and dark |
| `@klaybloom/fly-ui/base.css` | Optional page defaults (system font, page background, text colour) |
| `@klaybloom/fly-ui/components.css` | Component styles; reads tokens only |
| `@klaybloom/fly-ui/tokens.json` | The same tokens as data, each with a usage note |

## Components

| Group | Components |
| --- | --- |
| Frame & navigation | `AppShell`, `Sidebar`, `Toolbar`, `Tabs` |
| Actions | `Button` (with `loading`), `Menu` |
| Inputs | `TextField`, `Select`, `Checkbox`, `SegmentedControl`, `Switch` |
| Content & data | `Card`, `Table` (sorting, selection, fixed columns, fixed height), `Pagination`, `Badge` |
| Feedback | `EmptyState`, `Spinner`, `Skeleton`, `Toaster` + `toast()` |
| Overlays | `Drawer`, `Dialog` |

Every component is typed; props are documented in `dist/index.d.ts`.

## Principles in brief

- Three layers: background, opaque content (cards, tables, forms), and the control layer — the only one that may use glass.
- Graphite accent, used for “on / checked / primary”; “where you are” markers (current sidebar item, current page) use a neutral fill.
- Labels sit beside fields; fields are drawn with a soft ring, not a hard border, and fall back to a solid 3:1 border under `prefers-contrast: more`.
- Tables keep one line per row, scroll sideways with fixed key columns, and scroll inside a fixed height with the header and pagination in place.
- Motion animates only `transform` and `opacity`, and respects `prefers-reduced-motion` and `prefers-reduced-transparency`.

## Develop

```bash
npm install
npm run typecheck
npm test        # builds dist/ and server-renders every component
```

Publishing: push a `v*` tag; the workflow publishes with npm trusted publishing.

## License

MIT
