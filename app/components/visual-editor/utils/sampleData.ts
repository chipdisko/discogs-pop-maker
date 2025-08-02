import type { PopResponse } from "@/src/application";
import type { BadgeType } from "@/src/domain";

// エディタープレビュー用のサンプルデータ
export const SAMPLE_POP_DATA: PopResponse = {
  id: "sample-001",
  price: 2800,
  condition: "VG+",
  comment:
    "ジャズの名盤として知られる傑作アルバム。マイルス・デイヴィスの代表作の一つで、モード・ジャズの金字塔。",
  badges: [
    { type: "RECOMMEND" as BadgeType, displayName: "おすすめ" },
    { type: "MUST" as BadgeType, displayName: "マスト" },
  ],
  release: {
    discogsId: "sample-release-001",
    artistName: "Miles Davis Master Piece of Cakes The King of Bebop",
    title: "Kind of Blue That Tastes Like Cake For Breakfast",
    label: "Columbia",
    country: "US",
    releaseDate: "1959-08-17",
    genres: ["Jazz", "Bebop"],
    styles: ["Cool Jazz", "Modal", "Jazz Fusion"],
    fullTitle:
      "Miles Davis Master Piece of Cakes The King of Bebop - Kind of Blue That Tastes Like Cake For Breakfast",
    releaseYear: "1959",
    genreStyleString: "Jazz, Cool Jazz, Modal, Jazz Fusion",
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
