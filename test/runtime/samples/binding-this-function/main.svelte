<script>
	import Foo from './Foo.svelte';
	export let foo;
</script>

<button on:click={foo.click} />
<Foo bind:this={foo} />