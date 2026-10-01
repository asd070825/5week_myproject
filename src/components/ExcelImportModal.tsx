import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { StudentFeeRecord } from '../types/studentFee';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelUtils';
import { formatCurrency } from '../utils/formatters';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newRecords: StudentFeeRecord[], updateDuplicates: boolean) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewRecords, setPreviewRecords] = useState<StudentFeeRecord[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [updateDuplicates, setUpdateDuplicates] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsParsing(true);
    setParseErrors([]);
    setPreviewRecords([]);

    try {
      const result = await parseExcelFile(selectedFile);
      setPreviewRecords(result.records);
      setParseErrors(result.errors);
    } catch (err: any) {
      setParseErrors([err.message || '파일을 분석하는 데 실패했습니다.']);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (previewRecords.length === 0) return;
    onImport(previewRecords, updateDuplicates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              엑셀(Excel) / CSV 파일 일괄 가져오기
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              기존에 작성된 엑셀 파일이나 명단을 한 번에 등록할 수 있습니다.
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Template Download Notice */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-900">
                표준 학생회비 등록 엑셀 양식이 필요하신가요?
              </p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                열 이름(이름, 학번, 나이, 전화번호, 입금금액 등)이 사전 정의된 엑셀 템플릿을 다운로드하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              양식 다운로드
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
              }}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {file ? file.name : '엑셀(.xlsx, .xls) 또는 CSV 파일을 드래그하거나 클릭하여 선택하세요'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              이름, 학번, 나이, 연락처, 입금금액 열이 자동으로 매핑됩니다.
            </p>
          </div>

          {/* Parse Errors or Warnings */}
          {parseErrors.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                일부 행에서 누락 또는 오류가 감지되었습니다 ({parseErrors.length}건):
              </div>
              <ul className="list-disc pl-5 text-[11px] text-amber-800 space-y-0.5 max-h-24 overflow-y-auto">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsing State */}
          {isParsing && (
            <div className="py-6 text-center text-xs text-slate-500">
              엑셀 파일 데이터를 분석하고 있습니다...
            </div>
          )}

          {/* Preview Table */}
          {previewRecords.length > 0 && !isParsing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  미리보기: 정상 감지된 {previewRecords.length}명의 데이터
                </span>
                <span className="text-slate-500 font-mono tabular-nums">
                  총 금액:{' '}
                  <strong>
                    {formatCurrency(
                      previewRecords.reduce((sum, r) => sum + r.amount, 0)
                    )}
                  </strong>
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-medium">
                    <tr>
                      <th className="py-1.5 px-2.5">이름</th>
                      <th className="py-1.5 px-2.5">학번</th>
                      <th className="py-1.5 px-2.5">나이</th>
                      <th className="py-1.5 px-2.5">전화번호</th>
                      <th className="py-1.5 px-2.5">학과</th>
                      <th className="py-1.5 px-2.5 text-right">금액</th>
                      <th className="py-1.5 px-2.5 text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {previewRecords.slice(0, 15).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-1 px-2.5 font-medium text-slate-900">{r.name}</td>
                        <td className="py-1 px-2.5 font-mono">{r.studentId}</td>
                        <td className="py-1 px-2.5 font-mono">{r.age}세</td>
                        <td className="py-1 px-2.5 font-mono text-slate-500">{r.phone}</td>
                        <td className="py-1 px-2.5 text-slate-600">{r.department}</td>
                        <td className="py-1 px-2.5 font-mono tabular-nums text-right font-semibold">
                          {formatCurrency(r.amount)}
                        </td>
                        <td className="py-1 px-2.5 text-center text-[11px]">
                          {r.status === 'PAID' ? '납부완료' : '미납'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewRecords.length > 15 && (
                  <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50 border-t border-slate-200">
                    외 {previewRecords.length - 15}명의 데이터가 더 있습니다.
                  </div>
                )}
              </div>

              {/* Duplicate Handling Option */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={updateDuplicates}
                    onChange={(e) => setUpdateDuplicates(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>기존 동일 학번 데이터가 있을 경우 최신 정보로 덮어쓰기</span>
                </label>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              disabled={previewRecords.length === 0}
              onClick={handleConfirmImport}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>{previewRecords.length}명 데이터 일괄 등록하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
