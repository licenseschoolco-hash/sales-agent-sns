/**
 * スコアリングエンジン
 * 手入力項目から総合スコア、優先度、理由、次回アクションを算出する
 */

export interface ScoringInput {
  isHiring: boolean;
  hasHiringPage: boolean;
  videoUsage: string; // high, medium, low, none
  postFrequency: string; // daily, weekly, monthly, none
  engagement: string; // high, medium, low
  hasPhone: boolean;
  hasContactForm: boolean;
  productFit: number; // 1-10
  hypothesisFit: number; // 1-10
}

export interface ScoringResult {
  totalScore: number;
  priority: string;
  reason: string;
  nextAction: string;
}

export function calculateScore(input: ScoringInput): ScoringResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. ニーズ・緊急度 (最大 40点)
  if (input.isHiring) {
    score += 20;
    reasons.push("求人募集中のため、採用・広報のニーズが高い");
  }
  if (input.hasHiringPage) {
    score += 10;
    reasons.push("独自の採用ページを保有しており、情報発信に意欲的");
  }
  if (input.hasContactForm) {
    score += 10;
    reasons.push("問い合わせフォームがあり、外部からの提案を受け入れやすい");
  } else if (input.hasPhone) {
    score += 5;
    reasons.push("電話番号が公開されており、直接のコンタクトが可能");
  }

  // 2. 適合度・親和性 (最大 40点)
  // productFit (1-10) -> 最大 20点
  const fitPoints = input.productFit * 2;
  score += fitPoints;
  if (input.productFit >= 8) {
    reasons.push("商材との親和性が非常に高いと判定");
  }

  // hypothesisFit (1-10) -> 最大 20点
  const hypoPoints = input.hypothesisFit * 2;
  score += hypoPoints;
  if (input.hypothesisFit >= 8) {
    reasons.push("想定される顧客課題と高い精度で合致");
  }

  // 3. 発信力・コンテンツ状況 (最大 20点)
  if (input.videoUsage === "none") {
    score += 15;
    reasons.push("動画未活用のため、動画導入による改善の余地が大きい");
  } else if (input.videoUsage === "low") {
    score += 10;
    reasons.push("動画活用が限定的なため、より高品質な動画提案が可能");
  }

  if (input.postFrequency === "daily" || input.postFrequency === "weekly") {
    score += 5;
    reasons.push("発信頻度が高く、新しいコンテンツへの感度が高い");
  }

  // エンゲージメントによる加点（親和性の微調整）
  if (input.engagement === "high") {
    score += 5;
  }

  // スコアの正規化 (最大 100点)
  const totalScore = Math.min(100, score);

  // 優先度の判定
  let priority = "C";
  let nextAction = "まずは状況を注視";

  if (totalScore >= 85) {
    priority = "S";
    nextAction = "即時アプローチ。特別オファーの検討。";
  } else if (totalScore >= 70) {
    priority = "A";
    nextAction = "1週間以内にDM送信。事例紹介を中心に。";
  } else if (totalScore >= 50) {
    priority = "B";
    nextAction = "タイミングを見てDM送信。フォローアップを重視。";
  } else {
    priority = "C";
    nextAction = "優先度低。定期的な発信確認。";
  }

  return {
    totalScore,
    priority,
    reason: reasons.join(" / "),
    nextAction
  };
}
