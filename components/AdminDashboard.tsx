'use client';

import React from 'react';
import { BarChart3, Users, Clock, MousePointerClick, FileText, Search, ThumbsUp, AlertCircle, Plus, RefreshCw } from 'lucide-react';

interface EmbeddingData {
  type: string;
  lastUpdated: string;
  clickCount: number;
  relevanceScore: number;
  usageCount: number;
  documentSize: string;
}

const AdminDashboard: React.FC = () => {
  // 예시 데이터
  const data: EmbeddingData[] = [
    {
      type: 'ETF 기초 지식',
      lastUpdated: '2023-12-23',
      clickCount: 150,
      relevanceScore: 0.85,
      usageCount: 234,
      documentSize: '2.3MB'
    },
    {
      type: '투자 전략 가이드',
      lastUpdated: '2023-12-22',
      clickCount: 120,
      relevanceScore: 0.92,
      usageCount: 189,
      documentSize: '1.8MB'
    },
    {
      type: '시장 분석 리포트',
      lastUpdated: '2023-12-21',
      clickCount: 200,
      relevanceScore: 0.78,
      usageCount: 312,
      documentSize: '3.1MB'
    }
  ];

  const stats = [
    {
      title: '총 임베딩 문서',
      value: '15개',
      icon: <FileText className="w-6 h-6" />,
      change: '+3개',
      changeType: 'positive'
    },
    {
      title: '평균 관련성 점수',
      value: '0.85',
      icon: <ThumbsUp className="w-6 h-6" />,
      change: '+0.05',
      changeType: 'positive'
    },
    {
      title: '총 검색 횟수',
      value: '735회',
      icon: <Search className="w-6 h-6" />,
      change: '+12.3%',
      changeType: 'positive'
    },
    {
      title: '데이터 활용도',
      value: '89%',
      icon: <BarChart3 className="w-6 h-6" />,
      change: '+5.3%',
      changeType: 'positive'
    }
  ];

  // 추천 데이터
  const recommendations = {
    newDocuments: [
      {
        title: '2024년 ETF 시장 전망',
        reason: '최신 시장 동향 반영 필요',
        priority: 'high'
      },
      {
        title: '패시브 투자 전략 가이드',
        reason: '사용자 요청 증가',
        priority: 'medium'
      }
    ],
    updateNeeded: [
      {
        title: '글로벌 ETF 투자 가이드',
        reason: '6개월 이상 미업데이트',
        lastUpdate: '2023-06-15'
      },
      {
        title: '채권 ETF 분석',
        reason: '낮은 관련성 점수 (0.65)',
        lastUpdate: '2023-08-20'
      }
    ]
  };

  return (
    <div className="h-full">
      <div className="max-w-[1600px] mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-200 mb-2">임베딩 데이터 대시보드</h1>
          <p className="text-gray-400">임베딩된 문서의 현황과 활용도를 확인하세요.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#242424] rounded-lg p-6 border border-[#2f2f2f] hover:border-[#3f3f3f] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#2f2f2f] rounded-lg">
                  {stat.icon}
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-200">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 데이터 추천 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 새로 추가 추천 문서 */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#2f2f2f]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-200">추가 추천 문서</h3>
              </div>
              <span className="text-xs text-gray-400">총 {recommendations.newDocuments.length}개</span>
            </div>
            <div className="space-y-4">
              {recommendations.newDocuments.map((doc, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-[#2f2f2f] hover:bg-[#3f3f3f] transition-colors">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-200 mb-1">{doc.title}</h4>
                    <p className="text-xs text-gray-400">{doc.reason}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    doc.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {doc.priority === 'high' ? '높은 우선순위' : '중간 우선순위'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 업데이트 필요 문서 */}
          <div className="bg-[#242424] rounded-lg p-6 border border-[#2f2f2f]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-200">업데이트 필요 문서</h3>
              </div>
              <span className="text-xs text-gray-400">총 {recommendations.updateNeeded.length}개</span>
            </div>
            <div className="space-y-4">
              {recommendations.updateNeeded.map((doc, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-[#2f2f2f] hover:bg-[#3f3f3f] transition-colors">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-200 mb-1">{doc.title}</h4>
                    <p className="text-xs text-gray-400">{doc.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">마지막 업데이트</div>
                    <div className="text-xs text-gray-300">{doc.lastUpdate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className="bg-[#242424] rounded-lg shadow-lg overflow-hidden border border-[#2f2f2f]">
          <div className="p-6 border-b border-[#2f2f2f]">
            <h2 className="text-lg font-semibold text-gray-200">임베딩 데이터 현황</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2f2f2f] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      문서 종류
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      업데이트
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      관련성 점수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      사용 횟수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      문서 크기
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      조회수
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2f2f2f]">
                  {/* 테스트를 위해 데이터를 복제하여 더 많은 행 추가 */}
                  {[...data, ...data, ...data, ...data].map((item, index) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full ${
                          item.relevanceScore >= 0.9 ? 'bg-green-500/20 text-green-500' :
                          item.relevanceScore >= 0.8 ? 'bg-blue-500/20 text-blue-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {(item.relevanceScore * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {item.usageCount.toLocaleString()}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {item.documentSize}
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 