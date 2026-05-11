/**
 * SNS投稿モジュール用 定数定義・正規化ユーティリティ
 * 
 * 営業エージェントSNSの「投稿管理」ドメインにおける有効値とメタ情報を一元管理する。
 */

// ============================================================
// 共通型定義
// ============================================================

/** 投稿関連のメタ情報 */
export interface PostMeta {
  /** DB上の値 */
  value: string;
  /** 日本語表示ラベル */
  label: string;
  /** 補足説明 */
  description: string;
  /** 表示トーン（UIのバッジ表示等に使用） */
  tone: "neutral" | "info" | "primary" | "success" | "warning" | "danger" | "muted";
  /** ソート順 */
  sortOrder: number;
}

// ============================================================
// 1. SocialPost.status (投稿管理ステータス)
// ============================================================

export const POST_STATUS = {
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
  POSTED: "POSTED",
  ARCHIVED: "ARCHIVED",
} as const;

export type PostStatusValue = (typeof POST_STATUS)[keyof typeof POST_STATUS];

export const POST_STATUS_VALUES: readonly PostStatusValue[] = [
  POST_STATUS.DRAFT,
  POST_STATUS.APPROVED,
  POST_STATUS.POSTED,
  POST_STATUS.ARCHIVED,
] as const;

const POST_STATUS_META_MAP: Record<PostStatusValue, PostMeta> = {
  DRAFT: {
    value: "DRAFT",
    label: "下書き",
    description: "案を作成中の状態。",
    tone: "neutral",
    sortOrder: 0,
  },
  APPROVED: {
    value: "APPROVED",
    label: "承認済み",
    description: "内容が確定し、投稿待ちの状態。",
    tone: "info",
    sortOrder: 1,
  },
  POSTED: {
    value: "POSTED",
    label: "投稿済み",
    description: "実際のSNSプラットフォームへの投稿が完了した状態。",
    tone: "success",
    sortOrder: 2,
  },
  ARCHIVED: {
    value: "ARCHIVED",
    label: "アーカイブ",
    description: "過去の投稿や使用しなかった案。",
    tone: "muted",
    sortOrder: 3,
  },
};

// ============================================================
// 2. SocialPost.platform (SNSプラットフォーム)
// ============================================================

export const POST_PLATFORM = {
  X: "X",
  FACEBOOK: "FACEBOOK",
  LINKEDIN: "LINKEDIN",
  OTHER: "OTHER",
} as const;

export type PostPlatformValue = (typeof POST_PLATFORM)[keyof typeof POST_PLATFORM];

export const POST_PLATFORM_VALUES: readonly PostPlatformValue[] = [
  POST_PLATFORM.X,
  POST_PLATFORM.FACEBOOK,
  POST_PLATFORM.LINKEDIN,
  POST_PLATFORM.OTHER,
] as const;

const POST_PLATFORM_META_MAP: Record<PostPlatformValue, PostMeta> = {
  X: {
    value: "X",
    label: "X (Twitter)",
    description: "Xプラットフォームへの投稿。",
    tone: "neutral",
    sortOrder: 0,
  },
  FACEBOOK: {
    value: "FACEBOOK",
    label: "Facebook",
    description: "Facebookへの投稿。",
    tone: "primary",
    sortOrder: 1,
  },
  LINKEDIN: {
    value: "LINKEDIN",
    label: "LinkedIn",
    description: "LinkedInへの投稿。",
    tone: "info",
    sortOrder: 2,
  },
  OTHER: {
    value: "OTHER",
    label: "その他",
    description: "その他のプラットフォームへの投稿。",
    tone: "muted",
    sortOrder: 3,
  },
};

// ============================================================
// 3. SocialPost.category (投稿カテゴリ・テーマ)
// ============================================================

export const POST_CATEGORY = {
  PROBLEM: "PROBLEM",
  BENEFIT: "BENEFIT",
  CASE_STUDY: "CASE_STUDY",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  RECRUITING: "RECRUITING",
  EDUCATIONAL: "EDUCATIONAL",
  CTA: "CTA",
} as const;

export type PostCategoryValue = (typeof POST_CATEGORY)[keyof typeof POST_CATEGORY];

export const POST_CATEGORY_VALUES: readonly PostCategoryValue[] = [
  POST_CATEGORY.PROBLEM,
  POST_CATEGORY.BENEFIT,
  POST_CATEGORY.CASE_STUDY,
  POST_CATEGORY.ANNOUNCEMENT,
  POST_CATEGORY.RECRUITING,
  POST_CATEGORY.EDUCATIONAL,
  POST_CATEGORY.CTA,
] as const;

