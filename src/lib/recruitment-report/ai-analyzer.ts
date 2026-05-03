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

/**
 * AI API（Gemini）を使用して求人本文を解析する
 */
export async function analyzeRecruitmentText(
  companyName: string,
  sourceText: string
): Promise<AiDiagnosisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("AI APIキーが未設定です。 .env ファイルに GEMINI_API_KEY を設定してください。");
  }

  const prompt = `
あなたは介護業界に精通した採用戦略コンサルタントです。
以下の企業「${companyName}」の求人本文を分析し、採用導線の診断を行ってください。

【分析対象の求人本文】
${sourceText}

【診断項目】
1. 求人情報のわかりやすさ (jobClarity)
2. 職場の雰囲気の伝わりやすさ (atmosphere)
3. 1日の流れの見えやすさ (dailyRoutine)
4. 未経験者への安心材料 (beginnerSafety)
5. 応募導線のわかりやすさ (applicationFlow)
6. 直接応募につながる訴求力 (appealPower)

【出力形式】
必ず以下の構造の純粋なJSON形式で回答してください。他の文章は一切含めないでください。
{
  "scores": { "jobClarity": 10, "atmosphere": 8, ... },
  "reasons": { "jobClarity": "判定理由", ... },
  "suggestions": { "jobClarity": "具体的な改善案", ... },
  "evidences": { "jobClarity": "本文内の根拠となる記述", ... },
  "totalScore": 総合点(100点満点),
  "generalReview": "診断総評（介護業界の応募者心理に寄り添った文章）",
  "improvementPoints": "改善ポイント（箇条書き）",
  "proposalMessage": "AIアニメ動画を活用した解決策の自然な提案文",
  "sendingMessage": "Zoom提案につながる送付用メッセージの雛形"
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
