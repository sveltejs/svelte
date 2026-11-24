<script>
	let props = $state({ ONCLICK: 'window.__count = (window.__count || 0) + 1', OnInput: 'x' });
</script>

<button {...props}>click</button>
<svg {...props}></svg>
<my-element {...props}></my-element>
