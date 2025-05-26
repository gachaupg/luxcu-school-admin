
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Users, Route, Settings, Report, Trip, Overview } from "lucide-react";

const menu = [
  { label: "Overview", icon: Overview, href: "/", active: true, },
  { label: "Trips", icon: Trip, href: "#" },
  { label: "Routes", icon: Route, href: "#" },
  { label: "Students", icon: Users, href: "#" },
  { label: "Staff", icon: Users, href: "#" },
  { label: "Parents", icon: Users, href: "#" },
  { label: "Vehicles", icon: Trip, href: "#" },
  { label: "Reports", icon: Report, href: "#" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex flex-col h-full justify-between pt-4">
        {/* Logo */}
        <div className="mb-8 px-6 flex items-center gap-2">
          <div className="rounded-full bg-green-100 p-2">
            <svg width="28" height="28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#22c55e" strokeWidth="2" />
              <path d="M14 9v7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="17.5" r="1.5" fill="#22c55e"/>
            </svg>
          </div>
          <span className="font-extrabold text-lg">
            <span className="text-black">Lux</span>
            <span className="text-green-500">Cab</span>
          </span>
        </div>
        {/* Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menu.map((item) => (
                  <SidebarMenuItem
                    key={item.label}
                    className={`mb-1 rounded-lg ${item.active ? "bg-green-500/90 text-white" : "text-gray-800 hover:bg-gray-100"}`}
                  >
                    <SidebarMenuButton asChild>
                      <a href={item.href} className="flex items-center gap-3 px-4 py-2 w-full">
                        <item.icon size={20} className={item.active ? "text-white" : "text-gray-700"} />
                        <span className="font-medium">{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {/* Settings at the bottom */}
        <SidebarFooter>
          <a
            href="#"
            className="flex items-center gap-3 px-6 py-3 mb-4 rounded-lg hover:bg-gray-100 transition text-gray-700 w-full"
          >
            <Settings size={20}/>
            <span className="font-medium">Settings</span>
          </a>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

