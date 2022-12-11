<script>
	import Nested from './Nested.svelte';

	export let letters = ['a', 'b', 'c'];
</script>

<Nested items={letters}>
	<svelte:fragment slot="main" let:index>
		<label>
			{index + 1}: <input bind:value={letters[index]}>
		</label>
	</svelte:fragment>
</Nested>