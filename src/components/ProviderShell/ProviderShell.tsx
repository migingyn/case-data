import type { FC } from 'react';
import { Outlet } from 'react-router';

/** Chrome for the provider-facing side, kept separate from the firm's app shell. */
const ProviderShell: FC = () => (
  <div className="min-h-svh bg-background">
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-6">
        <span className="text-[15px] font-semibold tracking-tight">Case Digest</span>
        <span className="text-sm text-muted-foreground">for providers</span>
      </div>
    </header>
    <main id="main" className="mx-auto max-w-3xl px-6 pt-8 pb-16">
      <Outlet />
    </main>
  </div>
);

export default ProviderShell;
