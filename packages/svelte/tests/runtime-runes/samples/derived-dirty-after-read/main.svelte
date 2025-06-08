<script>
	import A from "./A.svelte";
	import B from "./B.svelte";
	
	let schema = $state("any");
	let value = $state({});

	let config = $derived.by(() => {
		value;
		return schema;
	});

	let Thing = $derived.by(() => {
		console.log("comp", config);
		return config === "any" ? A : B;
	});
</script>

<button onclick={()=>{
	schema = "one";
}}></button>

<Thing {config} bind:value/>