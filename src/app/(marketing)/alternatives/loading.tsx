import { ContentListSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return <ContentListSkeleton cards={5} label="Loading comparisons" />;
}
