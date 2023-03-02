<script>
	export let trusted = true;
</script>

<button on:click|trusted="{() => trusted = false}">Only trusted events: {trusted?'true':'false'}</button>
