import { GameRoom } from "@shared/schema";

export interface IStorage {
  // This app uses in-memory storage via GameManager
  // No persistent storage needed for this game
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
