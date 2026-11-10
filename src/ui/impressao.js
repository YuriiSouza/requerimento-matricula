/* global OP, esc, dataBR, dataExtenso, rotuloDe, nomeResponsavel, completarAluno, MESES */

// ---- peças ----
const C = (rot, val, flex = 1, estilo = '') =>
  `<div class="c" style="flex:${flex};${estilo}"><span class="r">${rot}</span><span class="v">${esc(val)}</span></div>`;
const chk = (marcado, rot) => `<span class="chk"><b>${marcado ? 'X' : ''}</b>${rot}</span>`;
const chks = (rot, valor, opcoes) =>
  `<div class="c" style="flex:0 0 auto"><span class="r">${rot}</span><span class="chks">${opcoes.map(([v, r]) => chk(valor === v, r)).join('')}</span></div>`;
const L = (...partes) => `<div class="linha">${partes.join('')}</div>`;
const SIM_NAO = [['sim', 'Sim'], ['nao', 'Não']];
const NAO_SIM = [['nao', 'Não'], ['sim', 'Sim']];

function cabecalho(cfg) {
  return `<div class="cab">
    ${cfg.logo ? `<img src="${cfg.logo}" alt="">` : ''}
    <div class="cab-txt">${esc(cfg.prefeitura)}<br>${esc(cfg.secretaria)}<br>${esc(cfg.escola)}</div>
  </div>`;
}

function nascAlunoTexto(iso) {
  if (!iso) return ['', '', ''];
  const [a, m, d] = iso.split('-');
  return [d, MESES[+m - 1] || '', a];
}

