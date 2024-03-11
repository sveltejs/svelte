<script>
	class Foo {
		a = $state(0);
		c = $derived(this.b * 2);
		b = $derived(this.a * 2);

		constructor(a) {
			this.a = a;
		}
	}

	const foo = new Foo(1);
</script>

<p>a {foo.a}</p>
<p>b {foo.b}</p>
<p>c {foo.c}</p>
