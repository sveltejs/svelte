<!-- https://eugenkiss.github.io/7guis/tasks#timer -->

<script>
	import { onMount } from 'svelte';

	let elapsed = 0;
	let duration = 5000;

	onMount(() => {
		let last_time = performance.now();

		let frame = requestAnimationFrame(function update(time) {
			frame = requestAnimationFrame(update);

			elapsed += Math.min(time - last_time, duration - elapsed);
			last_time = time;
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	});
</script>

<label>
	elapsed time:
	<progress value={elapsed / duration}></progress>
</label>

<div>{(elapsed / 1000).toFixed(1)}s</div>

<label>
	duration:
	<input type="range" bind:value={duration} min="1" max="20000" />
</label>

<button on:click={() => (elapsed = 0)}>reset</button>
