<script>
	import { longpress } from './longpress.js';

	let pressed = false;
	let duration = 2000;
</script>

<label>
	<input type="range" bind:value={duration} max={2000} step={100} />
	{duration}ms
</label>

<button
	use:longpress={duration}
	on:longpress={() => (pressed = true)}
	on:mouseenter={() => (pressed = false)}>maintenez appuyé</button
>

{#if pressed}
	<p>félicitations, vous avez maintenu le bouton appuyé pendant {duration} ms</p>
{/if}
