<p align="center">
  <a href="https://svelte.dev">
	<img width="695" alt="Cybernetically enhanced web apps: Svelte" src="https://user-images.githubusercontent.com/1162160/56335691-7a22b280-616b-11e9-91ec-711cf6f262e3.png">
  </a>
</p>


## What is Svelte?

Svelte is a new way to build web applications. It's a compiler that takes your declarative components and converts them into efficient JavaScript that surgically updates the DOM.

Learn more at the [Svelte website](https://svelte.dev), or stop by the [Discord chatroom](https://discord.gg/yy75DKs).


## Development

Pull requests are encouraged and always welcome. [Pick an issue](https://github.com/sveltejs/svelte/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) and help us out!

To install and work on Svelte locally:

```bash
git clone git@github.com:sveltejs/svelte.git
cd svelte
npm install
npm run dev
```

The compiler is written in [TypeScript](https://www.typescriptlang.org/), but don't let that put you off — it's basically just JavaScript with type annotations. You'll pick it up in no time. If you're using an editor other than [VSCode](https://code.visualstudio.com/) you may need to install a plugin in order to get syntax highlighting and code hints etc.


### Running Tests

```bash
npm run test
```

For running single tests, you can use pattern matching. For example, to run all the tests involving transitions:

```bash
npm run test -- -g transition
```


## License

[MIT](LICENSE)
