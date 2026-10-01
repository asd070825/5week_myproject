import React, { useState, useEffect } from 'react';
import {
  StudentFeeRecord,
  DEPARTMENTS,
  STANDARD_FEE_PRESETS,
  PaymentStatus,
  PaymentMethod,
  AcademicYear,
} from '../types/studentFee';
import { formatCurrency, formatPhoneNumber, getTodayDateString } from '../utils/formatters';
import { X, Check } from 'lucide-react';

interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<StudentFeeRecord>) => void;
  initialRecord?: StudentFeeRecord | null;
}

export const FeeModal: React.FC<FeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
}) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [age, setAge] = useState<number>(20);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number>(50000);
  const [department, setDepartment] = useState<string>('컴퓨터공학과');
  const [customDept, setCustomDept] = useState('');
  const [grade, setGrade] = useState<AcademicYear>('1학년');
  const [term, setTerm] = useState('2026학년도 1학기');
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [status, setStatus] = useState<PaymentStatus>('PAID');
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [depositorName, setDepositorName] = useState('');
  const [hasReceivedBenefits, setHasReceivedBenefits] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialRecord) {
      setName(initialRecord.name);
      setStudentId(initialRecord.studentId);
      setAge(initialRecord.age || 20);
      setPhone(initialRecord.phone);
      setAmount(initialRecord.amount);
      if (DEPARTMENTS.includes(initialRecord.department as any)) {
        setDepartment(initialRecord.department);
        setCustomDept('');
      } else {
        setDepartment('기타');
        setCustomDept(initialRecord.department);
      }
      setGrade(initialRecord.grade);
      setTerm(initialRecord.term || '2026학년도 1학기');
      setPaymentDate(initialRecord.paymentDate || getTodayDateString());
      setStatus(initialRecord.status);
      setMethod(initialRecord.method);
      setDepositorName(initialRecord.depositorName || initialRecord.name);
      setHasReceivedBenefits(initialRecord.hasReceivedBenefits || false);
      setNotes(initialRecord.notes || '');
    } else {
      // Default reset
      setName('');
      setStudentId('');
      setAge(20);
      setPhone('010-');
      setAmount(50000);
      setDepartment('컴퓨터공학과');
      setCustomDept('');
      setGrade('1학년');
      setTerm('2026학년도 1학기');
      setPaymentDate(getTodayDateString());
      setStatus('PAID');
      setMethod('BANK_TRANSFER');
      setDepositorName('');
      setHasReceivedBenefits(false);
      setNotes('');
    }
    setErrors({});
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

  // Auto estimate age from student ID year if possible
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setStudentId(val);
    if (!initialRecord && val.length >= 4) {
      const yearPrefix = parseInt(val.slice(0, 4), 10);
      if (yearPrefix >= 2015 && yearPrefix <= 2026) {
        const estimatedAge = 2026 - yearPrefix + 20;
        setAge(Math.min(Math.max(estimatedAge, 19), 35));
        
        // Auto set grade
        if (yearPrefix === 2026) setGrade('1학년');
        else if (yearPrefix === 2025) setGrade('2학년');
        else if (yearPrefix === 2024) setGrade('3학년');
        else if (yearPrefix <= 2023) setGrade('4학년');
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSameAsStudentName = () => {
    setDepositorName(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!studentId.trim()) newErrors.studentId = '학번을 입력해주세요.';
    if (!phone.trim() || phone.length < 10) newErrors.phone = '올바른 전화번호를 입력해주세요.';
    if (age <= 0 || age > 99) newErrors.age = '나이를 바르게 입력해주세요.';

    const finalDept = department === '기타' ? customDept.trim() || '기타' : department;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...(initialRecord?.id ? { id: initialRecord.id } : {}),
      name: name.trim(),
      studentId: studentId.trim(),
      age: Number(age),
      phone: phone.trim(),
      amount: Number(amount) || 0,
      department: finalDept,
      grade,
      term,
      paymentDate,
      status,
      method,
      depositorName: depositorName.trim() || name.trim(),
      hasReceivedBenefits,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialRecord ? '학생회비 내역 수정' : '신규 학생회비 내역 등록'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              이름, 학번, 나이, 전화번호 및 입금 내역을 입력합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Name, Student ID, Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!depositorName) setDepositorName(e.target.value);
                }}
                placeholder="예: 김민준"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-blue-600 ${
                  errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                학번 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={studentId}
                onChange={handleStudentIdChange}
                placeholder="예: 202411032"
                maxLength={12}
                className={`w-full px-3 py-2 text-xs border font-mono rounded-lg focus:outline-none focus:border-blue-600 ${
                  errors.studentId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.studentId && <p className="text-[11px] text-rose-600 mt-1">{errors.studentId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                나이 (세)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                min={18}
                max={99}
                className="w-full px-3 py-2 text-xs border border-slate-300 font-mono rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Row 2: Phone, Department, Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                전화번호 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                maxLength={13}
                className={`w-full px-3 py-2 text-xs border font-mono rounded-lg focus:outline-none focus:border-blue-600 ${
                  errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                소속 학과
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="기타">직접 입력...</option>
              </select>
              {department === '기타' && (
                <input
                  type="text"
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  placeholder="학과명을 입력하세요"
                  className="w-full mt-1.5 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                학년
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as AcademicYear)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="1학년">1학년</option>
                <option value="2학년">2학년</option>
                <option value="3학년">3학년</option>
                <option value="4학년">4학년</option>
                <option value="대학원생">대학원생</option>
                <option value="휴학생">휴학생</option>
              </select>
            </div>
          </div>

          {/* Row 3: Amount with Quick Presets */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">
                입금금액 (원) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-bold text-blue-700 font-mono tabular-nums">
                현재: {formatCurrency(amount)}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                step="5000"
                min="0"
                value={amount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setAmount(val);
                  if (val === 0) setStatus('UNPAID');
                  else if (status === 'UNPAID') setStatus('PAID');
                }}
                className="flex-1 px-3 py-2 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 mr-1">빠른 금액 선택:</span>
              {STANDARD_FEE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setAmount(preset.value);
                    if (status === 'UNPAID') setStatus('PAID');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    amount === preset.value
                      ? 'bg-blue-600 text-white border-blue-600 font-medium'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Term, Payment Date, Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                납부 구분 / 학기
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="2026학년도 1학기"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  입금일자
                </label>
                <button
                  type="button"
                  onClick={() => setPaymentDate(getTodayDateString())}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  오늘 날짜
                </button>
              </div>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 font-mono rounded-lg focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                납부 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="PAID">납부완료 (정상)</option>
                <option value="PARTIAL">부분납부 (일부수납)</option>
                <option value="UNPAID">미납 (입금대기)</option>
                <option value="REFUNDED">환불완료 (반환)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Method & Depositor Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                결제 / 입금 수단
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value="BANK_TRANSFER">계좌이체</option>
                <option value="KAKAO_PAY">카카오페이</option>
                <option value="TOSS">토스</option>
                <option value="CASH">현금납부 (학생회실)</option>
                <option value="OTHER">기타</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  입금자명 (통장 표기명)
                </label>
                <button
                  type="button"
                  onClick={handleSameAsStudentName}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  학생 본인과 동일
                </button>
              </div>
              <input
                type="text"
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                placeholder="예: 김민준(부모님명 등)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Row 6: Benefits Checkbox */}
          <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-900 block">
                학생회 혜택 지급 완료 여부
              </span>
              <span className="text-[11px] text-purple-700">
                사물함 배정, 과잠바 지원금, 시험기간 간식행사, 축제 우선입장권 등
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasReceivedBenefits}
                onChange={(e) => setHasReceivedBenefits(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-300"
              />
              <span className="ml-2 text-xs font-medium text-purple-900">
                {hasReceivedBenefits ? '지급완료' : '미지급'}
              </span>
            </label>
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              비고 및 특이사항
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 사물함 B-14 신청완료, 영수증 발행 요청 등"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{initialRecord ? '수정사항 저장' : '학생회비 등록'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
