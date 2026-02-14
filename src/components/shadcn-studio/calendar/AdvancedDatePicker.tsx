'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdvancedDatePickerProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  fromYear?: number
  toYear?: number
  className?: string
}

export function AdvancedDatePicker({
  selected,
  onSelect,
  fromYear = 1950,
  toYear = new Date().getFullYear(),
  className
}: AdvancedDatePickerProps) {
  const [selectedYear, setSelectedYear] = useState<number>(selected?.getFullYear() || toYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(selected?.getMonth() || new Date().getMonth())

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i)
  const months = [
    { value: 0, label: "Januari" },
    { value: 1, label: "Februari" },
    { value: 2, label: "Maret" },
    { value: 3, label: "April" },
    { value: 4, label: "Mei" },
    { value: 5, label: "Juni" },
    { value: 6, label: "Juli" },
    { value: 7, label: "Agustus" },
    { value: 8, label: "September" },
    { value: 9, label: "Oktober" },
    { value: 10, label: "November" },
    { value: 11, label: "Desember" },
  ]

  const currentMonth = new Date(selectedYear, selectedMonth, 1)

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year)
    setSelectedYear(newYear)
  }

  const handleMonthChange = (month: string) => {
    const newMonth = parseInt(month)
    setSelectedMonth(newMonth)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (onSelect) {
      onSelect(date)
    }
  }

  return (
    <div className={className}>
      {/* Year and Month Selectors */}
      <div className="flex gap-2 mb-4 px-4 pt-4">
        <div className="flex-1">
          <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleDateSelect}
        month={currentMonth}
        fromDate={new Date(fromYear, 0, 1)}
        toDate={new Date(toYear, 11, 31)}
        className="w-full"
      />
    </div>
  )
}

