<script>
	import Input from "./Input.svelte";
	import Display from "./Display.svelte";
</script>

<Input let:val={foo}>
	{#if foo}
		<Display>{foo}</Display>
	{/if}
</Input>
