/* global ETAPAS, OP, UFS, MASCARAS, novoAluno, completarAluno, pegar, definir, dataBR, idade, esc, rotuloDe, cpfValido, hojeISO */

const $ = s => document.querySelector(s);
let estado = { alunos: [], config: {} };
let atual = null;        // aluno sendo editado
let etapaAtual = 0;
let alterado = false;

// ---------- Início ----------
async function iniciar() {
  estado = await window.api.lerDados();
  $('#nomeEscola').textContent = estado.config.escola || '';
  criarListasSugestao();
  desenharLista();
  ligarBotoes();
}

function criarListasSugestao() {
  const listas = {
    cidades: ['ANÁPOLIS', 'GOIÂNIA', 'BRASÍLIA', 'APARECIDA DE GOIÂNIA', 'NERÓPOLIS', 'PIRENÓPOLIS', 'ABADIÂNIA', 'CAMPO LIMPO DE GOIÁS', 'GOIANÁPOLIS', 'SILVÂNIA', 'OURO VERDE DE GOIÁS', 'PETROLINA DE GOIÁS'],
    religioes: OP.religiao,
    estadosCivis: OP.estadoCivil
  };
  // acrescenta cidades já usadas
  for (const a of estado.alunos) {
    for (const c of [a.aluno?.naturalidade, a.endereco?.cidade]) if (c && !listas.cidades.includes(c)) listas.cidades.push(c);
  }
  document.querySelectorAll('datalist').forEach(d => d.remove());
  for (const [id, itens] of Object.entries(listas)) {
    const dl = document.createElement('datalist');
    dl.id = id;
    dl.innerHTML = itens.map(i => `<option value="${esc(i)}">`).join('');
    document.body.appendChild(dl);
  }
}

// ---------- Lista de alunos ----------
function semAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

function desenharLista() {
  const termo = semAcento($('#busca').value.trim());
  const alunos = [...estado.alunos]
    .sort((a, b) => (a.aluno?.nome || '').localeCompare(b.aluno?.nome || '', 'pt-BR'))
    .filter(a => !termo || semAcento(a.aluno?.nome).includes(termo) || semAcento(a.resp1?.nome).includes(termo) || semAcento(a.resp2?.nome).includes(termo) || String(a.matricula?.pasta || '') === termo);
  $('#contagem').textContent = `${estado.alunos.length} aluno(s) cadastrado(s)` + (termo ? ` · ${alunos.length} encontrado(s)` : '');
  $('#lista').innerHTML = alunos.length ? alunos.map(a => {
    const m = a.matricula || {};
    const turma = [m.ano, rotuloDe(OP.turno, m.turno)].filter(Boolean).join(' · ');
    return `<li class="item ${atual && atual.id === a.id ? 'ativo' : ''}" data-id="${a.id}">
      <div class="item-nome">${esc(a.aluno?.nome || '(sem nome)')}</div>
      <div class="item-info">${esc(turma || 'turma não informada')}${m.pasta ? ` · Pasta ${esc(m.pasta)}` : ''}</div>
    </li>`;
  }).join('') : `<li class="vazio">${termo ? 'Nenhum aluno encontrado.' : 'Nenhum aluno ainda.'}</li>`;
}

// ---------- Abrir / novo ----------
function podeSair() {
  if (!alterado) return true;
  return confirm('Há alterações que ainda não foram salvas.\n\nDeseja sair sem salvar?');
}

function abrirAluno(a, etapa = 0) {
  atual = completarAluno(JSON.parse(JSON.stringify(a)), estado.config);
  etapaAtual = etapa;
  alterado = false;
  $('#telaInicio').hidden = true;
  $('#telaForm').hidden = false;
  desenharForm();
  desenharLista();
  atualizarTopo();
}

function novo() {
  if (!podeSair()) return;
  abrirAluno(novoAluno(estado.config));
  alterado = false;
  atualizarTopo();
}

