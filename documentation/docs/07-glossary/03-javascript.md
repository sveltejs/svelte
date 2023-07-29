---
title: 'JavaScript'
---

Voici quelques informations sur les angliscismes usuels utilisés dans le contexte de JavaScript.

Ces mots n'ont pas de réelle traduction en français, ou alors celle-ci n'est que très rarement utilisée. Nous préférons donc laisser leur version anglaise dans la documentation pour rester au plus près de l'usage courant.

> Cette section de glossaire est spécifique à la documentation française de Svelte, et n'existe pas dans la documentation officielle.

## Bubble / Capture

### Bubble

> Bientôt...

### Capture

> Bientôt...

## Event listener

Un _event listener_ est une fonction conçue pour être exécutée lorsqu'un événement est déclenché.

Par exemple, on peut utiliser un _event listener_ pour **changer la couleur d'un bouton** (fonction) lorsqu'on **clique** dessus.

```html
<!-- HTML -->
<button onclick="() => console.log('Click !')">
	Clic
</button>
```

```ts
// JavaScript
const element = document.createElement('button');

element.onclick = () => console.log('Click !')
// ou
element.addEventListener('click', () => console.log('Click !'))
```

```svelte
 <!-- Svelte -->
<button on:click={() => console.log('Click !')}>
	Clic
</button>
```

Plus d'infos sur les _event listeners_ sur [le site de MDN](https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener).

## Event dispatcher

> Bientôt...

## Falsy / Truthy

### Falsy

Une valeur est dite _falsy_ si celle-ci peut être interprétée comme équivalente (et non pas égale) à `false`.

Les valeurs _falsy_ sont:
- `false`
- `0`
- `-0`
- `0n` (`0` en BigInt)
- `""` (chaîne de caractère vide)
- `null`
- `undefined`
- `NaN`
- `document.all`

Si une valeur est _falsy_, alors sa double négation renvoie la valeur `false`.

```ts
!!0 // false
!!null // false
!!undefined // false
// ...
```

Plus d'infos sur les valeurs _falsy_ sur [le site de MDN](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) (en anglais).

### Truthy

Une valeur est dite _truthy_ si celle-ci n'est pas <span class="vo">[falsy](/docs/javascript#falsy-truthy-falsy)</span>. Toutes les valeurs qui ne sont pas celles listées juste au-dessus sont donc _truthy_.

Si une valeur est _truthy_, alors sa double négation renvoie la valeur `true`.

```ts
!!1 // true
!!{} // true
!!'dsds' // true
// ...
```

Plus d'infos sur les valeurs _truthy_ sur [le site de MDN](https://developer.mozilla.org/fr/docs/Glossary/Truthy).

## Generic

Un _generic_ est une notion en TypeScript qui permet de définir une variable au sein d'un type. Il a pour fonctionnalité première de permettre de propager un type au sein d'une méthode lorsque le type est variable. L'exemple le plus simple est la fonction identité :

```typescript
function identity<Type>(arg: Type): Type {
	return arg;
}
```

Dans ce cas précis, le paramètre `arg` pourra être de n'importe quel type, représenté par le _generic_ `Type`. Le retour de la méthode aura le même type que le paramètre.

Plus d'infos sur les [generics sur le site TypeScript](https://www.typescriptlang.org/docs/handbook/2/generics.html).

## Inline

L'adjectif _inline_ désigne le fait de définir du style, une condition, une fonction ou un composant sur une seule ligne. Toutes ces fonctionnalités ne sont pas permises nativement en Javascript. Certaines sont apportées par les frameworks de développement, comme Svelte.

Exemples :

```ts
// @noErrors
// fonction inline
const saluer = (nom: string) => console.log(`Salut ${nom} !`)

function saluer(nom: string) {
	// condition inline
	if (!nom) return;

	// traitement
}
```

```svelte
<!-- style inline en HTML ou en Svelte -->
<div style="margin: 8px;"/>

<!-- autre manière d'écrire du style inline en Svelte -->
<div style:margin="8px"/>
```

## Nullish

Une valeur _nullish_ est une valeur qui est `null` ou `undefined`.

`null` et `undefined` sont deux valeurs qui représentent toutes les deux l'absence de valeur. Ce sont des valeurs différentes (`null !== undefined`), mais équivalentes (`null == undefined`). Pour pouvoir faire référence aux deux, on utilise le terme _nullish_.

Pour en savoir plus sur la différence entre `null` et `undefined`, vous pouvez par exemple lire [ceci](https://stackoverflow.com/questions/5076944/what-is-the-difference-between-null-and-undefined-in-javascript) (en anglais).

## Polyfill

Un _polyfill_ est un bout de code (généralement en JavaScript sur le web) utilisé pour fournir des fonctionnalités récentes sur d'anciens navigateurs qui ne les supportent pas nativement.

Plus d'infos sur les [polyfills sur le site MDN](https://developer.mozilla.org/fr/docs/Glossary/Polyfill).

## Shadow DOM

Un _shadow DOM_ (ou DOM fantôme) est un <span class='vo'>[DOM](/docs/web#dom)</span> dans le DOM. Il est monté via la méthode `element.attachShadow()` et a pour particularité d'être encapsulé, c'est-à-dire que sa structure de balisage est isolée, que son style est isolé et que son comportement est caché et séparé du reste de code de la page.

Plus d'infos sur le [shadow DOM sur le site MDN](https://developer.mozilla.org/fr/docs/Web/API/Web_components/Using_shadow_DOM).
