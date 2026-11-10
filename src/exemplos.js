// Gera 30 alunas fictícias para testar o app (Configurações › Carregar exemplos).
function gerarExemplos(config) {
  const alunos = [];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const num = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const dig = n => Array.from({ length: n }, () => num(0, 9)).join('');
  function cpf() {
    const n = Array.from({ length: 9 }, () => num(0, 9));
    for (const t of [9, 10]) { let s = 0; for (let i = 0; i < t; i++) s += n[i] * (t + 1 - i); n.push(((s * 10) % 11) % 10); }
    const s = n.join(''); return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
  }
  const nomes = ['ALICE', 'HELENA', 'LAURA', 'MARIA CLARA', 'VALENTINA', 'HELOÍSA', 'MARIA LUÍSA', 'CECÍLIA', 'ISABELLA', 'LÍVIA', 'MANUELA', 'SOPHIA', 'LARA', 'JÚLIA', 'BEATRIZ', 'LORENA', 'MARIA EDUARDA', 'GIOVANNA', 'ANA LUIZA', 'YASMIN', 'EMANUELLY', 'ESTHER', 'REBECA', 'AGATHA', 'MELISSA', 'NICOLE', 'CLARA', 'MARINA', 'ISADORA', 'LETÍCIA'];
  const sobren = ['SILVA', 'SANTOS', 'OLIVEIRA', 'SOUZA', 'RODRIGUES', 'FERREIRA', 'ALVES', 'PEREIRA', 'LIMA', 'GOMES', 'COSTA', 'RIBEIRO', 'MARTINS', 'CARVALHO', 'ARAÚJO', 'MENDES', 'BARBOSA', 'ROCHA', 'DIAS', 'NASCIMENTO', 'MOREIRA', 'CARDOSO', 'TEIXEIRA', 'CAMPOS'];
  const pais = ['JOSÉ', 'CARLOS', 'PAULO', 'MARCOS', 'ANDERSON', 'RODRIGO', 'FÁBIO', 'LEANDRO', 'THIAGO', 'WELLINGTON', 'DIEGO', 'RAFAEL', 'EDUARDO', 'JULIANO', 'RENATO'];
  const maes = ['ANA PAULA', 'FERNANDA', 'JULIANA', 'PATRÍCIA', 'ALINE', 'CAMILA', 'VANESSA', 'DANIELA', 'PRISCILA', 'KÁTIA', 'SIMONE', 'TATIANE', 'LUCIANA', 'CRISTIANE', 'RENATA'];
  const setores = ['JUNDIAÍ', 'JARDIM ALEXANDRINA', 'VILA JAIARA', 'BAIRRO DE LOURDES', 'SETOR CENTRAL', 'JARDIM PROGRESSO', 'VILA SÃO JOSÉ', 'PARQUE DAS NAÇÕES', 'RECANTO DO SOL', 'BAIRRO BOA VISTA'];
  const profs = ['MOTORISTA', 'PEDREIRO', 'VENDEDOR(A)', 'AUXILIAR ADMINISTRATIVO', 'COZINHEIRO(A)', 'COSTUREIRA', 'DO LAR', 'PROFESSOR(A)', 'COMERCIANTE', 'ELETRICISTA', 'DIARISTA', 'TÉCNICO(A) DE ENFERMAGEM', 'AUTÔNOMO(A)'];
  const esc = ['ENSINO FUNDAMENTAL COMPLETO', 'ENSINO MÉDIO INCOMPLETO', 'ENSINO MÉDIO COMPLETO', 'ENSINO MÉDIO COMPLETO', 'ENSINO SUPERIOR COMPLETO', 'ENSINO SUPERIOR INCOMPLETO'];
  const anos = ['1º', '2º', '3º', '4º', '5º'];
  const d2 = n => String(n).padStart(2, '0');
  const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  let pastaN = Math.max(config.proximaPasta || 1, 1);
  const agora = new Date().toISOString();
  
  for (let i = 0; i < 30; i++) {
    const s1 = pick(sobren), s2 = pick(sobren.filter(x => x !== s1));
    const pai = `${pick(pais)} ${pick(sobren)} ${s2}`, mae = `${pick(maes)} ${pick(sobren)} ${s1}`;
    const ai = num(0, 4), anoNasc = 2026 - 6 - ai - (rnd() < 0.3 ? 1 : 0);
    const nasc = `${anoNasc}-${d2(num(1, 12))}-${d2(num(1, 28))}`;
    const historico = [];
    for (let k = 0; k < ai; k++) historico.push({ ano: anos[k], etapa: '-', semestre: '-', turno: pick(['MAT.', 'VESP.']), data: `${2026 - ai + k}-${d2(num(1, 2))}-${d2(num(5, 28))}` });
    const nee = rnd() < 0.1 ? 'sim' : 'nao';
    alunos.push({
      id: 'exemplo-' + Date.now().toString(36) + '-' + i, exemplo: true, criadoEm: agora, atualizadoEm: agora,
      aluno: {
        nome: `${nomes[i]} ${s1} ${s2}`, nomeSocial: '', regEscolar: String(num(10000, 99999)), nascimento: nasc, sexo: 'FEM.',
        naturalidade: rnd() < 0.8 ? 'ANÁPOLIS' : pick(['GOIÂNIA', 'BRASÍLIA', 'NERÓPOLIS']), ufNaturalidade: 'GO',
        estadoCivil: '', profissao: '', irmaos: String(num(0, 3)), irmaosNaEscola: String(num(0, 1)),
        corRaca: pick(['Parda', 'Parda', 'Branca', 'Preta', 'Não declarado', 'Amarela']),
        indigena: 'nao', povoEtnia: '', quilombola: 'nao', comunidade: '', outroPertencimento: '',
        vacina: rnd() < 0.9 ? 'sim' : 'nao', religiao: pick(['CATÓLICO', 'EVANGÉLICO', 'EVANGÉLICO', 'ESPÍRITA', 'SEM RELIGIÃO']),
        nis: rnd() < 0.5 ? dig(11) : '', cpf: cpf(),
        certNovo: `0${dig(5)} 01 55 ${anoNasc} 1 ${dig(5)} ${dig(3)} ${dig(6)} ${dig(2)}`,
        certNumero: '', certFolha: '', certLivro: '', casNumero: '', casFolha: '', casLivro: '', rg: '', rgOrgao: '', rgData: '',
        sus: 'sim', susNumero: `7${dig(2)} ${dig(4)} ${dig(4)} ${dig(4)}`,
        nee, aee: nee === 'sim' ? pick(['sim', 'avaliacao']) : 'nao', discriminacao: 'nao'
      },
      resp1: { nome: pai, nascimento: `${num(1978, 1998)}-${d2(num(1, 12))}-${d2(num(1, 28))}`, falecido: 'nao', escolaridade: pick(esc), profissao: pick(profs) },
      resp2: { nome: mae, nascimento: `${num(1980, 2000)}-${d2(num(1, 12))}-${d2(num(1, 28))}`, falecido: 'nao', escolaridade: pick(esc), profissao: pick(profs) },
      responsavelMatricula: rnd() < 0.8 ? 'resp2' : 'resp1', responsavelOutro: '', cpfResponsavel: cpf(),
      endereco: {
        logradouro: `RUA ${num(1, 60)}, QD ${num(1, 40)}, LT ${num(1, 30)}`, setor: pick(setores), cidade: 'ANÁPOLIS', uf: 'GO', cep: `75${dig(3)}-${dig(3)}`,
        telefone1: `(62) 9${dig(4)}-${dig(4)}`, telefone2: rnd() < 0.4 ? `(62) 9${dig(4)}-${dig(4)}` : '',
        email: rnd() < 0.6 ? `${semAcento(mae.split(' ')[0]).toLowerCase()}${num(10, 99)}@exemplo.com` : ''
      },
      matricula: {
        pasta: String(pastaN++), sistema: String(num(100000, 999999)), etapa: 'Ensino Fundamental', ano: anos[ai], semestre: '',
        turno: pick(['MAT.', 'VESP.']), data: `2026-${d2(num(1, 2))}-${d2(num(5, 28))}`,
        atraves: ai === 0 ? pick(['classificacao', 'transferencia']) : 'continuidade', documentacao: rnd() < 0.8 ? 'completa' : 'incompleta', observacao: ''
      },
      historico
    });
  }
  
  return { alunos, proximaPasta: pastaN };
}

module.exports = { gerarExemplos };
