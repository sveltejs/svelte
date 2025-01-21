<script module>
	import { untrack } from 'svelte'
	import { SvelteMap } from 'svelte/reactivity'

	class Foo {
		id
		updateTime = $state(Date.now())

		constructor(id) {
			this.id = id
		}
	}

	class Store {
		cache = new SvelteMap()
		ids = $state([1, 2, 3])

		getOrDefault(id) {
			let ret = this.cache.get(id)

			if (ret) {
				return ret
			}

			ret = untrack(() => {
				ret = new Foo(id)
				this.cache.set(id, ret)
				return ret
			})
			this.cache.get(id)

			return ret
		}

		get values() {
			return this.ids.map(id => this.getOrDefault(id)).sort((a, b) => b.updateTime - a.updateTime)
		}
	}

	const store = new Store()
</script>

<script>
	const test = $derived.by(() => store.values.length)
</script>

{test}
