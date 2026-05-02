import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProductList() {
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: {
          leadScores: true,
          appointments: true,
        }
      }
    }
  });

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>商材一覧</h1>
          <p style={{ color: 'var(--text-muted)' }}>現在展開中の営業商材マスター</p>
        </div>
        <Link href="/products/new" className="btn btn-primary">+ 新規商材追加</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {products.map((product) => (
          <div key={product.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{product.name}</h2>
              <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                {product.status === 'active' ? '稼働中' : '停止中'}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', height: '3em', overflow: 'hidden' }}>
              {product.description}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ターゲット</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{product._count.leadScores}</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>アポ獲得</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>{product._count.appointments}</div>
              </div>
            </div>

            <Link href={`/products/${product.id}`} className="btn" style={{ width: '100%', border: '1px solid var(--border)' }}>
              詳細を見る
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
