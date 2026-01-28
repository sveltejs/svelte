<script>
	class Counter {
		#a = $state();
		#b = $state({ val: -1 });
		#c = $state();
		constructor() {
			this.#a ||= {val: 0}
			this.#b &&= {val: 0}
			this.#c ??= {val: 0}
		}
		inc() {
			this.#a.val += 1;
			this.#b.val += 2;
			this.#c.val += 3;
		}
		get a() { return this.#a?.val; }
		get b() { return this.#b?.val; }
		get c() { return this.#c?.val; }
	}

	let counter = new Counter();
</script>

<button onclick={() => counter.inc()}>inc</button>
<!-- prevent updating outputs in a common effect -->
{#key 1}<p>a:{counter.a}</p>{/key}
{#key 2}<p>b:{counter.b}</p>{/key}
{#key 3}<p>c:{counter.c}</p>{/key}
