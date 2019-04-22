<script>
	import { afterUpdate } from 'svelte';
	import Icon from '../../components/Icon.svelte';

	export let sections = [];
	export let active_section = null;

	let ul;

	afterUpdate(() => {
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
	.examples-toc {
		overflow-y: auto;
		height: 100%;
		border-right: 1px solid var(--second);
		background-color: var(--second);
		color: white;
		padding: 3rem 3rem 0 3rem;
	}

	.examples-toc li {
		display: block;
		line-height: 1.2;
		margin: 0 0 4.8rem 0;
	}

	.section-title {
		display: block;
		padding: 0 0 .8rem 0;
		font: 400 var(--h6) var(--font);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-weight: 700;
	}

	.example-title {
		display: block;
		font-size: 1.6rem;
		font-family: var(--font);
		padding: 0 0 0.2em 0.6em;
	}

	.example-title:hover {
		color: var(--flash);
	}

	/* .active {
		font-weight: 600;
	} */

	a {
		display: flex;
		position: relative;
		color: white;
		border-bottom: none;
		padding: 0.2rem 3rem;
		margin: 0 -3rem;
		/* margin: 0.5em 0; */
		align-items: center;
		justify-content: start;
	}

	a:hover {
		color: var(--flash);
	}

	a.active {
		background: rgba(255, 255, 255, 0.1) calc(100% - 3rem) 50% no-repeat url(/icons/arrow-right.svg);
		background-size: 1em 1em;
		color: white;
	}

	.thumbnail {
		background-color: white;
		object-fit: contain;
		width: 5rem;
		height: 5rem;
		/* border: 1px solid #ccc; */
		border-radius: 2px;
		box-shadow: 1px 1px 3px rgba(0,0,0,0.13);
		margin: 0.2em 0.5em 0.2em 0;
	}
</style>

<ul bind:this={ul} class="examples-toc">
	{#each sections as section}
		<li>
			<span class="section-title">
				{section.title}
			</span>

			{#each section.examples as example}
				<a
					href="examples#{example.slug}"
					class="row"
					class:active="{example.slug === active_section}"
				>
					<img
						class="thumbnail"
						alt="{example.title} thumbnail"
						src="examples/thumbnails/{example.slug}.jpg"
					>

					<span>{example.title}</span>
						<!-- {#if example.slug === active_section}
						<Icon name="arrow-right" />
						{/if} -->
				</a>
			{/each}
		</li>
	{/each}
</ul>
