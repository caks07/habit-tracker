import { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  ImageOff,
  Link2,
  MoreHorizontal,
  Settings,
  Tag as TagIcon,
  X,
} from 'lucide-react';
import type { DashboardBlock, SourceTable, TableProperty, TableRecord } from '../../types';
import { useStore } from '../../store';
import { Tag, Popover, MenuItem } from '../ui';
import { RecordPeekModal } from './RecordPeekModal';

interface Props {
  block: DashboardBlock;
  readOnly?: boolean;
}

export function RecordCardBlock({ block, readOnly = false }: Props) {
  const tables = useStore((s) => s.tables);
  const updateBlockConfig = useStore((s) => s.updateBlockConfig);

  const [isPeekOpen, setIsPeekOpen] = useState(false);
  const [activeRelatedRecord, setActiveRelatedRecord] = useState<{
    table: SourceTable;
    record: TableRecord;
  } | null>(null);
  const [propPickerOpen, setPropPickerOpen] = useState(false);

  const databaseId = block.sourceDatabaseId;
  const recordId = block.sourceRecordId;

  if (!databaseId || !tables[databaseId]) {
    return (
      <div className="py-8 px-4 text-center font-mono text-[13px] text-dm bg-hv/30 rounded border border-dashed border-ln">
        <span>Database sumber ({databaseId || 'tidak ditentukan'}) tidak ditemukan.</span>
      </div>
    );
  }

  const table = tables[databaseId];
  const record = table.records.find((r) => r.id === recordId);

  if (!record) {
    return (
      <div className="py-8 px-4 text-center font-mono text-[13px] text-dm bg-hv/30 rounded border border-dashed border-ln">
        <span>Record asli telah dihapus dari {table.name}.</span>
      </div>
    );
  }

  // Properties configuration
  const titleProp = table.properties.find((p) => p.type === 'title') || table.properties[0];
  const coverProp = table.properties.find((p) => p.key === 'cover');
  const recordTitle = record.values[titleProp?.key || 'title'] || 'Tanpa Judul';
  const coverUrl = coverProp ? record.values[coverProp.key] : null;

  // Visible properties config (PART 24 - Card Property Picker)
  const defaultVisible = table.properties
    .filter((p) => p.key !== 'cover' && p.key !== titleProp.key)
    .map((p) => p.key);
  const visiblePropertyKeys: string[] = block.config?.visibleFields || defaultVisible;
  const showCover: boolean = block.config?.showCover !== false;
  const showRelations: boolean = block.config?.showRelations !== false;

  const toggleProperty = (key: string) => {
    const next = visiblePropertyKeys.includes(key)
      ? visiblePropertyKeys.filter((k) => k !== key)
      : [...visiblePropertyKeys, key];
    updateBlockConfig(block.id, { visibleFields: next });
  };

  const toggleCover = () => {
    updateBlockConfig(block.id, { showCover: !showCover });
  };

  const toggleRelations = () => {
    updateBlockConfig(block.id, { showRelations: !showRelations });
  };

  // Resolve Relations dynamically by ID (PART 6 & 7)
  const scheduleTable = tables['schedule'];
  const tasksTable = tables['tasks'];
  const assignmentsTable = tables['assignments'];

  // 1. Schedules related to this record
  const explicitScheduleIds: string[] = Array.isArray(record.values.scheduleIds)
    ? record.values.scheduleIds
    : [];
  const relatedSchedules = scheduleTable
    ? scheduleTable.records.filter(
        (r) => explicitScheduleIds.includes(r.id) || r.values.activityId === record.id
      )
    : [];

  // 2. Tasks related to this record
  const explicitTaskIds: string[] = Array.isArray(record.values.taskIds)
    ? record.values.taskIds
    : [];
  const relatedTasks = tasksTable
    ? tasksTable.records.filter(
        (r) => explicitTaskIds.includes(r.id) || r.values.activityId === record.id
      )
    : [];

  // 3. Assignments related to this record
  const explicitAssignmentIds: string[] = Array.isArray(record.values.assignmentIds)
    ? record.values.assignmentIds
    : [];
  const relatedAssignments = assignmentsTable
    ? assignmentsTable.records.filter(
        (r) =>
          explicitAssignmentIds.includes(r.id) ||
          r.values.activityId === record.id ||
          r.values.course === record.id
      )
    : [];

  return (
    <div className="group/card-block relative flex flex-col font-mono text-[13px] bg-pn/40 rounded border border-ln/60 overflow-hidden shadow-xs hover:border-ln transition-all">
      {/* Top Cover Image if enabled */}
      {showCover && coverUrl && (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-hv/60">
          <img
            src={coverUrl}
            alt={recordTitle}
            className="h-full w-full object-cover transition-transform duration-300 group-hover/card-block:scale-[1.02]"
            loading="lazy"
          />
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Header: Title + Property Config Cog */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-nt bg-nv/30 px-1.5 py-0.5 rounded border border-nv/50">
                {table.name}
              </span>
              <button
                type="button"
                onClick={() => setIsPeekOpen(true)}
                className="text-[11px] text-dm hover:text-tx transition-colors flex items-center gap-1"
                title="Buka detail modal"
              >
                <span>Buka</span>
                <ExternalLink size={11} />
              </button>
            </div>
            <h3
              onClick={() => setIsPeekOpen(true)}
              className="text-base font-bold text-tx tracking-tight hover:text-nt cursor-pointer transition-colors leading-snug line-clamp-2"
            >
              {recordTitle}
            </h3>
          </div>

          {/* Card Property Picker Button */}
          {!readOnly && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setPropPickerOpen(!propPickerOpen)}
                className="p-1 text-dm/60 hover:text-dm hover:bg-hv rounded transition-colors"
                title="Atur properti tampil pada kartu"
              >
                <Settings size={14} />
              </button>

              <Popover open={propPickerOpen} onClose={() => setPropPickerOpen(false)}>
                <div className="px-2 py-1 text-[11px] font-semibold text-dm uppercase tracking-wider">
                  Properti Tampil
                </div>
                {coverProp && (
                  <label className="flex items-center gap-2 px-2 py-1 text-[12px] text-tx hover:bg-hv rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCover}
                      onChange={toggleCover}
                      className="accent-nt rounded"
                    />
                    <span>Cover Image</span>
                  </label>
                )}
                <label className="flex items-center gap-2 px-2 py-1 text-[12px] text-tx hover:bg-hv rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRelations}
                    onChange={toggleRelations}
                    className="accent-nt rounded"
                  />
                  <span>Relasi Terhubung (Schedule & Tasks)</span>
                </label>
                <div className="my-1 border-t border-ln/50" />
                {table.properties
                  .filter((p) => p.key !== 'cover' && p.key !== titleProp.key)
                  .map((p) => {
                    const isVisible = visiblePropertyKeys.includes(p.key);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 px-2 py-1 text-[12px] text-tx hover:bg-hv rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleProperty(p.key)}
                          className="accent-nt rounded"
                        />
                        <span>{p.name}</span>
                      </label>
                    );
                  })}
              </Popover>
            </div>
          )}
        </div>

        {/* Selected Record Properties */}
        <div className="space-y-1.5 pt-1 text-[12px]">
          {table.properties
            .filter((p) => visiblePropertyKeys.includes(p.key) && record.values[p.key] !== undefined)
            .map((prop) => {
              const val = record.values[prop.key];
              if (val === null || val === undefined || val === '') return null;

              return (
                <div key={prop.id} className="flex items-baseline gap-2 text-dm">
                  <span className="w-24 shrink-0 text-dm/70 text-[11px] truncate">{prop.name}:</span>
                  <div className="flex-1 text-tx min-w-0">
                    {prop.type === 'select' || prop.type === 'status' ? (
                      <Tag color="purple" className="text-[10px] py-0 px-1.5 shadow-2xs">
                        {String(val)}
                      </Tag>
                    ) : (
                      <span className="truncate block">{String(val)}</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Dynamic Relational Embeds (PART 6 & PART 7) */}
        {showRelations && (relatedSchedules.length > 0 || relatedTasks.length > 0 || relatedAssignments.length > 0) && (
          <div className="space-y-2.5 pt-2 border-t border-ln/60">
            {/* Related Schedules */}
            {relatedSchedules.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dm tracking-wider uppercase">
                  <Clock size={11} className="text-nt" />
                  <span>Jadwal Terkait ({relatedSchedules.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {relatedSchedules.map((sch) => (
                    <button
                      key={sch.id}
                      type="button"
                      onClick={() =>
                        scheduleTable && setActiveRelatedRecord({ table: scheduleTable, record: sch })
                      }
                      className="group/sch inline-flex items-center gap-1.5 text-[11px] bg-bg/80 hover:bg-hv border border-ln/70 px-2 py-1 rounded transition-colors text-left"
                    >
                      <span className="font-medium text-tx group-hover/sch:text-nt">
                        {sch.values.day || ''} {sch.values.startTime ? `• ${sch.values.startTime}` : ''}
                      </span>
                      {sch.values.place && (
                        <span className="text-dm text-[10px]">({sch.values.place})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related Tasks */}
            {relatedTasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-dm tracking-wider uppercase">
                  <CheckSquare size={11} className="text-nt" />
                  <span>Tasks Terkait ({relatedTasks.length})</span>
                </div>
                <div className="space-y-1">
                  {relatedTasks.slice(0, 3).map((tsk) => {
                    const isDone = tsk.values.status === 'Done';
                    return (
                      <div
                        key={tsk.id}
                        onClick={() =>
                          tasksTable && setActiveRelatedRecord({ table: tasksTable, record: tsk })
                        }
                        className="flex items-center gap-2 text-[12px] text-dm hover:text-tx cursor-pointer transition-colors"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isDone ? 'bg-ok' : 'bg-nt'}`}
                        />
                        <span className={`truncate ${isDone ? 'line-through text-dm/60' : 'text-tx'}`}>
                          {tsk.values.title || 'Untitled task'}
                        </span>
                      </div>
                    );
                  })}
                  {relatedTasks.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setIsPeekOpen(true)}
                      className="text-[10px] text-nt hover:underline"
                    >
                      +{relatedTasks.length - 3} tasks lainnya...
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record Peek / Detail Modal for primary record */}
      {isPeekOpen && (
        <RecordPeekModal
          table={table}
          record={record}
          onClose={() => setIsPeekOpen(false)}
        />
      )}

      {/* Detail Modal for any clicked related record */}
      {activeRelatedRecord && (
        <RecordPeekModal
          table={activeRelatedRecord.table}
          record={activeRelatedRecord.record}
          onClose={() => setActiveRelatedRecord(null)}
        />
      )}
    </div>
  );
}
