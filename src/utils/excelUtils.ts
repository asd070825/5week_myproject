import * as XLSX from 'xlsx';
import { AcademicYear, PaymentMethod, PaymentStatus, StudentFeeRecord } from '../types/studentFee';
import { getPaymentMethodLabel, getStatusLabel } from './formatters';

export function exportStudentFeesToExcel(
  records: StudentFeeRecord[],
  fileName = `학생회비_납부내역_${new Date().toISOString().slice(0, 10)}.xlsx`
) {
  // 1. Prepare data rows
  const header = [
    '연번',
    '이름',
    '학번',
    '나이',
    '전화번호',
    '입금금액(원)',
    '학과',
    '학년',
    '납부구분',
    '입금일자',
    '납부상태',
    '결제수단',
    '입금자명',
    '혜택수령여부',
    '비고',
  ];

  const dataRows = records.map((record, index) => [
    index + 1,
    record.name,
    record.studentId,
    record.age,
    record.phone,
    record.amount,
    record.department,
    record.grade,
    record.term,
    record.paymentDate,
    getStatusLabel(record.status),
    getPaymentMethodLabel(record.method),
    record.depositorName || record.name,
    record.hasReceivedBenefits ? '수령완료' : '미수령',
    record.notes || '',
  ]);

  // Total summary row
  const totalAmount = records.reduce((sum, r) => sum + (r.amount || 0), 0);
  const paidCount = records.filter(r => r.status === 'PAID').length;

  const summaryRow = [
    '합계',
    `총 ${records.length}명 (완납: ${paidCount}명)`,
    '',
    '',
    '',
    totalAmount,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ];

  const worksheetData = [header, ...dataRows, summaryRow];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // 연번
    { wch: 12 }, // 이름
    { wch: 14 }, // 학번
    { wch: 6 },  // 나이
    { wch: 16 }, // 전화번호
    { wch: 14 }, // 입금금액
    { wch: 18 }, // 학과
    { wch: 10 }, // 학년
    { wch: 16 }, // 납부구분
    { wch: 14 }, // 입금일자
    { wch: 12 }, // 납부상태
    { wch: 12 }, // 결제수단
    { wch: 12 }, // 입금자명
    { wch: 12 }, // 혜택수령여부
    { wch: 25 }, // 비고
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '학생회비납부명단');

  XLSX.writeFile(workbook, fileName);
}

