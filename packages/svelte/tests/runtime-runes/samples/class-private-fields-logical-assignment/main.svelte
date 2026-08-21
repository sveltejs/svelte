<script>
	class Values {
		#or = $state.raw('truthy');
		#and = $state.raw('');
		#nullish = $state.raw('value');

		get or() {
			return (this.#or ||= 'assigned');
		}

		get and() {
			return (this.#and &&= 'assigned');
		}

		get nullish() {
			return (this.#nullish ??= 'assigned');
		}
	}

	const values = new Values();
	const result = $derived([values.or, values.and, values.nullish]);
</script>

<p>{result.join('|')}</p>
