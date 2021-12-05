<script>
	import Foo from './Foo.svelte';

	export let props;
</script>

<svelte:component this={Foo} {...props} />