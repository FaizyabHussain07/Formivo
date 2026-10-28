import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center px-4 py-12 focus:outline-none"
    >
      <Logo className="mb-8 text-lg" />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
