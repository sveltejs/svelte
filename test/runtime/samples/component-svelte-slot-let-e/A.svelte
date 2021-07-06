<script>
	import B from './B.svelte';
	export let x;
</script>

<B {x} let:reflected>
	<svelte:fragment slot="main">
		<span>{reflected}</span>
		<slot name="main" {reflected} />
	</svelte:fragment>
</B>