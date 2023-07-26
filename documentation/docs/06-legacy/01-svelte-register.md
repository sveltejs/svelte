---
title: 'svelte/register'
---

> Cette <span class="vo">[API](/docs/development#api)</span> a été retirée de Svelte 4. La fonction `require` est maintenant dépréciée puisque les versions actuelles de Node comprennent le format ESM. Utilisez plutôt un <span class="vo">[bundler](/docs/web#bundler-packager)</span> comme Vite ou le <span class="vo">[framework](/docs/web#framework)</span> [SvelteKit](https://kit.svelte.dev) pour créer des modules JavaScript à partir de composants Svelte.

Pour rendre des composants Svelte en Node.js sans compilation, utilisez `require('svelte/register')`. Vous pourrez alors utiliser la fonction `require` pour inclure n'importe quel fichier `.svelte`.

```js
// @noErrors
require('svelte/register');

const App = require('./App.svelte').default;

// ...

const { html, css, head } = App.render({ answer: 42 });
```

> Le `.default` est nécessaire parce que nous convertissons des modules JavaScript natifs en modules CommonJS interprétés par Node. Notez cependant que si vos composent importent des modules JavaScript, ils ne réussirons pas à les charger avec Node et vous devrez utiliser un <span class="vo">[bundler](/docs/web#bundler-packager)</span>.

Pour définir des options de compilations ou utiliser une extension de fichier personnalisée, appelez le retour de la fonction `register()` comme une fonction :

```js
// @noErrors
require('svelte/register')({
	extensions: ['.customextension'], // par défaut ['.html', '.svelte']
	preserveComments: true
});
```
