<script>
	import { createEventDispatcher } from 'svelte';

	export let current_ease;
	export let current_type;
	export let eases;
	export let types;
	export let duration;
	export let playing;
	export let width;

	const dispatch = createEventDispatcher();

	$: mobile = width && width < 600;
</script>

<div class="easing-sidebar">
	<div class="easing-types">
		<h3>Ease</h3>
		{#if mobile}
			<select bind:value={current_ease}>
				{#each [...eases] as [name]}
					<option value={name} class:selected={name === current_ease}>
						{name}
					</option>
				{/each}
			</select>
		{:else}
			<ul>
				{#each [...eases] as [name]}
					<li class:selected={name === current_ease}>
						<button on:click={() => (current_ease = name)}> {name}</button>
					</li>
				{/each}
			</ul>
		{/if}
		<h3>Type</h3>
		{#if mobile}
			<select bind:value={current_type}>
				{#each types as [name, type]}
					<option value={type}>
						{name}
					</option>
				{/each}
			</select>
		{:else}
			<ul>
				{#each types as [name, type]}
					<li class:selected={type === current_type}>
						<button on:click={() => (current_type = type)}> {name}</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<h4>Duration</h4>
	<div class="duration">
		<span>
			<input type="number" bind:value={duration} min="0" step="100" />
			<button class="number" on:click={() => (duration -= 100)}>-</button>
			<button class="number" on:click={() => (duration += 100)}>+</button>
		</span>
		<button class="play" on:click={() => dispatch('play')}>
			{playing ? 'Restart' : 'Play'}
		</button>
	</div>
</div>

<style>
	.easing-sidebar {
		width: 11em;
	}

	ul {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		font-size: 18px;
	}

	li {
		padding: 5px 10px;
		background: #eee;
		border-radius: 2px;
		margin: 3px 0;
		cursor: pointer;
	}

	li:hover {
		background: #676778;
		color: white;
	}

	.selected {
		background: #ff3e00;
		color: white;
	}

	h3 {
		margin: 0 10px 0 0;
	}

	h4 {
		margin-bottom: 0;
	}

	select {
		display: inline;
		padding: 0.2em;
		margin: 0;
	}

	.duration {
		width: 100%;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.duration span {
		display: flex;
	}

	.duration input {
		width: 80px;
		margin: 10px 10px 10px 0;
	}

	.duration button {
		margin: 10px 5px;
	}

	.duration .number {
		width: 30px;
	}

	.duration .play {
		margin: 0 5px 0 auto;
		width: 100%;
	}

	@media (max-width: 600px) {
		.easing-types {
			display: flex;
			align-items: center;
			margin-top: 10px;
		}

		.easing-sidebar {
			width: 100%;
		}

		.duration .play {
			margin-left: auto;
			width: unset;
		}

		h3 {
			font-size: 0.9em;
			display: inline;
		}

		h3:nth-of-type(2) {
			margin-left: auto;
		}

		ul li {
			margin-right: 10px;
		}
	}
</style>
