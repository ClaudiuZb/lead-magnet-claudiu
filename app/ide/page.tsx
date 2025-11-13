'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import IDEInterface from '@/components/IDEInterface';

function IDEContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || 'attio.com';

  return <IDEInterface companyUrl={url} />;
}

export default function IDEPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#1E1E1E]">Loading...</div>}>
      <IDEContent />
    </Suspense>
  );
}