function atualizarTopo() {
  $('#topoNome').textContent = atual.aluno.nome || 'Novo aluno';
  $('#topoRotulo').textContent = atual.id ? `Pasta Processo nº ${atual.matricula.pasta || '—'}` : 'Cadastro novo (ainda não salvo)';
  $('#btnExcluir').hidden = !atual.id;
  $('#btnRematricular').hidden = !atual.id;
  $('#status').textContent = alterado ? '● Alterações não salvas' : (atual.id ? '✓ Salvo' : '');
  $('#status').className = 'status ' + (alterado ? 'pendente' : 'ok');
}

function marcarAlterado() {
  alterado = true;
  atualizarTopo();
}

// ---------- Formulário ----------
function desenharEtapas() {
  $('#etapas').innerHTML = ETAPAS.map((e, i) => {
    const falta = camposFaltando(e).length;
    return `<button class="etapa ${i === etapaAtual ? 'ativa' : ''}" data-i="${i}">
      <span class="etapa-num">${i + 1}</span><span class="etapa-ic">${e.icone}</span>${e.titulo}${falta ? '<span class="etapa-alerta" title="Falta preencher campo obrigatório">!</span>' : ''}
    </button>`;
  }).join('');
  $('#btnAnterior').disabled = etapaAtual === 0;
  $('#btnProximo').disabled = etapaAtual === ETAPAS.length - 1;
}

function camposFaltando(etapa) {
  return etapa.campos.filter(c => c.obrig && !String(pegar(atual, c.k) || '').trim());
}

function opcoesDe(c) { return c.opDe ? c.opDe(atual) : c.op; }

function htmlCampo(c) {
  if (c.sub) return `<h3 class="subtitulo c12">${esc(c.sub)}</h3>`;
  if (c.t === 'historico') return htmlHistorico();
  if (c.se && !c.se(atual)) return '';
  const v = pegar(atual, c.k) ?? '';
  const id = 'f_' + c.k.replace(/\./g, '_');
  const req = c.obrig ? ' <i class="obrig">*</i>' : '';
  const dica = c.dica ? `<small class="dica-campo">${esc(c.dica)}</small>` : '';
  let entrada;
  switch (c.t) {
    case 'select':
      entrada = `<select id="${id}" data-k="${c.k}"><option value="">— escolha —</option>${opcoesDe(c).map(o => {
        const [val, rot] = Array.isArray(o) ? o : [o, o];
        return `<option value="${esc(val)}" ${val === v ? 'selected' : ''}>${esc(rot)}</option>`;
      }).join('')}${v && !opcoesDe(c).some(o => (Array.isArray(o) ? o[0] : o) === v) ? `<option selected value="${esc(v)}">${esc(v)}</option>` : ''}</select>`;
      break;
    case 'botoes': {
      const ops = opcoesDe(c);
      const conhecido = ops.some(o => (Array.isArray(o) ? o[0] : o) === v);
      entrada = `<div class="botoes" data-k="${c.k}">${ops.map(o => {
        const [val, rot] = Array.isArray(o) ? o : [o, o];
        return `<button type="button" class="opcao ${val === v ? 'sel' : ''}" data-v="${esc(val)}">${esc(rot)}</button>`;
      }).join('')}${c.livre ? `<input class="livre" data-k="${c.k}" placeholder="outro…" value="${conhecido ? '' : esc(v)}">` : ''}</div>`;
      break;
    }
    case 'data':
      entrada = `<input type="date" id="${id}" data-k="${c.k}" value="${esc(v)}" max="2100-12-31">`;
      if (c.mostraIdade) {
        const i = idade(v);
        entrada += `<small class="dica-campo" id="${id}_idade">${i != null && i >= 0 ? `${i} ano(s) de idade` : ''}</small>`;
      }
      break;
    case 'texto':
      entrada = `<textarea id="${id}" data-k="${c.k}" rows="3">${esc(v)}</textarea>`;
      break;
    case 'numero':
      entrada = `<input type="number" min="0" id="${id}" data-k="${c.k}" value="${esc(v)}">`;
      break;
    default: {
      const mask = MASCARAS[c.t] ? ` data-mask="${c.t}" inputmode="numeric"` : '';
      const tipo = c.t === 'email' ? 'email' : 'text';
      entrada = `<input type="${tipo}" id="${id}" data-k="${c.k}" value="${esc(v)}"${mask}${c.maiusc ? ' data-maiusc="1"' : ''}${c.lista ? ` list="${c.lista}"` : ''} autocomplete="off" spellcheck="false">`;
      if (c.t === 'cpf') entrada += `<small class="dica-campo aviso-cpf" id="${id}_cpf"></small>`;
    }
  }
  return `<div class="campo c${c.w || 12}"><label for="${id}">${esc(c.r)}${req}</label>${entrada}${dica}</div>`;
}

