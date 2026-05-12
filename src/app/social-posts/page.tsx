import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { 
  POST_STATUS, 
  POST_STATUS_VALUES, 
  POST_PLATFORM_VALUES,
  getPostStatusMeta,
  getPostPlatformMeta,
  getPostCategoryMeta
} from "@/lib/constants/post-constants";

export default async function SocialPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; platform?: string }>;
}) {
  const resolvedParams = await searchParams;

  // 正しい検索条件の構築
  const queryWhere: Prisma.SocialPostWhereInput = {};
  if (resolvedParams.status) queryWhere.status = resolvedParams.status;
  if (resolvedParams.platform) queryWhere.platform = resolvedParams.platform;

  const posts = await prisma.socialPost.findMany({
    where: queryWhere,
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // KPI集計
  const kpiStats = await Promise.all([
    prisma.socialPost.count({ where: { status: POST_STATUS.DRAFT } }),
    prisma.socialPost.count({ where: { status: POST_STATUS.APPROVED } }),
    prisma.socialPost.count({ where: { status: POST_STATUS.POSTED } }),
  ]);

  return (
    <div className="container">
      <header style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h1>SNS投稿管理</h1>
            <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
              商材の営業導線となる投稿案の作成・管理を行います。
            </p>
          </div>
          <Link href="/social-posts/new" className="btn btn-primary">
            + 新規投稿作成
          </Link>
        </div>

        {/* KPIカード */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { status: POST_STATUS.DRAFT, count: kpiStats[0] },
            { status: POST_STATUS.APPROVED, count: kpiStats[1] },
            { status: POST_STATUS.POSTED, count: kpiStats[2] },
          ].map((item) => {
            const meta = getPostStatusMeta(item.status);
            return (
              <div key={item.status} className="card" style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.5rem" }}>{meta.label}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{item.count}</div>
              </div>
            );
          })}
        </div>

        {/* フィルタ */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "bold", display: "block", marginBottom: "0.25rem" }}>ステータス</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link 
                href="/social-posts" 
                className="btn" 
                style={{ 
                  padding: "0.25rem 0.75rem", 
                  fontSize: "0.875rem",
                  backgroundColor: !resolvedParams.status ? "var(--primary-light)" : "white" 
                }}
              >
                全て
              </Link>
              {POST_STATUS_VALUES.map((s) => {
                const meta = getPostStatusMeta(s);
                return (
                  <Link 
                    key={s} 
                    href={`/social-posts?status=${s}${resolvedParams.platform ? `&platform=${resolvedParams.platform}` : ""}`} 
                    className="btn"
                    style={{ 
                      padding: "0.25rem 0.75rem", 
                      fontSize: "0.875rem",
                      backgroundColor: resolvedParams.status === s ? "var(--primary-light)" : "white" 
                    }}
                  >
                    {meta.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "bold", display: "block", marginBottom: "0.25rem" }}>プラットフォーム</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link 
                href="/social-posts" 
                className="btn" 
                style={{ 
                  padding: "0.25rem 0.75rem", 
                  fontSize: "0.875rem",
                  backgroundColor: !resolvedParams.platform ? "var(--primary-light)" : "white" 
                }}
              >
                全て
              </Link>
              {POST_PLATFORM_VALUES.map((p) => {
                const meta = getPostPlatformMeta(p);
                return (
                  <Link 
                    key={p} 
                    href={`/social-posts?platform=${p}${resolvedParams.status ? `&status=${resolvedParams.status}` : ""}`} 
                    className="btn"
                    style={{ 
                      padding: "0.25rem 0.75rem", 
                      fontSize: "0.875rem",
                      backgroundColor: resolvedParams.platform === p ? "var(--primary-light)" : "white" 
                    }}
                  >
                    {meta.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* 投稿一覧 */}
      {posts.length === 0 ? (
        <div className="card" style={{ padding: "4rem", textAlign: "center", color: "var(--muted)" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>まだSNS投稿案がありません</p>
          <p>新規投稿作成から投稿案を作成してください。</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {posts.map((post) => {
            const statusMeta = getPostStatusMeta(post.status);
            const platformMeta = getPostPlatformMeta(post.platform);
            const categoryMeta = getPostCategoryMeta(post.category);

            return (
              <Link 
                key={post.id} 
                href={`/social-posts/${post.id}`} 
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card" style={{ padding: "1.5rem", transition: "transform 0.2s", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span style={{ 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "4px", 
                        fontSize: "0.75rem", 
                        fontWeight: "bold",
                        backgroundColor: "var(--bg-muted)",
                        color: "var(--text-muted)"
                      }}>
                        {platformMeta.label}
                      </span>
                      <span style={{ 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "4px", 
                        fontSize: "0.75rem", 
                        fontWeight: "bold",
                        backgroundColor: "var(--bg-muted)",
                        color: "var(--text-muted)"
                      }}>
                        {categoryMeta.label}
                      </span>
                      <span style={{ 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "4px", 
                        fontSize: "0.75rem", 
                        fontWeight: "bold",
                        backgroundColor: statusMeta.tone === "success" ? "#dcfce7" : statusMeta.tone === "info" ? "#dbeafe" : "#f1f5f9",
                        color: statusMeta.tone === "success" ? "#166534" : statusMeta.tone === "info" ? "#1e40af" : "#475569"
                      }}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                      {post.product ? (
                        <span>商材: <strong style={{ color: "var(--text)" }}>{post.product.name}</strong></span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>削除済み商品</span>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: "1rem", 
                    lineHeight: "1.6", 
                    marginBottom: "1rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {post.content}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                    <div style={{ fontSize: "0.875rem", display: "flex", gap: "1rem" }}>
                      {post.ctaLabel && (
                        <span>CTA: <span style={{ color: "var(--primary)" }}>{post.ctaLabel}</span></span>
                      ) }
                      {post.engagementNote && (
                        <span style={{ color: "var(--success)" }}>📝 反応メモあり</span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "right" }}>
                      {post.scheduledDate && (
                        <div>予定: {new Date(post.scheduledDate).toLocaleDateString()}</div>
                      )}
                      {post.postedAt && (
                        <div style={{ color: "var(--success)" }}>投稿済: {new Date(post.postedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
