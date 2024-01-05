<script>
	let tag = $state('button');
	let values = $state({ a: 'red', b: 'red', c: 'red', d: 'red' });

	let count = 0;
	const factory = (name) => {
		count++;
		// check that spread effects are isolated from each other
		if (count > 8) throw new Error('too many calls');

		return {
			class: values[name],
			onclick: () => {
				values[name] = 'blue';
			}
		}
	}
</script>

<button {...factory('a')}>{values.a}</button>
<button {...factory('b')}>{values.b}</button>

<svelte:element this={tag} {...factory('c')}>{values.c}</svelte:element>
<svelte:element this={tag} {...factory('d')}>{values.d}</svelte:element>
