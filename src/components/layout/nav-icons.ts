import {
  BarChart3,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Icons are referenced by name so nav config stays serializable across the server/client boundary. */
export const navIcons = {
  overview: LayoutDashboard,
  forms: FileText,
  submissions: Inbox,
  analytics: BarChart3,
  clients: Users,
  billing: CreditCard,
  settings: Settings,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof navIcons;
