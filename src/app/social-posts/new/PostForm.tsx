"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  POST_STATUS, 
  POST_PLATFORM_VALUES, 
  POST_CATEGORY_VALUES,
  getPostStatusMeta,
  getPostPlatformMeta,
  getPostCategoryMeta
} from "@/lib/constants/post-constants";
import { createSocialPost } from "../actions";

// 型定義
interface ProductWithDetails {
  id: string;
  name: string;
  description: string;
  targetIndustry: string;
  priceRange: string;
  painPoints: { id: string; painPoint: string }[];
  valueProps: { id: string; proposition: string }[];
  ctas: { id: string; title: string; text: string }[];
  ngExpressions: { id: string; phrase: string }[];
}

export default function PostForm({ products }: { products: ProductWithDetails[] }) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  
  // フォームステート
  const [formData, setFormData] = useState({
    productId: "",
    platform: "",
    category: "",
    status: POST_STATUS.DRAFT as string,
    ctaLabel: "",
    ctaUrl: "",
    scheduledDate: "",
  });

  // 商材選択時の挙動
  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
    setFormData(prev => ({ ...prev, productId }));

    // 初回セット時のみ CTA を自動挿入
    if (product && product.ctas && product.ctas.length > 0) {
      setFormData(prev => ({
        ...prev,
        ctaLabel: product.ctas[0].title,
        ctaUrl: product.ctas[0].text,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createSocialPost({
      ...formData,
      content,
    });

    if (res.success) {
      router.push("/social-posts");
    } else {
      setError(res.error || "保存に失敗しました。");
      setLoading(false);
    }
  };

  // 商材参照パネルの共通表示
  const renderProductReference = () => {
    if (!selectedProduct) {
      return (
        <div style={{ color: "var(--muted)", textAlign: "center", padding: "2rem 0" }}>
          まず商材を選択してください
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <section>
          <h3 style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.25rem" }}>商材名 / 概要</h3>
          <p style={{ fontWeight: "bold" }}>{selectedProduct.name}</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>{selectedProduct.description}</p>
        </section>

        <section>
          <h3 style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "0.25rem" }}>ターゲット / 価格</h3>
          <p style={{ fontSize: "0.875rem" }}>業界: {selectedProduct.targetIndustry}</p>
          <p style={{ fontSize: "0.875rem" }}>価格: {selectedProduct.priceRange}</p>
        </section>

        {selectedProduct.painPoints.length > 0 && (
          <section>
            <h3 style={{ fontSize: "0.875rem", color: "#b91c1c", marginBottom: "0.5rem" }}>解決する悩み (Pain Points)</h3>
            <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem", margin: 0 }}>
              {selectedProduct.painPoints.map(p => <li key={p.id} style={{ marginBottom: "0.25rem" }}>{p.painPoint}</li>)}
            </ul>
          </section>
        )}

        {selectedProduct.valueProps.length > 0 && (
          <section>
            <h3 style={{ fontSize: "0.875rem", color: "#166534", marginBottom: "0.5rem" }}>独自の強み (Value Props)</h3>
            <ul style={{ fontSize: "0.875rem", paddingLeft: "1.25rem", margin: 0 }}>
              {selectedProduct.valueProps.map(v => <li key={v.id} style={{ marginBottom: "0.25rem" }}>{v.proposition}</li>)}
            </ul>
          </section>
        )}

        {selectedProduct.ngExpressions.length > 0 && (
          <section style={{ backgroundColor: "#fef2f2", padding: "0.75rem", borderRadius: "4px", border: "1px solid #fee2e2" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#991b1b", marginBottom: "0.5rem" }}>⚠️ NG表現</h3>
            <ul style={{ fontSize: "0.825rem", paddingLeft: "1.25rem", margin: 0, color: "#991b1b" }}>
              {selectedProduct.ngExpressions.map(n => <li key={n.id} style={{ marginBottom: "0.25rem" }}>{n.phrase}</li>)}
            </ul>
          </section>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "start" }}>
      <style>{`
        .reference-desktop { display: block; }
        .reference-mobile { display: none; }
        @media (max-width: 768px) {
          .reference-desktop { display: none !important; }
          .reference-mobile { display: block !important; margin-top: 1rem; }
        }
      `}</style>

      {/* 左側: 投稿フォーム */}
      <section style={{ flex: "1 1 600px", minWidth: "0" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/social-posts" style={{ fontSize: "0.875rem", color: "var(--muted)" }}>← 一覧へ戻る</Link>
          <h1 style={{ marginTop: "0.5rem" }}>新規投稿案の作成</h1>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: "2rem" }}>
          {error && (
            <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>商材 *</label>
              <select 
                required 
                className="input" 
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">商材を選択してください</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* スマホ用参照パネル (商材選択欄の直下) */}
              <div className="reference-mobile" style={{ borderLeft: "4px solid var(--primary)", paddingLeft: "1rem", backgroundColor: "var(--bg-main)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <h4 style={{ fontSize: "0.875rem", color: "var(--primary)", marginBottom: "0.75rem" }}>商材参照 (スマホ版)</h4>
                {renderProductReference()}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>ステータス *</label>
              <select 
                required 
                className="input" 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: "100%" }}
              >
                {[POST_STATUS.DRAFT, POST_STATUS.APPROVED].map(s => (
                  <option key={s} value={s}>{getPostStatusMeta(s).label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>プラットフォーム *</label>
              <select 
                required 
                className="input" 
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                style={{ width: "100%" }}
              >
                <option value="">選択してください</option>
                {POST_PLATFORM_VALUES.map(p => (
                  <option key={p} value={p}>{getPostPlatformMeta(p).label}</option>
                ))}
              </select>
              {formData.platform === "X" && (
                <p style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "0.25rem" }}>※Xは140文字程度の短めな投稿を推奨します。</p>
              )}
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>カテゴリ *</label>
              <select 
                required 
                className="input" 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: "100%" }}
              >
                <option value="">選択してください</option>
                {POST_CATEGORY_VALUES.map(c => (
                  <option key={c} value={c}>{getPostCategoryMeta(c).label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontWeight: "bold" }}>投稿本文 *</label>
              <span style={{ fontSize: "0.75rem", color: content.length > 500 ? "var(--danger)" : "var(--muted)" }}>
                {content.length} 文字
              </span>
            </div>
            <textarea 
              required
              rows={8}
              className="input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="投稿内容を入力してください..."
              style={{ width: "100%", lineHeight: "1.6" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>CTAラベル</label>
              <input 
                type="text" 
                className="input" 
                value={formData.ctaLabel}
                onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                placeholder="無料診断はこちら"
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>CTA URL</label>
              <input 
                type="url" 
                className="input" 
                value={formData.ctaUrl}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                placeholder="https://..."
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>投稿予定日</label>
            <input 
              type="date" 
              className="input" 
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", textAlign: "right" }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}
            >
              {loading ? "保存中..." : "投稿案を保存する"}
            </button>
          </div>
        </form>
      </section>

      {/* 右側: 商材参照パネル (PC用) */}
      <aside className="card reference-desktop" style={{ flex: "1 1 300px", maxWidth: "400px", minWidth: "0", padding: "1.5rem", position: "sticky", top: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "2px solid var(--primary)", paddingBottom: "0.5rem" }}>
          商材カンニングペーパー
        </h2>
        {renderProductReference()}
      </aside>
    </div>
  );
}
