import { prisma } from "@/lib/prisma";
import { addSearchQuery, deleteSearchQuery } from "../../../discovery/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductSearchQueriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { searchQueries: true }
  });

  if (!product) notFound();

  async function handleAdd(formData: FormData) {
    "use server";
    const platform = formData.get("platform") as string;
    const label = formData.get("label") as string;
    const query = formData.get("query") as string;
    await addSearchQuery(id, platform, label, query);
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/products/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← 商材詳細に戻る
        </Link>
        <h1>検索クエリの設定: {product.name}</h1>
        <p style={{ color: 'var(--text-muted)' }}>ターゲットを発掘するためのSNS検索キーワードを設定します。</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* 登録フォーム */}
        <section className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>新しいクエリを追加</h3>
          <form action={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>プラットフォーム</label>
              <select name="platform" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                <option value="X">X (旧Twitter)</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>ラベル（表示名）</label>
              <input name="label" type="text" placeholder="例: 求人 営業" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>検索キーワード / クエリ</label>
              <input name="query" type="text" placeholder="例: 求人 営業 募集" required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>追加する</button>
          </form>
        </section>

        {/* 一覧 */}
        <section className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>登録済みクエリ</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>プラットフォーム</th>
                  <th>ラベル</th>
                  <th>クエリ</th>
                  <th style={{ textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {product.searchQueries.map((sq) => (
                  <tr key={sq.id}>
                    <td><span className="badge badge-researching" style={{ fontSize: '0.7rem' }}>{sq.platform}</span></td>
                    <td>{sq.label}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{sq.query}</td>
                    <td style={{ textAlign: 'right' }}>
                      <form action={deleteSearchQuery.bind(null, sq.id, id)}>
                        <button type="submit" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>削除</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {product.searchQueries.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>登録されたクエリはありません</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
