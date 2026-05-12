import { prisma } from "@/lib/prisma";
import PostForm from "./PostForm";

export default async function NewSocialPostPage() {
  // 1. 商材一覧を詳細情報（PainPoints, ValueProps等）とともに取得
  const products = await prisma.product.findMany({
    where: {
      status: "active",
    },
    include: {
      painPoints: true,
      valueProps: true,
      ctas: true,
      ngExpressions: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container">
      <PostForm products={products} />
    </div>
  );
}
