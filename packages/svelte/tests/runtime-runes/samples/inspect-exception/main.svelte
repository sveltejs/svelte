<script lang="ts">
	import Component from './Component.svelte';

	let s = $state({ a: {"1": "a", "2": "b"} });
</script>

<button onclick={() => (s = {})}>Set State</button>

{#if s.a}
	{#each Object.entries(s.a) as [k, v]}
		<Component bind:a={s.a[k]} />
	{/each}
{/if}
