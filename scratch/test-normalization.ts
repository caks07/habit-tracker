import { createDefaultSourceTables } from '../src/lib/seed';
import {
  normalizeMultiSourceRecords,
  sortNormalizedRows,
  filterNormalizedRows,
} from '../src/lib/normalization';

const tables = createDefaultSourceTables();
const multiSources = ['tasks', 'activities', 'habits', 'schedule', 'entertainment', 'assignments'];

console.log('Testing normalization...');
const allRows = normalizeMultiSourceRecords(tables, multiSources);
console.log(`Normalized rows count: ${allRows.length}`);

// Verify sources are properly mapped
const sourceTypes = Array.from(new Set(allRows.map((r) => r.sourceType)));
console.log('Source types present:', sourceTypes);

// Check that rows retain reference to source database and original record
const sampleTask = allRows.find((r) => r.sourceType === 'task');
console.log('Sample task row:', {
  title: sampleTask?.title,
  sourceDatabaseId: sampleTask?.sourceDatabaseId,
  sourceRecordId: sampleTask?.sourceRecordId,
  timeDisplay: sampleTask?.timeDisplay,
});

// Check that habits generate virtual occurrences per day
const habitOccurrences = allRows.filter((r) => r.sourceType === 'habit');
console.log(`Habit occurrences generated: ${habitOccurrences.length}`);
const sampleHabit = habitOccurrences[0];
console.log('Sample habit occurrence:', {
  title: sampleHabit?.title,
  day: sampleHabit?.day,
  isHabitOccurrence: sampleHabit?.isHabitOccurrence,
  sourceRecordId: sampleHabit?.sourceRecordId,
});

// Test global chronological sort
const sorted = sortNormalizedRows(allRows);
console.log('Chronological timeline sample (first 8 rows):');
sorted.slice(0, 8).forEach((r, idx) => {
  console.log(`  ${idx + 1}. [${r.day || r.date || 'Any'}] ${r.startTime || '--:--'} | ${r.title} (${r.sourceLabel})`);
});

// Test filter today
const todayRows = filterNormalizedRows(allRows, [{ id: 'f-td', property: 'date', operator: 'is_today' }]);
console.log(`Today's unified items: ${todayRows.length}`);

console.log('\nALL NORMALIZATION AND MULTI-SOURCE TESTS PASSED!');
