<p>
  <a href="https://svelte.dev">
	<img alt="Cybernetically enhanced web apps: Svelte" src="https://svelte-assets.surge.sh/banner.png">
  </a>

  <a href="https://www.npmjs.com/package/svelte">
    <img src="https://img.shields.io/npm/v/svelte.svg" alt="npm version">
  </a>

  <a href="https://packagephobia.now.sh/result?p=svelte">
    <img src="https://packagephobia.now.sh/badge?p=svelte" alt="install size">
  </a>

  <a href="https://travis-ci.org/sveltejs/svelte">
    <img src="https://api.travis-ci.org/sveltejs/svelte.svg?branch=master"
         alt="build status">
  </a>

  <a href="https://github.com/sveltejs/svelte/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/svelte.svg" alt="license">
  </a>
</p>

## O que é Svelte?

Svelte é um novo jeito de construir aplicações web. É um compilador que pega seus componentes declarativos e os converte em JavaScript eficiente que atualiza com grande precisão o DOM.

Saiba mais no [site do Svelte](https://svelte.dev), ou visite a [sala do Discord](https://svelte.dev/chat).

## Desenvolvimento

Pull requests são incentivados e sempre bem-vindos. [Escolha um issue](https://github.com/sveltejs/svelte/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) e nos ajude!

Para instalar e trabalhar com o Svelte localmente:

```bash
git clone git@github.com:sveltejs/svelte.git
cd svelte
npm install
```

Para construir o compilador e todos os outros módulos incluídos no pacote:

```bash
npm run build
```

Para observar as alterações e reconstruir continuamente o pacote (isso é útil se você estiver usando o [npm link](https://docs.npmjs.com/cli/link.html) para testar as alterações em um projeto localmente):

```bash
npm run dev
```

O compilador é escrito em [TypeScript](https://www.typescriptlang.org/), mas não deixe que isso te afaste - é basicamente apenas JavaScript com anotações de tipagem. Você vai entende-lo num instante. Se você estiver usando um editor diferente do [Visual Studio Code](https://code.visualstudio.com/), pode ser necessário instalar um plugin para obter um destaque da sintaxe e dicas de código, etc.

### Executando testes

```bash
npm run test
```

Para filtrar os testes, use `-g` (também conhecido como `--grep`). Por exemplo, para executar somente testes envolvendo transições:

```bash
npm run test -- -g transition
```

## svelte.dev

O código-fonte para https://svelte.dev, incluindo toda a documentação, está no diretório [site](site). O site é construído com [Sapper](https://sapper.svelte.dev). Para desenvolver localmente:

```bash
cd site
npm install && npm run update
npm run dev
```

## Licença

[MIT](LICENSE)
