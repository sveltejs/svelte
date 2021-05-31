<script>
	import Nested from './Nested.svelte';

	export let things;
</script>

<Nested {things} let:thing={x}>
	<svelte:fragment slot="main">
		<span>{x}</span>
	</svelte:fragment>
</Nested>