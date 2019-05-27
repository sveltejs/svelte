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


## What is Svelte?

Svelte 将带给你不一样的代码体验. 她会把组件转换成高效的 JavaScript , 精准的去更新 DOM.

了解更多 [Svelte website](https://svelte.dev), 吐槽一下 [Discord chatroom](https://svelte.dev/chat).


## Development

欢迎提 PR 或者 [issue](https://github.com/sveltejs/svelte/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) 来一起维护项目 !

本地使用 Svelte :

```bash
git clone https://github.com/sveltejs/svelte.git
cd svelte
npm install
```

构建:

```bash
npm run build
```

运行:

```bash
npm run dev
```

Svelte 由 [TypeScript](https://www.typescriptlang.org/) 编写, 不必担心, 你分分钟就能学会怎么使用 TypeScript. 不过你的 IDE 不是 [VS Code](https://code.visualstudio.com/) 的话, 装个插件来高亮代码吧.


### Running Tests

```bash
npm run test
```

你可以在命令中添加 `-g` (aka `--grep`) 修饰来选择测试范围. 比如你可以这样来测试 transitions:

```bash
npm run test -- -g transition
```


## svelte.dev

https://svelte.dev 网站由 [Sapper](https://sapper.svelte.dev) 构建, 源码和所有的文档都在 [site](site) 文件夹下, 本地调试:

```bash
cd site
npm install && npm run update
npm run dev
```


## License

[MIT](LICENSE)
