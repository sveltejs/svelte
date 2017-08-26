export default {
	html: `
		<p><span class=''><slot>1</slot></span></p>
		<p><span class='selected'><slot>2</slot></span></p>
		<p><span class=''><slot>3</slot></span></p>
		<p><span class='selected'><slot>2</slot></span></p>
		<p><span class=''><slot>1</slot></span></p>

		<p><span class=''><slot>1</slot></span></p>
		<p><span class='selected'><slot>2</slot></span></p>
		<p><span class=''><slot>3</slot></span></p>
		<p><span class='selected'><slot>2</slot></span></p>
		<p><span class=''><slot>1</slot></span></p>

		<p><span class=''><slot>1</slot></span></p>
		<p><span class='selected'><slot>2</slot></span></p>
		<p><span class=''><slot>3</slot></span></p>
		<p><span class='selected'><slot>2</slot></span></p>
		<p><span class=''><slot>1</slot></span></p>

		<p><span class=''><slot>1</slot></span></p>
		<p><span class='selected'><slot>2</slot></span></p>
		<p><span class=''><slot>3</slot></span></p>
		<p><span class='selected'><slot>2</slot></span></p>
		<p><span class=''><slot>1</slot></span></p>
	`,

	test ( assert, component, target, window ) {
		const click = new window.MouseEvent( 'click' );
		const spans = target.querySelectorAll( 'span' );

		spans[0].dispatchEvent( click );

		assert.equal( component.get( 'currentIdentifier' ), 1 );
		assert.htmlEqual( target.innerHTML, `
			<p><span class='selected'><slot>1</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>3</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class='selected'><slot>1</slot></span></p>

			<p><span class='selected'><slot>1</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>3</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class='selected'><slot>1</slot></span></p>

			<p><span class='selected'><slot>1</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>3</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class='selected'><slot>1</slot></span></p>

			<p><span class='selected'><slot>1</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>3</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class='selected'><slot>1</slot></span></p>
		` );

		spans[0].dispatchEvent( click );

		assert.equal( component.get( 'currentIdentifier' ), null );
		assert.htmlEqual( target.innerHTML, `
			<p><span class=''><slot>1</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>3</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>1</slot></span></p>

			<p><span class=''><slot>1</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>3</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>1</slot></span></p>

			<p><span class=''><slot>1</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>3</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>1</slot></span></p>

			<p><span class=''><slot>1</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>3</slot></span></p>
			<p><span class=''><slot>2</slot></span></p>
			<p><span class=''><slot>1</slot></span></p>
		` );
	}
};
