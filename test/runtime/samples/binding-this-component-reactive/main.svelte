<script>
	import Foo from './Foo.svelte';
	export let foo;
</script>

<Foo bind:this={foo}/>
<div>
	has foo: {!!foo}
</div>
