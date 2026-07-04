import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  endOfLocalDayIso,
  formatDateRange,
  formatTaskDate,
  startOfLocalDayIso,
} from "@/utils/date";

interface DateRangeCalendarProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (startDate: string | null, endDate: string | null) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function sameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function calendarDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const cursor = new Date(first);
  cursor.setDate(cursor.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() + index);
    return day;
  });
}

export function DateRangeCalendar({
  startDate,
  endDate,
  onChange,
}: DateRangeCalendarProps) {
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  useEffect(() => {
    if (!startDate) return;
    const date = new Date(startDate);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [startDate]);

  const days = useMemo(() => calendarDays(visibleMonth), [visibleMonth]);
  const selectedStart = startDate ? new Date(startDate) : null;
  const selectedEnd = endDate ? new Date(endDate) : null;

  function selectDay(day: Date) {
    if (
      !selectedStart ||
      selectedEnd ||
      day.getTime() < selectedStart.getTime()
    ) {
      onChange(startOfLocalDayIso(day), null);
      return;
    }
    onChange(startDate, endOfLocalDayIso(day));
  }

  function selectPreset(dayOffset: number) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    onChange(startOfLocalDayIso(date), endOfLocalDayIso(date));
  }

  function moveMonth(offset: number) {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  return (
    <View className="rounded-[28px] bg-elevated p-4">
      <View className="flex-row items-center justify-between px-1">
        <View>
          <Text className="text-xs font-bold uppercase tracking-[2px] text-accent">
            Schedule
          </Text>
          <Text className="mt-1 text-base font-bold text-cream">
            {formatDateRange(startDate, endDate)}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            accessibilityLabel="Previous month"
            className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-70"
            onPress={() => moveMonth(-1)}
          >
            <Text className="text-2xl text-cream">‹</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Next month"
            className="h-10 w-10 items-center justify-center rounded-full bg-surface active:opacity-70"
            onPress={() => moveMonth(1)}
          >
            <Text className="text-2xl text-cream">›</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-surface px-4 py-3">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-muted">
            Starts
          </Text>
          <Text className="mt-1 text-sm font-bold text-cream">
            {startDate ? formatTaskDate(startDate) : "Not set"}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-surface px-4 py-3">
          <Text className="text-[10px] font-bold uppercase tracking-[2px] text-muted">
            Ends
          </Text>
          <Text className="mt-1 text-sm font-bold text-cream">
            {endDate ? formatTaskDate(endDate) : "Choose date"}
          </Text>
        </View>
      </View>

      <Text className="mt-5 text-center text-lg font-extrabold text-cream">
        {visibleMonth.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        })}
      </Text>

      <View className="mt-4 flex-row">
        {WEEKDAYS.map((weekday, index) => (
          <View
            className="w-[14.285%] items-center"
            key={`${weekday}-${index}`}
          >
            <Text className="text-xs font-bold text-zinc-500">{weekday}</Text>
          </View>
        ))}
      </View>

      <View className="mt-2 flex-row flex-wrap">
        {days.map((day) => {
          const isStart = Boolean(selectedStart && sameDay(day, selectedStart));
          const isEnd = Boolean(selectedEnd && sameDay(day, selectedEnd));
          const isInRange = Boolean(
            selectedStart &&
            selectedEnd &&
            day.getTime() > selectedStart.getTime() &&
            day.getTime() < selectedEnd.getTime(),
          );
          const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
          const isToday = sameDay(day, new Date());

          return (
            <View
              className={`h-11 w-[14.285%] items-center justify-center ${
                isInRange ? "bg-[#342610]" : ""
              }`}
              key={day.toISOString()}
            >
              <Pressable
                accessibilityLabel={day.toLocaleDateString()}
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  isStart || isEnd ? "bg-accent" : "active:bg-surface"
                }`}
                onPress={() => selectDay(day)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isStart || isEnd
                      ? "text-black"
                      : isToday
                        ? "text-accent"
                        : isCurrentMonth
                          ? "text-cream"
                          : "text-zinc-600"
                  }`}
                >
                  {day.getDate()}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Text className="mt-3 text-center text-xs leading-5 text-muted">
        {startDate && !endDate
          ? "Now choose the end date."
          : "Choose a start date, then an end date."}
      </Text>

      <View className="mt-4 flex-row gap-2">
        <Pressable
          className="flex-1 items-center rounded-xl bg-surface py-3"
          onPress={() => selectPreset(0)}
        >
          <Text className="text-sm font-bold text-cream">Today</Text>
        </Pressable>
        <Pressable
          className="flex-1 items-center rounded-xl bg-surface py-3"
          onPress={() => selectPreset(1)}
        >
          <Text className="text-sm font-bold text-cream">Tomorrow</Text>
        </Pressable>
        <Pressable
          className="flex-1 items-center rounded-xl bg-surface py-3"
          onPress={() => onChange(null, null)}
        >
          <Text className="text-sm font-bold text-muted">Someday</Text>
        </Pressable>
      </View>
    </View>
  );
}
