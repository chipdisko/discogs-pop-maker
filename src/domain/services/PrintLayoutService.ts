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
  private static readonly MARGIN = 0; // mm（横向きA7サイズ用にマージンを0に調整）

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

    // マージン0で敷き詰める場合のスペーシング
    const spacingX = 0; // 横の間隔を0に
    const spacingY = 0; // 縦の間隔を0に

    // 各ポップの位置を計算
    pops.forEach((pop, index) => {
      const col = index % PrintLayoutService.COLUMNS;
      const row = Math.floor(index / PrintLayoutService.COLUMNS);

      const x = col * (popWidth + spacingX);
      const y = row * (popHeight + spacingY);

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
}
