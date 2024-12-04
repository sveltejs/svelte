<dl>
	<dt>valid</dt>
	<dd>
		<!-- dl resets the validation -->
		<dl>
			<dt>valid</dt>
			<dd>valid</dd>
		</dl>
		<!-- custom element resets the validation -->
		<foo-bar>
			<dt>valid</dt>
			<dd>valid</dd>
		</foo-bar>
		<!-- other tags don't -->
		<div>
			<dt>invalid</dt>
		</div>
	</dd>
</dl>
