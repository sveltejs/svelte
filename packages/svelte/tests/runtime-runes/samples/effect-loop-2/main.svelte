<script>
	import {untrack} from "svelte"

let count = $state(0);
	let reset = $state(false);

	$effect(() => {
		if (reset) {
			count = 0;
			reset = false;
			return;
		}
		if (count <= 10) {
			untrack(() => count++);
		} else {
			count = "Over 10";
		}
	});
</script>

{count}
<br>
<button on:click={() => count++}>increment</button>
<br>
<button on:click={() => reset = true}>reset</button>
