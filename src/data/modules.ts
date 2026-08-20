// Registro central de navegação do manual: módulos, rotinas e páginas fixas.
// Fonte única usada pelo menu lateral, pela home e pela busca.

export interface RoutineLink {
  title: string;
  slug: string;
  description?: string;
}

export interface ModuleDef {
  id: string;
  label: string;
  description: string;
  order: number;
  routines: RoutineLink[];
}

export interface StaticPage {
  title: string;
  slug: string;
  description?: string;
}

// Grupo de Doc. Técnicas e Configurações. Funciona como um módulo:
// tem uma página inicial e pode conter subpáginas (pages).
export interface TecnicoGroup {
  title: string;
  slug: string;
  description?: string;
  pages?: RoutineLink[];
}

export const manualPages: StaticPage[] = [
  { title: 'Introdução', slug: 'introducao', description: 'Sobre este manual e como usá-lo.' },
  { title: 'Como acessar o sistema', slug: 'como-acessar', description: 'Login, primeiro acesso e recuperação de senha.' },
  { title: 'Visão geral do sistema', slug: 'visao-geral', description: 'Como o SIN Implant System está organizado.' },
  { title: 'Perguntas frequentes', slug: 'faq', description: 'Dúvidas comuns sobre o uso do sistema.' },
];

export const tecnicoPages: TecnicoGroup[] = [
  {
    title: 'Fluxos',
    slug: 'fluxos',
    description: 'Como os principais processos se conectam entre módulos.',
    pages: [
      { title: 'Romaneio', slug: 'romaneio', description: 'Fluxo de separação, etiquetagem, romaneio e coleta de remessas.' },
      { title: 'Criação de Cliente', slug: 'criacao-de-cliente', description: 'Criação, cadastro e aprovação de clientes (PF, PJ e estrangeiro).' },
    ],
  },
  { title: 'APIs', slug: 'apis', description: 'Integrações disponíveis para troca de informações com outros sistemas.', pages: [] },
  { title: 'Migrations', slug: 'migrations', description: 'Controle de versões de estrutura de dados do sistema.', pages: [] },
  { title: 'Parâmetros', slug: 'parametros', description: 'Parâmetros gerais de configuração do sistema.', pages: [] },
  { title: 'Flags', slug: 'flags', description: 'Chaves de habilitação de funcionalidades por ambiente ou empresa.', pages: [] },
  { title: 'Permissões', slug: 'permissoes', description: 'Como as permissões controlam o acesso a telas e ações.', pages: [] },
  { title: 'Templates', slug: 'templates', description: 'Modelos reutilizados em documentos, mensagens e etiquetas.', pages: [] },
];

