---
title: 'API de composant server-side'
---

```js
// @noErrors
const result = Component.render(...)
```

À la différence des composants <span class="vo">[client-side](/docs/web#client-side-rendering)</span>, les composants <span class="vo">[server-side](/docs/web#server-side-rendering)</span> n'ont pas d'existence après que vous les ayez rendus — leur seul et unique rôle est de créer du HTML et du CSS. Pour cette raison, leur <span class="vo">[API](/docs/development#api)</span> est un peu différente.

Un composant <span class="vo">[server-side](/docs/web#server-side-rendering)</span> expose une méthode `render` qui peut être appelée avec des <span class="vo">[props](/docs/sveltejs#props)</span> optionnelles. Cette méthode renvoie un objet avec des champs `head`, `html` et `css`, où `head` représente le contenu de tout élément `<svelte:head>` rencontré.

Vous pouvez importer un composant Svelte directement dans Node en utilisant [`svelte/register`](/docs/svelte-register).

```js
// @noErrors
require('svelte/register');

const App = require('./App.svelte').default;

const { head, html, css } = App.render({
	answer: 42
});
```

La méthode `.render()` accepte les paramètres suivants :

| paramètre | défaut | description                                        |
| --------- | ------- | -------------------------------------------------- |
| `props`   | `{}`    | Un objet de <span class="vo">[props](/docs/sveltejs#props)</span> à fournir au composant |
| `options` | `{}`    | Un objet d'options                               |

L'objet `options` accepte les champs suivants :

| option    | défaut     | description                                                              |
| --------- | ----------- | ------------------------------------------------------------------------ |
| `context` | `new Map()` | Une `Map` de paires clé-valeur de contexte à fournir au composant |

```js
// @noErrors
const { head, html, css } = App.render(
	// props
	{ answer: 42 },
	// options
	{
		context: new Map([['context-key', 'context-value']])
	}
);
```
