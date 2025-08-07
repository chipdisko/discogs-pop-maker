# PopTemplate ビジュアルエディタ要件定義

## 概要

ユーザーが PopTemplate を視覚的に編集できる機能を提供する。各項目をドラッグ&ドロップで自由に配置し、リアルタイムでプレビューを確認しながら、直感的にデザインをカスタマイズできるエディタを実装する。

### 重要な前提

- POP は実店舗でレコード陳列時に使用する値札カード
- 折り線で折り畳み、レコードジャケットに差し込んで使用
- 折り線より上部（0〜15mm）は裏面として扱い、折り畳み時に見える部分
- 折り線より下部（15〜74mm）が表面（メイン情報表示エリア）

## 主要機能

### 1. ドラッグ&ドロップによる要素配置

- **基本要素のドラッグ&ドロップ**
  - アーティスト名、タイトル、レーベル、価格、コメント、コンディション、ジャンル、リリース情報（国・年）、バッジなどの要素を自由に配置
  - 画像要素（JPG/PNG/WebP対応、ファイルアップロード機能付き）
  - 裏面要素（店舗名など、任意のテキスト要素）
  - グリッドスナップ機能（2mm 単位で調整可能）
  - ガイドライン表示（他の要素との整列時に表示）
- **背景フレーム要素**
  - 装飾用の背景フレームを追加・配置
  - 複数の背景フレームを重ねて配置可能
  - 各フレームのスタイル（色、枠線、角丸等）を個別設定
  - リサイズハンドルによるインタラクティブなサイズ調整
  - 背景編集モードと要素編集モードの切り替え
- **折り線の管理**
  - 15mm 位置の折り線表示（破線で視覚的に表現）
  - 折り線より上部は裏面エリア（折り畳み時に見える面）
  - 裏面エリアに配置された要素は自動的に 180 度回転（Y 軸を中心に上下反転）
  - 回転プレビューで実際の表示を確認可能
  - 注意：裏面の要素は印刷時に正しく表示されるよう、エディタ上では上下逆さまに表示
- **裏面エリアのカスタマイズ**
  - 裏面テキストの自由編集（店舗名、連絡先等）
  - 複数のテキスト要素を配置可能
  - 各要素の位置調整（裏面エリア内で自由配置）
  - フォント、サイズ、色のカスタマイズ
  - デフォルトで「軒先レコード」を中央配置
- **要素のグループ化**
  - 複数要素を選択してグループ化
  - グループ単位での移動・コピー・削除
- **グリッドスナップの詳細仕様**
  - すべての要素の位置（x, y）は2mm単位でスナップ
  - すべての要素のサイズ（width, height）も2mm単位でスナップ
  - ドラッグによる要素移動時も常に2mmグリッドにスナップ
  - リサイズ操作時も2mmグリッドにスナップ
  - 数値入力時も自動的に2mmの倍数に丸められる

### 2. リアルタイムプレビュー

- **即時反映**
  - 変更がリアルタイムでプレビューに反映
  - アンドゥ・リドゥ機能（Ctrl+Z / Ctrl+Y）
- **プレビューモード**
  - 実寸表示（105mm x 74mm）
  - 印刷時の見た目を確認できるモード
  - A4 用紙への配置プレビュー

### 3. 要素の詳細編集

- **テキスト編集**
  - フォントサイズ（8pt〜48pt）
  - フォントファミリー（ゴシック、明朝、欧文フォント）
  - 文字色の選択（カラーピッカー）
  - 太字・斜体・下線
  - 行間・文字間調整
- **画像編集**
  - ファイルアップロード（JPG、PNG、WebP形式対応）
  - インタラクティブなトリミング機能（ユーザー指定範囲でクロップ）
  - 画像の表示方法（contain: アスペクト比維持・全体表示）
  - 画像ファイルの変更・削除機能
- **要素サイズの調整**
  - 各要素（アーティスト名、タイトル、レーベル等）の表示領域サイズを個別調整
  - ドラッグによるリサイズ（角と辺のハンドル）
  - 数値入力による正確なサイズ指定（幅・高さ）
  - アスペクト比の固定/解除オプション
- **オーバーフロー時の自動調整**
  - 設定した領域に収まらないテキストは自動的にサイズ調整
  - 横方向の圧縮（transform: scaleX）
  - 縦方向の圧縮（transform: scaleY）
  - フォントサイズの自動縮小
  - 複合的な調整（圧縮とフォントサイズの組み合わせ）
  - 最小可読性の確保（圧縮率の下限設定）
