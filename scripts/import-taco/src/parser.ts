export type TacoRow = {
  idExterno: string;
  nome: string;
  grupo: string | null;
  energiaKcal: number | null;
  proteinaG: number | null;
  lipidiosG: number | null;
  carboidratoG: number | null;
  fibraG: number | null;
  sodioMg: number | null;
  outros: Record<string, string | number | null>;
};

const aliases = {
  id: ["id", "codigo", "código", "cod", "número do alimento"],
  name: ["alimento", "nome", "descrição", "descricao", "descrição dos alimentos", "descricao dos alimentos"],
  group: ["grupo", "categoria", "categoria do alimento"],
  energy: ["energia kcal", "energia (kcal)", "energia"],
  protein: ["proteína", "proteina", "proteína (g)", "proteina (g)"],
  fat: ["lipídios", "lipidios", "lipídio", "lipidio", "lipídios (g)", "lipidios (g)"],
  carbs: ["carboidrato", "carboidratos", "carboidrato (g)", "carboidratos (g)"],
  fiber: ["fibra alimentar", "fibra", "fibra alimentar (g)", "fibra (g)"],
  sodium: ["sódio", "sodio", "sódio (mg)", "sodio (mg)"]
} as const;

export function parseTacoCsv(content: string, expectedCount = 597): TacoRow[] {
  const records = parseDelimited(content);
  if (!records.length) throw new Error("O arquivo TACO está vazio.");
  const [header = [], ...rows] = records;
  const headerMap = header.map(normalizeHeader);
  const index = (names: readonly string[]) => {
    const position = names.map(normalizeHeader).map((name) => headerMap.indexOf(name)).find((value) => value >= 0);
    return position ?? -1;
  };
  const columns = {
    id: index(aliases.id),
    name: index(aliases.name),
    group: index(aliases.group),
    energy: index(aliases.energy),
    protein: index(aliases.protein),
    fat: index(aliases.fat),
    carbs: index(aliases.carbs),
    fiber: index(aliases.fiber),
    sodium: index(aliases.sodium)
  };
  if (columns.name < 0) throw new Error("Não foi encontrada a coluna de nome do alimento.");
  if (rows.length !== expectedCount) throw new Error(`Esperados ${expectedCount} alimentos, encontrados ${rows.length}.`);

  return rows.map((row, rowIndex) => ({
    idExterno: clean(row[columns.id]) ?? `taco-${String(rowIndex + 1).padStart(3, "0")}`,
    nome: clean(row[columns.name]) ?? fail(rowIndex, "nome"),
    grupo: clean(row[columns.group]) ?? null,
    energiaKcal: parseNutrient(row[columns.energy]),
    proteinaG: parseNutrient(row[columns.protein]),
    lipidiosG: parseNutrient(row[columns.fat]),
    carboidratoG: parseNutrient(row[columns.carbs]),
    fibraG: parseNutrient(row[columns.fiber]),
    sodioMg: parseNutrient(row[columns.sodium]),
    outros: Object.fromEntries(header.map((name, index) => [name, clean(row[index])]))
  }));
}

export function parseNutrient(value: string | undefined): number | null {
  const normalized = value?.trim();
  if (!normalized || /^(na|n\/a|nd|\*|não disponível|nao disponivel)$/i.test(normalized)) return null;
  if (/^tr$/i.test(normalized)) return 0;
  const number = Number(normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized);
  if (!Number.isFinite(number)) throw new Error(`Valor nutricional inválido: ${value}`);
  return number;
}

function parseDelimited(content: string): string[][] {
  const delimiter = detectDelimiter(content);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const next = content[index + 1];
    if (character === "\"" && quoted && next === "\"") {
      field += "\"";
      index += 1;
    } else if (character === "\"") {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function detectDelimiter(content: string): string {
  const firstLine = content.split(/\r?\n/, 1)[0] ?? "";
  return (firstLine.match(/;/g) ?? []).length > (firstLine.match(/,/g) ?? []).length ? ";" : ",";
}

function normalizeHeader(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
}

function clean(value: string | undefined): string | null {
  const result = value?.trim();
  return result ? result : null;
}

function fail(row: number, field: string): never {
  throw new Error(`Linha ${row + 2}: campo obrigatório ausente (${field}).`);
}
