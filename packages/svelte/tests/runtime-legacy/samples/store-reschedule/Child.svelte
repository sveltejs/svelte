<script lang="ts">
	import { count } from './stores';

	let n = 0;

	$: $count = n;
</script>

<button onclick={() => n += 1}>{$count}</button>
