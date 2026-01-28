<script>
	import Component from "./Component.svelte";

	let open = $state(true);
	let comp;
</script>

<Component bind:this={comp} bind:open />

<button onclick={()=>{
	comp.open();
}}>{open}</button>

<input type="checkbox" bind:checked={open} />