import React from 'react';
import { StudentFeeRecord } from '../types/studentFee';
import { formatCurrency } from '../utils/formatters';
import { Users, CheckCircle2, AlertCircle, Gift } from 'lucide-react';

interface StatsDashboardProps {
  records: StudentFeeRecord[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ records }) => {
  const totalCount = records.length;
  const paidRecords = records.filter(r => r.status === 'PAID');
  const partialRecords = records.filter(r => r.status === 'PARTIAL');
  const unpaidRecords = records.filter(r => r.status === 'UNPAID');
  const refundedRecords = records.filter(r => r.status === 'REFUNDED');

  const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0);
  const paidAmount = paidRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  
  const paymentRate = totalCount > 0 ? Math.round((paidRecords.length / totalCount) * 100) : 0;
  const benefitsDeliveredCount = records.filter(r => r.hasReceivedBenefits).length;

  // Department breakdown
  const departmentCounts: Record<string, { count: number; amount: number }> = {};
  records.forEach(r => {
    const dept = r.department || '기타';
    if (!departmentCounts[dept]) {
      departmentCounts[dept] = { count: 0, amount: 0 };
    }
    departmentCounts[dept].count += 1;
    departmentCounts[dept].amount += r.amount || 0;
  });

  const sortedDepts = Object.entries(departmentCounts)
    .sort((a, b) => b[1].amount - a[1].amount)
    .slice(0, 5);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
      {/* 4 Core Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-5 border-b border-slate-100">
        {/* Metric 1: Total Amount */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            총 납부 수납액
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
            {formatCurrency(totalAmount)}
          </div>
          <span className="text-xs text-slate-400 mt-1">
            완납 기준: <span className="font-mono tabular-nums text-slate-600">{formatCurrency(paidAmount)}</span>
          </span>
        </div>

        {/* Metric 2: Paid Count & Rate */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            납부 완료율
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {paymentRate}%
            </span>
            <span className="text-xs text-emerald-700 font-medium font-mono tabular-nums">
              ({paidRecords.length}/{totalCount}명)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${paymentRate}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Pending & Unpaid */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            미납 및 부분납부
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {unpaidRecords.length + partialRecords.length}
            <span className="text-sm font-normal text-slate-500 ml-1">명</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            부분납 {partialRecords.length}명 · 미납 {unpaidRecords.length}명
            {refundedRecords.length > 0 && ` · 환불 ${refundedRecords.length}명`}
          </span>
        </div>

        {/* Metric 4: Benefits Delivered */}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-purple-600" />
            학생회 혜택 지급
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {benefitsDeliveredCount}
            <span className="text-sm font-normal text-slate-500 ml-1">건 수령</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            사물함/과잠/간식 등 지급 완료
          </span>
        </div>
      </div>

      {/* Quick Department Distribution Bar */}
      {sortedDepts.length > 0 && (
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="font-medium text-slate-600 whitespace-nowrap">
            주요 학과별 수납 현황:
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-500">
            {sortedDepts.map(([dept, data]) => (
              <span key={dept} className="inline-flex items-center gap-1">
                <span className="font-medium text-slate-800">{dept}</span>
                <span className="font-mono tabular-nums text-slate-500">
                  {data.count}명 ({formatCurrency(data.amount)})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
