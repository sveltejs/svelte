<script>
	import Child from './Child.svelte';

	let pojo = {
		value: 1
	};

	let frozen = $state.frozen({
		value: 2
	});

	let reactive = $state({
		value: 3
	});

	let value = $state(4);
	let accessors = {
		get value() {
			return value;
		},
		set value(v) {
			value = v;
		}
	};

	let proxied = $state(5);
	let proxy = new Proxy(
		{},
		{
			get(target, prop, receiver) {
				if (prop === 'value') {
					return proxied;
				}

				return Reflect.get(target, prop, receiver);
			},
			set(target, prop, value, receiver) {
				if (prop === 'value') {
					proxied = value;
					return true;
				}

				return Reflect.set(target, prop, value, receiver);
			}
		}
	);
</script>

<!-- should warn -->
<input bind:value={pojo.value} />
<input bind:value={frozen.value} />
<Child bind:value={pojo.value} />
<Child bind:value={frozen.value} />

<!-- should not warn -->
<input bind:value={reactive.value} />
<input bind:value={accessors.value} />
<input bind:value={proxy.value} />
<Child bind:value={reactive.value} />
<Child bind:value={accessors.value} />
<Child bind:value={proxy.value} />
