import React from 'react';
import { StudentFeeRecord } from '../types/studentFee';
import { formatCurrency, getPaymentMethodLabel } from '../utils/formatters';
import { Printer, X } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentFeeRecord | null;
  councilName?: string;
}

// Convert number to Korean currency words (e.g. 50000 -> 금 오만 원 정)
function numberToKoreanCurrency(num: number): string {
  if (!num || isNaN(num)) return '금 영 원 정';
  const units = ['', '만', '억', '조'];
  const nums = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  
  if (num === 50000) return '금 오만 원 정';
  if (num === 100000) return '금 십만 원 정';
  if (num === 150000) return '금 십오만 원 정';
  if (num === 30000) return '금 삼만 원 정';

  let result = '';
  let temp = num;
  let unitIdx = 0;

  while (temp > 0) {
    const chunk = temp % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      const c1000 = Math.floor(chunk / 1000);
      const c100 = Math.floor((chunk % 1000) / 100);
      const c10 = Math.floor((chunk % 100) / 10);
      const c1 = chunk % 10;

      if (c1000) chunkStr += (c1000 > 1 ? nums[c1000] : '') + '천';
      if (c100) chunkStr += (c100 > 1 ? nums[c100] : '') + '백';
      if (c10) chunkStr += (c10 > 1 ? nums[c10] : '') + '십';
      if (c1) chunkStr += nums[c1];

      result = chunkStr + units[unitIdx] + ' ' + result;
    }
    temp = Math.floor(temp / 10000);
    unitIdx++;
  }

  return `금 ${result.trim()} 원 정`;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  record,
  councilName = '한국대학교 제42대 총학생회',
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNum = `FEE-${record.paymentDate?.replace(/-/g, '') || '202603'}-${record.studentId.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Action Bar (hidden in print) */}
        <div className="no-print px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-semibold text-slate-700">
            학생회비 납부확인서 미리보기
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              인쇄하기
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Area */}
        <div id="printable-receipt" className="p-8 sm:p-10 bg-white text-slate-900">
          {/* Header Title */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="text-[11px] text-slate-500 font-mono tracking-widest uppercase">
              Official Student Council Fee Receipt
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              학생회비 납부확인서
            </h2>
            <div className="text-xs text-slate-500 mt-2 font-mono">
              발급번호: 제 {receiptNum} 호
            </div>
          </div>

          {/* Student Info Table */}
          <div className="my-6 border border-slate-300 rounded-sm overflow-hidden text-xs">
            <div className="grid grid-cols-4 border-b border-slate-200">
              <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">
                성 명
              </div>
              <div className="p-2.5 font-medium text-slate-900 border-r border-slate-200">
                {record.name}
              </div>
              <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">
                학 번
              </div>
              <div className="p-2.5 font-mono text-slate-900">
                {record.studentId}
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-slate-200">
              <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">
                소속학과
              </div>
              <div className="p-2.5 font-medium text-slate-900 border-r border-slate-200">
                {record.department}
              </div>
              <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">
                학년 / 나이
              </div>
              <div className="p-2.5 font-mono text-slate-900">
                {record.grade} ({record.age}세)
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-slate-200">
              <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">
                연락처
              </div>
              <div className="p-2.5 font-mono text-slate-900 border-r border-slate-200">
                {record.phone}
              </div>
              <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">
                납부구분
              </div>
              <div className="p-2.5 font-medium text-slate-900">
                {record.term}
              </div>
            </div>

            <div className="grid grid-cols-4 border-b border-slate-200">
              <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">
                납부일자
              </div>
              <div className="p-2.5 font-mono text-slate-900 border-r border-slate-200">
                {record.paymentDate}
              </div>
              <div className="p-2.5 bg-slate-50 font-semibold text-slate-700 border-r border-slate-200">
                결제수단
              </div>
              <div className="p-2.5 font-medium text-slate-900">
                {getPaymentMethodLabel(record.method)}
              </div>
            </div>

            <div className="grid grid-cols-4 bg-slate-50/50">
              <div className="p-3 bg-slate-100 font-bold text-slate-900 border-r border-slate-200">
                납부금액
              </div>
              <div className="p-3 col-span-3">
                <div className="font-bold text-slate-900 text-sm">
                  {numberToKoreanCurrency(record.amount)}
                </div>
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  (일련금액: {formatCurrency(record.amount)})
                </div>
              </div>
            </div>
          </div>

          {/* Statement */}
          <div className="text-center py-6 space-y-2">
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              위 학생은 <strong className="font-bold">{record.term}</strong> 학생회비를 정히
              납부하였음을 공식 확인합니다.
            </p>
            <p className="text-xs text-slate-500">
              본 확인서는 학생회 자치활동 혜택(과잠, 사물함, 간식사업 등) 및 증빙용으로 유효합니다.
            </p>
          </div>

          {/* Issue Date & Council Stamp */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-mono">
              발급일자: {new Date().toISOString().slice(0, 10)}
            </div>

            <div className="relative flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                {councilName}
              </span>
              {/* Graphic official red seal stamp */}
              <div className="w-12 h-12 rounded-full border-2 border-rose-600 flex items-center justify-center text-rose-600 font-bold text-[10px] leading-tight text-center rotate-[-8deg] shadow-2xs select-none">
                총학생회<br />직인
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
