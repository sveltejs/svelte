<script>
	import Foo from './Foo.svelte';
	export let log;
	const x = 'x';
</script>

<svelte:component this="{Foo}" {...{ x, log }}>
	<div>Something</div>
</svelte:component>