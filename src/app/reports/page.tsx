import { getPipelineReports } from "@/lib/reports/aggregator";

export default async function ReportsPage() {
  const data = await getPipelineReports();

  const totalSales = data.productPerformance.reduce((acc, p) => acc + p.sales, 0);
  const totalTargets = data.productPerformance.reduce((acc, p) => acc + p.targets, 0);
  const totalWon = data.productPerformance.reduce((acc, p) => acc + p.won, 0);

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>営業レポート</h1>
        <p style={{ color: 'var(--text-muted)' }}>全商材・全プロセスの成果可視化</p>
      </header>

      {/* サマリーKPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>総売上</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>¥{totalSales.toLocaleString()}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ターゲット総数</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{totalTargets.toLocaleString()}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>成約総数</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669' }}>{totalWon.toLocaleString()}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>平均成約率</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {totalTargets > 0 ? (totalWon / totalTargets * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* 商材別パフォーマンス */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>商材別パイプライン成果</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>商材名</th>
                <th style={{ textAlign: 'center' }}>ターゲット</th>
                <th style={{ textAlign: 'center' }}>DM作成</th>
                <th style={{ textAlign: 'center' }}>承認済み</th>
                <th style={{ textAlign: 'center' }}>返信数</th>
                <th style={{ textAlign: 'center' }}>アポ数</th>
                <th style={{ textAlign: 'center' }}>成約数</th>
                <th style={{ textAlign: 'right' }}>売上</th>
              </tr>
            </thead>
            <tbody>
              {data.productPerformance.map((p) => (
                <tr key={p.productId}>
                  <td><strong>{p.name}</strong></td>
                  <td style={{ textAlign: 'center' }}>{p.targets}</td>
                  <td style={{ textAlign: 'center' }}>{p.drafts}</td>
                  <td style={{ textAlign: 'center' }}>{p.approvedDrafts}</td>
                  <td style={{ textAlign: 'center' }}>{p.replies} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({p.replyRate}%)</span></td>
                  <td style={{ textAlign: 'center' }}>{p.appointments}</td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: '#059669', fontWeight: '700' }}>{p.won}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>¥{p.sales.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* 業種別返信率 */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>業種別アプローチ状況</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.industryPerformance.slice(0, 5).map((ind) => (
              <div key={ind.industry}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span>{ind.industry}</span>
                  <span style={{ fontWeight: '600' }}>{ind.replies}返信 / {ind.count}件 ({ind.replyRate}%)</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${ind.replyRate}%`, background: 'var(--primary)', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 優先度分布 & 文面タイプ */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>リード優先度分布</h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end', height: '150px', padding: '0 1rem' }}>
            {['S', 'A', 'B', 'C'].map(prio => {
              const count = data.priorityDistribution.find(d => d.priority === prio)?._count.id || 0;
              const max = Math.max(...data.priorityDistribution.map(d => d._count.id), 1);
              const height = (count / max) * 100;
              return (
                <div key={prio} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count}</div>
                  <div style={{ width: '100%', height: `${height}%`, background: prio === 'S' ? '#ef4444' : prio === 'A' ? '#f59e0b' : 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ fontWeight: '700' }}>{prio}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* 失注理由ランキング */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>失注理由ランキング</h3>
          {data.lostReasons.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>データなし</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.lostReasons.map((r, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.875rem' }}>{r.reason}</span>
                  <span style={{ fontWeight: '700' }}>{r.count}件</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 次回追客予定一覧 */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>次回追客予定 (近日)</h3>
          <div className="table-container">
            <table style={{ fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th>予定日</th>
                  <th>企業名</th>
                  <th>種別</th>
                  <th>メモ</th>
                </tr>
              </thead>
              <tbody>
                {data.followUps.map((f) => (
                  <tr key={f.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(f.date).toLocaleDateString('ja-JP')}</td>
                    <td><strong>{f.companyName}</strong></td>
                    <td><span className="badge badge-researching" style={{ fontSize: '0.7rem' }}>{f.type}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{f.memo || '-'}</td>
                  </tr>
                ))}
                {data.followUps.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>予定はありません</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
