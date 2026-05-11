/**
 * ステータス定義・正規化ユーティリティ
 *
 * 営業エージェントSNSで使用する全ステータス値を一元管理する。
 * 各ドメインの責務：
 *   - TargetCompany.status      : 企業の現在の営業状態
 *   - SocialLeadCandidate.status: SNSリード段階の現在状態
 *   - SocialTouchLog.type       : SNS上の接触履歴（イベント種別）
 *   - Appointment.outcome       : 商談・営業活動の結果履歴
 *
 * 注意：この4つは責務が異なるため、無理に統一しないこと。
 * DB値そのものは変更しない。Prisma schemaも変更しない。
 */

// ============================================================
// 共通型定義
// ============================================================

/** ステータスのメタ情報 */
export interface StatusMeta {
  /** DB上の値 */
  value: string;
  /** 日本語表示ラベル */
  label: string;
  /** 補足説明（UIのツールチップ等に使用） */
  description: string;
  /** 表示トーン（badge等の色分けに使用） */
  tone: "neutral" | "info" | "primary" | "success" | "warning" | "danger" | "muted";
  /** badge背景色 */
  color: string;
  /** badge文字色 */
  textColor: string;
  /** ソート順（一覧表示用、小さいほど上位） */
  sortOrder: number;
}

// ============================================================
// 1. TargetCompany.status（企業の現在の営業状態）
//    DB値: 小文字
// ============================================================

/** TargetCompany.status の有効値 */
export const TARGET_STATUS = {
  NEW: "new",
  RESEARCHING: "researching",
  DM_READY: "dm_ready",
  CONTACTED: "contacted",
  REPLIED: "replied",
  APPOINTMENT: "appointment",
  WON: "won",
  LOST: "lost",
  NG: "ng",
} as const;

export type TargetStatusValue = (typeof TARGET_STATUS)[keyof typeof TARGET_STATUS];

/** TargetCompany.status の全有効値リスト（ソート順） */
export const TARGET_STATUS_VALUES: readonly TargetStatusValue[] = [
  TARGET_STATUS.NEW,
  TARGET_STATUS.RESEARCHING,
  TARGET_STATUS.DM_READY,
  TARGET_STATUS.CONTACTED,
  TARGET_STATUS.REPLIED,
  TARGET_STATUS.APPOINTMENT,
  TARGET_STATUS.WON,
  TARGET_STATUS.LOST,
  TARGET_STATUS.NG,
] as const;

/** TargetCompany.status のメタ情報マップ */
const TARGET_STATUS_META_MAP: Record<TargetStatusValue, StatusMeta> = {
  new: {
    value: "new",
    label: "新規リード",
    description: "登録直後。まだ調査・接触していない企業。",
    tone: "neutral",
    color: "#64748b",
    textColor: "#ffffff",
    sortOrder: 0,
  },
  researching: {
    value: "researching",
    label: "調査中",
    description: "企業情報やSNSを調査している段階。",
    tone: "info",
    color: "#94a3b8",
    textColor: "#ffffff",
    sortOrder: 1,
  },
  dm_ready: {
    value: "dm_ready",
    label: "DM準備完了",
    description: "調査完了。DM下書きの作成・送信準備ができた状態。",
    tone: "primary",
    color: "#3b82f6",
    textColor: "#ffffff",
    sortOrder: 2,
  },
  contacted: {
    value: "contacted",
    label: "アプローチ済",
    description: "DM送信済み。相手からの反応を待っている状態。",
    tone: "primary",
    color: "#60a5fa",
    textColor: "#ffffff",
    sortOrder: 3,
  },
  replied: {
    value: "replied",
    label: "返信あり",
    description: "相手から何らかの返信を受け取った状態。",
    tone: "success",
    color: "#10b981",
    textColor: "#ffffff",
    sortOrder: 4,
  },
  appointment: {
    value: "appointment",
    label: "アポ獲得",
    description: "商談（Zoom等）の日程が確定した状態。",
    tone: "warning",
    color: "#f59e0b",
    textColor: "#ffffff",
    sortOrder: 5,
  },
  won: {
    value: "won",
    label: "成約",
    description: "契約・成約に至った企業。",
    tone: "success",
    color: "#059669",
    textColor: "#ffffff",
    sortOrder: 6,
  },
  lost: {
    value: "lost",
    label: "失注",
    description: "商談後に成約に至らなかった企業。",
    tone: "danger",
    color: "#ef4444",
    textColor: "#ffffff",
    sortOrder: 7,
  },
  ng: {
    value: "ng",
    label: "NG",
    description: "営業対象外と判断された企業。",
    tone: "muted",
    color: "#1e293b",
    textColor: "#ffffff",
    sortOrder: 8,
  },
};

