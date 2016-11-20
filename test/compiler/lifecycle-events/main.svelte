<div></div>

<script>
	export default {
		oninit () {
			this.events = [ 'init' ];
		},

		onrender () {
			this.events.push( 'render' );
		},

		onteardown () {
			this.events.push( 'teardown' );
		}
	};
</script>
