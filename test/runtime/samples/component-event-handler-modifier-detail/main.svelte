<script>
	import Row from './Row.svelte';
	
	export let selected ;

	function handle_select(item) {
		selected = item
	}
</script>

<Row on:select|detail={handle_select} item="apple" />