<script>
	import { getContext } from 'svelte';

	const { navigate } = getContext('REPL');

	export let kind;
	export let details = null;
	export let filename = null;

	function message(details) {
		let str = details.message || '[missing message]';

		let loc = [];

		if (details.filename && details.filename !== filename) {
			loc.push(details.filename);
		}

		if (details.start) loc.push(details.start.line, details.start.column);

		return str + (loc.length ? ` (${loc.join(':')})` : ``);
	};
</script>

<style>
	.message {
		position: relative;
		color: white;
		padding: 1.2rem 1.6rem 1.2rem 4.4rem;
		font: 400 1.2rem/1.7 var(--font);
		margin: 0;
		border-top: 1px solid white;
	}

	.navigable {
		cursor: pointer;
	}

	.message::before {
		content: '!';
		position: absolute;
		left: 1.2rem;
		top: 1.1rem;
		width: 1rem;
		height: 1rem;
		text-align: center;
		line-height: 1;
		padding: .4rem;
		border-radius: 50%;
		color: white;
		border: .2rem solid white;
	}

	p {
		margin: 0;
	}

	.info {
		background-color: var(--second);
	}

	.error {
		background-color: #da106e;
	}

	.warning {
		background-color: #e47e0a;
	}
</style>

<div class="message {kind}">
	{#if details}
		<p
			class:navigable={details.filename}
			on:click="{() => navigate(details)}"
		>{message(details)}</p>
	{:else}
		<slot></slot>
	{/if}
</div>