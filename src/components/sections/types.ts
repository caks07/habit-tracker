import type { Section } from '../../types';

export interface SectionProps {
  section: Section;
  readOnly: boolean;
  set: (patch: Partial<Section>) => void;
}
