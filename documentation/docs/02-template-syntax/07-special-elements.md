---
title: Éléments spéciaux
---

## `<slot>`

```svelte
<slot><!-- contenu par défaut optionnel --></slot>
```
```svelte
<slot name="x"><!-- contenu par défaut optionnel --></slot>
```
```svelte
<slot prop={value}></slot>
```

Les composants peuvent avoir du contenu enfant, de la même façon que les éléments.

Le contenu est exposé dans le composant enfant avec l'élément `<slot>`, qui peut avoir un contenu par défaut qui sera utilisé si aucun enfant n'est fourni.

```svelte
<!-- Widget.svelte -->
<div>
	<slot>
    ce contenu slot par défaut sera rendu si aucun contenu n'est fourni, comme dans le premier exemple
	</slot>
</div>

<!-- App.svelte -->
<Widget />
<!-- ce composant va rendre le contenu par défaut -->

<Widget>
	<p>ceci est du contenu qui remplacera le contenu slot par défaut</p>
</Widget>
```

Note: Si vous souhaitez afficher [un élément HTML de type `<slot>`](https://developer.mozilla.org/fr/docs/Web/HTML/Element/slot), vous pouvez utiliser `<svelte:element this="slot" />`.

### `<slot name="`*name*`">`

Les <span class="vo">[slots](/docs/sveltejs#slot)</span> nommés permettent aux parents de cibler des zones spécifiques. Ils peuvent aussi avoir du contenu par défaut.

```svelte
<!-- Widget.svelte -->
<div>
	<slot name="header">Aucun en-tête fourni</slot>
	<p>Du contenu entre l'en-tête et le bas de page</p>
	<slot name="footer"></slot>
</div>

<!-- App.svelte -->
<Widget>
	<h1 slot="header">Bonjour</h1>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</Widget>
```

Les composants peuvent être placés dans un <span class="vo">[slot](/docs/sveltejs#slot)</span> nommé en utilisant le syntaxe `<Component slot="name />`.
Pour positionner du contenu dans un <span class="vo">[slot](/docs/sveltejs#slot)</span> sans l'entourer d'un élément, vous pouvez utiliser l'élément spécial `<svelte:fragment>`.

```svelte
<!-- Widget.svelte -->
<div>
	<slot name="header">Aucun en-tête fourni</slot>
	<p>Du contenu entre l'en-tête et le bas de page</p>
	<slot name="footer"></slot>
</div>

<!-- App.svelte -->
<Widget>
	<HeaderComponent slot="header" />
	<svelte:fragment slot="footer">
		<p>Tous droits réservés.</p>
		<p>Copyright (c) 2019 Svelte Industries</p>
	</svelte:fragment>
</Widget>
```

### `$$slots`

L'objet `$$slots` a comme clés les noms des <span class="vo">[slots](/docs/sveltejs#slot)</span> passés au composant par le parent. Si le parent ne fournit pas un <span class="vo">[slot](/docs/sveltejs#slot)</span> avec un nom particulier, ce nom ne sera pas présent dans `$$slots`. Cela permet aux composants d'afficher un <span class="vo">[slot](/docs/sveltejs#slot)</span> (et d'autres éléments, comment des *wrappers* de style) uniquement si le parent le fournit.

Notez que passer explicitement un <span class="vo">[slot](/docs/sveltejs#slot)</span> nommé vide ajoutera le nom de ce slot à `$$slots`. Par exemple, si un parent fournit `<div slot="title" />` à un composant enfant, `$$slots.title` sera *truthy* dans l'enfant.

```svelte
<!-- Card.svelte -->
<div>
	<slot name="title"></slot>
	{#if $$slots.description}
		<!-- Ce <hr> et ce <slot> seront rendus uniquement si un slot nommé "description" est fourni -->
		<hr>
		<slot name="description"></slot>
	{/if}
</div>

<!-- App.svelte -->
<Card>
	<h1 slot="title">Titre d'article de blog</h1>
	<!-- Aucun slot "description" n'est fourni, donc aucun des éléments dépendants de $$slots.description ne sera rendu -->
</Card>
```

### `<slot key={`*value*`}>`

Les <span class="vo">[slots](/docs/sveltejs#slot)</span> peuvent être rendus zéro ou plusieurs fois, et peuvent passer des valeurs *en retour* au parent en utilisant des <span class="vo">[props](/docs/sveltejs#props)</span>. Le parent expose ces valeurs au <span class="vo">[template](/docs/development#template)</span> de <span class="vo">[slot](/docs/sveltejs#slot)</span> avec la directive `let:`.

Il est possible d'utiliser la syntaxe raccourcie usuelle — `let:item` est équivalent à `let:item={item}`, et `<slot {item}>` est équivalent à `<slot item={item}>`.

```svelte
<!-- FancyList.svelte -->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot prop={item}></slot>
		</li>
	{/each}
</ul>

<!-- App.svelte -->
<FancyList {items} let:prop={thing}>
	<div>{thing.text}</div>
</FancyList>
```

Les <span class="vo">[slots](/docs/sveltejs#slot)</span> nommés peuvent aussi exposer des valeurs. La directive `let:` ira sur l'élément avec l'attribut `slot` correspondant.

```svelte
<!-- FancyList.svelte -->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot name="item" {item}></slot>
		</li>
	{/each}
</ul>

<slot name="footer"></slot>

<!-- App.svelte -->
<FancyList {items}>
	<div slot="item" let:item>{item.text}</div>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</FancyList>
```

## `<svelte:self>`

L'élément `<svelte:self>` permet à un composant de s'inclure lui-même, récursivement.

Cet élément ne peut pas être utilisé à la racine du <span class="vo">[markup](/docs/web#markup)</span> ; il doit être placé à l'intérieur d'un bloc `{#if}` ou `{#each}` ou passé à un `<slot>` pour éviter une boucle infinie.

```svelte
<script>
	export let count;
</script>

{#if count > 0}
	<p>compte à rebours ... {count}</p>
	<svelte:self count="{count - 1}"/>
{:else}
	<p>décollage !</p>
{/if}
```

## `<svelte:component>`

```svelte
<svelte:component this={expression}/>
```

L'élément `<svelte:component>` rend un composant dynamiquement, en utilisant le constructeur du composant spécifié avec la propriété `this`. Quand cette propriété change, l'instance du composant est détruite et recréée.

Si la valeur de `this` est <span class="vo">[falsy](/docs/javascript#falsy-truthy-falsy)</span>, aucun composant n'est rendu.

```svelte
<svelte:component this={currentSelection.component} foo={bar}/>
```


## `<svelte:element>`

```svelte
<svelte:element this={expression}/>
```

L'élément `<svelte:element>` permet de rendre un élément d'un type spécifié dynamiquement. Cela peut servir par exemple pour afficher du contenu texte enrichi provenant d'un CMS. Toutes les propriétés et fonctions d'écoute d'évènements seront appliquées à l'élément.

Le seul type de liaison (<span class="vo">[binding](/docs/sveltejs#binding)</span>) possible dans ce cas est `bind:this`, puisque les liaisons spécifiques créées par Svelte au moment de la compilation pour le type de l'élément (par ex. `bind:value` pour les éléments `<input>`) ne sont pas compatibles avec un type de balise dynamique.

Si `this` a une valeur <span class="vo">[nullish](/docs/javascript#nullish)</span>, l'élément et ses enfants ne seront pas rendus.

Si `this` a pour valeur le nom d'une [balise vide](https://developer.mozilla.org/fr/docs/Glossary/Void_element) (comme `br`), et des enfants ont été fournis à `<svelte:element>`, une erreur d'exécution sera levée en mode développement.

```svelte
<script>
	let tag = 'div';
	export let handler;
</script>

<svelte:element this={tag} on:click={handler}>Foo</svelte:element>
```

## `<svelte:window>`

```svelte
<svelte:window on:event={handler}/>
```
```svelte
<svelte:window bind:prop={value}/>
```

L'élément `<svelte:window>` permet d'ajouter des fonctions d'écoute d'évènements à l'objet `window` sans avoir à penser à les supprimer quand le composant est détruit, ou sans avoir à vérifier l'existence de `window` lorsque l'on fait des rendus côté serveur.

À l'inverse de `<svelte:self>`, cet élément peut uniquement être placé à la racine du <span class="vo">[markup](/docs/web#markup)</span> d'un composant, et ne doit jamais être à l'intérieur d'un bloc de compilation ou d'un élément.

```svelte
<script>
	function handleKeydown(event) {
		alert(`la touche ${event.key} a été enfoncée`);
	}
</script>

<svelte:window on:keydown={handleKeydown}/>
```

Vous pouvez aussi lier (avec `bind:`) les propriétés suivantes :

* `innerWidth`
* `innerHeight`
* `outerWidth`
* `outerHeight`
* `scrollX`
* `scrollY`
* `online` — alias de `window.navigator.onLine`
* `devicePixelRatio`

Toutes ces propriétés sont en lecture seule, à l'exception de `scrollX` and `scrollY`.

```svelte
<svelte:window bind:scrollY={y}/>
```

> Notez que la page ne défilera pas à la valeur fournie initialement pour des raisons d'accessibilité. Seuls les changements ultérieurs liés aux variables `scrollX` et `scrollY` déclencheront le défilement. Cependant, si un défilement initial est tout de même nécessaire, vous pouvez utiliser `scrollTo()` dans `onMount()`.

## `<svelte:document>`

```svelte
<svelte:document on:event={handler}/>
```

```svelte
<svelte:document bind:prop={value}/>
```

À l'instar de `<svelte:window>`, cet élément vous permet d'ajouter des gestionnaires d'évènement sur `document`, comme `visibilitychange`, qui n'est pas déclenché sur `window`. Cet élément vous permet aussi d'utiliser des [actions](/docs/element-directives#use-action) sur `document`.

Comme pour `<svelte:window>`, cet élément peut uniquement être utilisé à la racine du <span class="vo">[markup](/docs/web#markup)</span> de votre composant, et ne doit jamais être à l'intérieur d'un bloc de compilation ou d'un élément.

```svelte
<svelte:document
	on:visibilitychange={handleVisibilityChange}
	use:someAction
/>
```

Vous pouvez aussi lier (avec `:bind`) les propriétés suivantes:

* `fullscreenElement`
* `visibilityState`

Elles sont toutes en lecture seule.

## `<svelte:body>`

```svelte
<svelte:body on:event={handler}/>
```

À l'instar de `<svelte:window>`, cet élément vous permet d'ajouter des fonctions d'écoute pour les évènements se produisant sur le `document.body`, comme `mouseenter` et `mouseleave`, qui ne se déclenchent pas sur `window`. Cela permet également d'utiliser des [actions](/docs/element-directives#use-action) sur l'élément `<body>`.


Comme pour `<svelte:window>` et `<svelte:document>`, cet élément peut uniquement être placé à la racine du <span class="vo">[markup](/docs/web#markup)</span> d'un composant, et ne doit jamais être à l'intérieur d'un bloc de compilation ou d'un élément.

```svelte
<svelte:body
	on:mouseenter={handleMouseenter}
	on:mouseleave={handleMouseleave}
	use:someAction
/>
```


## `<svelte:head>`

```svelte
<svelte:head>...</svelte:head>
```

Cet élément rend possible l'insertion d'éléments dans `document.head`. Lors d'un rendu côté serveur, le contenu de `head` est exposé séparément du contenu `html`.

Comme pour `<svelte:window>`, `<svelte:document>` et `<svelte:body>`, cet élément peut uniquement être placé à la racine du <span class="vo">[markup](/docs/web#markup)</span> d'un composant, et ne doit jamais être à l'intérieur d'un bloc de compilation ou d'un élément.

```svelte
<svelte:head>
	<link rel="stylesheet" href="/tutorial/dark-theme.css">
</svelte:head>
```

## `<svelte:options>`

```svelte
<svelte:options option={value}/>
```

L'élément `<svelte:options>` permet de fournir à un composant des options de compilation spécifiques, dont le détail est fourni dans [la section Compilation](/docs/svelte-compiler#compile).
Les options disponibles sont:

* `immutable={true}` — vous n'utilisez aucune donnée mutable, le compilateur peut donc se contenter d'effectuer des vérifications d'égalité par référence pour déterminer si des valeurs ont changé
* `immutable={false}` — utilisé par défaut. Svelte sera plus conservatif pour vérifier si des objets mutables ont changé
* `accessors={true}` — ajoute des <span class="vo">[getters](/docs/development#getter-setter)</span> et <span class="vo">[setters](/docs/development#getter-setter)</span> aux <span class="vo">[props](/docs/sveltejs#props)</span> d'un composant
* `accessors={false}` — utilisé par défaut
* `namespace="..."` — le <span class="vo">[namespace](/docs/development#namespace)</span> où ce composant sera utilisé, le plus souvent "svg" ; utilisez le <span class="vo">[namespace](/docs/development#namespace)</span> "foreign" pour désactiver l'insensibilité à la casse des noms d'attributs ainsi que les avertissements spécifiques au HTML
* `tag="..."` — le nom à utiliser à la compilation de ce composant en <span class="vo">[web component](/docs/web#web-component)</span>

```svelte
<svelte:options tag="my-custom-element"/>
```

## `<svelte:fragment>`

L'élément `<svelte:fragment>` permet de placer du contenu dans un [slot nommé](/docs/special-elements#slot-slot-name-name) sans l'encadrer par un élément <span class="vo">[DOM](/docs/web#dom)</span> supplémentaire. Cela permet de garder la structure de votre document intacte.

```svelte
<!-- Widget.svelte -->
<div>
	<slot name="header">Aucun en-tête fourni</slot>
	<p>Du contenu entre l'en-tête et le bas de page</p>
	<slot name="footer"></slot>
</div>

<!-- App.svelte -->
<Widget>
	<HeaderComponent slot="header" />
	<svelte:fragment slot="footer">
		<p>Tous droits réservés.</p>
		<p>Copyright (c) 2019 Svelte Industries</p>
	</svelte:fragment>
</Widget>
```

