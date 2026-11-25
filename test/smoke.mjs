// Server-renders every component from the built ESM and CJS bundles; fails on a missing export or a render error.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToString } from 'react-dom/server';
import * as esm from '../dist/index.js';

const cjs = createRequire(import.meta.url)('../dist/index.cjs');
const names = ['Button', 'TextField', 'Select', 'Checkbox', 'SegmentedControl', 'Switch', 'Tabs', 'Badge', 'Card', 'Table',
  'EmptyState', 'Spinner', 'Skeleton', 'Dialog', 'Drawer', 'Toaster', 'Menu', 'Pagination', 'Toolbar', 'Sidebar', 'AppShell', 'toast'];
for (const n of names) {
  assert.equal(typeof esm[n], 'function', `ESM export ${n}`);
  assert.equal(typeof cjs[n], 'function', `CJS export ${n}`);
}
const h = React.createElement, F = esm;
const html = renderToString(h(F.AppShell, {
  sidebar: h(F.Sidebar, { value: 'a', onCollapsedChange() {}, sections: [{ items: [{ id: 'a', label: '工单', badge: 3 }] }] }),
  toolbar: h(F.Toolbar, { title: '工单', trailing: h(F.Button, { variant: 'primary', loading: true }, '保存') }) },
  h(F.Card, { title: '列表' },
    h(F.TextField, { label: '搜索', size: 'sm' }),
    h(F.Select, { label: '状态', options: [{ value: 'a', label: '全部' }], defaultValue: 'a' }),
    h(F.Checkbox, { label: '只看我的', indeterminate: true }),
    h(F.SegmentedControl, { options: [{ value: 'd', label: '今日' }, { value: 'w', label: '本周' }] }),
    h(F.Switch, { label: '自动刷新' }),
    h(F.Tabs, { items: [{ value: 'a', label: '概览', content: 'x' }] }),
    h(F.Badge, { tone: 'success' }, '已完成'),
    h(F.Table, { columns: [{ key: 'id', title: '工单号', fixed: 'start', mono: true }, { key: 'n', title: '客户', sortable: true }], rows: [{ id: 'FL-1', n: '王' }], selectable: true, height: 200 }),
    h(F.Table, { columns: [{ key: 'id', title: 'ID' }], rows: [], loading: true, loadingRows: 2 }),
    h(F.EmptyState, { title: '暂无数据' }), h(F.Spinner), h(F.Skeleton, { lines: 2 }),
    h(F.Menu, { items: [{ id: 'a', label: '复制' }], onSelect() {} }),
    h(F.Pagination, { page: 2, total: 120, onChange() {} }),
    h(F.Dialog, { open: false, onClose() {}, title: '确认' }),
    h(F.Drawer, { open: false, onClose() {}, title: '详情' }),
    h(F.Toaster))));
for (const cls of ['fly-shell', 'fly-sidebar', 'fly-toolbar', 'fly-table', 'fly-page', 'fly-drawer', 'fly-dialog', 'fly-toaster']) assert.ok(html.includes(cls), cls);
for (const f of ['styles.css', 'tokens.css', 'components.css', 'base.css', 'tokens.json', 'index.d.ts']) assert.ok((await import('node:fs')).existsSync(new URL('../dist/' + f, import.meta.url)), f);
console.log('smoke ok:', names.length, 'exports, SSR', html.length, 'chars');
