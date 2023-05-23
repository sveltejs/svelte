const obj = {
	x: 1,
	y: 2,
	z: 3
};

export default {
	get props() {
		return { obj };
	},

	test({ assert }) {
		assert.deepEqual(obj, { x: 1, y: 2, z: 3 });
	}
};
