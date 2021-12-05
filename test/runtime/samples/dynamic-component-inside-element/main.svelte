<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	export let x;
</script>

<div>
	<svelte:component this="{ x ? Foo : Bar }" x='{x}'/>
</div>