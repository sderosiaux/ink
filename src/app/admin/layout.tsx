import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Publishing Engine',
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
          <nav className="flex items-center gap-6 text-sm">
            <a href="/admin" className="font-semibold text-gray-900">
              Publishing Engine
            </a>
            <a href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">
              Content
            </a>
            <a href="/admin/import" className="text-gray-500 hover:text-gray-900 transition-colors">
              Import
            </a>
            <a href="/admin/settings" className="text-gray-500 hover:text-gray-900 transition-colors">
              Settings
            </a>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
