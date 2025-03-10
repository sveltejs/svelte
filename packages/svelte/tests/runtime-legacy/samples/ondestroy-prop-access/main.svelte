<script>
	import Component from "./Component.svelte";
	let show = true;
	let count = 0;
	$: spread = { checked: show, count };
</script>

<button onclick={()=> count++ }></button>
<button onclick={()=> show = !show }></button>

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
	<Component {count} checked={show} />
{/if}

<!-- dynamic component -->
<svelte:component this={count < 2 ? Component : undefined} {count} checked={show} />

<!-- dynamic component spread -->
<svelte:component this={count < 2 ? Component : undefined} {...spread} />

<!-- dynamic component with prop only accessed on destroy -->
<svelte:component this={show ? Component : undefined} {count} checked={show} />

<!-- dynamic component with prop only accessed on destroy spread -->
<svelte:component this={show ? Component : undefined} {...spread} />