function htmlHistorico() {
  const h = atual.historico || [];
  return `<div class="c12 historico">
    <h3 class="subtitulo">Matrículas anteriores <small>(aparecem na tabela "Comp. de Ensino" do requerimento)</small></h3>
    ${h.length ? `<table><thead><tr><th>Ano</th><th>Etapa</th><th>Sem.</th><th>Turno</th><th>Data</th><th></th></tr></thead><tbody>
      ${h.map((l, i) => `<tr>
        <td><input data-h="${i}" data-c="ano" value="${esc(l.ano)}"></td>
        <td><input data-h="${i}" data-c="etapa" value="${esc(l.etapa)}"></td>
        <td><input data-h="${i}" data-c="semestre" value="${esc(l.semestre)}"></td>
        <td><input data-h="${i}" data-c="turno" value="${esc(l.turno)}"></td>
        <td><input type="date" data-h="${i}" data-c="data" value="${esc(l.data)}"></td>
        <td><button type="button" class="btn-x" data-hdel="${i}" title="Remover linha">✕</button></td>
      </tr>`).join('')}
    </tbody></table>` : '<p class="dica-campo">Nenhuma matrícula anterior registrada.</p>'}
    <button type="button" class="btn btn-leve btn-pequeno" id="btnAddHist">＋ Adicionar matrícula anterior</button>
  </div>`;
}

function desenharForm() {
  desenharEtapas();
  const e = ETAPAS[etapaAtual];
  $('#formArea').innerHTML = `
    <div class="cartao">
      <div class="cartao-cab"><span class="cartao-ic">${e.icone}</span><div><h2>${etapaAtual + 1}. ${e.titulo}</h2><p>${esc(e.ajuda)}</p></div></div>
      <div class="grade">${e.campos.map(htmlCampo).join('')}</div>
    </div>`;
  $('#formArea').scrollTop = 0;
  document.querySelectorAll('[data-mask="cpf"]').forEach(validarCpf);
  const foco = e.campos.find(c => c.foco);
  if (foco && !pegar(atual, foco.k)) setTimeout(() => document.getElementById('f_' + foco.k.replace(/\./g, '_'))?.focus(), 50);
}

function validarCpf(inp) {
  const aviso = document.getElementById(inp.id + '_cpf');
  if (!aviso) return;
  const n = inp.value.replace(/\D/g, '');
  if (!n) { aviso.textContent = ''; return; }
  const ok = n.length === 11 && cpfValido(n);
  aviso.textContent = n.length < 11 ? 'CPF incompleto' : ok ? '✓ CPF válido' : '⚠ CPF com número errado — confira';
  aviso.className = 'dica-campo aviso-cpf ' + (ok ? 'ok' : 'erro');
}

// precisa redesenhar quando um campo controla a visibilidade de outros
const CAMPOS_GATILHO = new Set(['responsavelMatricula', 'aluno.sus', 'aluno.indigena', 'aluno.quilombola', 'matricula.etapa']);

