<script>
	import Component from "./Component.svelte";
	export let arr = [];
	export let count = 0;
	function action(node, params) {
		count += 1;
		return {
			destroy() {
				count -= 1;
			}
		};
	}
</script>

{#each arr as item (item)}
	<Component {action} />
{/each}
