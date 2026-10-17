export type Sex = "M" | "F";
export type TmbFormula = "mifflin" | "harris_benedict";

export type NutriCalcInput = {
  pesoKg: number;
  alturaCm: number;
  idade: number;
  sexo: Sex;
};

export type GetInput = NutriCalcInput & {
  fatorAtividade: number;
  formula: TmbFormula;
};

export type NutritionalMetrics = {
  tmbKcal: number;
  getKcal: number;
  imc: number;
  formulaUsada: TmbFormula;
  fatorUsado: number;
};

const LIMITS = {
  pesoKg: { min: 2, max: 500 },
  alturaCm: { min: 50, max: 250 },
  idade: { min: 0, max: 120 }
} as const;

export const DEFAULT_ACTIVITY_FACTORS = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  ativo: 1.725,
  muito_ativo: 1.9
} as const;

export function calculateTmb(input: NutriCalcInput, formula: TmbFormula): number {
  validateBodyInput(input);

  if (formula === "mifflin") {
    return 10 * input.pesoKg
      + 6.25 * input.alturaCm
      - 5 * input.idade
      + (input.sexo === "M" ? 5 : -161);
  }

  if (formula === "harris_benedict") {
    return input.sexo === "M"
      ? 88.362 + 13.397 * input.pesoKg + 4.799 * input.alturaCm - 5.677 * input.idade
      : 447.593 + 9.247 * input.pesoKg + 3.098 * input.alturaCm - 4.33 * input.idade;
  }

  throw new RangeError(`Fórmula não suportada: ${formula}`);
}

export function calculateGet(input: GetInput): number {
  validateFactor(input.fatorAtividade);
  return calculateTmb(input, input.formula) * input.fatorAtividade;
}

export function calculateImc(input: NutriCalcInput): number {
  validateBodyInput(input);
  const alturaMetros = input.alturaCm / 100;
  return input.pesoKg / (alturaMetros * alturaMetros);
}

export function calculateNutritionalMetrics(input: GetInput): NutritionalMetrics {
  return {
    tmbKcal: calculateTmb(input, input.formula),
    getKcal: calculateGet(input),
    imc: calculateImc(input),
    formulaUsada: input.formula,
    fatorUsado: input.fatorAtividade
  };
}

function validateBodyInput(input: NutriCalcInput): void {
  validateFinite("pesoKg", input.pesoKg);
  validateFinite("alturaCm", input.alturaCm);
  validateFinite("idade", input.idade);

  validateRange("pesoKg", input.pesoKg, LIMITS.pesoKg.min, LIMITS.pesoKg.max);
  validateRange("alturaCm", input.alturaCm, LIMITS.alturaCm.min, LIMITS.alturaCm.max);
  validateRange("idade", input.idade, LIMITS.idade.min, LIMITS.idade.max);

  if (input.sexo !== "M" && input.sexo !== "F") {
    throw new RangeError("Sexo deve ser M ou F.");
  }
}

function validateFactor(factor: number): void {
  validateFinite("fatorAtividade", factor);
  if (factor <= 0) throw new RangeError("Fator de atividade deve ser maior que zero.");
}

function validateFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} deve ser um número finito.`);
}

function validateRange(name: string, value: number, min: number, max: number): void {
  if (value < min || value > max) {
    throw new RangeError(`${name} deve estar entre ${min} e ${max}.`);
  }
}
