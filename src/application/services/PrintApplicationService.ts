import {
  PopId,
  PopRepository,
  PrintLayoutService,
  A4Layout,
  A4Page,
  PopLayoutPosition,
} from "../../domain";

import {
  GeneratePrintDataRequest,
  PrintDataResponse,
  A4LayoutResponse,
  A4PageResponse,
  PopLayoutPositionResponse,
  A4DimensionsResponse,
  CanvasDataResponse,
  CanvasElementResponse,
  PopElementData,
} from "../dtos/PrintDtos";

import { ErrorResponse } from "../dtos/PopDtos";

import { PopApplicationService } from "./PopApplicationService";

export class PrintApplicationService {
  private readonly printLayoutService: PrintLayoutService;

  constructor(
    private readonly popRepository: PopRepository,
    private readonly popApplicationService: PopApplicationService
  ) {
    this.printLayoutService = new PrintLayoutService();
  }

  /**
   * 印刷用データを生成
   */
  async generatePrintData(
    request: GeneratePrintDataRequest
  ): Promise<PrintDataResponse | ErrorResponse> {
    try {
      // 1. ポップデータを取得
      const popIds = request.popIds.map((id) => PopId.fromString(id));
      const pops = await this.popRepository.findByIds(popIds);

      if (pops.length === 0) {
        return {
          message: "ポップが見つかりません",
          code: "NO_POPS_FOUND",
        };
      }

      // 2. A4レイアウトを生成
      const layout = this.printLayoutService.generateA4Layout(pops);

      // 3. Canvas用データを生成
      const canvasData = await this.generateCanvasData(
        layout,
        request.dpi || 300
      );

      // 4. レスポンス形式に変換
      return {
        layout: this.toA4LayoutResponse(layout),
        canvasData,
        totalPages: layout.pages.length,
        totalPops: layout.totalPops,
      };
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "GENERATE_PRINT_DATA_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  /**
   * A4レイアウトのみを生成（印刷プレビュー用）
   */
  async generateLayoutOnly(
    popIds: string[]
  ): Promise<A4LayoutResponse | ErrorResponse> {
    try {
      // 1. ポップデータを取得
      const popIdObjects = popIds.map((id) => PopId.fromString(id));
      const pops = await this.popRepository.findByIds(popIdObjects);

      if (pops.length === 0) {
        return {
          message: "ポップが見つかりません",
          code: "NO_POPS_FOUND",
        };
      }

      // 2. A4レイアウトを生成
      const layout = this.printLayoutService.generateA4Layout(pops);

      // 3. レスポンス形式に変換
      return this.toA4LayoutResponse(layout);
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "GENERATE_LAYOUT_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  /**
   * 必要ページ数を計算
   */
  calculateRequiredPages(popCount: number): number {
    return this.printLayoutService.calculateRequiredPages(popCount);
  }

  // ========== プライベートメソッド ==========

  /**
   * Canvas用データを生成
   */
  private async generateCanvasData(
    layout: A4Layout,
    dpi: number
  ): Promise<CanvasDataResponse[]> {
    const canvasData: CanvasDataResponse[] = [];

    for (const page of layout.pages) {
      const pageData = await this.generatePageCanvasData(page, dpi);
      canvasData.push(pageData);
    }

    return canvasData;
  }

  /**
   * 1ページのCanvas用データを生成
   */
  private async generatePageCanvasData(
    page: A4Page,
    dpi: number
  ): Promise<CanvasDataResponse> {
    const mmToPixel = (mm: number) => Math.round(mm * (dpi / 25.4));

    const width = mmToPixel(page.dimensions.width);
    const height = mmToPixel(page.dimensions.height);

    const elements: CanvasElementResponse[] = [];

    // ポップ要素を追加
    for (const popPosition of page.pops) {
      const popElement = await this.createPopElement(popPosition, dpi);
      elements.push(popElement);
    }

    return {
      pageNumber: page.pageNumber,
      width,
      height,
      backgroundColor: "#ffffff",
      elements,
    };
  }

  /**
   * ポップ要素を作成
   */
  private async createPopElement(
    popPosition: PopLayoutPosition,
    dpi: number
  ): Promise<CanvasElementResponse> {
    const mmToPixel = (mm: number) => Math.round(mm * (dpi / 25.4));

    // PopをResponseDTOに変換
    const popResponse = this.popApplicationService["toPopResponse"](
      popPosition.pop
    );

    const elementData: PopElementData = {
      popId: popResponse.id,
      release: popResponse.release,
      comment: popResponse.comment,
      badgeId: popResponse.badgeId,
    };

    return {
      type: "pop",
      id: `pop-${popResponse.id}`,
      x: mmToPixel(popPosition.x),
      y: mmToPixel(popPosition.y),
      width: mmToPixel(popPosition.width),
      height: mmToPixel(popPosition.height),
      data: elementData,
    };
  }

  /**
   * A4LayoutをResponseDTOに変換
   */
  private toA4LayoutResponse(layout: A4Layout): A4LayoutResponse {
    return {
      pages: layout.pages.map((page) => this.toA4PageResponse(page)),
      totalPops: layout.totalPops,
    };
  }

  /**
   * A4PageをResponseDTOに変換
   */
  private toA4PageResponse(page: A4Page): A4PageResponse {
    return {
      pageNumber: page.pageNumber,
      pops: page.pops.map((pop) => this.toPopLayoutPositionResponse(pop)),
      dimensions: this.toA4DimensionsResponse(page.dimensions),
      cutLines: [], // 切り取り線は削除
    };
  }

  /**
   * PopLayoutPositionをResponseDTOに変換
   */
  private toPopLayoutPositionResponse(
    position: PopLayoutPosition
  ): PopLayoutPositionResponse {
    // PopをResponseDTOに変換（本来はPopApplicationServiceを使用すべき）
    const popResponse = this.popApplicationService["toPopResponse"](
      position.pop
    );

    return {
      pop: popResponse,
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height,
      cssPixels: {
        x: Math.round(position.x * 3.7795), // 96dpi
        y: Math.round(position.y * 3.7795),
        width: Math.round(position.width * 3.7795),
        height: Math.round(position.height * 3.7795),
      },
      printPixels: {
        x: Math.round(position.x * 11.811), // 300dpi
        y: Math.round(position.y * 11.811),
        width: Math.round(position.width * 11.811),
        height: Math.round(position.height * 11.811),
      },
    };
  }

  /**
   * A4DimensionsをResponseDTOに変換
   */
  private toA4DimensionsResponse(dimensions: {
    width: number;
    height: number;
  }): A4DimensionsResponse {
    return {
      width: dimensions.width,
      height: dimensions.height,
      cssPixels: {
        width: Math.round(dimensions.width * 3.7795),
        height: Math.round(dimensions.height * 3.7795),
      },
      printPixels: {
        width: Math.round(dimensions.width * 11.811),
        height: Math.round(dimensions.height * 11.811),
      },
    };
  }
}
