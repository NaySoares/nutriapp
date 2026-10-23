import { useCallback, useMemo, useState } from 'react';
import { getWeekDates } from '../../utils/date';

/** Soma dias a uma data YYYY-MM-DD usando UTC, sem depender de fuso nem de horário de verão. */
export function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

const localToday = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD no fuso do navegador

const shortDate = (date: string, withYear = false) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' as const } : {}),
  });

export function useWeekNavigation() {
  const [today] = useState(localToday);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(today);

  // Estável entre renders: só muda quando a semana muda
  const weekDates = useMemo(
    () => getWeekDates(addDays(today, weekOffset * 7)),
    [today, weekOffset],
  );

  const rangeLabel = useMemo(() => {
    const first = weekDates[0] ?? today;
    const last = weekDates[6] ?? today;
    return `${shortDate(first)} – ${shortDate(last, true)}`;
  }, [weekDates, today]);

  // devolve no formato dd — dd mês, ano, ex: 19 — 23 out, 2026
  const rangeLabelMinimal = useMemo(() => {
    const first = weekDates[0] ?? today;
    const last = weekDates[6] ?? today;
    return `${shortDate(first)} — ${shortDate(last, true)}`;
  }, [weekDates, today]);

  const shiftWeek = useCallback((direction: 1 | -1) => {
    setWeekOffset((current) => current + direction);
    setSelectedDate((current) => addDays(current, direction * 7));
  }, []);

  const goToToday = useCallback(() => {
    setWeekOffset(0);
    setSelectedDate(today);
  }, [today]);

  return {
    today,
    weekDates,
    selectedDate,
    setSelectedDate,
    rangeLabel,
    rangeLabelMinimal,
    goToPreviousWeek: () => shiftWeek(-1),
    goToNextWeek: () => shiftWeek(1),
    goToToday,
  };
}