import { useMemo } from 'react';
import type { LinkedViewConfig } from '../../types';
import { useStore } from '../../store';
import { filterRecords, sortRecords } from '../../lib/filter-engine';
import { getTodayDateStr } from '../../lib/date';
import { TableView } from './TableView';
import { BoardView } from './BoardView';
import { GalleryView } from './GalleryView';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { TimelineView } from './TimelineView';
import { CompactListView } from './CompactListView';
import { MultiSourceViewRenderer } from './MultiSourceViewRenderer';

interface Props {
  config: LinkedViewConfig;
  readOnly?: boolean;
}

export function LinkedViewRenderer({ config, readOnly = false }: Props) {
  const tables = useStore((s) => s.tables);

  // Check if this config targets multiple source databases (PART 2: MULTI-SOURCE)
  const isMultiSource =
    (config.sourceDatabases && config.sourceDatabases.length > 1) ||
    (config.sourceTableIds && config.sourceTableIds.length > 1);

  if (isMultiSource) {
    return <MultiSourceViewRenderer config={config} readOnly={readOnly} />;
  }

  const tableId = config.sourceTableId || (config.sourceDatabases && config.sourceDatabases[0]) || '';
  const table = tables[tableId];

  // Default values to assign if new record is created in this view
  const defaultValues = useMemo(() => {
    const defaults: Record<string, any> = {};
    if (config.filters) {
      config.filters.forEach((f) => {
        if (f.operator === 'is_today') defaults[f.property] = getTodayDateStr();
        if (f.operator === 'equals' && f.value !== undefined) defaults[f.property] = f.value;
      });
    }
    return defaults;
  }, [config.filters]);

  if (!table) {
    // If not found as a single table, attempt MultiSourceViewRenderer as fallback
    if (config.sourceDatabases && config.sourceDatabases.length > 0) {
      return <MultiSourceViewRenderer config={config} readOnly={readOnly} />;
    }
    return (
      <div className="py-6 text-center text-dm font-mono text-[12px]">
        Sumber tabel ({tableId || 'tidak ditentukan'}) tidak ditemukan atau telah dihapus.
      </div>
    );
  }

  // Filter and sort records
  const filteredRecords = filterRecords(table.records, config.filters || [], table.properties);
  const sortedRecords = sortRecords(filteredRecords, config.sorts || [], table.properties);

  switch (config.viewType) {
    case 'gallery':
      return (
        <GalleryView
          table={table}
          records={sortedRecords}
          defaultValuesForNew={defaultValues}
          readOnly={readOnly}
        />
      );

    case 'board':
      return (
        <BoardView
          table={table}
          records={sortedRecords}
          groupByKey={config.groupBy || 'day'}
          defaultValuesForNew={defaultValues}
          readOnly={readOnly}
        />
      );

    case 'list':
      return (
        <ListView
          table={table}
          records={sortedRecords}
          defaultValuesForNew={defaultValues}
          readOnly={readOnly}
        />
      );

    case 'calendar':
      return (
        <CalendarView
          table={table}
          records={sortedRecords}
          defaultValuesForNew={defaultValues}
          readOnly={readOnly}
        />
      );

    case 'timeline':
      return (
        <TimelineView
          table={table}
          records={sortedRecords}
          defaultValuesForNew={defaultValues}
          readOnly={readOnly}
        />
      );

    case 'compact-list':
      return (
        <CompactListView
          table={table}
          records={sortedRecords}
          defaultValuesForNew={defaultValues}
          readOnly={readOnly}
        />
      );

    case 'table':
    default:
      return (
        <TableView
          table={table}
          records={sortedRecords}
          visiblePropertyKeys={config.visibleProperties}
          defaultValuesForNew={defaultValues}
          readOnly={readOnly}
        />
      );
  }
}
