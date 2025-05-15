"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllServices } from "@/services/service-service"
import type { Service } from "@/types/service"

export function ServiceList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    // Lấy dữ liệu dịch vụ từ service
    setServices(getAllServices())
  }, [])

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm dịch vụ..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="relative">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white">
            <TableRow>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead>Tên dịch vụ</TableHead>
              <TableHead className="text-right w-[150px]">Giá</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service, index) => (
              <TableRow key={service.id} className="hover:bg-gray-50">
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(service.price)}
                </TableCell>
              </TableRow>
            ))}

            {filteredServices.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <p className="text-muted-foreground">Không tìm thấy dịch vụ phù hợp</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
