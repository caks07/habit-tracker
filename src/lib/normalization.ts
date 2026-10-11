import type {
  FilterRule,
  NormalizedRecordRow,
  SortRule,
  SourceTable,
  TableRecord,
} from '../types';
import { DAYS, getTodayDateStr, isDateThisWeek, isDateToday, todayIndex } from './date';

/**
 * Standardizes time strings like '06.00 - 07.00', '19:00', '08.30'
 * Returns normalized { start: 'HH:MM', end: 'HH:MM' | null, display: string }
 */
export function normalizeTimeString(rawTime: string | null | undefined): {
  startTime: string | null;
  endTime: string | null;
  timeDisplay: string;
} {
  if (!rawTime || typeof rawTime !== 'string') {
    return { startTime: null, endTime: null, timeDisplay: '—' };
  }

  const clean = rawTime.trim();
  if (!clean || clean === '—') {
    return { startTime: null, endTime: null, timeDisplay: '—' };
  }

  // Range patterns: '06.00 - 07.00' or '19:00–21:30' or '08:00 to 12:00'
  const parts = clean.split(/\s*[-–—to]\s*/i);
  if (parts.length >= 2) {
    const s = parts[0].replace('.', ':').padStart(5, '0');
    const e = parts[1].replace('.', ':').padStart(5, '0');
    return {
      startTime: s,
      endTime: e,
      timeDisplay: `${s} - ${e}`,
    };
  }

  // Single time: '08.30' -> '08:30'
  const single = clean.replace('.', ':').padStart(5, '0');
  return {
    startTime: single,
    endTime: null,
    timeDisplay: single,
  };
}

/**
 * Normalizes an individual record from any source database into a unified presentation model.
 * Does NOT duplicate data; holds references to sourceDatabaseId, sourceRecordId, and originalRecord.
 */
export function normalizeRecord(
  table: SourceTable,
  record: TableRecord,
  options?: { targetDate?: string; targetDayIndex?: number }
): NormalizedRecordRow {
  const vals = record.values || {};
  const tableId = table.id.toLowerCase();

  // Find properties by type
  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
  const dateProp = table.properties.find((p) => p.type === 'date');
  const statusProp = table.properties.find((p) => p.type === 'status');

  let title = String(vals[titleProp?.key || 'title'] || 'Tanpa Judul');
  let date: string | undefined = dateProp ? vals[dateProp.key] : vals.date || vals.dueDate;
  let day: string | undefined = vals.day;
  let category: string | undefined = vals.category || vals.type;
  let status: string | undefined = statusProp ? vals[statusProp.key] : vals.status;
  let notes: string | undefined = vals.notes || vals.subtasks || vals.description;
  let place: string | undefined = vals.place;
  let platform: string | undefined = vals.platform;
  let streak: number | undefined = typeof vals.streak === 'number' ? vals.streak : undefined;

  let rawTime = vals.time || vals.startTime;
  if (!rawTime && vals.endTime) {
    rawTime = `${vals.startTime || '00:00'} - ${vals.endTime}`;
  }

  // Database-specific tweaks
  if (tableId.includes('schedule')) {
    title = vals.title || vals.mainActivity || title;
    if (vals.startTime && vals.endTime) {
      rawTime = `${vals.startTime} - ${vals.endTime}`;
    }
    category = vals.category || 'Study';
    place = vals.place;
  } else if (tableId.includes('tasks')) {
    title = vals.title || title;
    rawTime = vals.time;
    notes = vals.subtasks || notes;
    date = vals.dueDate || date;
  } else if (tableId.includes('activities')) {
    title = vals.title || title;
    category = vals.category || 'Program';
    notes = vals.notes || `${vals.event || ''} Sesi ${vals.sesi || ''}`.trim();
  } else if (tableId.includes('habits')) {
    title = vals.title || title;
    category = vals.category || 'Health';
    rawTime = vals.time || '06:00 - 06:45';
    // If habit days array exists and targetDayIndex provided, resolve status
    if (Array.isArray(vals.days) && options?.targetDayIndex !== undefined) {
      const dayCell = vals.days[options.targetDayIndex];
      status = dayCell === 1 ? 'Done' : dayCell === 2 ? 'Canceled' : 'Planned';
    } else {
      status = vals.status || 'Active';
    }
  } else if (tableId.includes('entertainment')) {
    title = vals.title || title;
    category = vals.type || 'Media';
    rawTime = vals.time;
    platform = vals.platform;
    notes = vals.notes || vals.platform;
  } else if (tableId.includes('assignments')) {
    title = vals.title || title;
    category = vals.category || 'Kuliah';
    date = vals.dueDate || date;
  }

  const { startTime, endTime, timeDisplay } = normalizeTimeString(rawTime);

  // Derive day name from date if day is missing
  if (!day && date) {
    const dObj = new Date(date);
    if (!isNaN(dObj.getTime())) {
      const idx = todayIndex(dObj);
      day = DAYS[idx];
    }
  }

  const sourceType = getSourceType(tableId);
  const sourceLabel = table.name || getSourceLabel(sourceType);

  return {
    id: `${table.id}::${record.id}`,
    sourceDatabaseId: table.id,
    sourceRecordId: record.id,
    sourceType,
    sourceLabel,
    title,
    date,
    day,
    startTime,
    endTime,
    timeDisplay,
    category,
    status: status || 'Not started',
    notes,
    place,
    platform,
    streak,
    subtasks: vals.subtasks,
    originalRecord: record,
    originalTable: table,
  };
}

