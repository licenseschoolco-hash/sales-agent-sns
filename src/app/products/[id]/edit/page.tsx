import { prisma } from "@/lib/prisma";
import { updateProduct } from "../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  // updateProductにIDを渡すためのクロージャ
  const updateProductWithId = updateProduct.bind(null, id);

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/products/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← 商材詳細に戻る
        </Link>
        <h1>商材情報の編集</h1>
      </header>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={updateProductWithId}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>商材名</label>
            <input 
              name="name" 
              type="text" 
              defaultValue={product.name}
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>スラッグ (URL用)</label>
            <input 
              name="slug" 
              type="text" 
              defaultValue={product.slug}
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>商材説明</label>
            <textarea 
              name="description" 
              defaultValue={product.description}
              required 
              rows={4}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>対象業界</label>
              <input 
                name="targetIndustry" 
                type="text" 
                defaultValue={product.targetIndustry}
                required 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>価格帯</label>
              <input 
                name="priceRange" 
                type="text" 
                defaultValue={product.priceRange}
                required 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>ステータス</label>
            <select 
              name="status"
              defaultValue={product.status}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value="active">稼働中</option>
              <option value="inactive">停止中</option>
              <option value="draft">下書き</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href={`/products/${id}`} className="btn" style={{ border: '1px solid var(--border)' }}>
              キャンセル
            </Link>
            <button type="submit" className="btn btn-primary">
              変更を保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
