// One-time migration from the old "clashle:" prefix to "clashdle:".
// Safe to run on every page load — guarded by a flag key.
const MIGRATION_FLAG = 'clashdle:migrated:v1';

export function migrateClashleToClashdle() {
    try {
        if (localStorage.getItem(MIGRATION_FLAG)) return;

        const oldKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('clashle:')) oldKeys.push(k);
        }

        for (const oldKey of oldKeys) {
            const newKey = 'clashdle:' + oldKey.slice('clashle:'.length);
            // Don't clobber data the user already has under the new key.
            if (localStorage.getItem(newKey) == null) {
                const val = localStorage.getItem(oldKey);
                if (val != null) localStorage.setItem(newKey, val);
            }
            // Leave the old keys in place — harmless, and lets the user
            // recover if something goes sideways. They can be removed in
            // a later cleanup PR.
        }

        localStorage.setItem(MIGRATION_FLAG, '1');
    } catch {
        // localStorage unavailable / quota / parse — non-fatal, just skip.
    }
}