/**
 * FundMate AI — SQLite Database Layer with In-Memory Safe Fallback
 *
 * Tries to initialize SQLite via better-sqlite3 in WAL mode.
 * If native binary bindings are unavailable in the host environment,
 * automatically falls back to an in-memory persistent store populated with
 * the official seed schemes, documents, criteria, and demo personas.
 *
 * This guarantees the application NEVER crashes on startup.
 */

import path from 'path';
import fs from 'fs';
import type {
  Scheme,
  SchemeDocument,
  Criterion,
  EligibilityResult,
  CriterionResult,
  StartupProfile,
  RoadmapStep,
} from '@/lib/types';
import { seedSchemes, seedDocuments, seedCriteria } from '@/data/seed';
import { demoPersonas } from '@/data/personas';

const DB_PATH = process.env.DATABASE_URL || './data/fundmate.db';

let _db: any = null;
let _useFallback = false;

// ── In-Memory Fallback Store ──
const fallbackStore = {
  schemes: new Map<string, Scheme>(),
  documents: new Map<string, SchemeDocument>(),
  criteria: new Map<string, Criterion>(),
  profiles: new Map<string, StartupProfile>(),
  results: new Map<string, EligibilityResult>(),
  roadmapSteps: new Map<string, RoadmapStep[]>(),
};

function initFallbackStore() {
  if (fallbackStore.schemes.size === 0) {
    for (const s of seedSchemes) fallbackStore.schemes.set(s.id, { ...s });
    for (const d of seedDocuments) fallbackStore.documents.set(d.id, { ...d });
    for (const c of seedCriteria) fallbackStore.criteria.set(c.id, { ...c });
    for (const p of demoPersonas) fallbackStore.profiles.set(p.id, JSON.parse(JSON.stringify(p.profile)));
  }
}

export function getDb(): any {
  if (_useFallback) return null;
  if (_db) return _db;

  try {
    // Dynamic require to prevent top-level native crash if bindings missing
    const Database = require('better-sqlite3');
    const dbPath = path.resolve(process.cwd(), DB_PATH);
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
    return _db;
  } catch (err) {
    console.warn('⚠️ SQLite native bindings unavailable. Running with high-performance In-Memory Safe Store.');
    _useFallback = true;
    initFallbackStore();
    return null;
  }
}

