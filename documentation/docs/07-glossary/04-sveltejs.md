---
title: 'Svelte'
---

Voici quelques informations sur les angliscismes classiques utilisés dans le contexte de Svelte.

Ces mots n'ont pas de réelle traduction en français, ou alors celle-ci n'est que très rarement utilisée. Nous préférons donc laisser leur version anglaise dans la documentation pour rester au plus près de l'usage courant.

> Cette section de glossaire est spécifique à la documentation française de Svelte, et n'existe pas dans la documentation officielle.

## Binding

Le _binding_ est le mécanisme par lequel une valeur d'un input est automatiquement copiée dans une variable :

```svelte
<!-- ici, la valeur est initialisée avec la variable name
mais la variable ne sera pas mise à jour automatiquement avec la saisie de l'utilisateur -->
<input value={name}>

<!-- dans ce cas, la valeur est initialisée avec la variable name
et la variable sera automatiquement mise à jour avec la saisie de l'utilisateur -->
<input bind:value={name}>

<!-- écriture plus concise du binding dans le cas ou la variable porte le même nom que la propriété bindée -->
<input bind:value>
```

De la même manière, il est possible de _binder_ des propriétés d'un composant :

```svelte
<script>
    import { Commande } from './Commande.svelte';

    let articles;
</script>

<Commande bind:articles={articles}>
```

Il est également possible de _binder_ des propriétés de certains éléments du <span class='vo'>[DOM](/docs/web#dom)</span> (les éléments de type bloc, les images, les vidéo, window via `svelte:window` et document via `svelte:document`).

## Hook

> Bientôt...

## Props

> Bientôt...

## Slot

> Bientôt...

## Store

Un _store_ est un concept au sein de Svelte qui permet de stocker une valeur, et de notifier n'importe quel module au sein de l'application de ses changements de valeur.

Plus d'infos sur [les stores Svelte dans la documentation](/docs/svelte-store).

## Tick

> Bientôt...

