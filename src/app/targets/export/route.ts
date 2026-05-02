import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const targets = await prisma.targetCompany.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      "ID", "会社名", "業種", "地域", "担当者名", "SNS URL", "WebサイトURL", 
      "求人ページURL", "電話番号", "メール", "メモ", "ステータス", "作成日"
    ];

    const rows = targets.map(t => [
      t.id,
      t.name,
      t.industry,
      t.region || "",
      t.contactName || "",
      t.snsUrl || "",
      t.website || "",
      t.jobPageUrl || "",
      t.phone || "",
      t.email || "",
      (t.notes || "").replace(/\n/g, " "),
      t.status,
      t.createdAt.toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // UTF-8 with BOM for Excel compatibility
    const bom = "\uFEFF";
    return new NextResponse(bom + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="targets_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Export failed", { status: 500 });
  }
}
