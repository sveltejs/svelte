<script>
	export let count = 0;
</script>

<svelte:body on:click|once="{() => count += 1}"/>