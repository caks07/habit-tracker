import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  HistoryEntry,
  LinkedViewConfig,
  PageInfo,
  Section,
  SourceTable,
  TableProperty,
  TableRecord,
} from './types';
import {
  createDefaultSections,
  createDefaultSourceTables,
  seedHistory,
  seedPage,
} from './lib/seed';
import { getTodayDateStr, weekInfo } from './lib/date';
import { uid } from './lib/util';
import { computeHabitStreak, parseHabitDays } from './lib/normalization';

export type View =
  | { name: 'dashboard' }
  | { name: 'today' }
  | { name: 'this-week' }
  | { name: 'source-table'; tableId: string }
  | { name: 'history'; weekKey?: string; snapshotId?: string }
  | { name: 'settings' };

export interface ConfirmRequest {
  title: string;
  body?: string;
  points?: string[];
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

interface State {
  page: PageInfo;
  tables: Record<string, SourceTable>;
  sections: Section[];
  history: HistoryEntry[];
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;

  // UI state (tidak disimpan di localStorage)
  view: View;
  query: string;
  confirm: ConfirmRequest | null;
  toast: string | null;
  exportOpen: { weekKey?: string } | null;
  addOpen: boolean;

  // Page / Workspace Actions
  setPage: (p: Partial<PageInfo>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (t: 'dark' | 'light') => void;
  setView: (v: View) => void;
  setQuery: (q: string) => void;
  ask: (c: ConfirmRequest | null) => void;
  notify: (msg: string) => void;
  openExport: (o: { weekKey?: string } | null) => void;
  setAddOpen: (v: boolean) => void;
  resetDemo: () => void;

  // Source Table Actions
  addSourceTable: (name: string, description?: string) => string;
  updateSourceTable: (id: string, patch: Partial<SourceTable>) => void;
  removeSourceTable: (id: string) => void;
  addProperty: (tableId: string, property: TableProperty) => void;
  updateProperty: (tableId: string, propId: string, patch: Partial<TableProperty>) => void;
  removeProperty: (tableId: string, propId: string) => void;
  addRecord: (tableId: string, values: Record<string, any>) => string;
  updateRecord: (tableId: string, recordId: string, values: Partial<Record<string, any>>) => void;
  removeRecord: (tableId: string, recordId: string) => void;

  // Dashboard Section / Block Actions
  addSection: (section: Section) => void;
  updateSection: (id: string, patch: Partial<Section>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (from: number, to: number) => void;
  updateLinkedConfig: (sectionId: string, patch: Partial<LinkedViewConfig>) => void;
  updateBlockLayout: (id: string, layoutPatch: Partial<import('./types').BlockLayout>) => void;
  updateBlockConfig: (id: string, configPatch: Partial<Record<string, any>>) => void;
  linkRecord: (tableId: string, recordId: string, fieldKey: string, targetRecordId: string) => void;
  unlinkRecord: (tableId: string, recordId: string, fieldKey: string, targetRecordId: string) => void;

  // Weekly Cycle & Archive Actions
  restartWeek: () => void;
  restartSection: (sectionId: string) => void;
}

let toastTimer: number | undefined;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      page: seedPage,
      tables: createDefaultSourceTables(),
      sections: createDefaultSections(),
      history: seedHistory(),
      theme: 'dark',
      sidebarCollapsed: false,

      view: { name: 'dashboard' },
      query: '',
      confirm: null,
      toast: null,
      exportOpen: null,
      addOpen: false,

      setPage: (p) => set((s) => ({ page: { ...s.page, ...p } })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setTheme: (theme) => set({ theme }),
      setView: (view) => set({ view }),
      setQuery: (query) => set({ query }),
      ask: (confirm) => set({ confirm }),
      notify: (toast) => {
        set({ toast });
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => set({ toast: null }), 2800);
      },
      openExport: (exportOpen) => set({ exportOpen }),
      setAddOpen: (addOpen) => set({ addOpen }),

      resetDemo: () => {
        set({
          page: seedPage,
          tables: createDefaultSourceTables(),
          sections: createDefaultSections(),
          history: seedHistory(),
          view: { name: 'dashboard' },
        });
        get().notify('Demo planner di-reset ke data awal');
      },

      // ----------------------------------------------------------------------
      // SOURCE TABLE ACTIONS
      // ----------------------------------------------------------------------
      addSourceTable: (name, description) => {
        const id = uid();
        const newTable: SourceTable = {
          id,
          name,
          description: description || '',
          properties: [
            { id: uid(), key: 'title', name: 'Judul', type: 'title', width: 220 },
            { id: uid(), key: 'date', name: 'Tanggal', type: 'date', width: 110 },
            {
              id: uid(),
              key: 'status',
              name: 'Status',
              type: 'status',
              width: 110,
              options: [
                { id: 'opt-1', label: 'Todo', color: 'gray' },
                { id: 'opt-2', label: 'Done', color: 'green' },
              ],
            },
          ],
          records: [],
        };
        set((s) => ({ tables: { ...s.tables, [id]: newTable } }));
        get().notify(`Tabel "${name}" berhasil dibuat`);
        return id;
      },

      updateSourceTable: (id, patch) =>
        set((s) => {
          if (!s.tables[id]) return s;
          return {
            tables: {
              ...s.tables,
              [id]: { ...s.tables[id], ...patch },
            },
          };
        }),

      removeSourceTable: (id) =>
        set((s) => {
          const next = { ...s.tables };
          delete next[id];
          return {
            tables: next,
            // Juga bersihkan linked views yang menunjuk ke tabel ini
            sections: s.sections.filter((sec) => sec.linkedConfig?.sourceTableId !== id),
          };
        }),

      addProperty: (tableId, property) =>
        set((s) => {
          const table = s.tables[tableId];
          if (!table) return s;
          return {
            tables: {
              ...s.tables,
              [tableId]: {
                ...table,
                properties: [...table.properties, property],
              },
            },
          };
        }),

      updateProperty: (tableId, propId, patch) =>
        set((s) => {
          const table = s.tables[tableId];
          if (!table) return s;
          return {
            tables: {
              ...s.tables,
              [tableId]: {
                ...table,
                properties: table.properties.map((p) => (p.id === propId ? { ...p, ...patch } : p)),
              },
            },
          };
        }),

      removeProperty: (tableId, propId) =>
        set((s) => {
          const table = s.tables[tableId];
          if (!table) return s;
          return {
            tables: {
              ...s.tables,
              [tableId]: {
                ...table,
                properties: table.properties.filter((p) => p.id !== propId),
              },
            },
          };
        }),

      addRecord: (tableId, values) => {
        const id = uid();
        const today = getTodayDateStr();
        const record: TableRecord = {
          id,
          values: { ...values },
          createdAt: today,
          updatedAt: today,
        };

        set((s) => {
          const table = s.tables[tableId];
          if (!table) return s;
          return {
            tables: {
              ...s.tables,
              [tableId]: {
                ...table,
                records: [record, ...table.records],
              },
            },
          };
        });
        return id;
      },

      updateRecord: (tableId, recordId, values) =>
        set((s) => {
          const table = s.tables[tableId];
          if (!table) return s;
          const today = getTodayDateStr();
          return {
            tables: {
              ...s.tables,
              [tableId]: {
                ...table,
                records: table.records.map((r) =>
                  r.id === recordId
                    ? { ...r, values: { ...r.values, ...values }, updatedAt: today }
                    : r
                ),
              },
            },
          };
        }),

      removeRecord: (tableId, recordId) =>
        set((s) => {
          const table = s.tables[tableId];
          if (!table) return s;
          return {
            tables: {
              ...s.tables,
              [tableId]: {
                ...table,
                records: table.records.filter((r) => r.id !== recordId),
              },
            },
          };
        }),

      // ----------------------------------------------------------------------
      // DASHBOARD SECTION ACTIONS
      // ----------------------------------------------------------------------
      addSection: (section) =>
        set((s) => ({
          sections: [...s.sections, section],
          addOpen: false,
        })),

      updateSection: (id, patch) =>
        set((s) => ({
          sections: s.sections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
        })),

      removeSection: (id) =>
        set((s) => {
          const target = s.sections.find((sec) => sec.id === id);
          const next = s.sections.filter((sec) => sec.id !== id);
          if (target?.type === 'linked-view') {
            get().notify(`Linked View "${target.title}" dihapus. Data Source Table tetap aman.`);
          } else {
            get().notify('Section dihapus');
          }
          return { sections: next };
        }),

      duplicateSection: (id) =>
        set((s) => {
          const idx = s.sections.findIndex((sec) => sec.id === id);
          if (idx < 0) return s;
          const original = s.sections[idx];
          const cloned: Section = {
            ...JSON.parse(JSON.stringify(original)),
            id: uid(),
            title: `${original.title} (Salinan)`,
          };
          if (cloned.linkedConfig) {
            cloned.linkedConfig.id = uid();
            cloned.linkedConfig.title = `${original.title} (Salinan)`;
          }
          const next = [...s.sections];
          next.splice(idx + 1, 0, cloned);
          return { sections: next };
        }),

      moveSection: (from, to) =>
        set((s) => {
          if (to < 0 || to >= s.sections.length) return s;
          const next = [...s.sections];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { sections: next };
        }),

      updateLinkedConfig: (sectionId, patch) =>
        set((s) => ({
          sections: s.sections.map((sec) => {
            if (sec.id !== sectionId || !sec.linkedConfig) return sec;
            const updatedConfig = { ...sec.linkedConfig, ...patch };
            return {
              ...sec,
              title: patch.title !== undefined ? patch.title : sec.title,
              span: patch.span !== undefined ? patch.span : sec.span,
              linkedConfig: updatedConfig,
            };
          }),
        })),

      updateBlockLayout: (id, layoutPatch) =>
        set((s) => ({
          sections: s.sections.map((sec) => {
            if (sec.id !== id) return sec;
            const currentLayout = sec.layout || { x: 0, y: 0, w: sec.span || 12, h: 4 };
            const nextLayout = { ...currentLayout, ...layoutPatch };
            return {
              ...sec,
              span: nextLayout.w,
              layout: nextLayout,
            };
          }),
        })),

      updateBlockConfig: (id, configPatch) =>
        set((s) => ({
          sections: s.sections.map((sec) => {
            if (sec.id !== id) return sec;
            return {
              ...sec,
              config: { ...(sec.config || sec.meta || {}), ...configPatch },
              meta: { ...(sec.meta || {}), ...configPatch },
            };
          }),
        })),

      linkRecord: (tableId, recordId, fieldKey, targetRecordId) =>
        set((s) => {
          const tbl = s.tables[tableId];
          if (!tbl) return s;
          return {
            tables: {
              ...s.tables,
              [tableId]: {
                ...tbl,
                records: tbl.records.map((r) => {
                  if (r.id !== recordId) return r;
                  const currentVal = r.values[fieldKey];
                  let nextVal: any;
                  if (Array.isArray(currentVal)) {
                    nextVal = currentVal.includes(targetRecordId) ? currentVal : [...currentVal, targetRecordId];
                  } else {
                    nextVal = [targetRecordId];
                  }
                  return {
                    ...r,
                    values: { ...r.values, [fieldKey]: nextVal },
                    updatedAt: getTodayDateStr(),
                  };
                }),
              },
            },
          };
        }),

      unlinkRecord: (tableId, recordId, fieldKey, targetRecordId) =>
        set((s) => {
          const tbl = s.tables[tableId];
          if (!tbl) return s;
          return {
            tables: {
              ...s.tables,
              [tableId]: {
                ...tbl,
                records: tbl.records.map((r) => {
                  if (r.id !== recordId) return r;
                  const currentVal = r.values[fieldKey];
                  let nextVal: any;
                  if (Array.isArray(currentVal)) {
                    nextVal = currentVal.filter((id: string) => id !== targetRecordId);
                  } else if (currentVal === targetRecordId) {
                    nextVal = null;
                  } else {
                    nextVal = currentVal;
                  }
                  return {
                    ...r,
                    values: { ...r.values, [fieldKey]: nextVal },
                    updatedAt: getTodayDateStr(),
                  };
                }),
              },
            },
          };
        }),

      // ----------------------------------------------------------------------
      // RESTART & WEEKLY CYCLE (Archive to History, reset weekly ticks)
      // ----------------------------------------------------------------------
      restartWeek: () => {
        const { tables, sections, history } = get();
        const w = weekInfo();
        const batchId = uid();
        const archivedAt = new Date().toISOString();

        // Calculate metrics
        const habitsTable = tables['habits'];
        let habitsCompleted = 0;
        let habitsTotal = 0;
        if (habitsTable) {
          habitsTable.records.forEach((r) => {
            const days: number[] = Array.isArray(r.values.days) ? r.values.days : [];
            days.forEach((cell) => {
              if (cell === 1) habitsCompleted++;
              if (cell === 1 || cell === 2) habitsTotal++;
            });
          });
        }
        const habitsRate = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 80;

        const tasksTable = tables['tasks'];
        let tasksDone = 0;
        let totalTasks = 0;
        if (tasksTable) {
          totalTasks = tasksTable.records.length;
          tasksDone = tasksTable.records.filter((r) => r.values.status === 'Done').length;
        }

        const schTable = tables['schedule'];
        const scheduleEvents = schTable ? schTable.records.length : 0;

        // Create snapshot entry
        const entry: HistoryEntry = {
          id: uid(),
          batchId,
          weekKey: w.key,
          year: w.year,
          week: w.week,
          range: w.range,
          archivedAt,
          snapshotTables: JSON.parse(JSON.stringify(Object.values(tables))),
          snapshotSections: JSON.parse(JSON.stringify(sections)),
          metrics: {
            habitsRate,
            tasksDone,
            totalTasks,
            scheduleEvents,
          },
          reflectionText: 'Snapshot mingguan berhasil diarsipkan.',
        };

        // Reset weekly state on live tables without deleting records!
        const updatedTables = { ...tables };

        // 1. Reset habits days to [0,0,0,0,0,0,0] & increment streak for active ones
        if (updatedTables['habits']) {
          updatedTables['habits'] = {
            ...updatedTables['habits'],
            records: updatedTables['habits'].records.map((rec) => {
              const currentStreak = Number(rec.values.streak || 0);
              const days = Array.isArray(rec.values.days) ? rec.values.days : [];
              const finishedCount = days.filter((d: number) => d === 1).length;
              const nextStreak = finishedCount >= 3 ? currentStreak + 1 : currentStreak;
              return {
                ...rec,
                values: {
                  ...rec.values,
                  days: [0, 0, 0, 0, 0, 0, 0],
                  streak: nextStreak,
                },
              };
            }),
          };
        }

        // 2. Clear notes reflection draft if any
        const updatedSections = sections.map((sec) => {
          if (sec.type === 'note') {
            return {
              ...sec,
              meta: {
                ...sec.meta,
                text: 'Yang berjalan baik:\n\nYang perlu diperbaiki:\n\nFokus minggu ini:\n',
              },
            };
          }
          return sec;
        });

        set({
          history: [entry, ...history],
          tables: updatedTables,
          sections: updatedSections,
        });

        get().notify(`Minggu ${w.week} berhasil diarsipkan ke History & siklus baru dimulai!`);
      },

      restartSection: (sectionId) => {
        const { sections, tables, history } = get();
        const target = sections.find((s) => s.id === sectionId);
        if (!target) return;

        const w = weekInfo();
        const batchId = uid();
        const entry: HistoryEntry = {
          id: uid(),
          batchId,
          weekKey: w.key,
          year: w.year,
          week: w.week,
          range: w.range,
          archivedAt: new Date().toISOString(),
          snapshotTables: JSON.parse(JSON.stringify(Object.values(tables))),
          snapshotSections: [JSON.parse(JSON.stringify(target))],
          metrics: { habitsRate: 80, tasksDone: 5, totalTasks: 8, scheduleEvents: 10 },
          reflectionText: `Arsip restart untuk section "${target.title}"`,
        };

        // If it's linked to habits, clear habits days
        if (target.linkedConfig?.sourceTableId === 'habits' && tables['habits']) {
          const updatedHabits = {
            ...tables['habits'],
            records: tables['habits'].records.map((r) => ({
              ...r,
              values: { ...r.values, days: [0, 0, 0, 0, 0, 0, 0] },
            })),
          };
          set({
            tables: { ...tables, habits: updatedHabits },
            history: [entry, ...history],
          });
        } else {
          set({ history: [entry, ...history] });
        }

        get().notify(`Progress section "${target.title}" diarsipkan ke History`);
      },
    }),
    {
      name: 'scholar-planner-v4-notion-architecture',
      storage: createJSONStorage(() => ({
        getItem: (k) => localStorage.getItem(k),
        setItem: (k, v) => {
          try {
            localStorage.setItem(k, v);
          } catch {
            console.warn('Penyimpanan lokal penuh');
          }
        },
        removeItem: (k) => localStorage.removeItem(k),
      })),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const defaults = createDefaultSourceTables();
          if (!state.tables || !state.tables['activities']) {
            state.tables = { ...defaults, ...state.tables };
            state.sections = createDefaultSections();
          } else {
            // Sanitize and clean up any corrupted habit property (like accidental 'e') or corrupted days string
            if (state.tables['habits']) {
              const habitsTable = state.tables['habits'];
              // Remove stray 'e' property if present from testing
              const cleanProps = habitsTable.properties.filter(
                (p) => p.key !== 'e' && p.name !== 'e'
              );
              const cleanRecords = habitsTable.records.map((rec) => {
                const vals = { ...rec.values };
                if ('e' in vals) delete vals.e;
                const cleanDays = parseHabitDays(vals.days);
                vals.days = cleanDays;
                vals.streak = computeHabitStreak(cleanDays, vals.streak, vals.completions);
                return {
                  ...rec,
                  values: vals,
                };
              });
              state.tables['habits'] = {
                ...habitsTable,
                properties: cleanProps,
                records: cleanRecords,
              };
            }

            // Ensure backwards compatibility & migrate blocks to new multi-source architecture
            state.sections = (state.sections || []).map((sec, idx) => {
              const currentSpan = sec.layout?.w || sec.span || 12;
              const isTodoBoard =
                sec.id === 'sec-todo-board' ||
                sec.title?.toLowerCase().includes('to do list') ||
                sec.title?.toLowerCase().includes('todo list');

              let sourceDatabases = sec.sourceDatabases;
              let secType = sec.type;

              if (isTodoBoard) {
                secType = 'linked_multi_database';
                sourceDatabases = [
                  'tasks',
                  'activities',
                  'habits',
                  'entertainment',
                  'schedule',
                  'assignments',
                ];
              } else if (sec.linkedConfig?.sourceDatabases) {
                sourceDatabases = sec.linkedConfig.sourceDatabases;
              } else if (sec.sourceDatabaseId) {
                sourceDatabases = [sec.sourceDatabaseId];
              }

              return {
                ...sec,
                type: secType,
                dashboardId: sec.dashboardId || 'dashboard_main',
                sourceDatabaseId:
                  sec.sourceDatabaseId ||
                  sec.linkedConfig?.sourceTableId ||
                  (sec.type === 'source-table' ? sec.sourceTableId : null),
                sourceDatabases,
                layout: sec.layout || {
                  x: 0,
                  y: idx,
                  w: currentSpan,
                  h: 4,
                },
                span: currentSpan,
                config: sec.config || sec.meta || {},
              };
            });
          }
        }
      },
      partialize: (s) => ({
        page: s.page,
        tables: s.tables,
        sections: s.sections,
        history: s.history,
        theme: s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
);
