import Dexie from 'dexie';

export const db = new Dexie('HWENDO2026DB');

db.version(1).stores({
  detenteurs: '++id, reference, nomComplet, village, syncStatus'
});
