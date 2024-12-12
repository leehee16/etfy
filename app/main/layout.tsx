'use client';

import React from 'react';
import '../../src/styles/main.css';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white">
      {children}
    </div>
  );
} 