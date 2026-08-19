#!/usr/bin/env python3
"""Validate the Back Four puzzle bank.

Structural checks + a uniqueness proof. For each puzzle, membership(tile) is the
tile's own group plus any extra groups named in `traps`. We count how many ways
the 16 tiles can be split into the four named groups (4 each) where every tile
lands in a group it truthfully belongs to. A fair puzzle has exactly ONE.
"""
import json, re, sys

def parse_puzzles(src):
    m = re.search(r'const PUZZLES\s*=\s*(\[.*?\]);\s*\n\s*if', src, re.S)
    body = m.group(1)
    body = re.sub(r'/\*.*?\*/', '', body, flags=re.S)
    body = re.sub(r'//.*', '', body)
    body = re.sub(r'([{,]\s*)(id|name|theme|groups|tier|items|traps)\s*:', r'\1"\2":', body)
    body = re.sub(r',(\s*[}\]])', r'\1', body)
    return json.loads(body)

def count_solutions(groups, membership, cap=2):
    tiles = [t for g in groups for t in g]
    order = sorted(tiles, key=lambda t: len(membership[t]))
    sols = [0]
    def bt(i, counts):
        if sols[0] >= cap:
            return
        if i == len(order):
            sols[0] += 1
            return
        t = order[i]
        for g in membership[t]:
            if counts[g] < 4:
                counts[g] += 1
                bt(i + 1, counts)
                counts[g] -= 1
    bt(0, [0, 0, 0, 0])
    return sols[0]

def main():
    src = open('js/puzzles.js', encoding='utf-8').read()
    puzzles = parse_puzzles(src)
    print("parsed %d puzzles\n" % len(puzzles))
    all_ok = True
    for p in puzzles:
        errs = []
        groups = p['groups']
        if len(groups) != 4:
            errs.append("%d groups" % len(groups))
        tiers = sorted(g['tier'] for g in groups)
        if tiers != [0, 1, 2, 3]:
            errs.append("tiers %s" % tiers)
        flat = [t for g in groups for t in g['items']]
        for g in groups:
            if len(g['items']) != 4:
                errs.append("group '%s' has %d" % (g['name'], len(g['items'])))
        if len(flat) != len(set(flat)):
            dupes = sorted(t for t in set(flat) if flat.count(t) > 1)
            errs.append("duplicate tiles %s" % dupes)
        home = {}
        for gi, g in enumerate(groups):
            for t in g['items']:
                home[t] = gi
        membership = {t: {home[t]} for t in flat}
        for tile, gi in p.get('traps', []):
            if tile not in home:
                errs.append("trap references unknown tile '%s'" % tile)
                continue
            if gi == home[tile]:
                errs.append("trap '%s' points at its own group" % tile)
            membership[tile].add(gi)
        longest = max(flat, key=len)
        n = count_solutions([g['items'] for g in groups], membership) if not errs else -1
        ok = (not errs and n == 1)
        if not ok:
            all_ok = False
        if errs:
            note = " ; ".join(errs)
        elif n != 1:
            note = "%d+ valid solutions (need exactly 1)" % n
        else:
            note = "unique OK  traps=%d  longest='%s'(%d)" % (len(p.get('traps', [])), longest, len(longest))
        print("[%s] #%2d %-26s %s" % ("OK " if ok else "BAD", p['id'], p['name'], note))
    print()
    print("ALL GOOD" if all_ok else "*** FIX NEEDED ***")
    sys.exit(0 if all_ok else 1)

if __name__ == '__main__':
    main()
