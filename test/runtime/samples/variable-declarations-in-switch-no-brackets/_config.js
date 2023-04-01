export default {
  props: {
    q: 0 
  },

  html: '<p>3</p>',

  test({ assert, component, target }) {
    component.q = 1;
    assert.htmlEqual(target.innerHTML, '<p>4</p>');
    component.q = 2;
    assert.htmlEqual(target.innerHTML, '<p>5</p>');
    component.q = 3;
    assert.htmlEqual(target.innerHTML, '<p>6</p>');
  }
};
