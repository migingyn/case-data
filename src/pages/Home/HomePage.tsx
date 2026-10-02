import type { FC } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/hooks/auth';

const HomePage: FC = () => {
  const { user, isLoading } = useSession();

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-6 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Case Digest</h1>
        <p className="text-muted-foreground">
          A visual digest of a matter, for the firm and its treating providers.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Supabase auth state for this browser.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-32" />
          ) : user ? (
            <Badge>Signed in</Badge>
          ) : (
            <Badge variant="secondary">Signed out</Badge>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default HomePage;
