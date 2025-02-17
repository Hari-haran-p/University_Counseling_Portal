"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";


function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  selected,
  onSelect,
  ...props
}) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newMonth = prevDate.getMonth() - 1;
      const newDate = new Date(prevDate.getFullYear(), newMonth);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newMonth = prevDate.getMonth() + 1;
      const newDate = new Date(prevDate.getFullYear(), newMonth);
      return newDate;
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const days = [];
  let currentWeek = [];

  // Add leading nulls for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    currentWeek.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    currentWeek.push(date);

    if (currentWeek.length === 7) {
      days.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add trailing nulls to complete the last week
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push(null);
  }

  if (currentWeek.length > 0) {
    days.push(currentWeek);
  }

  const isSameDay = (date1, date2) => {
    if (!date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleDayClick = (day) => {
    if (day && onSelect) {
      onSelect(day);
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' }); // Get the month name


  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-center pt-1 relative items-center">
        <button onClick={goToPreviousMonth} className={cn(buttonVariants({ variant: "outline" }),"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1")}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{`${monthName} ${year}`}</span> {/* Display the year */}
        <button onClick={goToNextMonth} className={cn(buttonVariants({ variant: "outline" }),"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1")}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="w-full border-collapse space-y-1">
        <div className="flex">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]">
              {day}
            </div>
          ))}
        </div>
        {days.map((week, i) => (
          <div key={i} className="flex w-full mt-2">
            {week.map((day, j) => (
              <button
                key={j}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-8 w-8 p-0 font-normal",
                  day
                    ? isSameDay(day, selected) // Type assertion here
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    : "text-muted-foreground opacity-50 cursor-default"
                )}
                onClick={() => handleDayClick(day)}
                disabled={!day}
              >
                {day ? day.getDate() : ""}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };