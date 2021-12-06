<script>
	import donors from '../_donors.js';
</script>

<style>
	#donors {
		margin: 0.4em 0;
	}

	.donor {
		width: 4.2em;
		height: 4.2em;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background: no-repeat url(/donors.jpg);
		background-size: auto 102%;
		margin: 0 1.5em 1.5em 0;
		border: 2px solid var(--second);
	}
</style>

<div id="donors">
	{#each donors as donor, i}
		<a
			class="donor"
			style="background-position: {(100 * i) / (donors.length - 1)}% 0"
			alt="{donor}"
			href="https://opencollective.com/svelte">
			{donor}
		</a>
	{/each}
</div>

<p>And so <a href="https://opencollective.com/svelte">many more →</a></p>
