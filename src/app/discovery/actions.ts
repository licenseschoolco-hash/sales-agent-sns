"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// プロモーション可能な種別
const PROMOTABLE_TYPES = ['company', 'facility', 'clinic', 'professional', 'association'];

export async function createCandidate(data: {
  productId: string;
  name: string;
  type: string;
  platform: string;
  accountId?: string;
  profileUrl?: string;
  industry?: string;
  followersCount?: number;
  bio?: string;
  source: string;
}) {
  await prisma.leadCandidate.create({
    data: {
      productId: data.productId,
      name: data.name,
      type: data.type,
      platform: data.platform,
      accountId: data.accountId || null,
      profileUrl: data.profileUrl || null,
      industry: data.industry || null,
      followersCount: data.followersCount || null,
      bio: data.bio || null,
      source: data.source,
      status: 'new'
    }
  });
  revalidatePath("/discovery");
}

export async function updateCandidateStatus(id: string, status: string) {
  await prisma.leadCandidate.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/discovery");
}

export async function promoteToTarget(candidateId: string) {
  const candidate = await prisma.leadCandidate.findUnique({
    where: { id: candidateId }
  });

  if (!candidate) throw new Error("Candidate not found");
  
  // 昇格制限のチェック
  if (!PROMOTABLE_TYPES.includes(candidate.type)) {
    throw new Error(`Type '${candidate.type}' cannot be promoted to TargetCompany.`);
  }

  // TargetCompany の作成
  const targetCompany = await prisma.targetCompany.create({
    data: {
      name: candidate.name,
      industry: candidate.industry || "未分類",
      snsUrl: candidate.profileUrl,
      notes: candidate.bio,
      status: "researching"
    }
  });

  // TargetAccount の作成 (SNS情報があれば)
  if (candidate.accountId) {
    await prisma.targetAccount.create({
      data: {
        companyId: targetCompany.id,
        platform: candidate.platform,
        accountId: candidate.accountId,
        displayName: candidate.name,
        profileUrl: candidate.profileUrl || "",
        followersCount: candidate.followersCount,
        bio: candidate.bio
      }
    });
  }

  // 候補の状態を更新
  await prisma.leadCandidate.update({
    where: { id: candidateId },
    data: { 
      status: "promoted",
      targetCompanyId: targetCompany.id
    }
  });

  revalidatePath("/discovery");
  revalidatePath("/targets");
}

export async function addSearchQuery(productId: string, platform: string, label: string, query: string) {
  await prisma.productSearchQuery.create({
    data: { productId, platform, label, query }
  });
  revalidatePath(`/products/${productId}/search-queries`);
}

export async function deleteSearchQuery(id: string, productId: string) {
  await prisma.productSearchQuery.delete({ where: { id } });
  revalidatePath(`/products/${productId}/search-queries`);
}

export async function deleteCandidate(id: string) {
  await prisma.leadCandidate.delete({ where: { id } });
  revalidatePath("/discovery");
}
