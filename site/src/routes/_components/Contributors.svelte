<script>
	import contributors from '../_contributors.js';
</script>

<style>
	#contributors {
		margin: 0.4em 0;
	}

	.contributor {
		width: 4.2em;
		height: 4.2em;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background: no-repeat url(/contributors.jpg);
		background-size: auto 102%;
		margin: 0 1.5em 1.5em 0;
		border: 2px solid var(--second);
	}
</style>

<div id="contributors">
	{#each contributors as contributor, i}
		<a
			class="contributor"
			style="background-position: {(100 * i) / (contributors.length - 1)}% 0"
			href="https://github.com/{contributor}">
			{contributor}
		</a>
	{/each}
</div>

<p>And so <a href="https://github.com/sveltejs/svelte/graphs/contributors">many more →</a></p>
