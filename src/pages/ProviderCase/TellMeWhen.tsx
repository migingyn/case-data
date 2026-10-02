import { useEffect, useState, type FC } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotifyPrefs, useSaveNotifyPrefs } from '@/hooks/shares';
import type { NotifyPrefs } from '@/types/shares';

interface TellMeWhenProps {
  matterId: string;
  providerId: string;
}

const options: { key: keyof NotifyPrefs; label: string }[] = [
  { key: 'milestone', label: 'The case reaches a milestone' },
  { key: 'status', label: 'The case status changes' },
  { key: 'request', label: 'The firm adds a request' },
];

/** Alert preferences that save as soon as a box changes. */
const TellMeWhen: FC<TellMeWhenProps> = ({ matterId, providerId }) => {
  const { data: prefs } = useNotifyPrefs(matterId, providerId);
  const save = useSaveNotifyPrefs(matterId, providerId);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (savedAt === null) return;
    const timer = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(timer);
  }, [savedAt]);

  return (
    <section aria-labelledby="tell-me-when" className="border-t py-5">
      <fieldset>
        <legend id="tell-me-when" className="text-sm font-semibold">
          Tell me when
        </legend>
        <div className="mt-2 flex flex-col gap-2.5">
          {options.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2.5 text-sm">
              <Checkbox
                id={`notify-${key}`}
                checked={prefs?.[key] ?? false}
                disabled={!prefs}
                onCheckedChange={(checked) => {
                  if (!prefs) return;
                  save.mutate({ ...prefs, [key]: checked === true }, { onSuccess: () => setSavedAt(Date.now()) });
                }}
              />
              <label htmlFor={`notify-${key}`} className="cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
      <p aria-live="polite" className="mt-2 min-h-5 text-[13px] text-muted-foreground">
        {save.isError ? (
          <span className="text-destructive">Couldn't save. Try again.</span>
        ) : savedAt !== null ? (
          'Saved'
        ) : null}
      </p>
    </section>
  );
};

export default TellMeWhen;
