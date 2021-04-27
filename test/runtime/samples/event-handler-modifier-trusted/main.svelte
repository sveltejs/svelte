<script>
	export let trusted = false;
</script>

<button on:click|trusted="{() => trusted = true}">Only trusted events: {trusted?'true':'false'}</button>
