<script>
	import Foo from './Foo.svelte';

	export let Bar = Foo;
</script>

<svelte:component this={Bar}/>