/**
 * TargetCompany.status を正規化する（小文字化）。
 * 有効値に該当しない場合は null を返す。
 */
export function normalizeTargetStatus(value: string | null | undefined): TargetStatusValue | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (TARGET_STATUS_VALUES.includes(normalized as TargetStatusValue)) {
    return normalized as TargetStatusValue;
  }
  return null;
}

/**
 * TargetCompany.status を正規化し、不正値の場合はフォールバックを返す。
 */
export function normalizeTargetStatusWithFallback(
  value: string | null | undefined,
  fallback: TargetStatusValue = TARGET_STATUS.NEW,
): TargetStatusValue {
  return normalizeTargetStatus(value) ?? fallback;
}

/**
 * TargetCompany.status のメタ情報を取得する。
 * 不正値の場合は "new" のメタ情報を返す。
 */
export function getTargetStatusMeta(value: string | null | undefined): StatusMeta {
  const normalized = normalizeTargetStatusWithFallback(value);
  return TARGET_STATUS_META_MAP[normalized];
}

// ============================================================
// 2. SocialLeadCandidate.status（SNSリード段階の現在状態）
//    DB値: 大文字
// ============================================================

/** SocialLeadCandidate.status の有効値 */
export const SOCIAL_LEAD_STATUS = {
  NEW: "NEW",
  FOLLOWED: "FOLLOWED",
  LIKED: "LIKED",
  COMMENTED: "COMMENTED",
  CONTACTED: "CONTACTED",
  DM_SENT: "DM_SENT",
  REPLIED: "REPLIED",
  APPOINTMENT_SET: "APPOINTMENT_SET",
  ARCHIVED: "ARCHIVED",
} as const;

export type SocialLeadStatusValue = (typeof SOCIAL_LEAD_STATUS)[keyof typeof SOCIAL_LEAD_STATUS];

/** SocialLeadCandidate.status の全有効値リスト（ソート順） */
export const SOCIAL_LEAD_STATUS_VALUES: readonly SocialLeadStatusValue[] = [
  SOCIAL_LEAD_STATUS.NEW,
  SOCIAL_LEAD_STATUS.FOLLOWED,
  SOCIAL_LEAD_STATUS.LIKED,
  SOCIAL_LEAD_STATUS.COMMENTED,
  SOCIAL_LEAD_STATUS.CONTACTED,
  SOCIAL_LEAD_STATUS.DM_SENT,
  SOCIAL_LEAD_STATUS.REPLIED,
  SOCIAL_LEAD_STATUS.APPOINTMENT_SET,
  SOCIAL_LEAD_STATUS.ARCHIVED,
] as const;

/** SocialLeadCandidate.status のメタ情報マップ */
const SOCIAL_LEAD_STATUS_META_MAP: Record<SocialLeadStatusValue, StatusMeta> = {
  NEW: {
    value: "NEW",
    label: "新規発掘",
    description: "SNSで見つけた直後。まだ接触していない。",
    tone: "neutral",
    color: "#64748b",
    textColor: "#ffffff",
    sortOrder: 0,
  },
  FOLLOWED: {
    value: "FOLLOWED",
    label: "フォロー済み",
    description: "SNSアカウントをフォローした状態。",
    tone: "info",
    color: "#38bdf8",
    textColor: "#ffffff",
    sortOrder: 1,
  },
  LIKED: {
    value: "LIKED",
    label: "いいね済み",
    description: "相手の投稿にいいねした状態。",
    tone: "info",
    color: "#818cf8",
    textColor: "#ffffff",
    sortOrder: 2,
  },
  COMMENTED: {
    value: "COMMENTED",
    label: "コメント済み",
    description: "相手の投稿にコメントした状態。",
    tone: "info",
    color: "#a78bfa",
    textColor: "#ffffff",
    sortOrder: 3,
  },
  CONTACTED: {
    value: "CONTACTED",
    label: "接触済み",
    description: "何らかの方法で初回接触した状態。",
    tone: "primary",
    color: "#3b82f6",
    textColor: "#ffffff",
    sortOrder: 4,
  },
  DM_SENT: {
    value: "DM_SENT",
    label: "DM送信済み",
    description: "DMを手動送信した状態。返信待ち。",
    tone: "primary",
    color: "#2563eb",
    textColor: "#ffffff",
    sortOrder: 5,
  },
  REPLIED: {
    value: "REPLIED",
    label: "返信あり",
    description: "相手からDMへの返信を受け取った状態。",
    tone: "success",
    color: "#10b981",
    textColor: "#ffffff",
    sortOrder: 6,
  },
  APPOINTMENT_SET: {
    value: "APPOINTMENT_SET",
    label: "アポ獲得",
    description: "商談日程が確定した状態。",
    tone: "warning",
    color: "#f59e0b",
    textColor: "#ffffff",
    sortOrder: 7,
  },
  ARCHIVED: {
    value: "ARCHIVED",
    label: "対象外/完了",
    description: "営業対象から外した、または営業フロー完了済み。",
    tone: "muted",
    color: "#94a3b8",
    textColor: "#ffffff",
    sortOrder: 8,
  },
};

