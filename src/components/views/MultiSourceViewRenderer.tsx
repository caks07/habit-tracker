import { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  Eye,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Plus,
  Table as TableIcon,
} from 'lucide-react';
import type { LinkedViewConfig, ViewType } from '../../types';
import { useStore } from '../../store';
import {
  filterNormalizedRows,
  getSourceLabel,
  getSourceType,
  normalizeMultiSourceRecords,
  sortNormalizedRows,
} from '../../lib/normalization';
import { MultiSourceBoardView } from './MultiSourceBoardView';
import { MultiSourceTableView } from './MultiSourceTableView';

interface Props {
  config: LinkedViewConfig;
  readOnly?: boolean;
}

export function MultiSourceViewRenderer({ config, readOnly = false }: Props) {
  const tables = useStore((s) => s.tables);

  // 1. Resolve source database IDs (PART 2: MULTI-SOURCE)
  const sourceDatabases = useMemo(() => {
    if (config.sourceDatabases && config.sourceDatabases.length > 0) {
      return config.sourceDatabases;
    }
    if (config.sourceTableIds && config.sourceTableIds.length > 0) {
      return config.sourceTableIds;
    }
    if (config.sourceTableId) {
      return [config.sourceTableId];
    }
    // Default multi-source for To do list harian
    return ['tasks', 'activities', 'habits', 'schedule', 'entertainment', 'assignments'];
  }, [config.sourceDatabases, config.sourceTableIds, config.sourceTableId]);

  // Realtime source filter toggles (PART 10)
  const [activeSources, setActiveSources] = useState<string[]>(
    config.activeSourceFilter || sourceDatabases
  );

  // Local view switcher (Board vs Table vs List)
  const [currentViewType, setCurrentViewType] = useState<ViewType>(config.viewType || 'board');

  // Group by setting (day, source, status)
  const [currentGroupBy, setCurrentGroupBy] = useState<string>(config.groupBy || 'day');

  // Hidden row IDs for "Remove from this view" (PART 16)
  const [hiddenRowIds, setHiddenRowIds] = useState<string[]>([]);

  // 2. Fetch live data -> Normalize -> Merge (PART 3, 4 & 5)
  const allRows = useMemo(() => {
    return normalizeMultiSourceRecords(tables, sourceDatabases, activeSources);
  }, [tables, sourceDatabases, activeSources]);

  // 3. Filter globally (PART 9)
  const filteredRows = useMemo(() => {
    const visible = allRows.filter((r) => !hiddenRowIds.includes(r.id));
    return filterNormalizedRows(visible, config.filters || []);
  }, [allRows, hiddenRowIds, config.filters]);

  // 4. Sort globally across all databases (PART 8)
  const sortedRows = useMemo(() => {
    return sortNormalizedRows(filteredRows, config.sorts);
  }, [filteredRows, config.sorts]);

  // Toggle a source database on/off
  const toggleSource = (sourceDbId: string) => {
    if (activeSources.includes(sourceDbId)) {
      if (activeSources.length === 1) return; // keep at least one
      setActiveSources(activeSources.filter((s) => s !== sourceDbId));
    } else {
      setActiveSources([...activeSources, sourceDbId]);
    }
  };

  const handleRemoveFromView = (rowId: string) => {
    setHiddenRowIds((prev) => [...prev, rowId]);
  };

  // Group by options
  const groupByOptions = [
    { id: 'day', label: 'Hari (Senin-Minggu)' },
    { id: 'source', label: 'Database Sumber' },
    { id: 'status', label: 'Status' },
  ];

  return (
    <div className="w-full space-y-4 font-mono">
      {/* Multi-Source Controls & Source Filter Badges (PART 10) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ln/40 pb-2.5 text-[11px] select-none">
        {/* Source Databases Checkbox Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-dm uppercase font-bold text-[10px] mr-1 flex items-center gap-1">
            <Filter size={11} />
            <span>Sumber:</span>
          </span>

          {sourceDatabases.map((dbId) => {
            const tbl = tables[dbId];
            const name = tbl?.name || getSourceLabel(dbId);
            const count = tbl?.records.length || 0;
            const isChecked = activeSources.includes(dbId);

            return (
              <button
                key={dbId}
                type="button"
                onClick={() => toggleSource(dbId)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] transition-all ${
                  isChecked
                    ? 'border-nt/80 bg-nv/30 text-tx font-medium'
                    : 'border-ln/60 bg-transparent text-dm hover:text-tx hover:border-ln'
                }`}
                title={`Klik untuk menampilkan/menyembunyikan data ${name}`}
              >
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${
                    isChecked ? 'bg-nt' : 'bg-dm/40'
                  }`}
                />
                <span>{name}</span>
                <span className="text-[10px] text-dm/80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* View Switchers & Group By */}
        <div className="flex items-center gap-3">
          {/* Group By selector (for board view) */}
          {currentViewType === 'board' && (
            <div className="flex items-center gap-1.5 text-[11px] text-dm">
              <span>Grup:</span>
              <select
                value={currentGroupBy}
                onChange={(e) => setCurrentGroupBy(e.target.value)}
                className="bare rounded border border-ln/60 bg-bg px-1.5 py-0.5 text-[11px] text-tx"
              >
                {groupByOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Switcher Buttons */}
          <div className="flex items-center rounded border border-ln/60 bg-bg/50 p-0.5">
            <button
              type="button"
              onClick={() => setCurrentViewType('board')}
              className={`p-1 rounded transition-colors ${
                currentViewType === 'board' ? 'bg-nv text-nt font-bold' : 'text-dm hover:text-tx'
              }`}
              title="Board Kanban View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentViewType('table')}
              className={`p-1 rounded transition-colors ${
                currentViewType === 'table' ? 'bg-nv text-nt font-bold' : 'text-dm hover:text-tx'
              }`}
              title="Tabel Kronologis View"
            >
              <TableIcon size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Renderer */}
      {currentViewType === 'board' ? (
        <MultiSourceBoardView
          rows={sortedRows}
          tables={tables}
          groupByKey={currentGroupBy}
          sourceDatabases={sourceDatabases}
          readOnly={readOnly}
          onRemoveFromView={handleRemoveFromView}
        />
      ) : (
        <MultiSourceTableView
          rows={sortedRows}
          tables={tables}
          sourceDatabases={sourceDatabases}
          readOnly={readOnly}
          onRemoveFromView={handleRemoveFromView}
        />
      )}
    </div>
  );
}
