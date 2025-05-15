"use client"

import { useState, useEffect } from "react"
import { ServiceList } from "@/components/service-list"
import { RegistrationDialog } from "@/components/registration-dialog"
import { InvoiceDialog } from "@/components/invoice-dialog"
import { Button } from "@/components/ui/button"
import type { Service } from "@/types/service"
import type { PatientInfo } from "@/types/patient"
import type { PatientRecord } from "@/types/patient-record"
import { addPatientRecord } from "@/services/patient-service"

// Interface for storing invoice counter data
interface InvoiceCounter {
  date: string
  counter: number
}

export function RegistrationTab() {
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceCounter, setInvoiceCounter] = useState<InvoiceCounter>({ date: "", counter: 0 })

  // Initialize or update invoice counter from localStorage
  useEffect(() => {
    // Get current date in GMT+7 (Vietnam timezone)
    const now = new Date()
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000) // Add 7 hours for GMT+7
    const currentDate = vietnamTime.toISOString().split("T")[0] // Format as YYYY-MM-DD

    try {
      // Try to get stored counter from localStorage
      const storedCounter = localStorage.getItem("invoiceCounter")

      if (storedCounter) {
        const parsedCounter: InvoiceCounter = JSON.parse(storedCounter)

        // If it's a new day, reset counter to 0
        if (parsedCounter.date !== currentDate) {
          const newCounter = { date: currentDate, counter: 0 }
          setInvoiceCounter(newCounter)
          localStorage.setItem("invoiceCounter", JSON.stringify(newCounter))
        } else {
          // Use existing counter for the current day
          setInvoiceCounter(parsedCounter)
        }
      } else {
        // Initialize counter if not exists
        const newCounter = { date: currentDate, counter: 0 }
        setInvoiceCounter(newCounter)
        localStorage.setItem("invoiceCounter", JSON.stringify(newCounter))
      }
    } catch (error) {
      console.error("Error managing invoice counter:", error)
      // Fallback to a new counter
      const newCounter = { date: currentDate, counter: 0 }
      setInvoiceCounter(newCounter)
    }
  }, [])

  const handleBookAppointment = () => {
    setIsRegistrationDialogOpen(true)
  }

  const handleRegistrationDialogClose = () => {
    setIsRegistrationDialogOpen(false)
  }

  const handleFormSubmit = (data: PatientInfo, services: Service[]) => {
    setPatientInfo(data)
    setSelectedServices(services)
    setIsRegistrationDialogOpen(false)

    // Get current date in GMT+7 (Vietnam timezone)
    const now = new Date()
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000) // Add 7 hours for GMT+7
    const currentDate = vietnamTime.toISOString().split("T")[0] // Format as YYYY-MM-DD

    // Format date components for invoice number
    const day = String(vietnamTime.getDate()).padStart(2, "0")
    const month = String(vietnamTime.getMonth() + 1).padStart(2, "0")
    const year = String(vietnamTime.getFullYear()).slice(-2)

    // Increment counter
    const nextCounter = invoiceCounter.counter + 1
    const sequenceNumber = String(nextCounter).padStart(2, "0")

    // Update counter in state and localStorage
    const newCounter = { date: currentDate, counter: nextCounter }
    setInvoiceCounter(newCounter)
    localStorage.setItem("invoiceCounter", JSON.stringify(newCounter))

    // Set invoice number in format DDMMYY-XX
    const newInvoiceNumber = `${day}${month}${year}-${sequenceNumber}`
    setInvoiceNumber(newInvoiceNumber)

    // Create and save patient record
    const patientRecord: PatientRecord = {
      id: `record-${Date.now()}`,
      patientInfo: data,
      services: services,
      examinationDate: vietnamTime.toLocaleDateString("vi-VN"),
      invoiceNumber: newInvoiceNumber,
      createdAt: Date.now(),
    }

    // Lưu vào bộ nhớ
    addPatientRecord(patientRecord)

    setIsInvoiceDialogOpen(true)
  }

  const handleInvoiceDialogClose = () => {
    setIsInvoiceDialogOpen(false)
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex-1 pb-20">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h2 className="text-2xl font-bold">Đăng ký khám</h2>
        </div>

        <ServiceList />
      </div>

      <div className="sticky bottom-0 right-0 bg-white rounded-md p-4 flex justify-center z-10 w-full">
        <Button onClick={handleBookAppointment} className="px-8 py-2 bg-blue-500 hover:bg-blue-600">
          Đặt lịch khám
        </Button>
      </div>

      <RegistrationDialog
        isOpen={isRegistrationDialogOpen}
        onClose={handleRegistrationDialogClose}
        onSubmit={handleFormSubmit}
      />

      {patientInfo && (
        <InvoiceDialog
          isOpen={isInvoiceDialogOpen}
          onClose={handleInvoiceDialogClose}
          patientInfo={patientInfo}
          services={selectedServices}
          invoiceNumber={invoiceNumber}
        />
      )}
    </div>
  )
}
