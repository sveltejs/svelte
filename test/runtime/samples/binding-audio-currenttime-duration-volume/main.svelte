<script>
	export let t;
	export let d;
	export let paused;
	export let v;
</script>

<audio bind:currentTime={t} bind:duration={d} bind:paused bind:volume={v}
	src='music.mp3'></audio>