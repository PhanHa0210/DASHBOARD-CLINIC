import type { Service } from "@/types/service"
import * as XLSX from "xlsx"

// Dữ liệu mẫu để sử dụng khi không thể tải file CSV
const sampleServices: Service[] = [
  {
    id: "service-1",
    name: "Khám và tư vấn",
    description: "Khám tổng quát và tư vấn về tình trạng răng miệng",
    price: 200000,
    category: "Khám tổng quát",
  },
  {
    id: "service-2",
    name: "Cạo vôi răng",
    description: "Làm sạch cao răng và đánh bóng răng",
    price: 500000,
    category: "Vệ sinh răng miệng",
  },
  {
    id: "service-3",
    name: "Trám răng thẩm mỹ",
    description: "Trám răng bằng vật liệu composite màu trắng",
    price: 350000,
    category: "Phục hồi răng",
  },
  {
    id: "service-4",
    name: "Nhổ răng đơn giản",
    description: "Nhổ răng không cần phẫu thuật",
    price: 300000,
    category: "Nhổ răng",
  },
  {
    id: "service-5",
    name: "Nhổ răng khôn",
    description: "Phẫu thuật nhổ răng khôn",
    price: 1500000,
    category: "Phẫu thuật",
  },
  {
    id: "service-6",
    name: "Tẩy trắng răng",
    description: "Làm trắng răng bằng công nghệ hiện đại",
    price: 2500000,
    category: "Thẩm mỹ",
  },
  {
    id: "service-7",
    name: "Bọc răng sứ",
    description: "Bọc răng sứ thẩm mỹ cao cấp",
    price: 3000000,
    category: "Thẩm mỹ",
  },
  {
    id: "service-8",
    name: "Cấy ghép implant",
    description: "Cấy ghép implant titanium",
    price: 15000000,
    category: "Phẫu thuật",
  },
  {
    id: "service-9",
    name: "Niềng răng thẩm mỹ",
    description: "Niềng răng mắc cài kim loại hoặc sứ",
    price: 30000000,
    category: "Chỉnh nha",
  },
  {
    id: "service-10",
    name: "Điều trị tủy răng",
    description: "Điều trị tủy răng và trám bít ống tủy",
    price: 1200000,
    category: "Điều trị",
  },
  {
    id: "service-11",
    name: "Điều trị viêm nha chu",
    description: "Điều trị viêm nướu và nha chu",
    price: 800000,
    category: "Điều trị",
  },
  {
    id: "service-12",
    name: "Hàm giả tháo lắp",
    description: "Làm hàm giả tháo lắp một phần hoặc toàn phần",
    price: 5000000,
    category: "Phục hình",
  },
]

// Lưu trữ dữ liệu trong bộ nhớ
let services: Service[] = []

// Đọc file CSV
export async function loadServices(): Promise<Service[]> {
  try {
    // Thử tải file CSV
    const response = await fetch("/data/services.csv")

    if (!response.ok) {
      // Nếu không thể tải file CSV, sử dụng dữ liệu mẫu
      console.warn("Không thể tải file CSV, sử dụng dữ liệu mẫu thay thế")
      services = [...sampleServices]
      return services
    }

    const csvText = await response.text()
    services = parseCSV(csvText)
    return services
  } catch (error) {
    // Nếu có lỗi, sử dụng dữ liệu mẫu
    console.error("Error loading services:", error)
    services = [...sampleServices]
    return services
  }
}

// Phân tích chuỗi CSV thành mảng đối tượng
function parseCSV(csv: string): Service[] {
  const lines = csv.split("\n")

  // Bỏ qua hàng header
  const dataRows = lines.slice(1)

  return dataRows
    .filter((row) => row.trim() !== "")
    .map((row) => {
      const columns = parseCSVRow(row)

      if (columns.length < 5) return null

      return {
        id: columns[0],
        name: columns[1],
        description: columns[2],
        price: Number.parseInt(columns[3], 10),
        category: columns[4],
      }
    })
    .filter((service): service is Service => service !== null)
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

// Lấy tất cả dịch vụ
export function getAllServices(): Service[] {
  // Nếu chưa có dịch vụ nào, sử dụng dữ liệu mẫu
  if (services.length === 0) {
    services = [...sampleServices]
  }
  return [...services]
}

// Thêm dịch vụ mới
export function addService(service: Service): void {
  services.push(service)
}

// Cập nhật dịch vụ
export function updateService(id: string, updatedService: Partial<Service>): void {
  const index = services.findIndex((service) => service.id === id)
  if (index !== -1) {
    services[index] = { ...services[index], ...updatedService }
  }
}

// Xóa dịch vụ
export function deleteService(id: string): void {
  services = services.filter((service) => service.id !== id)
}

// Xuất dữ liệu ra file Excel
export function exportToExcel(): void {
  // Chuẩn bị dữ liệu cho Excel
  const data = services.map((service) => {
    return {
      ID: service.id,
      "Tên dịch vụ": service.name,
      "Mô tả": service.description,
      Giá: service.price,
      "Phân loại": service.category,
    }
  })

  // Tạo workbook và worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dịch vụ")

  // Tạo tên file với ngày hiện tại
  const now = new Date()
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const fileName = `danh-sach-dich-vu-${formattedDate}.xlsx`

  // Xuất file Excel
  XLSX.writeFile(workbook, fileName)
}

// Xuất dữ liệu ra file CSV
export function exportToCSV(): void {
  // Header
  const header = "ID,Tên dịch vụ,Mô tả,Giá,Phân loại"

  // Rows
  const rows = services.map((service) => {
    return [
      service.id,
      `"${service.name}"`,
      `"${service.description.replace(/"/g, '""')}"`,
      service.price,
      `"${service.category}"`,
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
  const fileName = `danh-sach-dich-vu-${formattedDate}.csv`

  link.setAttribute("href", url)
  link.setAttribute("download", fileName)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
