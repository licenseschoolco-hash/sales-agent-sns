"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateScore, ScoringInput } from "@/lib/scoring/engine";

export async function createTarget(formData: FormData) {
  const name = formData.get("name") as string;
  const industry = formData.get("industry") as string;
  const region = formData.get("region") as string;
  const contactName = formData.get("contactName") as string;
  const snsUrl = formData.get("snsUrl") as string;
  const website = formData.get("website") as string;
  const jobPageUrl = formData.get("jobPageUrl") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const notes = formData.get("notes") as string;
  const status = formData.get("status") as string;

  const target = await prisma.targetCompany.create({
    data: {
      name,
      industry,
      region,
      contactName,
      snsUrl,
      website,
      jobPageUrl,
      phone,
      email,
      notes,
      status,
    },
  });

  revalidatePath("/targets");
  redirect(`/targets/${target.id}`);
}

export async function updateTarget(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const industry = formData.get("industry") as string;
  const region = formData.get("region") as string;
  const contactName = formData.get("contactName") as string;
  const snsUrl = formData.get("snsUrl") as string;
  const website = formData.get("website") as string;
  const jobPageUrl = formData.get("jobPageUrl") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const notes = formData.get("notes") as string;
  const status = formData.get("status") as string;

  await prisma.targetCompany.update({
    where: { id },
    data: {
      name,
      industry,
      region,
      contactName,
      snsUrl,
      website,
      jobPageUrl,
      phone,
      email,
      notes,
      status,
    },
  });

  revalidatePath(`/targets/${id}`);
  revalidatePath("/targets");
  redirect(`/targets/${id}`);
}

export async function deleteTarget(id: string) {
  await prisma.targetCompany.delete({
    where: { id },
  });

  revalidatePath("/targets");
  redirect("/targets");
}

export async function importTargetsFromCsv(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length < 2) return { success: false, message: "CSVが空か、データが不足しています。" };

  // ヘッダーをスキップ
  const dataLines = lines.slice(1);
  let count = 0;

  for (const line of dataLines) {
    const columns = line.split(",").map(col => col.trim().replace(/^"|"$/g, ""));
    // カラム順想定: 会社名, 業種, 地域, 担当者名, SNS URL, WebサイトURL, 求人ページURL, 電話番号, メール, メモ
    if (columns.length < 1) continue;

    await prisma.targetCompany.create({
      data: {
        name: columns[0] || "不明な企業",
        industry: columns[1] || "未指定",
        region: columns[2] || "",
        contactName: columns[3] || "",
        snsUrl: columns[4] || "",
        website: columns[5] || "",
        jobPageUrl: columns[6] || "",
        phone: columns[7] || "",
        email: columns[8] || "",
        notes: columns[9] || "",
        status: "new",
      },
    });
    count++;
  }

  revalidatePath("/targets");
  return { success: true, count };
}

import { generateRecruitmentReport, DiagnosisScores } from "@/lib/recruitment-report/generator";

export async function saveLeadScore(targetCompanyId: string, productId: string, data: ScoringInput) {
  const result = calculateScore(data);

  await prisma.leadScore.upsert({
    where: {
      productId_targetCompanyId: {
        productId,
        targetCompanyId,
      },
    },
    update: {
      ...data,
      totalScore: result.totalScore,
      priority: result.priority,
      reason: result.reason,
      nextAction: result.nextAction,
      status: "scored",
    },
    create: {
      productId,
      targetCompanyId,
      ...data,
      totalScore: result.totalScore,
      priority: result.priority,
      reason: result.reason,
      nextAction: result.nextAction,
      status: "scored",
    },
  });

  revalidatePath(`/targets/${targetCompanyId}`);
  redirect(`/targets/${targetCompanyId}`);
}

import { analyzeRecruitmentText } from "@/lib/recruitment-report/ai-analyzer";
import { getDiagnosisConfig } from "@/lib/recruitment-report/config";

export async function saveRecruitmentReport(targetCompanyId: string, formData: FormData) {
  const productId = formData.get("productId") as string;
  const companyName = formData.get("companyName") as string;
  
  const scores: DiagnosisScores = {
    jobClarity: Number(formData.get("scoreJobClarity")),
    atmosphere: Number(formData.get("scoreAtmosphere")),
    dailyRoutine: Number(formData.get("scoreDailyRoutine")),
    beginnerSafety: Number(formData.get("scoreBeginnerSafety")),
    applicationFlow: Number(formData.get("scoreApplicationFlow")),
    appealPower: Number(formData.get("scoreAppealPower")),
  };

  const reportData = generateRecruitmentReport(companyName, scores);

  const report = await prisma.recruitmentReport.create({
    data: {
      targetCompanyId,
      productId,
      scoreJobClarity: scores.jobClarity,
      scoreAtmosphere: scores.atmosphere,
      scoreDailyRoutine: scores.dailyRoutine,
      scoreBeginnerSafety: scores.beginnerSafety,
      scoreApplicationFlow: scores.applicationFlow,
      scoreAppealPower: scores.appealPower,
      ...reportData,
      status: "completed",
    },
  });

  revalidatePath(`/targets/${targetCompanyId}`);
  redirect(`/targets/${targetCompanyId}/reports/${report.id}`);
}

