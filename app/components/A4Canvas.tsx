import React, { useRef, useEffect } from "react";
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

export default function A4Canvas({
  pageData,
  dpi = 300,
  scale = 0.3,
  onCanvasReady,
}: A4CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A4サイズをピクセルに変換
    const mmToPixel = (mm: number) => Math.round(mm * (dpi / 25.4));
    const canvasWidth = mmToPixel(pageData.dimensions.width);
    const canvasHeight = mmToPixel(pageData.dimensions.height);

    // キャンバスサイズ設定
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 高解像度対応
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawA4Layout(ctx, pageData, dpi);

    // コールバックでCanvasを渡す
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [pageData, dpi, onCanvasReady]);

  const drawA4Layout = (
    ctx: CanvasRenderingContext2D,
    page: A4PageResponse,
    dpi: number
  ) => {
    const mmToPixel = (mm: number) => Math.round(mm * (dpi / 25.4));

    // 背景を白で塗りつぶし
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // A4の枠線（デバッグ用）
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 各ポップを描画
    page.pops.forEach((popPosition) => {
      const popX = mmToPixel(popPosition.x);
      const popY = mmToPixel(popPosition.y);
      const popWidth = mmToPixel(popPosition.width);
      const popHeight = mmToPixel(popPosition.height);

      // ポップ領域を保存
      ctx.save();
      ctx.translate(popX, popY);

      // ポップテンプレートを描画
      drawPopTemplate(ctx, popPosition.pop, popWidth, popHeight, dpi);

      ctx.restore();
    });

    // 切り取り線を描画
    page.cutLines.forEach((cutLine) => {
      drawCutLine(ctx, cutLine, dpi);
    });
  };

  const drawPopTemplate = (
    ctx: CanvasRenderingContext2D,
    pop: PopResponse,
    canvasWidth: number,
    canvasHeight: number,
    dpi: number
  ) => {
    // 背景を白で塗りつぶし
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // ポップの枠線
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // フォント設定
    const baseFontSize = Math.floor(canvasHeight * 0.04);

    // レイアウト計算
    const padding = canvasWidth * 0.05;
    const contentWidth = canvasWidth - padding * 2;

    let currentY = padding + baseFontSize;

    // 1. バッジを右上に描画
    if (pop.badges && pop.badges.length > 0) {
      drawBadges(
        ctx,
        pop.badges,
        canvasWidth - padding,
        padding,
        baseFontSize * 0.8
      );
    }

    // 2. アーティスト名（太字・大きめ）
    ctx.font = `bold ${baseFontSize * 1.2}px Arial, sans-serif`;
    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.fillText(
      truncateText(ctx, pop.release.artistName, contentWidth),
      padding,
      currentY
    );
    currentY += baseFontSize * 1.5;

    // 3. タイトル（太字）
    ctx.font = `bold ${baseFontSize}px Arial, sans-serif`;
    const titleLines = wrapText(
      ctx,
      pop.release.title,
      contentWidth,
      baseFontSize * 1.2
    );
    titleLines.forEach((line) => {
      ctx.fillText(line, padding, currentY);
      currentY += baseFontSize * 1.2;
    });
    currentY += baseFontSize * 0.5;

    // 4. レーベル
    if (pop.release.label) {
      ctx.font = `${baseFontSize * 0.9}px Arial, sans-serif`;
      ctx.fillStyle = "#222222";
      ctx.fillText(
        `Label: ${truncateText(ctx, pop.release.label, contentWidth)}`,
        padding,
        currentY
      );
      currentY += baseFontSize * 1.1;
    }

    // 5. 国・リリース年
    if (pop.release.country || pop.release.releaseYear) {
      const locationInfo = [pop.release.country, pop.release.releaseYear]
        .filter(Boolean)
        .join(" • ");
      ctx.fillText(
        truncateText(ctx, locationInfo, contentWidth),
        padding,
        currentY
      );
      currentY += baseFontSize * 1.1;
    }

    // 6. ジャンル・スタイル
    if (pop.release.genreStyleString) {
      ctx.font = `${baseFontSize * 0.8}px Arial, sans-serif`;
      ctx.fillStyle = "#333333";
      const genreLines = wrapText(
        ctx,
        pop.release.genreStyleString,
        contentWidth,
        baseFontSize
      );
      genreLines.forEach((line) => {
        ctx.fillText(line, padding, currentY);
        currentY += baseFontSize;
      });
      currentY += baseFontSize * 0.5;
    }

    // 7. コメント（下部に配置）
    if (pop.comment) {
      const commentStartY = canvasHeight - padding - baseFontSize * 3;
      ctx.font = `${baseFontSize * 0.9}px Arial, sans-serif`;
      ctx.fillStyle = "#222222";

      // コメント背景
      const commentLines = wrapText(
        ctx,
        pop.comment,
        contentWidth,
        baseFontSize
      );
      const commentHeight = commentLines.length * baseFontSize * 1.1;

      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(
        padding,
        commentStartY - baseFontSize * 0.5,
        contentWidth,
        commentHeight + baseFontSize
      );

      ctx.fillStyle = "#222222";
      let commentY = commentStartY;
      commentLines.forEach((line) => {
        if (line.trim() !== "") {
          ctx.fillText(line, padding + baseFontSize * 0.3, commentY);
        }
        // 空行でも行間をあける
        commentY += baseFontSize * 1.1;
      });
    }
  };

  const drawBadges = (
    ctx: CanvasRenderingContext2D,
    badges: Array<{ type: string; displayName: string }>,
    startX: number,
    startY: number,
    fontSize: number
  ) => {
    const badgeColors: Record<string, { bg: string; text: string }> = {
      RECOMMEND: { bg: "#22c55e", text: "#ffffff" },
      MUST: { bg: "#ef4444", text: "#ffffff" },
      RAVE: { bg: "#8b5cf6", text: "#ffffff" },
      ACID: { bg: "#f59e0b", text: "#ffffff" },
    };

    let currentX = startX;
    const badgeHeight = fontSize * 1.5;
    const badgeSpacing = fontSize * 0.3;

    badges.forEach((badge) => {
      const colors = badgeColors[badge.type] || {
        bg: "#6b7280",
        text: "#ffffff",
      };

      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      const textWidth = ctx.measureText(badge.displayName).width;
      const badgeWidth = textWidth + fontSize * 0.8;

      currentX -= badgeWidth;

      // バッジ背景
      ctx.fillStyle = colors.bg;
      ctx.fillRect(currentX, startY, badgeWidth, badgeHeight);

      // バッジテキスト
      ctx.fillStyle = colors.text;
      ctx.textAlign = "center";
      ctx.fillText(
        badge.displayName,
        currentX + badgeWidth / 2,
        startY + badgeHeight / 2 + fontSize / 3
      );

      currentX -= badgeSpacing;
    });
  };

  const drawCutLine = (
    ctx: CanvasRenderingContext2D,
    cutLine: CutLineResponse,
    dpi: number
  ) => {
    const mmToPixel = (mm: number) => Math.round(mm * (dpi / 25.4));

    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); // 破線

    ctx.beginPath();

    if (cutLine.type === "horizontal") {
      const y = mmToPixel(cutLine.y || 0);
      const x1 = mmToPixel(cutLine.x1 || 0);
      const x2 = mmToPixel(cutLine.x2 || 0);
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
    } else if (cutLine.type === "vertical") {
      const x = mmToPixel(cutLine.x || 0);
      const y1 = mmToPixel(cutLine.y1 || 0);
      const y2 = mmToPixel(cutLine.y2 || 0);
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
    }

    ctx.stroke();
    ctx.setLineDash([]); // 破線をリセット
  };

  const truncateText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string => {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }

    let truncated = text;
    while (
      ctx.measureText(truncated + "...").width > maxWidth &&
      truncated.length > 0
    ) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + "...";
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number
  ): string[] => {
    // まず改行文字で分割
    const paragraphs = text.split("\n");
    const allLines: string[] = [];

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === "") {
        // 空行の場合
        allLines.push("");
        return;
      }

      const words = paragraph.split(" ");
      let currentLine = words[0] || "";

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;

        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          allLines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) {
        allLines.push(currentLine);
      }
    });

    return allLines;
  };

  return (
    <div className='flex justify-center'>
      <canvas
        ref={canvasRef}
        style={{
          width: pageData.dimensions.printPixels.width * scale,
          height: pageData.dimensions.printPixels.height * scale,
          border: "1px solid #ddd",
          backgroundColor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        className='max-w-full'
      />
    </div>
  );
}
