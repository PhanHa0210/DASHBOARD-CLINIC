"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, X } from "lucide-react"
import type { Service } from "@/types/service"
import type { PatientInfo } from "@/types/patient"
import { ArrowLeft } from "lucide-react"
import { dentalServices } from "@/data/services"

interface RegistrationFormProps {
  initialServices: Service[]
  onSubmit: (data: PatientInfo, services: Service[]) => void
  onBack: () => void
}

export function RegistrationForm({ initialServices, onSubmit, onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState<PatientInfo>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })

  const [selectedServices, setSelectedServices] = useState<Service[]>(initialServices)
  const [searchQuery, setSearchQuery] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (selectedServices.length === 0) {
      newErrors.services = "Vui lòng chọn ít nhất một dịch vụ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData, selectedServices)
    }
  }

  const addService = (service: Service) => {
    if (!selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices((prev) => [...prev, service])
    }
  }

  const removeService = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((service) => service.id !== serviceId))
  }

  const filteredServices = dentalServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Thông tin đăng ký khám</CardTitle>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Địa chỉ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Dịch vụ đã chọn:</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Thêm dịch vụ
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Chọn dịch vụ</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="relative mb-4">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Tìm kiếm dịch vụ..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-[300px]">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead>Tên dịch vụ</TableHead>
                            <TableHead>Phân loại</TableHead>
                            <TableHead className="text-right">Giá</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredServices.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell className="font-medium">{service.name}</TableCell>
                              <TableCell>{service.category}</TableCell>
                              <TableCell className="text-right">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                  service.price,
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => addService(service)}
                                  disabled={selectedServices.some((s) => s.id === service.id)}
                                >
                                  Chọn
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredServices.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10">
                                <p className="text-muted-foreground">Không tìm thấy dịch vụ phù hợp</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {errors.services && <p className="text-red-500 text-sm mb-2">{errors.services}</p>}

            {selectedServices.length > 0 ? (
              <ul className="space-y-2 border rounded-md p-3">
                {selectedServices.map((service) => (
                  <li key={service.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="font-medium">{service.name}</span>
                      <p className="text-sm text-muted-foreground">{service.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(service.price)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeService(service.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
                <li className="flex justify-between items-center pt-2 font-medium">
                  <span>Tổng cộng:</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      selectedServices.reduce((sum, service) => sum + service.price, 0),
                    )}
                  </span>
                </li>
              </ul>
            ) : (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">Chưa có dịch vụ nào được chọn</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" /> Thêm dịch vụ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">{/* Dialog content same as above */}</DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Xác nhận và in hóa đơn
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
