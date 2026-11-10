// Listas, formulário e funções de formatação usadas pelo app e pela impressão.

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const MESES = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];

const OP = {
  sexo: [['MASC.', 'Masculino'], ['FEM.', 'Feminino']],
  corRaca: ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Não declarado'],
  escolaridade: ['NÃO ALFABETIZADO', 'ENSINO FUNDAMENTAL INCOMPLETO', 'ENSINO FUNDAMENTAL COMPLETO', 'ENSINO MÉDIO INCOMPLETO', 'ENSINO MÉDIO COMPLETO', 'ENSINO SUPERIOR INCOMPLETO', 'ENSINO SUPERIOR COMPLETO', 'PÓS-GRADUAÇÃO'],
  estadoCivil: ['SOLTEIRO(A)', 'CASADO(A)', 'UNIÃO ESTÁVEL', 'DIVORCIADO(A)', 'VIÚVO(A)'],
  religiao: ['CATÓLICO', 'EVANGÉLICO', 'ESPÍRITA', 'MATRIZ AFRICANA', 'OUTRA', 'SEM RELIGIÃO', 'NÃO DECLARADA'],
  simNao: [['sim', 'Sim'], ['nao', 'Não']],
  naoSim: [['nao', 'Não'], ['sim', 'Sim']],
  aee: [['nao', 'Não'], ['sim', 'Sim'], ['avaliacao', 'Em avaliação']],
  discriminacao: [['nao', 'Não'], ['sim', 'Sim – prefere conversar individualmente']],
  responsavel: [['resp1', 'Filiação/Resp. 1'], ['resp2', 'Filiação/Resp. 2'], ['outro', 'Outra pessoa']],
  etapa: ['Educação Infantil', 'Ensino Fundamental', 'EJA'],
  ano: {
    'Educação Infantil': ['Infantil 4 (Pré I)', 'Infantil 5 (Pré II)'],
    'Ensino Fundamental': ['1º', '2º', '3º', '4º', '5º', '6º', '7º', '8º', '9º'],
    'EJA': ['1ª Etapa', '2ª Etapa', '3ª Etapa', '4ª Etapa']
  },
  semestre: ['1º', '2º'],
  turno: [['MAT.', 'Matutino'], ['VESP.', 'Vespertino'], ['NOT.', 'Noturno'], ['INT.', 'Integral']],
  atraves: [['classificacao', 'Classificação'], ['transferencia', 'Transferência'], ['continuidade', 'Outro (continuidade)']],
  documentacao: [['completa', 'Completa'], ['incompleta', 'Incompleta']]
};

