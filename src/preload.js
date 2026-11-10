const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  lerDados: () => ipcRenderer.invoke('dados:ler'),
  salvarAluno: aluno => ipcRenderer.invoke('aluno:salvar', aluno),
  excluirAluno: id => ipcRenderer.invoke('aluno:excluir', id),
  salvarConfig: config => ipcRenderer.invoke('config:salvar', config),
  escolherLogo: () => ipcRenderer.invoke('config:escolherLogo'),
  salvarBackup: () => ipcRenderer.invoke('backup:salvar'),
  restaurarBackup: () => ipcRenderer.invoke('backup:restaurar'),
  importarPlanilha: () => ipcRenderer.invoke('planilha:importar'),
  carregarExemplos: () => ipcRenderer.invoke('exemplos:carregar'),
  apagarExemplos: () => ipcRenderer.invoke('exemplos:apagar'),
  abrirPasta: () => ipcRenderer.invoke('pasta:abrir'),
  visualizar: payload => ipcRenderer.invoke('imprimir:visualizar', payload),
  imprimir: () => ipcRenderer.invoke('imprimir:imprimir'),
  salvarPdf: nome => ipcRenderer.invoke('imprimir:pdf', nome)
});
