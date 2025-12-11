import { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminNav } from './components/AdminNav';

export const metadata: Metadata = {
  title: 'Admin | ink',
  robots: 'noindex, nofollow',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 flex h-14 items-center">
          <Suspense fallback={<div className="text-sm text-gray-400">Loading...</div>}>
            <AdminNav />
          </Suspense>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
