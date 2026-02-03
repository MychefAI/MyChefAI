/**
 * Emergency Memory-Only Storage
 * Used to bypass native module crashes causing infinite refresh loops.
 */

const memoryStorage = {};

const SafeStorage = {
    async getItem(key) {
        console.log(`[STORAGE_TRACE] Memory GET(${key})`);
        return memoryStorage[key] || null;
    },
    async setItem(key, value) {
        console.log(`[STORAGE_TRACE] Memory SET(${key})`);
        memoryStorage[key] = value;
    },
    async removeItem(key) {
        console.log(`[STORAGE_TRACE] Memory REMOVE(${key})`);
        delete memoryStorage[key];
    }
};

export default SafeStorage;
