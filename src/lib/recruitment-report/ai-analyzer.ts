/**
 * 採用導線AI診断 アナライザー
 */

export interface AiDiagnosisResult {
  scores: {
    jobClarity: number;
    atmosphere: number;
    dailyRoutine: number;
    beginnerSafety: number;
    applicationFlow: number;
    appealPower: number;
  };
  reasons: Record<string, string>;
  suggestions: Record<string, string>;
  evidences: Record<string, string>;
  totalScore: number;
  generalReview: string;
  improvementPoints: string;
  proposalMessage: string;
  sendingMessage: string;
}

import { getDiagnosisConfig, COMMON_EXPRESSION_GUARDS } from "./config";

/**
 * AI API（Gemini）を使用して本文を解析する
 */
export async function analyzeRecruitmentText(
  companyName: string,
  sourceText: string,
  diagnosisType?: string
): Promise<AiDiagnosisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("AI APIキーが未設定です。 .env ファイルに GEMINI_API_KEY を設定してください。");
  }

  // 診断設定の取得
  const config = getDiagnosisConfig(diagnosisType);
  
  // ガードルールの統合（重複除去）
  const allGuards = Array.from(new Set([...COMMON_EXPRESSION_GUARDS, ...config.expressionGuards]));

  // プロンプトの組み立て
  const prompt = `
あなたは${config.promptRole}
${config.industry}における${config.title}（${config.subtitle}）を行い、診断レポートを作成してください。

【対象企業】
${companyName}

【分析対象のテキスト】
${sourceText}

【診断項目と対応するJSONキー】
AIは以下の項目（カッコ内はJSONのキー名）について診断を行ってください。
${config.scores.map((s, i) => `${i + 1}. ${s.label} (${s.key})`).join("\n")}

【分析の重点観点】
${config.promptFocus}

【診断の厳守ルール】
${allGuards.map(g => `- ${g}`).join("\n")}
- 提案商品: ${config.proposalProduct}
- CTA: ${config.cta}

【出力形式】
必ず以下の構造の純粋なJSON形式で回答してください。他の文章は一切含めないでください。
{
  "scores": {
    "jobClarity": スコア(1-10),
    "atmosphere": スコア(1-10),
    "dailyRoutine": スコア(1-10),
    "beginnerSafety": スコア(1-10),
    "applicationFlow": スコア(1-10),
    "appealPower": スコア(1-10)
  },
  "reasons": { "jobClarity": "判定理由", "atmosphere": "...", ... },
  "suggestions": { "jobClarity": "具体的な改善案", "atmosphere": "...", ... },
  "evidences": { "jobClarity": "本文内の根拠となる記述", "atmosphere": "...", ... },
  "totalScore": 総合点(100点満点),
  "generalReview": "診断総評（ターゲットの心理に寄り添い、${config.industry}の特性を考慮した文章）",
  "improvementPoints": "最も重要な改善ポイント（3点程度、箇条書き）",
  "proposalMessage": "${config.proposalProduct}を活用した具体的な解決策の提案文",
  "sendingMessage": "Zoom提案や問い合わせにつながる送付用メッセージの雛形（CTA: ${config.cta} を含む）"
}
  `.trim();

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error("AIからの応答が空でした。");
    }

    return JSON.parse(resultText) as AiDiagnosisResult;
  } catch (e) {
    console.error("AI Analysis Failed:", e);
    throw e instanceof Error ? e : new Error("AI診断中に予期せぬエラーが発生しました。");
  }
}
