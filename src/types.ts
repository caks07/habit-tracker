// ============================================================================
// DOMAIN TYPES: SOURCE TABLES, LINKED VIEWS, AND MODULAR PERSONAL PLANNER
// ============================================================================

export type TagColor = 'green' | 'pink' | 'blue' | 'red' | 'brown' | 'purple' | 'orange' | 'gray';

// ----------------------------------------------------------------------------
// 1. PROPERTY SYSTEM (Reusable across Source Tables & Linked Views)
// ----------------------------------------------------------------------------
export type PropertyType =
  | 'title'
  | 'text'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'time'
  | 'date-time'
  | 'checkbox'
  | 'url'
  | 'image'
  | 'long-text'
  | 'relation'
  | 'formula'
  | 'created-at'
  | 'updated-at'
  | 'rating'
  | 'status';

export interface PropertyOption {
  id: string;
  label: string;
  color: TagColor;
}

export interface TableProperty {
  id: string;
  key: string;
  name: string;
  type: PropertyType;
  options?: PropertyOption[];
  width?: number;
  relationTableId?: string;
  required?: boolean;
  config?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// 2. RECORDS / ROWS
// ----------------------------------------------------------------------------
export interface TableRecord {
  id: string;
  values: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 3. SOURCE TABLE (Single Source of Truth)
// ----------------------------------------------------------------------------
export interface SourceTable {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  properties: TableProperty[];
  records: TableRecord[];
  isSystem?: boolean;
}

// ----------------------------------------------------------------------------
// 4. LINKED VIEW CONFIGURATION (View on top of a Source Table)
// ----------------------------------------------------------------------------
export type ViewType =
  | 'table'
  | 'board'
  | 'gallery'
  | 'list'
  | 'calendar'
  | 'timeline'
  | 'compact-list';

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'is_today'
  | 'is_this_week'
  | 'is_checked'
  | 'is_not_checked';

export interface FilterRule {
  id: string;
  property: string;
  operator: FilterOperator;
  value?: any;
}

export interface SortRule {
  property: string;
  direction: 'asc' | 'desc';
}

export interface LinkedViewConfig {
  id: string;
  title: string;
  sourceTableId?: string; // single source (backward-compatible)
  sourceTableIds?: string[]; // multi-source database IDs
  sourceDatabases?: string[]; // multi-source database IDs alias
  viewType: ViewType;
  filters: FilterRule[];
  sorts: SortRule[];
  groupBy?: string;
  visibleProperties?: string[];
  span: number; // 3..12 in 12-column grid
  limit?: number;
  activeSourceFilter?: string[]; // realtime source toggles
}

// ----------------------------------------------------------------------------
// 4b. NORMALIZED PRESENTATION ROW (Multi-Source View Pipeline)
// ----------------------------------------------------------------------------
export interface NormalizedRecordRow {
  /** Unique presentation ID in view (e.g. `${sourceDatabaseId}::${sourceRecordId}` or occurrence id) */
  id: string;
  /** Stable Source Database ID (e.g. 'tasks', 'activities', 'habits', 'schedule', 'entertainment', 'assignments') */
  sourceDatabaseId: string;
  /** Stable Source Record ID */
  sourceRecordId: string;
  sourceType: 'task' | 'activity' | 'habit' | 'schedule' | 'entertainment' | 'assignment' | 'goal' | 'note' | string;
  sourceLabel: string;

  // Common Presentation Properties:
  title: string;
  date?: string;             // YYYY-MM-DD
  day?: string;              // 'Senin', 'Selasa', 'Rabu', ...
  startTime?: string | null; // '06:00', '08:30', '19:00'
  endTime?: string | null;   // '07:00', '10:30', '21:00'
  timeDisplay?: string;      // '06:00 - 07:00' or '19:00'
  category?: string;
  status?: string;           // 'Not started' | 'In progress' | 'Done' | 'Canceled' | 'Active'
  notes?: string;
  place?: string;
  platform?: string;
  streak?: number;
  subtasks?: string;

  /** True source record reference (SOURCE OF TRUTH) */
  originalRecord: TableRecord;
  /** Master table reference */
  originalTable: SourceTable;

