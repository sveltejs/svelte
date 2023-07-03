---
title: 'svelte/compiler'
---

En général, vous n'interagirez pas directement avec le compilateur Svelte, mais vous l'intègrerez plutôt dans un processus de <span class="vo">[build](/docs/development#build)</span> à travers un <span class="vo">[plugin](/docs/development#plugin)</span> de <span class="vo">[bundler](/docs/web#bundler-packager)</span>. Le plugin que l'équipe Svelte recommande et avec lequel elle travaille est [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte). Le <span class="vo">[framework](/docs/web#framework)</span> [SvelteKit](PUBLIC_KIT_SITE_URL/) fournit une configuration de `vite-plugin-svelte` qui permet de compiler des applications et de <span class="vo">[packager](/docs/web#bundler-packager)</span> des [librairies de composants Svelte](PUBLIC_KIT_SITE_URL/docs/packaging). Svelte Society maintient des [plugins](https://sveltesociety.dev/tools/#bundling) pour d'autres bundlers (notamment Rollup et Webpack).

Néanmoins, il est utile de comprendre comment utiliser le compilateur, puisque les plugins exposent généralement des options.

## compile

> EXPORT_SNIPPET: svelte/compiler#compile

C'est ici que la magie opère. `svelte.compile` convertit le code source des composants en module JavaScript qui exporte des classes.

```js
// @filename: ambient.d.ts
declare global {
	var source: string
}

export {}

// @filename: index.ts
// ---cut---
import { compile } from 'svelte/compiler';

const result = compile(source, {
	// options
});
```

Référez-vous à la section [CompilerOptions](#types-compileoptions) pour voir les options disponibles.

L'objet retourné `result` contient le code du composant, ainsi que des métadonnées utiles.

```ts
// @filename: ambient.d.ts
declare global {
	const source: string;
}

export {};

// @filename: main.ts
import { compile } from 'svelte/compiler';
// ---cut---
const { js, css, ast, warnings, vars, stats } = compile(source);
```

Référez-vous à la section [CompilerResult](#types-compileresult) pour une description du résultat compilé.

## parse

> EXPORT_SNIPPET: svelte/compiler#parse

La méthode `parse` convertit un composant pour retourner son arbre de la syntaxe abstraite (<span class="vo">[AST](/docs/development#ast)</span>). Contrairement à la compilation avec l'option `generate: false`, aucune validation ni analyse n'est effectuée. Notez que l'AST n'est pas considéré comme une <span class="vo">[API](/docs/development#api)</span> publique ; des changements critiques pourraient survenir à n'importe quel moment.

```js
// @filename: ambient.d.ts
declare global {
	var source: string;
}

export {};

// @filename: main.ts
// ---cut---
import { parse } from 'svelte/compiler';

const ast = parse(source, { filename: 'App.svelte' });
```

## preprocess

> EXPORT_SNIPPET: svelte/compiler#preprocess

Un certain nombre de [plugins de pré-processeur maintenus par la communauté](https://sveltesociety.dev/tools#preprocessors) est disponible pour vous permettre d'utiliser Svelte avec des outils comme TypeScript, PostCSS, SCSS, et Less.

Vous pouvez écrire votre propre pré-processeur en utilisant l'<span class="vo">[API](/docs/development#api)</span> `svelte.

La fonction `preprocess` fournit des <span class="vo">[framework](/docs/web#framework)</span> pour transformer le code source d'un composant selon vos besoins. Par exemple, elle peut convertir un bloc `<style lang="sass">` en css natif.

Le premier argument est le code source du composant lui-même. Le second argument est un tableau de _pré-processeurs_ (ou éventuellement un seul pré-processeur si vous n'en avez qu'un). Un pré-processeur est un objet contenant trois fonctions : `markup`, `script` et `style`, toutes optionnelles.

La fonction `markup` reçoit en argument le <span class="vo">[markup](/docs/web#markup)</span> du composant, et le nom du composant `filename` s'il était spécifié comme troisième argument.

Les fonctions `script` et `style` reçoivent le contenu des blocs `<script>` et `<style>` respectivement (`content`) ainsi que toute la source textuelle (`markup`) du composant. En plus du nom du fichier `filename`, elles reçoivent un objet contenant les attributs de l'élément.

Chaque fonction `markup`, `script` et `style` doit retourner un objet (ou une Promesse qui résout un objet) contenant un attribut `code`, représentant le code source transformé. Ces fonctions peuvent aussi renvoyer un tableau facultatif de dépendances `dependencies` qui représente les fichiers dont les changements sont à surveiller, ainsi qu'un objet `map` qui est une <span class="vo">[sourcemap](/docs/web#sourcemap)</span> renvoyant la transformation vers le code d'origine.
Les pré-processeurs `script` et `style` peuvent de manière optionnelle renvoyer un ensemble d'attributs qui représentent les attributs mis à jour sur les balises `<script>`/`<style>`.

> Les fonctions de <span class="vo">[preprocessing](/docs/web#preprocessing)</span> doivent également retourner un objet `map` en plus de `code` et `dependencies`, où `map` correspond à la <span class="vo">[sourcemap](/docs/web#sourcemap)</span> de la transformation.

```ts
// @filename: ambient.d.ts
declare global {
	var source: string;
}

export {};

// @filename: main.ts
// ---cut---
import { preprocess } from 'svelte/compiler';
import MagicString from 'magic-string';

const { code } = await preprocess(
	source,
	{
		markup: ({ content, filename }) => {
			const pos = content.indexOf('foo');
			if (pos < 0) {
				return { code: content };
			}
			const s = new MagicString(content, { filename });
			s.overwrite(pos, pos + 3, 'bar', { storeName: true });
			return {
				code: s.toString(),
				map: s.generateMap()
			};
		}
	},
	{
		filename: 'App.svelte'
	}
);
```

Si un tableau de dépendances `dependencies` est retourné, il sera inclus dans l'objet retourné. Ce tableau est utilisé par des librairies comme [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte) pour surveiller les changements dans les fichiers, par exemple si un bloc `<style>` contient un import de type `@import`.

```ts
/// file: preprocess-sass.js
// @filename: ambient.d.ts
declare global {
	var source: string;
}

export {};

// @filename: main.ts
// @errors: 2322 2345 2339
/// <reference types="@types/node" />
// ---cut---
import { preprocess } from 'svelte/compiler';
import MagicString from 'magic-string';
import sass from 'sass';
import { dirname } from 'path';

const { code } = await preprocess(
	source,
	{
		name: 'my-fancy-preprocessor',
		markup: ({ content, filename }) => {
			// renvoie le code tel quel quand aucune string foo n'est présente
			const pos = content.indexOf('foo');
			if (pos < 0) {
				return;
			}

			// Remplace foo par bar en utilisant MagicString qui fournit
			// une sourcemap en plus du code modifié
			const s = new MagicString(content, { filename });
			s.overwrite(pos, pos + 3, 'bar', { storeName: true });

			return {
				code: s.toString(),
				map: s.generateMap({ hires: true, file: filename })
			};
		},
		style: async ({ content, attributes, filename }) => {
			// traite uniquement <style lang="sass">
			if (attributes.lang !== 'sass') return;

			const { css, stats } = await new Promise((resolve, reject) =>
				sass.render(
					{
						file: filename,
						data: content,
						includePaths: [dirname(filename)]
					},
					(err, result) => {
						if (err) reject(err);
						else resolve(result);
					}
				)
			);

			// supprime l'attribut lang de la balise <style>
			delete attributes.lang;

			return {
				code: css.toString(),
				dependencies: stats.includedFiles,
				attributes
			};
		}
	},
	{
		filename: 'App.svelte'
	}
);
```

Plusieurs pré-processeurs peuvent être utilisés ensemble. La sortie du premier devient l'argument du second. Les fonctions sont exécutées dans l'ordre suivant : `markup`, `script` puis `style`.

> En Svelte 3, toutes les fonctions `markup` étaient exécutées en premier, puis toutes les fonctions `script` et enfin toutes les fonctions `style`. Cet ordre a été changé dans Svelte 4.

```js
/// file: multiple-preprocessor.js
// @errors: 2322
// @filename: ambient.d.ts
declare global {
	var source: string;
}

export {};

// @filename: main.ts
// ---cut---
import { preprocess } from 'svelte/compiler';

const { code } = await preprocess(source, [
	{
		name: 'premier pré-processeur',
		markup: () => {
			console.log('ceci est éxécuté en premier');
		},
		script: () => {
			console.log('ça en second');
		},
		style: () => {
			console.log('ça en troisième');
		}
	},
	{
		name: 'second pré-processeur',
		markup: () => {
			console.log('ça en quatrième');
		},
		script: () => {
			console.log('ça en cinquième');
		},
		style: () => {
			console.log('ça en sixième');
		}
	}
], {
	filename: 'App.svelte'
});
```

## walk

> EXPORT_SNIPPET: svelte/compiler#walk

La fonction `walk` fournit un un moyen de parcourir les arbres <span class="vo">[AST](/docs/development#ast)</span> générés par le <span class="vo">[parser](/docs/development#parser)</span>, en utilisant l'utilitaire [estree-walker](https://github.com/Rich-Harris/estree-walker) du compilateur.

La fonction prend comme argument l'arbre <span class="vo">[AST](/docs/development#ast)</span> à traiter et un objet contenant 2 méthodes facultatives : `enter` et `leave`. `enter` est appelée pour chaque noeud (si la méthode est définie). Puis, à moins que `this.skip()` n'ait été appelée lors de l'exécution de `enter`, chaque enfant est également traversé. Enfin, la méthode `leave` est appelée pour le noeud actuel.

```js
/// file: compiler-walk.js
// @filename: ambient.d.ts
declare global {
	var ast: import('estree').Node;
	function faire_quelque_chose(node: import('estree').Node): void;
	function faire_autre_chose(node: import('estree').Node): void;
	function doit_ignorer_les_enfants(node: import('estree').Node): boolean;
}

export {};

// @filename: main.ts
// @errors: 7006
// ---cut---
import { walk } from 'svelte/compiler';

walk(ast, {
	enter(node, parent, prop, index) {
		faire_quelque_chose(node);
		if (doit_ignorer_les_enfants(node)) {
			this.skip();
		}
	},
	leave(node, parent, prop, index) {
		faire_autre_chose(node);
	}
});
```

## VERSION

> EXPORT_SNIPPET: svelte/compiler#VERSION

La version actuelle, définie dans le fichier `package.json`.

```js
import { VERSION } from 'svelte/compiler';
console.log(`la version ${VERSION} de Svelte est en cours d'exécution`);
```

## Types

> TYPES: svelte/compiler