/**
 * SocialLeadCandidate.status を正規化する（大文字化）。
 * 有効値に該当しない場合は null を返す。
 */
export function normalizeSocialLeadStatus(value: string | null | undefined): SocialLeadStatusValue | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (SOCIAL_LEAD_STATUS_VALUES.includes(normalized as SocialLeadStatusValue)) {
    return normalized as SocialLeadStatusValue;
  }
  return null;
}

/**
 * SocialLeadCandidate.status を正規化し、不正値の場合はフォールバックを返す。
 */
export function normalizeSocialLeadStatusWithFallback(
  value: string | null | undefined,
  fallback: SocialLeadStatusValue = SOCIAL_LEAD_STATUS.NEW,
): SocialLeadStatusValue {
  return normalizeSocialLeadStatus(value) ?? fallback;
}

/**
 * SocialLeadCandidate.status のメタ情報を取得する。
 * 不正値の場合は "NEW" のメタ情報を返す。
 */
export function getSocialLeadStatusMeta(value: string | null | undefined): StatusMeta {
  const normalized = normalizeSocialLeadStatusWithFallback(value);
  return SOCIAL_LEAD_STATUS_META_MAP[normalized];
}

// ============================================================
// 3. SocialTouchLog.type（SNS上の接触履歴イベント種別）
//    DB値: 大文字
// ============================================================

/** SocialTouchLog.type の有効値 */
export const TOUCH_LOG_TYPE = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
  FOLLOW: "FOLLOW",
  DM_SENT: "DM_SENT",
  DM_RECEIVED: "DM_RECEIVED",
  PDF_SENT: "PDF_SENT",
  ZOOM_INVITED: "ZOOM_INVITED",
  REPLIED: "REPLIED",
  NOTE: "NOTE",
} as const;

export type TouchLogTypeValue = (typeof TOUCH_LOG_TYPE)[keyof typeof TOUCH_LOG_TYPE];

/** SocialTouchLog.type の全有効値リスト（ソート順） */
export const TOUCH_LOG_TYPE_VALUES: readonly TouchLogTypeValue[] = [
  TOUCH_LOG_TYPE.LIKE,
  TOUCH_LOG_TYPE.COMMENT,
  TOUCH_LOG_TYPE.FOLLOW,
  TOUCH_LOG_TYPE.DM_SENT,
  TOUCH_LOG_TYPE.DM_RECEIVED,
  TOUCH_LOG_TYPE.PDF_SENT,
  TOUCH_LOG_TYPE.ZOOM_INVITED,
  TOUCH_LOG_TYPE.REPLIED,
  TOUCH_LOG_TYPE.NOTE,
] as const;

