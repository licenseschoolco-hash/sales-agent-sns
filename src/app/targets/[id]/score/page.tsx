import { prisma } from "@/lib/prisma";
import { saveLeadScore } from "../../actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoringInput } from "@/lib/scoring/engine";

export default async function ScorePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ productId?: string }> }) {
  const { id } = await params;
  const { productId } = await searchParams;
  
  const target = await prisma.targetCompany.findUnique({ where: { id } });
  if (!target) notFound();

  const products = await prisma.product.findMany({ where: { status: 'active' } });
  const selectedProduct = productId ? products.find(p => p.id === productId) : null;

  async function handleAction(formData: FormData) {
    "use server";
    const pId = formData.get("productId") as string;
    const data: ScoringInput = {
      isHiring: formData.get("isHiring") === "on",
      hasHiringPage: formData.get("hasHiringPage") === "on",
      videoUsage: formData.get("videoUsage") as string,
      postFrequency: formData.get("postFrequency") as string,
      engagement: formData.get("engagement") as string,
      hasPhone: formData.get("hasPhone") === "on",
      hasContactForm: formData.get("hasContactForm") === "on",
      productFit: Number(formData.get("productFit")),
      hypothesisFit: Number(formData.get("hypothesisFit")),
    };
    await saveLeadScore(id, pId, data);
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <Link href={`/targets/${id}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← 詳細に戻る
        </Link>
        <h1>商材適合度の判定</h1>
        <p style={{ color: 'var(--text-muted)' }}>{target.name} に対する商材の提案価値をスコアリングします。</p>
      </header>

      <div className="card" style={{ maxWidth: '800px' }}>
        <form action={handleAction}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>判定対象の商材</label>
            <select 
              name="productId" 
              defaultValue={productId || ''} 
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={"window.location.href=`/targets/${id}/score?productId=${this.value}`" as any}
            >
              <option value="">商材を選択してください</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* 左カラム：基本チェック */}
            <section>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>基本状況</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="isHiring" /> 求人募集中
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="hasHiringPage" /> 独自の採用ページあり
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="hasPhone" defaultChecked={!!target.phone} /> 電話番号公開あり
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="hasContactForm" /> 問い合わせフォームあり
                </label>
              </div>

              <h3 style={{ fontSize: '1rem', marginTop: '2rem', marginBottom: '1rem' }}>SNS・発信状況</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>動画の活用度</label>
                  <select name="videoUsage" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <option value="none">未活用</option>
                    <option value="low">たまに活用</option>
                    <option value="medium">活用している</option>
                    <option value="high">積極的に活用</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>投稿頻度</label>
                  <select name="postFrequency" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <option value="none">なし</option>
                    <option value="monthly">月数回</option>
                    <option value="weekly">週1-2回</option>
                    <option value="daily">毎日</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>反応数 (Engagement)</label>
                  <select name="engagement" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <option value="low">少ない</option>
                    <option value="medium">普通</option>
                    <option value="high">多い</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 右カラム：定性評価 */}
            <section>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>商材適合度・一致度</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>商材との適合度 (1-10)</label>
                  <input type="range" name="productFit" min="1" max="10" defaultValue="5" style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>低い</span><span>高い</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>課題仮説との一致度 (1-10)</label>
                  <input type="range" name="hypothesisFit" min="1" max="10" defaultValue="5" style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>低い</span><span>高い</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '3rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.875rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>💡 ヒント:</p>
                <p>業種や採用状況、SNSでの発信頻度などを入力すると、独自のアルゴリズムでスコアと優先度を算出します。</p>
              </div>
            </section>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <Link href={`/targets/${id}`} className="btn" style={{ border: '1px solid var(--border)' }}>キャンセル</Link>
            <button type="submit" className="btn btn-primary" disabled={!products.length}>
              スコアを確定して保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
