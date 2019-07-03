<script>
	import Nested from './Nested.svelte';

	export let letters = ['a', 'b', 'c'];
</script>

<Nested items={letters} let:index>
	<label>
		{index + 1}: <input bind:value={letters[index]}>
	</label>
</Nested>