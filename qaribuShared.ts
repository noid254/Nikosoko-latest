// Helpers shared by the Qaribu modules (gate pass and documents).
import crypto from 'crypto';
import express from 'express';

export type Deps = {
  app: any; requireAuth: any;
  queryAll: (sql: string, p?: any[]) => any[]; queryOne: (sql: string, p?: any[]) => any; runSql: (sql: string, p?: any[]) => void;
  last9: (s: any) => string;
};

export const urlencoded = express.urlencoded({ extended: false });
export const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
export const tok = () => crypto.randomBytes(12).toString('base64url');
export const code6 = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
export const fmtCode = (c: string) => `${c.slice(0, 3)} ${c.slice(3)}`;
export const now = () => new Date().toISOString();
export const base = (req: any) => `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;
export const runAll = (runSql: Deps['runSql'], sql: string) => sql.split(';').map(x => x.trim()).filter(Boolean).forEach(x => runSql(x));

export const page = (title: string, body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#000;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px}
.c{background:#fff;color:#000;border-radius:20px;padding:28px;max-width:420px;width:100%}h1{margin:0 0 6px;font-size:22px}p{color:#555;margin:6px 0}
.code{font-size:44px;font-weight:800;letter-spacing:.12em;text-align:center;margin:18px 0}.ok{color:#0a8f55;font-weight:700}.bad{color:#b00020;font-weight:700}
input,button,select{width:100%;box-sizing:border-box;font-size:18px;padding:14px;border-radius:12px;border:1px solid #ccc;margin-top:10px}button{background:#000;color:#22C27A;border:0;font-weight:700}small{color:#888}</style></head><body><div class="c">${body}</div></body></html>`;
