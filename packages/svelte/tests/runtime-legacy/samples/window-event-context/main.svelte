<script>
	export let foo;
</script>

<svelte:window on:click='{() => foo = !foo}'/>

{foo}