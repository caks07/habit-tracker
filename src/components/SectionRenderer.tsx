import type { Section } from '../types';
import { ScheduleSection } from './sections/ScheduleSection';
import { HabitSection } from './sections/HabitSection';
import { CheckSection } from './sections/CheckSection';
import {
  BookmarkSection,
  CalloutSection,
  HeadingSection,
  NoteSection,
  ProgressSection,
  SpacerSection,
} from './sections/TextSections';
import {
  ClockSection,
  DividerSection,
  GallerySection,
  ImageSection,
  ProfileSection,
  QuoteSection,
} from './sections/MediaSections';
import { LinkedViewRenderer } from './views/LinkedViewRenderer';
import { RecordCardBlock } from './views/RecordCardBlock';

export function SectionRenderer({
  section,
  readOnly = false,
  set,
}: {
  section: Section;
  readOnly?: boolean;
  set: (patch: Partial<Section>) => void;
}) {
  // 1. Linked Database View & Multi-Source Linked View (PART 2 & 3)
  if (
    section.type === 'linked_database' ||
    section.type === 'linked_multi_database' ||
    section.type === 'linked-view'
  ) {
    const multiSources =
      section.sourceDatabases ||
      section.linkedConfig?.sourceDatabases ||
      section.linkedConfig?.sourceTableIds;

    if (multiSources && multiSources.length > 0) {
      return (
        <LinkedViewRenderer
          config={{
            id: section.viewId || section.id,
            title: section.title || '',
            sourceDatabases: multiSources,
            viewType: section.view?.type || section.linkedConfig?.viewType || 'board',
            filters: section.view?.filters || section.linkedConfig?.filters || [],
            sorts: section.view?.sorts || section.linkedConfig?.sorts || [],
            groupBy: section.view?.groupBy || section.linkedConfig?.groupBy || 'day',
            visibleProperties: section.view?.visibleProperties,
            span: section.layout?.w || section.span || 12,
            limit: section.view?.limit,
            activeSourceFilter: section.view?.activeSourceFilter,
          }}
          readOnly={readOnly}
        />
      );
    }

    if (section.linkedConfig) {
      return <LinkedViewRenderer config={section.linkedConfig} readOnly={readOnly} />;
    }
    if (section.sourceDatabaseId && section.view) {
      return (
        <LinkedViewRenderer
          config={{
            id: section.viewId || section.id,
            title: section.title || '',
            sourceTableId: section.sourceDatabaseId,
            sourceDatabases: [section.sourceDatabaseId],
            viewType: section.view.type,
            filters: section.view.filters || [],
            sorts: section.view.sorts || [],
            groupBy: section.view.groupBy,
            visibleProperties: section.view.visibleProperties,
            span: section.layout?.w || section.span || 12,
            limit: section.view.limit,
          }}
          readOnly={readOnly}
        />
      );
    }
    return null;
  }

  // 2. Specific Record Card (PART 4 & 6)
  if (section.type === 'record_card') {
    return <RecordCardBlock block={section} readOnly={readOnly} />;
  }

  // 3. Content Blocks & Specialized Widgets
  const subtype = section.contentSubtype || section.type;

  switch (subtype) {
    case 'image':
      return <ImageSection section={section} readOnly={readOnly} set={set} />;
    case 'quote':
      return <QuoteSection section={section} readOnly={readOnly} set={set} />;
    case 'heading':
      return <HeadingSection section={section} readOnly={readOnly} set={set} />;
    case 'callout':
      return <CalloutSection section={section} readOnly={readOnly} set={set} />;
    case 'bookmark':
      return <BookmarkSection section={section} readOnly={readOnly} set={set} />;
    case 'spacer':
      return <SpacerSection section={section} readOnly={readOnly} set={set} />;
    case 'divider':
      return <DividerSection section={section} readOnly={readOnly} set={set} />;
    case 'clock':
      return <ClockSection section={section} readOnly={readOnly} set={set} />;
    case 'note':
      return <NoteSection section={section} readOnly={readOnly} set={set} />;
    case 'progress':
      return <ProgressSection section={section} readOnly={readOnly} set={set} />;
    case 'profile':
      return <ProfileSection section={section} readOnly={readOnly} set={set} />;
    case 'gallery':
      return <GallerySection section={section} readOnly={readOnly} set={set} />;
    case 'schedule':
      return <ScheduleSection section={section} readOnly={readOnly} set={set} />;
    case 'habit':
      return <HabitSection section={section} readOnly={readOnly} set={set} />;
    case 'check':
      return <CheckSection section={section} readOnly={readOnly} set={set} />;
    default:
      return null;
  }
}

