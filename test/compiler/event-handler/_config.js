import * as assert from 'assert';

export default {
	html: '<button>toggle</button><!--#if visible-->',
	test ( component, target, window ) {
		const button = target.querySelector( 'button' );
		const event = new window.MouseEvent( 'click' );

		button.dispatchEvent( event );
		assert.equal( target.innerHTML, '<button>toggle</button><p>hello!</p><!--#if visible-->' );

		button.dispatchEvent( event );
		assert.equal( target.innerHTML, '<button>toggle</button><!--#if visible-->' );
	}
};
