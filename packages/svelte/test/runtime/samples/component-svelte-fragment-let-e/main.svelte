<script>
	import A from './A.svelte';
	export let x = 1;
</script>

<A {x}>
	<svelte:fragment slot="main" let:reflected>
		<span>{reflected}</span>
	</svelte:fragment>	
</A>
