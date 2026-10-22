'use client';

import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  LockKeyhole,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
  X,
  Download,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { useState } from 'react';
import { SideBar } from '../../../components/layout/sidebar';

interface ImportRow {
  name: string;
  category: string;
  portion: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  valid: boolean;
  error?: string;
}

function parseCsv(text: string): ImportRow[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) return [];
  const parseLine = (line: string) => {
    const result: string[] = [];
    let current = '',
      quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"' && quoted) {
        current += '"';
        i++;
      } else if (ch === '"') quoted = !quoted;
      else if ((ch === ',' || ch === ';' || ch === '\t') && !quoted) {
        result.push(current.trim());
        current = '';
      } else current += ch;
    }
    result.push(current.trim());
    return result;
  };
  const headers = parseLine(lines[0]).map((h) =>
    h
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ''),
  );
  const aliases: Record<string, string[]> = {
    name: ['nome', 'alimento', 'name', 'food'],
    category: ['categoria', 'category', 'grupo'],
    portion: ['porcao', 'porcaoreferencia', 'medida', 'serving'],
    kcal: ['kcal', 'energia', 'calorias', 'energy'],
    protein: ['proteina', 'proteinas', 'protein'],
    carbs: ['carboidrato', 'carboidratos', 'carbs', 'carbohydrate'],
    fat: ['gordura', 'gorduras', 'fat', 'lipidios'],
    fiber: ['fibra', 'fibras', 'fiber'],
  };
  const index: Record<string, number> = {};
  for (const [field, names] of Object.entries(aliases)) {
    index[field] = headers.findIndex((h) => names.includes(h));
  }
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const get = (field: string) =>
      index[field] >= 0 ? (cells[index[field]] ?? '') : '';
    const num = (field: string) =>
      Number((get(field) || '0').replace(',', '.'));
    const name = get('name');
    const missing = [];
    if (!name) missing.push('nome ausente');
    if (index.kcal < 0) missing.push('coluna kcal ausente');
    if (index.protein < 0) missing.push('coluna proteína ausente');
    if (index.carbs < 0) missing.push('coluna carboidrato ausente');
    if (index.fat < 0) missing.push('coluna gordura ausente');
    return {
      name,
      category: get('category') || 'Outros',
      portion: get('portion') || '100 g',
      kcal: num('kcal'),
      protein: num('protein'),
      carbs: num('carbs'),
      fat: num('fat'),
      fiber: num('fiber'),
      valid:
        missing.length === 0 &&
        [num('kcal'), num('protein'), num('carbs'), num('fat')].every(
          (n) => Number.isFinite(n) && n >= 0,
        ),
      error: missing.length ? missing.join(', ') : undefined,
    };
  });
}
export default function SettingsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState('Geral');
  const [language, setLanguage] = useState('Português (Brasil)');
  const [units, setUnits] = useState('Métrico (g, kg, ml)');
  const [weekStart, setWeekStart] = useState('Segunda-feira');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [followupReminders, setFollowupReminders] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [csvRows, setCsvRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('Semanal');
  const [confirmReset, setConfirmReset] = useState(false);
  const validRows = csvRows.filter((r) => r.valid);
  const invalidRows = csvRows.filter((r) => !r.valid);
  const tabs = [
    { name: 'Geral', icon: SlidersHorizontal, desc: 'Preferências do sistema' },
    { name: 'Notificações', icon: Bell, desc: 'Lembretes e avisos' },
    {
      name: 'Importação de dados',
      icon: Database,
      desc: 'Importar alimentos por CSV',
    },
    {
      name: 'Privacidade e segurança',
      icon: ShieldCheck,
      desc: 'Proteção e acesso',
    },
  ];
  async function handleFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setImportMessage('');
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvRows([]);
      setImportMessage('Selecione um arquivo .csv para continuar.');
      return;
    }
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      setCsvRows(rows);
      setImportMessage(
        rows.length
          ? `${rows.length} linhas lidas. Confira a prévia antes de confirmar.`
          : 'O arquivo não contém linhas de dados para importar.',
      );
    } catch {
      setCsvRows([]);
      setImportMessage(
        'Não foi possível ler o arquivo. Confira o formato e tente novamente.',
      );
    }
  }
  function applyImport() {
    if (!validRows.length) return;
    setImporting(true);
    window.setTimeout(() => {
      setImporting(false);
      setImportMessage(
        `${validRows.length} alimentos validados nesta demonstração. Nenhum dado foi enviado a um servidor.`,
      );
      setCsvRows([]);
      setFileName('');
    }, 700);
  }
  function saveSettings() {
    setNotice('Preferências salvas nesta demonstração.');
    window.setTimeout(() => setNotice(''), 3000);
  }
  return (
    <div className="min-h-screen">
      <SideBar mobileNavOpen={menuOpen} setMobileNavOpen={setMenuOpen} />
      <main className="main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu rounded-lg border border-[#e8eee9] p-2"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Settings size={18} />
            </button>
            <div>
              <div className="text-[11px] text-[#849188]">
                Preferências da conta
              </div>
              <div className="mt-1 text-[17px] font-bold">Configurações</div>
            </div>
          </div>
          <button
            aria-label="Notificações"
            className="rounded-lg border border-[#e7ece7] bg-white p-2.5 text-[#718278]"
            onClick={() => setNotice('Nenhuma notificação nova.')}
          >
            <Bell size={16} />
          </button>
        </header>
        <div className="content">
          <div className="mb-6">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[1.1px] text-[#7c8c81]">
              SISTEMA E DADOS
            </div>
            <h1 className="text-[26px] font-bold tracking-[-1px] text-[#20352c]">
              Configurações
            </h1>
            <p className="mt-1 max-w-[650px] text-[12px] leading-5 text-[#7d8b83]">
              Personalize o funcionamento do Nutri e gerencie a importação da
              sua base de alimentos.
            </p>
          </div>
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="panel p-2">
              <div className="px-3 py-2 text-[9px] font-bold tracking-[1.1px] text-[#a1aca5]">
                PREFERÊNCIAS
              </div>
              {tabs.map(({ name, icon: Icon, desc }) => (
                <button
                  key={name}
                  onClick={() => setActiveTab(name)}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${activeTab === name ? 'bg-[#eef6ef] text-[#287653]' : 'text-[#718278] hover:bg-[#f8faf8]'}`}
                >
                  <Icon size={17} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[12px] font-semibold ${activeTab === name ? 'text-[#355743]' : 'text-[#53665a]'}`}
                    >
                      {name}
                    </span>
                    <span className="mt-1 block text-[10px] leading-4 text-[#87948b]">
                      {desc}
                    </span>
                  </span>
                  {activeTab === name && (
                    <ChevronRight size={14} className="mt-1" />
                  )}
                </button>
              ))}
              <div className="mx-2 mt-3 rounded-xl bg-[#f6f9f6] p-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#355743]">
                  <ShieldCheck size={14} />
                  Seus dados
                </div>
                <p className="mt-1 text-[10px] leading-4 text-[#87948b]">
                  Use apenas dados autorizados e mantenha informações clínicas
                  protegidas.
                </p>
              </div>
            </aside>
            <section className="panel min-w-0 overflow-hidden">
              {activeTab === 'Geral' && (
                <>
                  <div className="border-b border-[#edf1ed] p-5">
                    <h2 className="section-title">Preferências gerais</h2>
                    <p className="section-subtitle">
                      Ajuste a forma como as informações são exibidas no
                      sistema.
                    </p>
                  </div>
                  <div className="divide-y divide-[#edf1ed] px-5">
                    {' '}
                    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[12px] font-semibold text-[#304638]">
                          Idioma da interface
                        </div>
                        <div className="mt-1 text-[11px] text-[#87948b]">
                          Idioma usado nos menus, datas e mensagens.
                        </div>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[11px] text-[#53665a] sm:w-[220px]"
                      >
                        <option>Português (Brasil)</option>
                        <option>English</option>
                        <option>Español</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[12px] font-semibold text-[#304638]">
                          Unidades de medida
                        </div>
                        <div className="mt-1 text-[11px] text-[#87948b]">
                          Padrão usado para alimentos e medidas corporais.
                        </div>
                      </div>
                      <select
                        value={units}
                        onChange={(e) => setUnits(e.target.value)}
                        className="rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[11px] text-[#53665a] sm:w-[220px]"
                      >
                        <option>Métrico (g, kg, ml)</option>
                        <option>Imperial (oz, lb, fl oz)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[12px] font-semibold text-[#304638]">
                          Primeiro dia da semana
                        </div>
                        <div className="mt-1 text-[11px] text-[#87948b]">
                          Define a organização padrão da agenda.
                        </div>
                      </div>
                      <select
                        value={weekStart}
                        onChange={(e) => setWeekStart(e.target.value)}
                        className="rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[11px] text-[#53665a] sm:w-[220px]"
                      >
                        <option>Segunda-feira</option>
                        <option>Domingo</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[12px] font-semibold text-[#304638]">
                          Frequência de backup
                        </div>
                        <div className="mt-1 text-[11px] text-[#87948b]">
                          Preferência demonstrativa para cópias de segurança.
                        </div>
                      </div>
                      <select
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                        className="rounded-lg border border-[#e3eae4] bg-white px-3 py-2.5 text-[11px] text-[#53665a] sm:w-[220px]"
                      >
                        <option>Diário</option>
                        <option>Semanal</option>
                        <option>Mensal</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-[#edf1ed] bg-[#fcfdfc] px-5 py-4">
                    <button className="btn-primary" onClick={saveSettings}>
                      <Save size={14} />
                      Salvar preferências
                    </button>
                  </div>
                </>
              )}
              {activeTab === 'Notificações' && (
                <>
                  <div className="border-b border-[#edf1ed] p-5">
                    <h2 className="section-title">Notificações e lembretes</h2>
                    <p className="section-subtitle">
                      Escolha quais avisos gostaria de receber.
                    </p>
                  </div>
                  <div className="divide-y divide-[#edf1ed] px-5">
                    {[
                      {
                        title: 'Notificações por e-mail',
                        desc: 'Receba avisos importantes da sua conta.',
                        value: emailNotifications,
                        set: setEmailNotifications,
                      },
                      {
                        title: 'Lembretes de consultas',
                        desc: 'Avisos sobre atendimentos próximos da agenda.',
                        value: appointmentReminders,
                        set: setAppointmentReminders,
                      },
                      {
                        title: 'Retornos pendentes',
                        desc: 'Lembretes para revisar pacientes sem novo agendamento.',
                        value: followupReminders,
                        set: setFollowupReminders,
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between gap-4 py-5"
                      >
                        <div>
                          <div className="text-[12px] font-semibold text-[#304638]">
                            {item.title}
                          </div>
                          <div className="mt-1 text-[11px] text-[#87948b]">
                            {item.desc}
                          </div>
                        </div>
                        <button
                          role="switch"
                          aria-checked={item.value}
                          onClick={() => item.set(!item.value)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${item.value ? 'bg-[#39865b]' : 'bg-[#d6ded7]'}`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${item.value ? 'left-6' : 'left-1'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end border-t border-[#edf1ed] bg-[#fcfdfc] px-5 py-4">
                    <button className="btn-primary" onClick={saveSettings}>
                      <Save size={14} />
                      Salvar preferências
                    </button>
                  </div>
                </>
              )}
              {activeTab === 'Importação de dados' && (
                <>
                  <div className="border-b border-[#edf1ed] p-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                        <Database size={19} />
                      </div>
                      <div>
                        <h2 className="section-title">
                          Importar alimentos por CSV
                        </h2>
                        <p className="section-subtitle">
                          Adicione vários alimentos de uma vez à sua biblioteca.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5 p-5">
                    <div className="rounded-xl border border-[#e3ebe4] bg-[#f8fbf8] p-4">
                      <div className="flex items-start gap-3">
                        <Info
                          size={16}
                          className="mt-0.5 shrink-0 text-[#71927b]"
                        />
                        <div>
                          <div className="text-[11px] font-semibold text-[#355743]">
                            Formato esperado do arquivo
                          </div>
                          <p className="mt-1 text-[10px] leading-5 text-[#7d8b83]">
                            O CSV deve conter cabeçalhos para nome, kcal,
                            proteína, carboidrato e gordura. Categoria, porção e
                            fibra são opcionais. São aceitos separadores
                            vírgula, ponto e vírgula ou tabulação.
                          </p>
                          <button
                            onClick={() => {
                              const csv =
                                'nome,categoria,porcao,kcal,proteina,carboidrato,gordura,fibra\nBanana-prata,Frutas,100 g,98,1.3,26,0.1,2\nAveia em flocos,Cereais e derivados,100 g,394,13.9,66.6,8.5,9.1';
                              const url = URL.createObjectURL(
                                new Blob([csv], {
                                  type: 'text/csv;charset=utf-8',
                                }),
                              );
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'modelo-alimentos.csv';
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#287653]"
                          >
                            <Download size={12} />
                            Baixar modelo CSV
                          </button>
                        </div>
                      </div>
                    </div>
                    <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-[#dce7dd] bg-white px-5 py-8 text-center transition hover:border-[#91b99b] hover:bg-[#fbfdfb]">
                      <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                        <UploadCloud size={21} />
                      </div>
                      <span className="text-[13px] font-semibold text-[#304638]">
                        Selecione seu arquivo CSV
                      </span>
                      <span className="mt-1 text-[11px] text-[#87948b]">
                        ou arraste e solte aqui · máximo recomendado: 10 MB
                      </span>
                      <span className="mt-3 rounded-lg border border-[#e3eae4] px-3 py-2 text-[11px] font-semibold text-[#53665a]">
                        Escolher arquivo
                      </span>
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="sr-only"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                    </label>
                    {fileName && (
                      <div className="flex items-center gap-3 rounded-xl border border-[#e5ece5] p-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf2fa] text-[#5576a3]">
                          <FileSpreadsheet size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11px] font-semibold text-[#304638]">
                            {fileName}
                          </div>
                          <div className="mt-1 text-[10px] text-[#87948b]">
                            {csvRows.length} linhas identificadas ·{' '}
                            {validRows.length} válidas · {invalidRows.length}{' '}
                            com problema
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFileName('');
                            setCsvRows([]);
                            setImportMessage('');
                          }}
                          className="p-2 text-[#87948b]"
                          aria-label="Remover arquivo"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                    {importMessage && (
                      <div
                        role="status"
                        className="flex items-start gap-2 rounded-xl border border-[#e3ebe4] bg-[#f8fbf8] p-3 text-[11px] text-[#53665a]"
                      >
                        <CircleAlert
                          size={15}
                          className="mt-0.5 shrink-0 text-[#7b9882]"
                        />
                        <span>{importMessage}</span>
                      </div>
                    )}
                    {csvRows.length > 0 && (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-[12px] font-bold text-[#304638]">
                              Prévia dos dados
                            </h3>
                            <p className="mt-1 text-[10px] text-[#87948b]">
                              Confira os valores antes de confirmar a
                              importação.
                            </p>
                          </div>
                          <label className="flex items-center gap-2 text-[10px] text-[#53665a]">
                            <input
                              type="checkbox"
                              checked={overwrite}
                              onChange={(e) => setOverwrite(e.target.checked)}
                              className="accent-[#39865b]"
                            />
                            Atualizar alimentos com mesmo nome
                          </label>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-[#edf1ed]">
                          <table className="w-full min-w-[650px] text-left">
                            <thead className="bg-[#fafcf9] text-[9px] uppercase tracking-wide text-[#87948b]">
                              <tr>
                                <th className="px-3 py-2.5">Nome</th>
                                <th className="px-3 py-2.5">Categoria</th>
                                <th className="px-3 py-2.5">Kcal</th>
                                <th className="px-3 py-2.5">Proteína</th>
                                <th className="px-3 py-2.5">Carboidrato</th>
                                <th className="px-3 py-2.5">Validação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ed]">
                              {csvRows.slice(0, 8).map((row, i) => (
                                <tr key={i}>
                                  <td className="px-3 py-2.5 text-[11px] text-[#304638]">
                                    {row.name || '—'}
                                  </td>
                                  <td className="px-3 py-2.5 text-[10px] text-[#718278]">
                                    {row.category}
                                  </td>
                                  <td className="px-3 py-2.5 text-[11px]">
                                    {row.kcal}
                                  </td>
                                  <td className="px-3 py-2.5 text-[11px]">
                                    {row.protein} g
                                  </td>
                                  <td className="px-3 py-2.5 text-[11px]">
                                    {row.carbs} g
                                  </td>
                                  <td className="px-3 py-2.5">
                                    {row.valid ? (
                                      <span className="pill bg-[#e9f5ed] text-[#287653]">
                                        <Check size={10} />
                                        Válido
                                      </span>
                                    ) : (
                                      <span className="pill bg-[#fff0ed] text-[#b65c50]">
                                        Inválido
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {csvRows.length > 8 && (
                            <div className="border-t border-[#edf1ed] px-3 py-2 text-[10px] text-[#87948b]">
                              Mostrando 8 de {csvRows.length} linhas na prévia.
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[10px] text-[#87948b]">
                            {validRows.length} linhas prontas para importar;{' '}
                            {invalidRows.length} serão ignoradas.
                          </p>
                          <button
                            disabled={!validRows.length || importing}
                            onClick={applyImport}
                            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <UploadCloud size={14} />
                            {importing
                              ? 'Validando...'
                              : `Confirmar ${validRows.length} alimentos`}
                          </button>
                        </div>
                      </>
                    )}
                    <p className="text-[10px] leading-5 text-[#9aa59d]">
                      Esta tela demonstra a leitura e validação do CSV no
                      navegador. A gravação definitiva e a deduplicação dependem
                      da integração com a API do sistema.
                    </p>
                  </div>
                </>
              )}
              {activeTab === 'Privacidade e segurança' && (
                <>
                  <div className="border-b border-[#edf1ed] p-5">
                    <h2 className="section-title">Privacidade e segurança</h2>
                    <p className="section-subtitle">
                      Preferências de proteção para sua conta e seus dados.
                    </p>
                  </div>
                  <div className="divide-y divide-[#edf1ed] px-5">
                    <div className="flex items-center justify-between gap-4 py-5">
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e9f5ed] text-[#287653]">
                          <LockKeyhole size={16} />
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-[#304638]">
                            Autenticação em duas etapas
                          </div>
                          <div className="mt-1 text-[11px] leading-5 text-[#87948b]">
                            Adicione uma etapa extra de segurança ao entrar na
                            conta.
                          </div>
                        </div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={twoFactor}
                        onClick={() => setTwoFactor(!twoFactor)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${twoFactor ? 'bg-[#39865b]' : 'bg-[#d6ded7]'}`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${twoFactor ? 'left-6' : 'left-1'}`}
                        />
                      </button>
                    </div>
                    <div className="flex items-start gap-3 py-5">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf2fa] text-[#5576a3]">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-[#304638]">
                          Dados clínicos e privacidade
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-[#87948b]">
                          Restrinja o acesso a prontuários e informações de
                          saúde a pessoas autorizadas. Em produção, configure
                          controles de acesso, auditoria e políticas de retenção
                          adequadas.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 py-5">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff5e6] text-[#a8752c]">
                        <Database size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] font-semibold text-[#304638]">
                          Exportação e exclusão de dados
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-[#87948b]">
                          Ações definitivas de exportação ou exclusão devem
                          exigir confirmação, autorização e registro de
                          auditoria.
                        </p>
                        <button
                          onClick={() => setConfirmReset(true)}
                          className="mt-2 text-[10px] font-semibold text-[#a8752c]"
                        >
                          Ver opções de exclusão
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-[#edf1ed] bg-[#fcfdfc] px-5 py-4">
                    <button className="btn-primary" onClick={saveSettings}>
                      <Save size={14} />
                      Salvar preferências
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-[#dce9df] bg-white px-4 py-3 text-[12px] text-[#355743] shadow-lg"
        >
          <CheckCircle2 size={15} />
          {notice}
          <button onClick={() => setNotice('')} aria-label="Fechar aviso">
            <X size={13} />
          </button>
        </div>
      )}
      {confirmReset && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#17251d]/35 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#fff5e6] text-[#a8752c]">
              <CircleAlert size={19} />
            </div>
            <h2 className="text-[16px] font-bold text-[#20352c]">
              Ação indisponível na demonstração
            </h2>
            <p className="mt-2 text-[11px] leading-5 text-[#7d8b83]">
              A exclusão de dados reais deve ser implementada com confirmação
              reforçada e validação de permissões. Nenhum dado será removido por
              esta tela demonstrativa.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                className="btn-primary"
                onClick={() => setConfirmReset(false)}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
