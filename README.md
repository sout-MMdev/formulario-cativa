# Formulário Comercial — Cativa Operadora

Formulário web de **relatório comercial** dos executivos da Cativa Operadora.
Feito em **React + TypeScript** com Vite.

O executivo escolhe entre dois relatórios (pode preencher os dois no mesmo dia):

- **Visita** — agências visitadas, perfil comercial de cada uma, termômetro de
  satisfação por setor e ações acordadas.
- **Despesas** — trajetos com cálculo automático de reembolso por KM e despesas
  com comprovante.

Ao final, o Resumo consolida tudo e o dia é salvo (hoje em `localStorage`).

---

## Como rodar

Requisitos: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
npm install     # instalar as dependências
npm run dev     # abre em http://localhost:5501
```

| Comando             | O que faz                                       |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento com hot reload      |
| `npm run build`     | Valida os tipos e gera a build em `dist/`       |
| `npm run preview`   | Serve localmente a build de produção            |
| `npm run typecheck` | Só a verificação de tipos                       |

---

## Arquitetura

A regra que organiza tudo: **cada coisa em uma pasta, nada solto no mesmo
arquivo.** As camadas só olham para baixo — uma aba pode usar o núcleo, mas o
núcleo nunca sabe que abas existem.

```
src/
├── nucleo/              REGRA DE NEGÓCIO — não conhece React
│   ├── tipos/             interfaces de todo o domínio
│   ├── config/            listas e constantes (um arquivo por assunto)
│   │   ├── executivos.ts    nomes e e-mails
│   │   ├── tarifas.ts       valor por KM e quem tem tarifa especial
│   │   ├── agencia.ts       faturamento, produtos, atendentes
│   │   ├── estresse.ts      níveis do termômetro e setores
│   │   ├── despesas.ts      cartões e categorias
│   │   ├── fluxo.ts         quais abas cada relatório percorre
│   │   └── app.ts           APIs, datas, chave de armazenamento
│   ├── regras/            funções puras — o cálculo do dinheiro mora aqui
│   │   ├── reembolso.ts     tarifa, reembolso de KM, totais do dia
│   │   ├── estresse.ts      validação de um registro do termômetro
│   │   ├── validacao.ts     "esta aba pode avançar?"
│   │   └── fluxo.ts         navegação entre etapas
│   └── utils/             formatadores e gerador de ID
│
├── servicos/            MUNDO EXTERNO
│   ├── ibge.ts            municípios (autocomplete de cidade)
│   ├── viacep.ts          logradouros (2ª fase do autocomplete)
│   ├── agencias.ts        base de agências (public/agencias.json)
│   └── armazenamento/     PONTO DE INTEGRAÇÃO COM O CRM
│       ├── repositorioDias.ts   a interface
│       ├── repositorioLocal.ts  implementação em localStorage
│       └── index.ts             escolhe qual implementação usar
│
├── contexto/            ESTADO — um reducer, ações nomeadas
│   ├── formularioReducer.ts
│   ├── FormularioContexto.tsx
│   └── useFormulario.ts
│
├── hooks/               reutilizáveis (debounce, clique fora, Esc, dias salvos)
│
├── componentes/
│   ├── ui/                genéricos, sem regra de negócio
│   │   ├── Botao/  Campo/  Icone/  Modal/
│   │   ├── Autocomplete/  MultiSelecao/  SeletorData/
│   ├── campos/            campos que já sabem de onde vêm os dados
│   │   ├── CampoLocal.tsx    cidade (IBGE) → rua (ViaCEP)
│   │   ├── CampoAgencia.tsx  autocomplete de agência
│   │   └── CampoArquivo.tsx  anexo da nota fiscal
│   └── layout/            Cabecalho/ TrilhaEtapas/ Painel/ Rodape/ Splash/
│
├── abas/                UMA PASTA POR ABA, com o CSS dela dentro
│   ├── Identificacao/
│   ├── Visita/
│   ├── Agencias/          + componentes/ (CartaoAgencia, Termometro, Acoes)
│   ├── Despesas/          + componentes/ (BlocoTrajeto, BlocoDespesa)
│   └── Resumo/            + componentes/ (CartoesTotais, SecaoResumo)
│
├── estilos/             ARQUITETURA DE CSS
│   ├── root/              TOKENS — a fonte da verdade
│   │   ├── cores.css        a paleta e os papéis semânticos
│   │   ├── tipografia.css   escala de tamanho e peso
│   │   ├── espacamento.css  escala de 4px e larguras
│   │   └── efeitos.css      raios, sombras, transições, camadas
│   ├── base/              reset + aparência padrão do documento
│   └── compartilhado/     CLASSES REUTILIZADAS POR VÁRIOS BLOCOS
│       ├── campos.css       .campo, .controle, .opcao
│       ├── botoes.css       .btn e suas variações
│       ├── blocos.css       .painel, .bloco, .cartao, .aviso
│       ├── etiquetas.css    .etiqueta (chips e selos)
│       ├── animacoes.css    keyframes e classes de entrada
│       └── utilitarios.css  .pilha, .linha, .texto-*
│
├── App.tsx              liga cada etapa ao seu componente
└── main.tsx             ponto de entrada
```

### Regra do CSS

| Onde o estilo é usado                | Onde o arquivo fica                          |
| ------------------------------------ | -------------------------------------------- |
| Valor de cor, tamanho, raio, sombra  | `estilos/root/` — **nunca** um HEX solto      |
| Em mais de um bloco ou aba           | `estilos/compartilhado/`                      |
| Em um componente só                  | ao lado dele (`Botao/Botao.css`)              |
| Em uma aba só                        | ao lado dela (`abas/Visita/Visita.css`)       |

Nenhum arquivo de componente ou de aba escreve um HEX: sempre `var(--cor-...)`.
Trocar o tema da marca é reapontar as variáveis semânticas em
[cores.css](src/estilos/root/cores.css).

---

## Regras de negócio

Todas ficam em [`src/nucleo/regras/`](src/nucleo/regras/), em funções puras e
testáveis — a interface só as chama.

**Reembolso por KM** — `reembolso = km × tarifa do executivo`.
Tarifa padrão R$ 1,30; R$ 1,43 para os executivos listados em
[tarifas.ts](src/nucleo/config/tarifas.ts). Trocar o executivo recalcula todos
os trajetos já lançados.

**Fechamento do dia:**

```
  reembolso de KM
