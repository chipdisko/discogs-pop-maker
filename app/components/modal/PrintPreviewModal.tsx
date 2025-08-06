"use client";

import React, { useRef } from "react";
import { PopResponse } from "@/src/application";
import PrintLayout from "../print/PrintLayout";
import { X, Printer, FileDown } from "lucide-react";

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pops: PopResponse[];
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  pops,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // 印刷処理
  const handlePrint = () => {
    window.print();
  };

  // PDFとして保存（ブラウザの印刷ダイアログでPDF選択）
  const handleSaveAsPDF = () => {
    window.print();
  };

  // ページ数の計算
  const pageCount = Math.ceil(pops.length / 8);

  return (
    <>
      <div className="print-preview-modal">
        <div className="modal-overlay" onClick={onClose} />
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">
              印刷プレビュー
              <span className="page-info">
                （{pops.length}個 / {pageCount}ページ）
              </span>
            </h2>
            <button
              onClick={onClose}
              className="close-button"
              aria-label="閉じる"
            >
              <X size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="preview-container" ref={printRef}>
              <PrintLayout pops={pops} forPrint={false} />
            </div>
          </div>

          <div className="modal-footer">
            <div className="action-buttons">
              <button
                onClick={handlePrint}
                className="btn btn-primary"
              >
                <Printer size={20} />
                印刷
              </button>
              <button
                onClick={handleSaveAsPDF}
                className="btn btn-secondary"
              >
                <FileDown size={20} />
                PDFとして保存
              </button>
              <button
                onClick={onClose}
                className="btn btn-cancel"
              >
                キャンセル
              </button>
            </div>
            <div className="print-tips">
              <p className="tip">💡 印刷時は「背景のグラフィック」を有効にしてください</p>
              <p className="tip">💡 用紙サイズ: A4 / 余白: なし を推奨</p>
            </div>
          </div>
        </div>
      </div>

      {/* 印刷用の非表示エリア */}
      <div className="print-only">
        <PrintLayout pops={pops} forPrint={true} />
      </div>

      <style jsx>{`
        .print-preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 12px;
          width: 90vw;
          max-width: 1200px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e5e5;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-info {
          font-size: 14px;
          font-weight: 400;
          color: #666;
        }

        .close-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          color: #666;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #f0f0f0;
          color: #333;
        }

        .modal-body {
          flex: 1;
          overflow: auto;
          padding: 24px;
          background: #f8f8f8;
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e5e5;
          background: white;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .btn-secondary {
          background: #10b981;
          color: white;
        }

        .btn-secondary:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-cancel {
          background: #e5e5e5;
          color: #666;
        }

        .btn-cancel:hover {
          background: #d4d4d4;
          color: #333;
        }

        .print-tips {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tip {
          font-size: 12px;
          color: #666;
          margin: 0;
        }

        /* 印刷時のみ表示 */
        .print-only {
          display: none;
        }

        @media print {
          .print-preview-modal {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          /* メインページコンテンツを非表示 */
          .max-w-6xl.mx-auto.space-y-8 {
            display: none !important;
          }

          /* print-only内のPrintLayoutのみを表示 */
          .print-only .print-layout {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default PrintPreviewModal;