<script>
	import { fade } from 'svelte/transition';

	let toggle = $state(true);
	let items = $state([ 1, 2, 3 ]);

	const handle_toggle = async () => {
		toggle = false;
		await Promise.resolve();
		items = [3, 4];
		toggle = true;
	};
</script>

<button onclick={handle_toggle}>Toggle</button>

{#if toggle}
	<div transition:fade={{ duration: 500 }}>
		{#each items as item (item)}
			<div>{item}</div>
		{/each}
	</div>
{/if}
