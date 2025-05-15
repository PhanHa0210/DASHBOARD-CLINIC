"use client"

import { useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Service } from "@/types/service"
import type { PatientInfo } from "@/types/patient"
import { ArrowLeft, Printer } from "lucide-react"

interface InvoiceProps {
  patientInfo: PatientInfo
  services: Service[]
  onBack: () => void
}

export function Invoice({ patientInfo, services, onBack }: InvoiceProps) {
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
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Hóa đơn</CardTitle>
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            In hóa đơn
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div ref={invoiceRef} className="space-y-6 p-6 border rounded-lg bg-white">
          <div className="text-center">
            <h2 className="text-xl font-bold">PHÒNG KHÁM RĂNG HÀM MẶT</h2>
            <p className="text-sm text-muted-foreground">Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
            <p className="text-sm text-muted-foreground">Điện thoại: 028 1234 5678</p>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold">HÓA ĐƠN DỊCH VỤ</h1>
            <p className="text-sm">Số: {invoiceNumber}</p>
            <p className="text-sm">Ngày: {currentDate}</p>
          </div>

          <div className="space-y-2 p-4 rounded-md">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium">Họ và tên:</span>
              <span className="col-span-2">{patientInfo.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium">Số điện thoại:</span>
              <span className="col-span-2">{patientInfo.phone}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-medium">Địa chỉ:</span>
              <span className="col-span-2">{patientInfo.address}</span>
            </div>
            {patientInfo.notes && (
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium">Ghi chú:</span>
                <span className="col-span-2">{patientInfo.notes}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Chi tiết dịch vụ:</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-4 border-b">STT</th>
                    <th className="text-left py-2 px-4 border-b">Tên dịch vụ</th>
                    <th className="text-right py-2 px-4 border-b">Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={service.id} className="border-b">
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">{service.name}</td>
                      <td className="text-right py-2 px-4">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(service.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="text-right font-medium py-2 px-4">
                      Tổng cộng:
                    </td>
                    <td className="text-right font-bold py-2 px-4 text-primary">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        services.reduce((sum, service) => sum + service.price, 0),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="text-center">
              <p className="font-medium">Người lập phiếu</p>
              <p className="text-sm text-muted-foreground">(Ký, ghi rõ họ tên)</p>
              <div className="h-16"></div>
            </div>
            <div className="text-center">
              <p className="font-medium">Bệnh nhân</p>
              <p className="text-sm text-muted-foreground">(Ký, ghi rõ họ tên)</p>
              <div className="h-16"></div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
            <p>Chúc quý khách sức khỏe và hạnh phúc!</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          In hóa đơn
        </Button>
      </CardFooter>
    </Card>
  )
}
