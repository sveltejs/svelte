<script>
	import A from "./B.svelte";
	import B from "./A.svelte";
	let value = $state(0);

	let Comp = $derived(value % 2 === 0 ? A : B);
</script>

<button onclick={()=>value++}>click</button>

<Comp --prop="red"/>