import React from 'react';
import { Search, RotateCcw, Filter, ArrowUpDown } from 'lucide-react';
import { DEPARTMENTS, FeeFilterOptions, SortOption } from '../types/studentFee';

interface FilterBarProps {
  filter: FeeFilterOptions;
  onFilterChange: (newFilter: FeeFilterOptions) => void;
  sort: SortOption;
  onSortChange: (newSort: SortOption) => void;
  totalFilteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  totalFilteredCount,
  totalCount,
}) => {
  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filter, status });
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      department: 'all',
      grade: 'all',
      status: 'all',
      benefitsStatus: 'all',
      dateRange: { start: '', end: '' },
    });
  };

  const isFiltered =
    filter.searchQuery !== '' ||
    filter.department !== 'all' ||
    filter.grade !== 'all' ||
    filter.status !== 'all' ||
    filter.benefitsStatus !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-xs space-y-3">
      {/* Top row: Search input + Status Tabs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
            placeholder="이름, 학번, 연락처(010), 학과명 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Status Segmented Control (Interactive Filter Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto shrink-0">
          {[
            { id: 'all', label: '전체' },
            { id: 'PAID', label: '납부완료' },
            { id: 'PARTIAL', label: '부분납부' },
            { id: 'UNPAID', label: '미납' },
            { id: 'REFUNDED', label: '환불완료' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleStatusChange(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter.status === item.id
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Department, Grade, Benefit status, Sort, Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Select */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">학과:</span>
            <select
              value={filter.department}
              onChange={(e) => onFilterChange({ ...filter, department: e.target.value })}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="all">전체 학과</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Select */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">학년:</span>
            <select
              value={filter.grade}
              onChange={(e) => onFilterChange({ ...filter, grade: e.target.value })}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="all">전체 학년</option>
              <option value="1학년">1학년</option>
              <option value="2학년">2학년</option>
              <option value="3학년">3학년</option>
              <option value="4학년">4학년</option>
            </select>
          </div>

          {/* Benefits Select */}
          <div className="flex items-center gap-1">
            <span className="text-slate-500">혜택수령:</span>
            <select
              value={filter.benefitsStatus}
              onChange={(e) => onFilterChange({ ...filter, benefitsStatus: e.target.value })}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="all">전체</option>
              <option value="received">수령완료</option>
              <option value="not_received">미수령</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md"
            >
              <RotateCcw className="w-3 h-3" />
              필터 초기화
            </button>
          )}
        </div>

        {/* Right side: Sort & Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">정렬:</span>
            <select
              value={`${sort.field}-${sort.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [any, any];
                onSortChange({ field, direction });
              }}
              className="py-1 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:border-blue-600"
            >
              <option value="paymentDate-desc">입금일자 최신순</option>
              <option value="paymentDate-asc">입금일자 과거순</option>
              <option value="amount-desc">입금금액 높은순</option>
              <option value="amount-asc">입금금액 낮은순</option>
              <option value="studentId-asc">학번 오름차순</option>
              <option value="name-asc">이름 가나다순</option>
            </select>
          </div>

          <div className="text-slate-500 font-mono tabular-nums">
            검색 결과: <strong className="text-slate-800">{totalFilteredCount}</strong> / {totalCount}명
          </div>
        </div>
      </div>
    </div>
  );
};