function ligarFormulario() {
  const area = $('#formArea');

  area.addEventListener('input', ev => {
    const el = ev.target;
    if (el.dataset.h !== undefined) {
      atual.historico[+el.dataset.h][el.dataset.c] = el.dataset.c === 'data' ? el.value : el.value.toUpperCase();
      if (el.dataset.c !== 'data') manterCursor(el, el.value.toUpperCase());
      return marcarAlterado();
    }
    const k = el.dataset.k;
    if (!k) return;
    let val = el.value;
    if (el.dataset.mask) val = MASCARAS[el.dataset.mask](val);
    if (el.dataset.maiusc) val = val.toUpperCase();
    if (val !== el.value) manterCursor(el, val);
    if (el.classList.contains('livre')) {
      el.closest('.botoes').querySelectorAll('.opcao').forEach(b => b.classList.remove('sel'));
      val = val.trim();
    }
    definir(atual, k, val);
    if (el.dataset.mask === 'cpf') validarCpf(el);
    if (k === 'aluno.nascimento') {
      const i = idade(val); const s = document.getElementById(el.id + '_idade');
      if (s) s.textContent = i != null && i >= 0 ? `${i} ano(s) de idade` : '';
    }
    if (k === 'aluno.nome') { atualizarTopo(); desenharEtapas(); }
    marcarAlterado();
  });

  area.addEventListener('change', ev => {
    const k = ev.target.dataset.k;
    if (k && CAMPOS_GATILHO.has(k)) desenharForm();
  });

  area.addEventListener('click', ev => {
    const op = ev.target.closest('.opcao');
    if (op) {
      const grupo = op.closest('.botoes');
      const k = grupo.dataset.k;
      const ja = op.classList.contains('sel');
      // clicar de novo desmarca
      definir(atual, k, ja ? '' : op.dataset.v);
      grupo.querySelectorAll('.opcao').forEach(b => b.classList.toggle('sel', !ja && b === op));
      const livre = grupo.querySelector('.livre'); if (livre) livre.value = '';
      if (k === 'matricula.etapa') definir(atual, 'matricula.ano', '');
      marcarAlterado();
      if (CAMPOS_GATILHO.has(k)) desenharForm();
      return;
    }
    if (ev.target.id === 'btnAddHist') {
      atual.historico.push({ ano: '', etapa: '', semestre: '', turno: '', data: '' });
      marcarAlterado(); desenharForm();
      return;
    }
    if (ev.target.dataset.hdel !== undefined) {
      atual.historico.splice(+ev.target.dataset.hdel, 1);
      marcarAlterado(); desenharForm();
    }
  });
}

function manterCursor(el, val) {
  const fim = el.selectionEnd === el.value.length;
  const pos = el.selectionStart;
  el.value = val;
  if (fim) el.setSelectionRange(val.length, val.length);
  else try { el.setSelectionRange(pos, pos); } catch { /* campos sem seleção */ }
}

function irEtapa(i) {
  etapaAtual = Math.max(0, Math.min(ETAPAS.length - 1, i));
  desenharForm();
}

// ---------- Salvar / imprimir ----------
async function salvar() {
  if (!atual) return false;
  if (!atual.aluno.nome.trim()) {
    aviso('Escreva pelo menos o nome do aluno antes de salvar.', 'erro');
    irEtapa(0);
    return false;
  }
  const r = await window.api.salvarAluno(atual);
  atual = r.aluno;
  estado.config = r.config;
  const i = estado.alunos.findIndex(a => a.id === atual.id);
  if (i >= 0) estado.alunos[i] = JSON.parse(JSON.stringify(atual)); else estado.alunos.push(JSON.parse(JSON.stringify(atual)));
  alterado = false;
  atualizarTopo();
  desenharLista();
  aviso('✓ Salvo com sucesso!', 'ok');
  return true;
}

async function imprimir() {
  if (alterado || !atual.id) {
    if (!(await salvar())) return;
  }
  $('#dlgImprimir').showModal();
}

