import {
  Pop,
  PopId,
  Release,
  Comment,

  Condition,
  Price,
  DiscogsUrl,
  PopDimensions,
  DiscogsRepository,
  PopRepository,
} from "../../domain";

import {
  CreatePopRequest,
  UpdatePopRequest,
  PopResponse,
  PopListResponse,
  ErrorResponse,
  ReleaseResponse,
  DimensionsResponse,
} from "../dtos/PopDtos";

export class PopApplicationService {
  constructor(
    private readonly discogsRepository: DiscogsRepository,
    private readonly popRepository: PopRepository
  ) {}

  /**
   * Discogs URLからポップを作成
   */
  async createPopFromDiscogsUrl(
    request: CreatePopRequest
  ): Promise<PopResponse | ErrorResponse> {
    try {
      // 1. Discogs URLを検証・解析
      if (!request.discogsUrl) {
        throw new Error("Discogs URLは必須です");
      }
      const discogsUrl = new DiscogsUrl(request.discogsUrl);

      // 2. Discogsからリリース情報を取得（Discogs Release IDを取得するため）
      let discogsRelease: Release;
      let discogsId: string;

      try {
        discogsRelease = await this.discogsRepository.getReleaseByUrl(
          discogsUrl
        );
        discogsId = discogsRelease.getDiscogsId();
      } catch (discogsError) {
        // Discogsデータの取得に失敗した場合、手動入力データとして処理
        console.warn("Discogsデータの取得に失敗しました:", discogsError);

        // 手動入力データからリリース情報を作成
        const release = Release.create({
          discogsId: `manual_${Date.now()}`, // 手動入力用のID
          discogsType: request.discogsType,
          title: request.title || "",
          artistName: request.artistName || "",
          label: request.label || "",
          country: request.country || "",
          releaseDate: request.releaseDate || "",
          genres: request.genres || [],
          styles: request.styles || [],
        });

        // コメントを作成
        const comment = request.comment
          ? new Comment(request.comment)
          : Comment.empty();

        // カスタムバッジIDを取得
        const badgeId = request.badgeId || null;

        // コンディションを作成
        const condition = request.condition
          ? Condition.fromString(request.condition)
          : Condition.create("New");

        // 価格を作成
        const price = request.price ? Price.create(request.price) : undefined;

        // Popを作成
        const pop = Pop.create(release, comment, badgeId, condition, price);

        // 保存
        await this.popRepository.save(pop);

        // レスポンス形式に変換
        return this.toPopResponse(pop);
      }

      // 3. ユーザーが編集したデータを優先してリリース情報を作成
      const release = Release.create({
        discogsId: discogsId, // 有効なDiscogs Release ID
        discogsType: discogsRelease.getDiscogsType(),
        title: request.title || discogsRelease.getTitle(),
        artistName: request.artistName || discogsRelease.getArtistName(),
        label: request.label || discogsRelease.getLabel(),
        country: request.country || discogsRelease.getCountry(),
        releaseDate: request.releaseDate || discogsRelease.getReleaseDate(),
        genres: request.genres || discogsRelease.getGenres(),
        styles: request.styles || discogsRelease.getStyles(),
      });

      // 4. コメントを作成
      const comment = request.comment
        ? new Comment(request.comment)
        : Comment.empty();

      // 5. カスタムバッジIDを取得
      const badgeId = request.badgeId || null;

      // 6. コンディションを作成
      const condition = request.condition
        ? Condition.fromString(request.condition)
        : Condition.create("New");

      // 7. 価格を作成
      const price = request.price ? Price.create(request.price) : undefined;

      // 8. Popを作成
      const pop = Pop.create(release, comment, badgeId, condition, price);

      // 9. 保存
      await this.popRepository.save(pop);

      // 10. レスポンス形式に変換
      return this.toPopResponse(pop);
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "CREATE_POP_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  /**
   * 手動入力データからポップを作成
   */
  async createPopFromManualData(
    request: CreatePopRequest
  ): Promise<PopResponse | ErrorResponse> {
    try {
      // 1. リリース情報を作成
      const release = Release.create({
        discogsId: request.discogsUrl || `manual_${Date.now()}`,
        discogsType: request.discogsType,
        title: request.title || "",
        artistName: request.artistName || "",
        label: request.label || "",
        country: request.country || "",
        releaseDate: request.releaseDate || "",
        genres: request.genres || [],
        styles: request.styles || [],
      });

      // 2. コメントを作成
      const comment = request.comment
        ? new Comment(request.comment)
        : Comment.empty();

      // 3. カスタムバッジIDを取得
      const badgeId = request.badgeId || null;

      // 4. コンディションを作成
      const condition = request.condition
        ? Condition.fromString(request.condition)
        : Condition.create("New");

      // 5. 価格を作成
      const price = request.price ? Price.create(request.price) : undefined;

      // 6. Popを作成
      const pop = Pop.create(release, comment, badgeId, condition, price);

      // 7. 保存
      await this.popRepository.save(pop);

      // 8. レスポンス形式に変換
      return this.toPopResponse(pop);
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "CREATE_POP_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  /**
   * ポップを更新
   */
  async updatePop(
    request: UpdatePopRequest
  ): Promise<PopResponse | ErrorResponse> {
    try {
      // 1. ポップを取得
      const popId = PopId.fromString(request.id);
      const pop = await this.popRepository.findById(popId);

      if (!pop) {
        return {
          message: "ポップが見つかりません",
          code: "POP_NOT_FOUND",
        };
      }

      // 2. コメントを更新
      if (request.comment !== undefined) {
        const comment = request.comment
          ? new Comment(request.comment)
          : Comment.empty();
        pop.updateComment(comment);
      }

      // 3. カスタムバッジIDを更新
      if (request.badgeId !== undefined) {
        pop.setBadgeId(request.badgeId);
      }

      // 4. コンディションを更新
      if (request.condition !== undefined) {
        const condition = Condition.fromString(request.condition);
        pop.updateCondition(condition);
      }

      // 5. 価格を更新
      if (request.price !== undefined) {
        const price =
          request.price > 0 ? Price.create(request.price) : Price.empty();
        pop.updatePrice(price);
      }

      // 6. リリース情報を更新
      if (
        request.title !== undefined ||
        request.artistName !== undefined ||
        request.label !== undefined ||
        request.country !== undefined ||
        request.releaseDate !== undefined ||
        request.genres !== undefined ||
        request.styles !== undefined
      ) {
        const currentRelease = pop.getRelease();
        const updatedRelease = Release.create({
          discogsId: currentRelease.getDiscogsId(),
          discogsType: currentRelease.getDiscogsType(),
          title: request.title ?? currentRelease.getTitle(),
          artistName: request.artistName ?? currentRelease.getArtistName(),
          label: request.label ?? currentRelease.getLabel(),
          country: request.country ?? currentRelease.getCountry(),
          releaseDate: request.releaseDate ?? currentRelease.getReleaseDate(),
          genres: request.genres ?? currentRelease.getGenres(),
          styles: request.styles ?? currentRelease.getStyles(),
        });
        pop.updateRelease(updatedRelease);
      }

      // 7. 保存
      await this.popRepository.save(pop);

      // 5. レスポンス形式に変換
      return this.toPopResponse(pop);
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "UPDATE_POP_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }


  /**
   * ポップを削除
   */
  async deletePop(id: string): Promise<void | ErrorResponse> {
    try {
      const popId = PopId.fromString(id);
      await this.popRepository.delete(popId);
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "DELETE_POP_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  /**
   * ポップを1件取得
   */
  async getPopById(id: string): Promise<PopResponse | ErrorResponse> {
    try {
      const popId = PopId.fromString(id);
      const pop = await this.popRepository.findById(popId);

      if (!pop) {
        return {
          message: "ポップが見つかりません",
          code: "POP_NOT_FOUND",
        };
      }

      return this.toPopResponse(pop);
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "GET_POP_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  /**
   * 全ポップを取得
   */
  async getAllPops(): Promise<PopListResponse | ErrorResponse> {
    try {
      const pops = await this.popRepository.findAllOrderByCreatedAt(false); // 新しい順

      return {
        pops: pops.map((pop) => this.toPopResponse(pop)),
        total: pops.length,
      };
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "GET_ALL_POPS_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  /**
   * 複数のポップを取得
   */
  async getPopsByIds(ids: string[]): Promise<PopListResponse | ErrorResponse> {
    try {
      const popIds = ids.map((id) => PopId.fromString(id));
      const pops = await this.popRepository.findByIds(popIds);

      return {
        pops: pops.map((pop) => this.toPopResponse(pop)),
        total: pops.length,
      };
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
        code: "GET_POPS_BY_IDS_ERROR",
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  // ========== プライベートメソッド ==========

  /**
   * PopエンティティをResponseDTOに変換
   */
  private toPopResponse(pop: Pop): PopResponse {
    return {
      id: pop.getId().getValue(),
      release: this.toReleaseResponse(pop.getRelease()),
      comment: pop.getComment().getValue(),
      badgeId: pop.getBadgeId(),
      condition: pop.getCondition().getValue(),
      price: pop.getPrice().getValue(),
      dimensions: this.toDimensionsResponse(pop.getDimensions()),
      createdAt: pop.getCreatedAt().toISOString(),
      updatedAt: pop.getUpdatedAt().toISOString(),
    };
  }

  private toReleaseResponse(release: Release): ReleaseResponse {
    return {
      discogsId: release.getDiscogsId(),
      discogsType: release.getDiscogsType(),
      title: release.getTitle(),
      artistName: release.getArtistName(),
      label: release.getLabel(),
      country: release.getCountry(),
      releaseDate: release.getReleaseDate(),
      genres: release.getGenres(),
      styles: release.getStyles(),
      fullTitle: release.getFullTitle(),
      releaseYear: release.getReleaseYear(),
      genreStyleString: release.getGenreStyleString(),
    };
  }


  private toDimensionsResponse(dimensions: PopDimensions): DimensionsResponse {
    return {
      width: dimensions.getWidth(),
      height: dimensions.getHeight(),
      area: dimensions.getArea(),
      aspectRatio: dimensions.getAspectRatio(),
      isLandscape: dimensions.isLandscape(),
      isPortrait: dimensions.isPortrait(),
      cssPixels: dimensions.toCssPixels(),
      printPixels: dimensions.toPrintPixels(),
    };
  }
}
