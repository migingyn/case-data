import type { FC } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { formatNameList } from '@/helpers/shares';
import type { ProviderUser, ShareSettings } from '@/types/shares';

interface ShareFooterProps {
  providerName: string;
  settings: ShareSettings;
  users: ProviderUser[];
  /** Version the provider currently sees, or null if never published. */
  liveVersion: number | null;
  isRevoked: boolean;
  now: number;
  isSaving: boolean;
  isPublishing: boolean;
  isRevoking: boolean;
  onChange: (patch: Partial<ShareSettings>) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onRevoke: () => void;
}

/** yyyy-mm-dd in local time, for <input type="date">. */
const toDateInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const ShareFooter: FC<ShareFooterProps> = ({
  providerName,
  settings,
  users,
  liveVersion,
  isRevoked,
  now,
  isSaving,
  isPublishing,
  isRevoking,
  onChange,
  onSaveDraft,
  onPublish,
  onRevoke,
}) => {
  const nextVersion = (liveVersion ?? 0) + 1;
  const names = formatNameList(users.filter((u) => settings.recipientIds.includes(u.id)).map((u) => u.name));
  const isLive = liveVersion !== null && !isRevoked;
  const toggleRecipient = (id: string, on: boolean) =>
    onChange({
      recipientIds: on ? [...settings.recipientIds, id] : settings.recipientIds.filter((r) => r !== id),
    });

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
      <p className="text-sm" aria-live="polite">
        {isLive
          ? `Publishing creates version ${nextVersion}. The provider keeps seeing version ${liveVersion} until then.`
          : names
            ? `Publishes version ${nextVersion} and notifies ${names}.`
            : `Publishes version ${nextVersion}. Choose at least one recipient to notify.`}
      </p>

      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="share-expiry" className="text-[13px] font-medium">
            Access expires
          </label>
          <Input
            id="share-expiry"
            type="date"
            value={toDateInput(settings.expiresAt)}
            min={toDateInput(new Date(now).toISOString())}
            onChange={(event) => {
              if (event.target.value) {
                onChange({ expiresAt: new Date(`${event.target.value}T23:59:59`).toISOString() });
              }
            }}
            className="h-9 w-44 bg-background font-mono tabular-nums"
          />
        </div>

        <fieldset className="flex min-w-0 flex-col gap-1.5">
          <legend className="text-[13px] font-medium">Recipients at {providerName}</legend>
          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  id={`recipient-${user.id}`}
                  checked={settings.recipientIds.includes(user.id)}
                  onCheckedChange={(checked) => toggleRecipient(user.id, checked === true)}
                />
                <label htmlFor={`recipient-${user.id}`} className="cursor-pointer">
                  {user.name} <span className="text-muted-foreground">· {user.role}</span>
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onSaveDraft} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save draft'}
        </Button>
        <Button onClick={onPublish} disabled={isPublishing || settings.recipientIds.length === 0}>
          {isPublishing ? 'Publishing…' : 'Publish and notify'}
        </Button>
        {isLive && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="ml-auto text-destructive hover:text-destructive" disabled={isRevoking}>
                Revoke access
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke access for {providerName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  They will immediately stop seeing this case. You can publish again later to restore access.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onRevoke}>
                  Revoke access
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default ShareFooter;
