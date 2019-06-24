<script>
	import Foo from './Foo.svelte';
	export let foo = {};
</script>

<Foo bind:this={foo['computed']}/>
<div>
	has foo: {!!foo.computed}
</div>
