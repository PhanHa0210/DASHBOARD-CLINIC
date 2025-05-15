"use client"

import { Button } from "@/components/ui/button"

interface FixedBottomButtonProps {
  onClick: () => void
}

export function FixedBottomButton({ onClick }: FixedBottomButtonProps) {
  return (
    <div className="sticky bottom-0 right-0 bg-white rounded-md p-4 flex justify-center z-10 w-full">
      <Button onClick={onClick} className="px-8 py-2 bg-blue-500 hover:bg-blue-600">
        Đặt lịch khám
      </Button>
    </div>
  )
}
