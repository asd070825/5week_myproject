import React from 'react';
import { StudentFeeRecord } from '../types/studentFee';
import { formatCurrency, getPaymentMethodLabel, getStatusLabel } from '../utils/formatters';
import { Edit2, Trash2, Printer, Check, X, FileSpreadsheet } from 'lucide-react';

interface FeeTableProps {
  records: StudentFeeRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEditRecord: (record: StudentFeeRecord) => void;
  onDeleteRecord: (id: string) => void;
  onViewReceipt: (record: StudentFeeRecord) => void;
  onToggleBenefit: (id: string) => void;
  onOpenAddModal: () => void;
}

export const FeeTable: React.FC<FeeTableProps> = ({
  records,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEditRecord,
  onDeleteRecord,
  onViewReceipt,
  onToggleBenefit,
  onOpenAddModal,
}) => {
  const isAllSelected = records.length > 0 && records.every((r) => selectedIds.includes(r.id));
  const isSomeSelected = records.some((r) => selectedIds.includes(r.id)) && !isAllSelected;

  if (records.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          등록된 학생회비 내역이 없습니다
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
          검색 조건에 맞는 내역이 없거나 아직 등록된 학생회비 명단이 없습니다.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
        >
          새 학생회비 내역 등록하기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="전체 선택"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                />
              </th>
              <th className="py-3 px-3 w-14 text-slate-400 font-mono">연번</th>
              <th className="py-3 px-3">이름</th>
              <th className="py-3 px-3">학번</th>
              <th className="py-3 px-2 w-12 text-center">나이</th>
              <th className="py-3 px-3">학과 / 학년</th>
              <th className="py-3 px-3">연락처</th>
              <th className="py-3 px-3 text-right">입금금액</th>
              <th className="py-3 px-3">납부일자</th>
              <th className="py-3 px-3 text-center">납부상태</th>
              <th className="py-3 px-3 text-center">혜택수령</th>
              <th className="py-3 px-3">결제수단/입금자</th>
              <th className="py-3 px-3 text-right">관리 / 영수증</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {records.map((record, index) => {
              const isSelected = selectedIds.includes(record.id);

              return (
                <tr
                  key={record.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(record.id)}
                      aria-label={`${record.name} 선택`}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                    />
                  </td>

                  {/* Index */}
                  <td className="py-2.5 px-3 font-mono text-slate-400 tabular-nums">
                    {index + 1}
                  </td>

                  {/* Name */}
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {record.name}
                  </td>

                  {/* Student ID */}
                  <td className="py-2.5 px-3 font-mono text-slate-800 tabular-nums whitespace-nowrap font-medium">
                    {record.studentId}
                  </td>

                  {/* Age */}
                  <td className="py-2.5 px-2 text-center font-mono tabular-nums text-slate-600">
                    {record.age}세
                  </td>

                  {/* Department & Grade */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{record.department}</div>
                    <div className="text-[11px] text-slate-400">{record.grade} · {record.term}</div>
                  </td>

                  {/* Phone */}
                  <td className="py-2.5 px-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                    {record.phone}
                  </td>

                  {/* Deposit Amount (Right aligned tabular nums) */}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(record.amount)}
                  </td>

                  {/* Payment Date */}
                  <td className="py-2.5 px-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                    {record.paymentDate || '-'}
                  </td>

                  {/* Status (Zero-pill discipline: subtle inline indicator) */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {record.status === 'PAID' && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        납부완료
                      </span>
                    )}
                    {record.status === 'PARTIAL' && (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        부분납부
                      </span>
                    )}
                    {record.status === 'UNPAID' && (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        미납
                      </span>
                    )}
                    {record.status === 'REFUNDED' && (
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        환불완료
                      </span>
                    )}
                  </td>

                  {/* Benefit Delivered (Clickable toggle button) */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleBenefit(record.id)}
                      title="클릭하여 혜택 수령여부 변경"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        record.hasReceivedBenefits
                          ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {record.hasReceivedBenefits ? (
                        <>
                          <Check className="w-3 h-3 text-purple-600" />
                          수령완료
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-slate-400" />
                          미수령
                        </>
                      )}
                    </button>
                  </td>

                  {/* Payment Method & Depositor */}
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                    <div className="font-medium text-slate-700">
                      {getPaymentMethodLabel(record.method)}
                    </div>
                    {record.depositorName && record.depositorName !== record.name && (
                      <div className="text-[11px] text-slate-400">
                        입금: {record.depositorName}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {/* View / Print Receipt */}
                      <button
                        type="button"
                        onClick={() => onViewReceipt(record)}
                        title="학생회비 납부확인서 영수증 보기"
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEditRecord(record)}
                        title="내역 수정"
                        className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(record.id)}
                        title="내역 삭제"
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
