<script>
	export let foo = '"></div><script>alert(42)</' + 'script>';
  export let bar = "'></div><script>alert(42)</" + 'script>';
  export let props = {
		['"></div><script>alert(42)</' + 'script>']: 'baz',
		qux: '&&&',
	};
</script>

<div {foo} bar={bar} {...props}></div>