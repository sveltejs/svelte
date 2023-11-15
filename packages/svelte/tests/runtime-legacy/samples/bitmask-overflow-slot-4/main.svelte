<script>
	import Echo from './Echo.svelte';

	export let _0 = 0, _40;
	
</script>

<Echo _40={_40} let:dummy>
	<p>{_0}</p>
	<p>{dummy}</p>
</Echo>