const POST_CATEGORY_META_MAP: Record<PostCategoryValue, PostMeta> = {
  PROBLEM: {
    value: "PROBLEM",
    label: "課題提起",
    description: "顧客の悩みにフォーカスした投稿。",
    tone: "danger",
    sortOrder: 0,
  },
  BENEFIT: {
    value: "BENEFIT",
    label: "メリット紹介",
    description: "商材の強みや導入メリットを紹介する投稿。",
    tone: "success",
    sortOrder: 1,
  },
  CASE_STUDY: {
    value: "CASE_STUDY",
    label: "実績紹介",
    description: "導入事例や成果を報告する投稿。",
    tone: "info",
    sortOrder: 2,
  },
  ANNOUNCEMENT: {
    value: "ANNOUNCEMENT",
    label: "お知らせ",
    description: "新機能やニュースの告知。",
    tone: "primary",
    sortOrder: 3,
  },
  RECRUITING: {
    value: "RECRUITING",
    label: "採用/募集",
    description: "採用情報やパートナー募集などの告知。",
    tone: "warning",
    sortOrder: 4,
  },
  EDUCATIONAL: {
    value: "EDUCATIONAL",
    label: "お役立ち情報",
    description: "業界のナレッジやノウハウ提供。",
    tone: "primary",
    sortOrder: 5,
  },
  CTA: {
    value: "CTA",
    label: "直接誘導",
    description: "診断や商談への直接的な誘導。",
    tone: "danger",
    sortOrder: 6,
  },
};

// ============================================================
// 4. ユーティリティ関数
// ============================================================

/**
 * ステータスのメタ情報を取得
 */
export function getPostStatusMeta(value: string | null | undefined): PostMeta {
  return POST_STATUS_META_MAP[value as PostStatusValue] || {
    value: value || "unknown",
    label: value || "不明",
    description: "不明なステータスです。",
    tone: "muted",
    sortOrder: 99,
  };
}

/**
 * プラットフォームのメタ情報を取得
 */
export function getPostPlatformMeta(value: string | null | undefined): PostMeta {
  return POST_PLATFORM_META_MAP[value as PostPlatformValue] || {
    value: value || "unknown",
    label: value || "不明",
    description: "不明なプラットフォームです。",
    tone: "muted",
    sortOrder: 99,
  };
}

/**
 * カテゴリのメタ情報を取得
 */
export function getPostCategoryMeta(value: string | null | undefined): PostMeta {
  return POST_CATEGORY_META_MAP[value as PostCategoryValue] || {
    value: value || "unknown",
    label: value || "不明",
    description: "不明なカテゴリです。",
    tone: "muted",
    sortOrder: 99,
  };
}

/**
 * ステータス値を正規化
 */
export function normalizePostStatus(value: string | null | undefined): PostStatusValue | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (POST_STATUS_VALUES.includes(upper as PostStatusValue)) {
    return upper as PostStatusValue;
  }
  return null;
}

/**
 * ステータス値を正規化（フォールバック付き）
 */
export function normalizePostStatusWithFallback(
  value: string | null | undefined,
  fallback: PostStatusValue = POST_STATUS.DRAFT
): PostStatusValue {
  return normalizePostStatus(value) || fallback;
}

/**
 * プラットフォーム値を正規化
 */
export function normalizePostPlatform(value: string | null | undefined): PostPlatformValue | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (POST_PLATFORM_VALUES.includes(upper as PostPlatformValue)) {
    return upper as PostPlatformValue;
  }
  return null;
}

/**
 * プラットフォーム値を正規化（フォールバック付き）
 */
export function normalizePostPlatformWithFallback(
  value: string | null | undefined,
  fallback: PostPlatformValue = POST_PLATFORM.OTHER
): PostPlatformValue {
  return normalizePostPlatform(value) || fallback;
}

/**
 * カテゴリ値を正規化
 */
export function normalizePostCategory(value: string | null | undefined): PostCategoryValue | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  if (POST_CATEGORY_VALUES.includes(upper as PostCategoryValue)) {
    return upper as PostCategoryValue;
  }
  return null;
}

/**
 * カテゴリ値を正規化（フォールバック付き）
 */
export function normalizePostCategoryWithFallback(
  value: string | null | undefined,
  fallback: PostCategoryValue = POST_CATEGORY.PROBLEM
): PostCategoryValue {
  return normalizePostCategory(value) || fallback;
}
