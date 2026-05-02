"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const targetIndustry = formData.get("targetIndustry") as string;
  const priceRange = formData.get("priceRange") as string;
  const status = formData.get("status") as string;

  // 基本情報の保存
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      targetIndustry,
      priceRange,
      status,
    },
  });

  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const targetIndustry = formData.get("targetIndustry") as string;
  const priceRange = formData.get("priceRange") as string;
  const status = formData.get("status") as string;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      targetIndustry,
      priceRange,
      status,
    },
  });

  revalidatePath(`/products/${id}`);
  revalidatePath("/products");
  redirect(`/products/${id}`);
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });

  revalidatePath("/products");
  redirect("/products");
}

// 関連項目の追加用（簡易実装）
export async function addPainPoint(productId: string, painPoint: string, severity: number) {
  await prisma.productPainPoint.create({
    data: {
      productId,
      painPoint,
      severity,
    },
  });
  revalidatePath(`/products/${productId}`);
}

export async function addValueProp(productId: string, proposition: string, evidence: string) {
  await prisma.productValueProp.create({
    data: {
      productId,
      proposition,
      evidence,
    },
  });
  revalidatePath(`/products/${productId}`);
}

export async function addTargetRole(productId: string, roleName: string, priority: number) {
  await prisma.productTargetRole.create({
    data: {
      productId,
      roleName,
      priority,
    },
  });
  revalidatePath(`/products/${productId}`);
}

export async function addCTA(productId: string, title: string, text: string) {
  await prisma.productCTA.create({
    data: {
      productId,
      title,
      text,
    },
  });
  revalidatePath(`/products/${productId}`);
}

export async function addNGExpression(productId: string, phrase: string, reason: string) {
  await prisma.productNGExpression.create({
    data: {
      productId,
      phrase,
      reason,
    },
  });
  revalidatePath(`/products/${productId}`);
}
