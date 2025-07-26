import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import html2canvas from "html2canvas";
import type {
  A4PageResponse,
  PopResponse,
  CutLineResponse,
} from "../../src/application";

interface A4CanvasProps {
  pageData: A4PageResponse;
  dpi?: number; // デフォルト300dpi
  scale?: number; // 表示用スケール（0.3など）
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export default function A4CanvasHtml({
  pageData,
  dpi = 300,
  scale = 0.3,
  onCanvasReady,
}: A4CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const htmlRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const isRenderingRef = useRef(false);

  // ピクセル計算（メモ化）
  const { canvasWidth, canvasHeight, popWidth, popHeight } = useMemo(() => {
    const mmToPixel = (mm: number) => Math.round(mm * (dpi / 25.4));
    return {
      canvasWidth: mmToPixel(pageData.dimensions.width),
      canvasHeight: mmToPixel(pageData.dimensions.height),
      popWidth: mmToPixel(pageData.pops[0]?.width || 100),
      popHeight: mmToPixel(pageData.pops[0]?.height || 74),
    };
  }, [pageData, dpi]);

  const renderToCanvas = useCallback(async () => {
    const htmlElement = htmlRef.current;
    const canvas = canvasRef.current;

    console.log("🎯 A4CanvasHtml: renderToCanvas called", {
      htmlElement: !!htmlElement,
      canvas: !!canvas,
      isRendering: isRenderingRef.current,
    });

    if (!htmlElement || !canvas || isRenderingRef.current) {
      console.log("❌ A4CanvasHtml: Skipping render - conditions not met");
      return;
    }

    // レンダリング開始
    isRenderingRef.current = true;
    setIsRendering(true);

    console.log("🔒 A4CanvasHtml: Rendering lock acquired");

    console.log("🚀 A4CanvasHtml: Starting canvas generation");

    try {
      // 少し待ってからレンダリング（DOM更新を待つ）
      await new Promise((resolve) => setTimeout(resolve, 100));

      // レンダリング中でなくなっていたら処理を中止
      if (!isRenderingRef.current) {
        console.log("❌ A4CanvasHtml: Rendering cancelled during wait");
        return;
      }

      console.log("🎨 A4CanvasHtml: Starting html2canvas conversion");

      // HTML要素をCanvasに変換
      const generatedCanvas = await html2canvas(htmlElement, {
        width: canvasWidth,
        height: canvasHeight,
        scale: 1,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      console.log("✅ A4CanvasHtml: html2canvas completed");

      // レンダリング中でなくなっていたら処理を中止
      if (!isRenderingRef.current) {
        console.log("❌ A4CanvasHtml: Rendering cancelled after html2canvas");
        return;
      }

      // 生成されたCanvasを指定のCanvasにコピー
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(generatedCanvas, 0, 0);
        console.log("🎯 A4CanvasHtml: Canvas copied successfully");
      }

      // コールバックでCanvasを渡す
      if (onCanvasReady) {
        console.log("✅ A4CanvasHtml: Canvas ready, calling onCanvasReady");
        onCanvasReady(canvas);
      }
    } catch (error) {
      console.error("❌ A4CanvasHtml: Canvas generation error:", error);
    } finally {
      console.log("🏁 A4CanvasHtml: Canvas generation completed");
      isRenderingRef.current = false;
      setIsRendering(false);
    }
  }, [canvasWidth, canvasHeight]); // onCanvasReadyを依存配列から削除

  useEffect(() => {
    console.log("🔄 A4CanvasHtml: useEffect triggered", { pageData, dpi });

    // 既にレンダリング中の場合はスキップ
    if (isRenderingRef.current) {
      console.log("⏭️ A4CanvasHtml: Skipping - already rendering");
      return;
    }

    renderToCanvas();
  }, [pageData, dpi]); // renderToCanvasを依存配列から削除

  return (
    <div style={{ position: "relative" }}>
      {/* HTML版A4レイアウト（非表示） */}
      <div
        ref={htmlRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <A4HtmlContent
          pageData={pageData}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          popWidth={popWidth}
          popHeight={popHeight}
          dpi={dpi}
        />
      </div>

      {/* 最終的なCanvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: `${canvasWidth * scale}px`,
          height: `${canvasHeight * scale}px`,
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
              width: "16px",
              height: "16px",
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #3b82f6",
              borderRadius: "50%",
              marginBottom: "8px",
              animation: "spin 1s linear infinite",
            }}
          />
          生成中...
        </div>
      )}
    </div>
  );
}

// HTML版A4レイアウトコンテンツ
interface A4HtmlContentProps {
  pageData: A4PageResponse;
  canvasWidth: number;
  canvasHeight: number;
  popWidth: number;
  popHeight: number;
  dpi: number;
}

function A4HtmlContent({
  pageData,
  canvasWidth,
  canvasHeight,
  popWidth,
  popHeight,
  dpi,
}: A4HtmlContentProps) {
  const styles = {
    container: {
      position: "relative" as const,
      width: "100%",
      height: "100%",
    },
    pop: {
      position: "absolute" as const,
      border: "2px solid #000000",
      backgroundColor: "#ffffff",
      boxSizing: "border-box" as const,
      padding: `${8 * (dpi / 96)}px`,
      overflow: "hidden",
    },
    cutLine: {
      position: "absolute" as const,
      backgroundColor: "#cccccc",
    },
  };

  const mmToPixel = (mm: number) => Math.round(mm * (dpi / 25.4));

  return (
    <div style={styles.container}>
      {/* ポップ配置 */}
      {pageData.pops.map((pop, index) => (
        <div
          key={index}
          style={{
            ...styles.pop,
            left: `${mmToPixel(pop.x)}px`,
            top: `${mmToPixel(pop.y)}px`,
            width: `${popWidth}px`,
            height: `${popHeight}px`,
          }}
        >
          <PopHtmlContent pop={pop.pop} scaleFactor={dpi / 96} />
        </div>
      ))}

      {/* 切り取り線 */}
      {pageData.cutLines.map((cutLine, index) => {
        const isHorizontal = cutLine.type === "vertical";
        return (
          <div
            key={index}
            style={{
              ...styles.cutLine,
              left: `${mmToPixel(cutLine.x1 || 0)}px`,
              top: `${mmToPixel(cutLine.y1 || 0)}px`,
              width: isHorizontal
                ? "1px"
                : `${mmToPixel((cutLine.x2 || 0) - (cutLine.x1 || 0))}px`,
              height: isHorizontal
                ? `${mmToPixel((cutLine.y2 || 0) - (cutLine.y1 || 0))}px`
                : "1px",
            }}
          />
        );
      })}
    </div>
  );
}

// PopHtmlContentコンポーネント（PopTemplateHtmlから分離）
interface PopHtmlContentProps {
  pop: PopResponse;
  scaleFactor: number;
}

function PopHtmlContent({ pop, scaleFactor }: PopHtmlContentProps) {
  const styles = {
    container: {
      width: "100%",
      height: "100%",
      position: "relative" as const,
      color: "#000000",
      lineHeight: 1.2,
    },
    badges: {
      position: "absolute" as const,
      top: 0,
      right: 0,
      display: "flex",
      gap: `${4 * scaleFactor}px`,
      flexDirection: "row-reverse" as const,
    },
    badge: {
      padding: `${4 * scaleFactor}px ${8 * scaleFactor}px`,
      borderRadius: `${4 * scaleFactor}px`,
      fontSize: `${12 * scaleFactor}px`,
      fontWeight: "bold" as const,
      color: "#ffffff",
    },
    artist: {
      fontSize: `${20 * scaleFactor}px`,
      fontWeight: "bold" as const,
      marginBottom: `${8 * scaleFactor}px`,
      marginTop: `${pop.badges.length > 0 ? 24 * scaleFactor : 0}px`,
    },
    title: {
      fontSize: `${16 * scaleFactor}px`,
      fontWeight: "bold" as const,
      marginBottom: `${8 * scaleFactor}px`,
      lineHeight: 1.3,
    },
    label: {
      fontSize: `${14 * scaleFactor}px`,
      color: "#222222",
      marginBottom: `${6 * scaleFactor}px`,
    },
    location: {
      fontSize: `${14 * scaleFactor}px`,
      color: "#222222",
      marginBottom: `${6 * scaleFactor}px`,
    },
    genres: {
      fontSize: `${13 * scaleFactor}px`,
      color: "#333333",
      marginBottom: `${8 * scaleFactor}px`,
    },
    comment: {
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      right: 0,
      fontSize: `${12 * scaleFactor}px`,
      color: "#222222",
      backgroundColor: "#f8f9fa",
      padding: `${6 * scaleFactor}px`,
      borderRadius: `${4 * scaleFactor}px`,
      lineHeight: 1.2,
      whiteSpace: "pre-line" as const,
    },
  };

  const badgeColors: Record<string, string> = {
    RECOMMEND: "#22c55e",
    MUST: "#ef4444",
    RAVE: "#8b5cf6",
    ACID: "#f59e0b",
  };

  return (
    <div style={styles.container}>
      {/* バッジ */}
      {pop.badges.length > 0 && (
        <div style={styles.badges}>
          {pop.badges.map((badge, index) => (
            <span
              key={index}
              style={{
                ...styles.badge,
                backgroundColor: badgeColors[badge.type] || "#6b7280",
              }}
            >
              {badge.displayName}
            </span>
          ))}
        </div>
      )}

      {/* アーティスト名 */}
      <div style={styles.artist}>{pop.release.artistName}</div>

      {/* タイトル */}
      <div style={styles.title}>{pop.release.title}</div>

      {/* レーベル */}
      {pop.release.label && (
        <div style={styles.label}>Label: {pop.release.label}</div>
      )}

      {/* 国・リリース年 */}
      {(pop.release.country || pop.release.releaseYear) && (
        <div style={styles.location}>
          {[pop.release.country, pop.release.releaseYear]
            .filter(Boolean)
            .join(" • ")}
        </div>
      )}

      {/* ジャンル・スタイル */}
      {pop.release.genreStyleString && (
        <div style={styles.genres}>{pop.release.genreStyleString}</div>
      )}

      {/* コメント */}
      {pop.comment && <div style={styles.comment}>{pop.comment}</div>}
    </div>
  );
}