// ---- 1. Requerimento ----
function paginaRequerimento(d, cfg) {
  const a = d.aluno, r1 = d.resp1, r2 = d.resp2, e = d.endereco, m = d.matricula;
  const [dia, mes, ano] = nascAlunoTexto(a.nascimento);
  const respTxt = rotuloDe(OP.responsavel, d.responsavelMatricula) + (d.responsavelMatricula === 'outro' && d.responsavelOutro ? ': ' + d.responsavelOutro : '');

  const linhasComp = [...(d.historico || [])];
  if (m.ano || m.data) linhasComp.push({ ano: m.ano, etapa: m.etapa === 'EJA' ? 'EJA' : '-', semestre: m.semestre || '-', turno: m.turno, data: m.data });
  while (linhasComp.length < 6) linhasComp.push({});

  return `<div class="pagina req">
    ${cabecalho(cfg)}
    <div class="titulo">REQUERIMENTO DE MATRÍCULA E IDENTIFICAÇÃO ESCOLAR</div>

    ${L(C('Aluno(a):', a.nome))}
    ${L(C('Nome Social:', a.nomeSocial), C('Reg. Escolar:', a.regEscolar, 0.55))}
    ${L(C('Data de Nasc.:', dia, 0.32), C('de', mes, 0.6), C('de', ano, 0.3), C('Sexo:', a.sexo, 0.3))}
    ${L(C('Natural de:', a.naturalidade), C('U.F.', a.ufNaturalidade, 0.15))}
    ${L(C('Filiação/Resp. 1:', r1.nome), C('Data de Nasc.:', dataBR(r1.nascimento), 0.4))}
    ${L(chks('Falecido:', r1.falecido, SIM_NAO), C('Escolaridade:', r1.escolaridade, 1.1), C('Profissão:', r1.profissao, 0.8))}
    ${L(C('Filiação/Resp. 2:', r2.nome), C('Data de Nasc.:', dataBR(r2.nascimento), 0.4))}
    ${L(chks('Falecido:', r2.falecido, SIM_NAO), C('Escolaridade:', r2.escolaridade, 1.1), C('Profissão:', r2.profissao, 0.8))}
    ${L(C('Estado Civil:', a.estadoCivil), C('Profissão do aluno:', a.profissao))}
    ${L(C('Responsável pela matrícula:', respTxt, 1.4), C('CPF:', d.cpfResponsavel, 0.7))}
    ${L(C('Irmãos:', a.irmaos, 0.35), C('Quantidade na Escola:', a.irmaosNaEscola, 0.55), C('Cor/raça:', a.corRaca, 0.8))}
    ${L(chks('Pertencimento indígena:', a.indigena, NAO_SIM), C('Povo/etnia:', a.povoEtnia))}
    ${L(chks('Vínculo/residência em comunidade quilombola:', a.quilombola, NAO_SIM), C('Comunidade:', a.comunidade))}
    ${L(C('Outro pertencimento cultural que a família deseja informar:', a.outroPertencimento))}
    ${L(chks('Cartão de Vacina:', a.vacina, SIM_NAO), C('Religião:', a.religiao))}
    ${L(C('Endereço:', e.logradouro))}
    ${L(C('Setor:', e.setor), C('Cidade:', e.cidade, 0.7), C('U.F.', e.uf, 0.15))}
    ${L(C('CEP:', e.cep, 0.5), C('Telefone:', e.telefone1, 0.8), C('Telefone:', e.telefone2, 0.8))}
    ${L(C('Email do Responsável:', e.email))}

    <div class="secao">DOCUMENTAÇÃO PESSOAL</div>
    ${L(C('Cert. Nasc. Modelo Novo nº:', a.certNovo))}
    ${L(C('Cert. Nasc. nº:', a.certNumero), C('Folha:', a.certFolha, 0.35), C('L:', a.certLivro, 0.35))}
    ${L(C('Cert. Casamento nº:', a.casNumero), C('Folha:', a.casFolha, 0.35), C('L:', a.casLivro, 0.35), C('CPF:', a.cpf, 0.8))}
    ${L(C('R.G:', a.rg), C('Órgão Exp.', a.rgOrgao, 0.6), C('Data de Exp.:', dataBR(a.rgData), 0.6))}
    ${L(chks('Cartão do SUS:', a.sus, SIM_NAO), C('Número:', a.susNumero), C('NIS:', a.nis, 0.8))}

    <div class="secao">MATRÍCULA REQUERIDA PARA</div>
    ${L(`<div class="chks">${OP.etapa.map(et => chk(m.etapa === et, et)).join('')}</div>`, C('Ano:', m.ano, 0.6), C('Turno:', rotuloDe(OP.turno, m.turno), 0.6))}
    <div class="secao">ATRAVÉS DE</div>
    ${L(`<div class="chks" style="flex:1;justify-content:space-around">${OP.atraves.map(([v, r]) => chk(m.atraves === v, r.toUpperCase())).join('')}</div>`)}
    <div class="secao">DOCUMENTAÇÃO ESCOLAR</div>
    ${L(`<div class="chks" style="flex:1;justify-content:space-around">${OP.documentacao.map(([v, r]) => chk(m.documentacao === v, r.toUpperCase())).join('')}</div>`)}

    <div class="secao">NECESSIDADES EDUCACIONAIS E ACOLHIMENTO</div>
    ${L(chks('Necessidades Educacionais Especiais:', a.nee, NAO_SIM))}
    ${L(chks('Atendimento Educacional Especializado (AEE):', a.aee, OP.aee))}
    ${L(chks('Situação anterior de preconceito/discriminação racial ou étnica:', a.discriminacao, [['nao', 'Não'], ['sim', 'Sim - prefiro conversar individualmente']]))}

    <table class="comp">
      <thead>
        <tr><th colspan="4">Comp. de Ensino</th><th rowspan="2">ASSINATURA DO RESPONSÁVEL</th><th rowspan="2">DATA<br>MATRIC.</th><th rowspan="2">ASS.<br>FUNC.</th><th rowspan="2">DEFERIMENTO<br>DIRETOR</th></tr>
        <tr><th>ANO</th><th>ETAPA</th><th>SEM.</th><th>TURNO</th></tr>
      </thead>
      <tbody>
        ${linhasComp.map(l => `<tr><td style="width:11mm">${esc(l.ano)}</td><td style="width:13mm">${esc(l.etapa)}</td><td style="width:10mm">${esc(l.semestre)}</td><td style="width:13mm">${esc(l.turno)}</td><td></td><td style="width:22mm">${esc(dataBR(l.data))}</td><td style="width:20mm"></td><td style="width:24mm"></td></tr>`).join('')}
      </tbody>
    </table>
    <div class="obs"><b>OBSERVAÇÃO:</b> <span class="v2">${esc(m.observacao)}</span></div>
  </div>`;
}

