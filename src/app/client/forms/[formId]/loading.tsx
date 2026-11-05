import { AppPageSkeleton } from "@/components/ui/page-skeletons";

export default function Loading() {
  return <AppPageSkeleton stats={3} rows={5} label="Loading form" />;
}
