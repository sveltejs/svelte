---
title: Balises spéciales
---

## {@html ...}

```svelte
{@html expression}
```

Dans une expression texte, les caractères `<` et `>` sont échappés ; ils ne sont en revanche pas échappés dans une expression HTML.

L'expression doit être du HTML valide en soi — `{@html "<div>"}contenu{@html "</div>"}` ne fonctionnera _pas_, car `</div>` n'est pas du HTML valide. Dans ce cas, Svelte ne réussira _pas_ à compiler.

> Svelte ne nettoie pas les expressions avant d'injecter le HTML. Si la donnée provient d'une source non sûre, vous devez le nettoyer vous-même pour éviter d'exposer vos utilisateurs à des vulnérabilités de type <span class="vo">[XSS](/docs/web#xss)</span>.

```svelte
<div class="blog-post">
	<h1>{post.title}</h1>
	{@html post.content}
</div>
```

## {@debug ...}

```svelte
{@debug}
```
```svelte
{@debug var1, var2, ..., varN}
```

La balise `{@debug ...}` offre une alternative à `console.log(...)`. Elle affiche les valeurs des variables spécifiées lorsqu'elle changent, et met en pause l'exécution du code si vous avez les outils de développement ouverts.

```svelte
<script>
	let user = {
		firstname: 'Ada',
		lastname: 'Lovelace'
	};
</script>

{@debug user}

<h1>Hello {user.firstname}!</h1>
```

`{@debug ...}` accepte une liste de noms de variables séparés par des virgules (mais pas des expressions).

```svelte
<!-- Compile -->
{@debug user}
{@debug user1, user2, user3}

<!-- Ne compile pas -->
{@debug user.firstname}
{@debug myArray[0]}
{@debug !isReady}
{@debug typeof user === 'object'}
```

La balise `{@debug}` sans argument insère une expression `debugger` qui est déclenchée lorsque _n'importe quel_ état change, plutôt que certaines variables spécifiques.

## {@const ...}

```svelte
{@const assignment}
```

La balise `{@const ...}` définit une constante locale.

```svelte
<script>
	export let boxes;
</script>

{#each boxes as box}
	{@const area = box.width * box.height}
	{box.width} * {box.height} = {area}
{/each}
```

`{@const}` est uniquement utilisable en tant qu'enfant direct de `{#if}`, `{:else if}`, `{:else}`, `{#each}`, `{:then}`, `{:catch}`, `<Component />` ou `<svelte:fragment />`.
