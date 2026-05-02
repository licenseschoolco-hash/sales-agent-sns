"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createReply(data: {
  targetCompanyId: string;
  productId?: string;
  dmDraftId?: string;
  replyType: string;
  content?: string;
  nextAction?: string;
  nextFollowUpDate?: string;
}) {
  await prisma.reply.create({
    data: {
      targetCompanyId: data.targetCompanyId,
      productId: data.productId || null,
      dmDraftId: data.dmDraftId || null,
      replyType: data.replyType,
      content: data.content || null,
      nextAction: data.nextAction || null,
      nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
    },
  });

  // 企業のステータスを更新
  await prisma.targetCompany.update({
    where: { id: data.targetCompanyId },
    data: { status: "replied" },
  });

  revalidatePath(`/targets/${data.targetCompanyId}/replies`);
  revalidatePath(`/targets/${data.targetCompanyId}`);
}

export async function createAppointment(data: {
  targetCompanyId: string;
  productId?: string;
  replyId?: string;
  scheduledAt?: string;
  outcome: string;
  amount?: number;
  nextFollowUpDate?: string;
  memo?: string;
}) {
  await prisma.appointment.create({
    data: {
      targetCompanyId: data.targetCompanyId,
      productId: data.productId || null,
      replyId: data.replyId || null,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      outcome: data.outcome,
      amount: data.amount || null,
      nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : null,
      memo: data.memo || null,
    },
  });

  // 企業のステータスを更新
  if (data.outcome === "won") {
    await prisma.targetCompany.update({
      where: { id: data.targetCompanyId },
      data: { status: "won" },
    });
  } else if (data.outcome === "appointment_set") {
    await prisma.targetCompany.update({
      where: { id: data.targetCompanyId },
      data: { status: "appointment" },
    });
  }

  revalidatePath(`/targets/${data.targetCompanyId}/replies`);
  revalidatePath(`/targets/${data.targetCompanyId}`);
}

export async function deleteReply(replyId: string, targetCompanyId: string) {
  await prisma.reply.delete({ where: { id: replyId } });
  revalidatePath(`/targets/${targetCompanyId}/replies`);
}

export async function deleteAppointment(appointmentId: string, targetCompanyId: string) {
  await prisma.appointment.delete({ where: { id: appointmentId } });
  revalidatePath(`/targets/${targetCompanyId}/replies`);
}
