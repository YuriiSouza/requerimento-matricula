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

O instalador sai em `dist\Requerimento-Matricula-Setup-<versão>.exe`.

## Lançar uma versão nova

O GitHub Actions gera o instalador e publica na página de **Releases** sempre que uma tag `v*` é enviada:

```bash
npm version patch          # 1.0.0 -> 1.0.1 (cria o commit e a tag)
git push --follow-tags
```

A tag precisa ser igual à versão do `package.json` (ex.: `v1.0.1`).
