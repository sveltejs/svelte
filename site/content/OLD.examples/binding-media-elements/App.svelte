<script>
	let paused = true;
	let t = 0;
	let d;
	let bg;

	$: icon = `https://icon.now.sh/${paused ? 'play' : 'pause'}_circle_filled`;

	$: {
		const p = d ? t / d : 0;
		const h = 90 + 90 * p;
		const l = 10 + p * 30;
		bg = `hsl(${h},50%,${l}%)`;
	}

	function pad(num) {
		return num < 10 ? '0' + num : num;
	}

	const format = time => {
		if (isNaN(time)) return '--:--.-';
		const minutes = Math.floor(time / 60);
		const seconds = (time % 60).toFixed(1);

		return minutes + ':' + pad(seconds)
	};

	function seek(event) {
		if (event.buttons === 1) {
			event.preventDefault();
			const p = event.clientX / window.innerWidth;
			t = p * d;
		}
	}
</script>

<svelte:window on:click={seek} on:mousemove={seek}/>

<audio bind:currentTime={t} bind:duration={d} bind:paused>
	<source type="audio/mp3" src="https://deepnote.surge.sh/deepnote.mp3">
</audio>

<p>THX Deep Note</p>
<div class="status" on:click="{event => event.stopPropagation()}">
	<img alt="play/pause button" on:click="{() => paused = !paused}" src="{icon}/333333">
	<span class="elapsed">{format(t)}</span>
	<span class="duration">{format(d)}</span>
</div>

<div class="progress" style="width: {d ? 100 * t/d : 0}%; background: {bg};">
	<p>THX Deep Note</p>
	<div class="status" on:click="{event => event.stopPropagation()}">
		<img alt="play/pause button" src="{icon}/ffffff">
		<span class="elapsed">{format(t)}</span>
		<span class="duration">{format(d)}</span>
	</div>
</div>

<style>
	.progress {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		color: white;
		overflow: hidden;
		pointer-events: none;
	}

	p {
		position: absolute;
		left: 1em;
		top: 1em;
		width: 20em;
	}

	.status {
		position: absolute;
		bottom: 1em;
		left: 1em;
		width: calc(100vw - 2em);
	}

	img {
		position: absolute;
		left: 0;
		bottom: 2em;
		width: 3em;
		cursor: pointer;
	}

	.elapsed { float: left; }
	.duration { float: right; }
</style>
