<script>
	export let counter = 0;

	function add1() {
		counter += 1;
	}

	export function foo() {
		return 42;
	}
</script>

<button on:click='{add1}'>+1</button>

<p>{counter}</p>