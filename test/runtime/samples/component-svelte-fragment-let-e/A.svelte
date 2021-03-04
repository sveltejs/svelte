<script>
	import B from './B.svelte';
	export let x;
</script>

<B {x}>
	<svelte:fragment slot="main" let:reflected>
		<span>{reflected}</span>
		<slot name="main" {reflected} />
	</svelte:fragment>
</B>