- **コメント要素の特殊仕様**
  - 必ず 3 行で表示（行数固定、改行位置は自動調整）
  - 最大幅は POP サイズ（105mm）に制限
  - 文字が長すぎて 3 行に収まらない場合の処理：
    1. まず改行位置を調整して 3 行に収める
    2. それでも収まらない場合は、フォントを横方向に圧縮（transform: scaleX）
    3. 圧縮率は自動計算（最小 50%まで、それ以下にはしない）
  - プレビューで圧縮状態を確認可能
  - 注意：コメントの行数は増減できない仕様
- **データ名ラベル設定**
  - 各要素にデータ名を示すラベルを表示可能
  - ラベルの表示/非表示切り替え
  - カスタムラベルテキストの設定（デフォルトはデータバインディング名）
  - ラベルのスタイル設定：
    - フォントサイズ調整（デフォルト12px）
    - 文字色設定（デフォルト#666666）
  - 表示モード選択：
    - positioned: 要素の周囲8方向に配置
    - inline: [ラベル]: [内容] 形式でインライン表示
  - 配置位置（positionedモード時）：
    - 外側/内側の選択
    - 8方向の位置指定（top-left, top-center, top-right, bottom-left, bottom-center, bottom-right, middle-left, middle-right）
- **要素のスタイル設定**
  - 背景色の設定
  - 枠線（ボーダー）の詳細設定：
    - 上下左右個別の枠線設定（borderTop, borderRight, borderBottom, borderLeft）
    - 各辺ごとの色設定（カラーピッカー対応）
    - 線の太さ設定（0.5mm単位、0〜5mmの範囲）
    - 線のタイプ設定（solid：実線、dashed：破線、dotted：点線、double：二重線、none：なし）
  - 角丸の詳細設定：
    - 四隅個別の角丸設定（borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius）
    - 各角の半径設定（mm単位、0〜20mmの範囲）
    - 全角一括設定オプション（borderRadius）
    - プリセット値（なし、小：2mm、中：4mm、大：8mm）
  - 影の追加（ドロップシャドウ）
  - 透明度の調整
  - テキスト配置設定：
    - 水平配置（textAlign）: left（左寄せ）、center（中央寄せ）、right（右寄せ）
    - 垂直配置（verticalAlign）: top（上寄せ）、middle（中央寄せ）、bottom（下寄せ）
    - 要素ブロック内でのコンテンツ位置を細かく制御
    - 注意: transform（scaleX/scaleY）使用時はtransform-originとの競合に注意が必要

### 4. テンプレート管理

- **プリセットテンプレート**
  - デフォルトテンプレート
  - ジャンル別推奨テンプレート（Jazz、Rock、Electronic 等）
  - ミニマルデザイン、情報重視デザインなど
- **カスタムテンプレート**
  - 作成したデザインを保存
  - テンプレートの共有機能
  - テンプレートのインポート・エクスポート（JSON 形式）

### 5. 条件付き表示

- **動的要素表示**
  - バッジがある場合のみ表示
  - コメントが長い場合の自動レイアウト調整
  - 価格が 0 円の場合「FREE」表示
  - QR コード表示（Discogs リリース URL がある場合のみ）
- **QR コード機能**
  - Discogs リリース URL の QR コード生成
  - 表示/非表示の切り替え可能
  - URL 入力をスキップした POP では自動的に非表示
  - URL が存在しない POP データの場合、QR コード要素自体を配置不可
  - QR コードのサイズ調整（10mm〜30mm、正方形固定）
  - 配置位置の自由設定（表面エリアのみ、裏面には配置不可）
  - エラー訂正レベルの設定（L/M/Q/H）
- **レスポンシブデザイン**
  - テキストの自動折り返し
  - 要素の自動リサイズオプション

### 6. 高度な編集機能

- **レイヤー管理**
  - 要素の重なり順を調整
  - レイヤーの表示/非表示切り替え
  - レイヤーのロック機能
- **整列・配置ツール**
  - 左揃え、中央揃え、右揃え
  - 上揃え、中央揃え、下揃え
  - 等間隔配置
  - 要素の複製（Ctrl+D）
- **キーボード操作**
  - 矢印キーによる要素移動（2mmグリッド単位）
  - 選択中要素のみキーボード操作が有効
  - 入力フィールドにフォーカスがある場合は無効化

