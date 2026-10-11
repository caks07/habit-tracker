import { useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useStore } from './store';
import { Sidebar } from './components/Sidebar';
import { PageHeader } from './components/PageHeader';
import { SectionFrame } from './components/SectionFrame';
import { AddSectionModal } from './components/modals/AddSectionModal';
import { ExportPdfModal } from './components/modals/ExportPdfModal';
import { ConfirmModal, Toast } from './components/modals/ConfirmModal';
import { PrintReport } from './components/PrintReport';
import { HistoryView } from './components/views/HistoryView';
import { TodayView } from './components/views/TodayView';
import { ThisWeekView } from './components/views/ThisWeekView';
import { SourceTablePage } from './components/views/SourceTablePage';
import { SettingsView } from './components/views/SettingsView';
import { weekInfo } from './lib/date';

export default function App() {
  const sections = useStore((s) => s.sections);
  const view = useStore((s) => s.view);
  const theme = useStore((s) => s.theme);
  const page = useStore((s) => s.page);
  const query = useStore((s) => s.query);
  const moveSection = useStore((s) => s.moveSection);
  const setAddOpen = useStore((s) => s.setAddOpen);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);

  const currentWeek = weekInfo();

  // Set theme attribute on root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      moveSection(oldIndex, newIndex);
    }
  };

  // Filter sections by search query if any
  const filteredSections = sections.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchTitle = (s.title || '').toLowerCase().includes(q);
    const matchLabel = (s.label || '').toLowerCase().includes(q);
    const matchItems = JSON.stringify(s.items || s.linkedConfig || s.config || {}).toLowerCase().includes(q);
    return matchTitle || matchLabel || matchItems;
  });

  const isDashboardView = view.name === 'dashboard';

  return (
    <div className="min-h-screen bg-bg text-tx font-mono selection:bg-nv selection:text-nt flex">
      {/* Left Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-200 min-w-0 ${
          sidebarCollapsed ? 'ml-12' : 'ml-64'
        }`}
      >
        {/* Sticky Top Bar & Cover Header */}
        <PageHeader />

        <main className="pb-24">
          {/* 1. Main Dashboard View (12-Column Grid) */}
          {isDashboardView && (
            <div className="mx-auto max-w-6xl px-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredSections.map((s) => s.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid-root">
                    {filteredSections.map((section) => (
                      <SectionFrame key={section.id} section={section} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Big "+ Tambah section baru" Button */}
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="group flex w-full max-w-xl items-center justify-center gap-2 rounded-lg border border-dashed border-ln bg-pn/40 py-3.5 text-[13px] font-mono text-dm hover:border-nt hover:bg-pn hover:text-tx transition-all shadow-xs"
                >
                  <Plus size={15} className="group-hover:text-nt transition-colors" />
                  <span>+ Tambah Section (Linked View, Tabel Master, Habit, Checklist)</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Today Focused View */}
          {view.name === 'today' && <TodayView />}

          {/* 3. This Week Aggregated View */}
          {view.name === 'this-week' && <ThisWeekView />}

          {/* 4. Full-Page Source Table Manager */}
          {view.name === 'source-table' && <SourceTablePage tableId={view.tableId} />}

          {/* 5. History / Archive Snapshots */}
          {view.name === 'history' && <HistoryView />}

          {/* 6. Settings Page */}
          {view.name === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <AddSectionModal />
      <ExportPdfModal />
      <ConfirmModal />
      <Toast />

      {/* Print Report Root (Only rendered when window.print() is executed) */}
      <PrintReport
        title={page.title}
        owner={page.owner}
        weekRange={currentWeek.range}
      />
    </div>
  );
}
