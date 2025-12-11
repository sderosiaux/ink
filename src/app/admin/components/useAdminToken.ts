'use client';

import { useSearchParams } from 'next/navigation';

export function useAdminToken() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const withToken = (path: string) => {
    return token ? `${path}?token=${token}` : path;
  };

  return { token, withToken };
}