export const modules: ModuleDef[] = [
  {
    id: 'administrador',
    label: 'Administrator',
    description: 'Configurações administrativas gerais do sistema.',
    order: 1,
    routines: [],
  },
  {
    id: 'aprovacoes',
    label: 'Aprovações',
    description: 'Regras e fluxos de aprovação usados por outros módulos.',
    order: 2,
    routines: [
      { title: 'Entidade de Aprovação', slug: 'entidade-de-aprovacao', description: 'Define o que pode ser submetido a aprovação.' },
      { title: 'Regra de Aprovação', slug: 'regra-de-aprovacao', description: 'Define quem aprova e em qual condição.' },
    ],
  },
  {
    id: 'autenticador',
    label: 'Autenticador',
    description: 'Usuários, perfis, grupos e controle de acesso ao sistema.',
    order: 3,
    routines: [
      { title: 'Departamento de Usuário', slug: 'departamento-de-usuario', description: 'Agrupa usuários por área da empresa.' },
      { title: 'Grupo', slug: 'grupo', description: 'Agrupa usuários para facilitar permissões.' },
      { title: 'Módulo', slug: 'modulo', description: 'Cadastro dos módulos disponíveis no sistema.' },
      { title: 'Perfil', slug: 'perfil', description: 'Conjunto de permissões atribuído a usuários.' },
      { title: 'Tentativa de Login', slug: 'tentativa-de-login', description: 'Histórico de acessos e tentativas de login.' },
      { title: 'URL', slug: 'url', description: 'Endereços cadastrados e associados a permissões.' },
      { title: 'Usuário', slug: 'usuario', description: 'Cadastro de usuários que acessam o sistema.' },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    description: 'Cadastros comerciais e fiscais relacionados aos clientes.',
    order: 4,
    routines: [
      { title: 'Agrupamento de Cliente', slug: 'agrupamento-de-cliente', description: 'Reúne clientes para análises e regras comerciais.' },
      { title: 'Anexo de Cliente', slug: 'anexo-de-cliente', description: 'Documentos vinculados ao cadastro do cliente.' },
      { title: 'Atividade Econômica', slug: 'atividade-economica', description: 'Classificação da atividade econômica do cliente.' },
      { title: 'Canal', slug: 'canal', description: 'Canal de venda associado ao cliente.' },
      { title: 'Categoria CFOP', slug: 'categoria-cfop', description: 'Categoria fiscal usada nas operações do cliente.' },
      { title: 'Classificação Comercial', slug: 'classificacao-comercial', description: 'Classificação usada em políticas comerciais.' },
      { title: 'Cliente', slug: 'cliente', description: 'Cadastro central de dados do cliente.' },
      { title: 'Parâmetro de Entidade Especial', slug: 'parametro-de-entidade-especial', description: 'Configurações específicas para clientes especiais.' },
      { title: 'Perfil de Consumo', slug: 'perfil-de-consumo', description: 'Perfil de consumo usado em planejamento e metas.' },
      { title: 'Ramo de Atividade', slug: 'ramo-de-atividade', description: 'Ramo de atuação do cliente.' },
      { title: 'Rede de Cliente', slug: 'rede-de-cliente', description: 'Agrupamento de clientes que pertencem à mesma rede.' },
      { title: 'Regime Especial', slug: 'regime-especial', description: 'Regimes tributários diferenciados aplicáveis ao cliente.' },
      { title: 'SIN Partner', slug: 'sin-partner', description: 'Cadastro de parceiros do programa SIN Partner.' },
    ],
  },
  {
    id: 'contratos',
    label: 'Contratos',
    description: 'Contratos comerciais, metas e políticas associadas.',
    order: 5,
    routines: [
      { title: 'Anexo de Contrato', slug: 'anexo-de-contrato', description: 'Documentos vinculados ao contrato.' },
      { title: 'Contrato', slug: 'contrato', description: 'Cadastro central de contratos comerciais.' },
      { title: 'Meta de Consumo', slug: 'meta-de-consumo', description: 'Metas de consumo previstas em contrato.' },
      { title: 'Período de Curso', slug: 'periodo-de-curso', description: 'Períodos vinculados a cursos ou treinamentos contratados.' },
      { title: 'Política de Contrato', slug: 'politica-de-contrato', description: 'Regras comerciais aplicadas ao contrato.' },
      { title: 'Turma de Curso', slug: 'turma-de-curso', description: 'Turmas relacionadas a cursos vinculados ao contrato.' },
    ],
  },
  {
    id: 'faturamentos',
    label: 'Faturamentos',
    description: 'Rotinas de faturamento, consignado e relatórios relacionados.',
    order: 6,
    routines: [
      { title: 'Análise DataMatrix', slug: 'analise-datamatrix', description: 'Conferência de códigos DataMatrix nas remessas.' },
      { title: 'Fechamento de Consignado', slug: 'fechamento-de-consignado', description: 'Encerramento de períodos de consignado.' },
      { title: 'Fila de Remessas Aguardando Separação', slug: 'fila-de-remessas-aguardando-separacao', description: 'Acompanhamento de remessas pendentes de separação.' },
      { title: 'Trocas e Devoluções', slug: 'trocas-devolucoes', description: 'Registro e acompanhamento de trocas e devoluções.' },
      { title: 'Relatório de Consignado', slug: 'relatorio-de-consignado', description: 'Relatório com a posição de itens consignados.' },
      { title: 'Relatório de Status do Serial', slug: 'relatorio-de-status-do-serial', description: 'Relatório com a situação atual de cada serial.' },
      { title: 'Relatório Operador Logístico', slug: 'relatorio-operador-logistico', description: 'Relatório de movimentações pelo operador logístico.' },
    ],
  },
  {
    id: 'fiscal',
    label: 'Fiscal',
    description: 'Configurações fiscais e tributárias do sistema.',
    order: 7,
    routines: [
      { title: 'Feature Flag do Módulo Fiscal', slug: 'feature-flag-do-modulo-fiscal', description: 'Ativação de funcionalidades do módulo fiscal.' },
      { title: 'Sequência de Acesso', slug: 'sequencia-de-acesso', description: 'Ordem de aplicação de regras fiscais.' },
      { title: 'Tipo de Imposto', slug: 'tipo-de-imposto', description: 'Cadastro dos tipos de imposto utilizados.' },
    ],
  },
  {
    id: 'ignition',
    label: 'Ignition',
    description: 'Painéis de indicadores e acompanhamento operacional.',
    order: 8,
    routines: [
      { title: 'Dashboard', slug: 'dashboard', description: 'Painel com indicadores consolidados.' },
    ],
  },
  {
    id: 'integrador',
    label: 'Integrador',
    description: 'Integrações do sistema com outras plataformas.',
    order: 9,
    routines: [],
  },
  {
    id: 'inventarios',
    label: 'Inventários',
    description: 'Contagem e acompanhamento de inventários de estoque.',
    order: 10,
    routines: [
      { title: 'Contagem de Inventário', slug: 'contagem-inventario', description: 'Registro das contagens realizadas.' },
      { title: 'Inventário', slug: 'inventario', description: 'Cadastro e acompanhamento de inventários.' },
      { title: 'Inventários Disponíveis', slug: 'inventarios-disponiveis', description: 'Lista de inventários abertos para contagem.' },
    ],
  },
  {
    id: 'leads',
    label: 'Leads',
    description: 'Prospecção comercial e acompanhamento de oportunidades.',
    order: 11,
    routines: [
      { title: 'Indicação de Lead', slug: 'indicacao-de-lead', description: 'Registro de indicações recebidas.' },
      { title: 'Quadro Kanban de Leads', slug: 'quadro-kanban-leads', description: 'Acompanhamento visual dos leads em andamento.' },
      { title: 'Pipeline de Venda', slug: 'pipeline-de-venda', description: 'Etapas do funil comercial de leads.' },
    ],
  },
  {
    id: 'ocorrencias',
    label: 'Ocorrências',
    description: 'Registro e tratamento de ocorrências e solicitações.',
    order: 12,
    routines: [
      { title: 'Ocorrências PFCQ', slug: 'ocorrencias-pfcq', description: 'Ocorrências relacionadas a produto, fornecedor, cliente ou qualidade.' },
      { title: 'Pesquisas', slug: 'pesquisas', description: 'Pesquisas de satisfação e feedback.' },
      { title: 'Solicitações Handson', slug: 'solicitacoes-handson', description: 'Pedidos de treinamento prático (handson).' },
      { title: 'Tipo de Incidência', slug: 'tipo-incidencia', description: 'Classificação usada nas ocorrências registradas.' },
    ],
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    description: 'Pedidos de venda, orçamentos, notas fiscais e parâmetros comerciais.',
    order: 13,
    routines: [
      { title: 'Anexo de Pedido', slug: 'anexo-de-pedido', description: 'Documentos vinculados ao pedido.' },
      { title: 'Caixas do Pedido', slug: 'caixas-do-pedido', description: 'Controle de caixas usadas no envio do pedido.' },
      { title: 'Categoria Item', slug: 'categoria-item', description: 'Categoria usada para classificar itens do pedido.' },
      { title: 'Nova Fila de Aprovações', slug: 'nova-fila-de-aprovacoes', description: 'Fila de pedidos aguardando aprovação.' },
      { title: 'Item Lista de Preço', slug: 'item-lista-de-preco', description: 'Itens e valores de uma lista de preço.' },
      { title: 'Item Orçamento', slug: 'item-orcamento', description: 'Itens que compõem um orçamento.' },
      { title: 'Lista de Preço', slug: 'lista-de-preco', description: 'Cadastro de listas de preço comerciais.' },
      { title: 'Log Análise de Pedido', slug: 'log-analise-de-pedido', description: 'Informações de cadastro e alteração da análise do pedido.' },
      { title: 'Log de Faturamento SAP', slug: 'log-de-faturamento-sap', description: 'Acompanhamento do envio de faturamento ao SAP.' },
      { title: 'Moeda', slug: 'moeda', description: 'Cadastro de moedas usadas em pedidos e orçamentos.' },
      { title: 'Nota Fiscal', slug: 'nota-fiscal', description: 'Consulta de notas fiscais emitidas.' },
      { title: 'Notas Fiscais XML', slug: 'notas-fiscais-xml', description: 'Arquivos XML das notas fiscais.' },
      { title: 'Operação Inteligente', slug: 'operacao-inteligente', description: 'Regras automáticas aplicadas na criação de pedidos.' },
      { title: 'Orçamento', slug: 'orcamento', description: 'Cadastro e acompanhamento de orçamentos.' },
      { title: 'Parâmetros de Pedidos e Produtos no Lounge', slug: 'parametros-pedidos-produtos-no-lounge', description: 'Configurações de exibição de pedidos e produtos no lounge.' },
      { title: 'Pedido', slug: 'pedido', description: 'Cadastro e acompanhamento de pedidos de venda.' },
      { title: 'Previsão de Entrega de Pedido', slug: 'previsao-de-entrega-de-pedido', description: 'Estimativa de prazo de entrega do pedido.' },
      { title: 'Regra de Frete', slug: 'regra-de-frete', description: 'Regras de cálculo de frete aplicadas ao pedido.' },
      { title: 'Taxa de Moeda', slug: 'taxa-de-moeda', description: 'Cotações usadas na conversão entre moedas.' },
      { title: 'Tipo Item', slug: 'tipo-item', description: 'Classificação do tipo de item do pedido.' },
      { title: 'Transportadora', slug: 'transportadora', description: 'Cadastro de transportadoras usadas na entrega.' },
      { title: 'Unidade de Negócio', slug: 'unidade-negocio', description: 'Unidade de negócio associada ao pedido.' },
    ],
  },
  {
    id: 'planejamento-de-vendas',
    label: 'Planejamento de Vendas',
    description: 'Planejamento de metas e volumes de venda.',
    order: 14,
    routines: [
      { title: 'Planejamento de Vendas', slug: 'planejamento-de-vendas', description: 'Cadastro e acompanhamento do planejamento de vendas.' },
    ],
  },
  {
    id: 'politicas',
    label: 'Políticas',
    description: 'Políticas comerciais, condições de pagamento e territórios.',
    order: 15,
    routines: [
      { title: 'Condição de Pagamento', slug: 'condicao-de-pagamento', description: 'Prazos e condições aplicáveis ao pagamento.' },
      { title: 'Cota de Venda', slug: 'cota-de-venda', description: 'Cotas definidas para vendas.' },
      { title: 'Estrutura Comercial', slug: 'estrutura-comercial', description: 'Hierarquia comercial usada nas políticas.' },
      { title: 'Forma de Pagamento', slug: 'forma-de-pagamento', description: 'Formas de pagamento aceitas.' },
      { title: 'Parâmetro de Campanha', slug: 'parametro-de-campanha', description: 'Configurações usadas em campanhas comerciais.' },
      { title: 'Política Comercial', slug: 'politica-comercial', description: 'Regras comerciais aplicadas a pedidos e clientes.' },
      { title: 'Premiação Condicionada', slug: 'premiacao-condicionada', description: 'Regras de premiação vinculadas a metas.' },
      { title: 'Restrição de Venda', slug: 'restricao-de-venda', description: 'Restrições aplicadas a determinadas vendas.' },
      { title: 'Território', slug: 'territorio', description: 'Divisão territorial usada em políticas comerciais.' },
    ],
  },
  {
    id: 'produtos',
    label: 'Produtos',
    description: 'Cadastro de produtos, hierarquias, impostos e estoque.',
    order: 16,
    routines: [
      { title: 'Caixa de Embalagem', slug: 'caixa-de-embalagem', description: 'Cadastro das embalagens usadas no produto.' },
      { title: 'Conjunto de Fresa', slug: 'conjunto-de-fresa', description: 'Cadastro de conjuntos de fresa relacionados ao produto.' },
      { title: 'Família de Produto', slug: 'familia-de-produto', description: 'Agrupamento de produtos por família.' },
      { title: 'Grupo de Produto', slug: 'grupo-de-produto', description: 'Agrupamento de produtos para classificação comercial.' },
      { title: 'GTIN do Produto', slug: 'gtin-do-produto', description: 'Códigos de barras GTIN vinculados ao produto.' },
      { title: 'Hierarquia de Produto', slug: 'hierarquia-de-produto', description: 'Estrutura hierárquica usada para organizar produtos.' },
      { title: 'Imagem de Produto', slug: 'imagem-de-produto', description: 'Imagens vinculadas ao cadastro do produto.' },
      { title: 'Imposto Produto', slug: 'imposto-produto', description: 'Configuração tributária do produto.' },
      { title: 'Marca de Produto', slug: 'marca-de-produto', description: 'Marca associada ao produto.' },
      { title: 'Produto', slug: 'produto', description: 'Cadastro central de produtos do sistema.' },
      { title: 'Saldo de Estoque', slug: 'saldo-de-estoque', description: 'Consulta da posição de estoque do produto.' },
      { title: 'Tipo de Produto', slug: 'tipo-de-produto', description: 'Classificação do tipo de produto.' },
    ],
  },
  {
    id: 'qualidade',
    label: 'Qualidade',
    description: 'Rotinas de análise e controle de qualidade.',
    order: 17,
    routines: [
      { title: 'Análise de Qualidade', slug: 'analise-de-qualidade', description: 'Registro e acompanhamento de análises de qualidade.' },
    ],
  },
  {
    id: 'regulatorios',
    label: 'Regulatórios',
    description: 'Registros regulatórios, etiquetas e rastreabilidade.',
    order: 18,
    routines: [
      { title: 'Agência Reguladora', slug: 'agencia-reguladora', description: 'Cadastro das agências reguladoras aplicáveis.' },
      { title: 'Cartucho', slug: 'cartucho', description: 'Cadastro de cartuchos relacionados ao produto.' },
      { title: 'Conexão do Produto', slug: 'conexao-do-produto', description: 'Cadastro das conexões associadas ao produto.' },
      { title: 'Etiqueta de Rastreabilidade', slug: 'etiqueta-de-rastreabilidade', description: 'Modelo de etiqueta usado para rastreabilidade.' },
      { title: 'Etiqueta Emblistadora', slug: 'etiqueta-emblistadora', description: 'Modelo de etiqueta usado na emblistadora.' },
      { title: 'Etiqueta Encartuchadora', slug: 'etiqueta-encartuchadora', description: 'Modelo de etiqueta usado na encartuchadora.' },
      { title: 'Etiqueta Retrabalho Arábia Saudita', slug: 'etiqueta-retrabalho-arabia-saudita', description: 'Modelo de etiqueta de retrabalho para a Arábia Saudita.' },
      { title: 'Etiqueta Retrabalho Bulgária', slug: 'etiqueta-retrabalho-bulgaria', description: 'Modelo de etiqueta de retrabalho para a Bulgária.' },
      { title: 'Etiqueta Retrabalho Índia', slug: 'etiqueta-retrabalho-india', description: 'Modelo de etiqueta de retrabalho para a Índia.' },
      { title: 'Etiqueta Retrabalho Itália', slug: 'etiqueta-retrabalho-italia', description: 'Modelo de etiqueta de retrabalho para a Itália.' },
      { title: 'Etiqueta Retrabalho Manual', slug: 'etiqueta-retrabalho-manual', description: 'Etiqueta de retrabalho gerada manualmente.' },
      { title: 'Etiqueta Retrabalho México', slug: 'etiqueta-retrabalho-mexico', description: 'Modelo de etiqueta de retrabalho para o México.' },
      { title: 'Grupo do Produto', slug: 'grupo-do-produto', description: 'Agrupamento regulatório do produto.' },
      { title: 'Line Arábia Saudita', slug: 'line-arabia-saudita', description: 'Configuração regulatória de linha para a Arábia Saudita.' },
      { title: 'Linha do Produto', slug: 'linha-do-produto', description: 'Linha regulatória associada ao produto.' },
      { title: 'Lista Geral de Produtos', slug: 'lista-geral-de-produtos', description: 'Consulta geral de produtos com informações regulatórias.' },
      { title: 'Marcação CE', slug: 'marcacao-ce', description: 'Controle da marcação CE do produto.' },
      { title: 'Registros', slug: 'registros', description: 'Registros regulatórios vinculados ao produto.' },
      { title: 'Status Regulatórios', slug: 'status-regulatorios', description: 'Situação regulatória atual do produto.' },
      { title: 'Tipo do Material de Produção', slug: 'tipo-do-material-de-producao', description: 'Classificação do material usado na produção.' },
    ],
  },
  {
    id: 'roteirizador',
    label: 'Roteirizador',
    description: 'Agendas, formulários e jornadas de atendimento em campo.',
    order: 19,
    routines: [
      { title: 'Agenda', slug: 'agenda', description: 'Cadastro e acompanhamento de agendas.' },
      { title: 'Ausência', slug: 'ausencia', description: 'Registro de ausências que afetam a agenda.' },
      { title: 'Formulário', slug: 'formulario', description: 'Cadastro de formulários usados em campo.' },
      { title: 'Formulário Agenda', slug: 'formulario-agenda', description: 'Associação entre formulários e agendas.' },
      { title: 'Campo do Formulário', slug: 'campo-do-formulario', description: 'Campos que compõem um formulário.' },
      { title: 'Tipo de Campo', slug: 'tipo-de-campo', description: 'Tipos de campo disponíveis para formulários.' },
      { title: 'Jornada', slug: 'jornada', description: 'Sequência de etapas de atendimento em campo.' },
      { title: 'Métricas', slug: 'metricas', description: 'Indicadores de acompanhamento do roteirizador.' },
      { title: 'Tipo de Agenda', slug: 'tipo-de-agenda', description: 'Classificação usada para tipos de agenda.' },
    ],
  },
];

export function getModule(id: string): ModuleDef | undefined {
  return modules.find((m) => m.id === id);
}