async function confirmarImpressao() {
  const docs = [...document.querySelectorAll('#dlgImprimir input[name=doc]:checked')].map(i => i.value);
  if (!docs.length) return aviso('Marque pelo menos um documento.', 'erro');
  $('#dlgImprimir').close();
  await window.api.visualizar({ aluno: atual, config: estado.config, docs });
}

async function excluir() {
  if (!atual?.id) return;
  if (await window.api.excluirAluno(atual.id)) {
    estado.alunos = estado.alunos.filter(a => a.id !== atual.id);
    atual = null; alterado = false;
    $('#telaForm').hidden = true; $('#telaInicio').hidden = false;
    desenharLista();
    aviso('Cadastro excluído.', 'ok');
  }
}

async function rematricular() {
  if (!podeSair()) return;
  if (!confirm(`Começar uma NOVA matrícula para ${atual.aluno.nome}?\n\nA matrícula atual (${atual.matricula.ano || '?'} ${rotuloDe(OP.turno, atual.matricula.turno)}) vai para a lista de "Matrículas anteriores" e todos os outros dados continuam iguais.`)) return;
  const m = atual.matricula;
  if (m.ano || m.data) {
    atual.historico.push({ ano: m.ano, etapa: m.etapa === 'EJA' ? 'EJA' : '', semestre: m.semestre, turno: m.turno, data: m.data });
  }
  // sugere o próximo ano
  const idx = (OP.ano[m.etapa] || []).indexOf(m.ano);
  const prox = idx >= 0 && m.etapa !== 'EJA' ? (OP.ano[m.etapa][idx + 1] || '') : m.ano;
  atual.matricula = { ...m, ano: prox, data: hojeISO(), atraves: 'continuidade', documentacao: '', observacao: '' };
  irEtapa(ETAPAS.length - 1);
  marcarAlterado();
  aviso('Confira o ano e o turno da nova matrícula e clique em Salvar.', 'ok');
}

// ---------- Importar planilhas ----------
async function importar() {
  if (!podeSair()) return;
  const res = await window.api.importarPlanilha();
  if (!res) return;
  let ok = 0; const erros = [];
  let ultimo = null;
  for (const r of res) {
    if (r.erro || !r.aluno?.aluno?.nome) { erros.push(`${r.arquivo}: ${r.erro || 'nome do aluno não encontrado'}`); continue; }
    const existente = estado.alunos.find(a => a.aluno?.nome === r.aluno.aluno.nome);
    const dados = completarAluno(existente ? { ...r.aluno, id: existente.id, criadoEm: existente.criadoEm } : r.aluno, estado.config);
    const salvo = await window.api.salvarAluno(dados);
    estado.config = salvo.config;
    const i = estado.alunos.findIndex(a => a.id === salvo.aluno.id);
    if (i >= 0) estado.alunos[i] = salvo.aluno; else estado.alunos.push(salvo.aluno);
    ultimo = salvo.aluno; ok++;
  }
  criarListasSugestao();
  desenharLista();
  if (ok === 1 && ultimo) abrirAluno(ultimo);
  alert(`${ok} planilha(s) importada(s).` + (erros.length ? `\n\nNão foi possível importar:\n${erros.join('\n')}` : '') + (ok ? '\n\nConfira os dados de cada aluno — principalmente as marcações de Sim/Não.' : ''));
}

