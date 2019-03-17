<script>
	export let buffered;
	export let seekable;
	export let played;
	export let currentTime;
	export let duration;
	export let paused;
	export let volume;
</script>

<audio bind:buffered bind:seekable bind:played bind:currentTime bind:duration bind:paused bind:volume/>