"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import type { Service } from "@/types/service"
import type { PatientInfo } from "@/types/patient"
import { getAllServices } from "@/services/service-service"

interface RegistrationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PatientInfo, services: Service[]) => void
}

export function RegistrationDialog({ isOpen, onClose, onSubmit }: RegistrationDialogProps) {
  const [formData, setFormData] = useState<PatientInfo>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [services, setServices] = useState<Service[]>([])

  // Lấy danh sách dịch vụ khi component được mount
  useEffect(() => {
    setServices(getAllServices())
  }, [isOpen]) // Cập nhật khi dialog mở để lấy dữ liệu mới nhất

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })

    // Clear service error if any
    if (errors.services) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.services
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ"
    }

    if (selectedServiceIds.length === 0) {
      newErrors.services = "Vui lòng chọn ít nhất một dịch vụ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id))
      onSubmit(formData, selectedServices)

      // Reset form
      setFormData({
        name: "",
        phone: "",
        address: "",
        notes: "",
      })
      setSelectedServiceIds([])
      setSearchQuery("")
      setErrors({})
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalAmount = services
    .filter((service) => selectedServiceIds.includes(service.id))
    .reduce((sum, service) => sum + service.price, 0)

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-[650px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-3 border-b">
          <DialogTitle className="text-lg">Đăng ký khám</DialogTitle>
          <DialogClose className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6 p-4">
              {/* Left column - Patient information */}
              <div className="space-y-4">
                <h3 className="font-medium text-base">Thông tin cá nhân</h3>

                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-sm">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address" className="text-sm">
                    Địa chỉ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                </div>
              </div>

              {/* Right column - Service selection */}
              <div className="space-y-4">
                <h3 className="font-medium text-base">
                  Chọn dịch vụ <span className="text-red-500">*</span>
                </h3>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm dịch vụ..."
                    className="pl-8 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {errors.services && <p className="text-red-500 text-xs">{errors.services}</p>}

                <div className="border rounded-md">
                  <ScrollArea className="h-[200px]">
                    <div className="p-1">
                      {filteredServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-start space-x-2 p-2 border-b hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id={`service-${service.id}`}
                            checked={selectedServiceIds.includes(service.id)}
                            onCheckedChange={() => handleServiceToggle(service.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <label htmlFor={`service-${service.id}`} className="font-medium text-sm cursor-pointer">
                                {service.name}
                              </label>
                              <span className="font-medium whitespace-nowrap text-sm">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
                                  .format(service.price)
                                  .replace("₫", "đ")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                          </div>
                        </div>
                      ))}

                      {filteredServices.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground text-sm">Không tìm thấy dịch vụ phù hợp</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex justify-between items-center font-medium text-base">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">
                    {totalAmount === 0
                      ? "0 đ"
                      : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
                          .format(totalAmount)
                          .replace("₫", "đ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-3 border-t bg-gray-50">
              <Button type="button" variant="outline" onClick={onClose} size="sm">
                Hủy
              </Button>
              <Button type="submit" className="px-6 bg-blue-500 hover:bg-blue-600" size="sm">
                Xác nhận và in hóa đơn
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
