<script>
	import Foo from './Foo.svelte';

	export let promise;
</script>

{#await promise then value}
	<Foo {value} />
{/await}