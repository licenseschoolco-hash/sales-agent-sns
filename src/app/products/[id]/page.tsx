import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct, addPainPoint, addValueProp, addTargetRole, addCTA, addNGExpression } from "../actions";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      painPoints: { orderBy: { sortOrder: 'asc' } },
      valueProps: { orderBy: { sortOrder: 'asc' } },
      targetRoles: { orderBy: { priority: 'desc' } },
      ctas: { orderBy: { sortOrder: 'asc' } },
      ngExpressions: true,
    }
  });

  if (!product) notFound();

  // 削除アクションのバインド
  const deleteProductWithId = deleteProduct.bind(null, id);

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/products" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← 商材一覧に戻る
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>{product.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ID: {product.id} / Slug: {product.slug}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href={`/products/${id}/edit`} className="btn" style={{ border: '1px solid var(--border)' }}>
              編集
            </Link>
            <form action={deleteProductWithId} onSubmit={(e) => { if(!confirm('本当に削除しますか？')) e.preventDefault(); }}>
              <button type="submit" className="btn" style={{ border: '1px solid #fee2e2', color: '#ef4444' }}>削除</button>
            </form>
            <Link href={`/products/${id}/search-queries`} className="btn" style={{ border: '1px solid var(--border)' }}>
              発掘クエリ設定
            </Link>
            <Link href={`/targets?productId=${product.id}`} className="btn btn-primary">
              ターゲット一覧
            </Link>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* 左カラム */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* 基本情報 */}
          <section className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>基本情報</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>商材概要</label>
              <p style={{ lineHeight: '1.6' }}>{product.description}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>対象業界</label>
                <p>{product.targetIndustry}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>価格帯</label>
                <p>{product.priceRange}</p>
              </div>
            </div>
          </section>

          {/* 対象担当者属性 */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <h3>対象者の属性</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {product.targetRoles.map((role) => (
                <li key={role.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span>{role.roleName}</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-secondary)' }}>優先度: {role.priority}</span>
                </li>
              ))}
            </ul>
            <form action={async (formData) => { "use server"; await addTargetRole(id, formData.get("roleName") as string, Number(formData.get("priority"))); }} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input name="roleName" placeholder="役割名" required style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <input name="priority" type="number" defaultValue="3" style={{ width: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>追加</button>
            </form>
          </section>

          {/* NG表現 */}
          <section className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>NG表現</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {product.ngExpressions.map((ng) => (
                <span key={ng.id} style={{ background: '#fff1f2', color: '#e11d48', padding: '4px 12px', borderRadius: '16px', fontSize: '0.875rem', border: '1px solid #ffe4e6' }} title={ng.reason || ''}>
                  {ng.phrase}
                </span>
              ))}
            </div>
            <form action={async (formData) => { "use server"; await addNGExpression(id, formData.get("phrase") as string, formData.get("reason") as string); }} style={{ display: 'flex', gap: '0.5rem' }}>
              <input name="phrase" placeholder="禁止フレーズ" required style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>追加</button>
            </form>
          </section>
        </div>

        {/* 右カラム */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* 提供価値 */}
          <section className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>提供価値 (Value Props)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {product.valueProps.map((vp) => (
                <div key={vp.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{vp.proposition}</strong>
                  {vp.evidence && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>根拠: {vp.evidence}</p>}
                </div>
              ))}
            </div>
            <form action={async (formData) => { "use server"; await addValueProp(id, formData.get("proposition") as string, formData.get("evidence") as string); }} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input name="proposition" placeholder="提供価値のタイトル" required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <input name="evidence" placeholder="実績・根拠（任意）" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <button type="submit" className="btn btn-primary">提供価値を追加</button>
            </form>
          </section>

          {/* 課題仮説 */}
          <section className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>顧客の課題 (Pain Points)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {product.painPoints.map((pp) => (
                <div key={pp.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ 
                    background: pp.severity >= 4 ? '#fee2e2' : '#f1f5f9', 
                    color: pp.severity >= 4 ? '#ef4444' : '#64748b',
                    width: '24px', height: '24px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0
                  }}>{pp.severity}</span>
                  <span style={{ fontSize: '0.875rem' }}>{pp.painPoint}</span>
                </div>
              ))}
            </div>
            <form action={async (formData) => { "use server"; await addPainPoint(id, formData.get("painPoint") as string, Number(formData.get("severity"))); }} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <input name="painPoint" placeholder="想定課題" required style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <select name="severity" style={{ width: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button type="submit" className="btn btn-primary">追加</button>
            </form>
          </section>

          {/* CTA */}
          <section className="card">
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>CTA (行動喚起)</h3>
            {product.ctas.map((cta) => (
              <div key={cta.id} style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{cta.title}</strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{cta.text}</p>
              </div>
            ))}
            <form action={async (formData) => { "use server"; await addCTA(id, formData.get("title") as string, formData.get("text") as string); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input name="title" placeholder="CTAタイトル" required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
              <textarea name="text" placeholder="DMで使用する文言" required rows={2} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'inherit' }}></textarea>
              <button type="submit" className="btn btn-primary">CTAを追加</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
