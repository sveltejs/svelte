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

<!-- normal props -->
{#if count < 2}
	<Component {count} checked={show} />
{/if}

<!-- spread syntax -->
{#if count < 2}
	<Component {...spread} />
{/if}

<!-- prop only accessed in destroy -->
{#if show}
	<Component {count} checked={show} />
{/if}

<!-- runes dynamic component pattern with normal props -->
<DynComponent1 {count} checked={show} />

<!-- runes dynamic component pattern with spread -->
<DynComponent1 {...spread} />

<!-- runes dynamic component pattern (show) with normal props -->
<DynComponent2 {count} checked={show} />

<!-- runes dynamic component pattern with spread (show) -->
<DynComponent2 {...spread} />
