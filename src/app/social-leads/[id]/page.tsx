import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createSocialTouchLog, promoteSocialLeadToTarget } from "../actions";
import { DIAGNOSIS_CONFIG } from "@/lib/recruitment-report/config";
import { generateSocialDm, SocialDmType } from "@/lib/social-dm/generator";

export default async function SocialLeadDetailPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ dmType?: string; generateDm?: string }>
}) {
  const { id } = await params;
  const { dmType: rawDmType, generateDm } = await searchParams;
  const dmType = rawDmType as SocialDmType | undefined;
  const shouldGenerate = generateDm === "1" && dmType;

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

  // DM下書きの生成（リクエストがある場合のみ）
  let generatedDm = "";
  if (shouldGenerate && dmType) {
    const pastLogs = lead.touchLogs.slice(0, 5).map(log => `[${log.type}] ${log.content}`);
    generatedDm = await generateSocialDm({
      leadId: lead.id,
      name: lead.name,
      handle: lead.handle,
      snsType: lead.snsType,
      profileText: lead.profileText,
      diagnosisType: lead.diagnosisType,
      productName: lead.product?.name || null,
      notes: lead.notes,
      dmType,
      pastLogs,
    });
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
        {/* 左側：DM作成支援と接触履歴 */}
        <div>
          {/* DM作成支援セクション */}
          <section className="card" style={{ marginBottom: "2rem", border: "2px solid var(--primary-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>✉️</span>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>DM作成支援 (AI)</h2>
            </div>

            <form method="GET" style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <input type="hidden" name="generateDm" value="1" />
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.875rem", fontWeight: "600" }}>DM種別を選択</label>
                  <select name="dmType" defaultValue={dmType || "INITIAL_CONTACT"} style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}>
                    <option value="INITIAL_CONTACT">初回接触DM</option>
                    <option value="FREE_DIAGNOSIS_OFFER">無料診断誘導DM</option>
                    <option value="PDF_SEND">PDF送付DM</option>
                    <option value="ZOOM_INVITE">Zoom誘導DM</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: "40px" }}>
                  下書きを生成する
                </button>
              </div>
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                ※生成には数秒かかります。ページが再読み込みされます。
              </p>
            </form>

            {generatedDm && (
              <div style={{ padding: "1rem", backgroundColor: "#fff", border: "1px solid var(--primary-light)", borderRadius: "8px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "var(--primary)" }}>
                  生成されたDM下書き
                </label>
                <textarea
                  readOnly
                  rows={8}
                  value={generatedDm}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem", 
                    borderRadius: "4px", 
                    border: "1px solid var(--border)",
                    backgroundColor: "#fcfcfc",
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                    marginBottom: "1rem"
                  }}
                />
                <div style={{ padding: "0.75rem", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "6px", fontSize: "0.8rem", color: "#92400e" }}>
                  <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>⚠️ ご注意・次のステップ</p>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    {(dmType === "PDF_SEND" || dmType === "ZOOM_INVITE") && (
                      <li style={{ color: "#c2410c", fontWeight: "bold", marginBottom: "0.25rem" }}>
                        PDF URL、添付ファイル、Zoom URL、日程調整リンクは自動では追加されません。送信前に手動で追記してください。
                      </li>
                    )}
                    <li>この文章をコピーして、SNS上で手動で送信してください。</li>
                    <li><strong>この画面から自動送信はされません。</strong> 内容は必ず確認・修正してください。</li>
                    <li>送信後は、下の「接触履歴」フォームから <strong>{
                      dmType === "PDF_SEND" ? "PDF_SENT" : 
                      dmType === "ZOOM_INVITE" ? "ZOOM_INVITED" : "DM_SENT"
                    }</strong> として記録を残してください。</li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          <section className="card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>接触履歴</h2>
            
            {/* 登録フォーム */}
            <form action={createSocialTouchLog} style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <input type="hidden" name="socialLeadCandidateId" value={lead.id} />
              
              {generatedDm && (
                <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: "6px", fontSize: "0.85rem", color: "#0369a1" }}>
                  <strong>ℹ️ 下書きを引き継ぎました</strong><br />
                  SNS公式画面で手動送信した後、内容を確認・修正してから履歴として保存してください。
                  <div style={{ marginTop: "0.25rem", fontWeight: "bold", color: "#c2410c" }}>
                    ※この画面からSNSへ自動送信はされません。
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.875rem", fontWeight: "600" }}>種別 *</label>
                  <select 
                    name="type" 
                    required 
                    defaultValue={
                      dmType === "PDF_SEND" ? "PDF_SENT" :
                      dmType === "ZOOM_INVITE" ? "ZOOM_INVITED" :
                      generatedDm ? "DM_SENT" : "LIKE"
                    }
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                  >
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
                    defaultValue={lead.touchLogs[0]?.ownedAccountName || ""}
                    style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.875rem", fontWeight: "600" }}>内容/メモ</label>
                <textarea
                  name="content"
                  rows={generatedDm ? 6 : 2}
                  defaultValue={generatedDm}
                  placeholder="送信した内容やリンクなど"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                ></textarea>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  {generatedDm ? "DM送信記録を保存" : "履歴を記録する"}
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

          {/* 昇格セクション */}
          <section className="card" style={{ marginTop: "2rem", position: "sticky", top: "28rem" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>TargetCompany 昇格</h2>
            
            {lead.targetCompanyId ? (
              <div style={{ padding: "1rem", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#166534", fontWeight: "bold" }}>
                  ✅ TargetCompany 昇格済み
                </p>
                <Link 
                  href={`/targets/${lead.targetCompanyId}`}
                  className="btn btn-sm btn-neutral"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  企業詳細を開く
                </Link>
              </div>
            ) : (
              <form action={promoteSocialLeadToTarget}>
                <input type="hidden" name="socialLeadCandidateId" value={lead.id} />
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "600" }}>企業名 *</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      defaultValue={lead.name || lead.handle || ""}
                      placeholder="株式会社〇〇"
                      style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "600" }}>Webサイト URL</label>
                    <input
                      type="url"
                      name="website"
                      placeholder="https://example.com"
                      style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "600" }}>業界</label>
                      <input
                        type="text"
                        name="industry"
                        placeholder="IT, 製造など"
                        style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.3rem", fontWeight: "600" }}>地域</label>
                      <input
                        type="text"
                        name="region"
                        placeholder="東京都など"
                        style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border)" }}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: "0.5rem" }}>
                    企業として登録・昇格
                  </button>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    ※昇格すると、自動診断（RecruitmentReport）などが利用可能になります。
                  </p>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
