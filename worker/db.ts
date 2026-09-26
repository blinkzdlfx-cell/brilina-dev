import { D1Database } from '@cloudflare/workers-types';
import type { Env } from './types';

export class Database {
  constructor(private db: D1Database) {}

  async getOne<T = Record<string, unknown>>(
    query: string,
    params?: unknown[]
  ): Promise<T | null> {
    const stmt = this.db.prepare(query);
    if (params && params.length > 0) {
      stmt.bind(...params);
    }
    return stmt.first<T>();
  }

  async getAll<T = Record<string, unknown>>(
    query: string,
    params?: unknown[]
  ): Promise<T[]> {
    const stmt = this.db.prepare(query);
    if (params && params.length > 0) {
      stmt.bind(...params);
    }
    const result = await stmt.all<T>();
    return result.results;
  }

  async run(
    query: string,
    params?: unknown[]
  ): Promise<{ changes: number; lastRowId: number }> {
    const stmt = this.db.prepare(query);
    if (params && params.length > 0) {
      stmt.bind(...params);
    }
    const result = await stmt.run();
    return {
      changes: result.meta.changes,
      lastRowId: result.meta.last_row_id
    };
  }

  async insert(
    table: string,
    data: Record<string, unknown>
  ): Promise<{ id: number }> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await this.run(query, values);
    return { id: result.lastRowId };
  }

  async update(
    table: string,
    data: Record<string, unknown>,
    where: string,
    whereParams?: unknown[]
  ): Promise<{ changes: number }> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    const allParams = [...values, ...(whereParams || [])];
    const result = await this.run(query, allParams);
    return { changes: result.changes };
  }

  async delete(
    table: string,
    where: string,
    whereParams?: unknown[]
  ): Promise<{ changes: number }> {
    const query = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.run(query, whereParams);
    return { changes: result.changes };
  }
}