// ---------- Fichas em lote ----------
const loteMarcados = new Set();
function abrirLote() {
  if (!estado.alunos.length) return aviso('Ainda não há alunos cadastrados.', 'erro');
  loteMarcados.clear();
  $('#loteBusca').value = '';
  desenharLote();
  $('#dlgLote').showModal();
}
function alunosLoteFiltrados() {
  const termo = semAcento($('#loteBusca').value.trim());
  return [...estado.alunos]
    .sort((a, b) => (a.aluno?.nome || '').localeCompare(b.aluno?.nome || '', 'pt-BR'))
    .filter(a => {
      const m = a.matricula || {};
      const txt = semAcento([a.aluno?.nome, m.ano, rotuloDe(OP.turno, m.turno), m.pasta].join(' '));
      return !termo || txt.includes(termo);
    });
}
function desenharLote() {
  $('#loteLista').innerHTML = alunosLoteFiltrados().map(a => {
    const m = a.matricula || {};
    return `<label class="lote-item"><input type="checkbox" data-id="${a.id}" ${loteMarcados.has(a.id) ? 'checked' : ''}>
      <span>${esc(a.aluno?.nome || '(sem nome)')}</span><small>${esc([m.ano, rotuloDe(OP.turno, m.turno), m.pasta ? 'Pasta ' + m.pasta : ''].filter(Boolean).join(' · '))}</small></label>`;
  }).join('') || '<p class="dica-campo" style="padding:12px">Nenhum aluno encontrado.</p>';
  const n = loteMarcados.size;
  $('#loteConta').textContent = n ? `${n} aluno(s) · ${Math.ceil(n / 3)} folha(s)` : 'Nenhum marcado';
}
async function confirmarLote() {
  if (!loteMarcados.size) return aviso('Marque pelo menos um aluno.', 'erro');
  const alunos = [...estado.alunos]
    .filter(a => loteMarcados.has(a.id))
    .sort((a, b) => (a.aluno?.nome || '').localeCompare(b.aluno?.nome || '', 'pt-BR'));
  $('#dlgLote').close();
  await window.api.visualizar({ alunos, config: estado.config, docs: ['ficha'] });
}

// ---------- Configurações ----------
let logoTemp = '';
function abrirConfig() {
  const c = estado.config;
  $('#cfgPrefeitura').value = c.prefeitura || '';
  $('#cfgSecretaria').value = c.secretaria || '';
  $('#cfgEscola').value = c.escola || '';
  $('#cfgCidade').value = c.cidade || '';
  $('#cfgUf').value = c.uf || '';
  $('#cfgPasta').value = c.proximaPasta || 1;
  logoTemp = c.logo || '';
  mostrarLogo();
  $('#dlgConfig').showModal();
}
function mostrarLogo() {
  $('#cfgLogoImg').hidden = !logoTemp;
  if (logoTemp) $('#cfgLogoImg').src = logoTemp;
}
async function salvarConfig() {
  estado.config = await window.api.salvarConfig({
    prefeitura: $('#cfgPrefeitura').value.trim().toUpperCase(),
    secretaria: $('#cfgSecretaria').value.trim().toUpperCase(),
    escola: $('#cfgEscola').value.trim().toUpperCase(),
    cidade: $('#cfgCidade').value.trim(),
    uf: $('#cfgUf').value.trim().toUpperCase(),
    proximaPasta: parseInt($('#cfgPasta').value, 10) || 1,
    logo: logoTemp
  });
  $('#nomeEscola').textContent = estado.config.escola;
  $('#dlgConfig').close();
  aviso('✓ Configurações salvas.', 'ok');
}

// ---------- Avisos ----------
let avisoTimer;
function aviso(msg, tipo = 'ok') {
  const a = $('#aviso');
  a.textContent = msg;
  a.className = 'aviso mostrar ' + tipo;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => a.classList.remove('mostrar'), 3200);
}

