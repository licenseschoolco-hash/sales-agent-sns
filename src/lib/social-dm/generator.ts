import { DIAGNOSIS_CONFIG, getDiagnosisConfig } from "../recruitment-report/config";

export type SocialDmType = "INITIAL_CONTACT" | "FREE_DIAGNOSIS_OFFER";

export interface GenerateDmParams {
  leadId: string;
  name: string | null;
  handle: string | null;
  snsType: string;
  profileText: string | null;
  diagnosisType: string | null;
  productName: string | null;
  notes: string | null;
  dmType: SocialDmType;
  pastLogs?: string[];
}

/**
 * SNS DMの下書きをAIで生成する
 */
export async function generateSocialDm(params: GenerateDmParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI APIキーが未設定です。");
  }

  const config = getDiagnosisConfig(params.diagnosisType || undefined);
  
  // 歯科AI電話向けの特別ルールを統合
  const customGuards = [...config.expressionGuards];
  if (params.diagnosisType === "dental_ai_phone") {
    customGuards.push(
      "「24時間予約が完結する」「24時間予約受付」という表現は避け、「時間外の一次受付」「予約希望の一次受付」とすること",
      "「Web予約やLINE予約を置き換えるものではなく、電話対応が残る場面を補完する選択肢」として提案すること",
      "「受付スタッフ様の負担軽減につながる可能性」に触れること"
    );
  }

  const dmGoal = params.dmType === "INITIAL_CONTACT" 
    ? "相手のプロフィールに共感し、まずは挨拶と軽い接点を持つこと。売り込みは最小限にする。"
    : "相手の活動（プロフィールや事業）に対して、無料診断という価値を提供できることを伝え、興味を持ってもらうこと。";

  const prompt = `
あなたはSNS営業のプロフェッショナルです。
以下のSNSリード（見込み客）に対して、手動で送信するためのDM（ダイレクトメッセージ）の下書きを作成してください。

【今回のDMの目的】
${dmGoal}

【SNSリード情報】
- 名前: ${params.name || "不明"}
- アカウントID: ${params.handle || "不明"}
- プラットフォーム: ${params.snsType}
- プロフィール文: ${params.profileText || "未設定"}
- 診断タイプ: ${config.title}
- 対象商材: ${params.productName || config.proposalProduct}
- 備考メモ: ${params.notes || "なし"}

【過去の接触履歴（文脈）】
${params.pastLogs?.length ? params.pastLogs.join("\n") : "なし"}

【厳守する表現ルール】
- 300文字以内。SNSで自然に読める長さ。
- 売り込み感を消し、相手に寄り添うトーン。
- 「できていない」「不足している」と断定せず、「余地がある」「強化できる可能性がある」と表現する。
- 医療・介護・士業などの場合は特に慎重に、批判的な表現を避ける。
- 歯科AI電話の場合、24時間予約の完結を謳わず、時間外の一次受付やスタッフ負担軽減に触れる。
- 相手の投稿を具体的に見ていない場合は、「投稿を拝見しました」と断定せず「プロフィールを拝見しました」とする。
- 最後に、無理な営業ではないことや、不要であればご放念いただく旨を添える。

【診断タイプ別の文脈】
${config.promptFocus}

【出力形式】
DM本文のみを出力してください。挨拶や説明は不要です。
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
          generationConfig: { 
            temperature: 0.7,
            topP: 0.8,
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // 不要な空白や引用符の削除
    resultText = resultText.trim().replace(/^["']|["']$/g, "");

    return resultText;
  } catch (e) {
    console.error("DM Generation Failed:", e);
    throw new Error("DMの生成に失敗しました。時間をおいて再度お試しください。");
  }
}
