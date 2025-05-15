"use client"

import { useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Service } from "@/types/service"
import type { PatientInfo } from "@/types/patient"
import { Printer, X } from "lucide-react"

interface InvoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  patientInfo: PatientInfo
  services: Service[]
  invoiceNumber: string
}

export function InvoiceDialog({ isOpen, onClose, patientInfo, services, invoiceNumber }: InvoiceDialogProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = invoiceRef.current
    if (!printContent) return

    const originalContents = document.body.innerHTML
    const printContents = printContent.innerHTML

    document.body.innerHTML = `
      <div style="width: 148mm; height: 210mm; padding: 10mm; margin: 0 auto;">
        ${printContents}
      </div>
    `

    window.print()
    document.body.innerHTML = originalContents
    window.location.reload()
  }

  const currentDate = new Date().toLocaleDateString("vi-VN")

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-[650px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-3 border-b">
          <DialogTitle className="text-lg">Hóa đơn</DialogTitle>
          <DialogClose className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <div className="p-4">
            <div ref={invoiceRef} className="space-y-4 p-4 border rounded-lg bg-white text-sm">
              <div className="text-center">
                <h2 className="text-lg font-bold">PHÒNG KHÁM RĂNG HÀM MẶT</h2>
                <p className="text-xs text-muted-foreground">Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                <p className="text-xs text-muted-foreground">Điện thoại: 028 1234 5678</p>
              </div>

              <div className="text-center">
                <h1 className="text-lg font-bold">HÓA ĐƠN DỊCH VỤ</h1>
                <p className="text-xs">Số: {invoiceNumber}</p>
                <p className="text-xs">Ngày: {currentDate}</p>
              </div>

              <div className="space-y-1 p-3 rounded-md">
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-medium text-xs">Họ và tên:</span>
                  <span className="col-span-2 text-xs">{patientInfo.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-medium text-xs">Số điện thoại:</span>
                  <span className="col-span-2 text-xs">{patientInfo.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-medium text-xs">Địa chỉ:</span>
                  <span className="col-span-2 text-xs">{patientInfo.address}</span>
                </div>
                {patientInfo.notes && (
                  <div className="grid grid-cols-3 gap-1">
                    <span className="font-medium text-xs">Ghi chú:</span>
                    <span className="col-span-2 text-xs">{patientInfo.notes}</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2 text-xs">Chi tiết dịch vụ:</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="text-left py-1 px-2 border-b">STT</th>
                        <th className="text-left py-1 px-2 border-b">Tên dịch vụ</th>
                        <th className="text-right py-1 px-2 border-b">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service, index) => (
                        <tr key={service.id} className="border-b">
                          <td className="py-1 px-2">{index + 1}</td>
                          <td className="py-1 px-2">{service.name}</td>
                          <td className="text-right py-1 px-2">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
                              .format(service.price)
                              .replace("₫", "đ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} className="text-right font-medium py-1 px-2">
                          Tổng cộng:
                        </td>
                        <td className="text-right font-bold py-1 px-2 text-primary">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
                            .format(services.reduce((sum, service) => sum + service.price, 0))
                            .replace("₫", "đ")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="font-medium text-xs">Người lập phiếu</p>
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                  <div className="h-12"></div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-xs">Bệnh nhân</p>
                  <p className="text-xs text-muted-foreground">(Ký, ghi rõ họ tên)</p>
                  <div className="h-12"></div>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                <p>Chúc quý khách sức khỏe và hạnh phúc!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-3 border-t bg-gray-50 sticky bottom-0">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Đóng
          </Button>
          <Button onClick={handlePrint} className="px-6 bg-blue-500 hover:bg-blue-600" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            In hóa đơn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
