import React, { useRef, useEffect } from "react";
import type { PopResponse } from "../../src/application";

interface PopTemplateProps {
  pop: PopResponse;
  width: number; // ピクセル
  height: number; // ピクセル
  dpi?: number; // デフォルト300dpi
  scale?: number; // 表示用スケール
}

// 描画関数をエクスポート
export const drawPopTemplateContent = (
  ctx: CanvasRenderingContext2D,
  pop: PopResponse,
  canvasWidth: number,
  canvasHeight: number
) => {
  // 背景をグラデーションで塗りつぶし
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, "#f8fafc");
  gradient.addColorStop(1, "#ffffff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // かっこいい枠線を描画（細く調整）
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);

  // 内側の細い枠線
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(3, 3, canvasWidth - 6, canvasHeight - 6);

  // フォント設定
  const baseFontSize = Math.floor(canvasHeight * 0.04); // 高さの4%

  // レイアウト計算
  const padding = canvasWidth * 0.05; // 5%のパディング
  const contentWidth = canvasWidth - padding * 2;

  // 15mmの折りたたみ線の位置を計算（ピクセル）
  const foldLineY = 15 * (canvasHeight / 105); // 15mmをピクセルに変換

  // 軒先レコード（折り目上、180度回転）
  ctx.save();
  ctx.translate(canvasWidth / 2, foldLineY / 2);
  ctx.rotate(Math.PI); // 180度回転

  // テキストを描画
  ctx.font = `bold ${baseFontSize * 1.1}px Arial, sans-serif`;
  ctx.fillStyle = "#1e293b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("軒先レコード", 0, 0);
  ctx.restore();

  // かっこいい折りたたみ線を描画
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(padding, foldLineY);
  ctx.lineTo(canvasWidth - padding, foldLineY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 折りたたみ線より下のコンテンツ開始位置
  let currentY = foldLineY + padding + baseFontSize;

  // 2. アーティスト名（大きく目立つ）
  ctx.font = `bold ${baseFontSize * 1.6}px Arial, sans-serif`;
  ctx.fillStyle = "#1e293b";
  ctx.textAlign = "left";
  ctx.fillText(
    truncateText(ctx, pop.release.artistName, contentWidth),
    padding,
    currentY
  );

  currentY += baseFontSize * 1.6 + 4;

  // 3. タイトル（大きく目立つ）
  ctx.font = `bold ${baseFontSize * 1.4}px Arial, sans-serif`;
  ctx.fillStyle = "#334155";

  const titleLines = wrapText(ctx, pop.release.title, contentWidth);
  titleLines.forEach((line) => {
    ctx.fillText(line, padding, currentY);
    currentY += baseFontSize * 1.3;
  });
  currentY += baseFontSize * 0.5;

  // 4-6. LABEL、INFO、CONDITIONを横並びに配置
  const labelWidth = contentWidth * 0.5;
  const infoWidth = contentWidth * 0.4;
  const conditionWidth = contentWidth * 0.1;

  // LABEL
  ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
  ctx.fillStyle = "#666666";
  ctx.fillText("LABEL", padding, currentY);
  currentY += baseFontSize;

  ctx.font = `${baseFontSize * 1.0}px Arial, sans-serif`;
  ctx.fillStyle = "#222222";
  const labelText = pop.release.label || "不明";
  ctx.fillText(truncateText(ctx, labelText, labelWidth), padding, currentY);

  // INFO

  ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
  ctx.fillStyle = "#666666";
  ctx.fillText("INFO", padding + labelWidth, currentY - baseFontSize);

  const locationInfo = [
    pop.release.country || "不明",
    pop.release.releaseYear || "不明",
  ]
    .filter(Boolean)
    .join(" • ");
  ctx.font = `${baseFontSize * 1.0}px Arial, sans-serif`;
  ctx.fillStyle = "#222222";
  ctx.fillText(
    truncateText(ctx, locationInfo, infoWidth),
    padding + labelWidth,
    currentY
  );

  // CONDITION（見出しなし、大きく表示）
  ctx.font = `${baseFontSize * 1.2}px Arial, sans-serif`;
  ctx.fillStyle = "#1e293b";
  ctx.fillText(pop.condition, padding + labelWidth + infoWidth, currentY);

  currentY += baseFontSize * 1.5;

  // 7. ジャンル・スタイル（項目名付き）
  if (pop.release.genreStyleString) {
    ctx.font = `${baseFontSize * 0.7}px Arial, sans-serif`;
    ctx.fillStyle = "#666666";
    ctx.fillText("GENRE", padding, currentY);
    currentY += baseFontSize;

    ctx.font = `${baseFontSize * 0.9}px Arial, sans-serif`;
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
    currentY += baseFontSize;
  }

  // 8. 価格（背景なし、大きく、左寄せ）
  const priceText = pop.price === 0 ? "FREE" : `¥${pop.price.toLocaleString()}`;

  // 価格テキストを描画
  ctx.font = `bold ${baseFontSize * 2}px Arial, sans-serif`;
  ctx.fillStyle = "#1e293b";
  ctx.textAlign = "left";
  ctx.fillText(priceText, padding, currentY + baseFontSize * 0.8);
  currentY += baseFontSize * 2.2;

  // 9. コメント
  if (pop.comment) {
    const commentStartY = canvasHeight - padding - baseFontSize * 5;

    const commentLines = wrapText(ctx, pop.comment, contentWidth);

    // コメントテキスト
    ctx.font = `${baseFontSize * 1.5}px Arial, sans-serif`;
    ctx.fillStyle = "#334155";
    let commentY = commentStartY;
    commentLines.forEach((line) => {
      if (line.trim() !== "") {
        ctx.fillText(line, padding, commentY);
      }
      // 空行でも行間をあける
      commentY += baseFontSize * 1.4 * 1.5;
    });
  }

  // 1. バッジを右上に描画（最後に描画）
  if (pop.badges.length > 0) {
    const badgeY = foldLineY + padding + baseFontSize; // アーティスト名と同じ高さ
    drawBadges(
      ctx,
      pop.badges,
      canvasWidth - padding,
      badgeY - baseFontSize * 0.8,
      baseFontSize * 0.8
    );
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
    RECOMMEND: { bg: "#10b981", text: "#ffffff" },
    MUST: { bg: "#ef4444", text: "#ffffff" },
    RAVE: { bg: "#8b5cf6", text: "#ffffff" },
    ACID: { bg: "#f59e0b", text: "#ffffff" },
  };

  let currentX = startX;
  const badgeHeight = fontSize * 1.8;
  const badgeSpacing = fontSize * 0.4;

  badges.forEach((badge) => {
    const colors = badgeColors[badge.type] || {
      bg: "#6b7280",
      text: "#ffffff",
    };

    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    const textWidth = ctx.measureText(badge.displayName).width;
    const badgeWidth = textWidth + fontSize * 1.2;

    currentX -= badgeWidth;

    // バッジ背景（角丸風）
    ctx.fillStyle = colors.bg;
    ctx.fillRect(currentX, startY, badgeWidth, badgeHeight);

    // バッジの影
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(currentX + 1, startY + 1, badgeWidth, badgeHeight);

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

    // 描画関数を呼び出し
    drawPopTemplateContent(ctx, pop, width, height);
  }, [pop, width, height, dpi]);

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
