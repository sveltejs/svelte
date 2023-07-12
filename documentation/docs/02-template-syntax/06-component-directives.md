---
title: Directives de composant
---

## on:*eventname*

```svelte
on:eventname={handler}
```

Les composants peuvent émettre des évènements en utilisant [createEventDispatcher](/docs/svelte#createeventdispatcher), ou en relayant les évènements <span class='vo'>[DOM](/docs/web#dom)</span>.

```svelte
<!-- SomeComponent.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
</script>

<!-- programmatic dispatching -->
<button on:click={() => dispatch('hello')}>
  one
</button>

<!-- declarative event forwarding -->
<button on:click>
  two
</button>
```

Il est possible d'écouter des évènements de composant de la même manière que pour des évènements <span class='vo'>[DOM](/docs/web#dom)</span> :

```svelte
<UnComposant on:peuimporte={handler} />
```

Comme pour les évènements <span class='vo'>[DOM](/docs/web#dom)</span>, si la direction `on:` est utilisée sans valeur, l'évènement sera *relayé*, ce qui permet au parent du composant de l'écouter.


```svelte
<UnComposant on:peuimporte />
```

## --style-props

```svelte
--style-props="anycssvalue"
```

Vous pouvez aussi passer des props de style aux composants en utilisant les [propriétés CSS personnalisées](https://developer.mozilla.org/fr/docs/Web/CSS/Using_CSS_custom_properties). Cela permet notamment d'appliquer des thèmes.

Cette fonctionnalité est principalement du sucre syntaxique, que Svelte va transformer pour entourer l'élément, comme dans cet exemple :

```svelte
<Slider
  bind:value
  min={0}
  --rail-color="black"
  --track-color="rgb(0, 0, 255)"
/>
```

Qui va générer :

```svelte
<div style="display: contents; --rail-color: black; --track-color: rgb(0, 0, 255)">
  <Slider
    bind:value
    min={0}
    max={100}
  />
</div>
```

**Note**: Faites attention, cette syntaxe ajoute une `<div>` à votre <span class="vo">[markup](/docs/web#markup)</span>, qui pourra être ciblée accidentellement par votre CSS. Ayez conscience de cet ajout d'élément lorsque vous utilisez cette fonctionnalité.

Dans le <span class='vo'>[namespace](/docs/development#namespace)</span> SVG, l'exemple ci-dessus va générer un `<g>` à la place d'une `<div>` :

```svelte
<g style="--rail-color: black; --track-color: rgb(0, 0, 255)">
  <Slider
    bind:value
    min={0}
    max={100}
  />
</g>
```

**Note**: Faites attention, cette syntaxe ajoute un `<g>` à votre <span class="vo">[markup](/docs/web#markup)</span>, qui pourra être ciblé accidentellement par votre CSS. Ayez conscience de cet ajout d'élément lorsque vous utilisez cette fonctionnalité.

Le support des variables CSS dans Svelte permet d'appliquer des thèmes aux composants de manière simple :

```svelte
<!-- Slider.svelte -->
<style>
  .potato-slider-rail {
    background-color: var(--rail-color, var(--theme-color, 'purple'));
  }
</style>
```

Vous pouvez alors définir une couleur de thème à plus haut niveau :

```css
/* global.css */
html {
  --theme-color: black;
}
```

Ou l'écraser au niveau de l'instantiation du composant :

```svelte
<Slider --rail-color="goldenrod"/>
```

## bind:*property*

```svelte
bind:property={variable}
```

Vous pouvez lier des props de composant en utilisant la même syntaxe que pour les éléments.

```svelte
<Keypad bind:value={pin}/>
```

Alors que les <span class="vo">[props](/docs/sveltejs#props)</span> de Svelte sont réactives sans ajouter de liaison, cette réactivité est descendante vers l'intérieur du composant par défaut. Utiliser `bind:property` permet aux modifications effectuées sur cette prop depuis l'intérieur du composant de remonter en dehors du composant.

## bind:this

```svelte
bind:this={component_instance}
```

Les composants permettent aussi `bind:this`, permettant d'interagir avec les instances de composant programmatiquement.

```svelte
<ShoppingCart bind:this={cart}/>

<button on:click={() => cart.empty()}> Caddie vide </button>
```

> Notez qu'on ne peut pas écrire `{cart.empty}` puisque `cart` est `undefined` quand le bouton est rendu la première fois, ce qui provoquerait une erreur

