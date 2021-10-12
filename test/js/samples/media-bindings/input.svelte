<script>
	export let buffered;
	export let seekable;
	export let played;
	export let currentTime;
	export let duration;
	export let paused;
	export let volume;
	export let muted;
	export let playbackRate;
	export let seeking;
	export let ended;
	export let readyState;
</script>

<audio bind:buffered bind:seekable bind:played bind:currentTime bind:duration bind:paused bind:volume bind:muted bind:playbackRate bind:seeking bind:ended bind:readyState/>
