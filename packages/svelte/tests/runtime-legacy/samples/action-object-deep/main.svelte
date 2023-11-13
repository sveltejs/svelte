<script>
	const obj = {
		deep: {
			foo : 'bar',
			action(element, { leet }) {
				element.foo = this.foo + leet;
			}
		}
	};
</script>

<button use:obj.deep.action={{ leet: 1337 }}>action</button>