export async function runAiDiagnosis(targetCompanyId: string, formData: FormData) {
  const productId = formData.get("productId") as string;
  const companyName = formData.get("companyName") as string;
  const sourceText = formData.get("sourceText") as string;
  const diagnosisUrl = formData.get("diagnosisUrl") as string;
  const diagnosisTypeRaw = formData.get("diagnosisType") as string;

  const config = getDiagnosisConfig(diagnosisTypeRaw);
  const diagnosisType = config.type;

  if (!sourceText) throw new Error("求人本文を入力してください。");

  const result = await analyzeRecruitmentText(companyName, sourceText);

  // 下書きとして一時保存
  const report = await prisma.recruitmentReport.create({
    data: {
      targetCompanyId,
      productId,
      diagnosisType,
      sourceType: "ai",
      sourceText,
      diagnosisUrl,
      scoreJobClarity: result.scores.jobClarity,
      scoreAtmosphere: result.scores.atmosphere,
      scoreDailyRoutine: result.scores.dailyRoutine,
      scoreBeginnerSafety: result.scores.beginnerSafety,
      scoreApplicationFlow: result.scores.applicationFlow,
      scoreAppealPower: result.scores.appealPower,
      totalScore: result.totalScore,
      generalReview: Array.isArray(result.generalReview) ? result.generalReview.join("\n") : (result.generalReview || ""),
      improvementPoints: Array.isArray(result.improvementPoints) ? result.improvementPoints.map(p => `・${p}`).join("\n") : (result.improvementPoints || ""),
      proposalMessage: Array.isArray(result.proposalMessage) ? result.proposalMessage.join("\n") : (result.proposalMessage || ""),
      sendingMessage: Array.isArray(result.sendingMessage) ? result.sendingMessage.join("\n") : (result.sendingMessage || ""),
      aiAnalysisLog: JSON.stringify({
        reasons: result.reasons,
        suggestions: result.suggestions,
        evidences: result.evidences
      }),
      status: "ai_draft",
    },
  });

  revalidatePath(`/targets/${targetCompanyId}/reports/ai`);
  redirect(`/targets/${targetCompanyId}/reports/ai?draftId=${report.id}`);
}

export async function confirmAiReport(id: string, targetCompanyId: string) {
  await prisma.recruitmentReport.update({
    where: { id },
    data: { status: "completed" }
  });

  revalidatePath(`/targets/${targetCompanyId}`);
  redirect(`/targets/${targetCompanyId}/reports/${id}`);
}

// ============================================
// 情報源管理 (InformationSource) 関連
// ============================================

const ALLOWED_SOURCE_TYPES = [
  "official_site", "recruitment_page", "job_portal", "instagram", "x", 
  "google_map", "contact_form", "other"
];

const ALLOWED_SOURCE_STATUSES = [
  "sns_only", "official_site_confirmed", "recruitment_page_confirmed", 
  "job_portal_confirmed", "diagnosis_text_collected", "human_verified", "ready_to_contact"
];

const ALLOWED_VERIFICATION_STATUSES = ["pending", "verified", "error"];

export async function createInformationSource(targetCompanyId: string, formData: FormData) {
  const sourceType = formData.get("sourceType") as string;
  const label = formData.get("label") as string;
  const url = formData.get("url") as string;
  const content = formData.get("content") as string;
  const verificationStatus = (formData.get("verificationStatus") as string) || "pending";

  if (!ALLOWED_SOURCE_TYPES.includes(sourceType)) {
    throw new Error(`Invalid sourceType: ${sourceType}`);
  }
  if (!ALLOWED_VERIFICATION_STATUSES.includes(verificationStatus)) {
    throw new Error(`Invalid verificationStatus: ${verificationStatus}`);
  }
  if (!label || !url) {
    throw new Error("Label and URL are required.");
  }

  await prisma.informationSource.create({
    data: {
      targetCompanyId,
      sourceType,
      label,
      url,
      content,
      verificationStatus,
    },
  });

  revalidatePath(`/targets/${targetCompanyId}`);
  revalidatePath(`/targets/${targetCompanyId}/sources`);
}

export async function updateInformationSource(id: string, targetCompanyId: string, formData: FormData) {
  const sourceType = formData.get("sourceType") as string;
  const label = formData.get("label") as string;
  const url = formData.get("url") as string;
  const content = formData.get("content") as string;
  const verificationStatus = formData.get("verificationStatus") as string;

  if (sourceType && !ALLOWED_SOURCE_TYPES.includes(sourceType)) {
    throw new Error(`Invalid sourceType: ${sourceType}`);
  }
  if (verificationStatus && !ALLOWED_VERIFICATION_STATUSES.includes(verificationStatus)) {
    throw new Error(`Invalid verificationStatus: ${verificationStatus}`);
  }

  await prisma.informationSource.update({
    where: { id },
    data: {
      sourceType,
      label,
      url,
      content,
      verificationStatus,
      lastVerifiedAt: verificationStatus === "verified" ? new Date() : undefined,
    },
  });

  revalidatePath(`/targets/${targetCompanyId}`);
  revalidatePath(`/targets/${targetCompanyId}/sources`);
}

export async function deleteInformationSource(id: string, targetCompanyId: string) {
  await prisma.informationSource.delete({
    where: { id },
  });

  revalidatePath(`/targets/${targetCompanyId}`);
  revalidatePath(`/targets/${targetCompanyId}/sources`);
}

export async function updateTargetSourceStatus(targetCompanyId: string, formData: FormData) {
  const sourceStatus = formData.get("sourceStatus") as string;

  if (!ALLOWED_SOURCE_STATUSES.includes(sourceStatus)) {
    throw new Error(`Invalid sourceStatus: ${sourceStatus}`);
  }

  await prisma.targetCompany.update({
    where: { id: targetCompanyId },
    data: { sourceStatus },
  });

  revalidatePath(`/targets/${targetCompanyId}`);
  revalidatePath(`/targets/${targetCompanyId}/sources`);
}
