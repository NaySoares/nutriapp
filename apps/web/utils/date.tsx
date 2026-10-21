const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

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

export function isDateInPast(dateString: string): boolean {
  // esse método não considera o horário
  const today = new Date();
  const inputDate = new Date(dateString);
  return inputDate < today;
}