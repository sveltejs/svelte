---
title: Les blocs logiques
---

## {#if ...}

```svelte
<!--- copy: false  --->
{#if expression}...{/if}
```

```svelte
<!--- copy: false  --->
{#if expression}...{:else if expression}...{/if}
```

```svelte
<!--- copy: false  --->
{#if expression}...{:else}...{/if}
```

Il est possible d'afficher conditionnellement du contenu en l'encadrant par un bloc `if`.

```svelte
{#if answer === 42}
	<p>c'était quoi la question déjà ?</p>
{/if}
```

Des conditions supplémentaires peuvent être ajoutées avec `{:else if expression}`, et il est possible de terminer avec un `{:else}` optionnel.

```svelte
{#if soupe.temperature > 100}
	<p>trop chaud !</p>
{:else if 80 > soupe.temperature}
	<p>trop froid !</p>
{:else}
	<p>parfait !</p>
{/if}
```

(Les blocs n'ont pas besoin d'entourer des éléments, ils peuvent aussi entourer du texte au sein d'éléments !)

## {#each ...}

```svelte
<!--- copy: false  --->
{#each expression as name}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name, index}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name (key)}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name, index (key)}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name}...{:else}...{/each}
```

Il est possible d'itérer sur des listes de valeurs avec un bloc `each`.

```svelte
<h1>Liste de courses</h1>
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>
```

Vous pouvez utiliser des blocs `each` pour itérer sur n'importe quel tableau ou valeur similaire — c'est-à-dire un objet avec une propriété `length`.

Un bloc `each` peut aussi spécifier un _indice_, équivalent au deuxième argument du <span class="vo">[callback](/docs/development#callback)</span> de `array.map(...)`:

```svelte
{#each items as item, i}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

Vous pouvez spécifier une _clé_ à un bloc `each`. Cette clé doit identifier de manière unique chaque élément de la liste. Svelte s'en servira pour mettre à jour la liste avec précision lorsque la donnée changera, plutôt que d'ajouter ou enlever des éléments à la fin. La clé peut être n'importe quel objet, mais les chaînes de caractères ou les nombres sont recommandés car ils permettent de persister l'identité, ce qui n'est pas le cas des objets.

```svelte
{#each items as item (item.id)}
	<li>{item.name} x {item.qty}</li>
{/each}

<!-- ou en utilisant un indice -->
{#each items as item, i (item.id)}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

Vous pouvez librement utiliser la syntaxe de [décomposition](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) dans les blocs `each`.

```svelte
{#each items as { id, name, qty }, i (id)}
	<li>{i + 1}: {name} x {qty}</li>
{/each}

{#each objects as { id, ...rest }}
	<li><span>{id}</span><MyComponent {...rest} /></li>
{/each}

{#each items as [id, ...rest]}
	<li><span>{id}</span><MyComponent values={rest} /></li>
{/each}
```

Un bloc `each` peut aussi avoir une clause `{:else}`, qui sera affichée si la liste est vide.

```svelte
{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>Rien à faire aujourd'hui !</p>
{/each}
```

Depuis Svelte 4, il est possible d'itérer sur les itérables comme `Map` ou `Set`. Les itérables doivent êtres finis et statiques (ils ne doivent pas changer lorsqu'on itère dessus). Sous le capot, ils sont transformés en tableau avec `Array.from` avant d'être envoyés au rendu. Si vous écrivez du code sensible à la performance, essayez d'éviter les itérables et utilisez plutôt des tableaux classiques, qui sont plus performants dans ce cas.

## {#await ...}

```svelte
<!--- copy: false  --->
{#await expression}...{:then name}...{:catch name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression}...{:then name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression then name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression catch name}...{/await}
```

Les blocs `await` permettent de différencier les trois états de promesse possibles — en attente, résolue ou rejetée. En mode <span class="vo">[SSR](/docs/web#server-side-rendering)</span>, seul l'état d'attente sera rendu sur le serveur.
Si l'expression fournie n'est pas une Promesse, seule la branche résolue sera rendue, même en mode SSR.

```svelte
{#await promise}
	<!-- la promesse est en attente -->
	<p>en attente de la résolution de la promesse...</p>
{:then value}
	<!-- la promesse est résolue ou l'expression n'est pas une Promesse -->
	<p>La valeur est {value}</p>
{:catch error}
	<!-- la promesse est rejetée -->
	<p>Quelque chose ne va pas : {error.message}</p>
{/await}
```

Le bloc `catch` peut être ignoré si vous n'avez pas besoin d'afficher quoi que ce soit lorsque la promesse est rejetée (ou si aucune erreur n'est possible).

```svelte
{#await promise}
	<!-- la promesse est en attente -->
	<p>en attente de la résolution de la promesse...</p>
{:then value}
	<!-- la promesse est résolue -->
	<p>La valeur est {value}</p>
{/await}
```

Si l'état d'attente ne vous concerne pas, vous pouvez aussi ignorer le bloc initial.

```svelte
{#await promise then value}
	<p>La valeur est {value}</p>
{/await}
```

De manière similaire, si vous voulez uniquement afficher l'état d'erreur, vous pouvez ignorer le bloc `then`.

```svelte
{#await promise catch error}
	<p>L'erreur est {error}</p>
{/await}
```

## {#key ...}

```svelte
<!--- copy: false  --->
{#key expression}...{/key}
```

Les blocs `key` détruisent et reconstruisent leur contenu quand la valeur de leur expression change.

C'est utile lorsque vous voulez qu'un élément joue sa transition à chaque fois qu'une valeur se met à jour.

```svelte
{#key value}
	<div transition:fade>{value}</div>
{/key}
```

Utilisé autour de composants, un bloc `key` déclenchera leur réinstantiation et réinitialisation.

```svelte
{#key value}
	<Component />
{/key}
```
