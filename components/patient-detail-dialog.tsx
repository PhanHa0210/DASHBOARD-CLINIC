"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import type { PatientRecord } from "@/types/patient-record"

interface PatientDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  patientRecord: PatientRecord
}

export function PatientDetailDialog({ isOpen, onClose, patientRecord }: PatientDetailDialogProps) {
  const [isServiceExpanded, setIsServiceExpanded] = useState(false)
  const serviceTableRef = useRef<HTMLDivElement>(null)

  // Tự động cuộn xuống khi mở rộng phần dịch vụ
  useEffect(() => {
    if (isServiceExpanded && serviceTableRef.current) {
      setTimeout(() => {
        serviceTableRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 100)
    }
  }, [isServiceExpanded])

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  // Tính tổng tiền
  const totalAmount = patientRecord.services.reduce((sum, service) => sum + service.price, 0)

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Thông tin chi tiết bệnh nhân</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Thông tin cá nhân */}
            <div>
              <h3 className="text-sm font-medium mb-2 pb-1 border-b">Thông tin cá nhân</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Họ và tên</p>
                  <p>{patientRecord.patientInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Số điện thoại</p>
                  <p>{patientRecord.patientInfo.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Địa chỉ</p>
                  <p>{patientRecord.patientInfo.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Ghi chú</p>
                  <p className="whitespace-pre-wrap">{patientRecord.patientInfo.notes || "Không có ghi chú"}</p>
                </div>
              </div>
            </div>

            {/* Thông tin khám */}
            <div>
              <h3 className="text-sm font-medium mb-2 pb-1 border-b">Thông tin khám</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Ngày khám</p>
                  <p>{patientRecord.examinationDate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Số hóa đơn</p>
                  <p>{patientRecord.invoiceNumber}</p>
                </div>
              </div>
            </div>

            {/* Dịch vụ đã sử dụng - có thể đóng/mở */}
            <div>
              <button
                className="flex items-center justify-between w-full text-left text-sm font-medium mb-2 pb-1 border-b"
                onClick={() => setIsServiceExpanded(!isServiceExpanded)}
              >
                <span>Dịch vụ đã sử dụng</span>
                {isServiceExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isServiceExpanded && (
                <div ref={serviceTableRef} className="border rounded-md overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-1.5 px-3 border-b text-xs font-medium">STT</th>
                        <th className="text-left py-1.5 px-3 border-b text-xs font-medium">Tên dịch vụ</th>
                        <th className="text-right py-1.5 px-3 border-b text-xs font-medium">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientRecord.services.map((service, index) => (
                        <tr key={service.id} className="border-b">
                          <td className="py-1.5 px-3 text-xs">{index + 1}</td>
                          <td className="py-1.5 px-3 text-xs">{service.name}</td>
                          <td className="text-right py-1.5 px-3 text-xs">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              service.price,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="text-right font-medium py-1.5 px-3 text-xs">
                          Tổng cộng:
                        </td>
                        <td className="text-right font-bold py-1.5 px-3 text-primary text-xs">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Hiển thị tổng tiền ngay cả khi đóng bảng */}
              {!isServiceExpanded && (
                <div className="flex justify-between items-center text-sm px-1">
                  <span className="text-xs font-medium">Tổng cộng ({patientRecord.services.length} dịch vụ):</span>
                  <span className="font-bold text-primary">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-3 border-t bg-gray-50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
