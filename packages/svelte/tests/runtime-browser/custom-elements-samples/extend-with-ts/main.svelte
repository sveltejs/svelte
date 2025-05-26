<svelte:options customElement={{
	tag: "custom-element",
	extend: (customClass)=>{
		return class extends customClass{
			public test: string = "test";
		}
	},
}}/>

<script lang="ts">
	let { name } = $props();
</script>

<p>name: {name}</p>