/**
 * Returns human-readable sourceType identifier
 */
export function getSourceType(tableId: string): string {
  const id = tableId.toLowerCase().replace(/^db_/, '');
  if (id.includes('task')) return 'task';
  if (id.includes('sched')) return 'schedule';
  if (id.includes('activ')) return 'activity';
  if (id.includes('habit')) return 'habit';
  if (id.includes('entert')) return 'entertainment';
  if (id.includes('assign')) return 'assignment';
  if (id.includes('goal')) return 'goal';
  if (id.includes('note')) return 'note';
  return id;
}

export function getSourceLabel(sourceType: string): string {
  switch (sourceType) {
    case 'task':
      return 'Tasks';
    case 'schedule':
      return 'Schedule';
    case 'activity':
      return 'Activities';
    case 'habit':
      return 'Habits';
    case 'entertainment':
      return 'Entertainment';
    case 'assignment':
      return 'Assignments';
    case 'goal':
      return 'Goals';
    case 'note':
      return 'Notes';
    default:
      return sourceType.charAt(0).toUpperCase() + sourceType.slice(1);
  }
}

/**
 * Generates unified rows across MULTIPLE source databases.
 * Special handling for habits: recurring occurrences are mapped to days/today without duplicate records.
 */
export function normalizeMultiSourceRecords(
  tables: Record<string, SourceTable>,
  sourceDatabaseIds: string[],
  activeSourceFilter?: string[]
): NormalizedRecordRow[] {
  const rows: NormalizedRecordRow[] = [];
  const todayIdx = todayIndex();
  const todayStr = getTodayDateStr();

  // Normalize source IDs (strip or match db_ prefix)
  const resolvedDbIds = sourceDatabaseIds.map((id) => {
    if (tables[id]) return id;
    const stripped = id.replace(/^db_/, '');
    if (tables[stripped]) return stripped;
    const prefixed = `db_${id}`;
    if (tables[prefixed]) return prefixed;
    return id;
  });

  resolvedDbIds.forEach((dbId) => {
    const table = tables[dbId];
    if (!table) return;

    const sType = getSourceType(table.id);
    // Apply source filter if specified
    if (activeSourceFilter && activeSourceFilter.length > 0) {
      const allowed =
        activeSourceFilter.includes(table.id) ||
        activeSourceFilter.includes(sType) ||
        activeSourceFilter.includes(table.name);
      if (!allowed) return;
    }

    // Special handling for recurring Habits (PART 19)
    if (sType === 'habit') {
      table.records.forEach((rec) => {
        const daysArr: number[] = Array.isArray(rec.values.days) ? rec.values.days : [];

        // For each day of week (Senin..Minggu), produce a virtual occurrence
        DAYS.forEach((dayName, dayIdx) => {
          // If habit has a cell for this day (active or completed)
          const cellVal = daysArr[dayIdx] ?? 0;
          const isDone = cellVal === 1;
          const isCanceled = cellVal === 2;

          rows.push({
            id: `${table.id}::${rec.id}::day_${dayIdx}`,
            sourceDatabaseId: table.id,
            sourceRecordId: rec.id,
            sourceType: 'habit',
            sourceLabel: 'Habits',
            title: rec.values.title || 'Habit',
            day: dayName,
            date: dayIdx === todayIdx ? todayStr : undefined,
            startTime: rec.values.time ? normalizeTimeString(rec.values.time).startTime : '06:00',
            endTime: rec.values.time ? normalizeTimeString(rec.values.time).endTime : '07:00',
            timeDisplay: rec.values.time || '06:00 - 07:00',
            category: rec.values.category || 'Health',
            status: isDone ? 'Done' : isCanceled ? 'Canceled' : 'Planned',
            notes: `Streak: ${rec.values.streak || 0} hari`,
            streak: rec.values.streak,
            originalRecord: rec,
            originalTable: table,
            isHabitOccurrence: true,
            habitDayIndex: dayIdx,
            habitCompleted: isDone,
          });
        });
      });
      return;
    }

    // Standard database records
    table.records.forEach((rec) => {
      rows.push(normalizeRecord(table, rec));
    });
  });

  return rows;
}

