<script>
	import { flip } from 'svelte/animate';

	let items = $state([1, 2]);
	const durations = [0, undefined, null, 400];

	function fade(node, { duration }) {
		return { duration, css: (t) => `opacity: ${t}` };
	}
</script>

<button onclick={() => (items = [])}>remove</button>

{#each durations as first}
	{#each durations as second}
		<div>
			{#each items as item (item)}
				<p animate:flip>
					{#if (item === 1 ? first : second) === null}
						<span>{item}</span>
					{:else}
						<span out:fade|global={{ duration: item === 1 ? first : second }}>{item}</span>
					{/if}
				</p>
			{/each}
		</div>
	{/each}
{/each}
