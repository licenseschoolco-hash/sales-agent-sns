import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DIAGNOSIS_CONFIG } from "@/lib/recruitment-report/config";

export default async function SocialSalesDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "30d" } = await searchParams;

  // 期間の設定
  let startDate: Date | undefined;
  const now = new Date();
  if (range === "7d") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "30d") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // 1. 基本統計の取得 (全期間・スナップショット)
  const totalLeads = await prisma.socialLeadCandidate.count();
  const promotedLeadsCount = await prisma.socialLeadCandidate.count({
    where: { targetCompanyId: { not: null } },
  });

  // 2. 期間内の新規リード
  const newLeadsCount = await prisma.socialLeadCandidate.count({
    where: startDate ? { createdAt: { gte: startDate } } : {},
  });

  // 3. タッチログの集計 (期間内)
  const touchLogStats = await prisma.socialTouchLog.groupBy({
    by: ["type"],
    where: startDate ? { createdAt: { gte: startDate } } : {},
    _count: { id: true },
  });

  const getLogCount = (type: string) =>
    touchLogStats.find((s) => s.type === type)?._count.id || 0;

  const dmSentCount = getLogCount("DM_SENT");
  const pdfSentCount = getLogCount("PDF_SENT");
  const zoomInvitedCount = getLogCount("ZOOM_INVITED");
  const repliedCount = getLogCount("DM_RECEIVED") + getLogCount("REPLIED");

  // 4. 分析用データ取得 (詳細ブレイクダウン)
  const allLeadsForBreakdown = await prisma.socialLeadCandidate.findMany({
    select: { id: true, diagnosisType: true, targetCompanyId: true, productId: true, product: { select: { name: true } } },
  });

  // 診断タイプ別
  const diagnosisTypeStats = Object.keys(DIAGNOSIS_CONFIG).map((type) => {
    const leads = allLeadsForBreakdown.filter((l) => l.diagnosisType === type);
    const count = leads.length;
    const promoted = leads.filter((l) => l.targetCompanyId !== null).length;
    return {
      type,
      label: DIAGNOSIS_CONFIG[type as keyof typeof DIAGNOSIS_CONFIG]?.title || type,
      count,
      promoted,
      rate: count > 0 ? (promoted / count) * 100 : 0,
    };
  }).sort((a, b) => b.count - a.count);

  // 商品別
  const productNames = Array.from(new Set(allLeadsForBreakdown.map(l => l.product?.name || "未設定")));
  const productStats = productNames.map(name => {
    const leads = allLeadsForBreakdown.filter(l => (l.product?.name || "未設定") === name);
    const count = leads.length;
    const promoted = leads.filter(l => l.targetCompanyId !== null).length;
    return {
      name,
      count,
      promoted,
      rate: count > 0 ? (promoted / count) * 100 : 0
    };
  }).sort((a, b) => b.count - a.count);

  // 5. 最近の活動
  const recentLogs = await prisma.socialTouchLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      socialLeadCandidate: {
        select: { id: true, name: true, handle: true }
      }
    }
  });

  // --- 改善提案ロジック (ルールベース) ---
  const dmSentRate = totalLeads > 0 ? dmSentCount / totalLeads : 0;
  const pdfSentRate = dmSentCount > 0 ? pdfSentCount / dmSentCount : 0;
  const zoomInviteRate = pdfSentCount > 0 ? zoomInvitedCount / pdfSentCount : 0;
  const promotionRate = totalLeads > 0 ? promotedLeadsCount / totalLeads : 0;

  const insights: { type: 'warning' | 'info' | 'success' | 'note', text: string, label: string }[] = [];

  if (totalLeads < 10) {
    insights.push({ type: 'note', label: 'ℹ️ 参考値', text: 'リード数が少ないため、各率は参考値として扱ってください。' });
  }

  // アプローチ (DM送信)
  if (totalLeads >= 5 && dmSentRate < 0.5) {
    insights.push({ type: 'warning', label: '⚠️ 要確認', text: '未接触リードが残っている可能性があります。優先的に初回DMを送る対象を確認してください。' });
  }

  // フック (PDF送付)
  if (dmSentCount >= 5 && pdfSentRate < 0.15) {
    insights.push({ type: 'info', label: '💡 改善候補', text: 'DM送信からPDF送付への移行率が低めに見えます。無料診断誘導DMや、PDF送付のタイミングを見直す余地があります。' });
  } else if (pdfSentRate >= 0.3) {
    insights.push({ type: 'success', label: '✅ 好調', text: 'DM送信からのPDF送付への反応が良好です。現在のオファー内容を維持、または横展開を検討してください。' });
  }

  // 商談化 (Zoom)
  if (pdfSentCount >= 5 && zoomInviteRate < 0.1) {
    insights.push({ type: 'info', label: '💡 改善候補', text: 'PDF送付後の商談誘導に改善余地がある可能性があります。PDF送付後の補足DMやZoom誘導文を確認してください。' });
  }

  // 全体 (昇格)
  if (totalLeads >= 10 && promotionRate < 0.05) {
    insights.push({ type: 'warning', label: '⚠️ 要確認', text: 'SNSリードからTargetCompanyへの昇格率が低めに見えます。リード選定基準や昇格タイミングを見直す余地があります。' });
  }

  // 診断タイプ・商品注目候補
  const bestDiagnosis = diagnosisTypeStats.filter(s => s.count >= 3).sort((a, b) => b.rate - a.rate)[0];
  if (bestDiagnosis && bestDiagnosis.rate > 20) {
    insights.push({ type: 'success', label: '✅ 注目', text: `「${bestDiagnosis.label}」診断の昇格率が ${bestDiagnosis.rate.toFixed(1)}% と高めです。優先的に検証する価値があります。` });
  }

  const bestProduct = productStats.filter(s => s.count >= 3).sort((a, b) => b.rate - a.rate)[0];
  if (bestProduct && bestProduct.rate > 20) {
    insights.push({ type: 'success', label: '✅ 注目', text: `商品「${bestProduct.name}」の昇格率が ${bestProduct.rate.toFixed(1)}% と良好です。確認してみてください。` });
  }

  return (
    <div className="container" style={{ paddingBottom: "4rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>SNS営業KPIダッシュボード</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>活動状況の可視化と、ボトルネックに基づく改善提案を表示します。</p>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem", background: "var(--bg-secondary)", padding: "0.4rem", borderRadius: "8px" }}>
          <FilterLink label="直近7日" value="7d" current={range} />
          <FilterLink label="直近30日" value="30d" current={range} />
          <FilterLink label="全期間" value="all" current={range} />
        </nav>
      </header>

      {/* KPIカード */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <KpiCard title="SNSリード総数" value={totalLeads} unit="件" subtitle="累計" />
        <KpiCard title="期間内新規リード" value={newLeadsCount} unit="件" color="var(--primary)" />
        <KpiCard title="DM送信数" value={dmSentCount} unit="件" />
        <KpiCard title="返信数" value={repliedCount} unit="件" color="var(--success)" />
        <KpiCard title="Zoom打診数" value={zoomInvitedCount} unit="件" />
        <KpiCard title="昇格数" value={promotedLeadsCount} unit="件" subtitle={`昇格率: ${promotionRate > 0 ? (promotionRate * 100).toFixed(1) : 0}%`} color="var(--primary)" />
      </section>

      {/* 改善アクションセクション */}
      <section className="card" style={{ marginBottom: "2rem", border: "2px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>💡</span> 改善アクション・ボトルネック分析
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {insights.length > 0 ? (
            insights.map((insight, i) => (
              <div key={i} style={{ 
                padding: "0.85rem", 
                borderRadius: "8px", 
                fontSize: "0.9rem", 
                backgroundColor: insight.type === 'warning' ? '#fff1f2' : insight.type === 'info' ? '#eff6ff' : insight.type === 'success' ? '#f0fdf4' : '#f8fafc',
                color: insight.type === 'warning' ? '#991b1b' : insight.type === 'info' ? '#1e40af' : insight.type === 'success' ? '#166534' : 'var(--text-muted)',
                border: "1px solid",
                borderColor: insight.type === 'warning' ? '#fecaca' : insight.type === 'info' ? '#bfdbfe' : insight.type === 'success' ? '#bbf7d0' : '#e2e8f0',
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start"
              }}>
                <span style={{ fontWeight: "800", whiteSpace: "nowrap" }}>{insight.label}</span>
                <span style={{ lineHeight: "1.5" }}>{insight.text}</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>現在、特に目立ったボトルネックは確認されませんでした。</p>
          )}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem" }}>
        <div>
          {/* ファンネル */}
          <section className="card" style={{ marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>営業ファンネル</h2>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>※リード総数に対する転換率</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FunnelRow label="リード獲得" value={totalLeads} total={totalLeads} color="#94a3b8" />
              <FunnelRow label="DM送信" value={dmSentCount} total={totalLeads} color="#60a5fa" rateLabel={`送信率: ${(dmSentRate * 100).toFixed(1)}%`} />
              <FunnelRow label="PDF送付" value={pdfSentCount} total={totalLeads} color="#34d399" rateLabel={`PDF送付率: ${(pdfSentRate * 100).toFixed(1)}% (対DM)`} />
              <FunnelRow label="Zoom打診" value={zoomInvitedCount} total={totalLeads} color="#fbbf24" rateLabel={`誘導率: ${(zoomInviteRate * 100).toFixed(1)}% (対PDF)`} />
              <FunnelRow label="企業昇格" value={promotedLeadsCount} total={totalLeads} color="var(--primary)" rateLabel={`昇格率: ${(promotionRate * 100).toFixed(1)}%`} />
            </div>
          </section>

          {/* 診断タイプ別テーブル */}
          <section className="card" style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>診断タイプ別パフォーマンス</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem" }}>診断タイプ</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>リード数</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>昇格数</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>昇格率</th>
                </tr>
              </thead>
              <tbody>
                {diagnosisTypeStats.map(stat => (
                  <tr key={stat.type} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: "600" }}>
                      {stat.label}
                      {stat.count < 3 && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "normal" }}>(参考値)</span>}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>{stat.count} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</span></td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>{stat.promoted} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</span></td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right", fontWeight: "700", color: stat.rate > 20 && stat.count >= 3 ? "var(--success)" : "inherit" }}>
                      {stat.rate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 商品別テーブル */}
          <section className="card">
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>商品別パフォーマンス</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem" }}>商品名</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>リード数</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>昇格数</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>昇格率</th>
                </tr>
              </thead>
              <tbody>
                {productStats.map(stat => (
                  <tr key={stat.name} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: "600" }}>
                      {stat.name}
                      {stat.count < 3 && <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "normal" }}>(参考値)</span>}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>{stat.count} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</span></td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>{stat.promoted} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</span></td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right", fontWeight: "700", color: stat.rate > 20 && stat.count >= 3 ? "var(--success)" : "inherit" }}>
                      {stat.rate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* 最近の活動 */}
        <aside>
          <section className="card" style={{ height: "100%" }}>
            <h2 style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>最近の活動</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {recentLogs.map(log => (
                <div key={log.id} style={{ padding: "0.75rem", borderLeft: "3px solid var(--primary)", background: "#f8fafc", borderRadius: "0 4px 4px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: "bold", background: "#e2e8f0", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                      {log.type}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                      {new Date(log.createdAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <Link 
                    href={`/social-leads/${log.socialLeadCandidateId}`}
                    style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--primary)", textDecoration: "none", display: "block", marginBottom: "0.25rem" }}
                  >
                    {log.socialLeadCandidate.name || log.socialLeadCandidate.handle}
                  </Link>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dark)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {log.content}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link href="/social-leads" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>全てのリードを見る →</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function KpiCard({ title, value, unit, subtitle, color }: { title: string, value: number, unit: string, subtitle?: string, color?: string }) {
  return (
    <div className="card" style={{ padding: "1.25rem", borderTop: color ? `4px solid ${color}` : "1px solid var(--border)" }}>
      <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: "600" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
        <span style={{ fontSize: "1.75rem", fontWeight: "800", color: color || "inherit" }}>{value.toLocaleString()}</span>
        <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{unit}</span>
      </div>
      {subtitle && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>{subtitle}</div>}
    </div>
  );
}

function FunnelRow({ label, value, total, color, rateLabel }: { label: string, value: number, total: number, color: string, rateLabel?: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem", fontWeight: "600" }}>
        <span>{label}</span>
        <div style={{ textAlign: "right" }}>
          <div>{value.toLocaleString()} 件 ({percentage.toFixed(1)}%)</div>
          {rateLabel && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "normal" }}>{rateLabel}</div>}
        </div>
      </div>
      <div style={{ width: "100%", height: "12px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: color, transition: "width 0.5s ease-out" }}></div>
      </div>
    </div>
  );
}

function FilterLink({ label, value, current }: { label: string, value: string, current: string }) {
  const isActive = current === value;
  return (
    <Link 
      href={`/social-leads/dashboard?range=${value}`}
      style={{ 
        padding: "0.3rem 0.75rem", 
        fontSize: "0.8rem", 
        borderRadius: "6px", 
        textDecoration: "none", 
        background: isActive ? "white" : "transparent",
        color: isActive ? "var(--primary)" : "var(--text-muted)",
        fontWeight: isActive ? "700" : "500",
        boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        transition: "all 0.2s"
      }}
    >
      {label}
    </Link>
  );
}
