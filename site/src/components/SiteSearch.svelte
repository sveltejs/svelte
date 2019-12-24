<script context="module">
	let orderedSections = null;

	async function getSections() {
		const res = await fetch('/docs.json');
		const rawSections = await res.json();

		const sections = rawSections.map(section => ({
			level: 1,
			slug: section.slug,
			title: section.metadata.title,
			bareTitle: removeFormatting(section.metadata.title),
		}));

		rawSections.forEach(({ subsections }) => {
			sections.push(
				...subsections.map(subsection => ({
					...subsection,
					bareTitle: removeFormatting(subsection.title)
				})),
			);
		})

		orderedSections = sections.sort((a, b) => a.level - b.level);
	}

	function removeFormatting(title) {
		return title
			.replace(/&lt;/g, `<`)
			.replace(/&gt;/g, `>`)
			.replace(/<\/?em>/g, ``)
			.replace(/&quot;/g, `"`)
	}

	function doesMatch(a, b) {
		return ~a.indexOf(b) || ~b.indexOf(a);
	}

	function search(query) {
		return orderedSections.filter(section => doesMatch(section.bareTitle, query))
	}
</script>

<script>
	import { writable } from 'svelte/store';
	import { fade, fly} from 'svelte/transition';
	import SearchBar from './SearchBar.svelte';
	import { onMount } from 'svelte';

	export let showing = false;
	let query = '';
	let loading = true;
	let error = null;

	onMount(async () => {
		const gotResults = await tryLoad(3);
		if (gotResults) error = null;

		loading = false;
	});

	async function tryLoad(maxTimes) {
		let got = false;

		for	(let i = 0; i < maxTimes; i++) {
			try {
				await getSections();

				if (orderedSections) {
					got = true;
					break;
				}
			} catch (e) {
				error = e;
			}
		}

		return got;
	}

	$: results = (loading || error || !query.length) ? [] : search(query);
</script>

{#if showing}
	<div class="cover background" on:click={() => showing = false} transition:fade></div>
	<div class="cover search" transition:fly={{x: 400}}>
		<SearchBar bind:query on:close={() => showing = false} />
		<div class="divider" />
		{#if results.length}
			reuslts
		{:else}
			<img src="/icons/svelte-search.svg" alt="Search Icon">
		{/if}

		{#if loading}
			<p class="message">Loading...</p>
		{:else if error}
			<p class="message">
				<span class="error">{error && error.message}</span>
			</p>
			<p>If the error persists, please drop by <a href="/chat">Discord chatroom</a> and let us know, or raise an issue on <a href="https://github.com/sveltejs/svelte">GitHub</a>. Thanks!</p>
		{:else if query.length && !results.length}
			<p class="message">Couldn't find any results for "{query}"</p>
		{/if}
	</div>
{/if}

<style>
	.cover {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		z-index: 100;
	}
	.background {
		background: rgba(0, 0, 0, 0.6);
	}
	.search {
		left:unset;
		width: 385px;
		background: var(--back);
	}
	.divider {
		height: 0.5px;
		background: rgba(0, 0, 0, 0.1);
	}
	img {
		width: 150px;
		height: 150px;
		display: block;
		margin: calc(50vh - 160px) auto 0 auto;
	}
	p {
		font-size: 14px;
		text-align: center;
		padding: 0 16px;
	}
	.message {
		font-weight: bold;
	}
	.error {
		color: white;
		padding: 10px;
		background: #da106e;
	}
</style>
