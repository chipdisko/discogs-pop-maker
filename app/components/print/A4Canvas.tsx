import React, { useRef, useEffect } from "react";
import type { A4PageResponse } from "@/src/application";
import { drawPopTemplateContent } from "../pop/PopTemplate";

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
  };

  return (
    <div className='flex justify-center w-full'>
      <div className='relative w-full max-w-4xl'>
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid #ddd",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "100%",
            height: "auto",
            aspectRatio: `${pageData.dimensions.width} / ${pageData.dimensions.height}`,
          }}
          className='w-full h-auto'
        />
      </div>
    </div>
  );
}
