# PopTemplate ビジュアルエディタ 背景枠機能要件定義

## 概要

PopTemplate ビジュアルエディタに背景枠機能を追加し、ユーザーが作成した背景枠の上に表示エリアを配置できるようにする。背景枠と表示エリアの編集を分離することで、より体系的なデザイン作成を可能にする。

### 重要な前提

- 背景枠は表示エリアの基盤となるデザイン要素
- 背景枠と表示エリアの編集は分離して行う
- 背景枠作成モード中は表示エリアの編集不可
- 表示エリア編集モード中は背景枠の編集不可

## 主要機能

### 1. 背景枠の作成

#### 1.1 背景枠の種類

- **図形**
  - 四角形（rectangle）
  - 長方形（rectangle）
  - 円形（circle）
  - 角丸四角形（roundedRectangle）
- **線**
  - 直線（line）
- **テキスト**
  - タイトルなどの文字（text）
  - ベーシックなフォント選択可能

#### 1.2 背景枠の配置

- 複数の背景枠を自由に配置可能
- 重なり順序の管理（z-index）
- ドラッグ&ドロップによる配置
- グリッドスナップ機能（1mm 単位）

### 2. 編集モードの分離

#### 2.1 背景枠作成モード

- 表示エリアは非表示・編集不可
- 背景枠作成ツールのみ表示
- 背景枠の配置・編集・削除が可能

#### 2.2 表示エリア編集モード

- 背景枠は編集不可（表示のみ）
- 現在の表示エリア編集機能を復活
- 背景枠との関係性設定機能を追加

### 3. 背景枠の詳細編集

#### 3.1 図形の編集

- 位置調整（x, y 座標）
- サイズ調整（幅・高さ）
- 塗りつぶし色
- 枠線色・太さ
- 角丸半径（角丸四角形の場合）
- 透明度

#### 3.2 線の編集

- 開始点・終了点の座標
- 線の色・太さ
- 線のスタイル（実線・破線・点線）

#### 3.3 テキストの編集

- テキスト内容
- フォントファミリー（ベーシックなフォント）
- フォントサイズ
- 文字色
- 位置・サイズ

## データ構造

### 拡張された VisualTemplate

```typescript
interface VisualTemplate {
  id: string;
  name: string;
  backgroundFrames: BackgroundFrame[]; // 新規追加
  elements: TemplateElement[];
  settings: TemplateSettings;
}
```

### BackgroundFrame

```typescript
interface BackgroundFrame {
  id: string;
  type: "rectangle" | "circle" | "roundedRectangle" | "line" | "text";
  position: { x: number; y: number }; // 単位：mm、左上が原点
  size: { width: number; height: number }; // 単位：mm
  style: FrameStyle;
  zIndex: number; // 重なり順序
  // テキスト用プロパティ
  text?: string;
  fontFamily?: string;
  // 線用プロパティ
  lineStart?: { x: number; y: number };
  lineEnd?: { x: number; y: number };
}
```

### FrameStyle

```typescript
interface FrameStyle {
  fillColor?: string; // 塗りつぶし色
  strokeColor?: string; // 枠線色
  strokeWidth?: number; // 枠線太さ
  borderRadius?: number; // 角丸半径（角丸四角形用）
  fontSize?: number; // フォントサイズ（テキスト用）
  color?: string; // 文字色（テキスト用）
  opacity?: number; // 透明度
  lineStyle?: "solid" | "dashed" | "dotted"; // 線のスタイル
}
```

## UI/UX 設計

### 1. モード切り替え

#### 1.1 モード切り替えボタン

- ツールバーに「背景枠作成」と「表示エリア編集」の切り替えボタンを配置
- 現在のモードを視覚的に表示

#### 1.2 モード切り替え時の動作

- 背景枠作成モード：表示エリアを非表示、背景枠編集ツールを表示
- 表示エリア編集モード：背景枠を編集不可に、表示エリア編集ツールを表示

### 2. 要素パレット

#### 2.1 背景枠作成モード時のパレット

- 図形ツール（四角、円、角丸四角）
- 線ツール
- テキストツール

#### 2.2 表示エリア編集モード時のパレット

- 既存の要素パレット（テキスト、バッジ、QR コード等）

### 3. レイヤーパネル

#### 3.1 背景枠一覧

- 作成された背景枠の一覧表示
- 重なり順序の変更（ドラッグ&ドロップ）
- 表示/非表示の切り替え
- 削除機能

#### 3.2 表示エリア一覧

- 既存の表示エリア一覧
- 背景枠との関係性表示

### 4. プロパティパネル

#### 4.1 背景枠選択時

