"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DIAGNOSIS_CONFIG } from "@/lib/recruitment-report/config";

// 許可されたステータス一覧
const ALLOWED_STATUSES = [
  "NEW",
  "FOLLOWED",
  "LIKED",
  "COMMENTED",
  "DM_SENT",
  "REPLIED",
  "PDF_SENT",
  "ZOOM_INVITED",
  "ARCHIVED",
];

// 許可された接触種別
const ALLOWED_TOUCH_TYPES = [
  "LIKE",
  "COMMENT",
  "FOLLOW",
  "DM_SENT",
  "DM_RECEIVED",
  "PDF_SENT",
  "ZOOM_INVITED",
  "REPLIED",
  "NOTE",
];

export async function createSocialLeadCandidate(formData: FormData) {
  const snsType = formData.get("snsType") as string;
  const url = formData.get("url") as string;
  const handle = formData.get("handle") as string;
  const name = formData.get("name") as string;
  const profileText = formData.get("profileText") as string;
  const followerCountStr = formData.get("followerCount") as string;
  const leadScoreStr = formData.get("leadScore") as string;
  const status = formData.get("status") as string;
  const diagnosisType = formData.get("diagnosisType") as string;
  const productId = formData.get("productId") as string;
  const notes = formData.get("notes") as string;

  // 1. 必須チェック
  if (!snsType || !url) {
    throw new Error("SNS媒体とプロフィールURLは必須です。");
  }

  // 2. handle or name チェック
  if (!handle && !name) {
    throw new Error("アカウントIDまたは表示名のどちらかは必須です。");
  }

  // 3. URL形式チェック
  try {
    new URL(url);
  } catch {
    throw new Error("有効なURLを入力してください。");
  }

  // 4. leadScore バリデーション
  const leadScore = parseInt(leadScoreStr, 10);
  if (isNaN(leadScore) || leadScore < 1 || leadScore > 10) {
    throw new Error("見込み度は1から10の間で入力してください。");
  }

  // 5. status バリデーション
  if (status && !ALLOWED_STATUSES.includes(status)) {
    throw new Error("無効なステータスです。");
  }

  // 6. diagnosisType バリデーション
  if (diagnosisType && !DIAGNOSIS_CONFIG[diagnosisType as keyof typeof DIAGNOSIS_CONFIG]) {
    throw new Error("無効な診断タイプです。");
  }

  const followerCount = followerCountStr ? parseInt(followerCountStr, 10) : null;

  try {
    await prisma.socialLeadCandidate.create({
      data: {
        snsType,
        url,
        handle: handle || null,
        name: name || null,
        profileText: profileText || null,
        followerCount: isNaN(Number(followerCount)) ? null : followerCount,
        leadScore,
        status: status || "NEW",
        diagnosisType: diagnosisType || null,
        productId: productId || null,
        notes: notes || null,
      },
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      throw new Error("このURLは既に登録されています。");
    }
    console.error("Failed to create social lead:", error);
    throw new Error("登録に失敗しました。内容を確認してください。");
  }

  revalidatePath("/social-leads");
}

export async function createSocialTouchLog(formData: FormData) {
  const socialLeadCandidateId = formData.get("socialLeadCandidateId") as string;
  const type = formData.get("type") as string;
  const content = formData.get("content") as string;
  const ownedAccountName = formData.get("ownedAccountName") as string;

  // 1. 必須チェック
  if (!socialLeadCandidateId || !type) {
    throw new Error("リードIDと接触種別は必須です。");
  }

  // 2. 種別バリデーション
  if (!ALLOWED_TOUCH_TYPES.includes(type)) {
    throw new Error("無効な接触種別です。");
  }

  try {
    await prisma.socialTouchLog.create({
      data: {
        socialLeadCandidateId,
        type,
        content: content || null,
        ownedAccountName: ownedAccountName || null,
      },
    });
  } catch (error) {
    console.error("Failed to create touch log:", error);
    throw new Error("履歴の登録に失敗しました。");
  }

  revalidatePath(`/social-leads/${socialLeadCandidateId}`);
}
