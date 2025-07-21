import { openDB } from "idb";

const DB_NAME = "swagrlite-db";
const STORE_NAME = "state";

export const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const saveToDB = async (key: string, value: any) => {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, value, key);
  } catch (error) {
    console.error("Failed to save to IndexedDB:", error);
  }
};

export const loadFromDB = async (key: string) => {
  try {
    const db = await getDB();
    return await db.get(STORE_NAME, key);
  } catch (error) {
    console.error("Failed to load from IndexedDB:", error);
    return null;
  }
};
