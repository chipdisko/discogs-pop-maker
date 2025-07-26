import React, { useRef, useEffect } from "react";
import type { PopResponse } from "../../src/application";

interface PopTemplateProps {
  pop: PopResponse;
  width: number; // ピクセル
  height: number; // ピクセル
  dpi?: number; // デフォルト300dpi
  scale?: number; // 表示用スケール
}

export default function PopTemplate({
  pop,
  width,
  height,
  dpi = 300,
  scale = 1,
}: PopTemplateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // キャンバスサイズ設定
    canvas.width = width;
    canvas.height = height;

    // 高解像度対応
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawPopTemplate(ctx, pop, width, height);
  }, [pop, width, height, dpi]);

  const drawPopTemplate = (
    ctx: CanvasRenderingContext2D,
    pop: PopResponse,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // 背景を白で塗りつぶし
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 枠線を描画
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // フォント設定
    const baseFontSize = Math.floor(canvasHeight * 0.04); // 高さの4%

    // レイアウト計算
    const padding = canvasWidth * 0.05; // 5%のパディング
    const contentWidth = canvasWidth - padding * 2;

    // 15mmの折りたたみ線の位置を計算（ピクセル）
    const foldLineY = 15 * (canvasHeight / 105); // 15mmをピクセルに変換

    // 折りたたみ線を描画
    ctx.strokeStyle = "#999999";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, foldLineY);
    ctx.lineTo(canvasWidth - padding, foldLineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 折りたたみ線より下のコンテンツ開始位置
    let currentY = foldLineY + padding + baseFontSize;

    // 1. バッジを右上に描画
    if (pop.badges.length > 0) {
      drawBadges(
        ctx,
        pop.badges,
        canvasWidth - padding,
        padding,
        baseFontSize * 0.8
      );
    }

    // 2. アーティスト名（項目名付き）
    ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
    ctx.fillStyle = "#666666";
    ctx.textAlign = "left";
    ctx.fillText("ARTIST", padding, currentY);
    currentY += baseFontSize * 0.8;

    ctx.font = `bold ${baseFontSize * 1.1}px Arial, sans-serif`;
    ctx.fillStyle = "#000000";
    ctx.fillText(
      truncateText(ctx, pop.release.artistName, contentWidth),
      padding,
      currentY
    );
    currentY += baseFontSize * 1.3;

    // 3. タイトル（項目名付き）
    ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
    ctx.fillStyle = "#666666";
    ctx.fillText("TITLE", padding, currentY);
    currentY += baseFontSize * 0.8;

    ctx.font = `bold ${baseFontSize}px Arial, sans-serif`;
    ctx.fillStyle = "#000000";
    const titleLines = wrapText(ctx, pop.release.title, contentWidth);
    titleLines.forEach((line) => {
      ctx.fillText(line, padding, currentY);
      currentY += baseFontSize * 1.1;
    });
    currentY += baseFontSize * 0.5;

    // 4. レーベル（項目名付き）
    if (pop.release.label) {
      ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
      ctx.fillStyle = "#666666";
      ctx.fillText("LABEL", padding, currentY);
      currentY += baseFontSize * 0.8;

      ctx.font = `${baseFontSize * 0.9}px Arial, sans-serif`;
      ctx.fillStyle = "#222222";
      ctx.fillText(
        truncateText(ctx, pop.release.label, contentWidth),
        padding,
        currentY
      );
      currentY += baseFontSize * 1.1;
    }

    // 5. 国・リリース年（項目名付き）
    if (pop.release.country || pop.release.releaseYear) {
      ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
      ctx.fillStyle = "#666666";
      ctx.fillText("INFO", padding, currentY);
      currentY += baseFontSize * 0.8;

      const locationInfo = [pop.release.country, pop.release.releaseYear]
        .filter(Boolean)
        .join(" • ");
      ctx.font = `${baseFontSize * 0.9}px Arial, sans-serif`;
      ctx.fillStyle = "#222222";
      ctx.fillText(
        truncateText(ctx, locationInfo, contentWidth),
        padding,
        currentY
      );
      currentY += baseFontSize * 1.1;
    }

    // 6. ジャンル・スタイル（項目名付き）
    if (pop.release.genreStyleString) {
      ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
      ctx.fillStyle = "#666666";
      ctx.fillText("GENRE", padding, currentY);
      currentY += baseFontSize * 0.8;

      ctx.font = `${baseFontSize * 0.8}px Arial, sans-serif`;
      ctx.fillStyle = "#333333";
      const genreLines = wrapText(
        ctx,
        pop.release.genreStyleString,
        contentWidth
      );
      genreLines.forEach((line) => {
        ctx.fillText(line, padding, currentY);
        currentY += baseFontSize;
      });
      currentY += baseFontSize * 0.5;
    }

    // 7. コンディション（項目名付き）
    ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
    ctx.fillStyle = "#666666";
    ctx.fillText("CONDITION", padding, currentY);
    currentY += baseFontSize * 0.8;

    ctx.font = `${baseFontSize * 0.9}px Arial, sans-serif`;
    ctx.fillStyle = "#222222";
    ctx.fillText(pop.condition, padding, currentY);
    currentY += baseFontSize * 1.1;

    // 8. 価格（項目名付き）
    ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
    ctx.fillStyle = "#666666";
    ctx.fillText("PRICE", padding, currentY);
    currentY += baseFontSize * 0.8;

    ctx.font = `${baseFontSize * 0.9}px Arial, sans-serif`;
    ctx.fillStyle = "#222222";
    const priceText =
      pop.price === 0 ? "FREE" : `¥${pop.price.toLocaleString()}`;
    ctx.fillText(priceText, padding, currentY);
    currentY += baseFontSize * 1.1;

    // 8. コメント（項目名付き、下部に配置）
    if (pop.comment) {
      const commentStartY = canvasHeight - padding - baseFontSize * 4;
      ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
      ctx.fillStyle = "#666666";
      ctx.fillText("COMMENT", padding, commentStartY);

      const commentLabelY = commentStartY + baseFontSize * 0.8;
      ctx.font = `${baseFontSize * 0.9}px Arial, sans-serif`;
      ctx.fillStyle = "#222222";

      // コメント背景
      const commentLines = wrapText(ctx, pop.comment, contentWidth);
      const commentHeight = commentLines.length * baseFontSize * 1.1;

      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(
        padding,
        commentLabelY - baseFontSize * 0.3,
        contentWidth,
        commentHeight + baseFontSize * 0.6
      );

      ctx.fillStyle = "#222222";
      let commentY = commentLabelY;
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
    maxWidth: number
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
    <canvas
      ref={canvasRef}
      style={{
        width: width * scale,
        height: height * scale,
        border: "1px solid #ddd",
        backgroundColor: "#fff",
      }}
      className='shadow-sm'
    />
  );
}
