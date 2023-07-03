---
title: Directives d'éléments
---

En plus des attributs, les éléments peuvent avoir des _directives_, qui contrôlent le comportement des éléments de différentes manières.

## on:_eventname_

```svelte
<!--- copy: false --->
on:eventname={handler}
```
```svelte
<!--- copy: false --->
on:eventname|modifiers={handler}
```

Utilisez la directive `on:` pour écouter des évènements du <span class='vo'>[DOM](/docs/web#dom)</span>.

```svelte
<script>
	let count = 0;

	function handleClick(event) {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	Compte: {count}
</button>
```

Les gestionnaires d'évènement peuvent être déclarés directement sans pénaliser les performances. Comme pour les attributs, les valeurs utilisées pour les directives peuvent être mises entre guillemets afin d'aider la coloration syntaxique.

```svelte
<button on:click="{() => count += 1}">
	Compte: {count}
</button>
```

Ajoutez des *modificateurs* aux évènements <span class='vo'>[DOM](/docs/web#dom)</span> avec le caractère `|`.

```svelte
<form on:submit|preventDefault={handleSubmit}>
	<!-- le comportement par défaut de l'évènement `submit` est ignoré,
		ce qui permet de ne pas recharger la page -->
</form>
```

Les modificateurs suivants sont disponibles:

* `preventDefault` — appelle `event.preventDefault()` avant d'exécuter le gestionnaire d'évènement
* `stopPropagation` — appelle `event.stopPropagation()`, empêchant l'évènement d'atteindre le prochain élément
* `stopImmediatePropagation` - appelle `event.stopImmediatePropagation()`, empêchant d'autres gestionnaires du même évènement d'être exécutés
* `passive` — améliore la performance du défilement pour les évènements `touch`/`wheel` (Svelte l'ajoutera automatiquement lorsque qu'il détecte que ce n'est pas problématique)
* `nonpassive` — déclare explicitement l'évènement avec `passive: false`
* `capture` — déclenche le gestionnaire d'évènement pendant la phase de <span class='vo'>[capture](/docs/javascript#bubble-capture)</span> plutôt que pendant la phase de <span class='vo'>[bubbling](/docs/javascript#bubble-capture)</span>
* `once` — supprime le gestionnaire d'évènement après sa première exécution
* `self` — ne déclenche le gestionnaire d'évènement que si `event.target` est l'élément lui-même
* `trusted` — ne déclenche le gestionnaire d'évènement que si `event.isTrusted` est `true`. C'est-à-dire si l'évènement est déclenché par une action utilisateur.

Vous pouvez chaîner les modificateurs, par ex. `on:click|once|capture={...}`.

Si la directive `on:` est utilisée sans valeur, le composant relaiera l'évènement à son parent, ce qui permettra à ce dernier de l'écouter.

```svelte
<button on:click>
	Le composant lui-même va émettre un évènement clic
</button>
```

Il est possible d'avoir plusieurs gestionnaires pour le même évènement:

```svelte
<script>
	let counter = 0;
	function increment() {
		counter = counter + 1;
	}

	function track(event) {
		trackEvent(event)
	}
</script>

<button on:click={increment} on:click={track}>Cliquez moi !</button>
```

## bind:_property_

```svelte
<!--- copy: false --->
bind:property={variable}
```

En général, la donnée _descend_ du parent vers l'enfant. La directive `bind:` permet à la donnée de remonter de l'enfant vers le parent. Le plus souvent ces liaisons sont spécifiques à des éléments particuliers.

L'exemple le plus simple d'une liaison reflète la valeur d'une propriété, comme `input.value`.

```svelte
<input bind:value={name}>
<textarea bind:value={text}></textarea>

<input type="checkbox" bind:checked={yes}>
```

Si le nom de la variable est le même que le nom de la propriété, vous pouvez simplifier l'écriture.

```svelte
<!-- Ces écritures sont équivalentes -->
<input bind:value={value}>
<input bind:value>
```

Les valeurs numériques sont traitées comme des nombres ; même si `input.value` est une chaîne de caractères pour le <span class='vo'>[DOM](/docs/web#dom)</span>, Svelte traitera cette valeur comme un nombre. Si l'`<input>` est vide ou invalide (dans le cas de `type="number"` par exemple), la valeur sera `undefined`.

```svelte
<input type="number" bind:value={num}>
<input type="range" bind:value={num}>
```

Sur les éléments `<input>` de type `type="file"`, vous pouvez utiliser `bind:files` pour obtenir la [`FileList` des fichiers sélectionnés](https://developer.mozilla.org/fr/docs/Web/API/FileList). Cette liste est en lecture seule.

```svelte
<label for="avatar">Choisissez une image :</label>
<input
	accept="image/png, image/jpeg"
	bind:files
	id="avatar"
	name="avatar"
	type="file"
/>
```

Si vous utilisez des directives `bind:` conjointement à des directives `on:`, l'ordre dans lequel elles sont définies affectera la valeur de la variable liée lorsque la fonction d'écoute sera appelée.

```svelte
<script>
	let value = 'Bonjour tout le monde';
</script>

<input
	on:input={() => console.log('Ancienne valeur:', value)}
	bind:value
	on:input={() => console.log('Nouvelle valeur:', value)}
/>
```

Dans ce cas, nous avons lié la valeur d'un `<input>` de texte qui utilise l'évènement `input`. Des liaisons sur d'autres éléments pourraient utiliser d'autres évènements comme `change`.

### Lier les valeurs de `<select>`

Une liaison sur un `<select>` correspond à la propriété `value` de l'`<option>` sélectionnée, qui peut être n'importe quelle valeur (pas uniquement des chaînes de caractères, comme c'est le cas en général dans le <span class='vo'>[DOM](/docs/web#dom)</span>).

```svelte
<select bind:value={selected}>
	<option value={a}>a</option>
	<option value={b}>b</option>
	<option value={c}>c</option>
</select>
```

Un élément `<select multiple>` se comporte de manière similaire à un groupe de `<checkbox>`. La variable liée est un tableau avec un élément correspondant à la propriété `value` de chaque `<option>` sélectionnée.

```svelte
<select multiple bind:value={fillings}>
	<option value="Riz">Riz</option>
	<option value="Haricots">Haricots</option>
	<option value="Fromage">Fromage</option>
	<option value="Guacamole (supplément)">Guacamole (supplément)</option>
</select>
```

Quand la valeur d'une `<option>` correspond à son contenu texte, l'attribut peut être ignoré.

```svelte
<select multiple bind:value={fillings}>
	<option>Riz</option>
	<option>Haricots</option>
	<option>Formage</option>
	<option>Guacamole (supplément)</option>
</select>
```

Les éléments avec l'attribut `contenteditable` permettent les liaisons suivantes:
- [`innerHTML`](https://developer.mozilla.org/fr/docs/Web/API/Element/innerHTML)
- [`innerText`](https://developer.mozilla.org/fr/docs/Web/API/HTMLElement/innerText)
- [`textContent`](https://developer.mozilla.org/fr/docs/Web/API/Node/textContent)

Il y a de légères différences entre ces différentes liaisons, apprenez-en plus [ici](https://developer.mozilla.org/fr/docs/Web/API/Node/textContent#Differences_from_innerText).

<!-- for some reason puts the comment and html on same line -->
<!-- prettier-ignore -->
```svelte
<div contenteditable="true" bind:innerHTML={html}></div>
```

Les éléments `<details>` permettent les liaisons avec la propriété `open`.

```svelte
<details bind:open={isOpen}>
	<summary>Détails</summary>
	<p>
		Quelque chose suffisamment petit pour passer inaperçu.
	</p>
</details>
```

### Liaisons d'éléments media

Les éléments media (`<audio>` et `<video>`) ont leurs propres liaisons — au nombre de 7 et en _lecture seule_ ...

* `duration` (lecture seule) — durée totale de la vidéo, en secondes
* `buffered` (lecture seule) — tableau d'objets `{start, end}`
* `played` (lecture seule) — idem
* `seekable` (lecture seule) — idem
* `seeking` (lecture seule) — booléen
* `ended` (lecture seule) — booléen
* `readyState` (lecture seule) — nombre entre 0 (inclus) et 4 (inclus)

... et 5 liaisons _lecture-écriture_ :

* `currentTime` — temps actuel de lecture de la vidéo, en secondes
* `playbackRate` — vitesse de lecture de la vidéo, 1 étant 'normal'
* `paused` — a priori vous voyez ce que c'est
* `volume` — une valeur entre 0 et 1
* `muted` — booléen indiquant si le lecteur est en sourdine

Les vidéos ont de plus des liaisons en lecture seule pour les attributs `videoWidth` et `videoHeight`.

```svelte
<video
	src={clip}
	bind:duration
	bind:buffered
	bind:played
	bind:seekable
	bind:seeking
	bind:ended
	bind:readyState
	bind:currentTime
	bind:playbackRate
	bind:paused
	bind:volume
	bind:muted
	bind:videoWidth
	bind:videoHeight
></video>
```

### Liaisons des éléments image

Les éléments d'image (`<img>`) ont deux liaisons en lecture seule :

* `naturalWidth` (lecture seule) — la largeur d'origine de l'image, disponible après le chargement de l'image
* `naturalHeight` (lecture seule) — la hauteur d'origine de l'image, disponible après le chargement de l'image

```svelte
<img
	bind:naturalWidth
	bind:naturalHeight
></img>
```

### Liaisons des éléments de type `block`

Les éléments de type `block` ont 4 liaisons en lecture seule, mesurées en utilisant [une technique similaire à celle-ci](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/) (en anglais):

* `clientWidth`
* `clientHeight`
* `offsetWidth`
* `offsetHeight`

```svelte
<div
	bind:offsetWidth={width}
	bind:offsetHeight={height}
>
	<Chart {width} {height}/>
</div>
```

## bind:group

```svelte
<!--- copy: false --->
bind:group={variable}
```

Les inputs qui fonctionnent ensemble peuvent utiliser `bind:group`.

```svelte
<script>
	let tortilla = 'Simple';
	let fillings = [];
</script>

<!-- les inputs radio groupés sont mutuellement exclusifs -->
<input type="radio" bind:group={tortilla} value="Simple">
<input type="radio" bind:group={tortilla} value="Complète">
<input type="radio" bind:group={tortilla} value="Épinards">

<!-- les inputs checkbox groupés remplissent un tableau -->
<input type="checkbox" bind:group={fillings} value="Riz">
<input type="checkbox" bind:group={fillings} value="Haricots">
<input type="checkbox" bind:group={fillings} value="Fromage">
<input type="checkbox" bind:group={fillings} value="Guacamole (supplément)">
```

> `bind:group` ne fonctionne que si les `<input>` sont dans le même composant Svelte.

## bind:this

```svelte
<!--- copy: false --->
bind:this={dom_node}
```

Utiliser `bind:this` vous permet d'obtenir une référence à un noeud <span class='vo'>[DOM](/docs/web#dom)</span>.

```svelte
<script>
	import { onMount } from 'svelte';

	let canvasElement;

	onMount(() => {
		const ctx = canvasElement.getContext('2d');
		drawStuff(ctx);
	});
</script>

<canvas bind:this={canvasElement}></canvas>
```

## class:_name_

```svelte
<!--- copy: false --->
class:name={value}
```
```svelte
<!--- copy: false --->
class:name
```

Une directive `class:` permet de facilement ajouter ou enlever une classe à un élément.

```svelte
<!-- Ces syntaxes sont équivalentes -->
<div class="{active ? 'active' : ''}">...</div>
<div class:active={active}>...</div>

<!-- Syntaxe raccourcie, quand le nom de la variable correspond au nom de la classe -->
<div class:active>...</div>

<!-- Plusieurs directives `class:` peuvent être utilisées -->
<div class:active class:inactive={!active} class:isAdmin>...</div>
```

## style:_property_

```svelte
style:property={value}
```
```svelte
style:property="value"
```
```svelte
style:property
```

La directive `style:` fournit un raccourci pour modifier directement le style d'un élément.

```svelte
<!-- Ces syntaxes sont équivalentes -->
<div style:color="red">...</div>
<div style="color: red;">...</div>

<!-- Vous pouvez utiliser des variables -->
<div style:color={myColor}>...</div>

<!-- Syntaxe raccourcie, quand le nom de la variable correspond au nom de la propriété -->
<div style:color>...</div>

<!-- Plusieurs directives `style:` peuvent être utilisées -->
<div style:color style:width="12rem" style:background-color={darkMode ? "black" : "white"}>...</div>

<!-- Vous pouvez définir des styles comme importants -->
<div style:color|important="red">...</div>
```

Quand des directives `style:` sont combinées avec des attributs `style`, les directives sont prioritaires.

```svelte
<div style="color: blue;" style:color="red">Ceci sera rouge</div>
```

## use:_action_

```svelte
<!--- copy: false --->
use:action
```
```svelte
<!--- copy: false --->
use:action={parameters}
```

```ts
/// copy: false
// @noErrors
action = (node: HTMLElement, parameters: any) => {
	update?: (parameters: any) => void,
	destroy?: () => void
}
```

Les actions sont des fonctions exécutées lorsqu'un élément est créé. Elles peuvent renvoyer un objet avec une méthode `destroy` qui sera appelée lors de la destruction de l'élément.

```svelte
<script>
	function foo(node) {
		// le noeud a été ajouté au DOM

		return {
			destroy() {
				// le noeud a été supprimé du DOM
			}
		};
	}
</script>

<div use:foo></div>
```

Une action peut avoir un argument. Si la valeur renvoyée possède une méthode `update`, celle-ci sera exécutée à chaque fois que cet argument changera, juste après que Svelte a appliqué les modifications au <span class="vo">[markup](/docs/web#markup)</span>.

> Ne vous inquiétez pas du fait que l'on redéclare la fonction `foo` pour chaque instance — Svelte garde en mémoire toute fonction qui ne dépend pas d'un état local en dehors de la définition du composant.


```svelte
<script>
	export let bar;

	function foo(node, bar) {
		// le noeud a été ajouté au DOM

		return {
			update(bar) {
				// la valeur de `bar` a changé
			},

			destroy() {
				// le noeud a été supprimé du DOM
			}
		};
	}
</script>

<div use:foo={bar}></div>
```

Plus d'infos dans la page [`svelte/action`](/docs/svelte-action).

## transition:_fn_

```svelte
<!--- copy: false --->
transition:fn
```

```svelte
<!--- copy: false --->
transition:fn={params}
```

```svelte
<!--- copy: false --->
transition:fn|global
```

```svelte
<!--- copy: false --->
transition:fn|global={params}
```

```svelte
<!--- copy: false --->
transition:fn|local
```

```svelte
<!--- copy: false --->
transition:fn|local={params}
```

```js
/// copy: false
// @noErrors
transition = (node: HTMLElement, params: any, options: { direction: 'in' | 'out' | 'both' }) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

Une transition est déclenchée lorsqu'un élément entre ou sort du <span class='vo'>[DOM](/docs/web#dom)</span> après un changement d'état.

Quand un bloc transitionne vers sa sortie, tous les éléments au sein du bloc, y compris ceux n'ayant pas de transition propre, sont laissés dans le DOM tant que toutes les transitions du bloc se soient terminées.

La directive `transition:` établit une transition _bidirectionnelle_, ce qui implique qu'elle peut être inversée sans heurts en cours de transition.

```svelte
{#if visible}
	<div transition:fade>
		s'estompe en entrant et en sortant
	</div>
{/if}
```

Les transitions sont locales par défaut (dans Svelte 3, elles étaient globales par défaut). Les transitions locales sont jouées uniquement lorsque le bloc auquel elles appartiennent est créé ou détruit, _pas_ lorsqu'un bloc parent est créé ou détruit.

```svelte
{#if x}
	{#if y}
		<!-- Svelte 3: <p transition:fade|local> -->
		<p transition:fade>entre et sort en s'estompant seulement quand y change</p>

		<!-- Svelte 3: <p transition:fade> -->
		<p transition:fade|global>entre et sort en s'estompant quand x ou y change</p>
	{/if}
{/if}
```

> Par défaut, les transitions d'entrée (`in`) ne sont pas jouées au premier rendu. Vous pouvez modifier ce comportement en appliquant `intro: true` lorsque vous [instanciez manuellement un composant](/docs/client-side-component-api).

## Paramètres de transition

À l'instar des actions, les transitions peuvent avoir des paramètres.

(La syntaxe `{{accolades}}` n'est pas spéciale ; il s'agit simplement d'un objet dans une balise d'expression.)

```svelte
{#if visible}
	<div transition:fade="{{ duration: 2000 }}">
		s'estompe en entrant et en sortant sur une durée de 2 secondes
	</div>
{/if}
```

## Transitions personnalisées

Les transitions peuvent être définies par des fonctions personnalisées. Si l'objet retourné possède une fonction `css`, Svelte créera une animation CSS qui sera jouée sur l'élément.

L'argument `t` passé à `css` est une valeur entre `0` et `1` après que la fonction `easing` a été appliquée. Les transitions _entrantes_ sont jouées de `0` à `1`, les transitions _sortantes_ sont jouées de `1` à `0` — en d'autres termes, `1` est l'état normal de l'élément, comme si aucune transition ne lui était appliquée. L'argument `u` est égal à `1 - t`.

La fonction est régulièrement appelée _avant_ que la transition ne commence, avec différentes valeurs pour `t` et `u`.

```svelte
<script>
	import { elasticOut } from 'svelte/easing';

	/** @type {boolean} */
	export let visible;

	/**
	 * @param {HTMLElement} node
	 * @param {{ delay?: number, duration?: number, easing?: (t: number) => number }} params
	 */
	function whoosh(node, params) {
		const existingTransform = getComputedStyle(node).transform.replace('none', '');

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `transform: ${existingTransform} scale(${t})`
		};
	}
</script>

{#if visible}
	<div in:whoosh>entre en faisant woosh</div>
{/if}
```

Une fonction de transition personnalisée peut aussi renvoyer une fonction `tick`, qui est appelée _pendant_ la transition avec les mêmes arguments `t` et `u`.

> Il est recommandé d'utiliser `css` plutôt que `tick`, si possible — les animations CSS sont exécutées sur un <span class='vo'>[thread](/docs/development#thread)</span> différent de celui de JS, évitant ainsi de ralentir les machines les moins puissantes.

```svelte
<!--- file: App.svelte --->
<script>
	export let visible = false;

	/**
	 * @param {HTMLElement} node
	 * @param {{ speed?: number }} params
	 */
	function typewriter(node, { speed = 1 }) {
		const valid = (
			node.childNodes.length === 1 &&
			node.childNodes[0].nodeType === Node.TEXT_NODE
		);

		if (!valid) {
			throw new Error(`Cette transition ne fonctionne que sur les éléments avec un seul noeud texte comme enfant`);
		}

		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: t => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

{#if visible}
	<p in:typewriter="{{ speed: 1 }}">
		Portez ce vieux whisky au juge blond qui fume
	</p>
{/if}
```

Si une transition retourne une fonction au lieu d'un objet transition, la fonction sera appelée lors de la prochaine micro-tâche. Cela permet à plusieurs transitions de se coordonner, rendant les effets de [fondu croisé](PUBLIC_LEARN_SITE_URL/tutorial/deferred-transitions) possibles.

Les fonctions de transition peuvent aussi avoir un troisième argument, `options`, qui contient des informations sur la transition.

Les valeurs possibles dans l'objet `options` sont:

* `direction` - `in`, `out`, or `both`, selon le type de transition

## Évènements de transition

Un élément ayant des transitions génére les évènements suivants en plus des évènements <span class='vo'>[DOM](/docs/web#dom)</span> standards:

* `introstart`
* `introend`
* `outrostart`
* `outroend`

```svelte
{#if visible}
	<p
		transition:fly="{{ y: 200, duration: 2000 }}"
		on:introstart="{() => status = "début de l'entrée"}"
		on:outrostart="{() => status = "début de la sortie"}"
		on:introend="{() => status = "fin de l'entrée"}"
		on:outroend="{() => status = "fin de la sortie"}"
	>
		Entre et sort en volant
	</p>
{/if}
```

## in:_fn_/out:_fn_

```svelte
<!--- copy: false --->
in:fn
```

```svelte
<!--- copy: false --->
in:fn={params}
```

```svelte
<!--- copy: false --->
in:fn|global
```

```svelte
<!--- copy: false --->
in:fn|global={params}
```

```svelte
<!--- copy: false --->
in:fn|local
```

```svelte
<!--- copy: false --->
in:fn|local={params}
```

```svelte
<!--- copy: false --->
out:fn
```

```svelte
<!--- copy: false --->
out:fn={params}
```

```svelte
<!--- copy: false --->
out:fn|global
```

```svelte
<!--- copy: false --->
out:fn|global={params}
```

```svelte
<!--- copy: false --->
out:fn|local
```

```svelte
<!--- copy: false --->
out:fn|local={params}
```

Similaire à `transition:`, mais s'applique uniquement aux éléments entrant (`in:`) ou sortant (`out:`) du <span class='vo'>[DOM](/docs/web#dom)</span>.

Contrairement à `transition:`, les transitions appliquées avec `in:` et `out:` ne sont pas bi-directionnelles — une transition entrante continuera sa course en parallèle de la transition sortante, plutôt que d'être inversée, si le bloc est supprimé pendant la transition en cours. Si une transition sortante est annulée, les transitions seront rejouées du début.

```svelte
{#if visible}
	<div in:fly out:fade>
		entre en volant, sort en fondu
	</div>
{/if}
```

## animate:_fn_

```svelte
<!--- copy: false --->
animate:name
```

```svelte
<!--- copy: false --->
animate:name={params}
```

```js
/// copy: false
// @noErrors
animation = (node: HTMLElement, { from: DOMRect, to: DOMRect } , params: any) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

```ts
/// copy: false
// @noErrors
DOMRect {
	bottom: number,
	height: number,
	​​left: number,
	right: number,
	​top: number,
	width: number,
	x: number,
	y: number
}
```

Une animation est déclenchée quand le contenu d'un [bloc `each` à clé](/docs/logic-blocks#each) est réordonné. Les animations ne sont pas jouées lorsqu'un élément est ajouté ou supprimé, seulement lorsque l'indice d'un élément de liste change au sein d'un bloc `each`. Les directives `animate:` doivent appartenir à un élément enfant _direct_ d'un bloc `each` à clé.

Les animations peuvent être utilisées avec les [fonctions d'animation natives](/docs/svelte-animate) de Svelte ou avec des [fonctions d'animation personnalisées](/docs/element-directives#fonctions-d-animation-personnalis-es).

```svelte
<!-- Quand `list` est réordonnée, l'animation sera jouée -->
{#each list as item, index (item)}
	<li animate:flip>{item}</li>
{/each}
```

## Paramètres d'animation

À l'instar des actions et des transitions, les animations peuvent avoir des paramètres.

(La syntaxe `{{accolades}}` n'est pas spéciale; il s'agit simplement d'un objet dans une balise d'expression.)

```svelte
{#each list as item, index (item)}
	<li animate:flip="{{ delay: 500 }}">{item}</li>
{/each}
```

## Fonctions d'animation personnalisées

Les animations peuvent être définies par des fonctions fournissant un `node`, un objet `animation`, et n'importe quels `parameters` en arguments. L'argument `animation` est un objet ayant les propriétés `from` et `to`, chacune contenant un [DOMRect](https://developer.mozilla.org/fr/docs/Web/API/DOMRect#Properties) décrivant la géométrie de l'élément dans ses positions de départ (`start`) et arrivée (`end`). La propriété `from` est le DOMRect de l'élément dans sa position de départ, la propriété `to` est le DOMRect de l'élément dans sa position d'arrivée après que la liste a été réordonnée et le <span class='vo'>[DOM](/docs/web#dom)</span> mis à jour.

Si l'objet renvoyé a une méthode `css`, Svelte va créer une animation CSS qui sera jouée sur l'élément.

L'argument `t` passé à `css` est une valeur qui va de `0` à `1` avec que la fonction `easing` a été appliquée. L'argument `u` est égal à `1 - t`.

La fonction est régulièrement appelée _avant_ que la transition ne commence, avec différentes valeurs pour `t` et `u`.

<!-- TODO: Types -->

```svelte
<script>
	import { cubicOut } from 'svelte/easing';

	/**
	 * @param {HTMLElement} node
	 * @param {{ from: DOMRect; to: DOMRect }} states
	 * @param {any} params
	 */
	function whizz(node, { from, to }, params) {

		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			css: (t, u) => `transform: translate(${u * dx}px, ${u * dy}px) rotate(${t*360}deg);`
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

Une fonction d'animation personnalisée peut aussi renvoyer une fonction `tick`, qui est appelée _pendant_ la transition avec les mêmes arguments `t` et `u`.

> Il est recommandé d'utiliser `css` plutôt que `tick`, si possible — les animations CSS sont exécutées sur un <span class='vo'>[thread](/docs/development#thread)</span> différent de celui de JS, évitant ainsi de ralentir les machines les moins puissantes.

```svelte
<script>
	import { cubicOut } from 'svelte/easing';

	/**
	 * @param {HTMLElement} node
	 * @param {{ from: DOMRect; to: DOMRect }} states
	 * @param {any} params
	 */
	function whizz(node, { from, to }, params) {

		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			tick: (t, u) =>
				Object.assign(node.style, { color: t > 0.5 ? 'Pink' : 'Blue' })
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```
