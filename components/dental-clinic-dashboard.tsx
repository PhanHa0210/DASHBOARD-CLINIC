"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { RegistrationTab } from "@/components/registration-tab"
import { PatientsTab } from "@/components/patients-tab"
import { ServicesTab } from "@/components/services-tab"
import { loadServices } from "@/services/service-service"

export function DentalClinicDashboard() {
  const [activeTab, setActiveTab] = useState("registration")

  // Tải dữ liệu dịch vụ khi ứng dụng khởi động
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadServices()
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dịch vụ:", error)
      }
    }

    loadData()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-auto relative">
        <div className="p-4 md:p-6 h-full">
          {activeTab === "registration" && <RegistrationTab />}
          {activeTab === "patients" && <PatientsTab />}
          {activeTab === "services" && <ServicesTab />}
          {/* Other tabs can be added here */}
        </div>
      </div>
    </div>
  )
}
