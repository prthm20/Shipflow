"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquarePlus,
  FileText,
  CheckSquare,
  GitBranch,
  GitPullRequest,
  CheckCircle,
  CreditCard,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const params = useParams<{ orgSlug?: string }>();
  const orgSlug = params?.orgSlug ?? "";

  const navigation = [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: `/${orgSlug}/dashboard`, icon: LayoutDashboard },
        { title: "Projects", url: `/${orgSlug}/projects`, icon: FolderKanban },
      ],
    },
    {
      label: "Workflow",
      items: [
        { title: "Feature Requests", url: `/${orgSlug}/features`, icon: MessageSquarePlus },
        { title: "PRDs", url: `/${orgSlug}/prds`, icon: FileText },
        { title: "Tasks", url: `/${orgSlug}/tasks`, icon: CheckSquare },
      ],
    },
    {
      label: "Engineering",
      items: [
        { title: "GitHub", url: `/${orgSlug}/github`, icon: GitBranch },
        { title: "Pull Requests", url: `/${orgSlug}/pull-requests`, icon: GitPullRequest },
        { title: "Reviews", url: `/${orgSlug}/reviews`, icon: CheckCircle },
      ],
    },
    {
      label: "Settings",
      items: [
        { title: "Billing", url: `/${orgSlug}/billing`, icon: CreditCard },
        { title: "Settings", url: `/${orgSlug}/settings`, icon: Settings },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">ShipFlow AI</p>
            <p className="text-xs text-muted-foreground">Feature to Production</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-3 text-xs text-muted-foreground">
          ShipFlow AI v1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}