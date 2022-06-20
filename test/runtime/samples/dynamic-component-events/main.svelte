<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	export let x;
	export let selected;
</script>

<svelte:component this="{x ? Foo : Bar}" on:select="{e => selected = e.detail.id}"/>