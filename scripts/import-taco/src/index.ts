import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { parseTacoCsv } from "./parser.js";

config({ path: resolve(process.env.INIT_CWD ?? process.cwd(), ".env") });

const prisma = new PrismaClient();

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const content = await readFile(options.file, "utf8");
  const foods = parseTacoCsv(content, options.expectedCount);
  console.log(`Arquivo validado: ${foods.length} alimentos TACO.`);
  if (options.dryRun) return;

  let imported = 0;
  for (const food of foods) {
    await prisma.alimento.upsert({
      where: { fonte_idExterno: { fonte: "taco", idExterno: food.idExterno } },
      create: { fonte: "taco", ...food, nomeBusca: normalizeSearch(food.nome) },
      update: { ...food, nomeBusca: normalizeSearch(food.nome) }
    });
    imported += 1;
    if (imported % 50 === 0) console.log(`Importados: ${imported}/${foods.length}`);
  }
  console.log(`Importação concluída: ${imported} alimentos.`);
}

function parseArguments(argumentsList: string[]) {
  const file = argumentsList[0];
  if (!file) throw new Error("Uso: pnpm import -- caminho/para/taco.csv [--dry-run] [--expected-count=597]");
  const expected = argumentsList.find((argument) => argument.startsWith("--expected-count="))?.split("=")[1];
  return {
    file,
    dryRun: argumentsList.includes("--dry-run"),
    expectedCount: expected ? Number(expected) : 597
  };
}

function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
