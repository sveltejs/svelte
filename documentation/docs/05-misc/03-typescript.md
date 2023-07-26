---
title: TypeScript
---

Vous pouvez utiliser TypeScript dans vos composants. Des extensions d'<span class="vo">[IDE](/docs/development#ide)</span> comme l'[extension Svelte VSCode](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) vous aideront à voir et corriger les erreurs directement dans votre éditeur, et [`svelte-check`](https://www.npmjs.com/package/svelte-check) fera la même chose en ligne de commande, que vous pouvez ajouter à votre chaîne d'intégration continue.

## Mise en place

Pour utiliser TypeScript dans vos composants Svelte, vous devez ajouter un préprocesseur qui compilera le code TypeScript en JavaScript.

### Utiliser SvelteKit ou Vite

La façon la plus simple de démarrer avec Typescript est de créer un nouveau projet en tapant : `npm create svelte@latest`, en suivant les propositions et en choisissant l'option TypeScript.

```ts
/// file: svelte.config.js
// @noErrors
import { vitePreprocess } from '@sveltejs/kit/vite';

const config = {
	preprocess: vitePreprocess()
};

export default config;
```

Si vous n'avez pas besoin ou ne souhaitez pas de toutes les fonctionnalités de SvelteKit, vous pouvez démarrer un projet Svelte avec Vite en tapant : `npm create vite@latest` et en choisissant l'option `svelte-ts`.

```ts
/// file: svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess()
};

export default config;
```

Dans les deux cas, un fichier `svelte.config.js` avec `vitePreprocess` sera ajouté. Vite et SvelteKit liront ce fichier de configuration.

### Autres outils de compilation

Si vous utilisez d'autres outils comme Rollup ou Webpack, installez leurs <span class="vo">[plugins](/docs/development#plugin)</span> Svelte respectifs. Pour Rollup, il s'agit de [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte) et pour Webpack, c'est [svelte-loader](https://github.com/sveltejs/svelte-loader). Dans les deux cas, vous devez installer `typescript` et `svelte-preprocess` et ajouter le préprocesseur à la configuration du plugin (voir les documentations respectives). Si vous démarrez un nouveau projet, vous pouvez utiliser le [template rollup](https://github.com/sveltejs/template) ou le [template webpack](https://github.com/sveltejs/template-webpack) pour configurer votre projet.

> Si vous démarrez un nouveau projet, nous vous recommandons plutôt d'utiliser SvelteKit ou Vite.

## `<script lang="ts">`

Pour utiliser TypeScript dans vos composants Svelte, ajoutez `lang="ts"` au tag `script` :

```svelte
<script lang="ts">
	let name: string = 'world';

	function greet(name: string) {
		alert(`Hello, ${name}!`);
	}
</script>
```

### Props

Les <span class="vo">[props](/docs/sveltejs#props)</span> peuvent directement être typées sur l'instruction `export let` :

```svelte
<script lang="ts">
	export let name: string;
</script>
```

### Slots

Les <span class="vo">[slots](/docs/sveltejs#slot)</span> et les types de leurs <span class="vo">[props](/docs/sveltejs#props)</span> sont déduits des types des props qui leurs sont passées :

```svelte
<script lang="ts">
	export let name: string;
</script>

<slot {name} />

<!-- Ailleurs -->
<Comp let:name>
	<!--    ^ Déduit comme string -->
	{name}
</Comp>
```

### Events

Les événements peuvent être typés avec `createEventDispatcher` :

```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		event: null; // n'accepte pas d'argument
		click: string; // contient obligatoirement une string
		type: string | null; // peut contenir une string ou être non défini
	}>();

	function handleClick() {
		dispatch('event');
		dispatch('click', 'Salut');
	}

	function handleType() {
		dispatch('event');
		dispatch('type', Math.random() > 0.5 ? 'tout le monde' : null);
	}
</script>

<button on:click={handleClick} on:keydown={handleType}>Clic</button>
```

## Surcharge des types de DOM natifs

Svelte fournit des types aussi proche que possible pour chaque élément HTML du <span class="vo">[DOM](/docs/web#dom)</span> qui existe. Parfois, vous voudrez utiliser des attributs expérimentaux ou des événements personnalisés. Dans ces cas, TypeScript lèvera une erreur de type, en indiquant qu'il ne connaît pas ces types. S'il s'agit d'un attribut ou événement standard et non expérimental, il se peut tout à fait que ce soit un type manquant dans [le typage HTML de Svelte](https://github.com/sveltejs/svelte/blob/master/packages/svelte/elements.d.ts). Dans ce cas, vous êtes invité•e à ouvrir une <span class="vo">[issue](/docs/development#issue)</span> ou une <span class="vo">[PR](/docs/development#pull-request)</span> pour le corriger.

S'il s'agit d'un attribut ou d'un événement expérimental ou personnalisé, vous pouvez étendre le typage comme suit :

```ts
/// fichier: additional-svelte-typings.d.ts
declare namespace svelteHTML {
	// extension de type pour un élément
	interface IntrinsicElements {
		'my-custom-element': { someattribute: string; 'on:event': (e: CustomEvent<any>) => void };
	}
	// extension de type pour un attribut
	interface HTMLAttributes<T> {
		// Si vous voulez utiliser on:beforeinstallprompt
		'on:beforeinstallprompt'?: (event: any) => any;
		// Si vous voulez utiliser myCustomAttribute={..} (note: tout en minuscule)
		mycustomattribute?: any; // Vous pouvez remplacer any par quelque chose de plus précis si vous le souhaitez
	}
}
```

Ensuite, assurez vous que les fichiers `d.ts` soient référencés dans `tsconfig.json`. Si vous lisez quelque chose comme : `"include": ["src/**/*"]` et vos fichiers `d.ts` sont dans votre dossier `src`, ça devrait marcher. Vous devrez peut-être relancer votre serveur pour que le changement prenne effet.

Since Svelte version 4.2 / `svelte-check` version 3.5 / VS Code extension version 107.10.0 you can also declare the typings by augmenting the `svelte/elements` module like this:

```ts
/// file: additional-svelte-typings.d.ts
import { HTMLButtonAttributes } from 'svelte/elements'

declare module 'svelte/elements' {
    export interface SvelteHTMLElements {
        'custom-button': HTMLButtonAttributes;
    }

	// allows for more granular control over what element to add the typings to
    export interface HTMLButtonAttributes {
        'veryexperimentalattribute'?: string;
    }
}

export {}; // ensure this is not an ambient module, else types will be overridden instead of augmented
```

## Experimental advanced typings

Quelques fonctionnalités sont manquantes pour bénéficier de tous les avantages de TypeScript dans des cas plus avancés, comme pour typer qu'un composant étend une interface, pour typer les <span class="vo">[slots](/docs/sveltejs#slot)</span> ou pour utiliser des génériques. Tout ceci est rendu possible en utilisant des fonctionnalités expérimentales avancées. Voir [la RFC](https://github.com/dummdidumm/rfcs/blob/ts-typedefs-within-svelte-components/text/ts-typing-props-slots-events.md) pour savoir comment définir de tels typages.

> Cette <span class="vo">[API](/docs/development#api)</span> est expérimentale et peut changer à tout moment.

## Limitations

### Pas de TypeScript dans le code HTML

Vous ne pouvez pas utiliser explicitement TypeScript dans les templates HTML. Par exemple, l'exemple suivant n'est pas possible :

```svelte
<script lang="ts">
	let count = 10;
</script>

<h1>Count as string: {count as string}!</h1> <!-- ❌ Ne fonctionne pas -->
{#if count > 4}
	{@const countString: string = count} <!-- ❌ Ne fonctionne pas -->
	{countString}
{/if}
```

### Déclarations réactives

Vous ne pouvez pas typer les déclarations réactives avec TypeScript de la manière dont vous typeriez une variable. Par exemple, le code suivant ne fonctionne pas :

```svelte
<script lang="ts">
	let count = 0;

	$: doubled: number = count * 2; // ❌ Ne fonctionne pas
</script>
```

Vous ne pouvez pas utiliser `: TYPE` car cela résulte en une syntaxe invalide. À la place, vous pouvez déplacer le typage sur une instruction `let` juste au dessus :

```svelte
<script lang="ts">
	let count = 0;

	let doubled: number;
	$: doubled = count * 2;
</script>
```

## Types

> TYPES: svelte
