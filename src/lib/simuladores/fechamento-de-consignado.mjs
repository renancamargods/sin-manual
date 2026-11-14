// Spec do simulador FECHAMENTO DE CONSIGNADO. Fiel a:
//   tecnico/fluxos/fechamento-de-consignado.mdx
//   modulos/faturamentos/fechamento-de-consignado.mdx
// Variação = tipo de fechamento (Por Cliente / Por Nota Fiscal).

const etapasOrdem = ['ABERTURA', 'ITENS', 'DESCONTO', 'SALVO', 'GERADO', 'FATURADO'];
const etapaTipo = { ABERTURA: 'ABRIR', ITENS: 'ABRIR', DESCONTO: 'ABRIR', SALVO: 'SALVAR', GERADO: 'APROVAR', FATURADO: 'FIM' };

const PERM_PT = 'Perfil da equipe de Faturamento com acesso ao Fechamento de Consignado.';
const PERM_EN = 'Billing team profile with access to Consignment Closing.';

export const spec = {
  slug: 'fechamento-de-consignado',
  exigeAnexo: false,
  codigoFinal: 'PED-CSG-0098',
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'CLIENTE', label: { pt: 'Por Cliente', en: 'By Customer' } },
    { key: 'NF', label: { pt: 'Por Nota Fiscal', en: 'By Invoice' } },
  ],
  obrigatorios: { _: ['itens'] },
  pegadinha: { _: 'itens' },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const status = s.statusKey === 'ativo' ? t.painelLabels.faturado : (s.salvo ? t.painelLabels.salvo : t.painelLabels.montando);
    return [
      { k: t.painelLabels.status, v: status },
      { k: t.painelLabels.tipo, v: spec.variantes.find((v) => v.key === s.variante).label[lang] },
      { k: t.painelLabels.itens, v: s.campos.itens ? t.painelLabels.selecionados : t.painelLabels.nenhum },
      { k: t.painelLabels.pedido, v: s.codigo || t.painelLabels.semPedido },
    ];
  },

  textos: {
    pt: {
      titulo: 'Fechar um Consignado, passo a passo',
      sub: 'Selecione os itens consumidos, equalize o desconto e gere o pedido de faturamento. Cada etapa mostra a permissão e o parâmetro.',
      campos: { itens: 'Itens selecionados (com "Quantidade a Faturar")' },
      statusLabel: {},
      painelLabels: {
        status: 'Status', tipo: 'Tipo de fechamento', itens: 'Itens', pedido: 'Nº Pedido',
        montando: 'Montando', salvo: '✓ Fechamento salvo', faturado: 'Enviado para faturamento',
        selecionados: '✓ selecionados', nenhum: '— (nenhum)', semPedido: '— (após gerar)',
      },
      trilha: { ABERTURA: 'Abrir', ITENS: 'Itens', DESCONTO: 'Desconto', SALVO: 'Salvar', GERADO: 'Gerar Pedido' },
      regras: [
        'O fechamento pode ser Por Cliente (reúne os itens do cliente) ou Por Nota Fiscal (parte de uma NF específica).',
        'A "Quantidade a Faturar" de cada item não pode passar da "Quantidade Disponível para Faturamento" do lote/série.',
        'Fechamento parcial é permitido: o restante segue em consignação para um fechamento futuro.',
        'Ao gerar o pedido, o fechamento é "Enviado para faturamento" e gera o movimento serial de origem consignado.',
        'Se a nota já gerou pedido, o sistema avisa "Já foi gerado um pedido para nota selecionada".',
      ],
      quem: [
        'Equipe de Faturamento com acesso ao Fechamento de Consignado.',
        'O acompanhamento de saldos é pelo Relatório de Consignado (Resumido/Completo).',
      ],
      etapas: {
        ABERTURA: {
          ic: '🗂️', tit: 'Abrir o fechamento', quem: 'Faturamento',
          tela: 'Faturamentos → Fechamento de Consignado', href: '/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Crie um novo fechamento e defina o cabeçalho: Protocolo (gerado), Tipo de fechamento (Por Cliente ou Por Nota Fiscal), Cliente/NF de referência, Avaria e o Desconto da política.',
          pratica: 'O Tipo de fechamento decide como os itens são reunidos: por cliente ou a partir de uma nota.',
          fala: 'Bora fechar um consignado! 🦷 Por Cliente ou por Nota Fiscal?',
          acao: 'Abrir fechamento →', permissao: PERM_PT,
          parametro: { chave: 'TipoFechamentoConsignado', efeito: 'Por Cliente (0) ou Por Nota Fiscal (1) — define como os itens são montados.' },
        },
        ITENS: {
          ic: '📦', tit: 'Selecionar os itens por série', quem: 'Faturamento',
          tela: 'Fechamento → "Selecionar Itens por Série"', href: '/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Busque os itens em consignação disponíveis e selecione o que será faturado. Informe a "Quantidade a Faturar" de cada lote/série.',
          pratica: 'A "Quantidade a Faturar" não pode passar da "Quantidade Disponível para Faturamento" daquele lote/série.',
          fala: 'Agora os itens! 📦 Marca o que o cliente consumiu e a quantidade.',
          acao: 'Selecionar itens →', permissao: PERM_PT,
          parametro: { chave: 'Quantidade Disponível (lote/série)', efeito: 'limita a "Quantidade a Faturar" de cada item.' },
        },
        DESCONTO: {
          ic: '🏷️', tit: 'Equalizar o desconto', quem: 'Faturamento',
          tela: 'Fechamento → modal de desconto', href: '/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Antes de gerar o pedido, equalize o desconto dos itens selecionados — aplica/ajusta o desconto de forma uniforme, respeitando o desconto da política.',
          pratica: 'A equalização respeita o desconto da política do cliente.',
          fala: 'Vamos alinhar o desconto! 🏷️ Equalizar deixa tudo certinho.',
          acao: 'Equalizar desconto →', permissao: PERM_PT,
          parametro: { chave: 'Desconto da política', efeito: 'teto/base do desconto aplicado na equalização.' },
        },
        SALVO: {
          ic: '💾', tit: 'Salvar o fechamento', quem: 'Faturamento',
          tela: 'Fechamento → "Salvar"', href: '/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Salve o fechamento. O sistema confirma que foi salvo e libera a geração do pedido.',
          pratica: 'Sem itens selecionados não há o que faturar — selecione ao menos um item antes de salvar.',
          fala: 'Fechou a conta? Então salva! 💾 Eu confiro antes.',
          acao: 'Salvar fechamento', permissao: PERM_PT, parametro: null,
        },
        GERADO: {
          ic: '🧾', tit: 'Gerar o pedido', quem: 'Faturamento',
          tela: 'Fechamento → "Gerar Pedido"', href: '/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Clique em "Gerar Pedido": o fechamento é marcado "Enviado para faturamento" (com data) e gera o(s) pedido(s) de consignado vinculado(s).',
          pratica: 'Se a nota já tiver gerado pedido, o sistema avisa "Já foi gerado um pedido para nota selecionada".',
          fala: 'Hora de gerar o pedido! 🧾 Isso manda pro faturamento.',
          acao: 'Gerar Pedido →', permissao: PERM_PT,
          parametro: { chave: 'TipoFaturamentoParaMovimentoSerial', efeito: 'origem consignado ("via Portal KA" ou "pelo CRM") do movimento serial gerado.' },
        },
        FATURADO: {
          ic: '✅', tit: 'Pedido de consignado faturado', quem: 'Sistema',
          tela: 'Relatório de Consignado / Faturamento', href: '/modulos/faturamentos/relatorio-de-consignado',
          txt: 'O pedido de consignado foi gerado e enviado para faturamento, criando o movimento serial (origem consignado). O saldo restante segue em consignação.',
          pratica: 'Acompanhe os saldos no Relatório de Consignado (Resumido/Completo).',
          fala: 'Faturado! ✅ Movimento serial criado e saldo atualizado. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Movimento serial (consignado)', efeito: 'rastreabilidade por lote/série do que foi faturado.' },
        },
      },
      outFalta: (l) => `Não dá pra salvar: ${l} — selecione ao menos um item com "Quantidade a Faturar".`,
      out: {
        salvou: 'Fechamento salvo. Pode gerar o pedido.',
        aprovou: 'Pedido de consignado gerado e enviado para faturamento.',
      },
    },
    en: {
      titulo: 'Close a Consignment, step by step',
      sub: 'Select the consumed items, equalize the discount and generate the billing order. Each step shows the permission and parameter.',
      campos: { itens: 'Selected items (with "Quantity to Invoice")' },
      statusLabel: {},
      painelLabels: {
        status: 'Status', tipo: 'Closing type', itens: 'Items', pedido: 'Order No.',
        montando: 'Building', salvo: '✓ Closing saved', faturado: 'Sent for invoicing',
        selecionados: '✓ selected', nenhum: '— (none)', semPedido: '— (after generating)',
      },
      trilha: { ABERTURA: 'Open', ITENS: 'Items', DESCONTO: 'Discount', SALVO: 'Save', GERADO: 'Generate Order' },
      regras: [
        'The closing can be By Customer (gathers the customer\'s items) or By Invoice (starts from a specific invoice).',
        'Each item\'s "Quantity to Invoice" cannot exceed the "Quantity Available for Invoicing" of the batch/serial.',
        'Partial closing is allowed: the remainder stays in consignment for a future closing.',
        'When the order is generated, the closing is "Sent for invoicing" and creates the serial movement of consignment origin.',
        'If the invoice already generated an order, the system warns "An order was already generated for the selected invoice".',
      ],
      quem: [
        'Billing team with access to Consignment Closing.',
        'Balances are tracked in the Consignment Report (Summary/Full).',
      ],
      etapas: {
        ABERTURA: {
          ic: '🗂️', tit: 'Open the closing', quem: 'Billing',
          tela: 'Billing → Consignment Closing', href: '/en/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Create a new closing and set the header: Protocol (generated), Closing type (By Customer or By Invoice), reference Customer/Invoice, Damage and the policy Discount.',
          pratica: 'The Closing type decides how items are gathered: by customer or from an invoice.',
          fala: "Let's close a consignment! 🦷 By Customer or by Invoice?",
          acao: 'Open closing →', permissao: PERM_EN,
          parametro: { chave: 'TipoFechamentoConsignado', efeito: 'By Customer (0) or By Invoice (1) — defines how items are built.' },
        },
        ITENS: {
          ic: '📦', tit: 'Select items by serial', quem: 'Billing',
          tela: 'Closing → "Select Items by Serial"', href: '/en/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Search the available consignment items and select what will be invoiced. Enter the "Quantity to Invoice" per batch/serial.',
          pratica: 'The "Quantity to Invoice" cannot exceed the "Quantity Available for Invoicing" of that batch/serial.',
          fala: 'Now the items! 📦 Mark what the customer consumed and the quantity.',
          acao: 'Select items →', permissao: PERM_EN,
          parametro: { chave: 'Quantity Available (batch/serial)', efeito: 'caps each item\'s "Quantity to Invoice".' },
        },
        DESCONTO: {
          ic: '🏷️', tit: 'Equalize the discount', quem: 'Billing',
          tela: 'Closing → discount modal', href: '/en/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Before generating the order, equalize the discount of the selected items — applies/adjusts it uniformly, respecting the policy discount.',
          pratica: 'Equalization respects the customer\'s policy discount.',
          fala: "Let's align the discount! 🏷️ Equalizing keeps it tidy.",
          acao: 'Equalize discount →', permissao: PERM_EN,
          parametro: { chave: 'Policy discount', efeito: 'cap/base of the discount applied in equalization.' },
        },
        SALVO: {
          ic: '💾', tit: 'Save the closing', quem: 'Billing',
          tela: 'Closing → "Save"', href: '/en/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Save the closing. The system confirms it was saved and enables order generation.',
          pratica: 'Without selected items there is nothing to invoice — select at least one item before saving.',
          fala: "Done with the count? Then save! 💾 I'll check first.",
          acao: 'Save closing', permissao: PERM_EN, parametro: null,
        },
        GERADO: {
          ic: '🧾', tit: 'Generate the order', quem: 'Billing',
          tela: 'Closing → "Generate Order"', href: '/en/modulos/faturamentos/fechamento-de-consignado',
          txt: 'Click "Generate Order": the closing is marked "Sent for invoicing" (with date) and generates the linked consignment order(s).',
          pratica: 'If the invoice already generated an order, the system warns "An order was already generated for the selected invoice".',
          fala: 'Time to generate the order! 🧾 This sends it to invoicing.',
          acao: 'Generate Order →', permissao: PERM_EN,
          parametro: { chave: 'TipoFaturamentoParaMovimentoSerial', efeito: 'consignment origin ("via KA Portal" or "via CRM") of the serial movement.' },
        },
        FATURADO: {
          ic: '✅', tit: 'Consignment order invoiced', quem: 'System',
          tela: 'Consignment Report / Billing', href: '/en/modulos/faturamentos/relatorio-de-consignado',
          txt: 'The consignment order was generated and sent for invoicing, creating the serial movement (consignment origin). The remaining balance stays in consignment.',
          pratica: 'Track balances in the Consignment Report (Summary/Full).',
          fala: 'Invoiced! ✅ Serial movement created and balance updated. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Serial movement (consignment)', efeito: 'batch/serial traceability of what was invoiced.' },
        },
      },
      outFalta: (l) => `Can't save: ${l} — select at least one item with "Quantity to Invoice".`,
      out: {
        salvou: 'Closing saved. You can generate the order.',
        aprovou: 'Consignment order generated and sent for invoicing.',
      },
    },
  },
};
