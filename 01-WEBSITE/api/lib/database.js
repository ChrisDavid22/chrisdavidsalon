// SQLite Database for Autonomous SEO Agent
// Stores historical data, tracks progress, enables intelligent decision-making

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database path - use /tmp for Vercel serverless (ephemeral but works for caching)
// For persistent storage, would use Vercel KV or external DB
const DB_PATH = process.env.NODE_ENV === 'production'
  ? '/tmp/seo-agent.db'
  : path.join(process.cwd(), 'data', 'seo-agent.db');

let db = null;

export function getDatabase() {
  if (db) return db;

  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Initialize schema
  initializeSchema(db);

  return db;
}

function initializeSchema(db) {
  // SEO Scores - Daily snapshots
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      overall_score INTEGER,
      performance INTEGER,
      seo INTEGER,
      accessibility INTEGER,
      best_practices INTEGER,
      content INTEGER,
      technical INTEGER,
      mobile INTEGER,
      ux INTEGER,
      local_seo INTEGER,
      authority INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date)
    )
  `);

  // Competitor Tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS competitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      reviews INTEGER,
      rating REAL,
      position INTEGER,
      seo_score INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Our Reviews & Position
  db.exec(`
    CREATE TABLE IF NOT EXISTS our_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      reviews INTEGER,
      rating REAL,
      market_position INTEGER,
      monthly_visitors INTEGER,
      booking_clicks INTEGER,
      phone_clicks INTEGER,
      conversion_rate REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date)
    )
  `);

  // Keyword Rankings
  db.exec(`
    CREATE TABLE IF NOT EXISTS keyword_rankings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      keyword TEXT NOT NULL,
      position INTEGER,
      search_volume INTEGER,
      competition TEXT,
      our_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Authority Building Actions
  db.exec(`
    CREATE TABLE IF NOT EXISTS authority_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      expected_impact TEXT,
      actual_impact TEXT,
      started_at TEXT,
      completed_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Backlinks Tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS backlinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_url TEXT NOT NULL,
      source_domain TEXT NOT NULL,
      anchor_text TEXT,
      link_type TEXT,
      domain_authority INTEGER,
      discovered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active',
      UNIQUE(source_url)
    )
  `);

  // Content Pages Created
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      target_keyword TEXT,
      page_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_updated TEXT,
      traffic INTEGER DEFAULT 0,
      ranking_position INTEGER,
      status TEXT DEFAULT 'published',
      UNIQUE(url)
    )
  `);

  // Agent Actions Log - What the AI agent has done
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      description TEXT NOT NULL,
      result TEXT,
      data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Weekly Reports
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      summary TEXT,
      wins TEXT,
      losses TEXT,
      recommendations TEXT,
      score_change INTEGER,
      position_change INTEGER,
      review_change INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(week_start)
    )
  `);

  // Seed initial data if empty
  seedInitialData(db);
}

