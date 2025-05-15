"use client"

import { Home, CalendarDays, Users, ClipboardList, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "home", label: "Trang chủ", icon: Home },
    { id: "registration", label: "Đăng ký khám", icon: CalendarDays },
    { id: "patients", label: "Bệnh nhân", icon: Users },
    { id: "services", label: "Dịch vụ", icon: ClipboardList },
    { id: "settings", label: "Cài đặt", icon: Settings },
  ]

  return (
    <div className="bg-white shadow-sm w-64 flex flex-col h-full">
      <div className="p-4 flex items-center justify-center border-b">
        <h1 className="font-bold text-xl text-primary">Nha Khoa</h1>
      </div>
      <nav className="flex-1 pt-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className="w-full justify-start px-4"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                <span>{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="text-sm text-muted-foreground">Phòng khám răng hàm mặt</div>
      </div>
    </div>
  )
}
