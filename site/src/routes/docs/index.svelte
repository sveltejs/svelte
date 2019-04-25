<script context="module">
	export async function preload() {
		const sections = await this.fetch(`docs.json`).then(r => r.json());
		return { sections };
	}
</script>

<script>
	import { onMount } from 'svelte';
	import GuideContents from './_GuideContents.svelte';
	import Icon from '../../components/Icon.svelte';
	import { getFragment } from '../../utils/navigation';

	export let sections;
	let active_section;

	let container;
	let aside;
	let show_contents = false;

	onMount(() => {
		// don't update `active_section` for headings above level 4, see _sections.js
		const anchors = container.querySelectorAll('[id]:not([data-scrollignore])');

		let positions;

		const onresize = () => {
			const { top } = container.getBoundingClientRect();
			positions = [].map.call(anchors, anchor => {
				return anchor.getBoundingClientRect().top - top;
			});
		}

		let last_id = getFragment();

		const onscroll = () => {
			const top = -window.scrollY;

			let i = anchors.length;
			while (i--) {
				if (positions[i] + top < 40) {
					const anchor = anchors[i];
					const { id } = anchor;

					if (id !== last_id) {
						active_section = id;
						last_id = id;
					}

					return;
				}
			}
		};

		window.addEventListener('scroll', onscroll, true);
		window.addEventListener('resize', onresize, true);

		// wait for fonts to load...
		const timeouts = [
			setTimeout(onresize, 1000),
			setTimeout(onscroll, 5000)
		];

		onresize();
		onscroll();

		return () => {
			window.removeEventListener('scroll', onscroll, true);
			window.removeEventListener('resize', onresize, true);

			timeouts.forEach(timeout => clearTimeout(timeout));
		};
	});
</script>

