// One-time migrations for localStorage. Safe to run on every page load —
// each block is guarded by its own independent flag key so a failure in
// one doesn't block the other.
const MIGRATION_FLAG = 'clashdle:migrated:v1';
const STATS_MIGRATION_FLAG = 'clashdle:migrated:stats:v1';

// Migration 1: rename the old "clashle:" prefix to "clashdle:".
function migratePrefix() {
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

// Migration 2: split the single "clashdle:stats:v1" key (which has only
// ever held Classic data, since Classic was the only mode live long
// enough to accrue real history) into per-mode keys. Currently only
// Classic gets a copied-forward value; Description starts fresh.
function migrateStatsPerMode() {
    try {
        if (localStorage.getItem(STATS_MIGRATION_FLAG)) return;

        const oldStats = localStorage.getItem('clashdle:stats:v1');
        if (oldStats != null && localStorage.getItem('clashdle:stats:classic:v1') == null) {
            localStorage.setItem('clashdle:stats:classic:v1', oldStats);
        }

        // Leave 'clashdle:stats:v1' in place for one release cycle — drop
        // it in a later cleanup PR.
        localStorage.setItem(STATS_MIGRATION_FLAG, '1');
    } catch {
        // non-fatal
    }
}

export function migrateClashleToClashdle() {
    migratePrefix();
    migrateStatsPerMode();
}