/**
 * Filter normalized rows according to multi-source filter rules
 */
export function filterNormalizedRows(
  rows: NormalizedRecordRow[],
  filters: FilterRule[]
): NormalizedRecordRow[] {
  if (!filters || filters.length === 0) return rows;

  return rows.filter((row) => {
    return filters.every((f) => {
      let rowVal: any;

      switch (f.property) {
        case 'date':
          rowVal = row.date;
          break;
        case 'day':
          rowVal = row.day;
          break;
        case 'startTime':
        case 'time':
          rowVal = row.startTime;
          break;
        case 'category':
          rowVal = row.category;
          break;
        case 'status':
          rowVal = row.status;
          break;
        case 'source':
        case 'sourceType':
        case 'sourceDatabaseId':
          rowVal = row.sourceType;
          break;
        case 'title':
          rowVal = row.title;
          break;
        default:
          rowVal = (row as any)[f.property] ?? row.originalRecord.values[f.property];
      }

      switch (f.operator) {
        case 'is_today':
          if (row.day && DAYS[todayIndex()] === row.day) return true;
          return isDateToday(row.date);

        case 'is_this_week':
          if (row.day) return true; // all days in weekly view fall in current week
          return isDateThisWeek(row.date);

        case 'is_checked':
          return (
            row.status?.toLowerCase() === 'done' ||
            row.status?.toLowerCase() === 'completed' ||
            row.status?.toLowerCase() === 'submitted'
          );

        case 'is_not_checked':
          return (
            row.status?.toLowerCase() !== 'done' &&
            row.status?.toLowerCase() !== 'completed' &&
            row.status?.toLowerCase() !== 'submitted'
          );

        case 'equals':
          if (f.value === undefined || f.value === '') return true;
          return String(rowVal || '').toLowerCase() === String(f.value).toLowerCase();

        case 'not_equals':
          if (f.value === undefined || f.value === '') return true;
          return String(rowVal || '').toLowerCase() !== String(f.value).toLowerCase();

        case 'contains':
          if (!f.value) return true;
          return String(rowVal || '').toLowerCase().includes(String(f.value).toLowerCase());

        default:
          return true;
      }
    });
  });
}

/**
 * Global sorting across ALL databases merged into one chronological timeline (PART 8)
 */
