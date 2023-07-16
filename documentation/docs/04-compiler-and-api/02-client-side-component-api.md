---
title: 'API de composant client-side'
---

## Créer un composant

```ts
// @errors: 2554
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var options: ComponentConstructorOptions<Record<string, any>>;
}

// @filename: index.ts
// @errors: 2554
// ---cut---
const component = new Component(options);
```

Un composant <span class="vo">[client-side](/docs/web#client-side-rendering)</span> est une classe JavaScript correspondant à un composant compilé avec l'option `generate: 'dom'` (ou avec l'option `generate` non spécifiée).

```ts
// @errors: 2554
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare module './App.svelte' {
	class Component extends SvelteComponent {}
	export default Component;
}

// @filename: index.ts
// @errors: 2554
// ---cut---
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		// en supposant que App.svelte contienne :
		// `export let answer`:
		answer: 42
	}
});
```

Les options d'initialisation suivantes peuvent être utilisées :

| option | défaut | description |
| --- | --- | --- |
| `target` | **none** | Un élément `HTMLElement` ou `ShadowRoot` sur lequel rendre le composant. Cette option est obligatoire
| `anchor` | `null` | Un enfant de la cible `target` à rendre juste avant le composant
| `props` | `{}` | Des propriétés avec lesquelles le composant sera initialisé
| `context` | `new Map()` | Une `Map` de paires clé-valeur de contexte à fournir au composant
| `hydrate` | `false` | Voir plus bas
| `intro` | `false` | Si `true`, jouera les transitions au premier rendu, plutôt que d'attendre de futurs changements d'état

Les enfants existants de la cible `target` ne sont pas affectés.

L'option d'hydratation `hydrate` indique à Svelte de mettre à jour le <span class="vo">[DOM](/docs/web#dom)</span> existant (habituellement à partir du <span class="vo">[SSR](/docs/web/#ssr)</span>) plutôt que de créer de nouveaux éléments. Cela ne fonctionnera que si le composant a été compilé avec l'option [`hydratable: true`](/docs/svelte-compiler#compile). L'hydratation de la section `<head>` ne fonctionnera que si le code généré côté serveur a également été compilé avec l'option `hydratable: true`. Cette option a pour effet d'identifier chaque élément à l'intérieur de la section `<head>` de telle sorte que le composant sache quels éléments il peut supprimer pendant l'hydratation.

Alors que les enfants de la cible `target` ne sont normalement pas modifiés, l'option `hydrate: true` causera leur suppression. Pour cette raison, l'option `anchor` ne peut pas être utilisée en même temps que `hydrate: true`.

Le <span class="vo">[DOM](/docs/web#dom)</span> existant n'a pas besoin de correspondre au composant, Svelte "réparera" le DOM au fur et à mesure.

```ts
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare module './App.svelte' {
	class Component extends SvelteComponent {}
	export default Component;
}

// @filename: index.ts
// @errors: 2322 2554
// ---cut---
import App from './App.svelte';

const app = new App({
	target: document.querySelector('#server-rendered-html'),
	hydrate: true
});
```

## `$set`

```ts
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var component: Component;
	var props: Record<string, any>;
}

export {};

// @filename: index.ts
// ---cut---
component.$set(props);
```

`$set` définit programmatiquement les <span class="vo">[props](/docs/sveltejs#props)</span> d'une instance de composant. `component.$set({ x: 1 })` est équivalent à `x = 1` à l'intérieur de la balise `<script>` du composant.

L'appel de cette méthode déclenchera une mise à jour à la prochaine micro-tâche — le <span class="vo">[DOM](/docs/web#dom)</span> _n'est pas_ mis à jour de manière synchrone.

```ts
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var component: Component;
}

export {};

// @filename: index.ts
// ---cut---
component.$set({ answer: 42 });
```

## `$on`

```ts
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var component: Component;
	var ev: string;
	var callback: (event: CustomEvent) => void;
}

export {};

// @filename: index.ts
// ---cut---
component.$on(ev, callback);
```

`$on` enregistre un <span class="vo">[callback](/docs/development#callback)</span> qui sera appelé à chaque génération d'un évènement de type `event`.

`$on` retourne une fonction dont l'exécution permet de supprimer l'écoute de cet événement.

```ts
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var component: Component;
}

export {};

// @filename: index.ts
// ---cut---
const off = component.$on('selected', (event) => {
	console.log(event.detail.selection);
});

off();
```

## `$destroy`

```js
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var component: Component;
}

export {}

// @filename: index.ts
// ---cut---
component.$destroy();
```

Retire un composant du <span class="vo">[DOM](/docs/web#dom)</span> et déclenche les <span class="vo">[callbacks](/docs/development#callback)</span> de type `onDestroy` associés.

## Props de composant

```js
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var component: Component;
}

export {}

// @filename: index.ts
// @errors: 2339
// ---cut---
component.prop;
```

```js
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var component: Component;
	var value: unknown;
}

export {}

// @filename: index.ts
// @errors: 2339
// ---cut---
component.prop = value;
```

Si un composant est compilé avec l'option `accessors: true`, chaque instance sera générée avec des <span class="vo">[getters et setters](/docs/development#getter-setter)</span> correspondant à chacune de ses <span class="vo">[props](/docs/sveltejs#props)</span>. Mettre à jour une des props déclenchera une mise à jour _synchrone_. Ce comportement est différent de la mise à jour asynchrone déclenchée par l'appel `component.$set(...)`.

Par défaut, `accessors` est initialisé à `false`, à moins que vous ne compiliez un [web component](/docs/custom-elements-api).

```js
// @filename: ambient.d.ts
import { SvelteComponent, ComponentConstructorOptions } from 'svelte';

declare global {
	class Component extends SvelteComponent {}
	var component: Component;
	var props: Record<string, any>;
}

export {}

// @filename: index.ts
// @errors: 2339
// ---cut---
console.log(component.count);
component.count += 1;
```
