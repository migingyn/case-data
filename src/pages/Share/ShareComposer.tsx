import { ExternalLink } from 'lucide-react';
import { useState, type FC } from 'react';
import { toast } from 'sonner';
import Panel from '@/components/Panel/Panel';
import ProviderCaseView from '@/components/ProviderCaseView/ProviderCaseView';
import { buildProviderView, formatNameList } from '@/helpers/shares';
import { useFirm } from '@/hooks/firm';
import { usePublishShare, useRevokeShare, useSaveShareDraft } from '@/hooks/shares';
import type { Matter, MatterDetail, Provider } from '@/types/matters';
import type { ProviderUser, Share, ShareSettings } from '@/types/shares';
import ShareActivity from './ShareActivity';
import ShareFooter from './ShareFooter';
import SectionsPanel from './SectionsPanel';

interface ShareComposerProps {
  matter: Matter;
  detail: MatterDetail;
  provider: Provider;
  users: ProviderUser[];
  share: Share | undefined;
  initialSettings: ShareSettings;
  now: number;
}

/** Keyed by provider, so switching providers starts from that provider's saved settings. */
const ShareComposer: FC<ShareComposerProps> = ({ matter, detail, provider, users, share, initialSettings, now }) => {
  const [settings, setSettings] = useState(initialSettings);
  const saveDraft = useSaveShareDraft(matter.id);
  const publish = usePublishShare(matter.id);
  const revoke = useRevokeShare(matter.id);

  const update = (patch: Partial<ShareSettings>) => setSettings((current) => ({ ...current, ...patch }));
  const liveVersion = share?.published?.version ?? null;
  const firmName = useFirm().data?.name ?? 'The firm';
  const preview = buildProviderView({ firmName, matter, detail, provider, settings, now });
  const recipientNames = formatNameList(
    users.filter((user) => settings.recipientIds.includes(user.id)).map((user) => user.name),
  );

  const onError = (error: Error) => toast.error(`Couldn't save the share: ${error.message}`);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <SectionsPanel matterId={matter.id} providerId={provider.id} settings={settings} onChange={update} />
        <Panel
          id="preview-heading"
          title="Preview as the provider sees it"
          action={
            <a
              href={`/provider/${provider.id}/matters/${matter.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm text-[13px] text-muted-foreground hover:text-foreground"
            >
              Open full preview
              <ExternalLink aria-hidden className="size-3.5" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          }
        >
          <div aria-live="polite">
            <ProviderCaseView
              view={preview}
              version={(liveVersion ?? 0) + 1}
              updatedAt={new Date(now).toISOString()}
              now={now}
              mode="preview"
            />
          </div>
        </Panel>
      </div>

      <ShareFooter
        providerName={provider.name}
        settings={settings}
        users={users}
        liveVersion={liveVersion}
        isRevoked={share?.revokedAt != null}
        now={now}
        isSaving={saveDraft.isPending}
        isPublishing={publish.isPending}
        isRevoking={revoke.isPending}
        onChange={update}
        onSaveDraft={() =>
          saveDraft.mutate({ providerId: provider.id, settings }, { onSuccess: () => toast('Draft saved'), onError })
        }
        onPublish={() =>
          publish.mutate(
            { providerId: provider.id, settings, view: preview },
            {
              onSuccess: (saved) =>
                toast.success(`Notification sent to ${recipientNames}`, {
                  description: `Version ${saved.published?.version} is now live for ${provider.name}.`,
                }),
              onError,
            },
          )
        }
        onRevoke={() =>
          revoke.mutate(provider.id, {
            onSuccess: () => toast(`Access revoked for ${provider.name}`),
            onError,
          })
        }
      />

      <ShareActivity activity={share?.activity ?? []} />
    </div>
  );
};

export default ShareComposer;
