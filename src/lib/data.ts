// Simple file-based data store for AI Tools Directory
// All data stored as Markdown (canonical) + JSON (search index)
// No database server needed — runs on Vercel's filesystem

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DATA_DIR = path.join(process.cwd(), 'data');

// Lazy-loaded caches
let _tools: Tool[] | null = null;
let _combinations: Combination[] | null = null;
let _articles: Article[] | null = null;
let _industries: Industry[] | null = null;

// Types
export interface Tool {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  description_short?: string;
  features: string[];
  shortcomings: string;
  pricing_tier: string;
  pricing_detail?: string;
  china_accessible: boolean;
  beginner_friendly: boolean;
  ecommerce_relevant: boolean;
  url?: string;
  tags: string[];
  complementary_tools: string[];
  related_combinations: string[];
  date_added: string;
  date_updated: string;
  body?: string; // markdown body
}

export interface Combination {
  id: string;
  title: string;
  description: string;
  tool_chain?: string;
  tool_ids?: string[];
  use_case: string;
  time_saved: string;
  cost_summary: string;
  date_updated: string;
  body?: string;
}

export interface Article {
  id: string;
  title: string;
  priority: 'strong' | 'recommend' | 'backup';
  related_tool_ids: string[];
  category: string;
  date_updated: string;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  recommended_tool_ids: string[];
}

export interface ChangelogEntry {
  id: number;
  entity_type: string;
  entity_id: string;
  change_desc: string;
  changed_at: string;
}

// Load tools from JSON index
export function getTools(): Tool[] {
  if (_tools) return _tools;
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'tools.json'), 'utf-8');
    _tools = JSON.parse(raw);
    return _tools!;
  } catch {
    return [];
  }
}

export function getToolBySlug(slug: string): Tool | null {
  const tools = getTools();
  const tool = tools.find(t => t.slug === slug);
  if (!tool) return null;

  // Try to read markdown body
  try {
    const mdPath = path.join(process.cwd(), 'content', 'tools', `${slug}.md`);
    if (fs.existsSync(mdPath)) {
      const raw = fs.readFileSync(mdPath, 'utf-8');
      const { content } = matter(raw);
      return { ...tool, body: content };
    }
  } catch {}

  return tool;
}

export function getToolById(id: string): Tool | null {
  return getTools().find(t => t.id === id) || null;
}

export function searchTools(query: string): Tool[] {
  const tools = getTools();
  if (!query) return tools;

  const q = query.toLowerCase();
  return tools.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.shortcomings.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q)) ||
    t.category.toLowerCase().includes(q)
  );
}

export function getToolsByCategory(category: string): Tool[] {
  return getTools().filter(t => t.category === category);
}

export function getToolsByIndustry(industry: string): Tool[] {
  // Industry mapping to categories and tags
  const mapping: Record<string, string[]> = {
    'ecommerce': ['ecommerce', 'image'],
    'content': ['office', 'voice', 'video'],
    'programming': ['code', 'model'],
    'design': ['design', 'image'],
    'office': ['office', 'browser'],
    'audio-video': ['voice', 'video'],
    'ai-models': ['model'],
    'local-offline': ['model', 'voice'],
  };

  const relevant = mapping[industry] || [industry];
  return getTools().filter(t => relevant.includes(t.category));
}

export function getCombinations(): Combination[] {
  if (_combinations) return _combinations;
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'combinations.json'), 'utf-8');
    _combinations = JSON.parse(raw);
    return _combinations!;
  } catch {
    return [];
  }
}

export function getCombinationById(id: string): Combination | null {
  const combo = getCombinations().find(c => c.id === id);
  if (!combo) return null;
  try {
    const mdPath = path.join(process.cwd(), 'content', 'combinations', `${id}.md`);
    if (fs.existsSync(mdPath)) {
      const raw = fs.readFileSync(mdPath, 'utf-8');
      const { content } = matter(raw);
      return { ...combo, body: content };
    }
  } catch {}
  return combo;
}

export function getArticles(): Article[] {
  if (_articles) return _articles;
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'articles.json'), 'utf-8');
    _articles = JSON.parse(raw);
    return _articles!;
  } catch {
    return [];
  }
}

export function getArticlesByPriority(priority: string): Article[] {
  return getArticles().filter(a => a.priority === priority);
}

export function getIndustries(): Industry[] {
  if (_industries) return _industries;
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'industries.json'), 'utf-8');
    _industries = JSON.parse(raw);
    return _industries!;
  } catch {
    return [];
  }
}

export function getIndustryBySlug(slug: string): Industry | null {
  return getIndustries().find(i => i.slug === slug) || null;
}

export function getChangelog(days = 7): ChangelogEntry[] {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, 'changelog.json'), 'utf-8');
    const entries: ChangelogEntry[] = JSON.parse(raw);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter(e => new Date(e.changed_at) >= cutoff);
  } catch {
    return [];
  }
}

export function getComplementaryTools(toolSlug: string): Tool[] {
  const tool = getToolBySlug(toolSlug);
  if (!tool || !tool.complementary_tools.length) return [];

  return tool.complementary_tools
    .map(id => getToolById(id))
    .filter(Boolean) as Tool[];
}

