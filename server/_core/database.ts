import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../app.json");

interface StoredData {
  users: any[];
  applications: any[];
  nextUserId: number;
  nextApplicationId: number;
}

class FileDatabase {
  private data: StoredData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoredData {
    try {
      if (fs.existsSync(dbPath)) {
        const content = fs.readFileSync(dbPath, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn("[Database] Could not load existing database file, starting fresh");
    }

    return {
      users: [],
      applications: [],
      nextUserId: 1,
      nextApplicationId: 1,
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error("[Database] Failed to save database:", error);
    }
  }

  getData() {
    return this.data;
  }

  save() {
    this.saveData();
  }
}

let db: FileDatabase | null = null;

export function initializeDatabase(): FileDatabase {
  if (db) {
    return db;
  }

  console.log(`[Database] Initializing file-based database at ${dbPath}`);

  try {
    db = new FileDatabase();
    console.log("[Database] ✅ Database initialized and ready");
    return db;
  } catch (error) {
    console.error("[Database] ❌ Failed to initialize database:", error);
    throw error;
  }
}

export function getDatabase(): FileDatabase {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

export default getDatabase;
