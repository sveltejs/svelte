<script>
	import C from './C.svelte';

	export let list = [1, 2, 3, 2, 1];
	export let currentIdentifier;
</script>

{#each list as item}
	<p>
		<C identifier="{item}" bind:currentIdentifier>
			{item}
		</C>
	</p>
{/each}