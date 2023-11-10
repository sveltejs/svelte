<script>
	export let count = 0;
</script>

<button on:click|once="{() => count += 1}">{count}</button>
