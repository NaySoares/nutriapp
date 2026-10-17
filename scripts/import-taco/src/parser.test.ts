import { describe, expect, it } from "vitest";
import { parseNutrient, parseTacoCsv } from "./parser.js";

const header = "Código;Alimento;Grupo;Energia (kcal);Proteína (g);Lipídios (g);Carboidrato (g);Fibra (g);Sódio (mg)";
const row = "1;Arroz;Cereais;130;2,5;Tr;28;;5";

describe("importador TACO", () => {
  it("converte Tr para zero e vazio/NA para null", () => {
    expect(parseNutrient("Tr")).toBe(0);
    expect(parseNutrient("")).toBeNull();
    expect(parseNutrient("NA")).toBeNull();
    expect(parseNutrient("*")).toBeNull();
    expect(parseNutrient("123.45")).toBe(123.45);
  });

  it("lê CSV separado por ponto e vírgula e normaliza nutrientes", () => {
    const [food] = parseTacoCsv(`${header}\n${row}`, 1);
    expect(food).toMatchObject({
      idExterno: "1",
      nome: "Arroz",
      energiaKcal: 130,
      proteinaG: 2.5,
      lipidiosG: 0,
      fibraG: null,
      sodioMg: 5
    });
  });

  it("rejeita contagem diferente da esperada", () => {
    expect(() => parseTacoCsv(`${header}\n${row}`, 597)).toThrow("Esperados 597");
  });
});
