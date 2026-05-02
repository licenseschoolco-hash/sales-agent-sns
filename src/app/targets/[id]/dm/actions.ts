"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateDmText, DmType } from "@/lib/dm/generator";

export async function generateAndSaveDraft(
  targetCompanyId: string, 
  productId: string, 
  type: DmType,
  leadScoreId?: string
) {
  const target = await prisma.targetCompany.findUnique({ where: { id: targetCompanyId } });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  const score = leadScoreId ? await prisma.leadScore.findUnique({ where: { id: leadScoreId } }) : null;

  if (!target || !product) throw new Error("Target or Product not found");

  const generated = generateDmText({
    companyName: target.name,
    industry: target.industry,
    contactName: target.contactName || undefined,
    productName: product.name,
    productDescription: product.description,
    reason: score?.reason || undefined,
    nextAction: score?.nextAction || undefined,
    type,
  });

  const draft = await prisma.dmDraft.create({
    data: {
      targetCompanyId,
      productId,
      leadScoreId,
      type,
      subject: generated.subject,
      body: generated.body,
      status: "draft",
    },
  });

  revalidatePath(`/targets/${targetCompanyId}/dm`);
  return draft;
}

export async function updateDraftStatus(draftId: string, targetCompanyId: string, status: string) {
  await prisma.dmDraft.update({
    where: { id: draftId },
    data: { status },
  });
  revalidatePath(`/targets/${targetCompanyId}/dm`);
}

export async function updateDraftContent(draftId: string, targetCompanyId: string, subject: string, body: string) {
  await prisma.dmDraft.update({
    where: { id: draftId },
    data: { subject, body },
  });
  revalidatePath(`/targets/${targetCompanyId}/dm`);
  revalidatePath(`/targets/${targetCompanyId}/dm/${draftId}/edit`);
}

export async function deleteDraft(draftId: string, targetCompanyId: string) {
  await prisma.dmDraft.delete({
    where: { id: draftId },
  });
  revalidatePath(`/targets/${targetCompanyId}/dm`);
}
