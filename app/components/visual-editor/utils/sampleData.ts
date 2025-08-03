import type { PopResponse } from "@/src/application";
import type { BadgeType } from "@/src/domain";

// サンプル1: よくあるサンプル
export const SAMPLE_POP_DATA_1: PopResponse = {
  id: "sample-001",
  price: 800,
  condition: "VG+",
  comment:
    "名盤中の名盤。\nモード・ジャズの傑作。\nコレクター必携の一枚。",
  badges: [
    { type: "RECOMMEND" as BadgeType, displayName: "おすすめ" },
  ],
  release: {
    discogsId: "sample-release-001",
    artistName: "Miles Davis",
    title: "Kind of Blue",
    label: "Columbia",
    country: "US",
    releaseDate: "1959-08-17",
    genres: ["Jazz"],
    styles: ["Modal"],
    fullTitle:
      "Miles Davis - Kind of Blue",
    releaseYear: "1959",
    genreStyleString: "Jazz, Modal",
  },
  dimensions: {
    width: 105,
    height: 74,
    area: 7770,
    aspectRatio: 1.42,
    isLandscape: true,
    isPortrait: false,
    cssPixels: { width: 396, height: 279 },
    printPixels: { width: 1240, height: 874 },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// サンプル2: 文字数が多いサンプル
export const SAMPLE_POP_DATA_2: PopResponse = {
  id: "sample-002",
  price: 100000,
  condition: "VG+",
  comment:
    "ジャズの名盤として知られる傑作アルバム。マイルス・デイヴィスの代表作の一つで、モード・ジャズの金字塔とも呼ばれる歴史的名作。\n1959年に録音されたこのアルバムは、モダン・ジャズの方向性を決定づけた重要な作品として今なお語り継がれている。\nコレクター垂涎の初回プレス盤です。",
  badges: [
    { type: "RECOMMEND" as BadgeType, displayName: "おすすめ" },
    { type: "MUST" as BadgeType, displayName: "マスト" },
  ],
  release: {
    discogsId: "sample-release-002",
    artistName: "Miles Davis Master Piece of Cakes The King of Bebop and Modal Jazz Extraordinaire",
    title: "Kind of Blue That Tastes Like Cake and Dreams of Tomorrow",
    label: "ColumbianSampleOfLabel Records",
    country: "United Kingdom of Great Britain and Northern Ireland",
    releaseDate: "1959-08-17",
    genres: ["Jazz", "Bebop"],
    styles: ["Cool Jazz", "Modal", "Jazz Fusion"],
    fullTitle:
      "Miles Davis Master Piece of Cakes The King of Bebop and Modal Jazz Extraordinaire - Kind of Blue That Tastes Like Cake and Dreams of Tomorrow For Breakfast",
    releaseYear: "1959",
    genreStyleString: "Jazz, Cool Jazz, Modal, Jazz Fusion, Bebop, Post-Bop, Hard Bop",
  },
  dimensions: {
    width: 105,
    height: 74,
    area: 7770,
    aspectRatio: 1.42,
    isLandscape: true,
    isPortrait: false,
    cssPixels: { width: 396, height: 279 },
    printPixels: { width: 1240, height: 874 },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// サンプル3: 日本語のレコード
export const SAMPLE_POP_DATA_3: PopResponse = {
  id: "sample-003",
  price: 2200,
  condition: "EX",
  comment:
    "昭和の名曲が詰まった傑作アルバム。\n時代を超えて愛される不朽の名作。\n和製ポップスの金字塔。",
  badges: [
    { type: "RECOMMEND" as BadgeType, displayName: "おすすめ" },
  ],
  release: {
    discogsId: "sample-release-003",
    artistName: "竹内まりや",
    title: "VARIETY",
    label: "Moon Records",
    country: "Japan",
    releaseDate: "1984-04-21",
    genres: ["Pop", "J-Pop"],
    styles: ["City Pop", "New Wave"],
    fullTitle:
      "竹内まりや - VARIETY",
    releaseYear: "1984",
    genreStyleString: "Pop, J-Pop, City Pop, New Wave",
  },
  dimensions: {
    width: 105,
    height: 74,
    area: 7770,
    aspectRatio: 1.42,
    isLandscape: true,
    isPortrait: false,
    cssPixels: { width: 396, height: 279 },
    printPixels: { width: 1240, height: 874 },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// 現在のサンプルデータ（デフォルトはサンプル1）
export let SAMPLE_POP_DATA: PopResponse = SAMPLE_POP_DATA_1;

// サンプルデータを切り替える関数
export function setSampleData(sampleNumber: 1 | 2 | 3) {
  switch (sampleNumber) {
    case 1:
      SAMPLE_POP_DATA = SAMPLE_POP_DATA_1;
      break;
    case 2:
      SAMPLE_POP_DATA = SAMPLE_POP_DATA_2;
      break;
    case 3:
      SAMPLE_POP_DATA = SAMPLE_POP_DATA_3;
      break;
  }
}

// データバインディング用のサンプル値を取得
export function getSampleValue(
  dataBinding: string,
  customText?: string
): string {
  switch (dataBinding) {
    case "artist":
      return SAMPLE_POP_DATA.release.artistName;
    case "title":
      return SAMPLE_POP_DATA.release.title;
    case "label":
      return SAMPLE_POP_DATA.release.label || "不明";
    case "countryYear":
      return [
        SAMPLE_POP_DATA.release.country || "不明",
        SAMPLE_POP_DATA.release.releaseYear || "不明",
      ]
        .filter(Boolean)
        .join(" • ");
    case "condition":
      return SAMPLE_POP_DATA.condition;
    case "genre":
      return SAMPLE_POP_DATA.release.genreStyleString || "";
    case "price":
      return SAMPLE_POP_DATA.price === 0
        ? "FREE"
        : `¥${SAMPLE_POP_DATA.price.toLocaleString()}`;
    case "comment":
      return SAMPLE_POP_DATA.comment || "";
    case "custom":
      return customText || "カスタムテキスト";
    case "discogsUrl":
      return "https://www.discogs.com/Miles-Davis-Kind-Of-Blue/release/1234567";
    case "badges":
      return SAMPLE_POP_DATA.badges.map((b) => b.displayName).join(", ");
    default:
      return `[${dataBinding}]`;
  }
}

// バッジ用のサンプルデータを取得
export function getSampleBadges() {
  return SAMPLE_POP_DATA.badges;
}
