'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function AdminNav() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const withToken = (path: string) => {
    return token ? `${path}?token=${token}` : path;
  };

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link href={withToken('/admin')} className="font-semibold text-gray-900">
        ink
      </Link>
      <Link href={withToken('/admin')} className="text-gray-500 hover:text-gray-900 transition-colors">
        Content
      </Link>
      <Link href={withToken('/admin/import')} className="text-gray-500 hover:text-gray-900 transition-colors">
        Import
      </Link>
      <Link href={withToken('/admin/settings')} className="text-gray-500 hover:text-gray-900 transition-colors">
        Settings
      </Link>
    </nav>
  );
}
