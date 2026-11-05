import { ContentListSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return <ContentListSkeleton cards={9} label="Loading guides" />;
}
