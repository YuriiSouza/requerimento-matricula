// Lê uma planilha antiga "REQUERIMENTO DE MATRÍCULA" (.xls/.xlsx) e converte para o formato do app.
const XLSX = require('xlsx');

const MESES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

function serialParaISO(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  const d = new Date(Math.round((n - 25569) * 86400000));
  return d.toISOString().slice(0, 10);
}

function textoParaISO(v) {
  if (typeof v === 'number') return serialParaISO(v);
  const m = String(v || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return '';
  let a = +m[3]; if (a < 100) a += a > 50 ? 1900 : 2000;
  return `${a}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
}

function importarPlanilha(arquivo) {
  const wb = XLSX.readFile(arquivo);
  const s = wb.Sheets['Requerimento'] || wb.Sheets[wb.SheetNames[0]];
  const pasta = wb.Sheets['Pasta Processo'];
  const v = (end, folha = s) => {
    const c = folha && folha[end];
    if (!c || c.v === undefined || c.v === null) return '';
    return typeof c.v === 'string' ? c.v.trim() : c.v;
  };
  const t = end => String(v(end)).trim();
  const isX = end => /^x$/i.test(t(end));

  // Em cada linha de Sim/Não, o "X" fica logo depois da opção marcada (às vezes antes).
  // opcoes: { coluna: valor }
  function marcado(linha, opcoes, padrao = '') {
    const cols = 'BCDEFGHIJKLMNOPQRSTU'.split('');
    const xCol = cols.find(c => isX(c + linha));
    if (!xCol) return padrao;
    const xi = cols.indexOf(xCol);
    const lista = Object.keys(opcoes).map(c => ({ i: cols.indexOf(c), val: opcoes[c] }));
    const antes = lista.filter(o => o.i < xi).sort((a, b) => b.i - a.i)[0];
    const depois = lista.filter(o => o.i > xi).sort((a, b) => a.i - b.i)[0];
    return (antes || depois || {}).val ?? padrao;
  }

  // Data de nascimento do aluno: dia / mês por extenso / ano
  let nascAluno = '';
  const dia = parseInt(v('D13'), 10), ano = parseInt(v('P13'), 10);
  const mes = MESES.indexOf(t('J13').toUpperCase()) + 1;
  if (dia && mes && ano) nascAluno = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

  const respMat = t('E22');
  const responsavel = /2/.test(respMat) ? 'resp2' : /1/.test(respMat) ? 'resp1' : respMat ? 'outro' : 'resp1';

  // Tabela "Comp. de Ensino" (linhas 77 a 95)
  const linhas = [];
  for (let r = 77; r <= 95; r++) {
    const ano_ = t('B' + r), etapa = t('D' + r), sem = t('F' + r), turno = t('G' + r), data = v('O' + r);
    if (ano_ || (typeof data === 'number')) {
      linhas.push({ ano: ano_, etapa: etapa === '-' ? '' : etapa, semestre: sem === '-' ? '' : sem, turno, data: textoParaISO(data) });
    }
  }
  const atual = linhas.pop() || {};

  const etapaTxt = (atual.etapa || '').toUpperCase();
  const etapa = etapaTxt.includes('EJA') ? 'EJA' : etapaTxt.includes('INF') ? 'Educação Infantil' : 'Ensino Fundamental';

  const cor = t('O24');

  return {
    aluno: {
      nome: t('D10'),
      nomeSocial: t('D11'),
      regEscolar: t('D12'),
      nascimento: nascAluno,
      sexo: /FEM/i.test(t('T13')) ? 'FEM.' : /MASC/i.test(t('T13')) ? 'MASC.' : '',
      naturalidade: t('D14'),
      ufNaturalidade: t('T14'),
      estadoCivil: t('D19'),
      profissao: t('N19') || t('O19') || t('P19'),
      irmaos: t('D24'),
      irmaosNaEscola: t('K24') || t('L24'),
      corRaca: cor ? cor.charAt(0).toUpperCase() + cor.slice(1).toLowerCase() : '',
      indigena: marcado(25, { E: 'nao', G: 'sim' }, 'nao'),
      povoEtnia: t('K25') || t('L25'),
      quilombola: marcado(27, { H: 'nao', J: 'sim' }, 'nao'),
      comunidade: t('N27') || t('O27'),
      outroPertencimento: t('I29') || t('J29'),
      vacina: marcado(31, { G: 'sim', I: 'nao' }),
      religiao: t('L31'),
      nis: t('C63'),
      cpf: t('S41'),
      certNovo: t('G39'),
      certNumero: t('E40'),
      certFolha: t('L40'),
      certLivro: t('O40'),
      casNumero: t('E41'),
      casFolha: t('L41'),
      casLivro: t('O41'),
      rg: t('C42'),
      rgOrgao: t('M42'),
      rgData: textoParaISO(v('R42')),
      sus: marcado(44, { F: 'sim', H: 'nao' }),
      susNumero: t('L44'),
      nee: marcado(67, { J: 'nao', L: 'sim' }, 'nao'),
      aee: marcado(69, { J: 'nao', L: 'sim', O: 'avaliacao' }, 'nao'),
      discriminacao: marcado(71, { J: 'nao', L: 'sim' }, 'nao')
    },
    resp1: {
      nome: t('D15'),
      nascimento: textoParaISO(v('R15')),
      falecido: marcado(17, { E: 'sim', H: 'nao' }, 'nao'),
      escolaridade: t('K17'),
      profissao: t('R17')
    },
    resp2: {
      nome: t('D18'),
      nascimento: textoParaISO(v('R18')),
      falecido: marcado(21, { E: 'sim', H: 'nao' }, 'nao'),
      escolaridade: t('K21'),
      profissao: t('R21')
    },
    responsavelMatricula: responsavel,
    responsavelOutro: responsavel === 'outro' ? respMat : '',
    cpfResponsavel: t('Q22'),
    endereco: {
      logradouro: t('D33'),
      setor: t('D34'),
      cidade: t('P34'),
      uf: t('U34'),
      cep: t('C35') || t('D35'),
      telefone1: t('I35').replace(/^\(\s*\)$/, ''),
      telefone2: t('P35').replace(/^\(\s*\)$/, ''),
      email: t('E36')
    },
    matricula: {
      pasta: String(v('F2', pasta) || ''),
      sistema: '',
      etapa,
      ano: atual.ano || '',
      semestre: atual.semestre || '',
      turno: atual.turno || '',
      data: atual.data || '',
      atraves: '',
      documentacao: '',
      observacao: t('D97')
    },
    historico: linhas
  };
}

module.exports = { importarPlanilha };
