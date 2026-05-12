import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostDetailView from "./PostDetailView";

export default async function SocialPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 1. 投稿内容と商材の全コンテキストを取得
  const post = await prisma.socialPost.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          painPoints: true,
          valueProps: true,
          ctas: true,
          ngExpressions: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="container">
      <PostDetailView post={post} />
    </div>
  );
}
