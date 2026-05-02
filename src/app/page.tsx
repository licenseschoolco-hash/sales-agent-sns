import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  // データの取得
  const productsCount = await prisma.product.count();
  const companiesCount = await prisma.targetCompany.count();
  const accountsCount = await prisma.targetAccount.count();
  const appointmentsCount = await prisma.appointment.count();

  // 最近のアクティビティ（アウトリーチログ）
  const recentLogs = await prisma.outreachLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      account: true,
      product: true,
    }
  });

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>ダッシュボード</h1>
        <p style={{ color: 'var(--text-muted)' }}>全体のアクティビティと成果の概要</p>
      </header>

      <div className="dashboard-grid">
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>管理商材数</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{productsCount}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ターゲット企業数</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{companiesCount}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>SNSアカウント数</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{accountsCount}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>獲得アポイント数</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>{appointmentsCount}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>最近のアウトリーチ状況</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ターゲット</th>
                <th>商材</th>
                <th>プラットフォーム</th>
                <th>ステータス</th>
                <th>日時</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.account.displayName}</td>
                  <td>{log.product.name}</td>
                  <td>{log.platform}</td>
                  <td>
                    <span className={`badge ${log.status === 'sent' ? 'badge-success' : 'badge-warning'}`}>
                      {log.status === 'sent' ? '送信済み' : '保留中'}
                    </span>
                  </td>
                  <td>{new Date(log.createdAt).toLocaleDateString('ja-JP')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
