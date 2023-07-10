<script>
	import { browser } from '$app/environment';
	import { process_example } from '$lib/utils/examples';
	import Repl from '@sveltejs/repl';
	import { theme } from '@sveltejs/site-kit/stores';
	import { onMount } from 'svelte';

	export let version = '4';
	export let gist = null;
	export let example = null;
	export let embedded = false;

	/** @type {import('@sveltejs/repl').default} */
	let repl;
	let name = 'loading...';

	let mounted = false;

	async function load(gist, example) {
		if (version !== 'local') {
			fetch(`https://unpkg.com/svelte@${version}/package.json`)
				.then((r) => r.json())
				.then((pkg) => {
					version = pkg.version;
				});
		}

		if (gist) {
			fetch(`/repl/api/${gist}.json`)
				.then((r) => r.json())
				.then((data) => {
					const { description, components } = data;

					name = description;

					const files = Object.keys(components)
						.map((file) => {
							const dot = file.lastIndexOf('.');
							if (!~dot) return;

							const source = components[file].content;

							return {
								name: file.slice(0, dot),
								type: file.slice(dot + 1),
								source
							};
						})
						.filter((x) => x.type === 'svelte' || x.type === 'js')
						.sort((a, b) => {
							if (a.name === 'App' && a.type === 'svelte') return -1;
							if (b.name === 'App' && b.type === 'svelte') return 1;

							if (a.type !== b.type) return a.type === 'svelte' ? -1 : 1;

							return a.name < b.name ? -1 : 1;
						});

					repl.set({ files });
				});
		} else if (example) {
			const files = process_example(
				(await fetch(`/examples/api/${example}.json`).then((r) => r.json())).files
			);

			repl.set({
				files
			});
		}
	}

	onMount(() => {
		mounted = true;
	});

	$: if (mounted) load(gist, example);

	$: if (embedded) document.title = `${name} • Svelte REPL`;

	$: svelteUrl =
		browser && version === 'local'
			? `${location.origin}/repl/local`
			: `https://unpkg.com/svelte@${version}`;
</script>

{#if browser}
	<Repl
		bind:this={repl}
		autocomplete={embedded}
		{svelteUrl}
		embedded
		relaxed
		previewTheme={$theme.current}
	/>
{/if}
