import type { FC } from 'react';
import { Link, Outlet } from 'react-router';

const AppShell: FC = () => (
  <div className="min-h-svh bg-background">
    <a
      href="#main"
      className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      Skip to content
    </a>
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
        <Link to="/app" className="rounded-sm text-[15px] font-semibold tracking-tight">
          Case Digest
        </Link>
      </div>
    </header>
    <main id="main" className="mx-auto max-w-7xl px-6 pt-8 pb-16">
      <Outlet />
    </main>
  </div>
);

export default AppShell;
