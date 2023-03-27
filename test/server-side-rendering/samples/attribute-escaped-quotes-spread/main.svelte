<script>
	const safe = { foo: 'foo' };
	const unsafe = { toString: () => '"><script>alert(42)<\/script>' };

	export let props = {
		foo: '"></div><script>alert(42)</' + 'script>',
		bar: "'></div><script>alert(42)</" + 'script>',
		['"></div><script>alert(42)</' + 'script>']: 'baz',
		qux: '&&&',
		quux: unsafe
	};
</script>

<div {...props}></div>
<div {...safe} {unsafe}></div>