function seedInitialData(db) {
  const today = new Date().toISOString().split('T')[0];

  // Check if we have today's data
  const existing = db.prepare('SELECT id FROM seo_scores WHERE date = ?').get(today);
  if (existing) return;

  // Seed today's SEO scores
  db.prepare(`
    INSERT OR IGNORE INTO seo_scores (date, overall_score, performance, seo, accessibility, best_practices, content, technical, mobile, ux, local_seo, authority)
    VALUES (?, 73, 75, 82, 85, 80, 75, 82, 85, 80, 70, 45)
  `).run(today);

  // Seed our metrics
  db.prepare(`
    INSERT OR IGNORE INTO our_metrics (date, reviews, rating, market_position, monthly_visitors, booking_clicks, phone_clicks, conversion_rate)
    VALUES (?, 133, 4.9, 15, 247, 28, 45, 11.3)
  `).run(today);

  // Seed competitors
  const competitors = [
    ['Salon Sora', 203, 4.8, 1, 89],
    ['Drybar Delray', 189, 4.7, 2, 85],
    ['The W Salon', 156, 4.9, 3, 82],
    ['Bond Street Salon', 148, 4.7, 4, 78],
    ['Rové Hair Salon', 142, 4.8, 5, 80]
  ];

  const insertComp = db.prepare(`
    INSERT INTO competitors (date, name, reviews, rating, position, seo_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const comp of competitors) {
    insertComp.run(today, ...comp);
  }

  // Seed keyword rankings
  const keywords = [
    ['hair salons delray beach', 15, 1900, 'high'],
    ['best hair salon delray beach', 18, 900, 'high'],
    ['balayage delray beach', 8, 600, 'medium'],
    ['hair extensions delray beach', 6, 500, 'medium'],
    ['keratin treatment delray beach', 9, 400, 'medium'],
    ['color correction delray beach', 4, 150, 'low'],
    ['master colorist delray beach', 3, 120, 'low'],
    ['davines salon delray beach', 1, 50, 'low'],
    ['wedding hair delray beach', null, 40, 'medium']
  ];

  const insertKw = db.prepare(`
    INSERT INTO keyword_rankings (date, keyword, position, search_volume, competition)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const kw of keywords) {
    insertKw.run(today, ...kw);
  }

  // Seed authority building actions
  const actions = [
    ['backlink', 'Get featured on Davines official website', 'pending', 'high', '+15 authority points'],
    ['backlink', 'Local news feature in Palm Beach Post', 'pending', 'high', '+10 authority points'],
    ['reviews', 'Get 50 more Google reviews', 'in_progress', 'high', '+10 authority, move to #10'],
    ['content', 'Create neighborhood landing pages', 'pending', 'medium', 'Rank for more local terms'],
    ['social', 'Weekly hair transformation videos', 'pending', 'medium', '+5 authority, social signals'],
    ['backlink', 'Guest post on 3 beauty blogs', 'pending', 'medium', '+5-10 authority points']
  ];

  const insertAction = db.prepare(`
    INSERT INTO authority_actions (action_type, description, status, priority, expected_impact)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const action of actions) {
    insertAction.run(...action);
  }

  // Seed existing backlinks (microsites)
  const backlinks = [
    ['https://delraybeachhairstylist.com', 'delraybeachhairstylist.com', 'Chris David Salon', 'microsite', 15],
    ['https://bocahairstylist.com', 'bocahairstylist.com', 'hair stylist boca', 'microsite', 12],
    ['https://palmbeachhairstylist.com', 'palmbeachhairstylist.com', 'palm beach hair', 'microsite', 14]
  ];

  const insertBacklink = db.prepare(`
    INSERT OR IGNORE INTO backlinks (source_url, source_domain, anchor_text, link_type, domain_authority)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const bl of backlinks) {
    insertBacklink.run(...bl);
  }

  // Log the seeding action
  db.prepare(`
    INSERT INTO agent_log (action_type, description, result)
    VALUES ('seed', 'Initial database seeding with baseline data', 'success')
  `).run();
}

// Helper functions for the agent to use

export function recordDailyScores(scores) {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  return db.prepare(`
    INSERT OR REPLACE INTO seo_scores
    (date, overall_score, performance, seo, accessibility, best_practices, content, technical, mobile, ux, local_seo, authority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    today,
    scores.overall,
    scores.performance,
    scores.seo,
    scores.accessibility,
    scores.bestPractices,
    scores.content,
    scores.technical,
    scores.mobile,
    scores.ux,
    scores.local,
    scores.authority
  );
}

export function getScoreHistory(days = 30) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM seo_scores
    ORDER BY date DESC
    LIMIT ?
  `).all(days);
}

