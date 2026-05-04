import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSocialTouchLog } from "../actions";
import { DIAGNOSIS_CONFIG } from "@/lib/recruitment-report/config";

export default async function SocialLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // データの取得
  const lead = await prisma.socialLeadCandidate.findUnique({
    where: { id },
    include: {
      product: true,
      touchLogs: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div className="container">
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/social-leads" style={{ color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}>
          ← 一覧に戻る
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span className="badge badge-neutral">{lead.snsType}</span>
            <h1 style={{ margin: 0 }}>{lead.name || "名称未設定"}</h1>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>{lead.handle}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <span className="badge" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary-dark)" }}>
              {lead.status}
            </span>
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            登録日: {new Date(lead.createdAt).toLocaleDateString("ja-JP")}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        {/* 左側：接触履歴 */}
        <div>
          <section className="card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>接触履歴</h2>
            
            {/* 登録フォーム */}
            <form action={createSocialTouchLog} style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <input type="hidden" name="socialLeadCandidateId" value={lead.id} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.875rem", fontWeight: "600" }}>種別 *</label>
                  <select name="type" required style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
                    <option value="LIKE">いいね済み</option>
                    <option value="COMMENT">コメント済み</option>
                    <option value="FOLLOW">フォロー済み</option>
                    <option value="DM_SENT">DM送信済み</option>
                    <option value="DM_RECEIVED">返信受信（DM）</option>
                    <option value="PDF_SENT">診断PDF送付済み</option>
                    <option value="ZOOM_INVITED">Zoom商談打診中</option>
                    <option value="REPLIED">その他反応あり</option>
                    <option value="NOTE">メモ/その他</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.875rem", fontWeight: "600" }}>使用アカウント</label>
                  <input
                    type="text"
                    name="ownedAccountName"
                    placeholder="自社アカウント名"
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.875rem", fontWeight: "600" }}>内容/メモ</label>
                <textarea
                  name="content"
                  rows={2}
                  placeholder="送信した内容やリンクなど"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                ></textarea>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  履歴を記録する
                </button>
              </div>
            </form>

            {/* 履歴一覧 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {lead.touchLogs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                  接触履歴はまだありません
                </div>
              ) : (
                lead.touchLogs.map((log) => (
                  <div key={log.id} style={{ padding: "1rem", borderLeft: "4px solid var(--primary)", backgroundColor: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", borderRadius: "0 4px 4px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>{log.type}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(log.createdAt).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    {log.ownedAccountName && (
                      <div style={{ fontSize: "0.75rem", color: "var(--primary)", marginBottom: "0.25rem", fontWeight: "600" }}>
                        使用アカウント: {log.ownedAccountName}
                      </div>
                    )}
                    <div style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>{log.content}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* 右側：リード詳細情報 */}
        <div>
          <section className="card" style={{ position: "sticky", top: "1rem" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>リード詳細</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
              <div>
                <label style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>プロフィールURL</label>
                <a href={lead.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", wordBreak: "break-all" }}>
                  {lead.url}
                </a>
              </div>

              <div>
                <label style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>見込み度</label>
                <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>★ {lead.leadScore} / 10</div>
              </div>

              <div>
                <label style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>対象診断タイプ</label>
                <div>
                  {lead.diagnosisType ? DIAGNOSIS_CONFIG[lead.diagnosisType as keyof typeof DIAGNOSIS_CONFIG]?.title || lead.diagnosisType : "未設定"}
                </div>
              </div>

              <div>
                <label style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>提案予定商材</label>
                <div>{lead.product?.name || "未設定"}</div>
              </div>

              {lead.notes && (
                <div>
                  <label style={{ color: "var(--text-muted)", display: "block", marginBottom: "0.2rem" }}>基本メモ</label>
                  <div style={{ whiteSpace: "pre-wrap", padding: "0.5rem", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                    {lead.notes}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
