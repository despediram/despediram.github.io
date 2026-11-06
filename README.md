# Ton — Portfólio

Site pessoal de **Ton / @despediram**, com visual preto, branco e verde, abertura animada, partículas, mini sites interativos e trilha sonora original.

## Publicação

O site é estático. No GitHub Pages, publique a branch `main` a partir de `/ (root)`. O arquivo `.nojekyll` mantém os arquivos estáticos intactos.

## Edição

- `index.html`: conteúdo, redes sociais e tela de entrada.
- `style.css`: layout e identidade visual.
- `assembly.js` e `particles.js`: abertura e efeitos visuais.
- `sound.js` e `entry.js`: trilha, efeitos e escolha de áudio.
- `src/demos/`: fontes dos três mini sites.
- `scripts/build-demos.py`: atualiza os HTMLs autocontidos em `demos/`.

Após editar os mini sites, execute `python scripts/build-demos.py`. Nenhuma dependência extra é necessária.

Para visualizar localmente, execute `python -m http.server 8000` nesta pasta e abra `http://localhost:8000`.

A música é gerada no navegador com Web Audio e começa após a escolha de entrada com som. Os controles permitem silenciar, ajustar o volume e separar música de efeitos.

## Redes

Instagram, TikTok, YouTube e Discord: **@despediram**.
