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

<ul bind:this={ul} class="examples-toc">
	{#each sections as section}
		<li>
			<span class="section-title">
				{section.title}
			</span>

			{#each section.examples as example}
			<a href="examples#{example.slug}">
				<div
					class="row"
					class:active="{example.slug === active_section}"
				>
					<div class="info">
						<div
							class="thumbnail"
							style="background-image: url(examples/thumbnails/{example.slug}.jpg)"
						></div>
						<div class="example-title">
							{example.title}
						</div>
					</div>
					{#if example.slug === active_section}
					<Icon name="arrow-right" />
					{/if}
				</div>
			</a>
			{/each}
		</li>
	{/each}
</ul>

<style>
	.examples-toc {
		overflow-y: auto;
		height: 100%;
		border-right: 1px solid var(--second);
		background-color: var(--second);
		color: white;
		padding: 2em 2em 0 2em;
	}

	.examples-toc li {
		display: block;
		line-height: 1.2;
		margin: 0 0 4.8rem 0;
	}

	a {
		position: relative;
		opacity: 0.7;
		transition: opacity 0.2s;
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
		opacity: 1
	}

	.active {
		opacity: 1;
		font-weight: 600;
	}

	.row {
		position: relative;
		margin: 0.5em 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.info {
		display: flex;
		align-items: center;
	}

	.thumbnail {
		background: white 50% 50% no-repeat;
		background-size: contain;
		width: 5rem;
		height: 5rem;
		border: 1px solid #ccc;
		border-radius: 2px;
		box-shadow: 1px 1px 3px rgba(0,0,0,0.13);
	}
</style>
