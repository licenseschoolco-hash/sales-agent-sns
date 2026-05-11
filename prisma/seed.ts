import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 シードデータ投入開始...");

  // --- 商材マスター ---
  const aiAnime = await prisma.product.create({
    data: {
      name: "AIアニメ動画",
      slug: "ai-anime-video",
      description: "AIを活用した高品質なアニメーション動画制作サービス。SNS広告、採用動画、サービス紹介に最適。",
      targetIndustry: "全業界（特に介護・美容・飲食）",
      priceRange: "5万円〜30万円",
      status: "active",
      painPoints: {
        create: [
          { painPoint: "動画制作の外注コストが高い（1本30万円以上）", severity: 5, sortOrder: 1 },
          { painPoint: "SNSの投稿がテキストばかりで埋もれる", severity: 4, sortOrder: 2 },
          { painPoint: "採用動画を作りたいが予算がない", severity: 4, sortOrder: 3 },
        ],
      },
      valueProps: {
        create: [
          { proposition: "1本5万円から高品質アニメ動画を制作", evidence: "従来の1/6 of costs", sortOrder: 1 },
          { proposition: "最短3日で納品可能", evidence: "AI活用により制作期間を大幅短縮", sortOrder: 2 },
          { proposition: "SNSエンゲージメント率が平均3倍向上", evidence: "導入企業50社の実績データ", sortOrder: 3 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "AI電話",
      slug: "ai-phone",
      description: "AIによる自動電話応対サービス。予約受付、問い合わせ対応、リマインドコールを24時間自動化。",
      targetIndustry: "医療・介護・美容・飲食",
      priceRange: "月額3万円〜10万円",
      status: "active",
      painPoints: {
        create: [
          { painPoint: "電話対応に人手を取られ、本来の業務に集中できない", severity: 5, sortOrder: 1 },
          { painPoint: "営業時間外の電話を取りこぼしている", severity: 4, sortOrder: 2 },
          { painPoint: "予約の電話対応ミスでダブルブッキングが発生", severity: 3, sortOrder: 3 },
        ],
      },
      valueProps: {
        create: [
          { proposition: "24時間365日、AIが電話対応", evidence: "応答率99.5%を実現", sortOrder: 1 },
          { proposition: "月額3万円から導入可能", evidence: "人件費の1/10以下", sortOrder: 2 },
          { proposition: "予約管理システムと自動連携", evidence: "ダブルブッキング0件を実現", sortOrder: 3 },
        ],
      },
    },
  });

  // --- ターゲット企業 ---
  const companies = await Promise.all([
    prisma.targetCompany.create({
      data: { name: "さくら介護サービス", industry: "介護", website: "https://sakura-care.example.com", employeeCount: "50-100名", address: "東京都世田谷区" },
    }),
    prisma.targetCompany.create({
      data: { name: "ビューティーサロン Luxe", industry: "美容", website: "https://luxe-beauty.example.com", employeeCount: "10-30名", address: "大阪府大阪市" },
    }),
    prisma.targetCompany.create({
      data: { name: "焼肉ダイニング 炎", industry: "飲食", website: "https://homura-yakiniku.example.com", employeeCount: "30-50名", address: "福岡県福岡市" },
    }),
  ]);

  // --- ターゲットアカウント ---
  await Promise.all([
    prisma.targetAccount.create({
      data: { companyId: companies[0].id, platform: "X", accountId: "@sakura_care_tokyo", displayName: "さくら介護｜採用担当 田中", role: "採用担当", profileUrl: "https://x.com/sakura_care_tokyo", followersCount: 1200, bio: "介護業界で働く仲間を募集中！" },
    }),
    prisma.targetAccount.create({
      data: { companyId: companies[1].id, platform: "Instagram", accountId: "@luxe_beauty_osaka", displayName: "Luxe Beauty Salon", role: "オーナー", profileUrl: "https://instagram.com/luxe_beauty_osaka", followersCount: 8500, bio: "大阪梅田の隠れ家サロン✨" },
    }),
  ]);

  // --- リードスコア ---
  await prisma.leadScore.create({
    data: { 
      targetCompanyId: companies[0].id, 
      productId: aiAnime.id, 
      totalScore: 82, 
      isHiring: true,
      hasHiringPage: true,
      videoUsage: "none",
      postFrequency: "weekly",
      engagement: "medium",
      hasPhone: true,
      productFit: 9,
      hypothesisFit: 8,
      priority: "A",
      reason: "求人募集中のため採用動画のニーズが高い。動画未活用で改善余地大。",
      nextAction: "1週間以内にDM送信。事例紹介を中心に。",
      status: "scored"
    },
  });

  console.log("✅ シードデータ投入完了！");
}

main()
  .catch((e) => {
    console.error("❌ シード投入エラー:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
