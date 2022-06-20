<script>
	export let t;
	export let d;
	export let paused;
	export let v;
	export let r;
	export let m;
</script>

<audio bind:currentTime={t} bind:duration={d} bind:paused bind:volume={v} bind:muted={m} bind:playbackRate={r}
	src='music.mp3'></audio>