// ---- 2. Pasta processo ----
function paginaPasta(d, cfg) {
  const a = d.aluno;
  const [dia, mes, ano] = nascAlunoTexto(a.nascimento);
  const cor = (a.corRaca || '').toUpperCase();
  const racas = ['BRANCA', 'AMARELA', 'PRETA', 'INDÍGENA', 'PARDA'];
  const nee = a.nee === 'sim';
  return `<div class="pagina pasta paisagem">
    ${cabecalho(cfg)}
    <div class="moldura">
      ${L(C('PASTA DE PROCESSO Nº:', d.matricula.pasta, 1, 'font-size:15pt'), C('CPF', a.cpf, 1))}
      ${L(C('NOME DO ALUNO:', a.nome))}
      ${L(C('SEXO:', a.sexo, 0.4), C('DATA DE NASCIMENTO:', dia ? `${+dia} DE ${mes} DE ${ano}` : ''))}
      ${L(C('NATURALIDADE:', a.naturalidade), C('U.F.:', a.ufNaturalidade, 0.25))}
      ${L(C('FILIAÇÃO:', d.resp1.nome))}
      ${L(C('E', d.resp2.nome, 1, 'padding-left:24mm'))}
      <div class="linha"><span class="r">RAÇA/COR:</span></div>
      <div class="racas">${racas.map(r => chk(cor === r, r)).join('')}${cor && !racas.includes(cor) ? chk(true, esc(cor)) : ''}</div>
      <div class="linha" style="margin-top:6mm"><span class="r">PORTADOR DE NECESSIDADES ESPECIAIS?</span><span class="chks" style="margin-left:6mm">${chk(nee, 'SIM')}${chk(!nee, 'NÃO')}</span></div>
    </div>
  </div>`;
}

// ---- 3. Ficha de arquivo ----
// Cada ficha ocupa 1/3 da folha A4: cabem 3 por folha.
function paginasFichas(lista, cfg) {
  const paginas = [];
  for (let i = 0; i < lista.length; i += 3) {
    paginas.push(`<div class="pagina fichas">${lista.slice(i, i + 3).map(d => `<div class="ficha-bloco">${fichaHTML(d, cfg)}</div>`).join('')}</div>`);
  }
  return paginas.join('');
}

function fichaHTML(d, cfg) {
  const a = d.aluno;
  const [dia, mes, ano] = nascAlunoTexto(a.nascimento);
  const sexo = a.sexo === 'FEM.' ? 'FEMININO' : a.sexo === 'MASC.' ? 'MASCULINO' : '';
  const cel = (txt, extra = '') => `<td class="${extra}">${txt}</td>`;
  return `<table class="ficha">
      <colgroup><col style="width:38mm"><col style="width:32mm"><col style="width:18mm"><col style="width:30mm"><col style="width:18mm"><col style="width:14mm"><col style="width:20mm"><col></colgroup>
      <tr>${cfg.logo ? `<td class="ficha-logo"><img src="${cfg.logo}" alt=""></td>` : ''}
          <td colspan="${cfg.logo ? 7 : 8}" class="ficha-cab">${esc(cfg.prefeitura)}<br>${esc(cfg.secretaria)}<br>${esc(cfg.escola)}</td></tr>
      <tr><td colspan="8" class="ficha-tit">FICHA DE ARQUIVO</td></tr>
      <tr>${cel('Nº PROCESSO:', 'rot')}<td colspan="2" class="grande"><u>${esc(d.matricula.pasta)}</u></td>${cel('Nº SISTEMA:', 'rot')}<td colspan="4" class="grande">${esc(d.matricula.sistema)}</td></tr>
      <tr>${cel('NOME:', 'rot')}<td colspan="7" class="val">${esc(a.nome)}</td></tr>
      <tr>${cel('DATA DE NASC:', 'rot')}<td class="val ctr">${esc(dia)}</td><td class="val ctr">de</td><td colspan="2" class="val ctr">${esc(mes)}</td><td class="val ctr">de</td><td colspan="2" class="val">${esc(ano)}</td></tr>
      <tr>${cel('SEXO:', 'rot')}<td class="val">${sexo}</td><td class="rot peq">CIDADE:</td><td colspan="3" class="val">${esc(a.naturalidade)}</td><td class="rot peq">ESTADO:</td><td class="val">${esc(a.ufNaturalidade)}</td></tr>
      <tr>${cel('NOME RESP. 1:', 'rot')}<td colspan="7" class="val">${esc(d.resp1.nome)}</td></tr>
      <tr>${cel('NOME RESP. 2:', 'rot')}<td colspan="7" class="val">${esc(d.resp2.nome)}</td></tr>
    </table>`;
}

