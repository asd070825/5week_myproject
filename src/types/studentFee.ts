export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'REFUNDED';

export type PaymentMethod = 'BANK_TRANSFER' | 'KAKAO_PAY' | 'TOSS' | 'CASH' | 'OTHER';

export type AcademicYear = '1학년' | '2학년' | '3학년' | '4학년' | '대학원생' | '휴학생';

export interface StudentFeeRecord {
  id: string;
  name: string; // 이름
  studentId: string; // 학번 (예: 202411032)
  age: number; // 나이
  phone: string; // 전화번호 (010-XXXX-XXXX)
  amount: number; // 입금금액 (원)
  department: string; // 학과
  grade: AcademicYear; // 학년
  term: string; // 학기/납부구분 (예: 2026학년도 1학기, 4년 전액)
  paymentDate: string; // 입금일자 (YYYY-MM-DD)
  status: PaymentStatus; // 납부상태
  method: PaymentMethod; // 결제수단
  depositorName: string; // 입금자명 (학생명과 다를 경우 대비)
  hasReceivedBenefits: boolean; // 학생회 혜택(과잠/사물함/간식/굿즈) 수령여부
  notes?: string; // 비고
  createdAt: string; // 등록일시
  updatedAt: string; // 수정일시
}

export interface FeeFilterOptions {
  searchQuery: string;
  department: string;
  grade: string;
  status: string;
  benefitsStatus: string; // 'all' | 'received' | 'not_received'
  dateRange: {
    start: string;
    end: string;
  };
}

export type SortField = 'paymentDate' | 'amount' | 'studentId' | 'name' | 'age';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export const DEPARTMENTS = [
  '컴퓨터공학과',
  '소프트웨어학과',
  '인공지능학과',
  '전자전기공학부',
  '기계공학과',
  '경영학과',
  '경제학과',
  '미디어커뮤니케이션학과',
  '간호학과',
  '시각디자인학과',
  '자율전공학부',
] as const;

export const STANDARD_FEE_PRESETS = [
  { label: '1개 학기 (30,000원)', value: 30000 },
  { label: '1년 정기 (50,000원)', value: 50000 },
  { label: '2년 정기 (90,000원)', value: 90000 },
  { label: '4년 전액 (150,000원)', value: 150000 },
];
