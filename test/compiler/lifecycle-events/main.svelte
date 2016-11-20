<div></div>

<script>
	export default {
		onrender () {
			this.events = [ 'render' ];
		},

		onteardown () {
			this.events.push( 'teardown' );
		}
	};
</script>
