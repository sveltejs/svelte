<script>
	import Foo from './Foo.svelte';
	import Bar from './Bar.svelte';

	let y = 1;
	let z = 2;
</script>

<Foo x={y}/>
<Bar x={z}/>

<!-- ensure z is considered dynamic, even though the binding is encountered late -->
<input bind:value={z}>