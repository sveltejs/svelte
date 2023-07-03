---
title: Guide de migration Svelte 4
---

Ce guide de migration fournit un aperçu de la manière dont vous devez migrer une application en Svelte 3 vers Svelte 4. Allez voir les <span class="vo">[PRs](/docs/development#pull-request)</span> associées pour plus de détails au sujet de chaque changement. Utilisez le script de migration pour migrer certains de ces changements automatiquement : `npx svelte-migrate@latest svelte-4`.

Si vous êtes l'auteur d'une librairie, considérez bien le choix de ne supporter que Svelte 4 ou, si cela est possible, de continuer à supporter Svelte 3 également. Comme la plupart des changements non réversibles n'affectent que peu de personnes, cela est facilement faisable la plupart du temps. Enfin, n'oubliez pas de mettre à jour la plage de versions des `peerDependencies`.

## Exigences minimales pour Svelte 4

- Mettez à jour vers Node 16 ou plus. Les versions précédentes ne sont plus supportées. ([#8566](https://github.com/sveltejs/svelte/issues/8566))
- Si vous utilisez SvelteKit, mettez à jour sa version à 1.20.4 ou plus ([sveltejs/kit#10172](https://github.com/sveltejs/kit/pull/10172))
- Si vous utilisez Vite sans SvelteKit, mettez à jour la version de `vite-plugin-svelte` à 2.4.1 ou plus ([#8516](https://github.com/sveltejs/svelte/issues/8516))
- Si vous utilisez webpack, mettez à jour sa version à 5 ou plus et `svelte-loader` à 3.1.8 ou plus. Les versions précédentes ne sont plus supportées. ([#8515](https://github.com/sveltejs/svelte/issues/8515), [198dbcf](https://github.com/sveltejs/svelte/commit/198dbcf))
- Si vous utilisez Rollup, mettez à jour la version de `rollup-plugin-svelte` à 7.1.5 ou plus ([198dbcf](https://github.com/sveltejs/svelte/commit/198dbcf))
- Si vous utilisez TypeScript, mettez à jour sa version à 5.0.0 ou plus. Les versions précédentes pourront probablement toujours fonctionner, mais nous ne pouvons pas le garantir. ([#8488](https://github.com/sveltejs/svelte/issues/8488))

## Conditions de navigateurs pour les bundlers

Les <span class="vo">[bundlers](/docs/web#bundler-packager)</span> doivent maintenant spécifier la condition `browser` lorsque vous créez un bundler frontend pour le navigateur. SvelteKit et Vite se chargeront de le préciser pour vous automatiquement. Si vous utilisez un autre bundler, il se peut que les <span class="vo">[callbacks](/docs/development#callback)</span> de cycle de vie comme `onMount` ne s'exécutent pas correctement, et vous devrez mettre à jour la configuration de la résolution de module.

- Pour Rollup, vous pouvez faire cela dans le <span class="vo">[plugin](/docs/development#plugin)</span> `@rollup/plugin-node-resolve` en choisissant `browser: true` dans ses options. Voir la documentation de [`rollup-plugin-svelte`](https://github.com/sveltejs/rollup-plugin-svelte/#usage) pour plus de détail
- Pour Webpack, vous pouvez faire cela en ajoutant `"browser"` au tableau `conditionNames`. Vous pourriez aussi avoir à mettre à jour votre configuration d'`alias`, si vous vous en servez. Voir la documentation de [`svelte-loader`](https://github.com/sveltejs/svelte-loader#usage) pour plus de détail

([#8516](https://github.com/sveltejs/svelte/issues/8516))

## Suppression des sorties de build en CJS

Svelte ne supporte plus le format CommonJS (CJS) comme format de sortie de la compilation. L'<span class="vo">[API](/docs/development#api)</span> `svelte/register` a été retirée ainsi que la version de runtime CJS. Si vous avez besoin de garder le format de sortie CJS, utilisez un <span class="vo">[bundler](/docs/web#bundler-packager)</span> pour convertir la sortie ESM en CJS avec une étape de post-build. ([#8613](https://github.com/sveltejs/svelte/issues/8613))

## Typage plus strict pour les fonctions Svelte

Il y a maintenant des types plus stricts pour `createEventDispatcher`, `Action`, `ActionReturn` et `onMount` :

- `createEventDispatcher` supporte maintenant de pouvoir spécifier que son argument soit optionnel, obligatoire, ou simplement non défini ; les appels seront vérifiés en conséquence ([#7224](https://github.com/sveltejs/svelte/issues/7224)) :

```ts
// @errors: 2554 2345
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher<{
	optional: number | null;
	required: string;
	noArgument: null;
}>();

// Svelte version 3:
dispatch('optional');
dispatch('required'); // Il est possible de ne pas spécifier l'argument de détail
dispatch('noArgument', 'surprise'); // Il est possible de spécifier un argument de détail

// Svelte version 4 en utilisant le TypeScript avec le mode strict:
dispatch('optional');
dispatch('required'); // erreur, argument manquant (error, missing argument)
dispatch('noArgument', 'surprise'); // erreur, il n'est pas possible de passer un argument (error, cannot pass an argument)
```

- `Action` et `ActionReturn` ont maintenant un type d'argument par défaut à `undefined`, ce qui signifie que vous devez typer le <span class="vo">[generic](/docs/javascript#generic)</span> si vous voulez spécifier que cette action reçoit un paramètre. Le script de migration prendra cette règle en compte automatiquement ([#7442](https://github.com/sveltejs/svelte/pull/7442))

```diff
-const action: Action = (node, params) => { .. } // ceci lèvera maintenant une erreur si vous utilisez un paramètre
+const action: Action<HTMLElement, string> = (node, params) => { .. } // params est maintenant de type string
```

- `onMount` affichera maintenant une erreur de typage si vous retournez une fonction asynchrone. En effet, cela est probablement un bug dans votre code pour lequel vous vous attendez à ce que le <span class="vo">[callback](/docs/development#callback)</span> soit appelé à la destruction du composant, ce qui n'est le cas que pour des fonctions synchrones ([#8136](https://github.com/sveltejs/svelte/issues/8136))

```diff
// Exemple pour lequel ce changement révèle un vrai bug
onMount(
- // someCleanup() n'est pas appelé car la fonction passée à onMount est asynchrone
- async () => {
-   const something = await foo();
+ // someCleanup() est appelé car la fonction passée à onMount est synchrone
+ () => {
+  foo().then(something =>  ..
   // ..
   return () => someCleanup();
}
);
```

## Les Custom Elements avec Svelte

La création des <span class="vo">[Custom Elements (ou Web Components)](/docs/web#web-component)</span> avec Svelte a complètement été repensée et significativement améliorée. L'option `tag` a été dépréciée en faveur de la nouvelle option `customElement` :

```diff
-<svelte:options tag="my-component" />
+<svelte:options customElement="my-component" />
```

Ce changement est intervenu pour permettre [une meilleure configuration](custom-elements-api#options-de-composant) pour des cas d'usages avancés. Le code de migration ajustera votre code automatiquement. La temporalité des changements des propriétés a également légèrement changée. ([#8457](https://github.com/sveltejs/svelte/issues/8457))

## SvelteComponentTyped est déprécié

`SvelteComponentTyped` est déprécié, car `SvelteComponent` contient tout le typage nécessaire. Remplacez toutes les instances de `SvelteComponentTyped` par `SvelteComponent`.

```diff
- import { SvelteComponentTyped } from 'svelte';
+ import { SvelteComponent } from 'svelte';

- export class Foo extends SvelteComponentTyped<{ aProp: string }> {}
+ export class Foo extends SvelteComponent<{ aProp: string }> {}
```

Si par le passé vous utilisiez `SvelteComponent` comme type d'instance de composant, vous pourriez maintenant voir une erreur de type obscure, qui est résolue en changeant ` : typeof SvelteComponent` par ` : typeof SvelteComponent<any>`.

```diff
<script>
  import ComponentA from './ComponentA.svelte';
  import ComponentB from './ComponentB.svelte';
  import { SvelteComponent } from 'svelte';

-  let component: typeof SvelteComponent;
+  let component: typeof SvelteComponent<any>;

  function choseRandomly() {
    component = Math.random() > 0.5 ? ComponentA : ComponentB;
  }
</script>

<button on:click={choseRandomly}>aléatoire</button>
<svelte:element this={component} />
```

Le script de migration changera les deux cas automatiquement pour vous. ([#8512](https://github.com/sveltejs/svelte/issues/8512))

## Les transitions sont locales par défaut

Les transitions sont désormais locales par défaut afin d'éviter toute confusion lors de la navigation dans les pages. "Local" signifie qu'une transition ne sera pas jouée si elle se trouve dans un bloc de contrôle imbriqué (`each/if/await/key`) et non dans le bloc parent direct, mais qu'un bloc au-dessus soit créé ou détruit. Dans l'exemple suivant, l'animation d'introduction `slide` ne sera jouée que lorsque `success` passera de `false` à `true`, mais elle ne sera _pas_ jouée lorsque `show` passera de `false` à `true` :

```svelte
{#if show}
	...
	{#if success}
		<p in:slide>Succès</p>
	{/each}
{/if}
```

Pour rendre les transitions globales, ajoutez le modificateur `|global` - elles seront alors jouées lorsque _n'importe quel_ bloc de flux de contrôle ci-dessus est créé ou détruit. Le script de migration le fera automatiquement pour vous. ([#6686](https://github.com/sveltejs/svelte/issues/6686))

## Les binding de slot par défaut

Les liaisons de <span class="vo">[slots](/docs/sveltejs#slot)</span> par défaut ne sont plus exposées aux slots nommés et vice versa :

```svelte
<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:count>
	<p>
		count dans un slot par défaut - est accessible : {count}
	</p>
	<p slot="bar">
		count dans un slot nommé (bar) - n'est pas accessible: {count}
	</p>
</Nested>
```

Cela rend les liaisons de <span class="vo">[slots](/docs/sveltejs#slot)</span> plus cohérentes car le comportement est indéfini lorsque, par exemple, le slot par défaut provient d'une liste et que le slot nommé n'en fait pas partie. ([#6049](https://github.com/sveltejs/svelte/issues/6049))

## Préprocesseurs

L'ordre dans lequel les préprocesseurs sont appliqués a changé. Désormais, les préprocesseurs sont exécutés dans l'ordre et, au sein d'un même groupe, l'ordre est le suivant : balisage, script, style.

```js
// @errors: 2304
import { preprocess } from 'svelte/compiler';

const { code } = await preprocess(
	source,
	[
		{
			markup: () => {
				console.log('markup-1');
			},
			script: () => {
				console.log('script-1');
			},
			style: () => {
				console.log('style-1');
			}
		},
		{
			markup: () => {
				console.log('markup-2');
			},
			script: () => {
				console.log('script-2');
			},
			style: () => {
				console.log('style-2');
			}
		}
	],
	{
		filename: 'App.svelte'
	}
);

// Svelte 3 logs:
// markup-1
// markup-2
// script-1
// script-2
// style-1
// style-2

// Svelte 4 logs:
// markup-1
// script-1
// style-1
// markup-2
// script-2
// style-2
```

Ceci peut vous affecter si vous utilisez par exemple `MDsveX` - pour lequel vous devez vous assurer qu'il vient avant n'importe quel préprocesseur de script ou de style :

```diff
preprocess: [
-	vitePreprocess(),
-	mdsvex(mdsvexConfig)
+	mdsvex(mdsvexConfig),
+	vitePreprocess()
]
```

Chaque préprocesseur doit également avoir un nom. ([#8618](https://github.com/sveltejs/svelte/issues/8618))

## Nouvelle librairie eslint

`eslint-plugin-svelte3` est déprécié. Il est possible qu'il fonctionne encore avec Svelte 4, mais nous ne le garantissons pas. Nous recommandons de passer à notre nouvelle librairie [eslint-plugin-svelte] (https://github.com/sveltejs/eslint-plugin-svelte). Voir [ce ticket Github](https://github.com/sveltejs/kit/issues/10242#issuecomment-1610798405) pour des instructions sur la façon de migrer. Alternativement, vous pouvez créer un nouveau projet en utilisant `npm create svelte@latest`, sélectionner l'option eslint (et éventuellement TypeScript) et ensuite copier les fichiers associés dans votre projet existant.

## Autres changements majeurs

- l'attribut `inert` est maintenant appliqué aux éléments sortants pour les rendre invisibles aux technologies d'assistance et empêcher l'interaction. ([#8628](https://github.com/sveltejs/svelte/pull/8628))
- le <span class="vo">[runtime](/docs/development#runtime)</span> utilise maintenant `classList.toggle(name, boolean)` qui peut ne pas fonctionner dans les très vieux navigateurs. Envisagez d'utiliser un [polyfill](https://github.com/eligrey/classList.js) si vous avez besoin de supporter ces navigateurs. ([#8629](https://github.com/sveltejs/svelte/issues/8629))
- le <span class="vo">[runtime](/docs/development#runtime)</span> utilise maintenant le constructeur `CustomEvent` qui peut ne pas fonctionner dans les très vieux navigateurs. Envisagez d'utiliser un [polyfill] (https://github.com/theftprevention/event-constructor-polyfill/tree/master) si vous avez besoin de supporter ces navigateurs. ([#8775](https://github.com/sveltejs/svelte/pull/8775))
- Les personnes qui implémentent leurs propres <span class="vo">[stores](/docs/sveltejs#store)</span> en utilisant l'interface `StartStopNotifier` (qui est passée à la fonction create de `writable` etc) de `svelte/store` doivent maintenant passer une fonction de mise à jour en plus de la fonction set. Cela n'a aucun effet sur les personnes qui utilisent des stores ou qui créent des stores en utilisant les stores Svelte existants. ([#6750](https://github.com/sveltejs/svelte/issues/6750))
- `derived` lancera maintenant une erreur sur les valeurs <span class="vo">[falsy](/docs/javascript#falsy-truthy-falsy)</span> au lieu des <span class="vo">[stores](/docs/sveltejs#store)</span> qui lui sont passés. ([#7947](https://github.com/sveltejs/svelte/issues/7947))
- les définitions de type pour `svelte/internal` ont été supprimées pour décourager encore plus l'utilisation de ces méthodes internes qui ne sont pas des <span class="vo">[API](/docs/development#api)</span> publiques. La plupart de ces éléments seront probablement modifiés pour Svelte 5.
- La suppression des noeuds du <span class="vo">[DOM](/docs/web#dom)</span> se fait maintenant par lots, ce qui modifie légèrement l'ordre, ce qui peut affecter l'ordre des événements déclenchés si vous utilisez un `MutationObserver` sur ces éléments ([#8763](https://github.com/sveltejs/svelte/pull/8763))
- si vous avez étendu les typages globaux à travers le <span class="vo">[namespace](/docs/development#namespace)</span> `svelte.JSX` auparavant, vous devez les migrer pour utiliser le namespace `svelteHTML`. De même, si vous avez utilisé le namespace `svelte.JSX` pour utiliser des définitions de types, vous devez les migrer pour utiliser les types de `svelte/elements` à la place. Vous pouvez trouver plus d'informations sur ce qu'il faut faire [ici](https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-getting-deprecation-warnings-for-sveltejsx--i-want-to-migrate-to-the-new-typings)
