import { DiscogsRepository, PopRepository } from "../../domain";
import {
  PopApplicationService,
  PrintApplicationService,
} from "../../application";
import { DiscogsRepositoryImpl, PopRepositoryImpl } from "../../infrastructure";

/**
 * DIコンテナ - アプリケーション全体の依存関係を管理
 */
export class Container {
  private static instance: Container;

  // Repository実装
  private readonly discogsRepository: DiscogsRepository;
  private readonly popRepository: PopRepository;

  // Application Services
  private readonly popApplicationService: PopApplicationService;
  private readonly printApplicationService: PrintApplicationService;

  private constructor() {
    // Repository実装をインスタンス化
    this.discogsRepository = new DiscogsRepositoryImpl();
    this.popRepository = new PopRepositoryImpl();

    // Application Servicesを依存関係付きでインスタンス化
    this.popApplicationService = new PopApplicationService(
      this.discogsRepository,
      this.popRepository
    );

    this.printApplicationService = new PrintApplicationService(
      this.popRepository,
      this.popApplicationService
    );
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * PopApplicationServiceを取得
   */
  getPopApplicationService(): PopApplicationService {
    return this.popApplicationService;
  }

  /**
   * PrintApplicationServiceを取得
   */
  getPrintApplicationService(): PrintApplicationService {
    return this.printApplicationService;
  }

  /**
   * DiscogsRepositoryを取得（テスト用）
   */
  getDiscogsRepository(): DiscogsRepository {
    return this.discogsRepository;
  }

  /**
   * PopRepositoryを取得（テスト用）
   */
  getPopRepository(): PopRepository {
    return this.popRepository;
  }

  /**
   * テスト用のリセット（開発環境でのみ使用）
   */
  static resetForTesting(): void {
    Container.instance = new Container();
  }
}

/**
 * 簡単にアクセスできるヘルパー関数
 */
export const getContainer = () => Container.getInstance();

/**
 * Application Servicesへの簡単アクセス
 */
export const usePopService = () => getContainer().getPopApplicationService();
export const usePrintService = () =>
  getContainer().getPrintApplicationService();
