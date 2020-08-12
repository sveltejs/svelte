<script>
	import Repl from '@sveltejs/svelte-repl';
	import { onMount } from 'svelte';

	import { process_example } from '../../utils/examples';
	import InputOutputToggle from './InputOutputToggle.svelte';

	export let version = '3';
	export let gist = null;
	export let example = null;
	export let embedded = false;

	let repl;
	let name = 'loading...';
	let width = process.browser
		? window.innerWidth - 32
		: 1000;

	let checked = false;

	onMount(() => {
		if (version !== 'local') {
			fetch(`https://unpkg.com/svelte@${version}/package.json`)
				.then(r => r.json())
				.then(pkg => {
					version = pkg.version;
				});
		}

		if (gist) {
			fetch(`repl/${gist}.json`).then(r => r.json()).then(data => {
				const { description, files } = data;

				name = description;

				const components = Object.keys(files)
					.map(file => {
						const dot = file.lastIndexOf('.');
						if (!~dot) return;

						const source = files[file].content;

						return {
							name: file.slice(0, dot),
							type: file.slice(dot + 1),
							source
						};
					})
					.filter(x => x.type === 'svelte' || x.type === 'js')
					.sort((a, b) => {
						if (a.name === 'App' && a.type === 'svelte') return -1;
						if (b.name === 'App' && b.type === 'svelte') return 1;

						if (a.type !== b.type) return a.type === 'svelte' ? -1 : 1;

						return a.name < b.name ? -1 : 1;
					});

				repl.set({ components });
			});
		} else if (example) {
			fetch(`examples/${example}.json`).then(async response => {
				if (response.ok) {
					const data = await response.json();

					repl.set({
						components: process_example(data.files)
					});
				}
			});
		}
	});

	$: if (embedded) document.title = `${name} • Svelte REPL`;

	$: svelteUrl = process.browser && version === 'local' ?
		`${location.origin}/repl/local` :
		`https://unpkg.com/svelte@${version}`;

	const rollupUrl = `https://unpkg.com/rollup@1/dist/rollup.browser.js`;

	$: mobile = width < 560;
</script>

<style>
	.repl-outer {
		position: relative;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: var(--back);
		overflow: hidden;
		box-sizing: border-box;
		--pane-controls-h: 4.2rem;
	}

	.viewport {
		width: 100%;
		height: 100%;
		flex: 1;
	}

	.mobile .viewport {
		width: 200%;
		height: calc(100% - 42px);
		transition: transform 0.3s;
	}

	.mobile .offset {
		transform: translate(-50%, 0);
	}
</style>

<div class="repl-outer" bind:clientWidth={width} class:mobile>
	<div class="viewport" class:offset={checked}>
		{#if process.browser}
			<Repl
				bind:this={repl}
				workersUrl="workers"
				fixed={mobile}
				{svelteUrl}
				{rollupUrl}
				embedded
				relaxed
			/>
		{/if}
	</div>

	{#if mobile}
		<InputOutputToggle bind:checked/>
	{/if}
</div>
