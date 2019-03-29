<script>
	export let t;
	export let d;
	export let paused;
	export let v;
	export let r;
</script>

<audio bind:currentTime={t} bind:duration={d} bind:paused bind:volume={v} bind:playbackRate={r}
	src='music.mp3'></audio>