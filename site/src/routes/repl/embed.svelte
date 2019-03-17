<script context="module">
	export function preload({ query }) {
		return {
			version: query.version || 'beta',
			gist: query.gist,
			example: query.example
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { process_example } from './_utils/process_example.js';
	import Repl from '../../components/Repl/index.svelte';

	export let version, gist, example;

	let repl;
	let name = 'loading...';

	onMount(() => {
		if (version !== 'local') {
			fetch(`https://unpkg.com/svelte@${version}/package.json`)
				.then(r => r.json())
				.then(pkg => {
					version = pkg.version;
				});
		}

		if (gist) {
			fetch(`gist/${gist}`).then(r => r.json()).then(data => {
				const { id, description, files } = data;

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
</script>

<style>
	.repl-outer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--back);
		overflow: hidden;
		box-sizing: border-box;
		--pane-controls-h: 4.2rem;
	}
</style>

<svelte:head>
	<title>{name} • Svelte REPL</title>
</svelte:head>

<div class="repl-outer">
	{#if process.browser}
		<Repl bind:this={repl} {version} embedded={true}/>
	{/if}
</div>
