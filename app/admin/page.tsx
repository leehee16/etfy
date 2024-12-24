'use client';

import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminPage() {
  return <AdminDashboard />;
} 