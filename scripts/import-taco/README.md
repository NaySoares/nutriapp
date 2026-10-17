# Importador TACO

Importa um arquivo CSV/TSV da TACO para `alimentos`. A base bruta não é
versionada neste repositório.

A carga validada nesta sprint usa a planilha **Taco 4ª edição (2011)**,
aba `CMVCol taco3`, com 597 alimentos. O arquivo foi obtido da cópia pública
do repositório [elyrio/tacoSQL](https://github.com/elyrio/tacoSQL), que
disponibiliza a planilha original; a página atual do NEPA/UNICAMP disponibiliza
apenas a imagem institucional da tabela. A tabela foi convertida para CSV
somente para a execução do importador.

## Uso

```bash
pnpm --filter @nutriapp/import-taco import -- ./dados/taco.csv --dry-run
pnpm --filter @nutriapp/import-taco import -- ./dados/taco.csv
```

O importador espera 597 linhas por padrão. Para validar um arquivo de teste
com outra quantidade:

```bash
pnpm --filter @nutriapp/import-taco import -- ./dados/taco.csv --dry-run --expected-count=1
```

O arquivo pode usar vírgula ou ponto e vírgula como separador. Valores `Tr`
viram `0`; vazio, `NA`, `N/A`, `ND` e `*` viram `NULL`. A operação é reproduzível:
o alimento é identificado pela combinação `fonte=taco` e `id_externo`, usando
`upsert`.

Os valores importados são por 100 g. A execução validada no banco local
resultou em 597 registros com `fonte=taco`.
