const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const EXTENSOES = [
  ".js", ".jsx", ".ts", ".tsx",
  ".json", ".md", ".html", ".css"
];

const IGNORAR = [
  "node_modules", ".git", ".next",
  ".vercel", "dist", "build", "coverage"
];

// Alterar somente o nome da coleção.
// Não substituir "aromática" em descrições genéricas.
const SUBSTITUICOES = [
  {
    regex: /\bAromática\b/g,
    novo: "Bem-Estar"
  },
  {
    regex: /\bAROMÁTICA\b/g,
    novo: "BEM-ESTAR"
  }
];

const DRY_RUN = process.argv.includes("--dry-run");

let encontrados = 0;
let alterados = 0;

function percorrer(diretorio) {
  for (const item of fs.readdirSync(diretorio, {
    withFileTypes: true
  })) {
    const arquivo = path.join(diretorio, item.name);

    if (item.isDirectory()) {
      if (!IGNORAR.includes(item.name)) {
        percorrer(arquivo);
      }
      continue;
    }

    if (!EXTENSOES.includes(path.extname(item.name))) {
      continue;
    }

    const original = fs.readFileSync(arquivo, "utf8");
    let atualizado = original;
    let quantidade = 0;

    for (const regra of SUBSTITUICOES) {
      atualizado = atualizado.replace(regra.regex, () => {
        quantidade++;
        return regra.novo;
      });
    }

    if (quantidade === 0) continue;

    encontrados += quantidade;

    console.log(
      `${DRY_RUN ? "[SIMULAÇÃO]" : "[ALTERAÇÃO]"} ${arquivo}: ${quantidade}`
    );

    if (!DRY_RUN) {
      fs.writeFileSync(arquivo, atualizado, "utf8");
      alterados++;
    }
  }
}

console.log("\n=== Aromaéssence | Correção de nomenclatura ===\n");

percorrer(ROOT);

console.log("\n=== Resultado ===");
console.log(`Ocorrências encontradas: ${encontrados}`);
console.log(`Arquivos modificados: ${alterados}`);

if (DRY_RUN) {
  console.log("\nSimulação concluída. Nenhum arquivo foi alterado.");
}
