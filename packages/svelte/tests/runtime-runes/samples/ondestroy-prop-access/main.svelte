<script>
	import Component from "./Component.svelte";
	
	let show = $state(true);
	let count = $state(0);
	let spread = $derived({ checked: show, count });

	let Dynamic = $derived(count < 2 ? Component : undefined);
	let Dynamic2 = $derived(show ? Component : undefined);
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
<Dynamic {count} checked={show} />

<!-- dynamic component spread -->
<Dynamic {...spread} />

<!-- dynamic component with prop only accessed on destroy -->
<Dynamic2 {count} checked={show} />

<!-- dynamic component with prop only accessed on destroy spread -->
<Dynamic2 {...spread} />