export function getScoreTrend() {
  const db = getDatabase();
  const recent = db.prepare(`
    SELECT overall_score, authority, date FROM seo_scores
    ORDER BY date DESC
    LIMIT 7
  `).all();

  if (recent.length < 2) return { trend: 'stable', change: 0 };

  const change = recent[0].overall_score - recent[recent.length - 1].overall_score;
  return {
    trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
    change,
    current: recent[0].overall_score,
    weekAgo: recent[recent.length - 1].overall_score
  };
}

export function recordCompetitorData(competitors) {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const insert = db.prepare(`
    INSERT INTO competitors (date, name, reviews, rating, position, seo_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const comp of competitors) {
    insert.run(today, comp.name, comp.reviews, comp.rating, comp.position, comp.seoScore || null);
  }
}

export function getCompetitorTrends() {
  const db = getDatabase();
  return db.prepare(`
    SELECT name,
           MAX(CASE WHEN date = (SELECT MAX(date) FROM competitors) THEN reviews END) as current_reviews,
           MAX(CASE WHEN date = (SELECT MIN(date) FROM competitors) THEN reviews END) as initial_reviews
    FROM competitors
    GROUP BY name
    ORDER BY current_reviews DESC
  `).all();
}

export function getAuthorityActions() {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM authority_actions
    ORDER BY
      CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      created_at DESC
  `).all();
}

export function updateActionStatus(id, status, notes = null) {
  const db = getDatabase();
  const now = new Date().toISOString();

  if (status === 'completed') {
    return db.prepare(`
      UPDATE authority_actions
      SET status = ?, completed_at = ?, notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(status, now, notes, id);
  }

  return db.prepare(`
    UPDATE authority_actions
    SET status = ?, notes = COALESCE(?, notes)
    WHERE id = ?
  `).run(status, notes, id);
}

export function logAgentAction(actionType, description, result, data = null) {
  const db = getDatabase();
  return db.prepare(`
    INSERT INTO agent_log (action_type, description, result, data)
    VALUES (?, ?, ?, ?)
  `).run(actionType, description, result, data ? JSON.stringify(data) : null);
}

export function getAgentLog(limit = 50) {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM agent_log
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
}

export function generateWeeklyReport() {
  const db = getDatabase();
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
  const weekEnd = new Date().toISOString().split('T')[0];

  // Get score changes
  const scores = db.prepare(`
    SELECT * FROM seo_scores
    WHERE date >= ? AND date <= ?
    ORDER BY date
  `).all(weekStart, weekEnd);

  const scoreChange = scores.length >= 2
    ? scores[scores.length - 1].overall_score - scores[0].overall_score
    : 0;

  // Get metrics changes
  const metrics = db.prepare(`
    SELECT * FROM our_metrics
    WHERE date >= ? AND date <= ?
    ORDER BY date
  `).all(weekStart, weekEnd);

  const reviewChange = metrics.length >= 2
    ? metrics[metrics.length - 1].reviews - metrics[0].reviews
    : 0;

  const positionChange = metrics.length >= 2
    ? metrics[0].market_position - metrics[metrics.length - 1].market_position
    : 0;

  // Generate summary
  const summary = `Week of ${weekStart}: Score ${scoreChange >= 0 ? '+' : ''}${scoreChange}, ` +
                  `Reviews ${reviewChange >= 0 ? '+' : ''}${reviewChange}, ` +
                  `Position ${positionChange >= 0 ? '+' : ''}${positionChange}`;

  // Store report
  db.prepare(`
    INSERT OR REPLACE INTO weekly_reports
    (week_start, week_end, summary, score_change, position_change, review_change)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(weekStart, weekEnd, summary, scoreChange, positionChange, reviewChange);

  return {
    weekStart,
    weekEnd,
    summary,
    scoreChange,
    positionChange,
    reviewChange
  };
}

export default {
  getDatabase,
  recordDailyScores,
  getScoreHistory,
  getScoreTrend,
  recordCompetitorData,
  getCompetitorTrends,
  getAuthorityActions,
  updateActionStatus,
  logAgentAction,
  getAgentLog,
  generateWeeklyReport
};
