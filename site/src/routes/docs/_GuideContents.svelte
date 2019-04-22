<script>
	import { onMount, afterUpdate } from 'svelte';
	import Icon from '../../components/Icon.svelte';

	export let sections = [];
	export let active_section = null;
	export let show_contents;
	export let prevent_sidebar_scroll = false;

	let ul;

	afterUpdate(() => {
		// bit of a hack — prevent sidebar scrolling if
		// TOC is open on mobile, or scroll came from within sidebar
		if (prevent_sidebar_scroll || show_contents && window.innerWidth < 832) return;

		const active = ul.querySelector('.active');

		if (active) {
			const { top, bottom } = active.getBoundingClientRect();

			const min = 200;
			const max = window.innerHeight - 200;

			if (top > max) {
				ul.parentNode.scrollBy({
					top: top - max,
					left: 0,
					behavior: 'smooth'
				});
			} else if (bottom < min) {
				ul.parentNode.scrollBy({
					top: bottom - min,
					left: 0,
					behavior: 'smooth'
				});
			}
		}
	});
</script>

<style>
	.reference-toc li {
		display: block;
		line-height: 1.2;
		margin: 0 0 4rem 0;
	}

	a {
		position: relative;
		opacity: 0.75;
		transition: opacity 0.2s;
		border-bottom: none;
		padding: 0;
		color: white;
	}

	.section {
		display: block;
		padding: 0 0 .8rem 0;
		font-size: var(--h6);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 600;
	}

	.subsection {
		display: block;
		font-size: 1.6rem;
		font-family: var(--font);
		padding: 0 0 0.6em 0;
	}

	.section:hover,
	.subsection:hover {
		color: var(--flash);
		opacity: 1
	}

	.subsection[data-level="4"] {
		padding-left: 1.2rem;
	}

	.active { opacity: 1 }

	.icon-container {
		position: absolute;
		top: -.2rem;
		right: 2.4rem;
	}
</style>

<ul
	bind:this={ul}
	class="reference-toc"
	on:mouseenter="{() => prevent_sidebar_scroll = true}"
	on:mouseleave="{() => prevent_sidebar_scroll = false}"
>
	{#each sections as section}
		<li>
			<a class="section" class:active="{section.slug === active_section}" href="docs#{section.slug}">
				{section.metadata.title}

				{#if section.slug === active_section}
					<div class="icon-container">
						<Icon name="arrow-right" />
					</div>
				{/if}
			</a>

			{#each section.subsections as subsection}
				<!-- see <script> below: on:click='scrollTo(event, subsection.slug)' -->
				<a
					class="subsection"
					class:active="{subsection.slug === active_section}"
					href="docs#{subsection.slug}"
					data-level="{subsection.level}"
				>
					{subsection.title}

					{#if subsection.slug === active_section}
						<div class="icon-container">
							<Icon name="arrow-right" />
						</div>
					{/if}
				</a>
			{/each}
		</li>
	{/each}
</ul>
