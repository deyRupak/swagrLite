import { openDB } from 'idb';

const DB_NAME = 'swagrlite-db';
const STORE_NAME = 'state';

export const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
};

export const saveToDB = async (key: string, value: any) => {
  const db = await getDB();
  await db.put(STORE_NAME, value, key);
};

export const loadFromDB = async (key: string) => {
  const db = await getDB();
  return await db.get(STORE_NAME, key);
};