/** SocialTouchLog.type のメタ情報マップ */
const TOUCH_LOG_TYPE_META_MAP: Record<TouchLogTypeValue, StatusMeta> = {
  LIKE: {
    value: "LIKE",
    label: "いいね",
    description: "相手の投稿にいいねした。",
    tone: "info",
    color: "#ec4899",
    textColor: "#ffffff",
    sortOrder: 0,
  },
  COMMENT: {
    value: "COMMENT",
    label: "コメント",
    description: "相手の投稿にコメントした。",
    tone: "info",
    color: "#a78bfa",
    textColor: "#ffffff",
    sortOrder: 1,
  },
  FOLLOW: {
    value: "FOLLOW",
    label: "フォロー",
    description: "相手のアカウントをフォローした。",
    tone: "info",
    color: "#38bdf8",
    textColor: "#ffffff",
    sortOrder: 2,
  },
  DM_SENT: {
    value: "DM_SENT",
    label: "DM送信",
    description: "ダイレクトメッセージを手動送信した。",
    tone: "primary",
    color: "#3b82f6",
    textColor: "#ffffff",
    sortOrder: 3,
  },
  DM_RECEIVED: {
    value: "DM_RECEIVED",
    label: "DM受信",
    description: "相手からダイレクトメッセージを受信した。",
    tone: "success",
    color: "#10b981",
    textColor: "#ffffff",
    sortOrder: 4,
  },
  PDF_SENT: {
    value: "PDF_SENT",
    label: "PDF送付",
    description: "診断レポートPDFを手動送付した。",
    tone: "primary",
    color: "#6366f1",
    textColor: "#ffffff",
    sortOrder: 5,
  },
  ZOOM_INVITED: {
    value: "ZOOM_INVITED",
    label: "Zoom誘導",
    description: "Zoom商談への誘導メッセージを送った。",
    tone: "warning",
    color: "#f59e0b",
    textColor: "#ffffff",
    sortOrder: 6,
  },
  REPLIED: {
    value: "REPLIED",
    label: "返信",
    description: "相手からの返信があった。",
    tone: "success",
    color: "#059669",
    textColor: "#ffffff",
    sortOrder: 7,
  },
  NOTE: {
    value: "NOTE",
    label: "メモ",
    description: "営業担当者のメモ・備考記録。",
    tone: "neutral",
    color: "#64748b",
    textColor: "#ffffff",
    sortOrder: 8,
  },
};

/**
 * SocialTouchLog.type を正規化する（大文字化）。
 * 有効値に該当しない場合は null を返す。
 */
export function normalizeTouchLogType(value: string | null | undefined): TouchLogTypeValue | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (TOUCH_LOG_TYPE_VALUES.includes(normalized as TouchLogTypeValue)) {
    return normalized as TouchLogTypeValue;
  }
  return null;
}

/**
 * SocialTouchLog.type を正規化し、不正値の場合はフォールバックを返す。
 */
export function normalizeTouchLogTypeWithFallback(
  value: string | null | undefined,
  fallback: TouchLogTypeValue = TOUCH_LOG_TYPE.NOTE,
): TouchLogTypeValue {
  return normalizeTouchLogType(value) ?? fallback;
}

/**
 * SocialTouchLog.type のメタ情報を取得する。
 * 不正値の場合は "NOTE" のメタ情報を返す。
 */
export function getTouchLogTypeMeta(value: string | null | undefined): StatusMeta {
  const normalized = normalizeTouchLogTypeWithFallback(value);
  return TOUCH_LOG_TYPE_META_MAP[normalized];
}

// ============================================================
// 4. Appointment.outcome（商談・営業活動の結果履歴）
//    DB値: 小文字
//    スキーマコメント: pending, appointment_set, proposed, won, lost, follow_up
//    UI (replies/page.tsx): 上記6値すべてを使用
//    actions内条件分岐: pending, appointment_set, won, lost
// ============================================================

/** Appointment.outcome の有効値 */
export const APPOINTMENT_OUTCOME = {
  PENDING: "pending",
  APPOINTMENT_SET: "appointment_set",
  PROPOSED: "proposed",
  WON: "won",
  LOST: "lost",
  FOLLOW_UP: "follow_up",
} as const;

export type AppointmentOutcomeValue = (typeof APPOINTMENT_OUTCOME)[keyof typeof APPOINTMENT_OUTCOME];

/** Appointment.outcome の全有効値リスト（ソート順） */
export const APPOINTMENT_OUTCOME_VALUES: readonly AppointmentOutcomeValue[] = [
  APPOINTMENT_OUTCOME.PENDING,
  APPOINTMENT_OUTCOME.APPOINTMENT_SET,
  APPOINTMENT_OUTCOME.PROPOSED,
  APPOINTMENT_OUTCOME.WON,
  APPOINTMENT_OUTCOME.LOST,
  APPOINTMENT_OUTCOME.FOLLOW_UP,
] as const;

