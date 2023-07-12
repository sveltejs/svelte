---
title: Markup de base
---

## Balises

Une balise en minuscules, comme `<div>`, indique un élément HTML standard. Une balise avec la première lettre en majuscule, comme `<Widget>` ou `<Namespace.Widget>`, indique un _composant_.

```svelte
<script>
	import Widget from './Widget.svelte';
</script>

<div>
	<Widget />
</div>
```

## Attributs et props

Par défaut, les attributs fonctionnent exactement comme leur équivalent HTML.

```svelte
<div class="foo">
	<button disabled>pas touche</button>
</div>
```

Comme en HTML, les valeurs peuvent être fournies sans guillemets.

<!-- prettier-ignore -->
```svelte
<input type=checkbox />
```

Les valeurs des attributs peuvent contenir des expressions JavaScript.

```svelte
<a href="page/{p}">page {p}</a>
```

Ou elles peuvent _être définies_ par des expressions JavaScript.

```svelte
<button disabled={!clickable}>...</button>
```

Les attributs booléens sont inclus sur l'élément si leur valeur est <span class="vo">[truthy](/docs/javascript#falsy-truthy-truthy)</span> et exclus si leur valeur est <span class="vo">[falsy](/docs/javascript#falsy-truthy-falsy)</span>.

Tous les autres attributs sont inclus à moins que leur valeur soit <span class="vo">[nullish](/docs/javascript#nullish)</span>.

```svelte
<input required={false} placeholder="Ce champ input n'est pas requis" />
<div title={null}>Cette div n'a pas de titre</div>
```

Une expression peut éventuellement inclure des caractères qui casseraient la mise en valeur de la syntaxe dans du HTML classique, en conséquence il est permis de mettre la valeur en guillemets. Les guillemets n'ont pas d'influence sur le <span class='vo'>[parsing](/docs/development#parser)</span> de la valeur.

```svelte
<button disabled={number !== 42}>...</button>
```

Quand le nom d'un attribut et sa valeur sont identiques, (`name={name}`), il est possible d'écrire `{name}`.

```svelte
<button {disabled}>...</button>
<!-- est équivalent à
<button disabled={disabled}>...</button>
-->
```

Par convention, les valeurs passées aux composants sont appelées _propriétés_ ou <span class='vo'>[_props_](/docs/sveltejs#props)</span> plutôt qu'_attributs_, caractéristiques du <span class='vo'>[DOM](/docs/web#dom)</span>.

Comme pour les éléments, `name={name}` peut être raccourci en `{name}`.

```svelte
<Widget foo={bar} answer={42} text="salut" />
```

Les _attributs décomposés (spread attributes)_ permettent de passer de nombreux attributs ou propriétés d'un seul coup.

Un élément ou un composant peut avoir plusieurs attributs décomposés, parsemés ou non d'attributs classiques.

```svelte
<Widget {...things} />
```

La variable `$$props` référence toutes les props qui sont fournies à un composant, y compris celles qui ne sont pas déclarées avec `export`. Il est en général déconseillé de l'utiliser, car Svelte a du mal à l'optimiser. Elle peut toutefois être utile dans de rares cas – par exemple lorsque vous ne savez pas à la compilation quelles props pourraient être passées à un composant.

```svelte
<Widget {...$$props} />
```

La variable `$$restProps` contient uniquement les props qui ne sont _pas_ déclarées avec `export`. Elle peut être utilisée pour relayer des attributs inconnus à un élément dans un composant plus profond. Elle a les mêmes problèmes d'optimisation que `$$props`, et son utilisation n'est pas non plus recommandée.

```html
<input {...$$restProps} />
```

> L'attribut `value` d'un élément `input` ou ses éléments enfants de type `option` ne doivent pas être utilisés avec des attributs décomposés lorsque `bind:group` ou `bind:checked` est utilisé. Dans ce cas, Svelte doit être capable d'accéder à la `value` de l'élément directement dans le <span class="vo">[markup](/docs/web#markup)</span>, afin de la relier à la variable correspondante.

> Parfois, l'ordre des attributs est important car Svelte gère les attributs séquentiellement dans JavaScript. Dans l'exemple `<input type="range" min="0" max="1" value={0.5} step="0.1"/>`, Svelte va essayer d'attribuer `1` à la valeur (arrondissant 0.5 à 1 car le pas par défaut est 1), puis va mettre le pas à `0.1`. Pour régler ce problème, utilisez plutôt `<input type="range" min="0" max="1" step="0.1" value={0.5}/>`.

> Un autre exemple est `<img src="..." loading="lazy" />`. Svelte va essayer d'attribuer la `src` de l'image avant d'appliquer `loading="lazy"` à l'élément `<img>`, ce qui arrive trop tard. Pour profiter du <span class='vo'>[lazy loading](/docs/web#lazy-loading)</span>, utilisez plutôt `<img loading="lazy" src="...">`.

## Expressions texte

```svelte
{expression}
```

Le texte peut aussi contenir des expressions JavaScript:

> Si vous utilisez la [notation littérale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#literal_notation_and_constructor) des expressions régulières (`RegExp`), vous devrez l'entourer de parenthèses.

```svelte
<h1>Bonjour {name}!</h1>
<p>{a} + {b} = {a + b}.</p>

<div>{/^[A-Za-z ]+$/.test(value) ? x : y}</div>
```

## Commentaires

Vous pouvez utiliser des commentaires HTML à l'intérieur des composants.

```svelte
<!-- quel beau commentaire ! --><h1>Bonjour tout le monde</h1>
```

Les commentaires qui commencent par `svelte-ignore` désactivent les avertissements du prochain bloc de <span class="vo">[markup](/docs/web#markup)</span>. En général, ce sont des avertissements d'accessibilité ; essayez de ne les désactiver que pour une bonne raison.

```svelte
<!-- svelte-ignore a11y-autofocus -->
<input bind:value={name} autofocus />
```
