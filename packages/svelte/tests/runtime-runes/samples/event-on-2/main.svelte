<script>
	import { on } from 'svelte/events';
	import Wrapper from './wrapper.svelte';

	function handleParentKeyDown() {
		console.log('parent keydown');
	}
	function keydownOne(node) {
		on(node, 'keydown', (e) => console.log('one'));
	}
	function keydownTwo(node) {
		on(node, 'keydown', (e) => console.log('two'));
	}
	function keydownThree(node) {
		on(node, 'keydown', (e) => console.log('three'));
	}
</script>

<Wrapper>
	<div onkeydown={handleParentKeyDown}>
		<button use:keydownOne use:keydownTwo use:keydownThree>button</button>
	</div>
</Wrapper>
