import { prisma } from "@/lib/prisma";
import { createCandidate } from "../actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewCandidatePage() {
  const products = await prisma.product.findMany();

  async function handleSubmit(formData: FormData) {
    "use server";
    await createCandidate({
      productId: formData.get("productId") as string,
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      platform: formData.get("platform") as string,
      accountId: formData.get("accountId") as string || undefined,
      profileUrl: formData.get("profileUrl") as string || undefined,
      industry: formData.get("industry") as string || undefined,
      followersCount: Number(formData.get("followersCount")) || undefined,
      bio: formData.get("bio") as string || undefined,
      source: "manual"
    });
    redirect("/discovery");
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link href="/discovery" style={{ color: 'var(--primary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
          ← 候補一覧に戻る
        </Link>
        <h1>新規リード候補の登録</h1>
        <p style={{ color: 'var(--text-muted)' }}>SNSで見つけた気になるアカウントを手動で登録します。</p>
      </header>

      <form action={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>名称 / アカウント名</label>
            <input name="name" type="text" required placeholder="例: さくら介護サービス" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>商材</label>
            <select name="productId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>種別</label>
            <select name="type" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
              <option value="company">企業</option>
              <option value="facility">施設</option>
              <option value="clinic">病院</option>
              <option value="professional">専門職</option>
              <option value="influencer">インフルエンサー</option>
              <option value="media">メディア</option>
              <option value="association">団体</option>
              <option value="referrer">紹介者</option>
              <option value="unknown">不明</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>プラットフォーム</label>
            <select name="platform" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}>
              <option value="X">X (旧Twitter)</option>
              <option value="Instagram">Instagram</option>
              <option value="Google">Google</option>
              <option value="Web">Webサイト</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>アカウントID</label>
            <input name="accountId" type="text" placeholder="例: @sakura_care" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>プロフィールURL</label>
            <input name="profileUrl" type="url" placeholder="https://..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>業種</label>
            <input name="industry" type="text" placeholder="例: 介護" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>フォロワー数</label>
            <input name="followersCount" type="number" placeholder="1000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>プロフィール / 備考</label>
          <textarea name="bio" rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Link href="/discovery" className="btn">キャンセル</Link>
          <button type="submit" className="btn btn-primary">登録する</button>
        </div>
      </form>
    </div>
  );
}
