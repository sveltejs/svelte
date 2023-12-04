<script context="module">
	let moduleA = 'moduleA';
	let moduleB = 'moduleB';
</script>
<script>
	export function updateModuleA() {
		moduleA = 'something else';
	}

	export function reset() {
		moduleA = 'moduleA';
	}

	$: a = moduleA;
	$: b = moduleB;
</script>
a: {a}
b: {b}
moduleA: {moduleA}
moduleB: {moduleB}
