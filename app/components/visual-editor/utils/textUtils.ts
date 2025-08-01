import type { ElementStyle } from '../types';

export interface TextMeasurement {
  actualWidth: number;
  actualHeight: number;
  needsCompression: boolean;
  compressedScaleX: number;
  compressedScaleY: number;
  adjustedFontSize: number;
}

// テキストの実際のサイズを測定
export function measureText(
  text: string,
  fontSize: number,
  fontFamily: string,
  maxWidth: number,
  maxHeight: number,
  maxLines?: number
): TextMeasurement {
  // 測定用のキャンバスを作成
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      actualWidth: 0,
      actualHeight: 0,
      needsCompression: false,
      compressedScaleX: 1,
      compressedScaleY: 1,
      adjustedFontSize: fontSize,
    };
  }

  ctx.font = `${fontSize}px ${fontFamily}`;
  
  const lineHeight = fontSize * 1.2;
  const words = text.split(' ');
  const lines: string[] = [];
  
  if (maxLines === 3) {
    // コメント専用の3行固定処理
    const result = wrapTextToLines(ctx, text, maxWidth, 3);
    lines.push(...result.lines);
  } else {
    // 通常のテキスト処理
    let currentLine = words[0] || '';
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = `${currentLine} ${word}`;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  const actualWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
  const actualHeight = lines.length * lineHeight;

  let compressedScaleX = 1;
  let compressedScaleY = 1;
  let adjustedFontSize = fontSize;
  let needsCompression = false;

  // 幅の圧縮が必要かチェック
  if (actualWidth > maxWidth) {
    compressedScaleX = Math.max(0.5, maxWidth / actualWidth); // 最小50%
    needsCompression = true;
  }

  // 高さの圧縮が必要かチェック（3行固定の場合は高さ圧縮なし）
  if (maxLines !== 3 && actualHeight > maxHeight) {
    compressedScaleY = Math.max(0.5, maxHeight / actualHeight); // 最小50%
    needsCompression = true;
  }

  return {
    actualWidth,
    actualHeight,
    needsCompression,
    compressedScaleX,
    compressedScaleY,
    adjustedFontSize,
  };
}

// テキストを指定行数に分割（コメント用）
export function wrapTextToLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): { lines: string[]; needsCompression: boolean } {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
      
      if (lines.length >= maxLines - 1) {
        // 最後の行に残りの単語を詰める
        const remainingWords = words.slice(words.indexOf(word));
        currentLine = remainingWords.join(' ');
        break;
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // 指定行数に満たない場合は空行を追加
  while (lines.length < maxLines) {
    lines.push('');
  }

  // 行数を指定行数に制限
  const finalLines = lines.slice(0, maxLines);
  
  // 最後の行が長すぎる場合の圧縮判定
  const lastLineWidth = ctx.measureText(finalLines[maxLines - 1] || '').width;
  const needsCompression = lastLineWidth > maxWidth;

  return {
    lines: finalLines,
    needsCompression,
  };
}

// 自動調整されたスタイルを計算
export function calculateAutoFitStyle(
  element: { style?: ElementStyle; dataBinding: string },
  text: string,
  containerWidth: number,
  containerHeight: number
): Partial<ElementStyle> {
  if (!element.style?.autoFit) {
    return {};
  }

  const fontSize = element.style?.fontSize || 12;
  const fontFamily = element.style?.fontFamily || 'Arial, sans-serif';
  const maxLines = element.dataBinding === 'comment' ? 3 : undefined;

  const measurement = measureText(
    text,
    fontSize,
    fontFamily,
    containerWidth,
    containerHeight,
    maxLines
  );

  if (!measurement.needsCompression) {
    return {};
  }

  return {
    scaleX: measurement.compressedScaleX,
    scaleY: measurement.compressedScaleY,
    fontSize: measurement.adjustedFontSize,
  };
}