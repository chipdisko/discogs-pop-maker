import { Pop } from "../entities/Pop";
import { PopDimensions } from "../value-objects/PopDimensions";

export interface A4Layout {
  pages: A4Page[];
  totalPops: number;
}

export interface A4Page {
  pageNumber: number;
  pops: PopLayoutPosition[];
  dimensions: A4Dimensions;
}

export interface PopLayoutPosition {
  pop: Pop;
  x: number; // mm
  y: number; // mm
  width: number; // mm
  height: number; // mm
}

export interface A4Dimensions {
  width: number; // 210mm
  height: number; // 297mm
}

export class PrintLayoutService {
  private static readonly A4_WIDTH = 210; // mm
  private static readonly A4_HEIGHT = 297; // mm
  private static readonly POPS_PER_PAGE = 8; // 2x4配置（A7サイズ用）
  private static readonly COLUMNS = 2;
  private static readonly ROWS = 4;
  private static readonly MARGIN = 5; // mm（A7サイズ用にマージンを調整）

  /**
   * PopリストからA4レイアウトを生成
   */
  generateA4Layout(pops: Pop[]): A4Layout {
    if (pops.length === 0) {
      return {
        pages: [],
        totalPops: 0,
      };
    }

    const pages: A4Page[] = [];
    let currentPage = 1;

    // 8枚ずつページに分割
    for (let i = 0; i < pops.length; i += PrintLayoutService.POPS_PER_PAGE) {
      const pagePops = pops.slice(i, i + PrintLayoutService.POPS_PER_PAGE);
      const pageLayout = this.createPageLayout(pagePops, currentPage);
      pages.push(pageLayout);
      currentPage++;
    }

    return {
      pages,
      totalPops: pops.length,
    };
  }

  /**
   * 1ページのレイアウトを作成
   */
  private createPageLayout(pops: Pop[], pageNumber: number): A4Page {
    const positions: PopLayoutPosition[] = [];

    // ポップのサイズを取得（全て同じサイズと仮定）
    const popDimensions = pops[0]?.getDimensions() || PopDimensions.STANDARD;
    const popWidth = popDimensions.getWidth();
    const popHeight = popDimensions.getHeight();

    // レイアウト計算
    const availableWidth =
      PrintLayoutService.A4_WIDTH - PrintLayoutService.MARGIN * 2;
    const availableHeight =
      PrintLayoutService.A4_HEIGHT - PrintLayoutService.MARGIN * 2;

    const spacingX =
      (availableWidth - popWidth * PrintLayoutService.COLUMNS) /
      (PrintLayoutService.COLUMNS - 1);
    const spacingY =
      (availableHeight - popHeight * PrintLayoutService.ROWS) /
      (PrintLayoutService.ROWS - 1);

    // 各ポップの位置を計算
    pops.forEach((pop, index) => {
      const col = index % PrintLayoutService.COLUMNS;
      const row = Math.floor(index / PrintLayoutService.COLUMNS);

      const x = PrintLayoutService.MARGIN + col * (popWidth + spacingX);
      const y = PrintLayoutService.MARGIN + row * (popHeight + spacingY);

      positions.push({
        pop,
        x,
        y,
        width: popWidth,
        height: popHeight,
      });
    });

    return {
      pageNumber,
      pops: positions,
      dimensions: {
        width: PrintLayoutService.A4_WIDTH,
        height: PrintLayoutService.A4_HEIGHT,
      },
    };
  }

  /**
   * 必要なページ数を計算
   */
  calculateRequiredPages(popCount: number): number {
    return Math.ceil(popCount / PrintLayoutService.POPS_PER_PAGE);
  }

  /**
   * 切り取り線の位置を計算
   */
  generateCutLines(page: A4Page): CutLine[] {
    const lines: CutLine[] = [];

    // 縦の切り取り線
    for (let col = 1; col < PrintLayoutService.COLUMNS; col++) {
      const x = page.pops[col]?.x - 5; // ポップの左端から5mm左
      lines.push({
        type: "vertical",
        x,
        y1: PrintLayoutService.MARGIN,
        y2: PrintLayoutService.A4_HEIGHT - PrintLayoutService.MARGIN,
      });
    }

    // 横の切り取り線
    for (let row = 1; row < PrintLayoutService.ROWS; row++) {
      const y = page.pops[row * PrintLayoutService.COLUMNS]?.y - 5; // ポップの上端から5mm上
      lines.push({
        type: "horizontal",
        x1: PrintLayoutService.MARGIN,
        x2: PrintLayoutService.A4_WIDTH - PrintLayoutService.MARGIN,
        y,
      });
    }

    return lines;
  }
}

export interface CutLine {
  type: "vertical" | "horizontal";
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}