// ---------- Botões ----------
function ligarBotoes() {
  $('#btnNovo').onclick = novo;
  $('#busca').oninput = desenharLista;
  $('#lista').onclick = ev => {
    const li = ev.target.closest('.item');
    if (!li || (atual && atual.id === li.dataset.id)) return;
    if (!podeSair()) return;
    abrirAluno(estado.alunos.find(a => a.id === li.dataset.id));
  };
  $('#etapas').onclick = ev => { const b = ev.target.closest('.etapa'); if (b) irEtapa(+b.dataset.i); };
  $('#btnAnterior').onclick = () => irEtapa(etapaAtual - 1);
  $('#btnProximo').onclick = () => irEtapa(etapaAtual + 1);
  $('#btnSalvar').onclick = salvar;
  $('#btnImprimir').onclick = imprimir;
  $('#btnExcluir').onclick = excluir;
  $('#btnRematricular').onclick = rematricular;
  $('#btnImportar').onclick = importar;
  $('#btnLote').onclick = abrirLote;
  $('#loteBusca').oninput = desenharLote;
  $('#loteLista').onchange = ev => { const id = ev.target.dataset.id; if (!id) return; ev.target.checked ? loteMarcados.add(id) : loteMarcados.delete(id); desenharLote(); };
  $('#loteTodos').onclick = () => { alunosLoteFiltrados().forEach(a => loteMarcados.add(a.id)); desenharLote(); };
  $('#loteNenhum').onclick = () => { loteMarcados.clear(); desenharLote(); };
  $('#dlgLoteCancelar').onclick = () => $('#dlgLote').close();
  $('#dlgLoteOk').onclick = confirmarLote;
  $('#btnConfig').onclick = abrirConfig;
  $('#dlgImprimirCancelar').onclick = () => $('#dlgImprimir').close();
  $('#dlgImprimirOk').onclick = confirmarImpressao;
  $('#dlgConfigCancelar').onclick = () => $('#dlgConfig').close();
  $('#dlgConfigOk').onclick = salvarConfig;
  $('#cfgLogoEscolher').onclick = async () => { const l = await window.api.escolherLogo(); if (l) { logoTemp = l; mostrarLogo(); } };
  $('#cfgLogoRemover').onclick = () => { logoTemp = ''; mostrarLogo(); };
  $('#cfgBackup').onclick = async () => { if (await window.api.salvarBackup()) aviso('✓ Backup salvo.', 'ok'); };
  $('#cfgRestaurar').onclick = async () => {
    try {
      const d = await window.api.restaurarBackup();
      if (d) { estado = d; desenharLista(); aviso('✓ Backup restaurado.', 'ok'); $('#dlgConfig').close(); }
    } catch (e) { aviso(e.message, 'erro'); }
  };
  $('#cfgExemplos').onclick = async () => {
    const d = await window.api.carregarExemplos();
    if (d) { estado = d; desenharLista(); $('#dlgConfig').close(); aviso('✓ 30 alunas de exemplo carregadas.', 'ok'); }
  };
  $('#cfgApagarExemplos').onclick = async () => {
    const d = await window.api.apagarExemplos();
    if (!d) return;
    estado = d;
    if (atual && atual.exemplo) { atual = null; alterado = false; $('#telaForm').hidden = true; $('#telaInicio').hidden = false; }
    desenharLista(); $('#dlgConfig').close(); aviso('✓ Exemplos apagados.', 'ok');
  };
  $('#cfgAbrirPasta').onclick = () => window.api.abrirPasta();
  ligarFormulario();

  document.addEventListener('keydown', ev => {
    if (ev.ctrlKey && ev.key.toLowerCase() === 's') { ev.preventDefault(); if (atual) salvar(); }
    if (ev.ctrlKey && ev.key.toLowerCase() === 'p') { ev.preventDefault(); if (atual) imprimir(); }
    // Enter passa para o próximo campo (mais rápido para digitar)
    if (ev.key === 'Enter' && ev.target.matches('#formArea input:not([type=checkbox])')) {
      ev.preventDefault();
      const campos = [...document.querySelectorAll('#formArea input, #formArea select, #formArea textarea')];
      const prox = campos[campos.indexOf(ev.target) + 1];
      if (prox) prox.focus(); else irEtapa(etapaAtual + 1);
    }
  });

  window.addEventListener('beforeunload', ev => { if (alterado) { ev.returnValue = false; } });
}

iniciar();
