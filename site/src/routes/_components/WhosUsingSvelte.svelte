<script>
	import { companies } from './WhosUsingSvelte.js';
	const randomizer = ({ prominent }) => Math.random();
	const doSort = (a, b) => randomizer(b) - randomizer(a);
	const sortedCompanies = companies.sort(doSort);
</script>

<div class="logos">
	{#each sortedCompanies as { href, filename, alt, style, picture, span }, index}
		<a target="_blank" rel="noopener" {href} style={style || ""}>
			{#if picture}
				<picture>
					{#each picture as { type, srcset }}
						<source {type} {srcset} />
					{/each}
					<img src="/whos-using-svelte/{filename}" {alt} loading="lazy" />
				</picture>
			{:else}
				<img src="/whos-using-svelte/{filename}" {alt} loading="lazy" />
				{#if span}
					<span>{span}</span>
				{/if}
			{/if}
		</a>
	{/each}
</div>

<style>
	.logos {
		margin: 1em 0 0 0;
		display: flex;
		flex-wrap: wrap;
	}
	a {
		height: 40px;
		margin: 0 0.5em 0.5em 0;
		display: flex;
		align-items: center;
		border: 2px solid var(--second);
		padding: 0;
		border-radius: 20px;
		color: var(--text);
	}
	picture,
	img {
		height: 100%;
		padding: 5px 10px;
		transition: transform 0.2s;
	}
	picture:hover,
	img:hover {
		transform: scale(1.2);
	}
	@media (min-width: 540px) {
		a {
			height: 60px;
			border-radius: 30px;
		}

		picture,
		img {
			padding: 10px 20px;
		}
	}
</style>
