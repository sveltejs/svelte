<script>
	import { onMount, afterUpdate } from 'svelte';
	import Icon from '../../components/Icon.svelte';

	export let sections = [];
	export let active_section = null;
	export let show_contents;
	export let prevent_sidebar_scroll = false;

	onMount(() => {
		//	------------------------------------------
		//	TODO – smooth-scroll
		//	must be something that makes more sense
		//	this one is too annoying (area too tall)
		//	maybe svelte-transitions are a solution?
		//	unfortunately I have no idea how. For now.
		//	------------------------------------------
		// methods: {
		// 	scrollTo(e, item) {
		// 		e.preventDefault();
		// 		let top = document.querySelector('#' + item).getBoundingClientRect().top;
		// 		window.scrollTo({
		// 			top,
		// 			behavior: "smooth"
		// 		});
		// 	}
		// },

		const onhashchange = _ => {
			// TODO wire this up
			// this.store.set({active_section: window.location.hash.slice(1) });
		};

		window.addEventListener('hashchange', onhashchange, false);
		onhashchange();

		return () => {
			window.removeEventListener('hashchange', onhashchange, false);
		};
	});

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
	.guide-toc li {
		display: block;
		line-height: 1.2;
		margin: 0 0 4.8rem 0;
	}

	.section {
		display: block;
		padding: 0 0 .8rem 0;
		font: 400 var(--h6) var(--font);
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.subsection {
		display: block;
		font-size: 1.6rem;
		font-family: var(--font);
		padding: 0.3em 0;
	}

	.section:hover,
	.subsection:hover { color: var(--flash) }
	.active           { color: var(--prime) }
</style>

<ul
	bind:this={ul}
	class="guide-toc"
	on:mouseenter="{() => prevent_sidebar_scroll = true}"
	on:mouseleave="{() => prevent_sidebar_scroll = false}"
>
	{#each sections as section}
		<li>
			<a class="section" class:active="{section.slug === active_section}" href="docs#{section.slug}">
				{section.metadata.title}

				{#if section.slug === active_section}
					<Icon name="arrow-right" />
				{/if}
			</a>

			{#each section.subsections as subsection}
				<!-- see <script> below: on:click='scrollTo(event, subsection.slug)' -->
				<a class="subsection" class:active="{subsection.slug === active_section}" href="docs#{subsection.slug}">
					{subsection.title}

					{#if subsection.slug === active_section}
						<Icon name="arrow-right" />
					{/if}
				</a>
			{/each}
		</li>
	{/each}
</ul>