// Formulário dividido em etapas. Cada campo: k = caminho no objeto do aluno, t = tipo, w = largura (de 12).
const ETAPAS = [
  {
    id: 'aluno', titulo: 'Aluno', icone: '🧒',
    ajuda: 'Dados pessoais do aluno, como estão na certidão de nascimento.',
    campos: [
      { k: 'aluno.nome', r: 'Nome completo do aluno', w: 12, obrig: true, maiusc: true, foco: true },
      { k: 'aluno.nomeSocial', r: 'Nome social', w: 8, maiusc: true, dica: 'Só se o aluno usar um nome social.' },
      { k: 'aluno.regEscolar', r: 'Registro escolar', w: 4 },
      { k: 'aluno.nascimento', r: 'Data de nascimento', t: 'data', w: 4, obrig: true, mostraIdade: true },
      { k: 'aluno.sexo', r: 'Sexo', t: 'botoes', op: OP.sexo, w: 4 },
      { k: 'aluno.corRaca', r: 'Cor / raça', t: 'select', op: OP.corRaca, w: 4 },
      { k: 'aluno.naturalidade', r: 'Natural de (cidade)', w: 8, maiusc: true, lista: 'cidades' },
      { k: 'aluno.ufNaturalidade', r: 'U.F.', t: 'select', op: UFS, w: 4 },
      { k: 'aluno.religiao', r: 'Religião', w: 6, maiusc: true, lista: 'religioes' },
      { k: 'aluno.irmaos', r: 'Quantos irmãos?', t: 'numero', w: 3 },
      { k: 'aluno.irmaosNaEscola', r: 'Quantos na escola?', t: 'numero', w: 3 },
      { k: 'aluno.estadoCivil', r: 'Estado civil (EJA)', w: 6, maiusc: true, lista: 'estadosCivis', dica: 'Normalmente só para alunos da EJA.' },
      { k: 'aluno.profissao', r: 'Profissão do aluno (EJA)', w: 6, maiusc: true }
    ]
  },
  {
    id: 'familia', titulo: 'Família', icone: '👨‍👩‍👧',
    ajuda: 'Pais ou responsáveis. A "Filiação/Resp. 1" e a "Filiação/Resp. 2" aparecem na capa da pasta.',
    campos: [
      { sub: 'Filiação / Responsável 1' },
      { k: 'resp1.nome', r: 'Nome', w: 8, maiusc: true },
      { k: 'resp1.nascimento', r: 'Data de nascimento', t: 'data', w: 4 },
      { k: 'resp1.escolaridade', r: 'Escolaridade', t: 'select', op: OP.escolaridade, w: 5 },
      { k: 'resp1.profissao', r: 'Profissão', w: 4, maiusc: true },
      { k: 'resp1.falecido', r: 'Falecido?', t: 'botoes', op: OP.naoSim, w: 3 },
      { sub: 'Filiação / Responsável 2' },
      { k: 'resp2.nome', r: 'Nome', w: 8, maiusc: true },
      { k: 'resp2.nascimento', r: 'Data de nascimento', t: 'data', w: 4 },
      { k: 'resp2.escolaridade', r: 'Escolaridade', t: 'select', op: OP.escolaridade, w: 5 },
      { k: 'resp2.profissao', r: 'Profissão', w: 4, maiusc: true },
      { k: 'resp2.falecido', r: 'Falecido?', t: 'botoes', op: OP.naoSim, w: 3 },
      { sub: 'Quem está fazendo a matrícula?' },
      { k: 'responsavelMatricula', r: 'Responsável pela matrícula', t: 'botoes', op: OP.responsavel, w: 8, dica: 'Esse nome vai no Termo de Uso de Imagem.' },
      { k: 'cpfResponsavel', r: 'CPF do responsável', t: 'cpf', w: 4 },
      { k: 'responsavelOutro', r: 'Nome da pessoa responsável', w: 12, maiusc: true, se: d => d.responsavelMatricula === 'outro' }
    ]
  },
  {
    id: 'endereco', titulo: 'Endereço', icone: '🏠',
    ajuda: 'Onde o aluno mora e como falar com a família.',
    campos: [
      { k: 'endereco.logradouro', r: 'Endereço (rua, quadra, lote, número)', w: 12, maiusc: true },
      { k: 'endereco.setor', r: 'Setor / bairro', w: 6, maiusc: true },
      { k: 'endereco.cidade', r: 'Cidade', w: 4, maiusc: true, lista: 'cidades' },
      { k: 'endereco.uf', r: 'U.F.', t: 'select', op: UFS, w: 2 },
      { k: 'endereco.cep', r: 'CEP', t: 'cep', w: 4 },
      { k: 'endereco.telefone1', r: 'Telefone', t: 'telefone', w: 4 },
      { k: 'endereco.telefone2', r: 'Outro telefone', t: 'telefone', w: 4 },
      { k: 'endereco.email', r: 'E-mail do responsável', t: 'email', w: 12 }
    ]
  },
  {
    id: 'documentos', titulo: 'Documentos', icone: '🪪',
    ajuda: 'Preencha só os documentos que o aluno tiver. Certidão modelo novo = número grande (matrícula de 32 dígitos).',
    campos: [
      { sub: 'Certidão de nascimento' },
      { k: 'aluno.certNovo', r: 'Certidão modelo novo nº (matrícula)', w: 12, dica: 'Ex.: 025635 01 55 2018 1 00404 190 014057 61' },
      { k: 'aluno.certNumero', r: 'Certidão modelo antigo nº', w: 6 },
      { k: 'aluno.certFolha', r: 'Folha', w: 3 },
      { k: 'aluno.certLivro', r: 'Livro', w: 3 },
      { sub: 'Certidão de casamento (se tiver)' },
      { k: 'aluno.casNumero', r: 'Certidão de casamento nº', w: 6 },
      { k: 'aluno.casFolha', r: 'Folha', w: 3 },
      { k: 'aluno.casLivro', r: 'Livro', w: 3 },
      { sub: 'Outros documentos do aluno' },
      { k: 'aluno.cpf', r: 'CPF do aluno', t: 'cpf', w: 4 },
      { k: 'aluno.nis', r: 'NIS', w: 4 },
      { k: 'aluno.rg', r: 'RG', w: 4 },
      { k: 'aluno.rgOrgao', r: 'Órgão expedidor', w: 4, maiusc: true, dica: 'Ex.: SSP/GO' },
      { k: 'aluno.rgData', r: 'Data de expedição do RG', t: 'data', w: 4 },
      { k: 'aluno.vacina', r: 'Cartão de vacina?', t: 'botoes', op: OP.simNao, w: 4 },
      { k: 'aluno.sus', r: 'Tem Cartão do SUS?', t: 'botoes', op: OP.simNao, w: 4 },
      { k: 'aluno.susNumero', r: 'Número do Cartão do SUS', t: 'sus', w: 8, se: d => d.aluno.sus !== 'nao' }
    ]
  },
  {
    id: 'acolhimento', titulo: 'Acolhimento', icone: '🤝',
    ajuda: 'Pertencimento cultural e necessidades educacionais. Pergunte à família com calma.',
    campos: [
      { sub: 'Pertencimento' },
      { k: 'aluno.indigena', r: 'Pertencimento indígena?', t: 'botoes', op: OP.naoSim, w: 5 },
      { k: 'aluno.povoEtnia', r: 'Povo / etnia', w: 7, maiusc: true, se: d => d.aluno.indigena === 'sim' },
      { k: 'aluno.quilombola', r: 'Vínculo / residência em comunidade quilombola?', t: 'botoes', op: OP.naoSim, w: 5 },
      { k: 'aluno.comunidade', r: 'Qual comunidade?', w: 7, maiusc: true, se: d => d.aluno.quilombola === 'sim' },
      { k: 'aluno.outroPertencimento', r: 'Outro pertencimento cultural que a família deseja informar', w: 12, maiusc: true },
      { sub: 'Necessidades educacionais' },
      { k: 'aluno.nee', r: 'Necessidades Educacionais Especiais?', t: 'botoes', op: OP.naoSim, w: 6 },
      { k: 'aluno.aee', r: 'Atendimento Educacional Especializado (AEE)?', t: 'botoes', op: OP.aee, w: 6 },
      { k: 'aluno.discriminacao', r: 'Situação anterior de preconceito / discriminação racial ou étnica?', t: 'botoes', op: OP.discriminacao, w: 12 }
    ]
  },
  {
    id: 'matricula', titulo: 'Matrícula', icone: '🏫',
    ajuda: 'Para qual turma o aluno vai e como está chegando à escola.',
    campos: [
      { k: 'matricula.etapa', r: 'Matrícula requerida para', t: 'botoes', op: OP.etapa, w: 12 },
      { k: 'matricula.pasta', r: 'Nº da Pasta Processo', w: 4, dica: 'Já vem com o próximo número livre.' },
      { k: 'matricula.sistema', r: 'Nº no sistema', w: 4, dica: 'Aparece na Ficha de Arquivo.' },
      { k: 'matricula.ano', r: 'Ano / série', t: 'botoes', opDe: d => OP.ano[d.matricula.etapa] || OP.ano['Ensino Fundamental'], w: 12, livre: true },
      { k: 'matricula.turno', r: 'Turno', t: 'botoes', op: OP.turno, w: 8 },
      { k: 'matricula.semestre', r: 'Semestre (EJA)', t: 'botoes', op: OP.semestre, w: 4, se: d => d.matricula.etapa === 'EJA' },
      { k: 'matricula.data', r: 'Data da matrícula', t: 'data', w: 4 },
      { k: 'matricula.atraves', r: 'Através de', t: 'botoes', op: OP.atraves, w: 8 },
      { k: 'matricula.documentacao', r: 'Documentação escolar', t: 'botoes', op: OP.documentacao, w: 12 },
      { k: 'matricula.observacao', r: 'Observação', t: 'texto', w: 12 },
      { t: 'historico' }
    ]
  }
];

