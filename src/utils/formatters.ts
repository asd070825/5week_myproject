import { PaymentMethod, PaymentStatus } from '../types/studentFee';

// 원화 통화 포맷
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0원';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount).replace('₩', '') + '원';
}

// 숫자만 추출
export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

// 전화번호 자동 하이픈 포맷팅 (010-XXXX-XXXX)
export function formatPhoneNumber(value: string): string {
  if (!value) return '';
  const clean = value.replace(/[^0-9]/g, '');
  if (clean.length <= 3) {
    return clean;
  }
  if (clean.length <= 7) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
}

// 납부상태 한글 텍스트 및 라벨
export function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'PAID':
      return '납부완료';
    case 'PARTIAL':
      return '부분납부';
    case 'UNPAID':
      return '미납';
    case 'REFUNDED':
      return '환불완료';
    default:
      return status;
  }
}

// 결제수단 한글 텍스트
export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'BANK_TRANSFER':
      return '계좌이체';
    case 'KAKAO_PAY':
      return '카카오페이';
    case 'TOSS':
      return '토스';
    case 'CASH':
      return '현금납부';
    case 'OTHER':
      return '기타';
    default:
      return method;
  }
}

// 오늘 날짜 YYYY-MM-DD
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
