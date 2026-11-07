#!/usr/bin/env python3
"""One-off repair: unwrap profiles whose rawData holds a copy of itself, layer after layer.

Run with the app STOPPED (pm2 stop nikosoko), after copying database.sqlite somewhere safe:
    python3 scripts/repair-rawdata.py database.sqlite
Then VACUUM shrinks the file. Newest values win; the nested copy is dropped.
"""
import json, sqlite3, sys

def unwrap(text):
    layers, cur = [], text
    while True:
        try:
            obj = json.loads(cur)
        except Exception:
            break
        if not isinstance(obj, dict):
            break
        layers.append(obj)
        nxt = obj.get('rawData')
        if not isinstance(nxt, str):
            break
        cur = nxt
    merged = {}
    for layer in reversed(layers):  # oldest first, newest last so newest wins
        merged.update({k: v for k, v in layer.items() if k != 'rawData'})
    return merged, len(layers)

def main(path):
    c = sqlite3.connect(path)
    rows = c.execute('select id, rawData from providers').fetchall()
    for pid, raw in rows:
        if not raw or len(raw) < 100_000:
            continue
        merged, n = unwrap(raw)
        new = json.dumps(merged)
        print(f'{pid}: {len(raw)/1e6:.1f} MB, {n} layers -> {len(new)/1e3:.1f} KB')
        c.execute('update providers set rawData=? where id=?', (new, pid))
    c.commit()
    c.execute('vacuum')
    c.close()
    print('done')

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'database.sqlite')
