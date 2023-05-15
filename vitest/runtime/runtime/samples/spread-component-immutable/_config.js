const obj = {
	x: 1,
	y: 2,
	z: 3
};

export default {
	props: {
		obj
	},

	test({ assert }) {
		assert.deepEqual(obj, { x: 1, y: 2, z: 3 });
	}
};
