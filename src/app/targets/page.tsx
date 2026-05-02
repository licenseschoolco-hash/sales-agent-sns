import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TargetList({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const products = await prisma.product.findMany();
  const selectedProductId = resolvedSearchParams.productId || products[0]?.id;

  // 選択された商材に基づいたターゲットとスコアを取得
  const leadScores = await prisma.leadScore.findMany({
    where: selectedProductId ? { productId: selectedProductId } : {},
    include: {
      account: {
        include: {
          company: true,
        }
      },
      product: true,
    },
    orderBy: { totalScore: 'desc' },
  });

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>ターゲット一覧</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>商材で絞り込み:</span>
            <select 
              defaultValue={selectedProductId}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={`window.location.href='/targets?productId=' + this.value` as any}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              // Note: Using standard HTML/JS for quick filter without complexity for now
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onInput={"window.location.href='/targets?productId=' + this.value" as any}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>企業 / アカウント</th>
                <th>プラットフォーム</th>
                <th style={{ textAlign: 'center' }}>スコア</th>
                <th>ステータス</th>
                <th>次回アクション</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {leadScores.map((ls) => (
                <tr key={ls.id}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{ls.account.company.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{ls.account.displayName}</div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {ls.account.platform}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontWeight: '700', 
                      fontSize: '1.125rem',
                      color: ls.totalScore >= 80 ? 'var(--success)' : ls.totalScore >= 60 ? 'var(--warning)' : 'var(--text-main)'
                    }}>
                      {ls.totalScore}
                    </div>
                  </td>
                  <td>
                    {/* ここでは簡略化のため、最新のアウトリーチ状況をステータスとする */}
                    <span className="badge badge-neutral">未アプローチ</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>
                      DM生成・承認待ち
                    </div>
                  </td>
                  <td>
                    <Link href={`/targets/${ls.account.id}`} className="btn" style={{ fontSize: '0.75rem', border: '1px solid var(--border)' }}>
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
