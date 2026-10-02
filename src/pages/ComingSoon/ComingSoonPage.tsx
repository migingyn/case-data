import { ArrowLeft } from 'lucide-react';
import type { FC } from 'react';
import { Link, useParams } from 'react-router';

interface ComingSoonPageProps {
  title: string;
}

/** Stand-in for matter sub-screens that aren't built yet, so links resolve. */
const ComingSoonPage: FC<ComingSoonPageProps> = ({ title }) => {
  const { id = '' } = useParams();
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link
        to={`/app/matters/${id}`}
        className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to matter
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">This screen isn't built yet.</p>
    </div>
  );
};

export default ComingSoonPage;
