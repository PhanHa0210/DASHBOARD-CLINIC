"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Save, X, FileSpreadsheet, FileText, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Service } from "@/types/service"
import {
  loadServices,
  getAllServices,
  addService,
  updateService,
  deleteService,
  exportToExcel,
  exportToCSV,
} from "@/services/service-service"

export function ServicesTab() {
  const [services, setServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)
  const [editedService, setEditedService] = useState<Service>({
    id: "",
    name: "",
    description: "",
    price: 0,
    category: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Tải dữ liệu từ file CSV khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await loadServices()
        setServices(getAllServices())
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dịch vụ:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (service: Service) => {
    setCurrentService(service)
    setEditedService({ ...service })
    setIsEditDialogOpen(true)
  }

  const handleAdd = () => {
    setEditedService({
      id: `service-${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      category: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      deleteService(id)
      setServices(getAllServices())
    }
  }

  const validateForm = (service: Service) => {
    const newErrors: Record<string, string> = {}

    if (!service.name.trim()) {
      newErrors.name = "Vui lòng nhập tên dịch vụ"
    }

    if (!service.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả dịch vụ"
    }

    if (!service.category.trim()) {
      newErrors.category = "Vui lòng nhập phân loại dịch vụ"
    }

    if (service.price <= 0) {
      newErrors.price = "Giá dịch vụ phải lớn hơn 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveEdit = () => {
    if (currentService && validateForm(editedService)) {
      updateService(currentService.id, editedService)
      setServices(getAllServices())
      setIsEditDialogOpen(false)
    }
  }

  const handleSaveAdd = () => {
    if (validateForm(editedService)) {
      addService(editedService)
      setServices(getAllServices())
      setIsAddDialogOpen(false)
    }
  }

  const handleExportToExcel = () => {
    try {
      exportToExcel()
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error)
      alert("Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại sau.")
    }
  }

  const handleExportToCSV = () => {
    try {
      exportToCSV()
    } catch (error) {
      console.error("Lỗi khi xuất CSV:", error)
      alert("Có lỗi xảy ra khi xuất file CSV. Vui lòng thử lại sau.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Xử lý đặc biệt cho trường giá
    if (name === "price") {
      setEditedService({
        ...editedService,
        [name]: Number.parseInt(value, 10) || 0,
      })
    } else {
      setEditedService({
        ...editedService,
        [name]: value,
      })
    }

    // Xóa lỗi khi người dùng nhập
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Danh sách dịch vụ</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleExportToCSV}
              className="flex items-center"
              disabled={isLoading || services.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Xuất CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              className="flex items-center"
              disabled={isLoading || services.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            <Button onClick={handleAdd} className="flex items-center bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Thêm dịch vụ
            </Button>
          </div>
        </div>
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

      <div className="bg-white rounded-lg shadow-sm">
        <div className="relative">
          <div className="h-[calc(100vh-280px)] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow>
                  <TableHead className="w-[60px] text-center">STT</TableHead>
                  <TableHead>Tên dịch vụ</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Phân loại</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="w-[120px] text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service, index) => (
                    <TableRow key={service.id} className="hover:bg-gray-50">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{service.description}</TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(service.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(service)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Chỉnh sửa</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(service.id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-muted-foreground">Không tìm thấy dịch vụ nào</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Dialog chỉnh sửa dịch vụ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          {currentService && (
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Tên dịch vụ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={editedService.name}
                    onChange={handleInputChange}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Mô tả <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editedService.description}
                    onChange={handleInputChange}
                    className={errors.description ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium">
                    Phân loại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={editedService.category}
                    onChange={handleInputChange}
                    className={errors.category ? "border-red-500" : ""}
                  />
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label htmlFor="price" className="text-sm font-medium">
                    Giá (VNĐ) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={editedService.price}
                    onChange={handleInputChange}
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveEdit} className="bg-blue-500 hover:bg-blue-600">
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog thêm dịch vụ mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Thêm dịch vụ mới</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-name" className="text-sm font-medium">
                  Tên dịch vụ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-name"
                  name="name"
                  value={editedService.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="add-description" className="text-sm font-medium">
                  Mô tả <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="add-description"
                  name="description"
                  value={editedService.description}
                  onChange={handleInputChange}
                  className={errors.description ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="add-category" className="text-sm font-medium">
                  Phân loại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-category"
                  name="category"
                  value={editedService.category}
                  onChange={handleInputChange}
                  className={errors.category ? "border-red-500" : ""}
                />
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="add-price" className="text-sm font-medium">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="add-price"
                  name="price"
                  type="number"
                  value={editedService.price}
                  onChange={handleInputChange}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveAdd} className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Thêm dịch vụ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
