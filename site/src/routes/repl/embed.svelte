<script context="module">
	export function preload({ query }) {
		return {
			version: query.version,
			gist: query.gist,
			example: query.example
		};
	}
</script>

<script>
	import ReplWidget from '../../components/Repl/ReplWidget.svelte';

	export let version = 'beta';
	export let gist;
	export let example;
</script>

<style>
	.repl-outer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--back);
		overflow: hidden;
		box-sizing: border-box;
		--pane-controls-h: 4.2rem;
	}
</style>

<div class="repl-outer">
	{#if process.browser}
		<ReplWidget {version} {gist} {example} embedded={true}/>
	{/if}
</div>
