"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Save, X, FileSpreadsheet, FileText, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { PatientRecord } from "@/types/patient-record"
import {
  loadPatientRecords,
  getAllPatientRecords,
  updatePatientRecord,
  deletePatientRecord,
  exportToExcel,
  exportToCSV,
} from "@/services/patient-service"
import { PatientDetailDialog } from "@/components/patient-detail-dialog"

export function PatientsTab() {
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<PatientRecord | null>(null)
  const [editedNotes, setEditedNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Tải dữ liệu từ file CSV khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await loadPatientRecords()
        setRecords(getAllPatientRecords())
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bệnh nhân:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRecords = records.filter(
    (record) =>
      record.patientInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patientInfo.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.patientInfo.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (record: PatientRecord) => {
    setCurrentRecord(record)
    setEditedNotes(record.patientInfo.notes || "")
    setIsEditDialogOpen(true)
  }

  const handleViewDetail = (record: PatientRecord) => {
    setCurrentRecord(record)
    setIsDetailDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bệnh nhân này?")) {
      deletePatientRecord(id)
      setRecords(getAllPatientRecords())
    }
  }

  const handleSaveNotes = () => {
    if (currentRecord) {
      updatePatientRecord(currentRecord.id, {
        patientInfo: {
          ...currentRecord.patientInfo,
          notes: editedNotes,
        },
      })
      setRecords(getAllPatientRecords())
      setIsEditDialogOpen(false)
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

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Danh sách bệnh nhân</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleExportToCSV}
              className="flex items-center"
              disabled={isLoading || records.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Xuất CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              className="flex items-center"
              disabled={isLoading || records.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm bệnh nhân..."
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
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Ngày khám</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="w-[120px] text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record, index) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{record.patientInfo.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{record.patientInfo.address}</TableCell>
                      <TableCell>{record.patientInfo.phone}</TableCell>
                      <TableCell>{record.examinationDate}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {record.patientInfo.notes || "Không có ghi chú"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewDetail(record)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Xem chi tiết</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(record)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Chỉnh sửa</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(record.id)}
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
                    <TableCell colSpan={7} className="text-center py-10">
                      <p className="text-muted-foreground">Không tìm thấy bệnh nhân nào</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Dialog chỉnh sửa ghi chú */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Chỉnh sửa thông tin bệnh nhân</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          {currentRecord && (
            <div className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Họ và tên
                    </Label>
                    <div className="mt-1 text-sm">{currentRecord.patientInfo.name}</div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Số điện thoại
                    </Label>
                    <div className="mt-1 text-sm">{currentRecord.patientInfo.phone}</div>
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-sm font-medium">
                      Ngày khám
                    </Label>
                    <div className="mt-1 text-sm">{currentRecord.examinationDate}</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    Địa chỉ
                  </Label>
                  <div className="mt-1 text-sm">{currentRecord.patientInfo.address}</div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Ghi chú
                  </Label>
                  <Textarea
                    id="notes"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Nhập ghi chú về bệnh nhân..."
                    className="mt-1 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSaveNotes} className="bg-blue-500 hover:bg-blue-600">
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết bệnh nhân */}
      {currentRecord && (
        <PatientDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          patientRecord={currentRecord}
        />
      )}
    </div>
  )
}
