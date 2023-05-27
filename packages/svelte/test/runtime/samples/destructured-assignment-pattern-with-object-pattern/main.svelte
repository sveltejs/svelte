<script>
	const hoge = {};
	const { foo: { bar } = {} } = hoge;


	const hoge2 = {};
	const { foo2: { bar2 } = { bar2: "bar2" } } = hoge2;
</script>

<div>hello {bar}</div>
<div>hello {bar2}</div>
