<script>
	import Component from './Component.svelte';

	let show = $state(true);
	let count = $state(0);
	let spread = $derived({ checked: show, count });

	// Runes dynamic component pattern
	let DynComponent1 = $derived(count < 2 ? Component : undefined);
	let DynComponent2 = $derived(show ? Component : undefined);
</script>

<button id="increment" onclick={() => count++}>Increment count</button>
<button id="toggle" onclick={() => (show = !show)}>Toggle show</button>

<!-- count with bind -->
{#if count < 2}
	<Component bind:count bind:checked={show} />
{/if}

<!-- spread syntax -->
{#if count < 2}
	<Component {...spread} />
{/if}

<!-- normal prop -->
{#if count < 2}
	<Component {count} checked={show} />
{/if}

<!-- prop only accessed in destroy -->
{#if show}
	<Component bind:count bind:checked={show} />
{/if}

<!-- runes dynamic component pattern -->
<DynComponent1 bind:count bind:checked={show} />

<!-- runes dynamic component pattern with spread -->
<DynComponent1 {...spread} />

<!-- runes dynamic component pattern with normal props -->
<DynComponent1 {count} checked={show} />

<!-- runes dynamic component pattern (show) -->
<DynComponent2 bind:count bind:checked={show} />

<!-- runes dynamic component pattern with spread (show) -->
<DynComponent2 {...spread} />

<!-- runes dynamic component pattern with normal props (show) -->
<DynComponent2 {count} checked={show} />