/** Appointment.outcome のメタ情報マップ */
const APPOINTMENT_OUTCOME_META_MAP: Record<AppointmentOutcomeValue, StatusMeta> = {
  pending: {
    value: "pending",
    label: "商談待ち",
    description: "商談がまだ実施されていない状態。",
    tone: "neutral",
    color: "#94a3b8",
    textColor: "#ffffff",
    sortOrder: 0,
  },
  appointment_set: {
    value: "appointment_set",
    label: "アポ獲得",
    description: "商談日程が確定した状態。",
    tone: "warning",
    color: "#f59e0b",
    textColor: "#ffffff",
    sortOrder: 1,
  },
  proposed: {
    value: "proposed",
    label: "提案済み",
    description: "商談で提案を行った状態。結果待ち。",
    tone: "primary",
    color: "#3b82f6",
    textColor: "#ffffff",
    sortOrder: 2,
  },
  won: {
    value: "won",
    label: "成約",
    description: "契約・成約に至った商談。",
    tone: "success",
    color: "#059669",
    textColor: "#ffffff",
    sortOrder: 3,
  },
  lost: {
    value: "lost",
    label: "失注",
    description: "成約に至らなかった商談。",
    tone: "danger",
    color: "#ef4444",
    textColor: "#ffffff",
    sortOrder: 4,
  },
  follow_up: {
    value: "follow_up",
    label: "継続フォロー",
    description: "すぐの成約は見込めないが、継続的にフォローする商談。",
    tone: "info",
    color: "#0ea5e9",
    textColor: "#ffffff",
    sortOrder: 5,
  },
};

/**
 * Appointment.outcome を正規化する（小文字化）。
 * 有効値に該当しない場合は null を返す。
 */
export function normalizeAppointmentOutcome(value: string | null | undefined): AppointmentOutcomeValue | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (APPOINTMENT_OUTCOME_VALUES.includes(normalized as AppointmentOutcomeValue)) {
    return normalized as AppointmentOutcomeValue;
  }
  return null;
}

/**
 * Appointment.outcome を正規化し、不正値の場合はフォールバックを返す。
 */
export function normalizeAppointmentOutcomeWithFallback(
  value: string | null | undefined,
  fallback: AppointmentOutcomeValue = APPOINTMENT_OUTCOME.PENDING,
): AppointmentOutcomeValue {
  return normalizeAppointmentOutcome(value) ?? fallback;
}

/**
 * Appointment.outcome のメタ情報を取得する。
 * 不正値の場合は "pending" のメタ情報を返す。
 */
export function getAppointmentOutcomeMeta(value: string | null | undefined): StatusMeta {
  const normalized = normalizeAppointmentOutcomeWithFallback(value);
  return APPOINTMENT_OUTCOME_META_MAP[normalized];
}

// ============================================================
// 5. ドメイン間マッピング補助関数
// ============================================================

/**
 * TargetCompany.status → Appointment.outcome のマッピング。
 * targets/actions.ts の updateTargetSalesStatus 内で使用されている
 * 暗黙的な if/else 判定を明示的に関数化したもの。
 *
 * 注意：この関数はマッピングロジックの「定義」であり、
 * 既存 actions.ts のコードをこの関数に置き換えるのは次フェーズで行う。
 */
export function mapTargetStatusToOutcome(
  targetStatus: string,
): AppointmentOutcomeValue {
  const normalized = normalizeTargetStatus(targetStatus);
  switch (normalized) {
    case TARGET_STATUS.WON:
      return APPOINTMENT_OUTCOME.WON;
    case TARGET_STATUS.LOST:
      return APPOINTMENT_OUTCOME.LOST;
    case TARGET_STATUS.APPOINTMENT:
      return APPOINTMENT_OUTCOME.APPOINTMENT_SET;
    default:
      return APPOINTMENT_OUTCOME.PENDING;
  }
}

/**
 * Appointment.outcome → TargetCompany.status の逆方向マッピング。
 * replies/actions.ts の createAppointment 内で使用されている
 * outcome に応じた TargetCompany.status の連動更新ロジックを関数化したもの。
 *
 * 戻り値が undefined の場合は TargetCompany.status を更新しない。
 * これは既存挙動を維持するための設計判断：
 *   - won: 成約確定のため TargetCompany.status を "won" に更新する
 *   - appointment_set: 商談確定のため TargetCompany.status を "appointment" に更新する
 *   - lost / proposed / follow_up / pending: 担当者の手動判断を優先し、連動更新しない
 */
export function mapOutcomeToTargetStatus(
  outcome: string,
): TargetStatusValue | undefined {
  const normalized = normalizeAppointmentOutcome(outcome);
  switch (normalized) {
    case APPOINTMENT_OUTCOME.WON:
      return TARGET_STATUS.WON;
    case APPOINTMENT_OUTCOME.APPOINTMENT_SET:
      return TARGET_STATUS.APPOINTMENT;
    default:
      return undefined;
  }
}
