<script context="module">
	let current;
</script>

<script>
	export let src;
	export let title;
	export let composer;
	export let performer;

	let audio;
	let paused = true;

	function stopOthers() {
		if (current && current !== audio) current.pause();
		current = audio;
	}
</script>

<article class:playing={!paused}>
	<h2>{title}</h2>
	<p><strong>{composer}</strong> / performed by {performer}</p>

	<audio
		bind:this={audio}
		bind:paused
		on:play={stopOthers}
		controls
		{src}
	></audio>
</article>

<style>
	article {
		margin: 0 0 1em 0; max-width: 800px;
	}
	h2, p {
		margin: 0 0 0.3em 0;
	}
	audio {
		width: 100%; margin: 0.5em 0 1em 0;
	}
	.playing {
		color: #ff3e00;
	}
</style>