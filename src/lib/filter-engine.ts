import type { FilterRule, SortRule, TableProperty, TableRecord } from '../types';
import { isDateThisWeek, isDateToday } from './date';

/** Evaluates whether a single record matches a filter rule. */
export function evaluateFilter(
  record: TableRecord,
  filter: FilterRule,
  properties: TableProperty[]
): boolean {
  const value = record.values[filter.property];
  const prop = properties.find((p) => p.key === filter.property);

  switch (filter.operator) {
    case 'is_today':
      return isDateToday(String(value || ''));

    case 'is_this_week':
      return isDateThisWeek(String(value || ''));

    case 'is_checked':
      return Boolean(value) === true || value === 'Done' || value === 'Completed';

    case 'is_not_checked':
      return !value || value === 'Todo' || value === 'Planned' || value === 'In Progress';

    case 'equals':
      if (filter.value === undefined || filter.value === '') return true;
      return String(value || '').toLowerCase() === String(filter.value).toLowerCase();

    case 'not_equals':
      if (filter.value === undefined || filter.value === '') return true;
      return String(value || '').toLowerCase() !== String(filter.value).toLowerCase();

    case 'contains':
      if (!filter.value) return true;
      return String(value || '').toLowerCase().includes(String(filter.value).toLowerCase());

    default:
      return true;
  }
}

/** Filters a list of records according to multiple filter rules (AND logic). */
export function filterRecords(
  records: TableRecord[],
  filters: FilterRule[],
  properties: TableProperty[]
): TableRecord[] {
  if (!filters || filters.length === 0) return records;
  return records.filter((rec) =>
    filters.every((f) => evaluateFilter(rec, f, properties))
  );
}

/** Sorts records based on sort rules. */
export function sortRecords(
  records: TableRecord[],
  sorts: SortRule[],
  properties: TableProperty[]
): TableRecord[] {
  if (!sorts || sorts.length === 0) return [...records];
  const copy = [...records];

  copy.sort((a, b) => {
    for (const rule of sorts) {
      const valA = a.values[rule.property];
      const valB = b.values[rule.property];

      if (valA === valB) continue;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      const prop = properties.find((p) => p.key === rule.property);
      let comp = 0;

      if (prop?.type === 'number' || prop?.type === 'rating') {
        comp = Number(valA) - Number(valB);
      } else {
        comp = String(valA).localeCompare(String(valB), 'id', { numeric: true });
      }

      if (comp !== 0) {
        return rule.direction === 'desc' ? -comp : comp;
      }
    }
    return 0;
  });

  return copy;
}

/** Groups records by a specified property key. */
export function groupRecords(
  records: TableRecord[],
  groupKey: string,
  properties: TableProperty[]
): Record<string, TableRecord[]> {
  const groups: Record<string, TableRecord[]> = {};
  const prop = properties.find((p) => p.key === groupKey);

  // Pre-seed known options or days so empty columns still appear in order
  if (groupKey === 'day' || groupKey === 'hari') {
    ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].forEach((d) => {
      groups[d] = [];
    });
  } else if (prop?.options && prop.options.length > 0) {
    prop.options.forEach((opt) => {
      groups[opt.label] = [];
    });
  }

  for (const record of records) {
    const rawVal = record.values[groupKey];
    const key = rawVal ? String(rawVal) : 'Tanpa Kategori';
    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
  }

  return groups;
}