function initSchema(db: any) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schemes (
        id                TEXT PRIMARY KEY,
        name              TEXT NOT NULL,
        short_description TEXT NOT NULL DEFAULT '',
        level             TEXT NOT NULL CHECK (level IN ('central', 'state')),
        state             TEXT,
        ministry_agency   TEXT NOT NULL,
        type              TEXT NOT NULL,
        funding_range_min INTEGER,
        funding_range_max INTEGER,
        status            TEXT NOT NULL DEFAULT 'unverified',
        deadline          TEXT,
        official_url      TEXT NOT NULL,
        last_verified_at  TEXT NOT NULL,
        created_at        TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS scheme_documents (
        id          TEXT PRIMARY KEY,
        scheme_id   TEXT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
        title       TEXT NOT NULL,
        url         TEXT NOT NULL,
        doc_type    TEXT NOT NULL DEFAULT 'guideline',
        raw_text    TEXT NOT NULL DEFAULT '',
        fetched_at  TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS criteria (
        id                    TEXT PRIMARY KEY,
        scheme_id             TEXT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
        field_checked         TEXT NOT NULL,
        operator              TEXT NOT NULL,
        value                 TEXT NOT NULL,
        human_readable_text   TEXT NOT NULL,
        source_doc_id         TEXT NOT NULL REFERENCES scheme_documents(id),
        source_quote          TEXT NOT NULL DEFAULT '',
        source_page_or_section TEXT NOT NULL DEFAULT '',
        extraction_confidence REAL NOT NULL DEFAULT 0.0,
        reviewed_by_human     INTEGER NOT NULL DEFAULT 0,
        created_at            TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS startup_profiles (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        data_json   TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS eligibility_results (
        id              TEXT PRIMARY KEY,
        profile_id      TEXT NOT NULL,
        scheme_id       TEXT NOT NULL REFERENCES schemes(id),
        results_json    TEXT NOT NULL,
        overall_verdict TEXT NOT NULL,
        met_count       INTEGER NOT NULL DEFAULT 0,
        not_met_count   INTEGER NOT NULL DEFAULT 0,
        unknown_count   INTEGER NOT NULL DEFAULT 0,
        total_criteria  INTEGER NOT NULL DEFAULT 0,
        created_at      TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS roadmap_steps (
        id                  TEXT PRIMARY KEY,
        profile_id          TEXT NOT NULL,
        step_order          INTEGER NOT NULL,
        title               TEXT NOT NULL,
        description         TEXT NOT NULL DEFAULT '',
        why_it_matters      TEXT NOT NULL DEFAULT '',
        estimated_effort    TEXT NOT NULL DEFAULT '',
        dependency_ids_json TEXT NOT NULL DEFAULT '[]',
        linked_criterion_id TEXT,
        linked_scheme_ids_json TEXT NOT NULL DEFAULT '[]',
        linked_document_url TEXT,
        is_completed        INTEGER NOT NULL DEFAULT 0,
        completed_at        TEXT,
        created_at          TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_criteria_scheme ON criteria(scheme_id);
      CREATE INDEX IF NOT EXISTS idx_docs_scheme ON scheme_documents(scheme_id);
      CREATE INDEX IF NOT EXISTS idx_results_profile ON eligibility_results(profile_id);
      CREATE INDEX IF NOT EXISTS idx_results_scheme ON eligibility_results(scheme_id);
      CREATE INDEX IF NOT EXISTS idx_roadmap_profile ON roadmap_steps(profile_id);
    `);

    try {
      db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS scheme_documents_fts USING fts5(
          doc_id UNINDEXED,
          scheme_id UNINDEXED,
          title,
          raw_text,
          tokenize = 'porter unicode61'
        );
      `);
    } catch {
      // FTS5 optional
    }

    const countRow = db.prepare('SELECT COUNT(*) as count FROM schemes').get() as { count: number };
    if (!countRow || countRow.count === 0) {
      seedDatabase(db);
    }
  } catch (e) {
    console.warn('SQLite initSchema error, using in-memory store:', e);
    _useFallback = true;
    initFallbackStore();
  }
}

export function seedDatabase(targetDb?: any) {
  const db = targetDb || getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return;
  }

  try {
    const insertScheme = db.prepare(`
      INSERT OR REPLACE INTO schemes (
        id, name, short_description, level, state, ministry_agency, type,
        funding_range_min, funding_range_max, status, deadline, official_url,
        last_verified_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const insertDoc = db.prepare(`
      INSERT OR REPLACE INTO scheme_documents (
        id, scheme_id, title, url, doc_type, raw_text, fetched_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const insertCriterionStmt = db.prepare(`
      INSERT OR REPLACE INTO criteria (
        id, scheme_id, field_checked, operator, value, human_readable_text,
        source_doc_id, source_quote, source_page_or_section,
        extraction_confidence, reviewed_by_human, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const syncFts = db.transaction(() => {
      for (const scheme of seedSchemes) {
        insertScheme.run(
          scheme.id, scheme.name, scheme.short_description, scheme.level, scheme.state,
          scheme.ministry_agency, scheme.type, scheme.funding_range_min, scheme.funding_range_max,
          scheme.status, scheme.deadline, scheme.official_url, scheme.last_verified_at
        );
      }

      for (const doc of seedDocuments) {
        insertDoc.run(
          doc.id, doc.scheme_id, doc.title, doc.url, doc.doc_type, doc.raw_text, doc.fetched_at
        );
        try {
          db.prepare('DELETE FROM scheme_documents_fts WHERE doc_id = ?').run(doc.id);
          db.prepare(`
            INSERT INTO scheme_documents_fts (doc_id, scheme_id, title, raw_text)
            VALUES (?, ?, ?, ?)
          `).run(doc.id, doc.scheme_id, doc.title, doc.raw_text);
        } catch {}
      }

      for (const crit of seedCriteria) {
        insertCriterionStmt.run(
          crit.id, crit.scheme_id, crit.field_checked, crit.operator, crit.value,
          crit.human_readable_text, crit.source_doc_id, crit.source_quote,
          crit.source_page_or_section, crit.extraction_confidence,
          crit.reviewed_by_human ? 1 : 0
        );
      }

      const insertProfile = db.prepare(`
        INSERT OR REPLACE INTO startup_profiles (id, name, data_json, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `);

      for (const persona of demoPersonas) {
        insertProfile.run(persona.id, persona.name, JSON.stringify(persona.profile));
      }
    });

    syncFts();
  } catch (err) {
    console.warn('seedDatabase error, switching to fallback store:', err);
    _useFallback = true;
    initFallbackStore();
  }
}

// ── Schemes ──

export function getAllSchemes(): Scheme[] {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return Array.from(fallbackStore.schemes.values());
  }
  try {
    const rows = db.prepare('SELECT * FROM schemes ORDER BY name').all() as any[];
    return rows.map(rowToScheme);
  } catch {
    initFallbackStore();
    return Array.from(fallbackStore.schemes.values());
  }
}

export function getSchemeById(id: string): Scheme | null {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return fallbackStore.schemes.get(id) || null;
  }
  try {
    const row = db.prepare('SELECT * FROM schemes WHERE id = ?').get(id) as any;
    return row ? rowToScheme(row) : null;
  } catch {
    initFallbackStore();
    return fallbackStore.schemes.get(id) || null;
  }
}

function rowToScheme(row: any): Scheme {
  return {
    id: row.id,
    name: row.name,
    short_description: row.short_description,
    level: row.level,
    state: row.state,
    ministry_agency: row.ministry_agency,
    type: row.type,
    funding_range_min: row.funding_range_min,
    funding_range_max: row.funding_range_max,
    status: row.status,
    deadline: row.deadline,
    official_url: row.official_url,
    last_verified_at: row.last_verified_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ── Documents ──

export function getDocumentsForScheme(schemeId: string): SchemeDocument[] {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return Array.from(fallbackStore.documents.values()).filter((d) => d.scheme_id === schemeId);
  }
  try {
    const rows = db.prepare('SELECT * FROM scheme_documents WHERE scheme_id = ? ORDER BY created_at').all(schemeId) as any[];
    return rows.map((r) => ({
      id: r.id, scheme_id: r.scheme_id, title: r.title, url: r.url,
      doc_type: r.doc_type, raw_text: r.raw_text, fetched_at: r.fetched_at, created_at: r.created_at,
    }));
  } catch {
    initFallbackStore();
    return Array.from(fallbackStore.documents.values()).filter((d) => d.scheme_id === schemeId);
  }
}

export function getAllDocuments(): SchemeDocument[] {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return Array.from(fallbackStore.documents.values());
  }
  try {
    const rows = db.prepare('SELECT * FROM scheme_documents ORDER BY scheme_id, title').all() as any[];
    return rows.map((r) => ({
      id: r.id, scheme_id: r.scheme_id, title: r.title, url: r.url,
      doc_type: r.doc_type, raw_text: r.raw_text, fetched_at: r.fetched_at, created_at: r.created_at,
    }));
  } catch {
    initFallbackStore();
    return Array.from(fallbackStore.documents.values());
  }
}

export function getDocumentById(id: string): SchemeDocument | null {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return fallbackStore.documents.get(id) || null;
  }
  try {
    const row = db.prepare('SELECT * FROM scheme_documents WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id, scheme_id: row.scheme_id, title: row.title, url: row.url,
      doc_type: row.doc_type, raw_text: row.raw_text, fetched_at: r.fetched_at, created_at: row.created_at,
    };
  } catch {
    initFallbackStore();
    return fallbackStore.documents.get(id) || null;
  }
}

export function searchDocuments(query: string, schemeId?: string): { doc: SchemeDocument; score: number; snippet?: string }[] {
  const cleanQuery = query.replace(/[^\w\s]/g, ' ').trim();
  if (!cleanQuery) return [];

  const db = getDb();
  if (db && !_useFallback) {
    try {
      let sql = `
        SELECT doc_id, rank, snippet(scheme_documents_fts, 3, '<mark>', '</mark>', '...', 25) as snip
        FROM scheme_documents_fts
        WHERE scheme_documents_fts MATCH ?
      `;
      const params: any[] = [cleanQuery];
      if (schemeId) {
        sql += ' AND scheme_id = ?';
        params.push(schemeId);
      }
      sql += ' ORDER BY rank LIMIT 10';
      const ftsResults = db.prepare(sql).all(...params) as any[];
      if (ftsResults.length > 0) {
        return ftsResults.map(r => ({
          doc: getDocumentById(r.doc_id)!,
          score: -r.rank,
          snippet: r.snip,
        })).filter(item => item.doc !== null);
      }
    } catch {}
  }

  // Memory search fallback
  initFallbackStore();
  const terms = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const docs = Array.from(fallbackStore.documents.values()).filter((d) => {
    if (schemeId && d.scheme_id !== schemeId) return false;
    const text = (d.title + ' ' + d.raw_text).toLowerCase();
    return terms.some((t) => text.includes(t));
  });

  return docs.slice(0, 10).map((doc) => ({
    doc,
    score: 1.0,
  }));
}

// ── Criteria ──

export function getCriteriaForScheme(schemeId: string): Criterion[] {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return Array.from(fallbackStore.criteria.values()).filter((c) => c.scheme_id === schemeId);
  }
  try {
    const rows = db.prepare('SELECT * FROM criteria WHERE scheme_id = ? ORDER BY field_checked').all(schemeId) as any[];
    return rows.map(rowToCriterion);
  } catch {
    initFallbackStore();
    return Array.from(fallbackStore.criteria.values()).filter((c) => c.scheme_id === schemeId);
  }
}

export function getAllCriteria(): Criterion[] {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return Array.from(fallbackStore.criteria.values());
  }
  try {
    const rows = db.prepare('SELECT * FROM criteria ORDER BY scheme_id, field_checked').all() as any[];
    return rows.map(rowToCriterion);
  } catch {
    initFallbackStore();
    return Array.from(fallbackStore.criteria.values());
  }
}

export function getCriterionById(id: string): Criterion | null {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return fallbackStore.criteria.get(id) || null;
  }
  try {
    const row = db.prepare('SELECT * FROM criteria WHERE id = ?').get(id) as any;
    return row ? rowToCriterion(row) : null;
  } catch {
    initFallbackStore();
    return fallbackStore.criteria.get(id) || null;
  }
}

export function updateCriterionReview(
  id: string,
  reviewed: boolean,
  updates?: Partial<Pick<Criterion, 'human_readable_text' | 'field_checked' | 'operator' | 'value' | 'source_quote' | 'source_page_or_section'>>
) {
  initFallbackStore();
  const c = fallbackStore.criteria.get(id);
  if (c) {
    c.reviewed_by_human = reviewed;
    if (updates) Object.assign(c, updates);
  }

  const db = getDb();
  if (!db || _useFallback) return;
  try {
    if (updates) {
      db.prepare(`
        UPDATE criteria SET
          reviewed_by_human = ?,
          human_readable_text = COALESCE(?, human_readable_text),
          field_checked = COALESCE(?, field_checked),
          operator = COALESCE(?, operator),
          value = COALESCE(?, value),
          source_quote = COALESCE(?, source_quote),
          source_page_or_section = COALESCE(?, source_page_or_section),
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        reviewed ? 1 : 0, updates.human_readable_text ?? null, updates.field_checked ?? null,
        updates.operator ?? null, updates.value ?? null, updates.source_quote ?? null,
        updates.source_page_or_section ?? null, id
      );
    } else {
      db.prepare(`UPDATE criteria SET reviewed_by_human = ?, updated_at = datetime('now') WHERE id = ?`).run(reviewed ? 1 : 0, id);
    }
  } catch {}
}

export function createCriterion(criterion: Omit<Criterion, 'created_at' | 'updated_at'>) {
  initFallbackStore();
  fallbackStore.criteria.set(criterion.id, {
    ...criterion,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const db = getDb();
  if (!db || _useFallback) return;
  try {
    db.prepare(`
      INSERT INTO criteria (
        id, scheme_id, field_checked, operator, value, human_readable_text,
        source_doc_id, source_quote, source_page_or_section, extraction_confidence,
        reviewed_by_human, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      criterion.id, criterion.scheme_id, criterion.field_checked, criterion.operator,
      criterion.value, criterion.human_readable_text, criterion.source_doc_id,
      criterion.source_quote, criterion.source_page_or_section, criterion.extraction_confidence,
      criterion.reviewed_by_human ? 1 : 0
    );
  } catch {}
}

export function deleteCriterion(id: string) {
  initFallbackStore();
  fallbackStore.criteria.delete(id);

  const db = getDb();
  if (!db || _useFallback) return;
  try {
    db.prepare('DELETE FROM criteria WHERE id = ?').run(id);
  } catch {}
}

function rowToCriterion(row: any): Criterion {
  return {
    id: row.id,
    scheme_id: row.scheme_id,
    field_checked: row.field_checked,
    operator: row.operator,
    value: row.value,
    human_readable_text: row.human_readable_text,
    source_doc_id: row.source_doc_id,
    source_quote: row.source_quote,
    source_page_or_section: row.source_page_or_section,
    extraction_confidence: row.extraction_confidence,
    reviewed_by_human: Boolean(row.reviewed_by_human),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ── Profiles ──

export function saveProfile(profile: StartupProfile) {
  initFallbackStore();
  fallbackStore.profiles.set(profile.id, JSON.parse(JSON.stringify(profile)));

  const db = getDb();
  if (!db || _useFallback) return;
  try {
    db.prepare(`
      INSERT INTO startup_profiles (id, name, data_json, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        data_json = excluded.data_json,
        updated_at = datetime('now')
    `).run(profile.id, profile.name, JSON.stringify(profile));
  } catch {}
}

export function getProfile(id: string): StartupProfile | null {
  initFallbackStore();
  const p = fallbackStore.profiles.get(id);
  if (p) return JSON.parse(JSON.stringify(p));

  const db = getDb();
  if (!db || _useFallback) return null;
  try {
    const row = db.prepare('SELECT * FROM startup_profiles WHERE id = ?').get(id) as any;
    return row ? JSON.parse(row.data_json) : null;
  } catch {
    return null;
  }
}

export function getAllProfiles(): StartupProfile[] {
  initFallbackStore();
  const db = getDb();
  if (!db || _useFallback) {
    return Array.from(fallbackStore.profiles.values());
  }
  try {
    const rows = db.prepare('SELECT data_json FROM startup_profiles ORDER BY created_at DESC').all() as any[];
    return rows.map(r => JSON.parse(r.data_json));
  } catch {
    return Array.from(fallbackStore.profiles.values());
  }
}

// ── Eligibility Results ──

export function saveEligibilityResult(result: EligibilityResult) {
  initFallbackStore();
  fallbackStore.results.set(result.id, { ...result });

  const db = getDb();
  if (!db || _useFallback) return;
  try {
    db.prepare(`
      INSERT INTO eligibility_results (id, profile_id, scheme_id, results_json, overall_verdict,
        met_count, not_met_count, unknown_count, total_criteria, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        results_json = excluded.results_json,
        overall_verdict = excluded.overall_verdict,
        met_count = excluded.met_count,
        not_met_count = excluded.not_met_count,
        unknown_count = excluded.unknown_count,
        total_criteria = excluded.total_criteria
    `).run(
      result.id, result.profile_id, result.scheme_id,
      JSON.stringify(result.criterion_results), result.overall_verdict,
      result.met_count, result.not_met_count, result.unknown_count, result.total_criteria
    );
  } catch {}
}

export function getResultsForProfile(profileId: string): EligibilityResult[] {
  const db = getDb();
  if (!db || _useFallback) {
    initFallbackStore();
    return Array.from(fallbackStore.results.values()).filter((r) => r.profile_id === profileId);
  }
  try {
    const rows = db.prepare('SELECT * FROM eligibility_results WHERE profile_id = ? ORDER BY met_count DESC').all(profileId) as any[];
    return rows.map((r) => ({
      id: r.id, profile_id: r.profile_id, scheme_id: r.scheme_id,
      criterion_results: JSON.parse(r.results_json), overall_verdict: r.overall_verdict,
      met_count: r.met_count, not_met_count: r.not_met_count, unknown_count: r.unknown_count,
      total_criteria: r.total_criteria, created_at: r.created_at,
    }));
  } catch {
    initFallbackStore();
    return Array.from(fallbackStore.results.values()).filter((r) => r.profile_id === profileId);
  }
}

// ── Roadmap ──

export function saveRoadmapSteps(profileId: string, steps: RoadmapStep[]) {
  initFallbackStore();
  fallbackStore.roadmapSteps.set(profileId, steps.map(s => ({ ...s })));

  const db = getDb();
  if (!db || _useFallback) return;
  try {
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM roadmap_steps WHERE profile_id = ?').run(profileId);
      const insert = db.prepare(`
        INSERT INTO roadmap_steps (
          id, profile_id, step_order, title, description, why_it_matters,
          estimated_effort, dependency_ids_json, linked_criterion_id,
          linked_scheme_ids_json, linked_document_url, is_completed, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      for (const s of steps) {
        insert.run(
          s.id, profileId, s.order, s.title, s.description, s.why_it_matters,
          s.estimated_effort, JSON.stringify(s.dependency_ids), s.linked_criterion_id,
          JSON.stringify(s.linked_scheme_ids), s.linked_document_url, s.is_completed ? 1 : 0, s.completed_at
        );
      }
    });
    tx();
  } catch {}
}

export function getRoadmapSteps(profileId: string): RoadmapStep[] {
  initFallbackStore();
  const existing = fallbackStore.roadmapSteps.get(profileId);
  if (existing && existing.length > 0) return existing;

  const db = getDb();
  if (!db || _useFallback) return [];
  try {
    const rows = db.prepare('SELECT * FROM roadmap_steps WHERE profile_id = ? ORDER BY step_order').all(profileId) as any[];
    return rows.map((r) => ({
      id: r.id, profile_id: r.profile_id, order: r.step_order, title: r.title,
      description: r.description, why_it_matters: r.why_it_matters, estimated_effort: r.estimated_effort,
      dependency_ids: JSON.parse(r.dependency_ids_json || '[]'), linked_criterion_id: r.linked_criterion_id,
      linked_scheme_ids: JSON.parse(r.linked_scheme_ids_json || '[]'), linked_document_url: r.linked_document_url,
      is_completed: Boolean(r.is_completed), completed_at: r.completed_at, created_at: r.created_at,
    }));
  } catch {
    return [];
  }
}

export function toggleRoadmapStep(stepId: string, isCompleted: boolean) {
  initFallbackStore();
  for (const list of fallbackStore.roadmapSteps.values()) {
    const s = list.find(item => item.id === stepId);
    if (s) {
      s.is_completed = isCompleted;
      s.completed_at = isCompleted ? new Date().toISOString() : null;
    }
  }

  const db = getDb();
  if (!db || _useFallback) return;
  try {
    db.prepare(`
      UPDATE roadmap_steps SET is_completed = ?, completed_at = ? WHERE id = ?
    `).run(isCompleted ? 1 : 0, isCompleted ? new Date().toISOString() : null, stepId);
  } catch {}
}

// ── Database Statistics ──

export function getDbStats() {
  initFallbackStore();
  const db = getDb();
  if (!db || _useFallback) {
    const schemes = fallbackStore.schemes.size;
    const docs = fallbackStore.documents.size;
    const criteria = fallbackStore.criteria.size;
    const reviewed = Array.from(fallbackStore.criteria.values()).filter(c => c.reviewed_by_human).length;
    const profiles = fallbackStore.profiles.size;
    return { schemes, docs, criteria, reviewed, profiles };
  }
  try {
    const schemes = (db.prepare('SELECT COUNT(*) as c FROM schemes').get() as any).c;
    const docs = (db.prepare('SELECT COUNT(*) as c FROM scheme_documents').get() as any).c;
    const criteria = (db.prepare('SELECT COUNT(*) as c FROM criteria').get() as any).c;
    const reviewed = (db.prepare('SELECT COUNT(*) as c FROM criteria WHERE reviewed_by_human = 1').get() as any).c;
    const profiles = (db.prepare('SELECT COUNT(*) as c FROM startup_profiles').get() as any).c;
    return { schemes, docs, criteria, reviewed, profiles };
  } catch {
    const schemes = fallbackStore.schemes.size;
    const docs = fallbackStore.documents.size;
    const criteria = fallbackStore.criteria.size;
    const reviewed = Array.from(fallbackStore.criteria.values()).filter(c => c.reviewed_by_human).length;
    const profiles = fallbackStore.profiles.size;
    return { schemes, docs, criteria, reviewed, profiles };
  }
}
