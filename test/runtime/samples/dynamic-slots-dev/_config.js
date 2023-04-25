export default {
  compileOptions: {
    dev: true
  },

	html: '<div><p slot="dynamic-slot">Hello</p><p slot="default">Hello</p><p slot="static">Hello</p></div>',

  warnings: ['<Nested> received an unexpected slot "dynamic-slot-again".']
};
