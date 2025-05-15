import type { PatientRecord } from "@/types/patient-record"
import type { Service } from "@/types/service"
import { dentalServices } from "@/data/services"
import * as XLSX from "xlsx"

// Lưu trữ dữ liệu trong bộ nhớ
let patientRecords: PatientRecord[] = []

// Đọc file CSV
export async function loadPatientRecords(): Promise<PatientRecord[]> {
  try {
    const response = await fetch("/data/patients.csv")
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    patientRecords = parseCSV(csvText)
    return patientRecords
  } catch (error) {
    console.error("Error loading patient records:", error)
    return []
  }
}

// Phân tích chuỗi CSV thành mảng đối tượng
function parseCSV(csv: string): PatientRecord[] {
  const lines = csv.split("\n")

  // Bỏ qua hàng header
  const dataRows = lines.slice(1)

  return dataRows
    .filter((row) => row.trim() !== "")
    .map((row) => {
      const columns = parseCSVRow(row)

      if (columns.length < 9) return null

      // Tìm dịch vụ từ danh sách có sẵn
      const serviceNames = columns[7].split(";")
      const services: Service[] = serviceNames.map((name) => {
        const service = dentalServices.find((s) => s.name === name.trim())
        return (
          service || {
            id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            description: "",
            price: 0,
            category: "",
          }
        )
      })

      return {
        id: columns[0],
        patientInfo: {
          name: columns[1],
          phone: columns[2],
          address: columns[3],
          notes: columns[4],
        },
        examinationDate: columns[5],
        invoiceNumber: columns[6],
        services,
        createdAt: Number(columns[9]) || Date.now(),
      }
    })
    .filter((record): record is PatientRecord => record !== null)
}

// Hàm trợ giúp để phân tích hàng CSV có xem xét các trường được trích dẫn
function parseCSVRow(row: string): string[] {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (char === '"') {
      // Xử lý dấu ngoặc kép thoát (hai dấu ngoặc kép liên tiếp)
      if (i + 1 < row.length && row[i + 1] === '"') {
        current += '"'
        i++ // Bỏ qua dấu ngoặc kép tiếp theo
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // Kết thúc trường
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  // Thêm trường cuối cùng
  result.push(current)

  return result
}

// Lấy tất cả bản ghi
export function getAllPatientRecords(): PatientRecord[] {
  return [...patientRecords]
}

// Thêm bản ghi mới
export function addPatientRecord(record: PatientRecord): void {
  patientRecords.push(record)
}

// Cập nhật bản ghi
export function updatePatientRecord(id: string, updatedRecord: Partial<PatientRecord>): void {
  const index = patientRecords.findIndex((record) => record.id === id)
  if (index !== -1) {
    patientRecords[index] = { ...patientRecords[index], ...updatedRecord }
  }
}

// Xóa bản ghi
export function deletePatientRecord(id: string): void {
  patientRecords = patientRecords.filter((record) => record.id !== id)
}

// Xuất dữ liệu ra file Excel
export function exportToExcel(): void {
  // Chuẩn bị dữ liệu cho Excel
  const data = patientRecords.map((record) => {
    const totalAmount = record.services.reduce((sum, s) => sum + s.price, 0)

    return {
      ID: record.id,
      "Họ và tên": record.patientInfo.name,
      "Số điện thoại": record.patientInfo.phone,
      "Địa chỉ": record.patientInfo.address,
      "Ghi chú": record.patientInfo.notes || "",
      "Ngày khám": record.examinationDate,
      "Số hóa đơn": record.invoiceNumber,
      "Dịch vụ": record.services.map((s) => s.name).join(", "),
      "Tổng tiền": totalAmount,
      "Ngày tạo": new Date(record.createdAt).toLocaleString("vi-VN"),
    }
  })

  // Tạo workbook và worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bệnh nhân")

  // Tạo tên file với ngày hiện tại
  const now = new Date()
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const fileName = `danh-sach-benh-nhan-${formattedDate}.xlsx`

  // Xuất file Excel
  XLSX.writeFile(workbook, fileName)
}

// Xuất dữ liệu ra file CSV
export function exportToCSV(): void {
  // Header
  const header = "ID,Họ và tên,Số điện thoại,Địa chỉ,Ghi chú,Ngày khám,Số hóa đơn,Dịch vụ,Tổng tiền,Ngày tạo"

  // Rows
  const rows = patientRecords.map((record) => {
    const services = record.services.map((s) => s.name).join(";")
    const totalAmount = record.services.reduce((sum, s) => sum + s.price, 0)

    return [
      record.id,
      `"${record.patientInfo.name}"`,
      `"${record.patientInfo.phone}"`,
      `"${record.patientInfo.address.replace(/"/g, '""')}"`,
      `"${record.patientInfo.notes?.replace(/"/g, '""') || ""}"`,
      `"${record.examinationDate}"`,
      `"${record.invoiceNumber}"`,
      `"${services}"`,
      totalAmount,
      record.createdAt,
    ].join(",")
  })

  // Combine header and rows
  const csvContent = [header, ...rows].join("\n")

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  // Tạo tên file với ngày hiện tại
  const now = new Date()
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const fileName = `danh-sach-benh-nhan-${formattedDate}.csv`

  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