function novoAluno(config) {
  const hoje = hojeISO();
  return {
    aluno: {
      nome: '', nomeSocial: '', regEscolar: '', nascimento: '', sexo: '', naturalidade: (config.cidade || '').toUpperCase(), ufNaturalidade: config.uf || 'GO',
      estadoCivil: '', profissao: '', irmaos: '', irmaosNaEscola: '', corRaca: '', indigena: 'nao', povoEtnia: '', quilombola: 'nao', comunidade: '',
      outroPertencimento: '', vacina: '', religiao: '', nis: '', cpf: '', certNovo: '', certNumero: '', certFolha: '', certLivro: '',
      casNumero: '', casFolha: '', casLivro: '', rg: '', rgOrgao: '', rgData: '', sus: '', susNumero: '', nee: 'nao', aee: 'nao', discriminacao: 'nao'
    },
    resp1: { nome: '', nascimento: '', falecido: 'nao', escolaridade: '', profissao: '' },
    resp2: { nome: '', nascimento: '', falecido: 'nao', escolaridade: '', profissao: '' },
    responsavelMatricula: 'resp1', responsavelOutro: '', cpfResponsavel: '',
    endereco: { logradouro: '', setor: '', cidade: (config.cidade || '').toUpperCase(), uf: config.uf || 'GO', cep: '', telefone1: '', telefone2: '', email: '' },
    matricula: { pasta: String(config.proximaPasta || ''), sistema: '', etapa: 'Ensino Fundamental', ano: '', semestre: '', turno: '', data: hoje, atraves: '', documentacao: '', observacao: '' },
    historico: []
  };
}

