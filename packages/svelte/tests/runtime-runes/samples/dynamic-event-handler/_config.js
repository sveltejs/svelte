import { test } from '../../test';

export default test({
	html: '<button>Tama</button><button>Pochi</button><br><button>Change Function</button>',

	test({ assert, logs, target }) {
		const [b1, b2, b3] = target.querySelectorAll('button');

		b1?.click();
		b2?.click();
		b3?.click();
		b1?.click();
		b2?.click();

		assert.deepEqual(logs, [
			'creating "Hello" handler for Tama',
			'Hello Tama',
			'creating "Hello" handler for Pochi',
			'Hello Pochi',
			'creating "Bye" handler for Tama',
			'Bye Tama',
			'creating "Bye" handler for Pochi',
			'Bye Pochi'
		]);
	}
});
