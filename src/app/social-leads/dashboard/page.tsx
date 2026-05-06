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

  // 1. 基本統計の取得
  const totalLeads = await prisma.socialLeadCandidate.count();
  const promotedLeadsCount = await prisma.socialLeadCandidate.count({
    where: { targetCompanyId: { not: null } },
  });

  const newLeadsCount = await prisma.socialLeadCandidate.count({
    where: startDate ? { createdAt: { gte: startDate } } : {},
  });

  // 2. タッチログの集計 (期間内)
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

  // 3. 診断タイプ別の集計
  const diagnosisTypeGroups = await prisma.socialLeadCandidate.groupBy({
    by: ["diagnosisType"],
    _count: { id: true },
  });

  // 診断タイプ別の昇格数 (手動集計が必要なため findMany)
  const allLeadsForBreakdown = await prisma.socialLeadCandidate.findMany({
    select: { id: true, diagnosisType: true, targetCompanyId: true, productId: true, product: { select: { name: true } } },
  });

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

  // 4. 商品別の集計
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

  // レート計算
  const promotionRate = totalLeads > 0 ? (promotedLeadsCount / totalLeads) * 100 : 0;
  const pdfRate = totalLeads > 0 ? (pdfSentCount / totalLeads) * 100 : 0;
  const zoomRate = totalLeads > 0 ? (zoomInvitedCount / totalLeads) * 100 : 0;

  return (
    <div className="container" style={{ paddingBottom: "4rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>SNS営業KPIダッシュボード</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>SNSリード獲得から商談化までの活動状況を可視化します。</p>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem", background: "var(--bg-secondary)", padding: "0.4rem", borderRadius: "8px" }}>
          <FilterLink label="直近7日" value="7d" current={range} />
          <FilterLink label="直近30日" value="30d" current={range} />
          <FilterLink label="全期間" value="all" current={range} />
        </nav>
      </header>

      {/* KPIカード */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <KpiCard title="SNSリード総数" value={totalLeads} unit="件" subtitle="累計" />
        <KpiCard title="期間内新規リード" value={newLeadsCount} unit="件" color="var(--primary)" />
        <KpiCard title="DM送信数" value={dmSentCount} unit="件" />
        <KpiCard title="返信数" value={repliedCount} unit="件" color="var(--success)" />
        <KpiCard title="Zoom打診数" value={zoomInvitedCount} unit="件" />
        <KpiCard title="昇格数" value={promotedLeadsCount} unit="件" subtitle={`昇格率: ${promotionRate.toFixed(1)}%`} color="var(--primary)" />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem" }}>
        <div>
          {/* ファンネル */}
          <section className="card" style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>営業ファンネル</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <FunnelRow label="リード獲得" value={totalLeads} total={totalLeads} color="#94a3b8" />
              <FunnelRow label="DM送信 (アプローチ)" value={dmSentCount} total={totalLeads} color="#60a5fa" />
              <FunnelRow label="PDF送付 (価値提供)" value={pdfSentCount} total={totalLeads} color="#34d399" />
              <FunnelRow label="Zoom打診 (商談化)" value={zoomInvitedCount} total={totalLeads} color="#fbbf24" />
              <FunnelRow label="企業昇格 (ターゲット化)" value={promotedLeadsCount} total={totalLeads} color="var(--primary)" />
            </div>
            <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              ※各プロセスは SNSリード総数に対する割合を表示しています。
            </p>
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
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: "600" }}>{stat.label}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>{stat.count} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</span></td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>{stat.promoted} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</span></td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right", fontWeight: "700", color: stat.rate > 20 ? "var(--success)" : "inherit" }}>
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
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: "600" }}>{stat.name}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>{stat.count} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</span></td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right" }}>{stat.promoted} <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</span></td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", textAlign: "right", fontWeight: "700" }}>{stat.rate.toFixed(1)}%</td>
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

function FunnelRow({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem", fontWeight: "600" }}>
        <span>{label}</span>
        <span>{value.toLocaleString()} 件 ({percentage.toFixed(1)}%)</span>
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