  // For recurring habits:
  isHabitOccurrence?: boolean;
  habitDayIndex?: number;
  habitCompleted?: boolean;
}

export interface MultiSourceViewConfig {
  id?: string;
  title?: string;
  sourceDatabases: string[];
  viewType: ViewType;
  filters: FilterRule[];
  sorts: SortRule[];
  groupBy?: string;
  visibleProperties?: string[];
  span?: number;
  limit?: number;
  activeSourceFilter?: string[];
}

// ----------------------------------------------------------------------------
// 5. UNIFIED DASHBOARD CANVAS & BLOCK ARCHITECTURE
// ----------------------------------------------------------------------------
export type BlockType =
  | 'linked_database'
  | 'linked_multi_database'
  | 'record_card'
  | 'content'
  // Legacy section type aliases for backward compatibility:
  | 'linked-view'
  | 'source-table'
  | 'profile'
  | 'gallery'
  | 'schedule'
  | 'check'
  | 'habit'
  | 'note'
  | 'progress'
  | 'image'
  | 'quote'
  | 'divider'
  | 'clock';

export type ContentSubtype =
  | 'text'
  | 'heading'
  | 'quote'
  | 'callout'
  | 'image'
  | 'divider'
  | 'clock'
  | 'bookmark'
  | 'spacer'
  | 'profile'
  | 'progress'
  | 'note';

export interface BlockLayout {
  x?: number; // 0..11 column position
  y?: number; // row position
  w: number;  // 1..12 columns width
  h?: number; // relative height units or min height
}

export interface ViewConfig {
  id?: string;
  type: ViewType;
  filters: FilterRule[];
  sorts: SortRule[];
  groupBy?: string;
  visibleProperties?: string[];
  limit?: number;
  activeSourceFilter?: string[];
}

export type SectionType = BlockType;

export interface ProfileRow {
  id: string;
  key: string;
  value: string;
}

export interface GalleryProp {
  id: string;
  key: string;
  value: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  cover: string;
  props: GalleryProp[];
  body: string;
}

/** 0 = kosong, 1 = selesai, 2 = terlewat */
export type HabitCell = 0 | 1 | 2;

export interface HabitItem {
  id: string;
  name: string;
  days: HabitCell[];
}

export type ScheduleStatus = 'todo' | 'done' | 'canceled';

export interface ScheduleItem {
  id: string;
  title: string;
  day: number;
  start: string;
  end: string;
  place: string;
  tag: string;
  tagColor: TagColor;
  status: ScheduleStatus;
  notes: string;
}

export interface CheckItem {
  id: string;
  text: string;
  done: boolean;
  scheduleId?: string;
  scheduleLabel?: string;
}

export interface ProgressItem {
  id: string;
  label: string;
  value: number;
  max: number;
}

export interface AutoMetric {
  label: string;
  value: number;
  max: number;
}

/**
 * Core Canvas Block Model (Architectural Target):
 * DATABASE = SOURCE OF TRUTH
 * DASHBOARD = CANVAS / LAYOUT
 * BLOCK = CONFIGURATION
 * LINKED VIEW = VIEW OVER A DATABASE
 * RECORD = ACTUAL DATA
 */
export interface DashboardBlock {
  id: string; // blockId
  dashboardId?: string; // e.g. "dashboard_main"
  type: BlockType;
  contentSubtype?: ContentSubtype;

  // Source Database References (Stable IDs, NEVER titles)
  sourceDatabaseId?: string | null;
  /** MULTI-SOURCE LINKED VIEW: Multiple source database IDs merged in one view */
  sourceDatabases?: string[];
  sourceRecordId?: string | null;
  viewId?: string | null;

  // View configuration (for linked database views)
  view?: ViewConfig;

  // Layout in flexible canvas
  layout?: BlockLayout;

  // Content block configuration or metadata
  config?: Record<string, any>;

  // Presentation metadata
  title?: string;
  label?: string;

  // Backwards compatibility properties for legacy components
  span?: number;
  linkedConfig?: LinkedViewConfig;
  sourceTableId?: string;
  items?: any[];
  meta?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Section is aliased to DashboardBlock for complete backward compatibility
export type Section = DashboardBlock;

// ----------------------------------------------------------------------------
// 6. HISTORY SNAPSHOT & WEEKLY CYCLE
// ----------------------------------------------------------------------------
export interface HistoryEntry {
  id: string;
  batchId: string;
  weekKey: string; // 2026-W41
  year: number;
  week: number;
  range: string;
  archivedAt: string;
  snapshotTables: SourceTable[];
  snapshotSections: Section[];
  snapshot?: Section; // for single section backwards compatibility
  metrics: {
    habitsRate: number;
    tasksDone: number;
    totalTasks: number;
    scheduleEvents: number;
  };
  reflectionText?: string;
}

// ----------------------------------------------------------------------------
// 7. PAGE & WORKSPACE INFO
// ----------------------------------------------------------------------------
export interface PageInfo {
  title: string;
  owner: string;
  cover: string;
  avatar: string;
  quote: string;
  quoteBy: string;
}

