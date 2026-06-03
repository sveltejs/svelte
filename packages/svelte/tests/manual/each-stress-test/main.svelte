<script lang="ts">
	import { tick } from 'svelte';

	const VALUES = Array.from('abcdefghijklmnopqrstuvwxyz');

	const presets = [
		// b is never destroyed
		[
			"ab",
			"",
			"a",
			"abc"
		],
		// the final state is 'abc', not 'cba'
		[
			"abc",
			"",
			"cba"
		],
		// the case in https://github.com/sveltejs/svelte/pull/17240
		[
			"abc",
			"adbc",
			"adebc"
		],
		[
			"ab",
			"a",
			"abc"
		],
		[
			"a",
			"bc",
			"bcd"
		],
		// add more presets by hitting 'party' and copying from the console
	];

	function shuffle() {
		const values = VALUES.slice();
		const number = Math.floor(Math.random() * VALUES.length);
		let shuffled = '';
		for (let i = 0; i < number; i++) {
			shuffled += (values.splice(Math.floor(Math.random() * (number - i)), 1))[0];
		}

		return shuffled;
	}

	function mark(node) {
		let prev = -1;

		return {
			duration: transition ? (slow ? 5000 : 500) : 0,
			tick(t) {
				const direction = t >= prev ? 'in' : 'out';
				node.style.color = direction === 'in' ? '' : 'grey';

				prev = t;
			}
		}
	}

	const record = [];

	const sleep = (ms = slow ? 1000 : 100) => new Promise((f) => setTimeout(f, ms));

	async function test(x: string) {
		console.group(JSON.stringify(x));
		error = null;

		list = x;
		record.push(list);
		if (transition) {
			await sleep();
		} else {
			await tick();
			await tick();
		}
		check('reconcile');

		n += 1;
		await tick();
		check('update');
		console.groupEnd();
	}

	function check(task: string) {
		const expected = list.split('').map((c) => `(${c}:${n})`).join('') || '(fallback)';

		const children = Array.from(container.children);
		const filtered = children.filter((span: HTMLElement) => !span.style.color);
		const received = filtered.map((span) => span.textContent).join('');

		if (expected !== received) {
			console.log('expected:', expected);
			console.log('received:', received);
			console.log(JSON.stringify(record, null, '  '));

			error = `failed to ${task}`;
			throw new Error(error);
		}
	}

	let list = $state('');
	let n = $state(0);
	let error = $state(null);
	let slow = $state(false);
	let transition = $state(true);
	let partying = $state(false);

	let container: HTMLElement;
</script>

<h1>each block stress test</h1>

<label>
	<input type="checkbox" bind:checked={transition} />
	transition
</label>

<label>
	<input type="checkbox" bind:checked={slow} />
	slow
</label>

<fieldset>
	<legend>random</legend>

	<button onclick={() => test(shuffle())}>test</button>
	<button onclick={async () => {
		if (partying) {
			partying = false;
		} else {
			partying = true;
			while (partying) await test(shuffle());
		}
	}}>{partying ? 'stop' : 'party'}</button>
</fieldset>

<fieldset>
	<legend>presets</legend>

	{#each presets as preset, index}
		<button onclick={async () => {
			for (let i = 0; i < preset.length; i += 1) {
				await test(preset[i]);
			}
		}}>{index + 1}</button>
	{/each}
</fieldset>

<form onsubmit={(e) => {
	e.preventDefault();
	test(e.currentTarget.querySelector('input').value);
}}>
	<fieldset>
		<legend>input</legend>
		<input />
	</fieldset>
</form>

<div id="output" bind:this={container}>
	{#each list as c (c)}
		<span transition:mark>({c}:{n})</span>
	{:else}
		<span transition:mark>(fallback)</span>
	{/each}
</div>

{#if error}
	<p class="error">{error}</p>
{/if}

<style>
	fieldset {
		display: flex;
		gap: 0.5em;
		border-radius: 0.5em;
		corner-shape: squircle;
		margin: 0 0 1em 0;
		padding: 0.2em 0.8em 0.8em;
	}

	legend {
		padding: 0.2em 0.5em;
		left: -0.2em;
		position: relative;
	}

	.error {
		color: red;
	}
</style>
