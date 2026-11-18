<script lang="ts">
	import Empty from './Empty.svelte';

	let items = $state<string[]>([]);
</script>

<button onclick={() => (items = items.length ? [] : ['a', 'b'])}>toggle</button>

<output>
	<div>
		{#each items as item}
			<span>{item}</span>
		{:else}
		{/each}
	</div>

	<p>
		{#each items as item}
			<span>{item}</span>
		{:else}
			<Empty />
		{/each}
	</p>
</output>
