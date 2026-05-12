"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SocialPost } from "@prisma/client";
import { 
  POST_STATUS, 
  normalizePostStatus,
  normalizePostPlatform,
  normalizePostCategory
} from "@/lib/constants/post-constants";

/**
 * 共通レスポンス型
 */
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * SNS投稿案を新規作成する
 */
export async function createSocialPost(data: {
  productId: string;
  category: string;
  platform: string;
  content: string;
  ctaLabel?: string;
  ctaUrl?: string;
  status?: string;
  scheduledDate?: Date | string | null;
  engagementNote?: string;
}): Promise<ActionResponse<SocialPost>> {
  try {
    // 1. バリデーション
    if (!data.productId) return { success: false, error: "商材の選択は必須です。" };
    if (!data.content || data.content.trim() === "") return { success: false, error: "本文は必須です。" };

    const status = normalizePostStatus(data.status) || POST_STATUS.DRAFT;
    const platform = normalizePostPlatform(data.platform);
    const category = normalizePostCategory(data.category);

    if (!platform) return { success: false, error: "有効なプラットフォームを選択してください。" };
    if (!category) return { success: false, error: "有効なカテゴリを選択してください。" };

    if (data.ctaUrl && !data.ctaUrl.match(/^https?:\/\//)) {
      return { success: false, error: "URLは http:// または https:// で開始してください。" };
    }

    // 2. DB保存
    const post = await prisma.socialPost.create({
      data: {
        productId: data.productId,
        category: category,
        platform: platform,
        content: data.content,
        ctaLabel: data.ctaLabel || null,
        ctaUrl: data.ctaUrl || null,
        status: status,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        engagementNote: data.engagementNote || null,
      },
    });

    revalidatePath("/social-posts");
    return { success: true, data: post };
  } catch (error) {
    console.error("Failed to create social post:", error);
    return { success: false, error: "投稿の作成に失敗しました。" };
  }
}

/**
 * 投稿案の内容を更新する
 */
export async function updateSocialPost(data: {
  id: string;
  productId?: string;
  category: string;
  platform: string;
  content: string;
  ctaLabel?: string;
  ctaUrl?: string;
  status: string;
  scheduledDate?: Date | string | null;
  postedAt?: Date | string | null;
  engagementNote?: string;
}): Promise<ActionResponse<SocialPost>> {
  try {
    if (!data.id) return { success: false, error: "IDは必須です。" };
    if (!data.content || data.content.trim() === "") return { success: false, error: "本文は必須です。" };

    const status = normalizePostStatus(data.status);
    const platform = normalizePostPlatform(data.platform);
    const category = normalizePostCategory(data.category);

    if (!status) return { success: false, error: "有効なステータスを選択してください。" };
    if (!platform) return { success: false, error: "有効なプラットフォームを選択してください。" };
    if (!category) return { success: false, error: "有効なカテゴリを選択してください。" };

    if (data.ctaUrl && !data.ctaUrl.match(/^https?:\/\//)) {
      return { success: false, error: "URLは http:// または https:// で開始してください。" };
    }

    // 既存データの取得（遷移チェック用）
    const existing = await prisma.socialPost.findUnique({ where: { id: data.id } });
    if (!existing) return { success: false, error: "対象の投稿が見つかりません。" };

    // 不正なステータス遷移の防止（POSTED から DRAFT へは戻せない）
    if (existing.status === POST_STATUS.POSTED && status === POST_STATUS.DRAFT) {
      return { success: false, error: "投稿済みの記事を下書きに戻すことはできません。" };
    }

    // DB更新
    const post = await prisma.socialPost.update({
      where: { id: data.id },
      data: {
        productId: data.productId || existing.productId,
        category: category,
        platform: platform,
        content: data.content,
        ctaLabel: data.ctaLabel ?? null,
        ctaUrl: data.ctaUrl ?? null,
        status: status,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        postedAt: data.postedAt ? new Date(data.postedAt) : existing.postedAt,
        engagementNote: data.engagementNote ?? null,
      },
    });

    revalidatePath("/social-posts");
    revalidatePath(`/social-posts/${data.id}`);
    return { success: true, data: post };
  } catch (error) {
    console.error("Failed to update social post:", error);
    return { success: false, error: "投稿の更新に失敗しました。" };
  }
}

/**
 * 投稿案をアーカイブする（物理削除は行わない）
 */
export async function archiveSocialPost(id: string): Promise<ActionResponse<SocialPost>> {
  try {
    const post = await prisma.socialPost.update({
      where: { id },
      data: { status: POST_STATUS.ARCHIVED },
    });

    revalidatePath("/social-posts");
    revalidatePath(`/social-posts/${id}`);
    return { success: true, data: post };
  } catch (error) {
    console.error("Failed to archive social post:", error);
    return { success: false, error: "アーカイブに失敗しました。" };
  }
}

/**
 * 投稿済みとして記録する（外部への送信は行わない）
 */
export async function markSocialPostPosted(id: string): Promise<ActionResponse<SocialPost>> {
  try {
    const post = await prisma.socialPost.update({
      where: { id },
      data: { 
        status: POST_STATUS.POSTED,
        postedAt: new Date()
      },
    });

    revalidatePath("/social-posts");
    revalidatePath(`/social-posts/${id}`);
    return { success: true, data: post };
  } catch (error) {
    console.error("Failed to mark post as posted:", error);
    return { success: false, error: "投稿済みの記録に失敗しました。" };
  }
}
