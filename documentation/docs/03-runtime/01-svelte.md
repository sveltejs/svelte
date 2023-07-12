---
title: svelte
---

Le paquet `svelte` expose les [fonctions de cycle de vie](https://learn.svelte.dev/tutorial/onmount) et l'[API de contexte](https://learn.svelte.dev/tutorial/context-api).

## `onMount`

> EXPORT_SNIPPET: svelte#onMount

La fonction `onMount` permet de planifier l'exécution d'un <span class="vo">[callback](/docs/development#callback)</span> dès que le composant a été monté dans le <span class="vo">[DOM](/docs/web#dom)</span>. Elle doit être appelée pendant l'instantiation du composant (mais elle n'a pas besoin d'être définie _à l'intérieur_ du composant ; elle peut être appelée depuis un module externe).

`onMount` n'est pas exécutée pas à l'intérieur d'un [composant serveur](/docs/server-side-component-api).

```svelte
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('le composant est monté');
	});
</script>
```

Si une fonction est renvoyée par `onMount`, celle-ci sera appelée lorsque le composant sera démonté.

```svelte
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		const interval = setInterval(() => {
			console.log('beep');
		}, 1000);

		return () => clearInterval(interval);
	});
</script>
```

> Ce comportement ne fonctionne que si la fonction passée à `onMount` renvoie une valeur de manière _synchrone_. Les fonctions `async` renvoient toujours une `Promise`, ce qui implique qu'elles ne peuvent jamais renvoyer une fonction de manière _synchrone_.

## `beforeUpdate`

> EXPORT_SNIPPET: svelte#beforeUpdate

Planifie l'exécution d'un <span class="vo">[callback](/docs/development#callback)</span> immédiatement avant la mise à jour du composant, lorsqu'un changement d'état s'est produit.

> La première exécution du <span class="vo">[callback](/docs/development#callback)</span> se produit juste avant l'appel du `onMount` initial.

```svelte
<script>
	import { beforeUpdate } from 'svelte';

	beforeUpdate(() => {
		console.log('le composant est sur le point de se mettre à jour');
	});
</script>
```

## `afterUpdate`

> EXPORT_SNIPPET: svelte#afterUpdate

Planifie un <span class="vo">[callback](/docs/development#callback)</span> à exécuter immédiatement après la mise à jour du composant.

> La première exécution du <span class="vo">[callback](/docs/development#callback)</span> se produit juste après l'appel du `onMount` initial.

```sv
<script>
	import { afterUpdate } from 'svelte';

	afterUpdate(() => {
		console.log("le composant vient d'être mis à jour");
	});
</script>
```

## `onDestroy`

> EXPORT_SNIPPET: svelte#onDestroy

Planifie un <span class="vo">[callback](/docs/development#callback)</span> à exécuter immédiatement avant que le composant ne soit démonté.

Parmi les <span class="vo">[callbacks](/docs/development#callback)</span> de `onMount`, `beforeUpdate`, `afterUpdate` et `onDestroy`, c'est le seul qui s'exécute dans un composant côté serveur.

```svelte
<script>
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('le composant va être détruit');
	});
</script>
```

## `tick`

> EXPORT_SNIPPET: svelte#tick

Renvoie une promesse qui se résout une fois que tous les changements d'état en attente ont été appliqués, ou dans la micro-tâche suivante s'il n'y en a pas.

```svelte
<script>
	import { beforeUpdate, tick } from 'svelte';

	beforeUpdate(async () => {
		console.log('le composant est sur le point de se mettre à jour');
		await tick();
		console.log('le composant vient de se mettre à jour');
	});
</script>
```

## `setContext`

> EXPORT_SNIPPET: svelte#setContext

Associe un objet `context` arbitraire au composant courant et à la `key` spécifiée, puis retourne cet objet. Le contexte est alors accessible pour les enfants du composant (y compris le contenu de <span class="vo">[slot](/docs/sveltejs#slot)</span>) avec `getContext`.

Comme les fonctions de cycle de vie, elle doit être appelée pendant l'instantiation du composant.

```svelte
<script>
	import { setContext } from 'svelte';

	setContext('answer', 42);
</script>
```

> Le contexte n'est pas intrinsèquement réactif. Si vous avez besoin de valeurs réactives dans le contexte, alors vous pouvez passer un store dans le contexte, store qui _sera_ réactif.

## `getContext`

> EXPORT_SNIPPET: svelte#getContext

Récupère le contexte qui appartient au composant parent le plus proche avec la `key` spécifiée. Doit être appelé pendant l'instantiation du composant.

```svelte
<script>
	import { getContext } from 'svelte';

	const answer = getContext('answer');
</script>
```

## `hasContext`

> EXPORT_SNIPPET: svelte#hasContext

Vérifie si une clé donnée a été définie dans le contexte d'un composant parent. Doit être appelé pendant l'instantiation du composant.

```svelte
<script>
	import { hasContext } from 'svelte';

	if (hasContext('answer')) {
		// faites quelque chose
	}
</script>
```

## `getAllContexts`

> EXPORT_SNIPPET: svelte#getAllContexts

Récupère l'ensemble des contextes appartenant au composant parent le plus proche. Doit être appelé pendant l'instantiation du composant. Utile, par exemple, si vous créez un composant de manière programmatique et que vous voulez lui passer le contexte existant.

```svelte
<script>
	import { getAllContexts } from 'svelte';

	const contexts = getAllContexts();
</script>
```

## `createEventDispatcher`

> EXPORT_SNIPPET: svelte#createEventDispatcher

Crée un générateur d'événements qui peut être utilisé pour distribuer les [événements de composants] (/docs#template-syntaxe-component-directives-on-eventname). Les générateurs d'événements sont des fonctions qui peuvent prendre deux arguments : `name` et `detail`.

Les événements de composants créés avec `createEventDispatcher` créent un [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) (en anglais). Ces événements ne suivent pas la chaîne de <span class="vo">[bubbling](/docs/javascript#bubble-capture-bubble)</span>. L'argument `detail` correspond à la propriété [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) (en anglais) et peut contenir tout type de données.

```svelte
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button on:click="{() => dispatch('notify', 'detail value')}">Générer un événement</button>
```

Les événements envoyés par les composants enfants peuvent être écoutés par leur parent. Toutes les données fournies lors de l'envoi de l'événement sont disponibles dans la propriété `detail` de l'objet événement.

```svelte
<script>
	function callbackFunction(event) {
		console.log(`Événement généré ! Détail: ${event.detail}`)
	}
</script>

<Child on:notify="{callbackFunction}"/>
```

Les événements peuvent être annulables en passant un troisième paramètre à la fonction `dispatch`. La fonction renvoie `false` si l'événement est annulé avec `event.preventDefault()`, sinon elle renvoie `true`.

```svelte
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function notify() {
		const shouldContinue = dispatch('notify', 'detail value', { cancelable: true });
		if (shouldContinue) {
			// personne n'a appelé preventDefault
		} else {
			// un listener a appelé preventDefault
		}
	}
</script>
```

Vous pouvez typer le générateur d'évènement pour définir quels évènements il peut recevoir. Cela rendra votre
code plus solide à la fois dans le composant (les mauvais appels seront mis en valeur) et lorsque vous utiliserez le composant (les types d'évènements seront réduits). Voir [cette section](typescript#script-lang-ts-events) pour plus de détail.

## Types

> TYPES: svelte
