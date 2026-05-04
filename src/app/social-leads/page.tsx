import { prisma } from "@/lib/prisma";
import { DIAGNOSIS_CONFIG } from "@/lib/recruitment-report/config";
import { createSocialLeadCandidate } from "./actions";

export default async function SocialLeadsPage() {
  // データの取得
  const [leads, products] = await Promise.all([
    prisma.socialLeadCandidate.findMany({
      include: {
        product: true,
        targetCompany: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.product.findMany({
      where: { status: "active" },
    }),
  ]);

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>SNS商談創出：見込み客管理</h1>
      </div>

      {/* 登録フォーム */}
      <div className="card" style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>新規SNSリード登録</h2>
        <form action={createSocialLeadCandidate} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>SNS媒体 *</label>
            <select name="snsType" required style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
              <option value="X">X (Twitter)</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="OTHER">その他</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>プロフィールURL *</label>
            <input
              type="url"
              name="url"
              placeholder="https://x.com/username"
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>アカウントID (@...)</label>
            <input
              type="text"
              name="handle"
              placeholder="@username"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>表示名</label>
            <input
              type="text"
              name="name"
              placeholder="株式会社〇〇 採用担当"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>見込み度 (1-10)</label>
            <input
              type="number"
              name="leadScore"
              min="1"
              max="10"
              defaultValue="1"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>ステータス</label>
            <select name="status" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
              <option value="NEW">NEW (新規発掘)</option>
              <option value="FOLLOWED">FOLLOWED (フォロー済み)</option>
              <option value="LIKED">LIKED (いいね済み)</option>
              <option value="COMMENTED">COMMENTED (コメント済み)</option>
              <option value="DM_SENT">DM_SENT (DM送信済み)</option>
              <option value="REPLIED">REPLIED (返信あり)</option>
              <option value="PDF_SENT">PDF_SENT (診断送付済み)</option>
              <option value="ZOOM_INVITED">ZOOM_INVITED (Zoom誘導中)</option>
              <option value="ARCHIVED">ARCHIVED (対象外/完了)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>対象診断タイプ</label>
            <select name="diagnosisType" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
              <option value="">未設定</option>
              {Object.entries(DIAGNOSIS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>提案予定商材</label>
            <select name="productId" style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
              <option value="">未設定</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>メモ</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="相手の特徴やアプローチのヒント"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}
            ></textarea>
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary">
              SNSリードを登録する
            </button>
          </div>
        </form>
      </div>

      {/* 一覧テーブル */}
      <div className="card">
        <h2 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>登録済みSNSリード一覧</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>媒体</th>
                <th>アカウント</th>
                <th>URL</th>
                <th>見込み度</th>
                <th>ステータス</th>
                <th>診断タイプ</th>
                <th>商材</th>
                <th>更新日</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    登録されているSNSリードはありません
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <span className="badge badge-neutral">{lead.snsType}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600" }}>{lead.name || "名称未設定"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{lead.handle}</div>
                    </td>
                    <td>
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--primary)", fontSize: "0.875rem", textDecoration: "underline" }}
                      >
                        プロフィールを開く
                      </a>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: lead.leadScore >= 8 ? "#fee2e2" : lead.leadScore >= 5 ? "#fef3c7" : "#f1f5f9",
                          color: lead.leadScore >= 8 ? "#991b1b" : lead.leadScore >= 5 ? "#92400e" : "#475569",
                        }}
                      >
                        ★ {lead.leadScore}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{lead.status}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.875rem" }}>
                        {lead.diagnosisType ? DIAGNOSIS_CONFIG[lead.diagnosisType as keyof typeof DIAGNOSIS_CONFIG]?.title || lead.diagnosisType : "-"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.875rem" }}>{lead.product?.name || "-"}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        {new Date(lead.updatedAt).toLocaleDateString("ja-JP")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
