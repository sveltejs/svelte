<script module>
	import { FOO } from './dummy.svelte';
	function ok() {
		let FOO;
	}
</script>

<script>
	function ok() {
		let FOO;
	}
	let FOO;
</script>

{FOO}
