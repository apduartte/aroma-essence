# Aromaéssence

> **Status:** versão demonstrativa. Imagens ilustrativas, produtos e condições comerciais sujeitos à confirmação da marca.

## Visão geral

Site estático, sem framework e sem etapa de build: HTML semântico, CSS com variáveis e JavaScript modular em um único arquivo. Pode ser publicado em qualquer hospedagem estática.

| Item | Detalhe |
|---|---|
| Tipo | Landing page de página única, com seções por âncora |
| Stack | HTML5, CSS3, JavaScript (ES6+) |
| Dependências | Nenhuma (apenas Google Fonts via CDN) |
| Hospedagem | Vercel (qualquer host estático serve) |

## Funcionalidades

- Seções: marca, coleções de produtos, coleção sazonal de Natal, corporativo e eventos, contato e FAQ.
- Formulário de orçamento com validação campo a campo, mensagens de erro acessíveis e campo oculto contra robôs (honeypot).
- Geração automática da mensagem e envio por WhatsApp (`wa.me`). Sem número configurado, a mensagem é copiada para a área de transferência.
- Seleção automática do produto no formulário ao clicar em "Consultar produto".
- Menu mobile acessível (fecha com Esc, clique fora ou troca de breakpoint).
- Animações de entrada com `IntersectionObserver` e respeito a `prefers-reduced-motion`.
- Layout responsivo (desktop, tablet e celular).
- SEO básico: meta description, Open Graph e dados estruturados JSON-LD.
- Acessibilidade: link "Pular para o conteúdo", `aria-*`, foco visível e rótulos associados aos campos.

## Estrutura

```
aroma-essence/
├── index.html   # Estrutura e conteúdo
├── styles.css   # Design tokens, layout, componentes e responsivo
└── script.js    # Menu, header, animações, validação e envio do formulário
```

## Como executar localmente

Não há instalação. Escolha uma opção:

```bash
# Opção 1: abrir o arquivo diretamente
# (dê dois cliques em index.html)

# Opção 2: servidor local simples
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Configuração

### WhatsApp

Em `script.js`, preencha `whatsappNumber` com DDI + DDD + número, somente dígitos:

```js
const CONFIG = {
  whatsappNumber: '5511972307467',
  // ...
};
```

Enquanto estiver vazio, o formulário copia a mensagem preparada para o usuário enviar manualmente.

### Identidade visual

As cores e fontes ficam nas variáveis CSS no início de `styles.css` (`:root`), como `--primary`, `--accent` e `--font-display`.

### Antes de publicar em produção

- Preencher o número oficial do WhatsApp.
- Remover a faixa "SITE DEMONSTRATIVO" do `index.html` e ajustar o texto do rodapé.
- Substituir as ilustrações em CSS por fotos reais dos produtos, se houver.
- Confirmar com a marca preços, composição dos kits e compatibilidade das cápsulas.

## Deploy na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) e importe este repositório.
2. Mantenha **Framework Preset** em *Other*, sem *Build Command* nem *Output Directory*.
3. Clique em **Deploy**. Cada `git push` na branch `main` gera uma nova publicação.

## Decisões técnicas

- **Sem framework:** a página é estática e pequena, então HTML, CSS e JS puros dão carregamento rápido e manutenção simples.
- **CSS com design tokens:** cores, fontes e espaçamentos centralizados em variáveis facilitam trocar a identidade visual.
- **JavaScript em módulos internos:** cada funcionalidade (menu, header, animações, formulário) tem sua função de inicialização.
- **Progressive enhancement:** a classe `js` só é adicionada quando o script carrega, então o conteúdo continua visível sem JavaScript.

## Roadmap sugerido

- Fotos reais e galeria de produtos.
- Analytics e acompanhamento de conversões (cliques no formulário e no WhatsApp).
- Domínio próprio.
- Páginas separadas para as linhas de produto, se o catálogo crescer.

## Autoria

Desenvolvido por [Ana Paula Duarte](https://github.com/apduartte).
