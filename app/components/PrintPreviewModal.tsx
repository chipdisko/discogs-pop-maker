import React, { useState, useCallback } from "react";
import A4CanvasHtml from "./A4CanvasHtml";
import type { PrintDataResponse } from "../../src/application";

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  printData: PrintDataResponse;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  printData,
}: PrintPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
  const [dpi, setDpi] = useState(300);

  const handleCanvasReady = useCallback(
    (canvas: HTMLCanvasElement, pageIndex: number) => {
      setCanvases((prev) => {
        const newCanvases = [...prev];
        newCanvases[pageIndex] = canvas;
        return newCanvases;
      });
    },
    []
  );

  // DPI変更時にキャンバスをクリア
  const handleDpiChange = useCallback(
    (newDpi: number) => {
      console.log("🔄 PrintPreviewModal: DPI changed", {
        from: dpi,
        to: newDpi,
      });
      setDpi(newDpi);
      setCanvases([]); // キャンバスをクリアして再生成を促す
    },
    [dpi]
  );

  const downloadCurrentPage = () => {
    const canvas = canvases[currentPage];
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `discogs-pop-page-${currentPage + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadAllPages = () => {
    canvases.forEach((canvas, index) => {
      if (canvas) {
        const link = document.createElement("a");
        link.download = `discogs-pop-page-${index + 1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        // ダウンロード間隔を空ける
        setTimeout(() => {}, 200);
      }
    });
  };

  if (!isOpen) return null;

  const currentPageData = printData.layout.pages[currentPage];

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-7xl max-h-[95vh] w-full flex flex-col'>
        {/* ヘッダー */}
        <div className='flex justify-between items-center p-6 border-b'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>印刷プレビュー</h2>
            <p className='text-gray-700'>
              {printData.totalPops}個のポップ • {printData.totalPages}ページ
            </p>
          </div>

          <div className='flex items-center space-x-4'>
            {/* DPI設定 */}
            <div className='flex items-center space-x-2'>
              <label className='text-sm font-medium text-gray-800'>DPI:</label>
              <select
                value={dpi}
                onChange={(e) => handleDpiChange(Number(e.target.value))}
                className='px-2 py-1 border border-border rounded text-sm text-gray-800'
              >
                <option value={150}>150 (プレビュー)</option>
                <option value={300}>300 (高品質)</option>
                <option value={600}>600 (超高品質)</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-800 text-xl'
            >
              ×
            </button>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className='flex-1 flex overflow-hidden'>
          {/* メインプレビュー */}
          <div className='flex-1 flex flex-col'>
            {/* ページナビゲーション */}
            {printData.totalPages > 1 && (
              <div className='flex justify-center items-center py-4 border-b space-x-4'>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                  className='px-3 py-1 bg-secondary text-secondary-foreground rounded disabled:opacity-50'
                >
                  ← 前のページ
                </button>

                <span className='text-sm text-gray-800'>
                  ページ {currentPage + 1} / {printData.totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(printData.totalPages - 1, prev + 1)
                    )
                  }
                  disabled={currentPage === printData.totalPages - 1}
                  className='px-3 py-1 bg-secondary text-secondary-foreground rounded disabled:opacity-50'
                >
                  次のページ →
                </button>
              </div>
            )}

            {/* Canvas表示 */}
            <div className='flex-1 overflow-auto p-6 bg-gray-50'>
              <div className='flex justify-center items-center min-h-full'>
                {currentPageData && (
                  <A4CanvasHtml
                    pageData={currentPageData}
                    dpi={dpi}
                    scale={0.25}
                    onCanvasReady={(canvas: HTMLCanvasElement) =>
                      handleCanvasReady(canvas, currentPage)
                    }
                  />
                )}
              </div>
            </div>

            {/* 右クリック保存のヒント */}
            <div className='p-4 bg-blue-50 border-t text-center'>
              <p className='text-sm text-blue-800'>
                💡 <strong>ヒント:</strong>{" "}
                画像を右クリックして「名前を付けて画像を保存」で保存できます
              </p>
            </div>
          </div>

          {/* サイドバー */}
          <div className='w-96 border-l p-6 bg-gray-50 overflow-y-auto'>
            {/* アクション */}
            <div className='space-y-3 mb-6'>
              <h3 className='font-semibold text-gray-900'>ダウンロード</h3>

              <button
                onClick={downloadCurrentPage}
                disabled={!canvases[currentPage]}
                className='w-full bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50'
              >
                現在のページを保存
              </button>

              {printData.totalPages > 1 && (
                <button
                  onClick={downloadAllPages}
                  disabled={canvases.length === 0}
                  className='w-full bg-secondary text-secondary-foreground py-2 px-4 rounded hover:bg-secondary/90 disabled:opacity-50'
                >
                  全ページを一括保存
                </button>
              )}
            </div>

            {/* 印刷情報 */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-gray-900'>印刷情報</h3>

              <div className='bg-white rounded-lg border border-gray-200 p-4 space-y-3 text-sm text-gray-800'>
                <div className='flex justify-between items-center'>
                  <span className='font-medium'>用紙サイズ:</span>
                  <span className='text-gray-600'>A4 (210×297mm)</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='font-medium'>ポップサイズ:</span>
                  <span className='text-gray-600'>A7 (105×74mm)</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='font-medium'>配置:</span>
                  <span className='text-gray-600'>2×4 (8枚/ページ)</span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='font-medium'>解像度:</span>
                  <span className='text-gray-600'>{dpi} DPI</span>
                </div>
              </div>
            </div>

            {/* 現在ページのポップ一覧 */}
            {currentPageData && (
              <div className='mt-6 space-y-4'>
                <h3 className='font-semibold text-gray-900'>
                  このページのポップ ({currentPageData.pops.length}個)
                </h3>

                <div className='space-y-3'>
                  {currentPageData.pops.map((popPosition) => (
                    <div
                      key={popPosition.pop.id}
                      className='p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 shadow-sm'
                    >
                      <div className='font-semibold text-gray-900 mb-2'>
                        {popPosition.pop.release.fullTitle}
                      </div>
                      <div className='text-gray-600 text-xs mb-2'>
                        {popPosition.pop.release.label}
                      </div>
                      {popPosition.pop.comment && (
                        <div className='text-gray-700 text-xs mb-2 p-2 bg-gray-50 rounded'>
                          {popPosition.pop.comment}
                        </div>
                      )}
                      {popPosition.pop.badges.length > 0 && (
                        <div className='flex flex-wrap gap-1'>
                          {popPosition.pop.badges.map((badge) => (
                            <span
                              key={badge.type}
                              className='px-2 py-1 bg-primary/20 text-primary text-xs rounded font-medium'
                            >
                              {badge.displayName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
