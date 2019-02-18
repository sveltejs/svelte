<script>
	import Foo from './Foo.svelte';

	export let test;
</script>

<svelte:component this={Foo} bind:this={test}/>
