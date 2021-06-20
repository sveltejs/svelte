<script>
	import Widget from './Widget.svelte';
	import Inner from './Inner.svelte';

	export let logs = [];
	export { Inner };

	function foo() {
		logs.push(this);
	}
	function bar() {
		logs.push(this);
	}
</script>

<Widget on:click={foo} on:bar={bar} />