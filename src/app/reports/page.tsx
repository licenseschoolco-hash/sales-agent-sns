import { prisma } from "@/lib/prisma";

export default async function Reports() {
  const products = await prisma.product.findMany();
  
  // 各商材のパイプラインデータを集計
  const pipelineData = await Promise.all(products.map(async (product) => {
    const totalTargets = await prisma.leadScore.count({ where: { productId: product.id } });
    const highPotential = await prisma.leadScore.count({ where: { productId: product.id, totalScore: { gte: 80 } } });
    const sent = await prisma.outreachLog.count({ where: { productId: product.id, status: 'sent' } });
    const positiveReplies = await prisma.reply.count({ 
      where: { 
        outreachLog: { productId: product.id },
        replyType: 'positive'
      } 
    });
    const appointments = await prisma.appointment.count({ where: { productId: product.id } });

    return {
      name: product.name,
      totalTargets,
      highPotential,
      sent,
      positiveReplies,
      appointments,
      conversionRate: sent > 0 ? ((appointments / sent) * 100).toFixed(1) : 0
    };
  }));

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>レポート</h1>
        <p style={{ color: 'var(--text-muted)' }}>商材別のパイプライン成果分析</p>
      </header>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>商材別パフォーマンス</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>商材名</th>
                <th style={{ textAlign: 'center' }}>ターゲット</th>
                <th style={{ textAlign: 'center' }}>高確度 (80+)</th>
                <th style={{ textAlign: 'center' }}>送信済み</th>
                <th style={{ textAlign: 'center' }}>ポジ返信</th>
                <th style={{ textAlign: 'center' }}>アポ獲得</th>
                <th style={{ textAlign: 'center' }}>CVR (アポ/送信)</th>
              </tr>
            </thead>
            <tbody>
              {pipelineData.map((data) => (
                <tr key={data.name}>
                  <td><strong>{data.name}</strong></td>
                  <td style={{ textAlign: 'center' }}>{data.totalTargets}</td>
                  <td style={{ textAlign: 'center' }}>{data.highPotential}</td>
                  <td style={{ textAlign: 'center' }}>{data.sent}</td>
                  <td style={{ textAlign: 'center' }}>{data.positiveReplies}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>{data.appointments}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600' }}>{data.conversionRate}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>週次アポイント推移 (モック)</h3>
          <div style={{ height: '200px', background: 'var(--bg-main)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '1rem', gap: '0.5rem' }}>
            {[2, 5, 3, 8, 4, 6, 7].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h * 10}%`, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>4/20</span>
            <span>4/21</span>
            <span>4/22</span>
            <span>4/23</span>
            <span>4/24</span>
            <span>4/25</span>
            <span>Today</span>
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>返信理由の内訳 (モック)</h3>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>興味あり</span>
              <span style={{ fontWeight: '600' }}>45%</span>
            </li>
            <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>価格が高い</span>
              <span style={{ fontWeight: '600' }}>20%</span>
            </li>
            <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>時期尚早</span>
              <span style={{ fontWeight: '600' }}>15%</span>
            </li>
            <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>その他</span>
              <span style={{ fontWeight: '600' }}>20%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
