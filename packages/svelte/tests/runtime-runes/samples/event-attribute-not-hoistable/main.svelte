<script module>
	function declared_in_module_scope() {
		return 'x';
	}
	let a = declared_in_module_scope();

	let b = 'x';
	try {
		b = doesnt_exist();
	} catch (e) {
		b = 'y';
	}
</script>

<script>
	let count1 = $state(0);
	let count2 = $state(0);
	let count3 = $state(0);

	function increment() {
		count1 += 1;
	}
	function declared_in_module_scope() {
		count2 += 1;
	}
	function doesnt_exist() {
		count3 += 1;
	}
</script>

<!-- Checks that event handlers are not hoisted when one of them is not delegateable -->
<button onclick={increment} onmouseenter={increment}>{count1}</button>

<!-- Checks that event handler is not hoisted if the same name is used in the module context -->
<button onclick={declared_in_module_scope}>{a}{count2}</button>
<button onclick={doesnt_exist}>{b}{count3}</button>
