import { describe, expect, it } from "vitest";
import {
  calculateGet,
  calculateImc,
  calculateNutritionalMetrics,
  calculateTmb
} from "./index.js";

describe("nutri-calc", () => {
  const male = { pesoKg: 80, alturaCm: 180, idade: 30, sexo: "M" as const };
  const female = { pesoKg: 60, alturaCm: 165, idade: 30, sexo: "F" as const };

  it("calcula TMB Mifflin para homem e mulher", () => {
    expect(calculateTmb(male, "mifflin")).toBe(1780);
    expect(calculateTmb(female, "mifflin")).toBe(1320.25);
  });

  it("calcula TMB Harris-Benedict revisada para homem e mulher", () => {
    expect(calculateTmb(male, "harris_benedict")).toBeCloseTo(1853.632, 6);
    expect(calculateTmb(female, "harris_benedict")).toBeCloseTo(1383.683, 6);
  });

  it("calcula GET com o fator de atividade informado", () => {
    expect(calculateGet({ ...male, formula: "mifflin", fatorAtividade: 1.55 })).toBe(2759);
  });

  it("calcula IMC usando altura em centímetros", () => {
    expect(calculateImc(male)).toBeCloseTo(24.691358, 6);
  });

  it("retorna o snapshot completo com a fórmula e o fator usados", () => {
    expect(calculateNutritionalMetrics({
      ...female,
      formula: "harris_benedict",
      fatorAtividade: 1.375
    })).toEqual({
      tmbKcal: 1383.683,
      getKcal: 1902.5641249999999,
      imc: 22.03856749311295,
      formulaUsada: "harris_benedict",
      fatorUsado: 1.375
    });
  });

  it("aceita os limites válidos de peso, altura e idade", () => {
    expect(calculateTmb({
      pesoKg: 2,
      alturaCm: 50,
      idade: 0,
      sexo: "M"
    }, "mifflin")).toBe(337.5);
    expect(calculateImc({
      pesoKg: 500,
      alturaCm: 250,
      idade: 120,
      sexo: "F"
    })).toBe(80);
  });

  it("rejeita valores fora dos limites definidos", () => {
    expect(() => calculateTmb({ ...male, pesoKg: 1.99 }, "mifflin")).toThrow(RangeError);
    expect(() => calculateTmb({ ...male, alturaCm: 250.01 }, "mifflin")).toThrow(RangeError);
    expect(() => calculateTmb({ ...male, idade: -1 }, "mifflin")).toThrow(RangeError);
    expect(() => calculateImc({ ...male, idade: 120.01 })).toThrow(RangeError);
  });

  it("rejeita fator de atividade inválido", () => {
    expect(() => calculateGet({ ...male, formula: "mifflin", fatorAtividade: 0 })).toThrow(RangeError);
  });
});
