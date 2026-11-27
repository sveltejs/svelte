<script lang="ts">
	import { checkpoint, load } from './PureGapHelpers.js';

	function identity(value: string) {
		return value;
	}

	const first = $derived(await load('first', 2));
	const doubled = $derived(first * 2);
	const label = identity('label');
	checkpoint();

	// An independent derived can cross synchronous deriveds and a simple local function call.
	const second = $derived(await load('second', 3));
	// The return value of that function is still an explicit dependency.
	const third = $derived(await load(label, 4));
</script>

<output>{doubled} {label} {second} {third}</output>
