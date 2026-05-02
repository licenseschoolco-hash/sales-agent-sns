/**
 * DM文面生成エンジン
 * ターゲット情報、商材情報、スコア結果をもとにテンプレートから文面を生成する
 */

export type DmType = 'initial' | 'follow_up' | 'schedule' | 'reactivation';

export interface DmGenerationInput {
  companyName: string;
  industry: string;
  contactName?: string;
  productName: string;
  productDescription: string;
  reason?: string;
  nextAction?: string;
  type: DmType;
}

export interface DmDraftResult {
  subject: string;
  body: string;
}

const templates: Record<DmType, (input: DmGenerationInput) => DmDraftResult> = {
  initial: (input) => ({
    subject: `【ご提案】${input.companyName}様の${input.industry}における集客・広報の効率化について`,
    body: `${input.companyName}\n${input.contactName ? input.contactName + '様' : '採用担当者様'}\n\n突然のご連絡失礼いたします。\n弊社は「${input.productName}」を提供しております。\n\n${input.companyName}様の情報を拝見し、${input.reason || '貴社の事業内容に非常に親和性を感じ'}、ご連絡いたしました。\n\n${input.productDescription}\n\nもしよろしければ、一度詳細をご説明する機会をいただけますでしょうか？\nご検討いただけますと幸いです。`
  }),
  follow_up: (input) => ({
    subject: `再送：${input.productName}のご案内について`,
    body: `${input.companyName}\n${input.contactName ? input.contactName + '様' : '採用担当者様'}\n\nお世話になっております。先日お送りいたしました「${input.productName}」のご案内について、その後いかがでしょうか？\n\n${input.nextAction || '改めて詳細をご案内したく存じます。'}\n\nご多忙中とは存じますが、お手すきの際にご返信いただけますと幸いです。`
  }),
  schedule: (input) => ({
    subject: `お打ち合わせ日程調整のお願い（${input.productName}）`,
    body: `${input.companyName}\n${input.contactName ? input.contactName + '様' : '担当者様'}\n\nご連絡ありがとうございます。\n「${input.productName}」の商談について、以下の日程でオンラインにて実施可能でしょうか？\n\n・5/10 14:00-15:00\n・5/11 11:00-12:00\n・5/12 16:00-17:00\n\n上記以外のご希望がございましたら、お気軽にお申し付けください。\nよろしくお願いいたします。`
  }),
  reactivation: (input) => ({
    subject: `【最新事例のご案内】${input.productName}のアップデートについて`,
    body: `${input.companyName}\n${input.contactName ? input.contactName + '様' : '担当者様'}\n\nお久しぶりでございます。以前ご案内いたしました「${input.productName}」について、最近${input.industry}業界での導入事例が増えてまいりましたので、改めて共有させていただきます。\n\n${input.productDescription}\n\n以前よりさらに使いやすくアップデートされております。もしご興味がございましたら、資料を再送させていただきます。`
  })
};

export function generateDmText(input: DmGenerationInput): DmDraftResult {
  const template = templates[input.type];
  if (!template) {
    throw new Error(`Unknown DM type: ${input.type}`);
  }
  return template(input);
}
