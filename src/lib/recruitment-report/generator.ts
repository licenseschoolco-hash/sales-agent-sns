/**
 * 採用導線診断レポート 生成ロジック
 */

export interface DiagnosisScores {
  jobClarity: number;
  atmosphere: number;
  dailyRoutine: number;
  beginnerSafety: number;
  applicationFlow: number;
  appealPower: number;
}

export interface GeneratedReport {
  totalScore: number;
  generalReview: string;
  improvementPoints: string;
  proposalMessage: string;
  sendingMessage: string;
}

/**
 * スコアとターゲット情報からレポート文章を生成する
 */
export function generateRecruitmentReport(
  companyName: string,
  scores: DiagnosisScores
): GeneratedReport {
  // 総合点計算 (100点満点)
  const totalRaw = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const totalScore = Math.round((totalRaw / 60) * 100);

  // 課題の特定 (スコアが低い項目を抽出)
  const sortedItems = Object.entries(scores).sort(([, a], [, b]) => a - b);
  const weakestItems = sortedItems.slice(0, 2);

  const itemNames: Record<string, string> = {
    jobClarity: "求人情報のわかりやすさ",
    atmosphere: "職場の雰囲気の伝わりやすさ",
    dailyRoutine: "1日の流れの見えやすさ",
    beginnerSafety: "未経験者への安心材料",
    applicationFlow: "応募導線のわかりやすさ",
    appealPower: "直接応募につながる訴求力",
  };

  // 総評の生成
  let generalReview = "";
  if (totalScore >= 80) {
    generalReview = `${companyName}様の採用ページは、必要な情報がバランス良く配置されており、求職者にとって非常に誠実な印象を与えています。特に主要な項目の透明性が高く、応募への心理的ハードルを下げることができています。`;
  } else if (totalScore >= 60) {
    generalReview = `${companyName}様の採用ページは、基本的な条件面などは整理されていますが、介護職特有の「入社後の具体的なイメージ」という点において、あと一歩踏み込んだ表現を加えることで、より意欲の高い層への訴求が可能になると考えられます。`;
  } else {
    generalReview = `${companyName}様の採用ページは、条件の記載に留まっており、貴事業所ならではの強みや「働く人の魅力」が求職者に伝わりきっていない可能性があります。介護職の応募者は「自分にできるか」「馴染めるか」という不安を抱えやすいため、情報の可視化が重要です。`;
  }

  // 改善ポイントの生成（介護業界特化）
  const itemAdvice: Record<string, string> = {
    jobClarity: "業務範囲や給与体系を、文章だけでなく「手取り額のモデルケース」などで具体化すると、ミスマッチが減り応募の質が高まります。",
    atmosphere: "既存スタッフの笑顔だけでなく「なぜここで働いているのか」というストーリーを補足することで、共感を生むページになります。",
    dailyRoutine: "「8:30 出勤」などのスケジュール表に「この時間はどんな声掛けをしているか」といった一言を添えるだけで、不安が解消されます。",
    beginnerSafety: "「未経験歓迎」という言葉だけでなく、最初の1ヶ月で具体的に何を学ぶかをステップ形式で示すことが、最も有効な安心材料となります。",
    applicationFlow: "応募フォームの項目を最小限にし、LINE相談などの「カジュアルな入り口」を設けることで、潜在的な求職者を取りこぼしにくくなります。",
    appealPower: "求人サイトにはない「独自の福利厚生」や「研修動画」など、自社サイトならではの情報を強調することで、直接応募を促せます。",
  };

  const improvementPoints = weakestItems
    .map(([key]) => `・${itemNames[key]}: ${itemAdvice[key]}`)
    .join("\n");

  // 提案文 (AIアニメ動画への誘導 - 自然な流れに)
  const proposalMessage = `
上記のような情報の補足はテキストでも可能ですが、特に「${itemNames[weakestItems[0][0]]}」や「${itemNames[weakestItems[1][0]]}」といった、直感的な理解が求められる項目については、30秒程度の短い動画や図解を活用するのが非常に効果的です。

弊社のAIアニメ動画は、実写撮影の負担なく、職場の空気感や一日の流れをわかりやすく可視化できます。これにより、求職者の「不安」を「ワクワク」に変え、直接応募の意欲を自然に高めることが期待できます。
  `.trim();

  // 送付用メッセージ
  const sendingMessage = `
${companyName} 採用ご担当者様

お世話になっております。先日お話ししました貴社の「採用導線診断レポート」を作成いたしました。

【診断サマリー】
総合スコア: ${totalScore}点
特に強化をおすすめする点: ${itemNames[weakestItems[0][0]]}

求職者が抱きやすい「入社後の不安」を解消するための具体的な改善案を、以下のURLにまとめております。
お忙しいところ恐縮ですが、採用活動のヒントとしてご一読いただければ幸いです。

詳細レポートはこちら：
  `.trim();

  return {
    totalScore,
    generalReview,
    improvementPoints,
    proposalMessage,
    sendingMessage,
  };
}
