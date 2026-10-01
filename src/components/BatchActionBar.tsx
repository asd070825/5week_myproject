import React from 'react';
import { FileSpreadsheet, CheckCircle2, Gift, Trash2, X } from 'lucide-react';

interface BatchActionBarProps {
  selectedCount: number;
  onExportSelected: () => void;
  onBatchMarkPaid: () => void;
  onBatchToggleBenefit: () => void;
  onBatchDelete: () => void;
  onClearSelection: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onExportSelected,
  onBatchMarkPaid,
  onBatchToggleBenefit,
  onBatchDelete,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs w-[calc(100vw-1.5rem)] max-w-xl justify-between overflow-x-auto">
      <div className="flex items-center gap-1.5 sm:gap-2 border-r border-slate-700 pr-2 sm:pr-3 font-medium shrink-0">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="font-mono tabular-nums font-bold text-blue-300">
          {selectedCount}
        </span>
        <span className="hidden xs:inline">명 선택</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Export selected to Excel */}
        <button
          type="button"
          onClick={onExportSelected}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors whitespace-nowrap"
          title="선택된 항목만 엑셀로 저장"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
          <span>선택 엑셀</span>
        </button>

        {/* Mark paid */}
        <button
          type="button"
          onClick={onBatchMarkPaid}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors whitespace-nowrap"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>완납처리</span>
        </button>

        {/* Deliver benefit */}
        <button
          type="button"
          onClick={onBatchToggleBenefit}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors whitespace-nowrap"
        >
          <Gift className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>혜택지급</span>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={onBatchDelete}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-medium transition-colors whitespace-nowrap"
          title="선택된 항목 일괄 삭제"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="hidden sm:inline">삭제</span>
        </button>
      </div>

      {/* Clear selection */}
      <button
        type="button"
        onClick={onClearSelection}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
        title="선택 해제"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
