'use client';

import React from 'react';

interface DataItem {
  type: string;
  lastUpdated: string;
  clickCount: number;
}

const AdminPage = () => {
  // 예시 데이터
  const data: DataItem[] = [
    {
      type: '투자성향 테스트 데이터',
      lastUpdated: '2023-12-23',
      clickCount: 150
    },
    {
      type: '투자지식 테스트 데이터',
      lastUpdated: '2023-12-22',
      clickCount: 120
    },
    {
      type: 'ETF 퀴즈 데이터',
      lastUpdated: '2023-12-21',
      clickCount: 200
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-200">관리자 대시보드</h1>
      
      <div className="bg-[#242424] rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#2f2f2f]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                데이터 종류
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                마지막 업데이트
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                클릭 수
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2f2f2f]">
            {data.map((item, index) => (
              <tr 
                key={index}
                className="hover:bg-[#2f2f2f] cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.lastUpdated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.clickCount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage; 