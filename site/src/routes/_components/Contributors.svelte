<script>
	import contributors from '../_contributors.js';
</script>

<style>
	.contributor {
		width: 2.4em;
		height: 2.4em;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background: no-repeat url(/contributors.jpg);
		background-size: auto 102%;
		margin: 0 0.5em 0.5em 0;
		border: 2px solid var(--second);
	}
</style>

{#each contributors as contributor, i}
	<a
		class="contributor"
		style="background-position: {(100 * i) / (contributors.length - 1)}% 0"
		href="https://github.com/{contributor}">
		{contributor}
	</a>
{/each}
