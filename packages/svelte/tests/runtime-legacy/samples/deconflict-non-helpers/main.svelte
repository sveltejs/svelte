<script>
	import { addCss, addedCss, applyComputations, renderMainFragment } from './module.js';

	export let value = addCss + addedCss + applyComputations + renderMainFragment;

	export function compute() {
		return value.toUpperCase();
	}
</script>

{compute()}

<style>
</style>
