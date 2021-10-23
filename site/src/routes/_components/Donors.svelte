<script>
	import donors from '../_donors.js';
</script>

<style>
	.donor {
		width: 2.4em;
		height: 2.4em;
		border-radius: 50%;
		text-indent: -9999px;
		display: inline-block;
		background: no-repeat url(/donors.jpg);
		background-size: auto 102%;
		margin: 0 0.5em 0.5em 0;
		border: 2px solid var(--second);
	}
</style>

{#each donors as donor, i}
	<a
		class="donor"
		style="background-position: {(100 * i) / (donors.length - 1)}% 0"
		alt="{donor}"
		href="https://opencollective.com/svelte">
		{donor}
	</a>
{/each}
