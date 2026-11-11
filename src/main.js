const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { importarPlanilha } = require('./importar');
const { gerarExemplos } = require('./exemplos');
const { autoUpdater } = require('electron-updater');

// Os dados ficam em Documentos\Matrículas Escolares — fácil de achar e de copiar para backup.
const PASTA_DADOS = path.join(app.getPath('documents'), 'Matrículas Escolares');
const ARQ_DADOS = path.join(PASTA_DADOS, 'dados.json');

const CONFIG_PADRAO = {
  prefeitura: 'PREFEITURA DE ANÁPOLIS',
  secretaria: 'SECRETARIA MUNICIPAL DE EDUCAÇÃO',
  escola: 'ESCOLA MUNICIPAL PASTOR MIGUEL MOREIRA BRAGA',
  cidade: 'Anápolis',
  uf: 'GO',
  proximaPasta: 1,
  logo: ''
};

function lerDados() {
  try {
    const d = JSON.parse(fs.readFileSync(ARQ_DADOS, 'utf8'));
    return { alunos: d.alunos || [], config: { ...CONFIG_PADRAO, ...(d.config || {}) } };
  } catch {
    return { alunos: [], config: { ...CONFIG_PADRAO } };
  }
}

function gravarDados(dados) {
  fs.mkdirSync(PASTA_DADOS, { recursive: true });
  const tmp = ARQ_DADOS + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(dados, null, 2), 'utf8');
  // guarda a versão anterior, por segurança
  if (fs.existsSync(ARQ_DADOS)) fs.copyFileSync(ARQ_DADOS, ARQ_DADOS + '.anterior');
  fs.renameSync(tmp, ARQ_DADOS);
}

let janela;

function criarJanela() {
  janela = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    title: 'Requerimento de Matrícula',
    backgroundColor: '#f4f6fb',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  janela.removeMenu();
  // Ao fechar com alterações não salvas, pergunta antes
  janela.webContents.on('will-prevent-unload', (ev) => {
    const r = dialog.showMessageBoxSync(janela, {
      type: 'question',
      buttons: ['Sair sem salvar', 'Voltar'],
      defaultId: 1,
      cancelId: 1,
      title: 'Alterações não salvas',
      message: 'Há alterações que ainda não foram salvas.',
      detail: 'Se sair agora, o que foi digitado desde o último "Salvar" será perdido.'
    });
    if (r === 0) ev.preventDefault();
  });
  janela.loadFile(path.join(__dirname, 'ui', 'index.html'));
  janela.maximize();
}

// ---------- Atualização automática ----------
// Procura versão nova nas Releases do GitHub, baixa em segundo plano e pergunta se quer reiniciar.
function configurarAtualizacao() {
  if (!app.isPackaged) return; // rodando pelo "npm start": não atualiza
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true; // se escolher "Depois", instala ao fechar o app
  autoUpdater.on('error', err => console.error('Atualização:', err && err.message));
  autoUpdater.on('update-downloaded', async info => {
    const r = await dialog.showMessageBox(janela, {
      type: 'info',
      buttons: ['Reiniciar agora', 'Depois'],
      defaultId: 0,
      cancelId: 1,
      title: 'Atualização disponível',
      message: `A versão ${info.version} do Requerimento de Matrícula já foi baixada.`,
      detail: 'Salve o que estiver fazendo e clique em "Reiniciar agora" para usar a versão nova. Se preferir, ela será instalada quando você fechar o programa.'
    });
    if (r.response === 0) autoUpdater.quitAndInstall();
  });
  autoUpdater.checkForUpdates().catch(() => { /* sem internet: tenta na próxima vez */ });
  // confere de novo a cada 4 horas, caso o app fique aberto o dia todo
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 4 * 60 * 60 * 1000);
}

app.whenReady().then(() => {
  criarJanela();
  configurarAtualizacao();
});

ipcMain.handle('app:versao', () => app.getVersion());
app.on('window-all-closed', () => app.quit());

// ---------- Dados ----------
ipcMain.handle('dados:ler', () => lerDados());

ipcMain.handle('aluno:salvar', (_e, aluno) => {
  const dados = lerDados();
  const agora = new Date().toISOString();
  if (!aluno.id) {
    aluno.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    aluno.criadoEm = agora;
  }
  aluno.atualizadoEm = agora;
  const i = dados.alunos.findIndex(a => a.id === aluno.id);
  if (i >= 0) dados.alunos[i] = aluno; else dados.alunos.push(aluno);
  // número da pasta: se usou o próximo número, avança o contador
  const n = parseInt(aluno.matricula && aluno.matricula.pasta, 10);
  if (n && n >= dados.config.proximaPasta) dados.config.proximaPasta = n + 1;
  gravarDados(dados);
  return { aluno, config: dados.config };
});

ipcMain.handle('aluno:excluir', async (_e, id) => {
  const dados = lerDados();
  const aluno = dados.alunos.find(a => a.id === id);
  if (!aluno) return false;
  const r = await dialog.showMessageBox(janela, {
    type: 'warning',
    buttons: ['Excluir', 'Cancelar'],
    defaultId: 1,
    cancelId: 1,
    title: 'Excluir aluno',
    message: `Excluir o cadastro de ${aluno.aluno?.nome || 'aluno sem nome'}?`,
    detail: 'Essa ação não pode ser desfeita.'
  });
  if (r.response !== 0) return false;
  dados.alunos = dados.alunos.filter(a => a.id !== id);
  gravarDados(dados);
  return true;
});

ipcMain.handle('config:salvar', (_e, config) => {
  const dados = lerDados();
  dados.config = { ...dados.config, ...config };
  gravarDados(dados);
  return dados.config;
});

