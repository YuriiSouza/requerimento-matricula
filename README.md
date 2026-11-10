# Requerimento de Matrícula

Aplicativo para computador (Windows, feito com Electron) que agiliza o preenchimento do
**Requerimento de Matrícula e Identificação Escolar** e imprime, já preenchidos:

1. Requerimento de Matrícula
2. Capa da Pasta Processo (folha em paisagem)
3. Ficha de Arquivo (3 por folha A4, também em lote)
4. Termo de Autorização de Uso de Imagem

## Recursos

- Formulário em 6 etapas, com botões para as opções de Sim/Não, turno e ano
- Máscaras para CPF, CEP, telefone e Cartão do SUS, com conferência do CPF
- Lista de alunos com busca e opção de **Rematricular** no semestre seguinte
- Importação das planilhas antigas (`.xls`/`.xlsx`)
- Backup e restauração dos dados
- 30 alunas fictícias de exemplo para treinar (Configurações › Carregar exemplos)

Os dados ficam no computador, em `Documentos\Matrículas Escolares\dados.json`.

## Desenvolvimento

```bash
npm install
npm start
```

## Gerar o instalador

```bash
npm run dist
```

O instalador sai em `dist\Requerimento de Matrícula Setup <versão>.exe`.
