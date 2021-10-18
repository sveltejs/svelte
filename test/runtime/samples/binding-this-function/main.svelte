<script>
	import Foo from './Foo.svelte';
	let foo;
</script>

<button on:click={foo.click} />
<Foo bind:this={foo} />