// ---- 4. Termo de uso de imagem ----
function paginaTermo(d, cfg) {
  const resp = nomeResponsavel(d) || '______________________________________';
  const turma = [d.matricula.ano, rotuloDe(OP.turno, d.matricula.turno)].filter(Boolean).join(' – ') || '__________';
  const p = s => `<span class="preench">${esc(s)}</span>`;
  return `<div class="pagina termo">
    ${cabecalho(cfg)}
    <h2>Termo de autorização para uso da imagem.</h2>
    <p>Eu, ${p(resp)}, responsável pelo aluno(a): ${p(d.aluno.nome)}, da turma ${p(turma)}, autorizo o uso da imagem em fotos e filmagens, nos termos do artigo 20 do Código Civil, do menor pelo qual sou responsável para serem utilizadas pela ${esc(tituloEscola(cfg.escola))} para fins de apresentação e divulgação da escola em redes sociais, encartes, folders, jornais internos e/ou semelhantes.</p>
    <p>A autorização é concedida a título gratuito e as imagens serão usadas para fins pedagógicos (não comerciais).</p>
    <p>Por assim concordar, declaro que autorizo o uso acima descrito assinando este termo.</p>
    <div class="local">${esc(cfg.cidade || '')}, ${esc(dataExtenso(d.matricula.data) || '____ de ______________ de ______')}.</div>
    <div class="assin">Assinatura do responsável</div>
  </div>`;
}

// "ESCOLA MUNICIPAL PASTOR MIGUEL" -> "Escola Municipal Pastor Miguel"
function tituloEscola(s) {
  const minus = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  return String(s || '').toLowerCase().split(' ').map((w, i) => (i && minus.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ---- montagem ----
let nomeArquivo = 'requerimento';
window.renderizar = ({ aluno, alunos, config, docs }) => {
  // Lote: só fichas de arquivo de vários alunos, 3 por folha
  if (alunos) {
    const lista = alunos.map(a => completarAluno(a, config));
    document.getElementById('paginas').innerHTML = paginasFichas(lista, config);
    nomeArquivo = `Fichas de Arquivo (${lista.length} alunos)`;
    document.title = 'Visualizar impressão – ' + nomeArquivo;
    return true;
  }
  const d = completarAluno(aluno, config);
  const html = [];
  if (docs.includes('requerimento')) html.push(paginaRequerimento(d, config));
  if (docs.includes('pasta')) html.push(paginaPasta(d, config));
  if (docs.includes('ficha')) html.push(paginasFichas([d], config));
  if (docs.includes('termo')) html.push(paginaTermo(d, config));
  document.getElementById('paginas').innerHTML = html.join('');
  nomeArquivo = `Matrícula - ${d.aluno.nome || 'aluno'}`;
  document.title = 'Visualizar impressão – ' + (d.aluno.nome || '');
  return true;
};

document.getElementById('btnImprimir').onclick = () => window.api.imprimir();
document.getElementById('btnPdf').onclick = () => window.api.salvarPdf(nomeArquivo);
document.getElementById('btnFechar').onclick = () => window.close();
