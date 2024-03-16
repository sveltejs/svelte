<script>
	import Component from "./sub.svelte"
	let state = 'foo';
	let param = '';

	function action(node, _param) {
		param = _param
		return {
			update(_param) {
				param = _param;
			}
		};
	}
</script>

<button on:click={() => state = 'bar'}>{state} / {param}</button>
<Component {action} {state}></Component>
