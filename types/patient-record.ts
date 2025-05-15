import type { PatientInfo } from "./patient"
import type { Service } from "./service"

export interface PatientRecord {
  id: string
  patientInfo: PatientInfo
  services: Service[]
  examinationDate: string
  invoiceNumber: string
  createdAt: number
}
