export const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function getWeekDates(referenceDate: string): string[] {
  // devolve todas as datas das semana da data de referência, no formato YYYY-MM-DD
  // todo: recuperar das configurações do usuário qual é o primeiro dia da semana (domingo ou segunda-feira)
  const initialDate = 'sunday';
  const refDate = new Date(`${referenceDate}T12:00:00`);
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(refDate);
    date.setDate(refDate.getDate() - refDate.getDay() + i);
    weekDates.push(date.toLocaleDateString('en-CA')); // YYYY-MM-DD
  }
  return weekDates;
}



export function getCurrentDay() {
  // retorna no formato "Segunda-feira, 19 de outubro de 2026"
  const today = new Date();
  return `${DAYS[today.getDay()]}, ${today.getDate()} de ${MONTHS[today.getMonth()]} de ${today.getFullYear()}`;
}

export function getCurrentDayWithoutYear() {
  // retorna no formato "Segunda-feira, 19 de outubro"
  const today = new Date();
  return `${DAYS[today.getDay()]}, ${today.getDate()} de ${MONTHS[today.getMonth()]}`;
}

export function isDateInPast(dateString: string, time?: string): boolean {
  const today = new Date();
  const inputDate = new Date(dateString);

  const dayInThePast = inputDate < today;

  if (time === undefined) {
    return dayInThePast;
  }

  const currentTime = today.getHours() * 60 + today.getMinutes(); // hora atual em minutos
  const [hours, minutes] = time ? time.split(":").map(Number) : [0, 0];
  const inputTime = hours! * 60 + minutes!; // hora do input em minutos
  const timeInThePast = inputTime < currentTime;

  return timeInThePast && dayInThePast;
}

export function isDateInFuture(dateString: string): boolean {
  // esse método não considera o horário
  const today = new Date();
  const inputDate = new Date(dateString);
  return inputDate > today;
}

export function convertDateFromApi(date: Date | undefined): string {
  // Recebe 2026-10-22T00:00:00.000Z e devolve 22/10/2026
  if (!date) return "";
  const newDate = new Date(date);
  // return newDate.toISOString().slice(0, 10); -> devolve 2026-10-22
  return newDate.toLocaleDateString("pt-BR");
}


export function calculateAge(birthDateString: string): number {
  const [day, month, year] = birthDateString.split("/").map(Number);

  if (day === undefined || month === undefined || year === undefined) {
    throw new Error("Data de nascimento inválida");
  }

  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export function calculateAgeByDate(birthDate: Date): number {
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}