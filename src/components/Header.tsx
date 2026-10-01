import React from 'react';
import { Download, Plus, Upload, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onExportAllExcel: () => void;
  onResetData: () => void;
  councilName?: string;
  totalRecordsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenImportModal,
  onExportAllExcel,
  onResetData,
  councilName = '한국대학교 제42대 총학생회',
  totalRecordsCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xs shrink-0">
            Fee
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 leading-tight truncate">
              대학생회비 관리 시스템
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden md:block truncate">
              {councilName} · 총 {totalRecordsCount}명 등록됨
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean text) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 shrink-0">
          <span className="text-blue-700 font-semibold cursor-default">
            회비 입출금 내역
          </span>
          <button 
            type="button" 
            onClick={onResetData}
            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-normal"
            title="초기 샘플 데이터로 복원"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            샘플데이터 리셋
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="엑셀/CSV 일괄 불러오기"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
            <span className="hidden sm:inline">가져오기</span>
          </button>

          <button
            type="button"
            onClick={onExportAllExcel}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            title="전체 학생회비 내역을 엑셀 파일(.xlsx)로 저장"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <span><span className="hidden md:inline">엑셀 </span>다운로드</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            title="신규 학생회비 내역 등록"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span><span className="hidden sm:inline">내역 </span>등록</span>
          </button>
        </div>
      </div>
    </header>
  );
};
