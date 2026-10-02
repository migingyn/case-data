import type { FC } from 'react';
import { formatDateTime } from '@/helpers/matters';
import type { ShareEvent } from '@/types/shares';

interface ShareActivityProps {
  activity: ShareEvent[];
}

const ShareActivity: FC<ShareActivityProps> = ({ activity }) => {
  const rows = [...activity].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return (
    <section aria-labelledby="activity-heading">
      <h2 id="activity-heading" className="text-sm font-medium">
        Share activity
      </h2>
      <div className="mt-3 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/40 text-left text-[13px] text-muted-foreground">
            <tr className="border-b">
              <th scope="col" className="py-2 pr-3 pl-4 font-normal">When</th>
              <th scope="col" className="px-3 py-2 font-normal">Event</th>
              <th scope="col" className="px-3 py-2 font-normal">Version</th>
              <th scope="col" className="py-2 pr-4 pl-3 font-normal">Who</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Not shared with this provider yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-3 pl-4 font-mono text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
                    <time dateTime={row.at}>{formatDateTime(row.at)}</time>
                  </td>
                  <td className="px-3 py-2.5">{row.event}</td>
                  <td className="px-3 py-2.5 font-mono text-[13px] tabular-nums">v{row.version}</td>
                  <td className="py-2.5 pr-4 pl-3">{row.who}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ShareActivity;
