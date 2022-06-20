<script>
	import A from './A.svelte';
	export let x = 1;
	let y = 0;
</script>

<A {x}>
	<span 
		on:click={() => y = reflected}
		slot="foo"
		let:reflected
		class={reflected}
	>
		{reflected}
	</span>
</A>
{ y }