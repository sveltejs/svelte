<script module>
	class Store {
		all = $state([1, 2, 3]);
		d1 = $derived(this.all.filter((a) => a > 2));

		update_value() {
			this.all = [1, 2, 3, 4, 5];
		}
	}
	export const s = new Store();
</script>
