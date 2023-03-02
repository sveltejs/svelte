<script>
	const obj = {
		foo : "bar",
		action(element, { leet }) {
			element.foo = this.foo + leet;
		}
	}
</script>

<button use:obj.action={{ leet: 1337 }}>action</button>
<button use:foo.action={{ leet: 1337 }}>action</button>
