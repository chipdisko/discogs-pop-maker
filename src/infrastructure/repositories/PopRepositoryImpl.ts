import {
  PopRepository,
  Pop,
  PopId,
  Release,
  Comment,
  Badge,
  PopDimensions,
} from "../../domain";

// LocalStorage用のデータ形式
interface PopStorageData {
  id: string;
  release: {
    discogsId: string;
    title: string;
    artistName: string;
    label: string;
    country: string;
    releaseDate: string;
    genres: string[];
    styles: string[];
  };
  comment: string;
  badges: string[]; // BadgeTypeの配列
  dimensions: {
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export class PopRepositoryImpl implements PopRepository {
  private readonly STORAGE_KEY = "discogs-pop-maker-pops";

  /**
   * Popを保存
   */
  async save(pop: Pop): Promise<void> {
    try {
      const pops = await this.getAllStorageData();
      const popData = this.popToStorageData(pop);

      // 既存データの更新または新規追加
      const existingIndex = pops.findIndex((p) => p.id === popData.id);
      if (existingIndex >= 0) {
        pops[existingIndex] = popData;
      } else {
        pops.push(popData);
      }

      this.saveToStorage(pops);
    } catch (error) {
      throw new Error(
        `Popの保存に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  }

  /**
   * IDでPopを取得
   */
  async findById(id: PopId): Promise<Pop | null> {
    try {
      const pops = await this.getAllStorageData();
      const popData = pops.find((p) => p.id === id.getValue());

      if (!popData) {
        return null;
      }

      return this.storageDataToPop(popData);
    } catch (error) {
      throw new Error(
        `Popの取得に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  }

  /**
   * 全てのPopを取得
   */
  async findAll(): Promise<Pop[]> {
    try {
      const pops = await this.getAllStorageData();
      return pops.map((popData) => this.storageDataToPop(popData));
    } catch (error) {
      throw new Error(
        `全Popの取得に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  }

  /**
   * Popを削除
   */
  async delete(id: PopId): Promise<void> {
    try {
      const pops = await this.getAllStorageData();
      const filteredPops = pops.filter((p) => p.id !== id.getValue());
      this.saveToStorage(filteredPops);
    } catch (error) {
      throw new Error(
        `Popの削除に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  }

  /**
   * 複数のPopを取得
   */
  async findByIds(ids: PopId[]): Promise<Pop[]> {
    try {
      const pops = await this.getAllStorageData();
      const idStrings = ids.map((id) => id.getValue());
      const filteredPops = pops.filter((p) => idStrings.includes(p.id));
      return filteredPops.map((popData) => this.storageDataToPop(popData));
    } catch (error) {
      throw new Error(
        `複数Popの取得に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  }

  /**
   * 作成日時でソートして取得
   */
  async findAllOrderByCreatedAt(ascending = true): Promise<Pop[]> {
    try {
      const pops = await this.getAllStorageData();

      // 作成日時でソート
      const sortedPops = pops.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
      });

      return sortedPops.map((popData) => this.storageDataToPop(popData));
    } catch (error) {
      throw new Error(
        `ソート済みPopの取得に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  }

  // ========== プライベートメソッド ==========

  /**
   * LocalStorageから全データを取得
   */
  private async getAllStorageData(): Promise<PopStorageData[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as PopStorageData[];
    } catch (error) {
      console.error("LocalStorageからのデータ読み込みエラー:", error);
      return [];
    }
  }

  /**
   * LocalStorageにデータを保存
   */
  private saveToStorage(pops: PopStorageData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pops));
    } catch (error) {
      throw new Error("LocalStorageへの保存に失敗しました");
    }
  }

  /**
   * PopエンティティをStorageData形式に変換
   */
  private popToStorageData(pop: Pop): PopStorageData {
    const release = pop.getRelease();
    const dimensions = pop.getDimensions();

    return {
      id: pop.getId().getValue(),
      release: {
        discogsId: release.getDiscogsId(),
        title: release.getTitle(),
        artistName: release.getArtistName(),
        label: release.getLabel(),
        country: release.getCountry(),
        releaseDate: release.getReleaseDate(),
        genres: release.getGenres(),
        styles: release.getStyles(),
      },
      comment: pop.getComment().getValue(),
      badges: pop.getBadges().map((badge) => badge.getValue()),
      dimensions: {
        width: dimensions.getWidth(),
        height: dimensions.getHeight(),
      },
      createdAt: pop.getCreatedAt().toISOString(),
      updatedAt: pop.getUpdatedAt().toISOString(),
    };
  }

  /**
   * StorageDataをPopエンティティに変換
   */
  private storageDataToPop(data: PopStorageData): Pop {
    // Release復元
    const release = Release.create({
      discogsId: data.release.discogsId,
      title: data.release.title,
      artistName: data.release.artistName,
      label: data.release.label,
      country: data.release.country,
      releaseDate: data.release.releaseDate,
      genres: data.release.genres,
      styles: data.release.styles,
    });

    // 他のValue Objects復元
    const id = PopId.fromString(data.id);
    const comment = new Comment(data.comment);
    const badges = data.badges.map((badgeType) => Badge.fromString(badgeType));
    const dimensions = new PopDimensions(
      data.dimensions.width,
      data.dimensions.height
    );
    const createdAt = new Date(data.createdAt);
    const updatedAt = new Date(data.updatedAt);

    // Pop復元
    return Pop.restore(
      id,
      release,
      comment,
      badges,
      dimensions,
      createdAt,
      updatedAt
    );
  }
}
