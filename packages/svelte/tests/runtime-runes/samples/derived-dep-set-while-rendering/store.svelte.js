class RawStore {
    values = $state.raw({ visible: true });

    get(key) {
        return this.values[key];
    }

    set(key, value) {
        this.values = { ...this.values, [key]: value };
    }
}

export const store = new RawStore();