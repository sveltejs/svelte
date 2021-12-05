<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	export let a = true;
	export let x;
</script>

<svelte:component this="{a ? Foo : Bar}" bind:x/>

<p>x in parent: {x}</p>