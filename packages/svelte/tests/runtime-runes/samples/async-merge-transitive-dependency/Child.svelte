<script>
	import { untrack } from 'svelte';
	let { a, b, c, slow, fast } = $props();
</script>

<p>{await slow(a)}</p>
<p>{await slow(b)}</p>
<p>{await fast(`${c}:${untrack(() => `${a}${b}`)}`)}</p>
