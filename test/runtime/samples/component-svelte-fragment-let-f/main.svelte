<script>
	import A from './A.svelte';
	export let x = 1;
	let y = 0;
</script>

<A {x}>
	<svelte:fragment slot="foo" let:reflected>
		<span 
			on:click={() => y = reflected}
			class={reflected}
		>
			{reflected}
		</span>
	</svelte:fragment>
</A>
{ y }