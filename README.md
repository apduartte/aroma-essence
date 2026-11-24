# Aromaéssence

Landing page da **Coleção Especial de Natal 2026** da Aromaéssence: coleções aromáticas, fragrâncias e pedidos pelo WhatsApp.

Site estático, sem framework e sem etapa de build (HTML, CSS e JavaScript puros). Pode ser publicado em qualquer hospedagem estática.

## Estrutura

```
aroma-essence/
├── index.html
├── styles.css
├── script.js
├── 404.html
├── robots.txt
├── vercel.json
└── assets/img/   logo, favicon, capa, coleções, fragrâncias e og-image
```

## Conteúdo

- 4 coleções: Alegria (R$ 170,00), Bons Sonhos (R$ 75,00), Bem-Estar (R$ 150,00) e Serenidade (R$ 110,00).
- 4 fragrâncias: Cereja com Avelã, Maçã com Canela, Noite de Natal e Dia a Dia Bambu.
- Essência personalizada sob consulta.
- Formulário que monta a mensagem e abre o WhatsApp (nada é armazenado).

## Configuração

- **WhatsApp:** `CONFIG.whatsappNumber` em `script.js` (DDI + DDD + número, só dígitos). Os links em `index.html` também trazem o número como fallback para quando o JavaScript estiver desativado.
- **Identidade visual:** variáveis em `:root` no início de `styles.css`.
- **Domínio:** depois de definir o domínio, troque `SEU-DOMINIO` em `index.html` (canonical, `og:url`, `og:image` e JSON-LD):

```
sed -i 's/SEU-DOMINIO/aromaessence.com.br/g' index.html
```

## Executar localmente

```
python3 -m http.server 8000
# http://localhost:8000
```

## Deploy na Vercel

1. Em vercel.com/new, importe este repositório.
2. **Framework Preset:** Other. Deixe Build Command, Output Directory e Install Command vazios.
3. Clique em **Deploy**. Cada `git push` na `main` publica em produção.

## Antes de divulgar

- Confirmar com a marca prazos, entrega e formas de pagamento.
- Substituir as fotos por arquivos originais em alta resolução, mantendo os mesmos nomes.
- Trocar `SEU-DOMINIO` e criar `sitemap.xml` com a URL final.
