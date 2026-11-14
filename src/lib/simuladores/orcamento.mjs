// Spec do simulador ORÇAMENTO. Fiel a:
//   modulos/pedidos/orcamento.mdx + tecnico/regras-de-validacao/orcamento.mdx

const etapasOrdem = ['ABERTURA', 'ITENS', 'SALVO', 'GERADO', 'PRONTO'];
const etapaTipo = { ABERTURA: 'ABRIR', ITENS: 'ABRIR', SALVO: 'SALVAR', GERADO: 'APROVAR', PRONTO: 'FIM' };

const PERM_PT = 'Perfil comercial com acesso ao Orçamento (módulo Pedidos).';
const PERM_EN = 'Sales profile with access to the Quote (Orders module).';

export const spec = {
  slug: 'orcamento',
  exigeAnexo: false,
  codigoFinal: 'PED-00789',
  etapasOrdem,
  etapaTipo,
  variantes: null,
  obrigatorios: { _: ['status', 'itens'] },
  pegadinha: { _: 'itens' },
  alcada: null,

  painel: (s, lang) => {
    const t = spec.textos[lang];
    const status = s.statusKey === 'ativo' ? t.painelLabels.pedido : (s.salvo ? t.painelLabels.salvo : t.painelLabels.montando);
    return [
      { k: t.painelLabels.status, v: status },
      { k: t.painelLabels.itensL, v: s.campos.itens ? t.painelLabels.add : t.painelLabels.nenhum },
      { k: t.painelLabels.codigo, v: s.codigo && s.statusKey === 'ativo' ? s.codigo : t.painelLabels.semCodigo },
    ];
  },

  textos: {
    pt: {
      titulo: 'Montar um Orçamento (e gerar o pedido), passo a passo',
      sub: 'Monte os itens, salve e gere o pedido a partir do orçamento. Cada etapa mostra a permissão e o parâmetro.',
      campos: { status: 'Status', itens: 'Itens do Orçamento (ao menos um)' },
      statusLabel: {},
      painelLabels: {
        status: 'Status', itensL: 'Itens', codigo: 'Pedido gerado',
        montando: 'Montando', salvo: '✓ Orçamento salvo', pedido: '✓ Pedido gerado',
        add: '✓ adicionados', nenhum: '— (nenhum)', semCodigo: '— (após gerar)',
      },
      trilha: { ABERTURA: 'Abrir', ITENS: 'Itens', SALVO: 'Salvar', GERADO: 'Gerar Pedido' },
      regras: [
        'Obrigatórios: Status e ao menos um item (não removido).',
        'Itens: sem duplicidade (produto + tipo de item) e produto precisa existir.',
        'Um centro incompatível não pode ser usado quando o orçamento tem apenas itens do tipo Bonificação.',
        'Observação até 4000 caracteres; % Desconto Total entre 0 e 100.',
        'O orçamento pode gerar o pedido já com Lounge, lista de preço e itens preenchidos.',
      ],
      quem: [
        'Perfil comercial com acesso ao Orçamento (módulo Pedidos).',
        'Ao gerar o pedido, o fluxo segue como no Pedido de venda (análise, aprovação, SAP).',
      ],
      etapas: {
        ABERTURA: {
          ic: '🧮', tit: 'Novo orçamento', quem: 'Comercial',
          tela: 'Pedidos → Orçamento', href: '/modulos/pedidos/orcamento',
          txt: 'Clique em "+ Novo", selecione o cliente e defina o Lounge e a Lista de Preço de referência dos itens.',
          pratica: 'O Lounge dá o saldo de estoque; a Lista de Preço dá o preço dos itens.',
          fala: 'Bora fazer um orçamento! 🦷 Pra qual cliente?',
          acao: 'Novo orçamento →', permissao: PERM_PT,
          parametro: { chave: 'Lista de Preço · Lounge', efeito: 'preço dos itens e saldo de estoque.' },
        },
        ITENS: {
          ic: '📦', tit: 'Itens do orçamento', quem: 'Comercial',
          tela: 'Orçamento → itens', href: '/modulos/pedidos/orcamento',
          txt: 'Adicione os itens (produto, tipo, quantidade, preço). Sem duplicidade de produto + tipo e com produto existente.',
          pratica: 'Centro incompatível não entra quando o orçamento só tem itens de Bonificação.',
          fala: 'Hora dos itens! 📦 Monta a cesta que eu confiro.',
          acao: 'Adicionar itens →', permissao: PERM_PT,
          parametro: { chave: 'Centro × Bonificação', efeito: 'restringe centros incompatíveis em orçamento só de bonificação.' },
        },
        SALVO: {
          ic: '💾', tit: 'Salvar o orçamento', quem: 'Comercial',
          tela: 'Orçamento → "Salvar"', href: '/modulos/pedidos/orcamento',
          txt: 'Defina o Status e salve. O sistema valida que há ao menos um item e o % Desconto Total (0 a 100).',
          pratica: 'Sem itens não dá para salvar — adicione ao menos um.',
          fala: 'Fechou a cesta? Salva! 💾 Eu confiro antes.',
          acao: 'Salvar orçamento', permissao: PERM_PT, parametro: null,
        },
        GERADO: {
          ic: '🧾', tit: 'Gerar o pedido', quem: 'Comercial',
          tela: 'Orçamento → "Gerar Pedido"', href: '/modulos/pedidos/orcamento',
          txt: 'Gere o pedido a partir do orçamento: o pedido nasce já com Lounge, lista de preço e itens preenchidos.',
          pratica: 'A partir daqui, confira e envie o pedido como no fluxo de Pedido de venda.',
          fala: 'Cliente aprovou? 🧾 Bora virar pedido!',
          acao: 'Gerar Pedido →', permissao: PERM_PT,
          parametro: { chave: 'Orçamento → Pedido', efeito: 'copia Lounge, lista de preço e itens para o novo pedido.' },
        },
        PRONTO: {
          ic: '✅', tit: 'Pedido gerado do orçamento', quem: 'Sistema',
          tela: 'Pedidos → Pedido', href: '/modulos/pedidos/pedido',
          txt: 'Pronto! O pedido foi criado a partir do orçamento. Confira e envie para aprovação como um pedido normal.',
          pratica: 'As etapas 3 a 5 do processo do pedido já vêm preenchidas do orçamento.',
          fala: 'Virou pedido! ✅ Agora é só conferir e enviar. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Processo do Pedido', efeito: 'o pedido gerado segue o fluxo normal de venda.' },
        },
      },
      outFalta: (l) => `Não dá pra salvar: ${l} — informe o Status e ao menos um item.`,
      out: { salvou: 'Orçamento salvo. Pode gerar o pedido.', aprovou: 'Pedido gerado a partir do orçamento.' },
    },
    en: {
      titulo: 'Build a Quote (and generate the order), step by step',
      sub: 'Build the items, save and generate the order from the quote. Each step shows the permission and parameter.',
      campos: { status: 'Status', itens: 'Quote items (at least one)' },
      statusLabel: {},
      painelLabels: {
        status: 'Status', itensL: 'Items', codigo: 'Generated order',
        montando: 'Building', salvo: '✓ Quote saved', pedido: '✓ Order generated',
        add: '✓ added', nenhum: '— (none)', semCodigo: '— (after generating)',
      },
      trilha: { ABERTURA: 'Open', ITENS: 'Items', SALVO: 'Save', GERADO: 'Generate Order' },
      regras: [
        'Required: Status and at least one item (not removed).',
        'Items: no duplication (product + item type) and the product must exist.',
        'An incompatible center cannot be used when the quote has only Bonus-type items.',
        'Note up to 4000 characters; % Total Discount between 0 and 100.',
        'The quote can generate the order already with Lounge, price list and items filled in.',
      ],
      quem: [
        'Sales profile with access to the Quote (Orders module).',
        'When the order is generated, it follows the sales Order flow (review, approval, SAP).',
      ],
      etapas: {
        ABERTURA: {
          ic: '🧮', tit: 'New quote', quem: 'Sales',
          tela: 'Orders → Quote', href: '/en/modulos/pedidos/orcamento',
          txt: 'Click "+ New", select the customer and set the Lounge and Price List for the items.',
          pratica: 'The Lounge gives the stock balance; the Price List gives the item prices.',
          fala: "Let's make a quote! 🦷 For which customer?",
          acao: 'New quote →', permissao: PERM_EN,
          parametro: { chave: 'Price List · Lounge', efeito: 'item prices and stock balance.' },
        },
        ITENS: {
          ic: '📦', tit: 'Quote items', quem: 'Sales',
          tela: 'Quote → items', href: '/en/modulos/pedidos/orcamento',
          txt: 'Add the items (product, type, quantity, price). No product + type duplication and existing product.',
          pratica: 'An incompatible center is not allowed when the quote has only Bonus items.',
          fala: 'Time for items! 📦 Build the basket and I\'ll check.',
          acao: 'Add items →', permissao: PERM_EN,
          parametro: { chave: 'Center × Bonus', efeito: 'restricts incompatible centers in bonus-only quotes.' },
        },
        SALVO: {
          ic: '💾', tit: 'Save the quote', quem: 'Sales',
          tela: 'Quote → "Save"', href: '/en/modulos/pedidos/orcamento',
          txt: 'Set the Status and save. The system validates that there is at least one item and the % Total Discount (0 to 100).',
          pratica: 'Without items you can\'t save — add at least one.',
          fala: 'Basket ready? Save it! 💾 I\'ll check first.',
          acao: 'Save quote', permissao: PERM_EN, parametro: null,
        },
        GERADO: {
          ic: '🧾', tit: 'Generate the order', quem: 'Sales',
          tela: 'Quote → "Generate Order"', href: '/en/modulos/pedidos/orcamento',
          txt: 'Generate the order from the quote: the order is born already with Lounge, price list and items filled in.',
          pratica: 'From here, review and submit the order as in the sales Order flow.',
          fala: 'Customer approved? 🧾 Let\'s turn it into an order!',
          acao: 'Generate Order →', permissao: PERM_EN,
          parametro: { chave: 'Quote → Order', efeito: 'copies Lounge, price list and items into the new order.' },
        },
        PRONTO: {
          ic: '✅', tit: 'Order generated from the quote', quem: 'System',
          tela: 'Orders → Order', href: '/en/modulos/pedidos/pedido',
          txt: 'Done! The order was created from the quote. Review and submit for approval like a normal order.',
          pratica: 'Steps 3 to 5 of the order process already come filled from the quote.',
          fala: 'It became an order! ✅ Now just review and submit. 🦷',
          acao: null, permissao: null,
          parametro: { chave: 'Order process', efeito: 'the generated order follows the normal sales flow.' },
        },
      },
      outFalta: (l) => `Can't save: ${l} — set the Status and at least one item.`,
      out: { salvou: 'Quote saved. You can generate the order.', aprovou: 'Order generated from the quote.' },
    },
  },
};
