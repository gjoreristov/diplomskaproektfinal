"use client";

import { User } from "@/types";
import { LaptopIcon, ServerIcon, UsersIcon, HomeIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: User | null;
  isAdmin: boolean;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export function Sidebar({ user, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const sidebarItems: SidebarItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
    },
    {
      name: "Devices",
      href: "/devices",
      icon: LaptopIcon,
    },
    {
      name: "Servers",
      href: "/servers",
      icon: ServerIcon,
      adminOnly: true,
    },
    {
      name: "Users",
      href: "/users",
      icon: UsersIcon,
      adminOnly: true,
    },
  ];

  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/login");
  };

  return (
    <div className="flex flex-col w-64 bg-card text-card-foreground border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-semibold">Network Manager</h1>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="px-4 py-2 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user?.name.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.role || "role"}</p>
            </div>
          </div>
        </div>
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            {sidebarItems
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
        <div className="mt-auto px-2 py-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-secondary hover:text-secondary-foreground transition-colors"
          >
            <LogOutIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}