### 7. データ連携

- **サンプルデータ**
  - リアルなサンプルデータでプレビュー
  - 複数のサンプルパターンを切り替え
  - 最長データでのレイアウト確認
- **一括適用**
  - 作成したテンプレートを複数の POP に一括適用
  - 適用前のプレビュー確認

## 技術仕様

### エディタ UI

- **キャンバス**
  - React + Canvas API または SVG
  - ズームイン・ズームアウト（50%〜200%）
  - パン機能（スペースキー + ドラッグ）
- **ツールパネル**
  - 左側：要素一覧・プロパティパネル
  - 右側：レイヤーパネル・テンプレート一覧
  - 上部：ツールバー（保存、元に戻す、やり直し等）

### データ構造

```typescript
interface VisualTemplate {
  id: string;
  name: string;
  backgroundFrames: BackgroundFrame[]; // 背景フレーム要素
  elements: TemplateElement[];
  settings: TemplateSettings;
}

interface TemplateElement {
  id: string;
  type: "text" | "badge" | "image" | "shape" | "qrcode";
  dataBinding: string; // 'artist', 'title', 'price', 'discogsUrl', 'custom' etc.
  position: { x: number; y: number }; // 単位：mm、左上が原点
  size: { width: number; height: number }; // 単位：mm
  style: ElementStyle;
  conditions?: DisplayCondition[];
  // 位置による自動処理
  isBackSide?: boolean; // 裏面エリア（y < 15mm）に配置されているか
  autoRotate?: boolean; // 裏面エリアで自動180度回転（デフォルトtrue）
  // カスタムテキスト用
  customText?: string; // dataBindingが'custom'の場合の任意テキスト
  // データ名ラベル設定
  label?: {
    show: boolean; // ラベル表示するかどうか
    text?: string; // カスタムラベルテキスト（未設定時はデフォルト）
    fontSize?: number; // ラベルフォントサイズ（デフォルト12px）
    color?: string; // ラベル文字色（デフォルト#666666）
    // 表示モード
    displayMode?: 'positioned' | 'inline'; // positioned: 配置モード, inline: [ラベル]: [内容] モード
    // 配置設定（positioned モードの場合のみ）
    placement?: 'outside' | 'inside'; // 外側/内側
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'middle-left' | 'middle-right'; // 8箇所
  };
  // QRコード要素専用
  qrSettings?: {
    errorCorrectionLevel: "L" | "M" | "Q" | "H";
    margin: number; // QRコード内部の余白
    color: string; // 前景色（通常は黒）
    backgroundColor: string; // 背景色（通常は白）
  };
  // 画像要素専用
  imageSettings?: {
    src: string; // 画像のData URL
    fileName?: string; // ファイル名
    originalWidth: number; // 元の画像サイズ（px）
    originalHeight: number; // 元の画像サイズ（px）
    crop?: {
      x: number; // クロップ開始位置（元画像に対する比率 0-1）
      y: number; // クロップ開始位置（元画像に対する比率 0-1）
      width: number; // クロップ幅（元画像に対する比率 0-1）
      height: number; // クロップ高さ（元画像に対する比率 0-1）
    };
  };
}

interface BorderStyle {
  color: string; // 枠線の色
  width: number; // 枠線の太さ（mm単位、0.5mm刻み）
  style: "solid" | "dashed" | "dotted" | "double" | "none"; // 線のタイプ
}

interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  // 枠線設定（後方互換性のため残す）
  borderColor?: string; // 非推奨: borderTop.colorなどを使用
  borderWidth?: number; // 非推奨: borderTop.widthなどを使用
  // 新しい詳細な枠線設定
  borderTop?: BorderStyle;
  borderRight?: BorderStyle;
  borderBottom?: BorderStyle;
  borderLeft?: BorderStyle;
  // 角丸設定（後方互換性のため残す）
  borderRadius?: number; // 非推奨: 四隅個別設定を使用
  // 新しい詳細な角丸設定
  borderTopLeftRadius?: number; // 左上の角丸（mm単位）
  borderTopRightRadius?: number; // 右上の角丸（mm単位）
  borderBottomRightRadius?: number; // 右下の角丸（mm単位）
  borderBottomLeftRadius?: number; // 左下の角丸（mm単位）
  shadow?: ShadowStyle;
  opacity?: number;
  // テキスト要素の自動調整
  scaleX?: number; // 横方向の圧縮率（0.5〜1.0）
  scaleY?: number; // 縦方向の圧縮率（0.5〜1.0）
  autoFit?: boolean; // 領域に合わせて自動調整
  minFontSize?: number; // 自動調整時の最小フォントサイズ
  maxLines?: number; // 最大行数（コメントは3固定）
  overflow?: "clip" | "scale" | "shrink" | "auto"; // オーバーフロー時の処理
  // テキスト配置設定
  textAlign?: "left" | "center" | "right"; // 水平方向の配置
  verticalAlign?: "top" | "middle" | "bottom"; // 垂直方向の配置
  // 注意: transform（scaleX/scaleY）との併用時は
  // transform-originの設定により表示位置がずれる可能性があるため、
  // 適切なtransform-originの調整が必要
}

interface DisplayCondition {
  field: string;
  operator: "exists" | "equals" | "contains" | "greater" | "less";
  value?: any;
}

interface BackgroundFrame {
  id: string;
  position: { x: number; y: number }; // 単位：mm
  size: { width: number; height: number }; // 単位：mm
  style: FrameStyle;
}

interface FrameStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
  borderRadius?: number;
  opacity?: number;
  shadow?: ShadowStyle;
}

interface EditorState {
  selectedElementId: string | null;
  selectedBackgroundFrameId: string | null;
  isDragging: boolean;
  zoom: number; // 50-200%
  panOffset: { x: number; y: number };
  showBackSidePreview: boolean; // 裏面の回転プレビュー表示
  editMode: "background" | "elements"; // 背景/要素編集モード切り替え
}
```

