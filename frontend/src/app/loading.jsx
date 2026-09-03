'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-200 dark:bg-slate-800 overflow-hidden">
      <div className="h-full bg-blue-600 dark:bg-blue-500 w-1/3 animate-shimmer rounded-r-full" />
    </div>
  );
}
