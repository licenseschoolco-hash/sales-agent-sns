import { prisma } from "@/lib/prisma";
import { APPOINTMENT_OUTCOME } from "@/lib/constants/statuses";

export async function getPipelineReports() {
  const products = await prisma.product.findMany();
  
  // 1. 商材別集計
  const productPerformance = await Promise.all(products.map(async (product) => {
    const targetsCount = await prisma.leadScore.count({ where: { productId: product.id } });
    const draftsCount = await prisma.dmDraft.count({ where: { productId: product.id } });
    const approvedDraftsCount = await prisma.dmDraft.count({ where: { productId: product.id, status: 'approved' } });
    const repliesCount = await prisma.reply.count({ where: { productId: product.id } });
    const appointmentsCount = await prisma.appointment.count({ where: { productId: product.id } });
    const wonCount = await prisma.appointment.count({ where: { productId: product.id, outcome: APPOINTMENT_OUTCOME.WON } });
    const salesAmount = await prisma.appointment.aggregate({
      where: { productId: product.id, outcome: APPOINTMENT_OUTCOME.WON },
      _sum: { amount: true }
    });

    return {
      productId: product.id,
      name: product.name,
      targets: targetsCount,
      drafts: draftsCount,
      approvedDrafts: approvedDraftsCount,
      replies: repliesCount,
      appointments: appointmentsCount,
      won: wonCount,
      sales: salesAmount._sum.amount || 0,
      replyRate: draftsCount > 0 ? (repliesCount / draftsCount * 100).toFixed(1) : "0.0",
      wonRate: appointmentsCount > 0 ? (wonCount / appointmentsCount * 100).toFixed(1) : "0.0",
    };
  }));

  // 2. 業種別分析 (上位10件)
  const industries = await prisma.targetCompany.groupBy({
    by: ['industry'],
    _count: { id: true }
  });

  const industryPerformance = await Promise.all(industries.map(async (ind) => {
    const industryName = ind.industry;
    const targetsInIndustry = await prisma.targetCompany.findMany({
      where: { industry: industryName },
      select: { id: true }
    });
    const companyIds = targetsInIndustry.map(c => c.id);

    const repliesInIndustry = await prisma.reply.count({
      where: { targetCompanyId: { in: companyIds } }
    });
    const appointmentsInIndustry = await prisma.appointment.count({
      where: { targetCompanyId: { in: companyIds } }
    });

    return {
      industry: industryName,
      count: ind._count.id,
      replies: repliesInIndustry,
      appointments: appointmentsInIndustry,
      replyRate: ind._count.id > 0 ? (repliesInIndustry / ind._count.id * 100).toFixed(1) : "0.0",
    };
  }));

  // 3. 優先度別・文面タイプ別
  const priorityDistribution = await prisma.leadScore.groupBy({
    by: ['priority'],
    _count: { id: true }
  });

  const draftTypeDistribution = await prisma.dmDraft.groupBy({
    by: ['type'],
    _count: { id: true }
  });

  // 4. 失注理由ランキング
  const lostReasons = await prisma.appointment.groupBy({
    by: ['lostReason'],
    where: { outcome: APPOINTMENT_OUTCOME.LOST, NOT: { lostReason: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  // 5. 次回追客予定 (近日10件)
  const today = new Date();
  const replyFollowUps = await prisma.reply.findMany({
    where: { nextFollowUpDate: { gte: today } },
    include: { targetCompany: true },
    orderBy: { nextFollowUpDate: 'asc' },
    take: 10
  });

  const appointmentFollowUps = await prisma.appointment.findMany({
    where: { nextFollowUpDate: { gte: today } },
    include: { targetCompany: true },
    orderBy: { nextFollowUpDate: 'asc' },
    take: 10
  });

  // 予定を統合してソート
  const combinedFollowUps = [
    ...replyFollowUps.map(f => ({ 
      id: f.id, 
      companyName: f.targetCompany.name, 
      date: f.nextFollowUpDate!, 
      type: '返信後追客', 
      memo: f.nextAction 
    })),
    ...appointmentFollowUps.map(f => ({ 
      id: f.id, 
      companyName: f.targetCompany.name, 
      date: f.nextFollowUpDate!, 
      type: '商談後フォロー', 
      memo: f.memo 
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 10);

  return {
    productPerformance,
    industryPerformance: industryPerformance.sort((a, b) => b.count - a.count),
    priorityDistribution,
    draftTypeDistribution,
    lostReasons: lostReasons.map(r => ({ reason: r.lostReason!, count: r._count.id })),
    followUps: combinedFollowUps
  };
}