// Completa um aluno com campos que faltem (ex.: dados importados ou de versões antigas)
function completarAluno(a, config) {
  const base = novoAluno(config);
  const out = { ...base, ...a };
  for (const k of ['aluno', 'resp1', 'resp2', 'endereco', 'matricula']) out[k] = { ...base[k], ...(a[k] || {}) };
  out.historico = Array.isArray(a.historico) ? a.historico : [];
  return out;
}

// ---- utilidades ----
function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function pegar(obj, caminho) { return caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function definir(obj, caminho, valor) {
  const p = caminho.split('.'); let o = obj;
  for (let i = 0; i < p.length - 1; i++) o = o[p[i]] = o[p[i]] || {};
  o[p[p.length - 1]] = valor;
}
function dataBR(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}
function dataExtenso(iso, mesMaiusculo = false) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  const mes = MESES[+m - 1] || '';
  return `${d} de ${mesMaiusculo ? mes : mes.toLowerCase()} de ${a}`;
}
function idade(iso) {
  if (!iso) return null;
  const [a, m, d] = iso.split('-').map(Number);
  const h = new Date();
  let i = h.getFullYear() - a;
  if (h.getMonth() + 1 < m || (h.getMonth() + 1 === m && h.getDate() < d)) i--;
  return i;
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
function rotuloDe(lista, valor) {
  const item = (lista || []).find(o => (Array.isArray(o) ? o[0] : o) === valor);
  return item ? (Array.isArray(item) ? item[1] : item) : (valor || '');
}
function nomeResponsavel(d) {
  if (d.responsavelMatricula === 'resp2') return d.resp2.nome;
  if (d.responsavelMatricula === 'outro') return d.responsavelOutro;
  return d.resp1.nome;
}

const MASCARAS = {
  cpf: v => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  cep: v => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'),
  telefone: v => {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length <= 2) return n.length ? `(${n}` : '';
    if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  },
  sus: v => v.replace(/\D/g, '').slice(0, 15).replace(/(\d{3})(\d)/, '$1 $2').replace(/(\d{3} \d{4})(\d)/, '$1 $2').replace(/(\d{3} \d{4} \d{4})(\d)/, '$1 $2')
};

function cpfValido(cpf) {
  const n = String(cpf || '').replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  for (const t of [9, 10]) {
    let s = 0;
    for (let i = 0; i < t; i++) s += +n[i] * (t + 1 - i);
    if (((s * 10) % 11) % 10 !== +n[t]) return false;
  }
  return true;
}
