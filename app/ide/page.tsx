'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import DesktopOS from '@/components/DesktopOS';

function IDEContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url') || 'attio.com';

  return <DesktopOS companyUrl={url} />;
}

export default function IDEPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      <div className="text-white text-lg">Loading Membrane OS...</div>
    </div>}>
      <IDEContent />
    </Suspense>
  );
}
