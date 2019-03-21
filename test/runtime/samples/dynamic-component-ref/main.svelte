<script>
	import Foo from './Foo.svelte';

	export let test;
</script>

<svelte:component bind:this={test} this={Foo}/>
