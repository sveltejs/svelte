---
title: 'svelte/store'
---

Le module `svelte/store` exporte des fonctions pour créer des <span class="vo">[stores](/docs/sveltejs#store)</span> [de lecture (_readable_)](/docs/svelte-store#readable), [d'écriture (_writable_)](/docs/svelte-store#writable) et [dérivés (_derived_)](/docs/svelte-store#derived).

Gardez à l'esprit que vous n'êtes pas _obligé•e_ d'utiliser ces fonctions pour profiter de la [syntaxe réactive `$store`](/docs/svelte-components#script-4-pr-fixer-les-stores-avec-$-pour-acc-der-leur-valeur) dans vos composants. Tout objet qui implémente correctement `.subscribe`, `unsubscribe`, et (éventuellement) `.set` est un store valide, et fonctionnera à la fois avec la syntaxe spéciale, et avec les [stores dérivés](/docs/svelte-store#derived) de Svelte.

Cela permet d'envelopper presque toute autre bibliothèque de gestion d'état réactif pour l'utiliser dans Svelte. Renseignez-vous sur le [contrat de store](/docs/svelte-components#script-4-pr-fixer-les-stores-avec-$-pour-acc-der-leur-valeur) pour voir à quoi ressemble une implémentation fonctionnelle.

## `writable`

> EXPORT_SNIPPET: svelte/store#writable

Fonction qui crée un <span class="vo">[store](/docs/sveltejs#store)</span> dont les valeurs peuvent être définies à partir de composants "extérieurs". Il est créé comme un objet avec les méthodes supplémentaires `set` et `update`.

`set` est une méthode qui prend un argument la valeur à définir. La valeur courante du <span class="vo">[store](/docs/sveltejs#store)</span> est remplacée par la valeur de l'argument si celle-ci n'est pas déjà égale à la valeur courante.

`update` est une méthode qui prend un <span class="vo">[callback](/docs/development#callback)</span> comme seul argument. Le <span class="vo">[callback](/docs/development#callback)</span> prend la valeur existante du <span class="vo">[store](/docs/sveltejs#store)</span> comme argument et renvoie la nouvelle valeur à définir pour le <span class="vo">[store](/docs/sveltejs#store)</span>.

```js
/// file: store.js
import { writable } from 'svelte/store';

const count = writable(0);

count.subscribe(valeur => {
	console.log(valeur);
}); // affiche '0'.

count.set(1); // affiche '1'.

count.update(n => n + 1); // affiche '2'.
```

Si une fonction est passée comme deuxième argument, elle sera appelée lorsque le nombre d'abonnés au store passera de zéro à un (mais pas de un à deux, etc.). Cette fonction a comme argument une fonction `set` qui peut changer la valeur du <span class="vo">[store](/docs/sveltejs#store)</span>. Elle doit retourner une fonction `stop` qui sera appelée lorsque le nombre d'abonnés passera de un à zéro.

```ts
/// file: store.js
import { writable } from 'svelte/store';

const count = writable(0, () => {
	console.log('vous avez un abonné');
	return () => console.log('vous n'avez plus d'abonnés');
});

count.set(1); // ne fait rien

const unsubscribe = count.subscribe(value => {
	console.log(valeur);
}); // affiche 'vous avez un abonné', puis '1'.

unsubscribe(); // affiche "vous n'avez plus d'abonnés".
```

Notez que la valeur d'un `writable` est perdue lorsqu'il est détruit, par exemple lorsque la page est rafraîchie. Cependant, vous pouvez écrire votre propre logique pour synchroniser la valeur, par exemple dans le `localStorage`.

## `readable`

> EXPORT_SNIPPET: svelte/store#readable

Crée un <span class="vo">[store](/docs/sveltejs#store)</span> dont la valeur ne peut pas être modifiée de l'extérieur. Le premier argument est la valeur initiale du <span class="vo">[store](/docs/sveltejs#store)</span>, le second argument est le même que le second argument de `writable`.

```ts
<!--- file: App.svelte --->
// ---cut---
import { readable } from 'svelte/store';

const time = readable(null, set => {
	set(new Date());

	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => clearInterval(interval);
});
```

## `derived`

> EXPORT_SNIPPET: svelte/store#derived

Dérive un <span class="vo">[store](/docs/sveltejs#store)</span> à partir d'un ou plusieurs autres <span class="vo">[stores](/docs/sveltejs#store)</span>. Le <span class="vo">[callback](/docs/development#callback)</span> s'exécute initialement lorsque le premier abonné s'abonne, puis à chaque fois que les dépendances du <span class="vo">[store](/docs/sveltejs#store)</span> changent.

Dans la version la plus simple, `derived` prend un seul <span class="vo">[store](/docs/sveltejs#store)</span>, et le <span class="vo">[callback](/docs/development#callback)</span> renvoie une valeur dérivée.

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
}

export {};

// @filename: index.ts
// ---cut---
import { derived } from 'svelte/store';

const doubled = derived(a, ($a) => $a * 2);
```

Le <span class="vo">[callback](/docs/development#callback)</span> peut définir une valeur de manière asynchrone en acceptant un second argument, `set`, et en l'appelant au moment opportun.

Dans ce cas, vous pouvez également passer un troisième argument à `derived` - la valeur initiale du <span class="vo">[store](/docs/sveltejs#store)</span> dérivé avant le premier appel de `set` ou `update`. Si aucune valeur initiale n'est fournie, la valeur initiale du <span class="vo">[store](/docs/sveltejs#store)</span> sera `undefined`.

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
}

export {};

// @filename: index.ts
// @errors: 18046 2769 7006
// ---cut---
import { derived } from 'svelte/store';

const delayed = derived(a, ($a, set) => {
	setTimeout(() => set($a), 1000);
}, 2000);

const delayedIncrement = derived(a, ($a, set, update) => {
	set($a);
	setTimeout(() => update(x => x + 1), 1000);
	// chaque fois que $a produit une valeur, ceci va produire
	// deux valeurs, $a immédiatement, pius $a + 1 une seconde plus tard
});
```

Si vous renvoyez une fonction à partir du <span class="vo">[callback](/docs/development#callback)</span>, elle sera appelée lorsque a) le <span class="vo">[callback](/docs/development#callback)</span> s'exécute à nouveau, ou b) le dernier abonné se désabonne.

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const frequency: Writable<number>;
}

export {};

// @filename: index.ts
// ---cut---
import { derived } from 'svelte/store';

const tick = derived(
	frequency,
	($frequency, set) => {
		const interval = setInterval(() => {
			set(Date.now());
		}, 1000 / $frequency);

		return () => {
			clearInterval(interval);
		};
	},
	2000
);
```

Dans les deux cas, un tableau d'arguments peut être passé comme premier argument au lieu d'un seul <span class="vo">[store](/docs/sveltejs#store)</span>.

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
	const b: Writable<number>;
}

export {};

// @filename: index.ts

// ---cut---
import { derived } from 'svelte/store';

const summed = derived([a, b], ([$a, $b]) => $a + $b);

const delayed = derived([a, b], ([$a, $b], set) => {
	setTimeout(() => set($a + $b), 1000);
});
```

## `readonly`

> EXPORT_SNIPPET: svelte/store#readonly

Cette fonction utilitaire crée un <span class="vo">[store](/docs/sveltejs#store)</span> en lecture seule (<span class="vo">[readonly](/docs/development#readonly)</span>) à partir d'un autre <span class="vo">[store](/docs/sveltejs#store)</span>. Vous pouvez toujours vous abonner aux changements du <span class="vo">[store](/docs/sveltejs#store)</span> original en utilisant le <span class="vo">[store](/docs/sveltejs#store)</span> `readonly`.

```ts
import { readonly, writable } from 'svelte/store';

const writableStore = writable(1);
const readableStore = readonly(writableStore);

readableStore.subscribe(console.log);

writableStore.set(2); // console: 2
// @errors: 2339
readableStore.set(2); // ERROR
```

## `get`

> EXPORT_SNIPPET: svelte/store#get

De manière générale, il est recommandé de lire la valeur d'un <span class="vo">[store](/docs/sveltejs#store)</span> en vous y abonnant et en utilisant la valeur à mesure qu'elle change. Occasionnellement, vous pouvez avoir besoin de récupérer la valeur d'un <span class="vo">[store](/docs/sveltejs#store)</span> auquel vous n'êtes pas abonné. `get` vous permet de le faire.

> Cela fonctionne en créant un abonnement, en lisant la valeur, puis en se désabonnant. Cette méthode n'est donc pas recommandée lorsque le code concerné est exécuté à haute fréquence.

```js
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const store: Writable<string>;
}

export {};

// @filename: index.ts
// ---cut---
import { get } from 'svelte/store';

const value = get(store);
```

## Types

> TYPES: svelte/store
