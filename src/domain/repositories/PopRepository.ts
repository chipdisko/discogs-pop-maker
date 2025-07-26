import { Pop } from "../entities/Pop";
import { PopId } from "../entities/PopId";

export interface PopRepository {
  /**
   * Popを保存
   */
  save(pop: Pop): Promise<void>;

  /**
   * IDでPopを取得
   */
  findById(id: PopId): Promise<Pop | null>;

  /**
   * 全てのPopを取得
   */
  findAll(): Promise<Pop[]>;

  /**
   * Popを削除
   */
  delete(id: PopId): Promise<void>;

  /**
   * 複数のPopを取得
   */
  findByIds(ids: PopId[]): Promise<Pop[]>;

  /**
   * 作成日時でソートして取得
   */
  findAllOrderByCreatedAt(ascending?: boolean): Promise<Pop[]>;
}
