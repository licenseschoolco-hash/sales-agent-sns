"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  POST_STATUS, 
  getPostStatusMeta,
  getPostPlatformMeta,
  getPostCategoryMeta
} from "@/lib/constants/post-constants";
import { markSocialPostPosted, archiveSocialPost } from "../actions";

interface PostDetailViewProps {
  post: {
    id: string;
    content: string;
    platform: string;
    category: string;
    status: string;
    ctaLabel: string | null;
    ctaUrl: string | null;
    scheduledDate: Date | null;
    postedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    product: {
      id: string;
      name: string;
      description: string;
      painPoints: { id: string; painPoint: string }[];
      valueProps: { id: string; proposition: string }[];
      ngExpressions: { id: string; phrase: string }[];
    } | null;
  };
}

export default function PostDetailView({ post }: PostDetailViewProps) {
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const statusMeta = getPostStatusMeta(post.status);
  const platformMeta = getPostPlatformMeta(post.platform);
  const categoryMeta = getPostCategoryMeta(post.category);
  const product = post.product;

  // コピー機能
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      alert("コピーに失敗しました。");
    }
  };

  // 投稿済みとして記録
  const handleMarkPosted = async () => {
    if (!window.confirm("この投稿を「投稿済み」として記録しますか？\n\n※この操作はSNSへの自動投稿ではありません。手動で投稿した後に実行してください。")) {
      return;
    }
    setLoading(true);
    const res = await markSocialPostPosted(post.id);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || "記録に失敗しました。");
      setLoading(false);
    }
  };

  // アーカイブ
  const handleArchive = async () => {
    if (!window.confirm("この投稿をアーカイブしますか？\n\n※物理削除ではなくアーカイブリストへ移動します。")) {
      return;
    }
    setLoading(true);
    const res = await archiveSocialPost(post.id);
    if (res.success) {
      window.location.href = "/social-posts";
    } else {
      alert(res.error || "アーカイブに失敗しました。");
      setLoading(false);
    }
  };

  // ステータス別の操作制御
  const canMarkPosted = post.status === POST_STATUS.APPROVED;
  const isPosted = post.status === POST_STATUS.POSTED;
  const isArchived = post.status === POST_STATUS.ARCHIVED;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "start" }}>
      {/* 左側: 投稿詳細 */}
      <section style={{ flex: "1 1 600px", minWidth: "0" }}>
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <Link href="/social-posts" style={{ fontSize: "0.875rem", color: "var(--muted)" }}>← 一覧へ戻る</Link>
            <h1 style={{ marginTop: "0.5rem" }}>投稿案の詳細</h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {!isArchived && (
              <Link 
                href={`/social-posts/${post.id}/edit`} 
                className="btn" 
                style={{ border: "1px solid var(--border)" }}
              >
                編集する
              </Link>
            )}
            <button 
              onClick={handleArchive} 
              className="btn" 
              disabled={loading || isArchived}
              style={{ border: "1px solid var(--border)", color: "#b91c1c" }}
            >
              アーカイブ
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          {/* ヘッダー情報 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>ステータス</label>
              <span style={{ 
                display: "inline-block",
                marginTop: "0.25rem",
                padding: "0.25rem 0.75rem", 
                borderRadius: "4px", 
                fontSize: "0.875rem", 
                fontWeight: "bold",
                backgroundColor: statusMeta.tone === "success" ? "#dcfce7" : statusMeta.tone === "info" ? "#dbeafe" : "#f1f5f9",
                color: statusMeta.tone === "success" ? "#166534" : statusMeta.tone === "info" ? "#1e40af" : "#475569"
              }}>
                {statusMeta.label}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>プラットフォーム</label>
              <div style={{ marginTop: "0.25rem", fontWeight: "bold" }}>{platformMeta.label}</div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>カテゴリ</label>
              <div style={{ marginTop: "0.25rem", fontWeight: "bold" }}>{categoryMeta.label}</div>
            </div>
          </div>

          {/* 本文エリア */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <label style={{ fontWeight: "bold" }}>投稿本文</label>
              <button 
                onClick={handleCopy} 
                className="btn btn-primary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                {copyFeedback ? "✅ コピー完了" : "📋 本文をコピー"}
              </button>
            </div>
            <div style={{ 
              backgroundColor: "var(--bg-muted)", 
              padding: "1.5rem", 
              borderRadius: "8px", 
              whiteSpace: "pre-wrap",
              lineHeight: "1.8",
              fontSize: "1.05rem",
              border: "1px solid var(--border)"
            }}>
              {post.content}
            </div>
          </div>

          {/* CTA情報 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            <div className="card" style={{ padding: "1rem", backgroundColor: "#f8fafc" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>CTAラベル</label>
              <div style={{ fontWeight: "bold", marginTop: "0.25rem" }}>{post.ctaLabel || "未設定"}</div>
            </div>
            <div className="card" style={{ padding: "1rem", backgroundColor: "#f8fafc" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>CTA URL</label>
              <div style={{ marginTop: "0.25rem" }}>
                {post.ctaUrl ? (
                  <a href={post.ctaUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontSize: "0.875rem", wordBreak: "break-all" }}>
                    {post.ctaUrl}
                  </a>
                ) : "未設定"}
              </div>
            </div>
          </div>

          {/* 投稿実行エリア */}
          <div style={{ 
            backgroundColor: isPosted ? "#f0fdf4" : "#f8fafc", 
            padding: "1.5rem", 
            borderRadius: "8px", 
            border: isPosted ? "1px solid #bbf7d0" : "1px solid var(--border)",
            textAlign: "center"
          }}>
            {isPosted ? (
              <div>
                <div style={{ color: "var(--success)", fontWeight: "bold", marginBottom: "0.5rem" }}>✓ 投稿済みとして記録されています</div>
                <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                  投稿日時: {post.postedAt ? new Date(post.postedAt).toLocaleString() : "-"}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  外部SNSへ手動で投稿したあと、以下のボタンを押して記録してください。
                </p>
                <button 
                  onClick={handleMarkPosted} 
                  className="btn btn-primary" 
                  disabled={loading || !canMarkPosted}
                  style={{ 
                    padding: "0.75rem 2rem", 
                    backgroundColor: !canMarkPosted ? "var(--muted)" : "var(--success)",
                    borderColor: !canMarkPosted ? "var(--muted)" : "var(--success)"
                  }}
                >
                  {loading ? "更新中..." : "投稿済みとして記録"}
                </button>
                {!canMarkPosted && post.status === POST_STATUS.DRAFT && (
                  <p style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "0.5rem" }}>
                    ※投稿済みとして記録するには、まずステータスを「承認済み」に変更してください。
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* タイムスタンプ */}
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "right", padding: "0 1rem" }}>
          作成日: {new Date(post.createdAt).toLocaleString()} | 最終更新: {new Date(post.updatedAt).toLocaleString()}
        </div>
      </section>

      {/* 右側: 商材参照パネル */}
      <aside className="card" style={{ flex: "1 1 300px", maxWidth: "400px", minWidth: "0", padding: "1.5rem", position: "sticky", top: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "2px solid var(--primary)", paddingBottom: "0.5rem" }}>
          商材カンニングペーパー
        </h2>
        
        {!product ? (
          <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>
            削除済み商品
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <section>
              <h3 style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.25rem" }}>商材名 / 概要</h3>
              <p style={{ fontWeight: "bold" }}>{product.name}</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>{product.description}</p>
            </section>

            {product.painPoints.length > 0 && (
              <section>
                <h3 style={{ fontSize: "0.875rem", color: "#b91c1c", marginBottom: "0.5rem" }}>解決する悩み (Pain Points)</h3>
                <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem", margin: 0 }}>
                  {product.painPoints.map((p: { id: string; painPoint: string }) => <li key={p.id} style={{ marginBottom: "0.25rem" }}>{p.painPoint}</li>)}
                </ul>
              </section>
            )}

            {product.valueProps.length > 0 && (
              <section>
                <h3 style={{ fontSize: "0.875rem", color: "#166534", marginBottom: "0.5rem" }}>独自の強み (Value Props)</h3>
                <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem", margin: 0 }}>
                  {product.valueProps.map((v: { id: string; proposition: string }) => <li key={v.id} style={{ marginBottom: "0.25rem" }}>{v.proposition}</li>)}
                </ul>
              </section>
            )}

            {product.ngExpressions.length > 0 && (
              <section style={{ backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "4px", border: "1px solid #fee2e2" }}>
                <h3 style={{ fontSize: "0.875rem", color: "#991b1b", marginBottom: "0.5rem" }}>⚠️ NG表現</h3>
                <ul style={{ fontSize: "0.825rem", paddingLeft: "1.25rem", margin: 0, color: "#991b1b" }}>
                  {product.ngExpressions.map((n: { id: string; phrase: string }) => <li key={n.id} style={{ marginBottom: "0.25rem" }}>{n.phrase}</li>)}
                </ul>
              </section>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
