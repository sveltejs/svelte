<script>
	import { onMount } from 'svelte';
	import { Icon } from '@sveltejs/site-kit';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let query = ``;

	let input;

	onMount(() => {
		input.focus();
	})
</script>

<div class="over">
	<label>
		<Icon name="github" />
		<div class="input-wrapper">
			<input bind:this={input} type="text" bind:value={query} />
		</div>
		<span class="reset" class:active={query.length} on:click={() => query = ``}>
			<Icon name="close" />
		</span>
	</label>
	<button class="back" on:click={() => dispatch('close')}>
		<Icon name="arrow-right"/>
	</button>
</div>

<style>
	.over {
		padding: 30px 20px;
	}
	.input-wrapper {
		margin: 0 5px;
		display: inline-block;
		width: calc(100% - 105px);
	}
	input {
		outline: none;
		border: none;
		font-size: 16px;
		display: block;
		width: 100%;
	}
	.reset {
		transition: opacity 300ms;
		cursor: pointer;
		visibility: hidden;
		opacity: 0;
	}
	.reset.active {
		opacity: 0.4;
		visibility: visible;
	}
	.reset:hover {
		opacity: 0.6;
	}
	.back {
		border: none;
		background: rgba(0, 0, 0, 0);
		padding: 0;
		padding-left: 20px;
		transition: color 200ms;
	}
	.back:hover {
		color: var(--flash);
	}
</style>
