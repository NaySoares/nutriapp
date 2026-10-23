import { convertDateFromApi } from '../../utils/date';

export function groupByDay<T extends { data: string; horario: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = convertDateFromApi(item.data);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.horario.localeCompare(b.horario));
  }
  return groups;
}