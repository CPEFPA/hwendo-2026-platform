import Dexie from 'dexie';

export const db = new Dexie('HWENDO2026DB');

db.version(1).stores({
  detenteurs: '++id, reference, nomComplet, village, syncStatus, docUrl'
});

db.version(2).stores({
  detenteurs: '++id, reference, nomComplet, village, syncStatus, docUrl',
  files: '++id, detenteurId, type, name'
});
