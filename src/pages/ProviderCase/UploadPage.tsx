import { ArrowLeft } from 'lucide-react';
import type { FC } from 'react';
import { Link, useParams } from 'react-router';

/** Stand-in for the upload screen (screen 10) so Upload buttons resolve. */
const UploadPage: FC = () => {
  const { providerId = '', matterId = '' } = useParams();
  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/provider/${providerId}/matters/${matterId}`}
        className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to the case
      </Link>
      <h1 className="text-xl font-semibold tracking-tight">Upload documents</h1>
      <p className="text-muted-foreground">This screen isn't built yet.</p>
    </div>
  );
};

export default UploadPage;
