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
    generalReview = `${companyName}様の採用導線は非常に高い水準にあります。情報の透明性が高く、求職者にとって安心感のある構成です。`;
  } else if (totalScore >= 60) {
    generalReview = `${companyName}様の採用導線は一定の情報が整理されていますが、いくつかの項目で改善の余地が見受けられます。`;
  } else {
    generalReview = `${companyName}様の採用導線は、求職者に十分な魅力が伝わりきっていない可能性があります。情報の可視化が急務です。`;
  }

  // 改善ポイントの生成
  const improvementPoints = weakestItems
    .map(([key, score]) => {
      const name = itemNames[key];
      if (score <= 4) {
        return `・${name}: 具体的な情報が不足しており、求職者が不安を感じる要因になっています。`;
      } else {
        return `・${name}: さらなる情報のディティール（詳細）を追加することで、他社との差別化が可能です。`;
      }
    })
    .join("\n");

  // 提案文 (AIアニメ動画への誘導)
  const proposalMessage = `
特に「${itemNames[weakestItems[0][0]]}」や「${itemNames[weakestItems[1][0]]}」の課題解決には、
「視覚的に一瞬で理解できるショート動画」が非常に有効です。
弊社のAIアニメ動画サービスでは、言葉では伝わりにくい「職場の空気感」や「複雑な仕事の流れ」を
30秒で魅力的に可視化し、直接応募の意欲を高めることができます。
  `.trim();

  // 送付用メッセージ
  const sendingMessage = `
${companyName}様
お世話になっております。先日お話ししました「採用導線診断レポート」を作成いたしました。

【診断結果】
総合スコア: ${totalScore}点
改善の優先順位が高い項目: ${itemNames[weakestItems[0][0]]}

詳細な改善案を以下のURLにまとめております。ご確認いただけますと幸いです。
  `.trim();

  return {
    totalScore,
    generalReview,
    improvementPoints,
    proposalMessage,
    sendingMessage,
  };
}