### 保存形式

- テンプレートは JSON 形式で保存
- ローカルストレージに自動保存
- サーバーへの保存・共有機能

## ユーザビリティ要件

### 初心者向け機能

- **チュートリアル**
  - 初回起動時のガイドツアー
  - ツールチップによる機能説明
- **かんたんモード**
  - 主要項目の位置調整のみ
  - プリセットスタイルから選択

### 上級者向け機能

- **詳細モード**
  - すべての要素を個別に編集可能
  - 変数・条件式の使用

### アクセシビリティ

- キーボードショートカット対応
- スクリーンリーダー対応
- 高コントラストモード

## パフォーマンス要件

- 編集操作のレスポンス: 100ms 以内
- プレビュー更新: 200ms 以内
- テンプレート保存: 1 秒以内
- 50 要素までスムーズに編集可能

## セキュリティ要件

- XSS 対策（ユーザー入力のサニタイズ）
- テンプレート共有時の悪意あるコードのチェック

## 実装の優先度

### Phase 1（MVP）

- ドラッグ&ドロップによる要素配置
  - 表面エリアの要素配置（アーティスト名、タイトル、価格等）
  - 裏面エリアのカスタムテキスト配置
  - 折り線表示と裏面要素の自動回転
- 基本的なテキスト編集（サイズ、色、フォント）
- オーバーフロー時の自動調整
  - 特にコメントの 3 行固定と圧縮処理
- デフォルトテンプレートの提供
- プレビュー機能（折り畳み状態の確認含む）

### Phase 2

- QR コード機能
- テンプレートの保存・読み込み
- レイヤー管理
- 整列・配置ツール

### Phase 3

- テンプレート共有機能
- 高度なスタイル設定（影、グラデーション等）
- かんたんモード/詳細モードの切り替え

## 制約事項

- 印刷用の POP サイズは 105mm x 74mm 固定（変更不可）
- 折り線は 15mm 位置で固定（変更不可）
- 折り線より上部（0〜15mm、裏面エリア）の要素は自動的に 180 度回転
- コメントは必ず 3 行表示（行数の増減不可）
- テキスト圧縮率の下限は 50%（可読性確保のため）
- 裏面のデフォルトテキストは「軒先レコード」（中央配置）
- バッジは表面エリアのみ配置可能
- QR コードは表面エリアのみ配置可能、正方形固定

## 用語の統一

- **表面**：折り線より下部（15〜74mm）、メイン情報を表示するエリア
- **裏面**：折り線より上部（0〜15mm）、折り畳み時に見えるエリア
- **要素**：ドラッグ可能な各項目（テキスト、バッジ、QR コード等）
- **データバインディング**：要素と POP データの紐付け（artist、title 等）
- **カスタムテキスト**：ユーザーが自由に入力できるテキスト要素
