export type AuthPrisma = {
  nutricionista: {
    create: (args: {
      data: {
        email: string;
        senhaHash: string;
        nome: string;
        fatoresAtividade: Record<string, number>;
      };
      select: { id: true; email: true; nome: true };
    }) => Promise<{ id: string; email: string; nome: string }>;
    findUnique: (args: {
      where: { email: string };
      select: { id: true; email: true; nome: true; senhaHash: true };
    }) => Promise<{ id: string; email: string; nome: string; senhaHash: string } | null>;
    update: (args: {
      where: { id: string };
      data: { senhaHash: string } | { nome: string; crn: string | null };
    }) => Promise<unknown>;
  };
  sessao: {
    create: (args: {
      data: { nutricionistaId: string; refreshTokenHash: string; expiraEm: Date };
    }) => Promise<{ id: string; nutricionistaId: string }>;
    findFirst: (args: {
      where: {
        refreshTokenHash: string;
        revogadaEm: null;
        expiraEm: { gt: Date };
      };
      select: { id: true; nutricionistaId: true };
    }) => Promise<{ id: string; nutricionistaId: string } | null>;
    findUnique: (args: {
      where: { id: string; revogadaEm: null; expiraEm: { gt: Date } };
      select: { nutricionistaId: true };
    }) => Promise<{ nutricionistaId: string } | null>;
    updateMany: (args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => Promise<{ count: number }>;
  };
  resetSenha: {
    create: (args: {
      data: { nutricionistaId: string; tokenHash: string; expiraEm: Date };
    }) => Promise<unknown>;
    findFirst: (args: {
      where: { tokenHash: string; usadoEm: null; expiraEm: { gt: Date } };
      select: { id: true; nutricionistaId: true };
    }) => Promise<{ id: string; nutricionistaId: string } | null>;
    updateMany: (args: {
      where: { id: string; tokenHash: string; usadoEm: null };
      data: { usadoEm: Date };
    }) => Promise<{ count: number }>;
  };
};
