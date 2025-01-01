import React, { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useArchiveStore } from '@/lib/store/archiveStore';

interface Report {
  id: string;
  title: string;
  content: string;
  date: string;
  userId: string;
  metadata?: {
    createdAt: string;
    sessionCount: number;
    contexts: string[];
  };
}

interface ArchiveProps {
  userId: string;
  reports: { [key: string]: Report[] };
  onReportClick: (report: Report) => void;
}

const Archive: React.FC<ArchiveProps> = ({ userId, reports, onReportClick }) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderReportContent = (content: string) => {
    try {
      const parsedContent = JSON.parse(content);
      return (
        <div className="space-y-4 text-sm text-gray-300">
          {/* 요약 */}
          <div>
            <h3 className="font-bold mb-2">요약</h3>
            <p className="text-gray-400">{parsedContent.summary}</p>
          </div>

          {/* 섹션들 */}
          {parsedContent.sections?.map((section: any, index: number) => (
            <div key={index}>
              <h3 className="font-bold mb-2">{section.title}</h3>
              <p className="text-gray-400 mb-2">{section.content}</p>
              
              {/* 추천사항 */}
              {section.recommendations?.length > 0 && (
                <div className="ml-4 mt-2">
                  <h4 className="font-semibold mb-1 text-gray-300">추천사항:</h4>
                  <ul className="list-disc list-inside text-gray-400">
                    {section.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {/* 결론 */}
          {parsedContent.conclusion && (
            <div>
              <h3 className="font-bold mb-2">결론</h3>
              <p className="text-gray-400">{parsedContent.conclusion}</p>
            </div>
          )}

          {/* 모든 참고자료를 하나로 모아서 표시 */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h3 className="font-bold mb-2">참고자료</h3>
            <ul className="list-disc list-inside text-gray-400">
              {parsedContent.sections?.flatMap((section: any) => 
                section.references || []
              )
              .filter((ref: string, index: number, self: string[]) => 
                self.indexOf(ref) === index
              )
              .map((ref: string, index: number) => (
                <li key={index}>{ref}</li>
              ))}
            </ul>
          </div>

          {/* 고지사항 */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h3 className="font-bold mb-2">고지사항</h3>
            <div className="space-y-4 text-gray-400">
              <p>이 서비스는 금융상품에 대한 정보를 알려드리기 위한 곳이에요.<br />
              투자 권유나 금융상품 추천을 드리려는 건 아니니 참고만 해주세요.</p>
              <p>ETFy는 투자 자문이나 금융상품 추천 기능이 없어요.<br />
              결국 어떤 결정을 내릴지는 고객님이 직접 고민하고 판단하셔야 해요.</p>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return <p className="text-red-400">보고서 내용을 불러올 수 없습니다.</p>;
    }
  };

  const userReports = reports[userId] || [];
  const sortedReports = [...userReports].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {sortedReports.map((report) => (
              <div 
                key={report.id}
                className="bg-[#242424] rounded-lg shadow-lg"
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#2f2f2f] transition-colors"
                  onClick={() => toggleFolder(report.id)}
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <span className="text-gray-300 whitespace-nowrap">{formatDate(report.date)}</span>
                    <h3 className="text-gray-200 font-medium truncate">{report.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const content = JSON.parse(report.content);
                        const blob = new Blob(
                          [JSON.stringify(content, null, 2)],
                          { type: 'application/json' }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${report.title}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-300"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const { removeReport } = useArchiveStore.getState();
                        if (window.confirm('이 보고서를 삭제하시겠습니까?')) {
                          removeReport(userId, report.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {expandedFolders.includes(report.id) && (
                  <div className="p-6 border-t border-[#2f2f2f]">
                    <div className="max-h-[600px] overflow-y-auto pr-2">
                      {renderReportContent(report.content)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;