// ── Write operations (for Coze API / Admin) ──

function saveTools(tools: Tool[]) {
  const p = path.join(DATA_DIR, 'tools.json');
  fs.writeFileSync(p, JSON.stringify(tools, null, 2), 'utf-8');
}

function saveCombinations(combos: Combination[]) {
  const p = path.join(DATA_DIR, 'combinations.json');
  fs.writeFileSync(p, JSON.stringify(combos, null, 2), 'utf-8');
}

function saveChangelog(entries: ChangelogEntry[]) {
  const p = path.join(DATA_DIR, 'changelog.json');
  fs.writeFileSync(p, JSON.stringify(entries, null, 2), 'utf-8');
}

export function upsertTool(input: Partial<Tool> & { slug: string; name: string }): Tool {
  const tools = getTools();
  const existing = tools.findIndex(t => t.slug === input.slug);
  const now = new Date().toISOString().slice(0, 10);

  const tool: Tool = existing >= 0
    ? { ...tools[existing], ...input, date_updated: now, id: tools[existing].id }
    : {
        ...input,
        id: input.id || `tool-${input.slug}`,
        category: input.category || 'other',
        description: input.description || '',
        description_short: input.description_short || '',
        features: input.features || [],
        shortcomings: input.shortcomings || '',
        pricing_tier: input.pricing_tier || 'unknown',
        china_accessible: input.china_accessible ?? false,
        beginner_friendly: input.beginner_friendly ?? false,
        ecommerce_relevant: input.ecommerce_relevant ?? false,
        tags: input.tags || [],
        complementary_tools: input.complementary_tools || [],
        related_combinations: input.related_combinations || [],
        date_added: now, date_updated: now,
      } as Tool;

  if (existing >= 0) tools[existing] = tool;
  else tools.push(tool);

  saveTools(tools);

  // Write Markdown file
  const contentDir = path.join(process.cwd(), 'content', 'tools');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
  const frontmatter = [
    `id: ${tool.id}`, `name: "${tool.name}"`, `category: ${tool.category}`,
    `pricing_tier: ${tool.pricing_tier}`, `china_accessible: ${tool.china_accessible}`,
    `beginner_friendly: ${tool.beginner_friendly}`, `ecommerce_relevant: ${tool.ecommerce_relevant}`,
    `date_added: ${tool.date_added}`, `date_updated: ${now}`,
    `tags: [${tool.tags.join(', ')}]`, `feature_list: [${tool.features.map(f => `"${f}"`).join(', ')}]`,
  ].join('\n');
  const body = tool.description || '';
  const features = tool.features.length ? `\n## 功能特点\n\n${tool.features.map(f => `- ${f}`).join('\n')}` : '';
  const shortcomings = `\n## 不足之处\n\n${tool.shortcomings || '> 待分析'}`;
  const md = `---\n${frontmatter}\n---\n\n# ${tool.name}\n\n${body}${features}${shortcomings}\n`;
  fs.writeFileSync(path.join(contentDir, `${tool.slug}.md`), md, 'utf-8');

  // Changelog
  const action = existing >= 0 ? '更新' : '收录';
  appendChangelog('tool', tool.id, `${action}工具：${tool.name}`);

  clearCache();
  _tools = tools;
  return tool;
}

export function deleteTool(slug: string): boolean {
  const tools = getTools();
  const idx = tools.findIndex(t => t.slug === slug);
  if (idx < 0) return false;
  const tool = tools[idx];
  tools.splice(idx, 1);
  saveTools(tools);

  const mdPath = path.join(process.cwd(), 'content', 'tools', `${slug}.md`);
  try { if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath); } catch {}

  appendChangelog('tool', tool.id, `删除工具：${tool.name}`);
  clearCache();
  _tools = tools;
  return true;
}

export function appendChangelog(entity_type: string, entity_id: string, change_desc: string) {
  const entries = (() => {
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, 'changelog.json'), 'utf-8');
      return JSON.parse(raw) as ChangelogEntry[];
    } catch { return []; }
  })();
  const maxId = entries.reduce((m, e) => Math.max(m, e.id), 0);
  entries.push({
    id: maxId + 1, entity_type, entity_id, change_desc,
    changed_at: new Date().toISOString().slice(0, 10),
  });
  saveChangelog(entries);
}

export function getDailySummary() {
  const tools = getTools();
  const combos = getCombinations();
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    total_tools: tools.length,
    total_combinations: combos.length,
    tools_added_today: tools.filter(t => t.date_added === today).length,
    tools_updated_today: tools.filter(t => t.date_updated === today && t.date_added !== today).length,
  };
}

// Bulk upsert
export function bulkUpsertTools(inputs: (Partial<Tool> & { slug: string; name: string })[]): Tool[] {
  return inputs.map(input => upsertTool(input));
}

// Clear caches (useful after data updates)
export function clearCache() {
  _tools = null;
  _combinations = null;
  _articles = null;
  _industries = null;
}
