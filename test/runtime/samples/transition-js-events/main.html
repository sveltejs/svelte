<script>
	import { onMount } from 'svelte';

	export let things;
	export let visible;

	export let intros = [];
	export let outros = [];
	export let intro_count = 0;
	export let outro_count = 0;

	function foo(node, params) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}

	function introstart(e) {
		intros.push(e.target.textContent);
		intro_count += 1;
	}

	function introend(e) {
		intro_count -= 1;
	}

	function outrostart(e) {
		outros.push(e.target.textContent);
		outro_count += 1;
	}

	function outroend(e) {
		outro_count -= 1;
	}
</script>

{#each things as thing}
	{#if visible}
		<p
			transition:foo
			on:introstart={introstart}
			on:introend={introend}
			on:outrostart={outrostart}
			on:outroend={outroend}
		>{thing}</p>
	{/if}
{/each}