// データバインディングのデフォルトラベル名を取得
export function getDefaultLabel(dataBinding: string): string {
  const labelMap: Record<string, string> = {
    artist: 'アーティスト',
    title: 'タイトル',
    label: 'レーベル',
    countryYear: '国・年',
    condition: 'コンディション',
    genre: 'ジャンル',
    price: '価格',
    comment: 'コメント',
    custom: 'カスタム',
    badges: 'バッジ',
    discogsUrl: 'QRコード',
  };
  
  return labelMap[dataBinding] || dataBinding;
}

// ラベルの表示テキストを取得（カスタムラベルが設定されていればそれを、なければデフォルト）
export function getLabelText(dataBinding: string, customLabel?: string): string {
  return customLabel || getDefaultLabel(dataBinding);
}