<script>
	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { afterUpdate, onMount } from 'svelte';

	/** @type {import('./$types').PageData['page']} */
	export let details;

	/** @type {string} */
	let hash = '';

	/** @type {number} */
	let height = 0;

	/** @type {HTMLElement} */
	let content;

	/** @type {NodeListOf<HTMLElement>} */
	let headings;

	/** @type {number[]} */
	let positions = [];

	/** @type {HTMLElement} */
	let container_el;

	let show_contents = false;

	let glider_index = 0;

	onMount(async () => {
		await document.fonts.ready;

		update();
		highlight();
	});

	afterNavigate(() => {
		update();
		highlight();
	});

	function update() {
		content = document.querySelector('.content');
		const { top } = content.getBoundingClientRect();

		headings = content.querySelectorAll('h2[id]');

		positions = Array.from(headings).map((heading) => {
			const style = getComputedStyle(heading);
			return heading.getBoundingClientRect().top - parseFloat(style.scrollMarginTop) - top;
		});

		height = window.innerHeight;
	}

	function highlight() {
		const { top, bottom } = content.getBoundingClientRect();
		let i = headings.length;

		while (i--) {
			if (bottom - height < 50 || positions[i] + top < 100) {
				const heading = headings[i];
				hash = `#${heading.id}`;
				return;
			}
		}

		hash = '';
	}

	/** @param {URL} url */
	function select(url) {
		// belt...
		setTimeout(() => {
			hash = url.hash;
		});

		// ...and braces
		window.addEventListener(
			'scroll',
			() => {
				hash = url.hash;
			},
			{ once: true }
		);
	}

	$: glider_index = details.sections.findIndex(({ slug }) => hash.replace('#', '') === slug);

	afterUpdate(() => {
		// bit of a hack — prevent sidebar scrolling if
		// TOC is open on mobile, or scroll came from within sidebar
		if (show_contents && window.innerWidth < 832) return;

		const active = container_el.querySelector('.active');

		if (active) {
			const { top, bottom } = active.getBoundingClientRect();

			const min = 200;
			const max = window.innerHeight - 200;

			if (top > max) {
				container_el.scrollBy({
					top: top - max,
					left: 0,
					behavior: 'smooth',
				});
			} else if (bottom < min) {
				container_el.scrollBy({
					top: bottom - min,
					left: 0,
					behavior: 'smooth',
				});
			}
		}
	});
</script>

<svelte:window on:scroll={highlight} on:resize={update} on:hashchange={() => select($page.url)} />

<aside class="on-this-page" bind:this={container_el}>
	<h2>On this page</h2>
	<nav>
		<ul>
			<li><a href="{base}/docs/{details.slug}" class:active={hash === ''}>{details.title}</a></li>
			{#each details.sections as { title, slug }}
				<li><a href={`#${slug}`} class:active={`#${slug}` === hash}>{title}</a></li>
			{/each}
			<div class="glider" style:transform="translateY({(glider_index + 1) * 100}%)" />
		</ul>
	</nav>
</aside>

<style>
	.on-this-page {
		display: var(--on-this-page-display);
		position: fixed;
		padding: 0 var(--sk-page-padding-side) 0 0;
		margin-right: var(--sk-page-padding-side);
		width: min(280px, calc(var(--sidebar-width) - var(--sk-page-padding-side)));
		height: calc(100% - var(--sk-nav-height));
		overflow-y: auto;
		top: var(--sk-nav-height);
		left: calc(99vw - (var(--sidebar-width)));
	}

	h2 {
		text-transform: uppercase;
		font-size: 1.4rem !important;
		font-weight: 400;
		margin: 0 0 1rem 0 !important;
		padding: 0 0 0 0.6rem;
		color: var(--sk-text-3);
	}

	ul {
		position: relative;
		list-style: none;
	}

	a {
		display: block;
		padding: 0.3rem 0.5rem;
		color: var(--sk-text-3);
		font-size: 1.6rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	a:hover {
		text-decoration: none;
		background: var(--sk-back-3);
	}

	.glider {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -1;
		width: 100%;
		height: 30px;
		background: var(--sk-back-3);
		border-left: 2px solid transparent;
		border-left-color: var(--sk-theme-1);
		transition: transform 0.15s ease-out;
	}
</style>