- 選択した背景枠のプロパティ編集
- 種類に応じた編集項目の表示

#### 4.2 表示エリア選択時

- 既存の表示エリア編集機能
- 背景枠との関係性設定

## ワークフロー

### 1. 背景枠作成フェーズ

1. **モード切り替え**

   - 「背景枠作成」モードに切り替え
   - 表示エリアが非表示になる

2. **背景枠の配置**

   - 要素パレットから背景枠を選択
   - キャンバスにドラッグ&ドロップで配置

3. **背景枠の編集**

   - 配置した背景枠を選択
   - プロパティパネルで詳細設定

4. **重なり順序の調整**
   - レイヤーパネルで背景枠の重なり順序を調整

### 2. 表示エリア編集フェーズ

1. **モード切り替え**

   - 「表示エリア編集」モードに切り替え
   - 背景枠が編集不可になる

2. **表示エリアの配置**

   - 既存の表示エリア編集機能を使用
   - 背景枠の上に表示エリアを配置

3. **関係性の設定**
   - どの背景枠にどの表示エリアを配置するかを設定

## 技術仕様

### エディタ UI

- **モード切り替え**
  - ツールバーに「背景枠作成」と「表示エリア編集」の切り替えボタンを配置
  - 現在のモードを視覚的に表示
  - モード切り替え時は作業内容を自動保存
- **背景枠作成モード**
  - 表示エリアは非表示・編集不可
  - 背景枠作成ツールのみ表示
  - 背景枠の配置・編集・削除が可能
- **表示エリア編集モード**
  - 背景枠は編集不可（表示のみ）
  - 現在の表示エリア編集機能を復活
  - 背景枠との関係性設定機能を追加

### データ構造

```typescript
interface VisualTemplate {
  id: string;
  name: string;
  backgroundFrames: BackgroundFrame[]; // 新規追加
  elements: TemplateElement[];
  settings: TemplateSettings;
}

interface BackgroundFrame {
  id: string;
  type: "rectangle" | "circle" | "roundedRectangle" | "line" | "text";
  position: { x: number; y: number }; // 単位：mm、左上が原点
  size: { width: number; height: number }; // 単位：mm
  style: FrameStyle;
  zIndex: number; // 重なり順序
  // テキスト用プロパティ
  text?: string;
  fontFamily?: string;
  // 線用プロパティ
  lineStart?: { x: number; y: number };
  lineEnd?: { x: number; y: number };
}

interface FrameStyle {
  fillColor?: string; // 塗りつぶし色
  strokeColor?: string; // 枠線色
  strokeWidth?: number; // 枠線太さ
  borderRadius?: number; // 角丸半径（角丸四角形用）
  fontSize?: number; // フォントサイズ（テキスト用）
  color?: string; // 文字色（テキスト用）
  opacity?: number; // 透明度
  lineStyle?: "solid" | "dashed" | "dotted"; // 線のスタイル
}

interface EditorState {
  selectedElementId: string | null;
  selectedBackgroundFrameId: string | null; // 新規追加
  isDragging: boolean;
  zoom: number;
  panOffset: { x: number; y: number };
  showBackSidePreview: boolean;
  editMode: "background" | "elements"; // 新規追加
}
```

### 保存形式

- 背景枠データは既存のテンプレート JSON に含めて保存
- ローカルストレージに自動保存
- サーバーへの保存・共有機能

## 制約事項

- 背景枠は POP サイズ（105mm x 74mm）内に配置
- 折り線（15mm 位置）を考慮した配置
- 裏面エリア（0〜15mm）の背景枠は自動的に 180 度回転
- 背景枠作成モード中は表示エリアの編集不可
- 表示エリア編集モード中は背景枠の編集不可
- 背景枠は最大 20 個まで作成可能
- 背景枠の編集操作は 100ms 以内でレスポンス

## 実装の優先度

### Phase 1（MVP）

- 基本的な背景枠作成機能（四角形、円形、線）
- モード切り替え機能
- 背景枠の配置・編集・削除

### Phase 2

- 角丸四角形、テキスト背景枠
- レイヤーパネルでの重なり順序管理
- 背景枠と表示エリアの関係性設定

### Phase 3

- 高度な背景枠スタイル（グラデーション、パターン等）
- 背景枠のテンプレート化
- 背景枠のインポート・エクスポート

## 用語の統一

- **背景枠**：ユーザーが作成する背景用の図形・線・テキスト
- **表示エリア**：既存の要素（テキスト、バッジ、QR コード等）
- **背景枠作成モード**：背景枠のみを編集できるモード
- **表示エリア編集モード**：表示エリアのみを編集できるモード
- **レイヤー**：背景枠や表示エリアの重なり順序
