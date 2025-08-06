"use client";

import React from "react";
import { PopResponse } from "@/src/application";
import TemplateRenderer from "../visual-editor/TemplateRenderer";

interface PrintLayoutProps {
  pops: PopResponse[];
  forPrint?: boolean; // 印刷用のスタイルを適用するかどうか
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ pops, forPrint = false }) => {
  // 8個ずつページに分割
  const POPS_PER_PAGE = 8;
  const pages: PopResponse[][] = [];
  
  for (let i = 0; i < pops.length; i += POPS_PER_PAGE) {
    pages.push(pops.slice(i, i + POPS_PER_PAGE));
  }

  // POPサイズの計算（74mm × 105mm）
  // 画面表示用と印刷用で同じサイズを使用（CSSでスケーリング）
  const popWidthPx = 105 * 3.7795; // 105mm to px (96dpi基準) ≈ 397px
  const popHeightPx = 74 * 3.7795; // 74mm to px ≈ 280px

  return (
    <div className={`print-layout ${forPrint ? 'for-print' : 'for-display'}`}>
      {pages.map((pagePops, pageIndex) => (
        <div 
          key={pageIndex} 
          className="print-page"
          style={{
            pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto'
          }}
        >
          <div className="pops-grid">
            {pagePops.map((pop, index) => (
              <div key={`${pageIndex}-${index}`} className="pop-wrapper">
                <div className="pop-container">
                  {/* TemplateRendererを使用 */}
                  <TemplateRenderer
                    pop={pop}
                    width={popWidthPx}
                    height={popHeightPx}
                    forPrint={forPrint}
                  />
                </div>
              </div>
            ))}
            {/* 8個未満の場合は空のセルで埋める */}
            {Array.from({ length: POPS_PER_PAGE - pagePops.length }).map((_, index) => (
              <div key={`empty-${pageIndex}-${index}`} className="pop-wrapper empty">
                <div className="pop-container empty-cell" />
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <style jsx>{`
        .print-layout {
          width: 100%;
        }

        .print-layout.for-display {
          background: #f5f5f5;
          padding: 20px;
        }

        .print-page {
          background: white;
          margin: 0 auto 20px;
          position: relative;
        }

        .print-layout.for-display .print-page {
          width: calc(210mm * 0.6);
          height: calc(297mm * 0.6);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 0;
          overflow: hidden;
        }

        .pops-grid {
          display: grid;
          grid-template-columns: repeat(2, 105mm);
          grid-template-rows: repeat(4, 74mm);
          gap: 0;
          width: 210mm;
          height: 296mm;
        }

        /* 画面表示時のみスケール適用 */
        .print-layout.for-display .pops-grid {
          transform: scale(0.6);
          transform-origin: top left;
        }

        .pop-wrapper {
          position: relative;
          width: 105mm;
          height: 74mm;
          overflow: hidden;
          border: 0.5px dashed #ccc;
        }

        .pop-wrapper.empty {
          border: 0.5px dashed #e0e0e0;
        }

        .pop-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-cell {
          background: #fafafa;
        }

        /* 印刷用スタイル */
        @media print {
          .print-layout {
            background: none !important;
            padding: 0 !important;
          }

          .print-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            page-break-inside: avoid;
          }

          .print-page:last-child {
            page-break-after: auto;
          }

          .pops-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 105mm) !important;
            grid-template-rows: repeat(4, 74mm) !important;
            gap: 0 !important;
            transform: none !important;
            margin: 0 !important;
          }

          .pop-wrapper {
            width: 105mm !important;
            height: 74mm !important;
            border: 0.1mm dashed #999 !important;
            page-break-inside: avoid;
          }

          .pop-wrapper.empty {
            border: 0.1mm dashed #ddd !important;
          }

          .empty-cell {
            display: none !important;
          }

          /* 画面には表示するが印刷時は非表示 */
          .no-print {
            display: none !important;
          }
        }

        @page {
          size: A4;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default PrintLayout;