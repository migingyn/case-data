import { Lock, TriangleAlert } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { Link } from 'react-router';
import Panel from '@/components/Panel/Panel';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { coverageLevelLabels, selectedPageCount } from '@/helpers/shares';
import { coverageLevelSchema, type ShareSettings } from '@/types/shares';

type Toggle = 'status' | 'coverage' | 'milestones' | 'treatment' | 'requests' | 'summary' | 'documents';

interface SectionsPanelProps {
  matterId: string;
  providerId: string;
  settings: ShareSettings;
  onChange: (patch: Partial<ShareSettings>) => void;
}

interface RowProps {
  id: Toggle;
  title: string;
  description?: string;
  settings: ShareSettings;
  onChange: (patch: Partial<ShareSettings>) => void;
  children?: ReactNode;
}

const Row: FC<RowProps> = ({ id, title, description, settings, onChange, children }) => (
  <li className="flex gap-3 py-3">
    <Checkbox
      id={`share-${id}`}
      checked={settings[id]}
      onCheckedChange={(checked) => onChange({ [id]: checked === true })}
      className="mt-0.5"
    />
    <div className="min-w-0 flex-1">
      <label htmlFor={`share-${id}`} className="block cursor-pointer text-sm font-medium">
        {title}
      </label>
      {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  </li>
);

const SectionsPanel: FC<SectionsPanelProps> = ({ matterId, providerId, settings, onChange }) => {
  const rowProps = { settings, onChange };
  const pages = selectedPageCount(settings);
  return (
    <Panel id="sections-heading" title="What they can see">
      <ul className="-my-3 flex flex-col divide-y">
        <Row id="status" title="Case status" description="Active, settled or closed" {...rowProps} />
        <Row id="coverage" title="Coverage" {...rowProps}>
          <label htmlFor="share-coverage-level" className="sr-only">
            Coverage detail
          </label>
          <Select
            value={settings.coverageLevel}
            onValueChange={(value) => onChange({ coverageLevel: coverageLevelSchema.parse(value) })}
            disabled={!settings.coverage}
          >
            <SelectTrigger id="share-coverage-level" className="w-full max-w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {coverageLevelSchema.options.map((level) => (
                <SelectItem key={level} value={level}>
                  {coverageLevelLabels[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {settings.coverage && settings.coverageLevel === 'limits' && (
            <p role="status" className="mt-2 flex items-start gap-1.5 text-[13px] text-warning">
              <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              The provider will see the dollar amount of the policy limits.
            </p>
          )}
        </Row>
        <Row id="milestones" title="Case milestones" {...rowProps} />
        <Row id="treatment" title="Treatment timeline and attendance" description="Across all providers" {...rowProps} />
        <Row id="requests" title="What our office needs from them" description="Open requests" {...rowProps} />
        <Row id="summary" title="Case summary" description="Plain-language, no figures or strategy" {...rowProps} />
        <Row id="documents" title="Documents" {...rowProps}>
          <Link
            to={`/app/matters/${matterId}/share/pages?provider=${providerId}`}
            className="rounded-sm text-[13px] text-foreground underline underline-offset-4"
          >
            <span className="font-mono tabular-nums">{pages}</span> selected, choose pages
          </Link>
        </Row>
        <li className="flex gap-3 py-3 text-sm">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p>
            Attorney notes, valuation, strategy:{' '}
            <span className="font-medium text-muted-foreground">Never shared</span>
          </p>
        </li>
      </ul>
    </Panel>
  );
};

export default SectionsPanel;
