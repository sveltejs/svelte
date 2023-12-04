<script>
	import ConsoleLine from './ConsoleLine.svelte';

	/** @type {import('./console').Log[]} */
	export let logs;

	/** @type {'light' | 'dark'} */
	export let theme;
</script>

<div class="container" class:dark={theme === 'dark'}>
	{#each logs as log}
		<ConsoleLine {log} />
	{/each}
</div>

<style>
	.container {
		--json-tree-string-color: var(--sk-code-string);
	}
	.dark {
		--json-tree-property-color: #72a2d3;
		--json-tree-string-color: #6cd1c7;
		--json-tree-symbol-color: #6cd1c7;
		--json-tree-boolean-color: #9681f7;
		--json-tree-function-color: #e59b6f;
		--json-tree-number-color: #9681f7;
		--json-tree-label-color: #9ca0a5;
		--json-tree-arrow-color: #e8eaed;
		--json-tree-null-color: #81868a;
		--json-tree-undefined-color: #81868a;
		--json-tree-date-color: #9ca0a5;
		--json-tree-operator-color: #e8eaed;
		--json-tree-regex-color: #6cd1c7;
	}
</style>
