<script>
	import Nested from './Nested.svelte';

	export let things;
</script>

<Nested {things}>
	<svelte:fragment slot="item" let:thing="{{ num }}">
		<span>{num}</span>
	</svelte:fragment>
</Nested>