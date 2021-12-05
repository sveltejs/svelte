<script>
	export let clientWidth = 1;
	export let clientHeight = 2;
	export let offsetHeight = 3;
	export let offsetWidth = 4;

	export let audioDuration = 5;
	export let audioBuffered = 6;
	export let audioSeekable = 7;
	export let audioPlayed = 8;

	export let videoDuration = 9;
	export let videoBuffered = 10;
	export let videoSeekable = 11;
	export let videoPlayed = 12;

	export let value = '/some/file';
</script>

<div
	bind:clientWidth
	bind:clientHeight
	bind:offsetWidth
	bind:offsetHeight
></div>

<audio
	bind:duration="{audioDuration}"
	bind:buffered="{audioBuffered}"
	bind:seekable="{audioSeekable}"
	bind:played="{audioPlayed}"
></audio>

<video
	bind:duration="{videoDuration}"
	bind:buffered="{videoBuffered}"
	bind:seekable="{videoSeekable}"
	bind:played="{videoPlayed}"
></video>

<input
  type="file"
	bind:value
/>