export function sortNormalizedRows(
  rows: NormalizedRecordRow[],
  sorts?: SortRule[]
): NormalizedRecordRow[] {
  const copy = [...rows];

  // Default chronological sort: Day/Date ASC, then StartTime ASC
  if (!sorts || sorts.length === 0) {
    const dayOrder: Record<string, number> = {
      Senin: 0,
      Selasa: 1,
      Rabu: 2,
      Kamis: 3,
      Jumat: 4,
      Sabtu: 5,
      Minggu: 6,
    };

    copy.sort((a, b) => {
      // 1. Compare Date if present
      if (a.date && b.date && a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      // 2. Compare Day of week if present
      if (a.day && b.day && a.day !== b.day) {
        const orderA = dayOrder[a.day] ?? 99;
        const orderB = dayOrder[b.day] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
      }
      // 3. Compare Start Time (Chronological: 06:00 -> 08:30 -> 13:00 -> 19:00 -> 21:00)
      const tA = a.startTime || '99:99';
      const tB = b.startTime || '99:99';
      return tA.localeCompare(tB);
    });

    return copy;
  }

  // Custom sort rules
  copy.sort((a, b) => {
    for (const rule of sorts) {
      let valA: any = (a as any)[rule.property] ?? a.originalRecord.values[rule.property];
      let valB: any = (b as any)[rule.property] ?? b.originalRecord.values[rule.property];

      if (valA === valB) continue;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      let comp = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comp = valA - valB;
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

/**
 * Safely parses any habit days representation into an array of 7 numbers [0|1|2]
 * Never produces corrupt data or displays raw numbers to the user (PART 10 & 11)
 */
export function parseHabitDays(raw: any): number[] {
  if (Array.isArray(raw)) {
    const res = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 7; i++) {
      res[i] = Number(raw[i]) === 1 ? 1 : Number(raw[i]) === 2 ? 2 : 0;
    }
    return res;
  }
  if (typeof raw === 'string') {
    const parts = raw.split(',').map((p) => p.trim()).filter((p) => p !== '');
    const res = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 7; i++) {
      const v = Number(parts[i]);
      res[i] = v === 1 ? 1 : v === 2 ? 2 : 0;
    }
    return res;
  }
  return [0, 0, 0, 0, 0, 0, 0];
}

/**
 * Calculates consecutive daily completion streak from an array of date strings (YYYY-MM-DD).
 * Handles today's completion as well as grace period (if today is not yet completed).
 */
export function calculateDateStreak(completionDates: string[], referenceDate?: string): number {
  if (!completionDates || !Array.isArray(completionDates) || completionDates.length === 0) {
    return 0;
  }

  const dateSet = new Set(completionDates.map((d) => d.trim()));
  const ref = referenceDate ? new Date(referenceDate) : new Date();

  // Helper to format Date to YYYY-MM-DD in local time
  const formatYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatYMD(ref);
  const cur = new Date(ref);

  let streak = 0;

  // Check if today is completed
  if (dateSet.has(todayStr)) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  } else {
    // If today is not completed yet, start checking from yesterday
    cur.setDate(cur.getDate() - 1);
  }

  // Count backwards consecutive days
  while (true) {
    const checkStr = formatYMD(cur);
    if (dateSet.has(checkStr)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Computes habit streak dynamically from completed occurrences and days up to current day (PART 12 & 13)
 * Eliminates manual streak entry.
 */
export function computeHabitStreak(
  daysRaw: any,
  manualStreakOrCompletions?: number | string[] | any,
  completions?: string[]
): number {
  // If completions array is passed directly or as second parameter
  const dateList = Array.isArray(completions)
    ? completions
    : Array.isArray(manualStreakOrCompletions)
    ? manualStreakOrCompletions
    : null;

  if (dateList && dateList.length > 0) {
    const dateStreak = calculateDateStreak(dateList);
    if (dateStreak > 0) return dateStreak;
  }

  // Calculate from weekly days array: consecutive 1s ending at current day
  const days = parseHabitDays(daysRaw);
  let weeklyCount = 0;
  let currentRun = 0;
  for (let i = 0; i < 7; i++) {
    if (days[i] === 1) {
      currentRun++;
      weeklyCount = Math.max(weeklyCount, currentRun);
    } else if (days[i] === 2 || days[i] === 0) {
      currentRun = 0;
    }
  }

  const manualStreak = typeof manualStreakOrCompletions === 'number' ? manualStreakOrCompletions : 0;
  if (manualStreak > 0) {
    return Math.max(manualStreak, weeklyCount);
  }
  return weeklyCount;
}
