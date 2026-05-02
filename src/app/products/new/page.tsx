import { createProduct } from "../actions";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/products" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← 商材一覧に戻る
        </Link>
        <h1>新規商材登録</h1>
      </header>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={createProduct}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>商材名</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="例: AIアニメ動画"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>スラッグ (URL用)</label>
            <input 
              name="slug" 
              type="text" 
              required 
              placeholder="例: ai-anime-video"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>商材説明</label>
            <textarea 
              name="description" 
              required 
              rows={4}
              placeholder="商材の特徴やメリットを記入してください"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>対象業界</label>
              <input 
                name="targetIndustry" 
                type="text" 
                required 
                placeholder="例: 介護, 美容, 飲食"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>価格帯</label>
              <input 
                name="priceRange" 
                type="text" 
                required 
                placeholder="例: 5万円〜30万円"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>ステータス</label>
            <select 
              name="status"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
            >
              <option value="active">稼働中</option>
              <option value="inactive">停止中</option>
              <option value="draft">下書き</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Link href="/products" className="btn" style={{ border: '1px solid var(--border)' }}>
              キャンセル
            </Link>
            <button type="submit" className="btn btn-primary">
              商材を登録する
            </button>
          </div>
        </form>
      </div>
      
      <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        ※ 課題仮説、提供価値、ターゲット属性などの詳細は、登録後の詳細画面から追加できます。
      </p>
    </div>
  );
}
