// Spec do simulador TDC (Troca, Devolução e Cancelamento — Pedido TDC). Fiel a:
//   tecnico/fluxos/troca-devolucao-cancelamento-tdc.mdx
// Variação = tipo de operação (Devolução / Troca / Consignado).

const etapasOrdem = ['ABERTURA', 'ITENS', 'GERAR', 'FINALIZADA'];
const etapaTipo = { ABERTURA: 'ABRIR', ITENS: 'SALVAR', GERAR: 'APROVAR', FINALIZADA: 'FIM' };

const PERM_PT = 'Perfil de Faturamento/pós-venda com acesso ao Pedido TDC.';
const PERM_EN = 'Billing/after-sales profile with access to the TDC Order.';

export const spec = {
  slug: 'troca-devolucao-cancelamento',
  exigeAnexo: false,
  codigoFinal: 'Pedido TDC gerado',
  etapasOrdem,
  etapaTipo,
  variantes: [
    { key: 'DEV', label: { pt: 'Devolução', en: 'Return' } },
    { key: 'TROCA', label: { pt: 'Troca', en: 'Exchange' } },
    { key: 'CONSIG', label: { pt: 'Consignado', en: 'Consignment' } },
  ],
  obrigatorios: { _: ['itensDevolucao'] },
  pegadinha: { _: 'itensDevolucao' },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const status = s.statusKey === 'ativo' ? t.painelLabels.finalizada : (s.salvo ? t.painelLabels.itens : t.painelLabels.iniciada);
    return [
      { k: t.painelLabels.status, v: status },
      { k: t.painelLabels.operacao, v: spec.variantes.find((v) => v.key === s.variante).label[lang] },
      { k: t.painelLabels.itensL, v: s.campos.itensDevolucao ? t.painelLabels.add : t.painelLabels.nenhum },
      { k: t.painelLabels.pedido, v: s.codigo && s.statusKey === 'ativo' ? t.painelLabels.gerado : t.painelLabels.semPedido },
    ];
  },

  textos: {
    pt: {
      titulo: 'Abrir uma Troca/Devolução (Pedido TDC), passo a passo',
      sub: 'Triagem de itens faturados que voltam, apuração de crédito/débito e geração do pedido. Cada etapa mostra a permissão e o parâmetro.',
      campos: { itensDevolucao: 'Itens de devolução (por NF ou bipagem DataMatrix)' },
      statusLabel: {},
      painelLabels: {
        status: 'Status', operacao: 'Operação', itensL: 'Itens', pedido: 'Pedido',
        iniciada: 'Triagem iniciada', itens: 'Itens na triagem', finalizada: '✓ Triagem finalizada',
        add: '✓ adicionados', nenhum: '— (nenhum)', gerado: '✓ gerado', semPedido: '— (após gerar)',
      },
      trilha: { ABERTURA: 'Triagem', ITENS: 'Itens', GERAR: 'Gerar Pedido' },
      regras: [
        'Um pedido só entra em devolução/troca depois de faturado e com movimento serial gravado.',
        'Operações (TipoOperacaoTDC): Devolução (gera crédito), Troca (apura diferença crédito/débito) e Consignado.',
        'Itens de devolução entram por Nota Fiscal ou por bipagem DataMatrix (se não achar: "DataMatrix não localizado").',
        'Item de troca exige Cliente, Operação (Operação Inteligente), Quantidade ≥ 1, Produto (para o preço de tabela) e Tipo do item.',
        'Se a nota já gerou pedido, o sistema avisa "Já foi gerado um pedido para nota selecionada". A triagem pode ser cancelada por protocolo.',
      ],
      quem: [
        'Equipe de Faturamento/pós-venda com acesso ao Pedido TDC.',
        'A apuração de crédito/débito é a "Diferença Geral" da operação.',
      ],
      etapas: {
        ABERTURA: {
          ic: '🗂️', tit: 'Abrir a triagem (Pedido TDC)', quem: 'Faturamento / pós-venda',
          tela: 'Faturamentos → Pedido TDC', href: '/tecnico/fluxos/troca-devolucao-cancelamento-tdc',
          txt: 'Abra um novo Pedido TDC: Protocolo (gerado), Cliente(s), Lounge/Lista de Preço, número do chamado (FreshDesk) e a operação (Devolução, Troca ou Consignado). Status inicial "Triagem iniciada".',
          pratica: 'Um protocolo pode ter mais de um cliente; o sistema avisa "Mais de um Cliente presente na Devolução".',
          fala: 'Chegou item de volta! 🦷 É devolução, troca ou consignado?',
          acao: 'Abrir triagem →', permissao: PERM_PT,
          parametro: { chave: 'TipoOperacaoTDC', efeito: 'Devolução / Troca / Consignado — define o que a triagem gera.' },
        },
        ITENS: {
          ic: '📦', tit: 'Itens de devolução (e troca)', quem: 'Faturamento / pós-venda',
          tela: 'Pedido TDC → itens', href: '/tecnico/fluxos/troca-devolucao-cancelamento-tdc',
          txt: 'Adicione os itens que voltam por Nota Fiscal ou bipando o DataMatrix. Na troca, adicione também os itens que serão enviados (grade "Item Troca"). Salve a triagem.',
          pratica: 'O item de troca exige Cliente, Operação, Quantidade ≥ 1, Produto e Tipo do item. Sem itens não há o que gerar.',
          fala: 'Bipar ou escolher pela nota? 📦 Marca o que voltou que eu confiro.',
          acao: 'Adicionar e salvar itens', permissao: PERM_PT,
          parametro: { chave: 'DataMatrix · Movimento serial', efeito: 'o item precisa ter sido faturado e ter movimento serial para ser bipado.' },
        },
        GERAR: {
          ic: '🧾', tit: 'Gerar o pedido', quem: 'Faturamento / pós-venda',
          tela: 'Pedido TDC → "Gerar Pedido"', href: '/tecnico/fluxos/troca-devolucao-cancelamento-tdc',
          txt: 'Use "Gerar Pedido": conforme a operação, cria o pedido de devolução, troca, troca antecipada ou consignado, vinculado à triagem, com a "Diferença Geral" (crédito/débito).',
          pratica: 'Se a nota já tiver gerado pedido, o sistema avisa e não duplica.',
          fala: 'Montou tudo? 🧾 Bora gerar o pedido!',
          acao: 'Gerar Pedido →', permissao: PERM_PT,
          parametro: { chave: 'StatusDePedidoTDC', efeito: 'devolução (1) / troca (2) / troca antecipada (3) / consignado (5).' },
        },
        FINALIZADA: {
          ic: '✅', tit: 'Triagem finalizada', quem: 'Sistema',
          tela: 'Faturamentos → Pedido TDC', href: '/tecnico/fluxos/troca-devolucao-cancelamento-tdc',
          txt: 'Pedido(s) gerado(s) e vinculado(s) à triagem; o movimento serial é atualizado e o crédito/débito apurado no cliente. A triagem vai para "Triagem finalizada".',
          pratica: 'Uma triagem que não será concluída pode ser cancelada (status "Cancelado"), com confirmação por protocolo.',
          fala: 'Finalizada! ✅ Crédito/débito no cliente e estoque atualizado. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Movimento serial · Crédito do cliente', efeito: 'rastreabilidade e saldo do pós-venda.' },
        },
      },
      outFalta: (l) => `Não dá pra salvar: ${l} — adicione ao menos um item (por NF ou DataMatrix).`,
      out: {
        salvou: 'Itens salvos na triagem. Pode gerar o pedido.',
        aprovou: 'Pedido gerado — triagem finalizada.',
      },
    },
    en: {
      titulo: 'Open an Exchange/Return (TDC Order), step by step',
      sub: 'Triage of invoiced items coming back, credit/debit calculation and order generation. Each step shows the permission and parameter.',
      campos: { itensDevolucao: 'Return items (by invoice or DataMatrix scan)' },
      statusLabel: {},
      painelLabels: {
        status: 'Status', operacao: 'Operation', itensL: 'Items', pedido: 'Order',
        iniciada: 'Triage started', itens: 'Items in triage', finalizada: '✓ Triage finished',
        add: '✓ added', nenhum: '— (none)', gerado: '✓ generated', semPedido: '— (after generating)',
      },
      trilha: { ABERTURA: 'Triage', ITENS: 'Items', GERAR: 'Generate Order' },
      regras: [
        'An order can only enter return/exchange after being invoiced and with the serial movement recorded.',
        'Operations (TipoOperacaoTDC): Return (generates credit), Exchange (calculates credit/debit difference) and Consignment.',
        'Return items are added by Invoice or by DataMatrix scan (if not found: "DataMatrix not located").',
        'An exchange item requires Customer, Operation (Smart Operation), Quantity ≥ 1, Product (for the table price) and item Type.',
        'If the invoice already generated an order, the system warns "An order was already generated for the selected invoice". The triage can be cancelled by protocol.',
      ],
      quem: [
        'Billing/after-sales team with access to the TDC Order.',
        'The credit/debit calculation is the operation\'s "General Difference".',
      ],
      etapas: {
        ABERTURA: {
          ic: '🗂️', tit: 'Open the triage (TDC Order)', quem: 'Billing / after-sales',
          tela: 'Billing → TDC Order', href: '/en/tecnico/fluxos/troca-devolucao-cancelamento-tdc',
          txt: 'Open a new TDC Order: Protocol (generated), Customer(s), Lounge/Price List, ticket number (FreshDesk) and the operation (Return, Exchange or Consignment). Initial status "Triage started".',
          pratica: 'A protocol can have more than one customer; the system warns "More than one Customer in the Return".',
          fala: 'An item came back! 🦷 Is it a return, exchange or consignment?',
          acao: 'Open triage →', permissao: PERM_EN,
          parametro: { chave: 'TipoOperacaoTDC', efeito: 'Return / Exchange / Consignment — defines what the triage generates.' },
        },
        ITENS: {
          ic: '📦', tit: 'Return (and exchange) items', quem: 'Billing / after-sales',
          tela: 'TDC Order → items', href: '/en/tecnico/fluxos/troca-devolucao-cancelamento-tdc',
          txt: 'Add the returning items by Invoice or by scanning the DataMatrix. For exchange, also add the items to be sent ("Exchange Item" grid). Save the triage.',
          pratica: 'An exchange item requires Customer, Operation, Quantity ≥ 1, Product and item Type. Without items there is nothing to generate.',
          fala: 'Scan or pick from the invoice? 📦 Mark what came back and I\'ll check.',
          acao: 'Add and save items', permissao: PERM_EN,
          parametro: { chave: 'DataMatrix · Serial movement', efeito: 'the item must have been invoiced and have a serial movement to be scanned.' },
        },
        GERAR: {
          ic: '🧾', tit: 'Generate the order', quem: 'Billing / after-sales',
          tela: 'TDC Order → "Generate Order"', href: '/en/tecnico/fluxos/troca-devolucao-cancelamento-tdc',
          txt: 'Use "Generate Order": per the operation, it creates the return, exchange, early-exchange or consignment order, linked to the triage, with the "General Difference" (credit/debit).',
          pratica: 'If the invoice already generated an order, the system warns and does not duplicate.',
          fala: 'All set? 🧾 Let\'s generate the order!',
          acao: 'Generate Order →', permissao: PERM_EN,
          parametro: { chave: 'StatusDePedidoTDC', efeito: 'return (1) / exchange (2) / early exchange (3) / consignment (5).' },
        },
        FINALIZADA: {
          ic: '✅', tit: 'Triage finished', quem: 'System',
          tela: 'Billing → TDC Order', href: '/en/tecnico/fluxos/troca-devolucao-cancelamento-tdc',
          txt: 'Order(s) generated and linked to the triage; the serial movement is updated and the credit/debit calculated for the customer. The triage goes to "Triage finished".',
          pratica: 'A triage that will not be concluded can be cancelled (status "Cancelled"), with protocol confirmation.',
          fala: 'Finished! ✅ Credit/debit on the customer and stock updated. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Serial movement · Customer credit', efeito: 'after-sales traceability and balance.' },
        },
      },
      outFalta: (l) => `Can't save: ${l} — add at least one item (by invoice or DataMatrix).`,
      out: {
        salvou: 'Items saved in the triage. You can generate the order.',
        aprovou: 'Order generated — triage finished.',
      },
    },
  },
};
