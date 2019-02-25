<script context="module">
	export function preload() {
		return {};
	}
</script>

<script>
	export let sections;
</script>

<style>
	.tutorial-outer {
		position: relative;
		height: calc(100vh - var(--nav-h));
		overflow: hidden;
		background-color: var(--back);
		padding: 0;
		margin: 0 calc(var(--side-nav) * -1);
		box-sizing: border-box;
	}
</style>

<div class="tutorial-outer">
	<h1>Tutorial</h1>
</div>