+ despesas no Cartão Pessoal
− abastecimentos no Cartão Clara
= total a reembolsar
```

Outras despesas no Cartão Clara são informativas: aparecem no resumo, mas não
mexem no total.

**Comprovante** — obrigatório no Cartão Pessoal (é o que garante o reembolso),
dispensado no Cartão Clara. Trocar o cartão limpa categoria e anexo.

**Termômetro** — escolher o nível abre um pop-up que só sai pelo "Entendi"; a
definição precisa ser lida. Níveis Médio, Alto e Crítico exigem a descrição do
ocorrido. Cada agência acumula quantos registros forem necessários.

**Salvar o dia** — exige pelo menos um trajeto ou uma agência visitada.

---

## Como estender

| Preciso...                    | Mexo em...                                                          |
| ----------------------------- | ------------------------------------------------------------------- |
| Incluir um executivo          | `nucleo/config/executivos.ts`                                        |
| Mudar a tarifa por KM         | `nucleo/config/tarifas.ts`                                           |
| Incluir produto ou atendente  | `nucleo/config/agencia.ts`                                           |
| Incluir setor ou nível        | `nucleo/config/estresse.ts`                                          |
| Incluir categoria de despesa  | `nucleo/config/despesas.ts`                                          |
| Mudar como o total é calculado| `nucleo/regras/reembolso.ts`                                         |
| Adicionar um campo ao dia     | tipo em `nucleo/tipos` → estado inicial e ação em `formularioReducer` |
| Criar uma aba nova            | tipo `NomeEtapa` → `config/fluxo.ts` → pasta em `abas/` → mapa no `App.tsx` |
| Adicionar um ícone            | uma linha em `componentes/ui/Icone/Icone.tsx`                        |

---

## Integração com o CRM

Toda a persistência passa pela interface
[`RepositorioDias`](src/servicos/armazenamento/repositorioDias.ts) —
`listar`, `salvar`, `excluir`, `limpar`.

Para trocar o `localStorage` pelo backend:

1. crie `src/servicos/armazenamento/repositorioApi.ts` implementando a mesma
   interface com `fetch()`;
2. troque uma linha em
   [`armazenamento/index.ts`](src/servicos/armazenamento/index.ts).

Nenhum componente muda. O `repositorioLocal` já normaliza registros gravados
pela versão anterior do formulário, então nenhum dia salvo se perde.

Os tipos de [`nucleo/tipos`](src/nucleo/tipos/index.ts) e as funções de
[`nucleo/regras`](src/nucleo/regras/) não dependem de React — podem ser
copiados direto para o CRM ou para uma API em Node.
