<script>
	import { onMount } from 'svelte';

	export let value = [];

	function one(elem) {
		elem.addEventListener('input', () => {
			value.push('1');
		});
	}
	function four(elem) {
		elem.addEventListener('input', () => {
			value.push('4');
		});
	}
	function eight(elem) {
		elem.addEventListener('input', () => {
			value.push('8');
		});
	}
	function twelve(elem) {
		elem.addEventListener('input', () => {
			value.push('12');
		});
	}
	function fifteen(elem) {
		elem.addEventListener('input', () => {
			value.push('15');
		});
	}
	function seventeen(elem) {
		elem.addEventListener('input', () => {
			value.push('17');
		});
	}

	const foo = {
		set two(v) {
			value.push('2');
		},
		set six(v) {
			value.push('6');
		},
		set nine(v) {
			value.push('9');
		},
		set eleven(v) {
			value.push('11');
		},
		set thirteen(v) {
			value.push('13');
		},
		set sixteen(v) {
			value.push('16');
		}
	};

	function three() {
		value.push('3');
	}
	function five() {
		value.push('5');
	}
	function seven() {
		value.push('7');
	}
	function ten() {
		value.push('10');
	}
	function fourteen() {
		value.push('14');
	}
	function eighteen() {
		value.push('18');
	}

	let el;

	onMount(() => {
		// ensure that bind:this doesn't influence the order of directives
		// and isn't affected itself by an action being on the element
		value.push('bind:this ' + !!el);
	});
</script>

<input use:one bind:value={foo.two} on:input={three} />
<input use:four on:input={five} bind:value={foo.six} />
<input on:input={seven} use:eight bind:value={foo.nine} />
<input on:input={ten} bind:value={foo.eleven} use:twelve />
<input bind:value={foo.thirteen} on:input={fourteen} use:fifteen />
<input bind:this={el} bind:value={foo.sixteen} use:seventeen on:input={eighteen} />
