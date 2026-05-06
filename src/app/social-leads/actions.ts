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
// ============================================
// DM生成（AI）- Server Action
// ページレンダリングから分離し、明示操作でのみ実行する
// ============================================

import { generateSocialDm, SocialDmType } from "@/lib/social-dm/generator";
import { redirect } from "next/navigation";

export async function generateSocialDmAction(formData: FormData) {
  const socialLeadCandidateId = formData.get("socialLeadCandidateId") as string;
  const dmType = formData.get("dmType") as string;
  const fromReportId = formData.get("fromReportId") as string;

  if (!socialLeadCandidateId || !dmType) {
    throw new Error("リードIDとDM種別は必須です。");
  }

  // リード情報の取得
  const lead = await prisma.socialLeadCandidate.findUnique({
    where: { id: socialLeadCandidateId },
    include: {
      product: true,
      touchLogs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!lead) {
    throw new Error("リードが見つかりません。");
  }

  // AI DM生成（エラーハンドリング付き）
  let generatedText = "";
  let hasError = false;

  try {
    const pastLogs = lead.touchLogs.map(log => `[${log.type}] ${log.content}`);
    generatedText = await generateSocialDm({
      leadId: lead.id,
      name: lead.name,
      handle: lead.handle,
      snsType: lead.snsType,
      profileText: lead.profileText,
      diagnosisType: lead.diagnosisType,
      productName: lead.product?.name || null,
      notes: lead.notes,
      dmType: dmType as SocialDmType,
      pastLogs,
    });
  } catch (e) {
    console.error("DM生成エラー:", e);
    hasError = true;
  }

  // リダイレクトで結果をページに返す（AI呼び出しはここで完了）
  const params = new URLSearchParams();
  params.set("dmType", dmType);
  if (generatedText) params.set("generatedText", generatedText);
  if (hasError) params.set("dmError", "1");
  if (fromReportId) params.set("fromReportId", fromReportId);

  redirect(`/social-leads/${socialLeadCandidateId}?${params.toString()}`);
}

// ============================================
// TargetCompany 昇格
// ============================================

export async function promoteSocialLeadToTarget(formData: FormData) {
  const socialLeadCandidateId = formData.get("socialLeadCandidateId") as string;
  const companyName = formData.get("companyName") as string;
  const website = formData.get("website") as string;
  const industry = formData.get("industry") as string;
  const region = formData.get("region") as string;
  const notes = formData.get("notes") as string;

  if (!socialLeadCandidateId || !companyName) {
    throw new Error("リードIDと企業名は必須です。");
  }

  // 1. リード情報の取得
  const lead = await prisma.socialLeadCandidate.findUnique({
    where: { id: socialLeadCandidateId },
  });

  if (!lead) {
    throw new Error("リードが見つかりません。");
  }

  if (lead.targetCompanyId) {
    throw new Error("このリードは既に昇格済みです。");
  }

  // 2. sourceType のマッピング
  let sourceType = "other";
  if (lead.snsType === "X") sourceType = "x";
  else if (lead.snsType === "INSTAGRAM") sourceType = "instagram";

  try {
    await prisma.$transaction(async (tx) => {
      // A. TargetCompany の作成
      const company = await tx.targetCompany.create({
        data: {
          name: companyName,
          website: website || null,
          industry: industry || "未設定",
          region: region || null,
          notes: notes || lead.notes || null,
          snsUrl: lead.url,
          status: "new",
          sourceStatus: "sns_only",
        },
      });

      // B. InformationSource の作成
      await tx.informationSource.create({
        data: {
          targetCompanyId: company.id,
          sourceType,
          label: "SNSプロフィール",
          url: lead.url,
          content: lead.profileText,
          verificationStatus: "pending",
        },
      });

      // C. SocialLeadCandidate の更新
      await tx.socialLeadCandidate.update({
        where: { id: socialLeadCandidateId },
        data: {
          targetCompanyId: company.id,
          // status は変更しない
        },
      });
    });

    revalidatePath(`/social-leads/${socialLeadCandidateId}`);
  } catch (error) {
    console.error("Failed to promote social lead:", error);
    throw new Error("昇格処理に失敗しました。");
  }
}
