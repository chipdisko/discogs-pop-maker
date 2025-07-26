import React, { useRef, useEffect } from "react";
import type {
  A4PageResponse,
  PopResponse,
  CutLineResponse,
} from "../../src/application";
import { drawPopTemplateContent } from "./PopTemplate";

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

    // A4の枠線（デバッグ用）- 削除
    // ctx.strokeStyle = "#e5e5e5";
    // ctx.lineWidth = 1;
    // ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 各ポップを描画
    page.pops.forEach((popPosition) => {
      const popX = mmToPixel(popPosition.x);
      const popY = mmToPixel(popPosition.y);
      const popWidth = mmToPixel(popPosition.width);
      const popHeight = mmToPixel(popPosition.height);

      // ポップ領域を保存
      ctx.save();
      ctx.translate(popX, popY);

      // PopTemplateの描画関数を呼び出し
      drawPopTemplateContent(ctx, popPosition.pop, popWidth, popHeight);

      ctx.restore();
    });

    // 切り取り線を描画
    page.cutLines.forEach((cutLine) => {
      drawCutLine(ctx, cutLine, dpi);
    });
  };

  const drawCutLine = (
    ctx: CanvasRenderingContext2D,
    cutLine: CutLineResponse,
    dpi: number
  ) => {
    const mmToPixel = (mm: number) => Math.round(mm * (dpi / 25.4));

    // 切り取り線をより薄く、細く調整
    ctx.strokeStyle = "#f0f0f0"; // より薄いグレー
    ctx.lineWidth = 0.5; // より細い線
    ctx.setLineDash([3, 3]); // より短い破線

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