<style>
	aside {
		position: fixed;
		background-color: white;
		left: 0.8rem;
		bottom: 0.8rem;
		width: 2em;
		height: 2em;
		overflow: hidden;
		border: 1px solid #eee;
		box-shadow: 1px 1px 6px rgba(0,0,0,0.1);
		transition: width 0.2s, height 0.2s;
	}

	aside button {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 3.4rem;
		height: 3.4rem;
	}

	aside.open {
		width: calc(100vw - 3rem);
		height: calc(100vh - var(--nav-h));
	}

	aside.open::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: calc(100% - 2rem);
		height: 2em;
		background: linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,1) 100%);
		pointer-events: none;
		z-index: 2;
	}

	aside::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 1.9em;
		width: calc(100% - 2rem);
		height: 2em;
		background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,1) 100%);
		pointer-events: none;
	}

	.sidebar {
		position: absolute;
		font-family: var(--font);
		overflow-y: auto;
		width: 100%;
		height: 100%;
		padding: 4em 1.6rem 2em 3.2rem;
		bottom: 2em;
	}

	.content {
		width: 100%;
		margin: 0;
		padding: var(--top-offset) var(--side-nav);
		tab-size: 2;
		-moz-tab-size: 2;
	}

	@media (min-width: 832px) { /* can't use vars in @media :( */
		aside {
			display: block;
			width: var(--sidebar-w);
			height: 100vh;
			top: 0;
			left: 0;
			overflow: hidden;
			box-shadow: none;
			border: none;
			overflow: hidden;
			background-color: var(--second);
			color: white;
		}

		aside.open::before {
			display: none;
		}

		aside::after {
			content: '';
			bottom: 0;
			height: var(--top-offset);
			background: linear-gradient(to bottom, rgba(103,103,120,0) 0%, rgba(103,103,120,0.7) 50%, rgba(103,103,120,1) 100%);
		}

		aside button {
			display: none;
		}

		.sidebar {
			padding: var(--top-offset) 0 6.4rem 3.2rem;
			font-family: var(--font);
			overflow-y: auto;
			height: 100%;
			bottom: auto;
			width: 100%;
		}

		.content {
			padding-left: calc(var(--sidebar-w) + var(--side-nav));
		}

		.content :global(.side-by-side) {
			display: grid;
			grid-template-columns: calc(50% - 0.5em) calc(50% - 0.5em);
			grid-gap: 1em;
		}
	}

	.content h2 {
		margin-top: 8rem;
		padding: 2rem 1.6rem 4rem 0.2rem;
		border-top: var(--border-w) solid #6767785b; /* based on --second */
		color: var(--text);
		line-height: 1;
		font-size: var(--h3);
		letter-spacing: .05em;
		text-transform: uppercase;
	}

	.content section:first-of-type > h2 {
		margin-top: 0;
	}

	.content :global(h4) {
		margin: 2em 0 1em 0;
	}

	.content :global(.offset-anchor) {
		position: relative;
		display: block;
		top: calc(-1 * (var(--nav-h) + var(--top-offset) - 1rem));
		width: 0;
		height: 0;
	}

	.content :global(.anchor) {
		position: absolute;
		display: block;
		background: url(/icons/link.svg) 0 50% no-repeat;
		background-size: 1em 1em;
		width: 1.4em;
		height: 1em;
		left: -1.3em;
		opacity: 0;
		transition: opacity 0.2s;
		border: none !important; /* TODO get rid of linkify */
	}

	@media (min-width: 768px) {
		.content :global(h2):hover :global(.anchor),
		.content :global(h3):hover :global(.anchor),
		.content :global(h4):hover :global(.anchor),
		.content :global(h5):hover :global(.anchor),
		.content :global(h6):hover :global(.anchor) {
			opacity: 1;
		}

		.content :global(h5) :global(.anchor),
		.content :global(h6) :global(.anchor) {
			top: 0.5em;
		}
	}

	.content :global(h3),
	.content :global(h3 > code) {
		margin: 6.4rem 0 0 0;
		padding: 2rem 1.6rem 5.6rem .2rem;
		color: var(--text);
		border-top: var(--border-w) solid #6767781f; /* based on --second */
		background: transparent;
		line-height: 1;
	}

	.content :global(h3):first-of-type {
		border: none;
		margin: 0;
	}

	/* avoid doubled border-top */
	.content :global(h3 > code) {
		border-radius: 0 0 0 0;
		border: none;
		font-size: var(--h4);
		line-height: 1.2;
	}


	.content :global(h4),
	.content :global(h4 > code) {
		font-weight: 600;
		font-size: var(--h4);
		color: var(--second);
		margin: 6.4rem 0 1.6rem 0;
		padding-left: 0;
		background: transparent;
		line-height: 1;
		padding: 0;
	}

	.content :global(h5) {
		font-size: 2rem;
	}

	.content :global(code) {
		padding: .3rem .8rem .3rem;
		margin: 0 0.2rem;
		top: -.1rem;
		background: var(--back-api);
	}

	.content :global(pre) :global(code) {
		padding: 0;
		margin: 0;
		top: 0;
		background: transparent;
	}

	.content :global(pre) {
		margin: 0 0 2em 0;
	}

	.content :global(.icon) {
		width: 2rem;
		height: 2rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.content :global(table) {
		margin: 0 0 2em 0;
	}

	section > :global(.code-block) > :global(pre) {
		display: inline-block;
		background: var(--back-api);
		color: white;
		padding: .3rem .8rem;
		margin: 0;
		max-width: 100%;
	}

	section > :global(.code-block)> :global(pre.language-markup) {
		padding: .3rem .8rem .2rem;
		background: var(--back-api);
	}

	section > :global(p) {
		max-width: var(--linemax)
	}

	small {
		font-size: var(--h5);
		float: right;
		pointer-events: all;
		color: var(--prime);
		cursor: pointer;
	}

	/* no linkify on these */
	small a        { all: unset }
	small a:before { all: unset }

	section :global(blockquote) {
		color: hsl(204, 100%, 50%);
		border: 2px solid var(--flash);
	}

	section :global(blockquote) :global(code) {
		background: hsl(204, 100%, 95%) !important;
		color: hsl(204, 100%, 50%);
	}
</style>

<svelte:head>
	<title>API Docs • Svelte</title>

	<meta name="twitter:title" content="Svelte API docs">
	<meta name="twitter:description" content="Cybernetically enhanced web apps">
	<meta name="Description" content="Cybernetically enhanced web apps">
</svelte:head>

<div bind:this={container} class='content listify'>
	{#each sections as section}
		<section data-id={section.slug}>
			<h2>
				<span class="offset-anchor" id={section.slug}></span>
				<a href="docs#{section.slug}" class="anchor" aria-hidden></a>

				{section.metadata.title}
				<small>
					<a href='https://github.com/sveltejs/svelte/edit/master/site/content/docs/{section.file}' title='edit this section'>
						<Icon name='edit' /></a>
				</small>
			</h2>

			{@html section.html}
		</section>
	{/each}
</div>

<aside bind:this={aside} class="sidebar-container" class:open={show_contents}>
	<div class="sidebar" on:click="{() => show_contents = false}"> <!-- scroll container -->
		<GuideContents {sections} {active_section} {show_contents} />
	</div>

	<button on:click="{() => show_contents = !show_contents}">
		<Icon name="{show_contents? 'close' : 'menu'}"/>
	</button>
</aside>
