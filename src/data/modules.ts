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
  { title: 'Glossário', slug: 'glossario', description: 'Termos e siglas usados no sistema e no manual.' },
  { title: 'Perguntas frequentes', slug: 'faq', description: 'Dúvidas comuns sobre o uso do sistema.' },
];

export const tecnicoPages: TecnicoGroup[] = [
  {
    title: 'Fluxos',
    slug: 'fluxos',
    description: 'Como os principais processos se conectam entre módulos.',
    pages: [
      { title: 'Romaneio', slug: 'romaneio', description: 'Fluxo de separação, etiquetagem, romaneio e coleta de remessas.' },
      { title: 'Cadastro de Clientes x Aprovações - Com Ignition', slug: 'criacao-de-cliente', description: 'Criação, cadastro e aprovação de clientes (PF, PJ e estrangeiro) com a fila Ignition.' },
      { title: 'Configuração de Produtos no Lounge', slug: 'configuracao-de-produtos-no-lounge', description: 'Parametrização de produtos por localidade e roteamento dos itens para o Lounge/Centro correto.' },
      { title: 'Cadastro de Clientes x Aprovações - Sem Ignition', slug: 'cadastro-clientes-sem-ignition', description: 'Cadastro e aprovação de clientes (PF, PJ e estrangeiro) pela fila SEM Ignition, com regra e etapas de aprovação.' },
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
    label: 'Administrador',
    description: 'Configurações administrativas gerais do sistema.',
    order: 1,
    routines: [
      { title: 'Amarração de Faturamento por Lounge', slug: 'amarracao-de-faturamento-por-lounge', description: 'Vincula regras de faturamento a cada Lounge.' },
      { title: 'Anexos', slug: 'anexos', description: 'Consulta e gestão central dos anexos por domínio e tipo.' },
      { title: 'Atributo', slug: 'atributo', description: 'Cadastro de atributos usados em outros registros.' },
      { title: 'Atualizador de Arquivos Json', slug: 'atualizador-de-arquivos-json', description: 'Atualização de arquivos JSON de configuração.' },
      { title: 'Campo Validação', slug: 'campo-validacao', description: 'Regras de validação de campos do sistema.' },
      { title: 'Canal de Entrada', slug: 'canal-de-entrada', description: 'Cadastro dos canais de entrada de registros.' },
      { title: 'Lounge', slug: 'lounge', description: 'Cadastro das unidades Lounge.' },
      { title: 'Chave e Valor', slug: 'chave-e-valor', description: 'Pares de chave e valor de configuração.' },
      { title: 'Cidade', slug: 'cidade', description: 'Cadastro de cidades.' },
      { title: 'Conciliadora Pix', slug: 'conciliadora-pix', description: 'Conciliação de pagamentos via PIX.' },
      { title: 'Controle de Funcionalidade', slug: 'controle-de-funcionalidade', description: 'Ativação e controle de funcionalidades do sistema.' },
      { title: 'Dado Bancário', slug: 'dado-bancario', description: 'Cadastro de dados bancários.' },
      { title: 'Domínio de Anexo', slug: 'dominio-de-anexo', description: 'Domínios (origens) usados nos anexos.' },
      { title: 'Empresa', slug: 'empresa', description: 'Cadastro das empresas do grupo.' },
      { title: 'Endereço', slug: 'endereco', description: 'Cadastro de endereços.' },
      { title: 'Estado', slug: 'estado', description: 'Cadastro de estados (UF).' },
      { title: 'Impressora de Etiqueta', slug: 'impressora-de-etiqueta', description: 'Cadastro das impressoras de etiqueta.' },
      { title: 'Incoterm', slug: 'incoterm', description: 'Cadastro dos Incoterms usados nas operações.' },
      { title: 'Log de Execução de Serviço', slug: 'log-de-execucao-de-servico', description: 'Consulta e registro das execuções de serviços e integrações do sistema.' },
      { title: 'Mensagem Personalizada', slug: 'mensagem-personalizada', description: 'Cadastro e consulta das mensagens padronizadas por tipo de mensagem.' },
      { title: 'Modo Projeto', slug: 'modo-projeto', description: 'Configurações do modo projeto do sistema.' },
      { title: 'Módulo de Negócio', slug: 'modulo-de-negocio', description: 'Cadastro dos módulos de negócio.' },
      { title: 'País', slug: 'pais', description: 'Cadastro de países.' },
      { title: 'Parâmetro', slug: 'parametro', description: 'Parâmetros gerais de configuração do sistema.' },
      { title: 'Porto de Destino', slug: 'porto-de-destino', description: 'Cadastro dos portos de destino.' },
      { title: 'Post', slug: 'post', description: 'Publicações e avisos exibidos no sistema.' },
      { title: 'Questionários', slug: 'questionarios', description: 'Cadastro de questionários.' },
      { title: 'Serviço Agendado', slug: 'servico-agendado', description: 'Cadastro de serviços agendados.' },
      { title: 'Execução de Serviço Agendado', slug: 'execucao-de-servico-agendado', description: 'Acompanhamento das execuções de serviços agendados.' },
      { title: 'Gerenciador de Usuários Conectados', slug: 'gerenciador-de-usuarios-conectados', description: 'Gestão dos usuários conectados no sistema.' },
      { title: 'Terminal de Pagamento', slug: 'terminal-de-pagamento', description: 'Cadastro dos terminais de pagamento.' },
      { title: 'Tipos de Anexo', slug: 'tipos-de-anexo', description: 'Tipos (classificações) usados nos anexos.' },
      { title: 'Tipo de Logradouro', slug: 'tipo-de-logradouro', description: 'Cadastro dos tipos de logradouro.' },
      { title: 'Tipo de Mensagem', slug: 'tipo-de-mensagem', description: 'Classificação das mensagens personalizadas.' },
      { title: 'Trabalho', slug: 'trabalho', description: 'Cadastro de trabalhos do sistema.' },
    ],
  },
  {
    id: 'aprovacoes',
    label: 'Aprovações',
    description: 'Regras e fluxos de aprovação usados por outros módulos.',
    order: 2,
    routines: [
      { title: 'Acompanhamento Ciclos de Aprovação', slug: 'acompanhamento-ciclos-de-aprovacao', description: 'Consulta e acompanhamento dos ciclos de aprovação e suas etapas.' },
      { title: 'Entidade de Aprovação', slug: 'entidade-de-aprovacao', description: 'Define o que pode ser submetido a aprovação.' },
      { title: 'Fila de Aprovações - Clientes', slug: 'nova-fila-de-aprovacao-clientes', description: 'Fila para aprovar, reprovar ou avaliar os clientes aguardando liberação.' },
      { title: 'Fila de Aprovações - Contratos', slug: 'fila-de-aprovacoes-contratos', description: 'Fila para aprovar, reprovar ou avaliar os contratos aguardando liberação.' },
      { title: 'Fila de Aprovações - Pedidos', slug: 'fila-de-aprovacoes-pedidos', description: 'Fila para aprovar, reprovar ou avaliar os pedidos aguardando liberação.' },
      { title: 'Regra de Aprovação', slug: 'regra-de-aprovacao', description: 'Define quem aprova e em qual condição.' },
      { title: 'Sub-Status - Ciclo de Aprovação', slug: 'sub-status-ciclo-de-aprovacao', description: 'Cadastro dos sub-status aplicados ao aprovar, reprovar ou enviar para avaliação.' },
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
      { title: 'Fila de Aprovações de Cadastros', slug: 'fila-de-aprovacoes-de-cadastros', description: 'Fila dos cadastros de cliente aguardando aprovação.' },
      { title: 'Grupo Econômico', slug: 'grupo-economico', description: 'Agrupamento de clientes que pertencem ao mesmo grupo econômico.' },
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
      { title: 'Buscar Remessa', slug: 'buscar-remessa', description: 'Consulta e busca de remessas.' },
      { title: 'Fechamento de Consignado', slug: 'fechamento-de-consignado', description: 'Encerramento de períodos de consignado.' },
      { title: 'Fila de Remessas Aguardando Separação', slug: 'fila-de-remessas-aguardando-separacao', description: 'Acompanhamento de remessas pendentes de separação.' },
      { title: 'Fila do Romaneio', slug: 'fila-do-romaneio', description: 'Acompanhamento das remessas na fila do romaneio.' },
      { title: 'Fila de Geração de Etiquetas', slug: 'fila-de-geracao-de-etiquetas', description: 'Acompanhamento da geração de etiquetas das remessas.' },
      { title: 'Trocas/Devoluções', slug: 'trocas-devolucoes', description: 'Triagem, devolução e troca de produtos por protocolo, com bipagem e geração de pedidos.' },
      { title: 'Relatório de Consignado', slug: 'relatorio-de-consignado', description: 'Relatório com a posição de itens consignados.' },
      { title: 'Relatório de Status do Serial', slug: 'relatorio-de-status-do-serial', description: 'Relatório com a situação atual de cada serial.' },
      { title: 'Relatório Operador Logístico', slug: 'relatorio-operador-logistico', description: 'Relatório de movimentações pelo operador logístico.' },
      { title: 'Transferência Reversa', slug: 'transferencia-reversa', description: 'Registro e acompanhamento de transferências reversas.' },
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
    routines: [
      { title: 'Configuração de Integração SAP', slug: 'configuracao-de-integracao-sap', description: 'Parâmetros de integração com o SAP.' },
      { title: 'Tipo de Etapa', slug: 'tipo-de-etapa', description: 'Cadastro dos tipos de etapa dos fluxos de integração.' },
      { title: 'Fluxos de Integração', slug: 'fluxos-de-integracao', description: 'Definição dos fluxos de integração do sistema.' },
      { title: 'Monitoramento de Integrações SAP', slug: 'monitoramento-de-integracoes-sap', description: 'Acompanhamento das integrações com o SAP.' },
    ],
  },
  {
    id: 'inventarios',
    label: 'Inventários',
    description: 'Contagem e acompanhamento de inventários de estoque.',
    order: 10,
    routines: [
      { title: 'Contagem Inventário', slug: 'contagem-inventario', description: 'Registro das contagens realizadas.' },
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
      { title: 'Quadro Kanban Leads', slug: 'quadro-kanban-leads', description: 'Acompanhamento visual dos leads em andamento.' },
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
      { title: 'Solicitações HandsOn', slug: 'solicitacoes-handson', description: 'Pedidos de treinamento prático (HandsOn).' },
      { title: 'Tipo Incidência', slug: 'tipo-incidencia', description: 'Classificação usada nas ocorrências registradas.' },
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
      { title: 'Nova Fila de Aprovação - Pedidos', slug: 'nova-fila-de-aprovacao-pedidos', description: 'Fila de pedidos aguardando aprovação.' },
      { title: 'Item Lista de Preço', slug: 'item-lista-de-preco', description: 'Itens e valores de uma lista de preço.' },
      { title: 'Item Orçamento', slug: 'item-orcamento', description: 'Itens que compõem um orçamento.' },
      { title: 'Lista de Preço', slug: 'lista-de-preco', description: 'Cadastro de listas de preço comerciais.' },
      { title: 'Log Análise de Pedido', slug: 'log-analise-de-pedido', description: 'Informações de cadastro e alteração da análise do pedido.' },
      { title: 'Log de Faturamento SAP', slug: 'log-de-faturamento-sap', description: 'Acompanhamento do envio de faturamento ao SAP.' },
      { title: 'Moeda', slug: 'moeda', description: 'Cadastro de moedas usadas em pedidos e orçamentos.' },
      { title: 'Motivo da Ordem', slug: 'motivo-da-ordem', description: 'Cadastro dos motivos usados nas ordens.' },
      { title: 'Nota Fiscal', slug: 'nota-fiscal', description: 'Consulta de notas fiscais emitidas.' },
      { title: 'Notas Fiscais - XML', slug: 'notas-fiscais-xml', description: 'Arquivos XML das notas fiscais.' },
      { title: 'Operação Inteligente', slug: 'operacao-inteligente', description: 'Regras automáticas aplicadas na criação de pedidos.' },
      { title: 'Orçamento', slug: 'orcamento', description: 'Cadastro e acompanhamento de orçamentos.' },
      { title: 'Configuração de Produtos no Lounge', slug: 'configuracao-de-produtos-no-lounge', description: 'Configurações de exibição de produtos no Lounge.' },
      { title: 'Pedido', slug: 'pedido', description: 'Cadastro e acompanhamento de pedidos de venda.' },
      { title: 'Pedido para Integração', slug: 'pedido-para-integracao', description: 'Pedidos preparados para integração com outros sistemas.' },
      { title: 'Previsão de Entrega de Pedido', slug: 'previsao-de-entrega-de-pedido', description: 'Estimativa de prazo de entrega do pedido.' },
      { title: 'Regra de Frete', slug: 'regra-de-frete', description: 'Regras de cálculo de frete aplicadas ao pedido.' },
      { title: 'Taxa de Moeda', slug: 'taxa-de-moeda', description: 'Cotações usadas na conversão entre moedas.' },
      { title: 'Tipo Item', slug: 'tipo-item', description: 'Classificação do tipo de item do pedido.' },
      { title: 'Transportadora', slug: 'transportadora', description: 'Cadastro de transportadoras usadas na entrega.' },
      { title: 'Unidade Negócio', slug: 'unidade-negocio', description: 'Unidade de negócio associada ao pedido.' },
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
      { title: 'Saldo de Estoque Agrupado', slug: 'saldo-de-estoque-agrupado', description: 'Consulta da posição de estoque agrupada.' },
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
      { title: 'Refugo', slug: 'refugo', description: 'Registro e acompanhamento de refugos.' },
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

// --- Rótulos em inglês para a navegação (menu, home, breadcrumb, paginador) ---
// Fase inicial do bilíngue: os NOMES das rotinas (submenu) ainda usam o PT como
// fallback; serão traduzidos junto com o conteúdo de cada tela.
export const moduleEn: Record<string, { label: string; description: string }> = {
  administrador: { label: 'Administrator', description: 'General administrative settings of the system.' },
  aprovacoes: { label: 'Approvals', description: 'Approval rules and flows used by other modules.' },
  autenticador: { label: 'Authenticator', description: 'Users, profiles, groups and access control.' },
  clientes: { label: 'Customers', description: 'Commercial and tax records related to customers.' },
  contratos: { label: 'Contracts', description: 'Commercial contracts, targets and related policies.' },
  faturamentos: { label: 'Invoicing', description: 'Invoicing, consignment and related reports.' },
  fiscal: { label: 'Tax', description: 'Tax and fiscal settings of the system.' },
  ignition: { label: 'Ignition', description: 'Indicator panels and operational tracking.' },
  integrador: { label: 'Integrator', description: 'System integrations with other platforms.' },
  inventarios: { label: 'Inventories', description: 'Stock counting and inventory tracking.' },
  leads: { label: 'Leads', description: 'Commercial prospecting and opportunity tracking.' },
  ocorrencias: { label: 'Occurrences', description: 'Recording and handling occurrences and requests.' },
  pedidos: { label: 'Orders', description: 'Sales orders, quotes, invoices and commercial parameters.' },
  'planejamento-de-vendas': { label: 'Sales Planning', description: 'Planning of sales targets and volumes.' },
  politicas: { label: 'Policies', description: 'Commercial policies, payment terms and territories.' },
  produtos: { label: 'Products', description: 'Product records, hierarchies, taxes and stock.' },
  qualidade: { label: 'Quality', description: 'Quality analysis and control routines.' },
  regulatorios: { label: 'Regulatory', description: 'Regulatory records, labels and traceability.' },
  roteirizador: { label: 'Field Routing', description: 'Schedules, forms and field service journeys.' },
};

export const manualPageEn: Record<string, { title: string; description: string }> = {
  introducao: { title: 'Introduction', description: 'About this manual and how to use it.' },
  'como-acessar': { title: 'How to access the system', description: 'Login, first access and password recovery.' },
  'visao-geral': { title: 'System overview', description: 'How the SIN Implant System is organized.' },
  glossario: { title: 'Glossary', description: 'Terms and acronyms used in the system and manual.' },
  faq: { title: 'FAQ', description: 'Common questions about using the system.' },
};

export const tecnicoGroupEn: Record<string, { title: string; description: string }> = {
  fluxos: { title: 'Flows', description: 'How the main processes connect across modules.' },
  apis: { title: 'APIs', description: 'Integrations available to exchange information with other systems.' },
  migrations: { title: 'Migrations', description: 'Version control of the system data structure.' },
  parametros: { title: 'Parameters', description: 'General system configuration parameters.' },
  flags: { title: 'Flags', description: 'Feature toggles by environment or company.' },
  permissoes: { title: 'Permissions', description: 'How permissions control access to screens and actions.' },
  templates: { title: 'Templates', description: 'Reusable models for documents, messages and labels.' },
};

// Nomes das rotinas (submenu) em inglês, por "moduleId/slug". Fallback = título PT.
export const routineTitleEn: Record<string, string> = {
  'administrador/amarracao-de-faturamento-por-lounge': 'Lounge Invoicing Binding',
  'administrador/anexos': 'Attachments',
  'administrador/atributo': 'Attribute',
  'administrador/atualizador-de-arquivos-json': 'JSON File Updater',
  'administrador/campo-validacao': 'Field Validation',
  'administrador/canal-de-entrada': 'Entry Channel',
  'administrador/lounge': 'Lounge',
  'administrador/chave-e-valor': 'Key and Value',
  'administrador/cidade': 'City',
  'administrador/conciliadora-pix': 'PIX Reconciler',
  'administrador/controle-de-funcionalidade': 'Feature Control',
  'administrador/dado-bancario': 'Bank Details',
  'administrador/dominio-de-anexo': 'Attachment Domain',
  'administrador/empresa': 'Company',
  'administrador/endereco': 'Address',
  'administrador/estado': 'State',
  'administrador/impressora-de-etiqueta': 'Label Printer',
  'administrador/incoterm': 'Incoterm',
  'administrador/log-de-execucao-de-servico': 'Service Execution Log',
  'administrador/mensagem-personalizada': 'Custom Message',
  'administrador/modo-projeto': 'Project Mode',
  'administrador/modulo-de-negocio': 'Business Module',
  'administrador/pais': 'Country',
  'administrador/parametro': 'Parameter',
  'administrador/porto-de-destino': 'Destination Port',
  'administrador/post': 'Post',
  'administrador/questionarios': 'Questionnaires',
  'administrador/servico-agendado': 'Scheduled Service',
  'administrador/execucao-de-servico-agendado': 'Scheduled Service Execution',
  'administrador/gerenciador-de-usuarios-conectados': 'Connected Users Manager',
  'administrador/terminal-de-pagamento': 'Payment Terminal',
  'administrador/tipos-de-anexo': 'Attachment Types',
  'administrador/tipo-de-logradouro': 'Street Type',
  'administrador/tipo-de-mensagem': 'Message Type',
  'administrador/trabalho': 'Job',
  'aprovacoes/acompanhamento-ciclos-de-aprovacao': 'Approval Cycles Tracking',
  'aprovacoes/entidade-de-aprovacao': 'Approval Entity',
  'aprovacoes/nova-fila-de-aprovacao-clientes': 'Approval Queue - Customers',
  'aprovacoes/fila-de-aprovacoes-contratos': 'Approval Queue - Contracts',
  'aprovacoes/fila-de-aprovacoes-pedidos': 'Approval Queue - Orders',
  'aprovacoes/regra-de-aprovacao': 'Approval Rule',
  'aprovacoes/sub-status-ciclo-de-aprovacao': 'Sub-Status - Approval Cycle',
  'autenticador/departamento-de-usuario': 'User Department',
  'autenticador/grupo': 'Group',
  'autenticador/modulo': 'Module',
  'autenticador/perfil': 'Profile',
  'autenticador/tentativa-de-login': 'Login Attempt',
  'autenticador/url': 'URL',
  'autenticador/usuario': 'User',
  'clientes/agrupamento-de-cliente': 'Customer Grouping',
  'clientes/anexo-de-cliente': 'Customer Attachment',
  'clientes/atividade-economica': 'Economic Activity',
  'clientes/canal': 'Channel',
  'clientes/categoria-cfop': 'CFOP Category',
  'clientes/classificacao-comercial': 'Commercial Classification',
  'clientes/cliente': 'Customer',
  'clientes/fila-de-aprovacoes-de-cadastros': 'Registration Approval Queue',
  'clientes/grupo-economico': 'Economic Group',
  'clientes/parametro-de-entidade-especial': 'Special Entity Parameter',
  'clientes/perfil-de-consumo': 'Consumption Profile',
  'clientes/ramo-de-atividade': 'Line of Business',
  'clientes/rede-de-cliente': 'Customer Network',
  'clientes/regime-especial': 'Special Tax Regime',
  'clientes/sin-partner': 'SIN Partner',
  'contratos/anexo-de-contrato': 'Contract Attachment',
  'contratos/contrato': 'Contract',
  'contratos/meta-de-consumo': 'Consumption Target',
  'contratos/periodo-de-curso': 'Course Period',
  'contratos/politica-de-contrato': 'Contract Policy',
  'contratos/turma-de-curso': 'Course Class',
  'faturamentos/analise-datamatrix': 'DataMatrix Analysis',
  'faturamentos/buscar-remessa': 'Find Shipment',
  'faturamentos/fechamento-de-consignado': 'Consignment Closing',
  'faturamentos/fila-de-remessas-aguardando-separacao': 'Shipments Awaiting Picking Queue',
  'faturamentos/fila-do-romaneio': 'Loading List Queue',
  'faturamentos/fila-de-geracao-de-etiquetas': 'Label Generation Queue',
  'faturamentos/trocas-devolucoes': 'Exchanges/Returns',
  'faturamentos/relatorio-de-consignado': 'Consignment Report',
  'faturamentos/relatorio-de-status-do-serial': 'Serial Status Report',
  'faturamentos/relatorio-operador-logistico': 'Logistics Operator Report',
  'faturamentos/transferencia-reversa': 'Reverse Transfer',
  'fiscal/feature-flag-do-modulo-fiscal': 'Tax Module Feature Flag',
  'fiscal/sequencia-de-acesso': 'Access Sequence',
  'fiscal/tipo-de-imposto': 'Tax Type',
  'ignition/dashboard': 'Dashboard',
  'integrador/configuracao-de-integracao-sap': 'SAP Integration Configuration',
  'integrador/tipo-de-etapa': 'Stage Type',
  'integrador/fluxos-de-integracao': 'Integration Flows',
  'integrador/monitoramento-de-integracoes-sap': 'SAP Integrations Monitoring',
  'inventarios/contagem-inventario': 'Inventory Count',
  'inventarios/inventario': 'Inventory',
  'inventarios/inventarios-disponiveis': 'Available Inventories',
  'leads/indicacao-de-lead': 'Lead Referral',
  'leads/quadro-kanban-leads': 'Leads Kanban Board',
  'leads/pipeline-de-venda': 'Sales Pipeline',
  'ocorrencias/ocorrencias-pfcq': 'PFCQ Occurrences',
  'ocorrencias/pesquisas': 'Surveys',
  'ocorrencias/solicitacoes-handson': 'Hands On Requests',
  'ocorrencias/tipo-incidencia': 'Incidence Type',
  'pedidos/anexo-de-pedido': 'Order Attachment',
  'pedidos/caixas-do-pedido': 'Order Boxes',
  'pedidos/categoria-item': 'Item Category',
  'pedidos/nova-fila-de-aprovacao-pedidos': 'New Approval Queue - Orders',
  'pedidos/item-lista-de-preco': 'Price List Item',
  'pedidos/item-orcamento': 'Quote Item',
  'pedidos/lista-de-preco': 'Price List',
  'pedidos/log-analise-de-pedido': 'Order Review Log',
  'pedidos/log-de-faturamento-sap': 'SAP Invoicing Log',
  'pedidos/moeda': 'Currency',
  'pedidos/motivo-da-ordem': 'Order Reason',
  'pedidos/nota-fiscal': 'Invoice',
  'pedidos/notas-fiscais-xml': 'Invoice XML',
  'pedidos/operacao-inteligente': 'Smart Operation',
  'pedidos/orcamento': 'Quote',
  'pedidos/configuracao-de-produtos-no-lounge': 'Product Configuration in the Lounge',
  'pedidos/pedido': 'Order',
  'pedidos/pedido-para-integracao': 'Order for Integration',
  'pedidos/previsao-de-entrega-de-pedido': 'Order Delivery Forecast',
  'pedidos/regra-de-frete': 'Freight Rule',
  'pedidos/taxa-de-moeda': 'Currency Rate',
  'pedidos/tipo-item': 'Item Type',
  'pedidos/transportadora': 'Carrier',
  'pedidos/unidade-negocio': 'Business Unit',
  'planejamento-de-vendas/planejamento-de-vendas': 'Sales Planning',
  'politicas/condicao-de-pagamento': 'Payment Term',
  'politicas/cota-de-venda': 'Sales Quota',
  'politicas/estrutura-comercial': 'Commercial Structure',
  'politicas/forma-de-pagamento': 'Payment Method',
  'politicas/parametro-de-campanha': 'Campaign Parameter',
  'politicas/politica-comercial': 'Commercial Policy',
  'politicas/premiacao-condicionada': 'Conditional Reward',
  'politicas/restricao-de-venda': 'Sales Restriction',
  'politicas/territorio': 'Territory',
  'produtos/caixa-de-embalagem': 'Packaging Box',
  'produtos/conjunto-de-fresa': 'Milling Set',
  'produtos/familia-de-produto': 'Product Family',
  'produtos/grupo-de-produto': 'Product Group',
  'produtos/gtin-do-produto': 'Product GTIN',
  'produtos/hierarquia-de-produto': 'Product Hierarchy',
  'produtos/imagem-de-produto': 'Product Image',
  'produtos/imposto-produto': 'Product Tax',
  'produtos/marca-de-produto': 'Product Brand',
  'produtos/produto': 'Product',
  'produtos/saldo-de-estoque': 'Stock Balance',
  'produtos/saldo-de-estoque-agrupado': 'Grouped Stock Balance',
  'produtos/tipo-de-produto': 'Product Type',
  'qualidade/analise-de-qualidade': 'Quality Analysis',
  'qualidade/refugo': 'Scrap',
  'regulatorios/agencia-reguladora': 'Regulatory Agency',
  'regulatorios/cartucho': 'Cartridge',
  'regulatorios/conexao-do-produto': 'Product Connection',
  'regulatorios/etiqueta-de-rastreabilidade': 'Traceability Label',
  'regulatorios/etiqueta-emblistadora': 'Blister Label',
  'regulatorios/etiqueta-encartuchadora': 'Cartoning Label',
  'regulatorios/etiqueta-retrabalho-arabia-saudita': 'Rework Label — Saudi Arabia',
  'regulatorios/etiqueta-retrabalho-bulgaria': 'Rework Label — Bulgaria',
  'regulatorios/etiqueta-retrabalho-india': 'Rework Label — India',
  'regulatorios/etiqueta-retrabalho-italia': 'Rework Label — Italy',
  'regulatorios/etiqueta-retrabalho-manual': 'Manual Rework Label',
  'regulatorios/etiqueta-retrabalho-mexico': 'Rework Label — Mexico',
  'regulatorios/grupo-do-produto': 'Product Group',
  'regulatorios/line-arabia-saudita': 'Line — Saudi Arabia',
  'regulatorios/linha-do-produto': 'Product Line',
  'regulatorios/lista-geral-de-produtos': 'General Product List',
  'regulatorios/marcacao-ce': 'CE Marking',
  'regulatorios/registros': 'Records',
  'regulatorios/status-regulatorios': 'Regulatory Status',
  'regulatorios/tipo-do-material-de-producao': 'Production Material Type',
  'roteirizador/agenda': 'Schedule',
  'roteirizador/ausencia': 'Absence',
  'roteirizador/formulario': 'Form',
  'roteirizador/formulario-agenda': 'Schedule Form',
  'roteirizador/campo-do-formulario': 'Form Field',
  'roteirizador/tipo-de-campo': 'Field Type',
  'roteirizador/jornada': 'Journey',
  'roteirizador/metricas': 'Metrics',
  'roteirizador/tipo-de-agenda': 'Schedule Type',
};

// Nomes das subpáginas técnicas (submenu) em inglês, por "groupSlug/slug".
export const tecnicoSubEn: Record<string, string> = {
  'fluxos/romaneio': 'Loading List (Romaneio)',
  'fluxos/criacao-de-cliente': 'Customer Registration x Approvals - With Ignition',
  'fluxos/configuracao-de-produtos-no-lounge': 'Product Configuration in the Lounge',
  'fluxos/cadastro-clientes-sem-ignition': 'Customer Registration x Approvals - Without Ignition',
};

// --- Ordenação alfabética (locale-aware) da navegação ---
// Fonte única de ordenação usada pelo menu lateral, home, RoutineList e paginador,
// para manter módulos, rotinas (telas), grupos técnicos e subpáginas SEMPRE em
// ordem alfabética conforme o idioma exibido (PT por padrão, EN quando isEn=true).
const ptCollator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
const enCollator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
const collatorFor = (isEn: boolean) => (isEn ? enCollator : ptCollator);

export function sortedModules(isEn = false): ModuleDef[] {
  return [...modules].sort((a, b) =>
    collatorFor(isEn).compare(
      isEn ? moduleEn[a.id]?.label ?? a.label : a.label,
      isEn ? moduleEn[b.id]?.label ?? b.label : b.label,
    ),
  );
}

export function sortedRoutines(mod: ModuleDef, isEn = false): RoutineLink[] {
  return [...mod.routines].sort((a, b) =>
    collatorFor(isEn).compare(
      isEn ? routineTitleEn[`${mod.id}/${a.slug}`] ?? a.title : a.title,
      isEn ? routineTitleEn[`${mod.id}/${b.slug}`] ?? b.title : b.title,
    ),
  );
}

export function sortedTecnicoPages(isEn = false): TecnicoGroup[] {
  return [...tecnicoPages].sort((a, b) =>
    collatorFor(isEn).compare(
      isEn ? tecnicoGroupEn[a.slug]?.title ?? a.title : a.title,
      isEn ? tecnicoGroupEn[b.slug]?.title ?? b.title : b.title,
    ),
  );
}

export function sortedTecnicoSubPages(group: TecnicoGroup, isEn = false): RoutineLink[] {
  return [...(group.pages ?? [])].sort((a, b) =>
    collatorFor(isEn).compare(
      isEn ? tecnicoSubEn[`${group.slug}/${a.slug}`] ?? a.title : a.title,
      isEn ? tecnicoSubEn[`${group.slug}/${b.slug}`] ?? b.title : b.title,
    ),
  );
}
