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
