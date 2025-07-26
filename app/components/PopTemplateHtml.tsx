import React, { useRef, useEffect, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import type { PopResponse } from "../../src/application";

interface PopTemplateProps {
  pop: PopResponse;
  width: number; // ピクセル
  height: number; // ピクセル
  dpi?: number; // デフォルト300dpi
  scale?: number; // 表示用スケール
}

export default function PopTemplateHtml({
  pop,
  width,
  height,
  dpi = 300,
  scale = 1,
}: PopTemplateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const isRenderingRef = useRef(false);

  // ピクセル計算（メモ化）
  const { scaleFactor, actualWidth, actualHeight } = useMemo(() => {
    const sf = dpi / 96; // 96dpiがWeb標準
    return {
      scaleFactor: sf,
      actualWidth: width * sf,
      actualHeight: height * sf,
    };
  }, [width, height, dpi]);

  useEffect(() => {
    let isMounted = true;

    const renderToCanvas = async () => {
      const htmlElement = htmlRef.current;
      const canvas = canvasRef.current;

      if (!htmlElement || !canvas || isRenderingRef.current) return;

      isRenderingRef.current = true;
      setIsRendering(true);

      try {
        // 少し待ってからレンダリング（DOM更新を待つ）
        await new Promise((resolve) => setTimeout(resolve, 50));

        // コンポーネントがアンマウントされていたら処理を中止
        if (!isMounted) return;

        // HTML要素をCanvasに変換
        const generatedCanvas = await html2canvas(htmlElement, {
          width: actualWidth,
          height: actualHeight,
          scale: scaleFactor,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
        });

        // コンポーネントがアンマウントされていたら処理を中止
        if (!isMounted) return;

        // 生成されたCanvasを指定のCanvasにコピー
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = width;
          canvas.height = height;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          ctx.drawImage(
            generatedCanvas,
            0,
            0,
            generatedCanvas.width,
            generatedCanvas.height,
            0,
            0,
            width,
            height
          );
        }
      } catch (error) {
        console.error("Canvas生成エラー:", error);
      } finally {
        if (isMounted) {
          isRenderingRef.current = false;
          setIsRendering(false);
        }
      }
    };

    renderToCanvas();

    return () => {
      isMounted = false;
    };
  }, [pop, width, height, dpi]);

  return (
    <div style={{ position: "relative" }}>
      {/* HTML版ポップテンプレート（非表示） */}
      <div
        ref={htmlRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: `${actualWidth}px`,
          height: `${actualHeight}px`,
          fontSize: `${16 * scaleFactor}px`,
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#ffffff",
          border: "2px solid #000000",
          boxSizing: "border-box",
          padding: `${8 * scaleFactor}px`,
          overflow: "hidden",
        }}
      >
        <PopHtmlContent pop={pop} scaleFactor={scaleFactor} />
      </div>

      {/* 最終的なCanvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: `${width * scale}px`,
          height: `${height * scale}px`,
          border: "1px solid #ddd",
        }}
      />

      {isRendering && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#666",
            borderRadius: "4px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #3b82f6",
              borderRadius: "50%",
              marginBottom: "6px",
              animation: "spin 1s linear infinite",
            }}
          />
          生成中...
        </div>
      )}
    </div>
  );
}

// HTML版ポップコンテンツ
interface PopHtmlContentProps {
  pop: PopResponse;
  scaleFactor: number;
}

function PopHtmlContent({ pop, scaleFactor }: PopHtmlContentProps) {
  // 動的スタイル（Tailwindでは対応できない部分）
  const dynamicStyles = {
    fontSize: `${20 * scaleFactor}px`,
    padding: `${8 * scaleFactor}px`,
    gap: `${4 * scaleFactor}px`,
    borderRadius: `${4 * scaleFactor}px`,
  };

  const badgeColors: Record<string, string> = {
    RECOMMEND: "#22c55e",
    MUST: "#ef4444",
    RAVE: "#8b5cf6",
    ACID: "#f59e0b",
  };

  return (
    <div
      className='w-full h-full relative text-black leading-tight'
      style={{ lineHeight: 1.2 }}
    >
      {/* バッジ */}
      {pop.badges.length > 0 && (
        <div
          className='absolute top-0 right-0 flex flex-row-reverse'
          style={{ gap: `${4 * scaleFactor}px` }}
        >
          {pop.badges.map((badge, index) => (
            <span
              key={index}
              className='font-bold text-white'
              style={{
                padding: `${4 * scaleFactor}px ${8 * scaleFactor}px`,
                borderRadius: `${4 * scaleFactor}px`,
                fontSize: `${12 * scaleFactor}px`,
                backgroundColor: badgeColors[badge.type] || "#6b7280",
              }}
            >
              {badge.displayName}
            </span>
          ))}
        </div>
      )}

      {/* アーティスト名 */}
      <div
        className='font-bold mb-2'
        style={{
          fontSize: `${20 * scaleFactor}px`,
          marginTop: pop.badges.length > 0 ? `${24 * scaleFactor}px` : 0,
        }}
      >
        {pop.release.artistName}
      </div>

      {/* タイトル */}
      <div
        className='font-bold mb-2'
        style={{
          fontSize: `${16 * scaleFactor}px`,
          lineHeight: 1.3,
        }}
      >
        {pop.release.title}
      </div>

      {/* レーベル */}
      {pop.release.label && (
        <div
          className='text-gray-800 mb-1'
          style={{ fontSize: `${14 * scaleFactor}px` }}
        >
          Label: {pop.release.label}
        </div>
      )}

      {/* 国・リリース年 */}
      {(pop.release.country || pop.release.releaseYear) && (
        <div
          className='text-gray-800 mb-1'
          style={{ fontSize: `${14 * scaleFactor}px` }}
        >
          {[pop.release.country, pop.release.releaseYear]
            .filter(Boolean)
            .join(" • ")}
        </div>
      )}

      {/* ジャンル・スタイル */}
      {pop.release.genreStyleString && (
        <div
          className='text-gray-700 mb-2'
          style={{ fontSize: `${13 * scaleFactor}px` }}
        >
          {pop.release.genreStyleString}
        </div>
      )}

      {/* コメント */}
      {pop.comment && (
        <div
          className='absolute bottom-0 left-0 right-0 text-gray-800 bg-gray-50 rounded'
          style={{
            fontSize: `${12 * scaleFactor}px`,
            padding: `${6 * scaleFactor}px`,
            lineHeight: 1.2,
            whiteSpace: "pre-line",
          }}
        >
          {pop.comment}
        </div>
      )}
    </div>
  );
}
