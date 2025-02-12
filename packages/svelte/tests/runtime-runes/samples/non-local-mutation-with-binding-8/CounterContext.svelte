<script>
	import { getContext } from 'svelte';
	const linked1 = getContext('linked1');
	const linked2 = getContext('linked2');
</script>

<p>Context</p>
<button onclick={() => linked1.linked.current.count++}
	>Increment Linked 1 ({linked1.linked.current.count})</button
>
<button onclick={() => linked2.linked.current.count++}
	>Increment Linked 2 ({linked2.linked.current.count})</button
>
