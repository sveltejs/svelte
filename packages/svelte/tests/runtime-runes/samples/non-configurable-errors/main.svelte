<script>
	class CustomError extends Error {
	  constructor() {
	    super();
	    Object.defineProperty(this, "message", {
			value: "test"
		});
	  }
	}
	throw new CustomError()
</script>
