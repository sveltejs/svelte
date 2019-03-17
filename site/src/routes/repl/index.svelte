<script context="module">
	export function preload({ query }) {
		return {
			version: query.version || 'beta',
			gist_id: query.gist,
			example: query.example || 'hello-world'
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { locate } from 'locate-character';
	import { process_example } from './_utils/process_example.js';
	import AppControls from './_components/AppControls/index.svelte';
	import Repl from '../../components/Repl/index.svelte';

	export let version, example, gist_id;

	console.log({ example });

	let repl;
	let gist;
	let name = 'loading...';
	let zen_mode = false;

	$: if (typeof history !== 'undefined') {
		const params = [];

		if (version !== 'latest') params.push(`version=${version}`);
		if (gist_id) params.push(`gist=${gist_id}`);
		else if (example) params.push(`example=${example}`);

		const url = params.length > 0
			? `repl?${params.join('&')}`
			: 'repl';

		history.replaceState({}, 'x', url);
	}

	onMount(() => {
		if (version !== 'local') {
			fetch(`https://unpkg.com/svelte@${version || 'beta'}/package.json`)
				.then(r => r.json())
				.then(pkg => {
					version = pkg.version;
				});
		}

		if (gist_id) {
			fetch(`gist/${gist_id}`).then(r => r.json()).then(data => {
				gist = data;
				const { id, description, files } = data;

				name = description;

				const components = Object.keys(files)
					.map(file => {
						const dot = file.lastIndexOf('.');
						if (!~dot) return;

						const source = files[file].content;

						let type = file.slice(dot + 1);
						if (type === 'html') type = 'svelte';

						return {
							name: file.slice(0, dot),
							type,
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
		}
	});

	function load_example(slug) {
		console.log(`loading ${slug}`);

		fetch(`examples/${slug}.json`).then(async response => {
			if (response.ok) {
				const data = await response.json();

				name = data.title;

				const components = process_example(data.files);
				repl.set({ components });

				gist = null;
			}
		});
	}

	function handle_fork(event) {
		example = null;
		gist = event.detail.gist;
		gist_id = gist.id;
	}

	$: if (process.browser && example) {
		load_example(example);
	}
</script>

<style>
	.repl-outer {
		position: relative;
		height: calc(100vh - var(--nav-h));
		--app-controls-h: 5.6rem;
		--pane-controls-h: 4.2rem;
		overflow: hidden;
		background-color: var(--back);
		padding: var(--app-controls-h) 0 0 0;
		margin: 0 calc(var(--side-nav) * -1);
		box-sizing: border-box;
	}

	.zen-mode {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		z-index: 11;
	}

	.pane { width: 100%; height: 100% }

	.loading {
		text-align: center;
		color: var(--second);
		font-weight: 400;
		margin: 2em 0 0 0;
		opacity: 0;
		animation: fade-in .4s;
		animation-delay: .2s;
		animation-fill-mode: both;
	}

	@keyframes fade-in {
		0%   { opacity: 0 }
		100% { opacity: 1 }
	}

	.input {
		padding: 2.4em 0 0 0;
	}
</style>

<svelte:head>
	<title>Svelte REPL</title>
</svelte:head>

<div class="repl-outer {zen_mode ? 'zen-mode' : ''}">
	<AppControls
		{name}
		{gist}
		{repl}
		bind:zen_mode
		on:forked={handle_fork}
	/>

	{#if process.browser}
		<Repl bind:this={repl} {version}/>
	{/if}
</div>