ipcMain.handle('config:escolherLogo', async () => {
  const r = await dialog.showOpenDialog(janela, {
    title: 'Escolha a imagem do brasão/logo',
    filters: [{ name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'] }],
    properties: ['openFile']
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const arq = r.filePaths[0];
  const ext = path.extname(arq).slice(1).toLowerCase().replace('jpg', 'jpeg');
  return `data:image/${ext};base64,` + fs.readFileSync(arq).toString('base64');
});

ipcMain.handle('backup:salvar', async () => {
  const hoje = new Date().toISOString().slice(0, 10);
  const r = await dialog.showSaveDialog(janela, {
    title: 'Salvar cópia de segurança',
    defaultPath: path.join(app.getPath('desktop'), `backup-matriculas-${hoje}.json`),
    filters: [{ name: 'Backup', extensions: ['json'] }]
  });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, JSON.stringify(lerDados(), null, 2), 'utf8');
  return true;
});

ipcMain.handle('backup:restaurar', async () => {
  const r = await dialog.showOpenDialog(janela, {
    title: 'Restaurar cópia de segurança',
    filters: [{ name: 'Backup', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const novo = JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8'));
  if (!Array.isArray(novo.alunos)) throw new Error('Arquivo de backup inválido.');
  const c = await dialog.showMessageBox(janela, {
    type: 'question',
    buttons: ['Juntar com os atuais', 'Substituir tudo', 'Cancelar'],
    cancelId: 2,
    message: `O backup tem ${novo.alunos.length} aluno(s). O que deseja fazer?`
  });
  if (c.response === 2) return null;
  const dados = lerDados();
  if (c.response === 1) {
    gravarDados({ alunos: novo.alunos, config: { ...dados.config, ...(novo.config || {}) } });
  } else {
    const ids = new Set(dados.alunos.map(a => a.id));
    dados.alunos.push(...novo.alunos.filter(a => !ids.has(a.id)));
    gravarDados(dados);
  }
  return lerDados();
});

ipcMain.handle('planilha:importar', async () => {
  const r = await dialog.showOpenDialog(janela, {
    title: 'Importar planilhas antigas de requerimento',
    filters: [{ name: 'Planilhas do Excel', extensions: ['xls', 'xlsx'] }],
    properties: ['openFile', 'multiSelections']
  });
  if (r.canceled) return null;
  const resultados = [];
  for (const arq of r.filePaths) {
    try {
      resultados.push({ arquivo: path.basename(arq), aluno: importarPlanilha(arq) });
    } catch (err) {
      resultados.push({ arquivo: path.basename(arq), erro: err.message });
    }
  }
  return resultados;
});

ipcMain.handle('exemplos:carregar', async () => {
  const dados = lerDados();
  if (dados.alunos.some(a => a.exemplo)) {
    await dialog.showMessageBox(janela, { type: 'info', message: 'As alunas de exemplo já estão carregadas.' });
    return null;
  }
  const r = gerarExemplos(dados.config);
  dados.alunos.push(...r.alunos);
  dados.config.proximaPasta = r.proximaPasta;
  gravarDados(dados);
  return dados;
});

ipcMain.handle('exemplos:apagar', async () => {
  const dados = lerDados();
  const n = dados.alunos.filter(a => a.exemplo).length;
  if (!n) {
    await dialog.showMessageBox(janela, { type: 'info', message: 'Não há alunas de exemplo para apagar.' });
    return null;
  }
  const c = await dialog.showMessageBox(janela, {
    type: 'warning', buttons: ['Apagar exemplos', 'Cancelar'], defaultId: 1, cancelId: 1,
    message: `Apagar as ${n} alunas de exemplo?`, detail: 'Os alunos cadastrados de verdade não serão apagados.'
  });
  if (c.response !== 0) return null;
  dados.alunos = dados.alunos.filter(a => !a.exemplo);
  gravarDados(dados);
  return dados;
});

ipcMain.handle('pasta:abrir', () => {
  fs.mkdirSync(PASTA_DADOS, { recursive: true });
  shell.openPath(PASTA_DADOS);
});

// ---------- Impressão ----------
let janelaImpressao = null;

ipcMain.handle('imprimir:visualizar', async (_e, payload) => {
  if (janelaImpressao && !janelaImpressao.isDestroyed()) janelaImpressao.close();
  janelaImpressao = new BrowserWindow({
    width: 1220,
    height: 900,
    title: 'Visualizar impressão',
    parent: janela,
    autoHideMenuBar: true,
    backgroundColor: '#5b6170',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  janelaImpressao.removeMenu();
  await janelaImpressao.loadFile(path.join(__dirname, 'ui', 'impressao.html'));
  await janelaImpressao.webContents.executeJavaScript(`window.renderizar(${JSON.stringify(payload)})`);
  return true;
});

ipcMain.handle('imprimir:imprimir', (e) => {
  const wc = e.sender;
  return new Promise(resolve => {
    wc.print({ silent: false, printBackground: true, margins: { marginType: 'none' } }, (ok, motivo) => resolve({ ok, motivo }));
  });
});

ipcMain.handle('imprimir:pdf', async (e, nomeSugerido) => {
  const wc = e.sender;
  const win = BrowserWindow.fromWebContents(wc);
  const limpo = (nomeSugerido || 'requerimento').replace(/[\\/:*?"<>|]/g, '').trim();
  const r = await dialog.showSaveDialog(win, {
    title: 'Salvar como PDF',
    defaultPath: path.join(app.getPath('documents'), `${limpo}.pdf`),
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (r.canceled || !r.filePath) return false;
  const pdf = await wc.printToPDF({ printBackground: true, margins: { marginType: 'none' }, preferCSSPageSize: true });
  fs.writeFileSync(r.filePath, pdf);
  shell.openPath(r.filePath);
  return true;
});
