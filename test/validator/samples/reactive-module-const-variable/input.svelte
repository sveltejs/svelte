<script context="module">
	export const foo = 123;
	export const doFoo = (foo) => foo;
</script>

<script>
	$: bar = foo;
	$: doFoo(bar);
</script>
