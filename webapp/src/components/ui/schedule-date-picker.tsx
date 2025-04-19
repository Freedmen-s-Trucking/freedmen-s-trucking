import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
 
export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()
 
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-full p-4 bg-[#F2E7D8] rounded-2xl text-left font-mobile text-[14px] text-mobile-text flex items-center gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          {date ? format(date, "PPP") : <span>DD/MM/YYYY</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#F2E7D8] border-none rounded-2xl" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="bg-[#F2E7D8] rounded-2xl border-none"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}