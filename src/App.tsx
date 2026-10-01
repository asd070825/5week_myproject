/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { FilterBar } from './components/FilterBar';
import { FeeTable } from './components/FeeTable';
import { FeeModal } from './components/FeeModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ReceiptModal } from './components/ReceiptModal';
import { BatchActionBar } from './components/BatchActionBar';
import { INITIAL_STUDENT_FEES } from './data/mockData';
import {
  FeeFilterOptions,
  SortOption,
  StudentFeeRecord,
} from './types/studentFee';
import { exportStudentFeesToCsv, exportStudentFeesToExcel } from './utils/excelUtils';
import { CheckCircle2, Download, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'univ_student_fees_data_v1';

export default function App() {
  // 1. Data State (Persistent in LocalStorage)
  const [records, setRecords] = useState<StudentFeeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load records from storage', e);
    }
    return INITIAL_STUDENT_FEES;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to storage', e);
    }
  }, [records]);

  // 2. Filter & Sort State
  const [filter, setFilter] = useState<FeeFilterOptions>({
    searchQuery: '',
    department: 'all',
    grade: 'all',
    status: 'all',
    benefitsStatus: 'all',
    dateRange: { start: '', end: '' },
  });

  const [sort, setSort] = useState<SortOption>({
    field: 'paymentDate',
    direction: 'desc',
  });

  // 3. Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 4. Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentFeeRecord | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState<StudentFeeRecord | null>(null);

  // 5. Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // 6. Filter & Sort Logic
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // Filter: Search Query (Name, Student ID, Phone, Department, Depositor Name)
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
          r.department.toLowerCase().includes(q) ||
          (r.depositorName && r.depositorName.toLowerCase().includes(q))
      );
    }

    // Filter: Department
    if (filter.department !== 'all') {
      result = result.filter((r) => r.department === filter.department);
    }

    // Filter: Grade
    if (filter.grade !== 'all') {
      result = result.filter((r) => r.grade === filter.grade);
    }

    // Filter: Status
    if (filter.status !== 'all') {
      result = result.filter((r) => r.status === filter.status);
    }

    // Filter: Benefits
    if (filter.benefitsStatus === 'received') {
      result = result.filter((r) => r.hasReceivedBenefits);
    } else if (filter.benefitsStatus === 'not_received') {
      result = result.filter((r) => !r.hasReceivedBenefits);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sort.field === 'paymentDate') {
        const dateA = a.paymentDate || '1970-01-01';
        const dateB = b.paymentDate || '1970-01-01';
        comparison = dateA.localeCompare(dateB);
      } else if (sort.field === 'amount') {
        comparison = (a.amount || 0) - (b.amount || 0);
      } else if (sort.field === 'studentId') {
        comparison = a.studentId.localeCompare(b.studentId);
      } else if (sort.field === 'name') {
        comparison = a.name.localeCompare(b.name, 'ko');
      } else if (sort.field === 'age') {
        comparison = (a.age || 0) - (b.age || 0);
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [records, filter, sort]);

  // 7. Handlers
  const handleSaveRecord = (recordData: Partial<StudentFeeRecord>) => {
    if (recordData.id) {
      // Edit existing
      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordData.id
            ? ({
                ...r,
                ...recordData,
                updatedAt: new Date().toISOString(),
              } as StudentFeeRecord)
            : r
        )
      );
      showToast(`'${recordData.name}' 학생의 학생회비 정보가 수정되었습니다.`);
    } else {
      // Create new
      const newRecord: StudentFeeRecord = {
        id: `fee-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: recordData.name || '',
        studentId: recordData.studentId || '',
        age: recordData.age || 20,
        phone: recordData.phone || '',
        amount: recordData.amount || 0,
        department: recordData.department || '컴퓨터공학과',
        grade: recordData.grade || '1학년',
        term: recordData.term || '2026학년도 1학기',
        paymentDate: recordData.paymentDate || new Date().toISOString().slice(0, 10),
        status: recordData.status || 'PAID',
        method: recordData.method || 'BANK_TRANSFER',
        depositorName: recordData.depositorName || recordData.name || '',
        hasReceivedBenefits: recordData.hasReceivedBenefits || false,
        notes: recordData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRecords((prev) => [newRecord, ...prev]);
      showToast(`'${newRecord.name}' 학생의 학생회비 내역이 등록되었습니다.`);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const target = records.find((r) => r.id === id);
    if (!target) return;
    if (confirm(`'${target.name}'(${target.studentId}) 학생의 회비 내역을 삭제하시겠습니까?`)) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      showToast(`'${target.name}' 학생의 내역이 삭제되었습니다.`);
    }
  };

  const handleToggleBenefit = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, hasReceivedBenefits: !r.hasReceivedBenefits } : r
      )
    );
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const currentFilteredIds = filteredAndSortedRecords.map((r) => r.id);
    const allSelected = currentFilteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  // Batch Operations
  const handleBatchMarkPaid = () => {
    setRecords((prev) =>
      prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: 'PAID' } : r))
    );
    showToast(`선택된 ${selectedIds.length}명의 납부 상태를 '납부완료'로 변경했습니다.`);
  };

  const handleBatchToggleBenefit = () => {
    setRecords((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) ? { ...r, hasReceivedBenefits: true } : r
      )
    );
    showToast(`선택된 ${selectedIds.length}명에게 '학생회 혜택 지급 완료' 처리했습니다.`);
  };

  const handleBatchDelete = () => {
    if (confirm(`선택한 ${selectedIds.length}명의 학생회비 내역을 일괄 삭제하시겠습니까?`)) {
      setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      showToast(`${selectedIds.length}건의 내역이 삭제되었습니다.`);
      setSelectedIds([]);
    }
  };

  // Excel Export Operations
  const handleExportAllExcel = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    exportStudentFeesToExcel(
      filteredAndSortedRecords,
      `한국대학교_학생회비_내역_${dateStr}.xlsx`
    );
    showToast(`${filteredAndSortedRecords.length}명의 학생회비 내역을 엑셀(.xlsx)로 저장했습니다.`);
  };

  const handleExportSelectedExcel = () => {
    const selectedRecords = records.filter((r) => selectedIds.includes(r.id));
    if (selectedRecords.length === 0) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    exportStudentFeesToExcel(
      selectedRecords,
      `학생회비_선택목록_${dateStr}.xlsx`
    );
    showToast(`선택된 ${selectedRecords.length}명의 내역을 엑셀(.xlsx)로 저장했습니다.`);
  };

  const handleExportCsv = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    exportStudentFeesToCsv(
      filteredAndSortedRecords,
      `학생회비_내역_${dateStr}.csv`
    );
    showToast(`CSV 파일 저장이 완료되었습니다.`);
  };

  // Excel Import Operation
  const handleImportRecords = (newRecords: StudentFeeRecord[], updateDuplicates: boolean) => {
    setRecords((prev) => {
      if (!updateDuplicates) {
        const existingIds = new Set(prev.map((r) => r.studentId));
        const filteredNew = newRecords.filter((r) => !existingIds.has(r.studentId));
        return [...filteredNew, ...prev];
      } else {
        const newMap = new Map(newRecords.map((r) => [r.studentId, r]));
        const updated = prev.map((r) => (newMap.has(r.studentId) ? newMap.get(r.studentId)! : r));
        const existingIds = new Set(prev.map((r) => r.studentId));
        const brandNew = newRecords.filter((r) => !existingIds.has(r.studentId));
        return [...brandNew, ...updated];
      }
    });

    showToast(`엑셀 파일에서 ${newRecords.length}명의 학생회비 데이터가 성공적으로 반영되었습니다.`);
  };

  // Reset to initial sample data
  const handleResetData = () => {
    if (confirm('모든 데이터를 초기 샘플 데이터셋으로 복원하시겠습니까? (기존 변경사항 초기화)')) {
      setRecords(INITIAL_STUDENT_FEES);
      setSelectedIds([]);
      showToast('샘플 데이터가 복원되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Header */}
      <Header
        onOpenAddModal={() => {
          setEditingRecord(null);
          setIsModalOpen(true);
        }}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportAllExcel={handleExportAllExcel}
        onResetData={handleResetData}
        totalRecordsCount={records.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title & Breadcrumb Area */}
        <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 mb-1">
              <span>총학생회 행정</span>
              <span aria-hidden="true">·</span>
              <span>재정회계국</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-700 font-medium">학생회비 수납대장</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 break-keep">
              학생회비 수납 및 납부자 관리
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs font-medium"
              title="CSV 형식으로 내보내기"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>

        {/* 1. Statistics Dashboard */}
        <StatsDashboard records={records} />

        {/* 2. Filter & Search Controls */}
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
          totalFilteredCount={filteredAndSortedRecords.length}
          totalCount={records.length}
        />

        {/* 3. Main High-Density Data Grid */}
        <FeeTable
          records={filteredAndSortedRecords}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onEditRecord={(record) => {
            setEditingRecord(record);
            setIsModalOpen(true);
          }}
          onDeleteRecord={handleDeleteRecord}
          onViewReceipt={(record) => setReceiptRecord(record)}
          onToggleBenefit={handleToggleBenefit}
          onOpenAddModal={() => {
            setEditingRecord(null);
            setIsModalOpen(true);
          }}
        />

        {/* Table Bottom Quick Info */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            * 납부확인서(영수증)는 각 행 우측의 프린터 아이콘을 클릭하여 즉시 인쇄할 수 있습니다.
          </div>
          <div className="font-mono tabular-nums">
            총 {records.length}명 중 {filteredAndSortedRecords.length}명 표시 중
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          한국대학교 제42대 총학생회 학생회비 수납 및 관리 시스템 · 데이터는 브라우저에 안전하게 저장됩니다.
        </div>
      </footer>

      {/* Floating Batch Action Toolbar */}
      <BatchActionBar
        selectedCount={selectedIds.length}
        onExportSelected={handleExportSelectedExcel}
        onBatchMarkPaid={handleBatchMarkPaid}
        onBatchToggleBenefit={handleBatchToggleBenefit}
        onBatchDelete={handleBatchDelete}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Register/Edit Modal */}
      <FeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        initialRecord={editingRecord}
      />

      {/* Excel / CSV Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRecords}
      />

      {/* Official Receipt Confirmation Modal */}
      <ReceiptModal
        isOpen={!!receiptRecord}
        onClose={() => setReceiptRecord(null)}
        record={receiptRecord}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-3 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
