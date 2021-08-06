export default {
    test({ assert, component }) {
        assert.equal(component.error, false);

        component.visible = false;

        assert.equal(component.error, true);
    }
};