// Export to CSV with UTF-8 BOM so Excel opens Korean characters cleanly
export function exportStudentFeesToCsv(
  records: StudentFeeRecord[],
  fileName = `학생회비_납부내역_${new Date().toISOString().slice(0, 10)}.csv`
) {
  const header = [
    '연번',
    '이름',
    '학번',
    '나이',
    '전화번호',
    '입금금액',
    '학과',
    '학년',
    '납부구분',
    '입금일자',
    '납부상태',
    '결제수단',
    '입금자명',
    '혜택수령여부',
    '비고',
  ];

  const rows = records.map((record, index) => [
    index + 1,
    `"${record.name.replace(/"/g, '""')}"`,
    `"${record.studentId}"`,
    record.age,
    `"${record.phone}"`,
    record.amount,
    `"${record.department}"`,
    `"${record.grade}"`,
    `"${record.term}"`,
    record.paymentDate,
    getStatusLabel(record.status),
    getPaymentMethodLabel(record.method),
    `"${record.depositorName || record.name}"`,
    record.hasReceivedBenefits ? '수령' : '미수령',
    `"${(record.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download sample Excel template for users to fill in
export function downloadExcelTemplate() {
  const header = [
    '이름*',
    '학번*',
    '나이',
    '전화번호*',
    '입금금액(원)*',
    '학과*',
    '학년',
    '납부구분',
    '입금일자(YYYY-MM-DD)',
    '납부상태(납부완료/부분납부/미납/환불)',
    '결제수단(계좌이체/카카오페이/토스/현금)',
    '입금자명',
    '혜택수령(O/X)',
    '비고',
  ];

  const sampleRows = [
    [
      '김민준',
      '202411045',
      20,
      '010-1234-5678',
      50000,
      '컴퓨터공학과',
      '1학년',
      '2026학년도 1학기',
      '2026-03-02',
      '납부완료',
      '계좌이체',
      '김민준',
      'O',
      '사물함 신청 완료',
    ],
    [
      '이지은',
      '202315021',
      21,
      '010-9876-5432',
      50000,
      '경영학과',
      '2학년',
      '2026학년도 1학기',
      '2026-03-03',
      '납부완료',
      '카카오페이',
      '이지은',
      'X',
      '과잠바 사이즈 L',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([header, ...sampleRows]);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 14 },
    { wch: 8 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 10 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '학생회비등록양식');
  XLSX.writeFile(wb, '학생회비_일괄등록_양식.xlsx');
}

// Parse imported Excel or CSV file
export async function parseExcelFile(
  file: File
): Promise<{ records: StudentFeeRecord[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        const records: StudentFeeRecord[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, idx) => {
          const rowNum = idx + 2; // header is row 1
          
          // Match keys flexibly
          const findValue = (keys: string[]): any => {
            for (const key of Object.keys(row)) {
              const cleanKey = key.trim().replace(/[*()]/g, '').toLowerCase();
              for (const target of keys) {
                if (cleanKey.includes(target.toLowerCase())) {
                  return row[key];
                }
              }
            }
            return '';
          };

          const name = String(findValue(['이름', 'name']) || '').trim();
          const studentId = String(findValue(['학번', 'studentid', 'id']) || '').trim();
          const ageRaw = findValue(['나이', 'age']);
          const age = Number(ageRaw) || (studentId.startsWith('202') ? 2026 - parseInt('20' + studentId.slice(2, 4)) + 1 : 21);
          const phoneRaw = String(findValue(['전화번호', '연락처', 'phone', 'mobile']) || '').trim();
          const amountRaw = findValue(['입금금액', '금액', 'amount', 'fee']);
          const amount = typeof amountRaw === 'number' ? amountRaw : parseInt(String(amountRaw).replace(/[^0-9]/g, ''), 10) || 0;
          const department = String(findValue(['학과', '전공', 'department', 'dept']) || '컴퓨터공학과').trim();
          const gradeRaw = String(findValue(['학년', 'grade']) || '1학년').trim() as AcademicYear;
          const term = String(findValue(['납부구분', '학기', 'term', 'semester']) || '2026학년도 1학기').trim();
          
          let paymentDate = String(findValue(['입금일자', '입금일', 'date']) || '').trim();
          if (!paymentDate || paymentDate === '') {
            paymentDate = new Date().toISOString().slice(0, 10);
          } else if (paymentDate.includes('T')) {
            paymentDate = paymentDate.split('T')[0];
          }

          const statusRaw = String(findValue(['납부상태', '상태', 'status']) || '').trim();
          let status: PaymentStatus = 'PAID';
          if (statusRaw.includes('완료') || statusRaw === 'PAID') status = 'PAID';
          else if (statusRaw.includes('부분') || statusRaw === 'PARTIAL') status = 'PARTIAL';
          else if (statusRaw.includes('미납') || statusRaw === 'UNPAID') status = 'UNPAID';
          else if (statusRaw.includes('환불') || statusRaw === 'REFUNDED') status = 'REFUNDED';
          else if (amount <= 0) status = 'UNPAID';

          const methodRaw = String(findValue(['결제수단', '수단', 'method']) || '').trim();
          let method: PaymentMethod = 'BANK_TRANSFER';
          if (methodRaw.includes('카카오')) method = 'KAKAO_PAY';
          else if (methodRaw.includes('토스')) method = 'TOSS';
          else if (methodRaw.includes('현금')) method = 'CASH';
          else if (methodRaw.includes('기타')) method = 'OTHER';

          const depositorName = String(findValue(['입금자명', '입금자']) || name).trim();
          const benefitsRaw = String(findValue(['혜택', '수령', 'benefits']) || '').trim().toUpperCase();
          const hasReceivedBenefits = benefitsRaw === 'O' || benefitsRaw === '수령' || benefitsRaw === 'TRUE' || benefitsRaw === 'Y';
          const notes = String(findValue(['비고', '메모', 'notes']) || '').trim();

          if (!name) {
            errors.push(`${rowNum}행: 이름이 누락되었습니다.`);
            return;
          }
          if (!studentId) {
            errors.push(`${rowNum}행: 학번이 누락되었습니다.`);
            return;
          }

          records.push({
            id: `fee-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
            name,
            studentId,
            age: age > 0 ? age : 20,
            phone: phoneRaw || '010-0000-0000',
            amount,
            department: department || '미지정',
            grade: (['1학년', '2학년', '3학년', '4학년', '대학원생', '휴학생'].includes(gradeRaw) ? gradeRaw : '1학년') as AcademicYear,
            term,
            paymentDate,
            status,
            method,
            depositorName: depositorName || name,
            hasReceivedBenefits,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });

        resolve({ records, errors });
      } catch (err: any) {
        reject(new Error(`엑셀 파싱 중 오류가 발생했습니다: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('파일을 읽는 중 문제가 발생했습니다.'));
    reader.readAsBinaryString(file);
  });
}
