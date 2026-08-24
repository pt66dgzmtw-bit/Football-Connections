/* Back Four — game logic */
(function () {
  "use strict";

  var TIERS = [
    { key: "t0", label: "League Cup",       emoji: "\u{1F7E9}" }, // green
    { key: "t1", label: "FA Cup",           emoji: "\u{1F7E5}" }, // red
    { key: "t2", label: "Premier League",   emoji: "\u{1F7EA}" }, // purple
    { key: "t3", label: "Champions League", emoji: "\u{1F7E6}" }  // blue
  ];
  var MAX_MISTAKES = 4;
  var EPOCH = Date.UTC(2024, 0, 1);
  var KEY = { progress: "b4:v1:progress:", stats: "b4:v1:stats", seen: "b4:v1:seen" };

  function load(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function todayIndex() {
    var now = new Date();
    var local = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.floor((local - EPOCH) / 86400000);
    return ((days % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  }
  function puzzleNumber() {
    var now = new Date();
    var local = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((local - EPOCH) / 86400000) + 1;
  }
  function formatDate(d) {
    return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  }

  function seededShuffle(arr, seed) {
    var a = arr.slice(), s = seed >>> 0;
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function shuffle(arr) { return seededShuffle(arr, Math.floor(Math.random() * 1e9)); }

  var el = {
    board: document.getElementById("board"),
    solved: document.getElementById("solved"),
    live: document.getElementById("live"),
    lives: document.getElementById("lives"),
    mistakesRow: document.getElementById("mistakes-row"),
    controls: document.getElementById("controls"),
    submit: document.getElementById("btn-submit"),
    shuffle: document.getElementById("btn-shuffle"),
    deselect: document.getElementById("btn-deselect"),
    endgame: document.getElementById("endgame"),
    ftBadge: document.getElementById("ft-badge"),
    endTitle: document.getElementById("endgame-title"),
    endSub: document.getElementById("endgame-sub"),
    shareGrid: document.getElementById("share-grid"),
    share: document.getElementById("btn-share"),
    next: document.getElementById("btn-next"),
    label: document.getElementById("puzzle-label"),
    date: document.getElementById("puzzle-date"),
    themeName: document.getElementById("theme-name"),
    modal: document.getElementById("modal"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    modalClose: document.getElementById("modal-close")
  };

  var game = null;

  function itemGroup(puzzle, item) {
    for (var i = 0; i < puzzle.groups.length; i++) {
      if (puzzle.groups[i].items.indexOf(item) !== -1) return puzzle.groups[i];
    }
    return null;
  }

  function startPuzzle(index, isDaily) {
    var puzzle = PUZZLES[index];
    var saved = load(KEY.progress + puzzle.id, null);

    game = {
      puzzle: puzzle, index: index, isDaily: isDaily,
      selected: [],
      solved: saved ? saved.solved.slice() : [],
      mistakes: saved ? saved.mistakes : 0,
      guesses: saved ? saved.guesses.slice() : [],
      over: saved ? saved.over : false,
      won: saved ? saved.won : false,
      busy: false, order: null
    };

    var remaining = [];
    puzzle.groups.forEach(function (g) {
      if (game.solved.indexOf(g.name) === -1) remaining = remaining.concat(g.items);
    });
    game.order = seededShuffle(remaining, puzzle.id * 7919 + 13);

    el.label.textContent = isDaily ? "Puzzle #" + puzzleNumber() : "Puzzle " + puzzle.id;
    el.date.textContent = isDaily ? formatDate(new Date()) : "Archive";
    el.themeName.textContent = puzzle.theme;

    render(true);
    if (game.over) finish(game.won, true);
  }

  function persist() {
    save(KEY.progress + game.puzzle.id, {
      solved: game.solved, mistakes: game.mistakes,
      guesses: game.guesses, over: game.over, won: game.won
    });
  }

  function render(animate) { renderSolved(); renderBoard(animate); renderLives(); updateControls(); }

  function renderSolved() {
    el.solved.innerHTML = "";
    game.solved.forEach(function (name) {
      var g = game.puzzle.groups.filter(function (x) { return x.name === name; })[0];
      var row = document.createElement("div");
      row.className = "solved-row t" + g.tier;
      var comp = document.createElement("span");
      comp.className = "comp";
      comp.textContent = TIERS[g.tier].label;
      var h = document.createElement("h3"); h.textContent = g.name;
      var p = document.createElement("p"); p.textContent = g.items.join("  ·  ");
      row.appendChild(comp); row.appendChild(h); row.appendChild(p);
      el.solved.appendChild(row);
    });
  }

  function renderBoard(animate) {
    el.board.innerHTML = "";
    game.order.forEach(function (item, idx) {
      var b = document.createElement("button");
      b.type = "button";
      var longest = item.split(" ").reduce(function (a, w) { return Math.max(a, w.length); }, 0);
      var size = longest >= 12 ? " xs" : (longest >= 9 ? " sm" : "");
      b.className = "tile" + size + (game.selected.indexOf(item) !== -1 ? " selected" : "");
      b.textContent = item;
      b.dataset.item = item;
      b.setAttribute("aria-pressed", game.selected.indexOf(item) !== -1 ? "true" : "false");
      if (animate) {
        b.classList.add("reel");
        var col = idx % 4, row = Math.floor(idx / 4);
        b.style.animationDelay = (col * 70 + row * 24) + "ms";
      }
      b.addEventListener("click", function () { toggle(item, b); });
      el.board.appendChild(b);
    });
    el.board.style.display = game.order.length ? "grid" : "none";
  }

  function renderLives() {
    el.lives.innerHTML = "";
    for (var i = 0; i < MAX_MISTAKES; i++) {
      var s = document.createElement("span");
      s.className = "life" + (i < game.mistakes ? " lost" : "");
      el.lives.appendChild(s);
    }
  }

  function updateControls() {
    el.submit.disabled = game.selected.length !== 4 || game.busy;
    el.deselect.disabled = game.selected.length === 0 || game.busy;
    el.shuffle.disabled = game.busy;
  }

  function say(msg, kind) {
    el.live.textContent = msg || "";
    el.live.className = "live" + (kind ? " " + kind : "");
  }

  function toggle(item, node) {
    if (game.busy || game.over) return;
    var i = game.selected.indexOf(item);
    if (i !== -1) {
      game.selected.splice(i, 1);
      node.classList.remove("selected");
      node.setAttribute("aria-pressed", "false");
    } else {
      if (game.selected.length === 4) return;
      game.selected.push(item);
      node.classList.add("selected");
      node.setAttribute("aria-pressed", "true");
      node.classList.remove("pop"); void node.offsetWidth; node.classList.add("pop");
    }
    say(""); updateControls();
  }

  function tilesFor(items) {
    return Array.prototype.filter.call(el.board.children, function (n) { return items.indexOf(n.dataset.item) !== -1; });
  }
  function alreadyGuessed(items) {
    var key = items.slice().sort().join("|");
    return game.guesses.some(function (g) { return g.key === key; });
  }

  function submit() {
    if (game.selected.length !== 4 || game.busy || game.over) return;
    var picked = game.selected.slice();
    if (alreadyGuessed(picked)) { say("Already guessed"); return; }
    game.busy = true; updateControls();
    var nodes = tilesFor(picked);
    nodes.forEach(function (n, i) {
      setTimeout(function () { n.classList.remove("bounce"); void n.offsetWidth; n.classList.add("bounce"); }, i * 90);
    });
    setTimeout(function () { resolveGuess(picked, nodes); }, 620);
  }

  function resolveGuess(picked, nodes) {
    var counts = {};
    picked.forEach(function (item) { var g = itemGroup(game.puzzle, item); counts[g.name] = (counts[g.name] || 0) + 1; });
    var names = Object.keys(counts);
    var best = Math.max.apply(null, names.map(function (n) { return counts[n]; }));

    game.guesses.push({
      key: picked.slice().sort().join("|"),
      tiers: picked.map(function (item) { return itemGroup(game.puzzle, item).tier; })
    });

    if (best === 4) {
      solveGroup(names[0]);
    } else {
      game.mistakes++;
      nodes.forEach(function (n) { n.classList.remove("bounce"); void n.offsetWidth; n.classList.add("wrong"); });
      renderLives();
      say(best === 3 ? "One away…" : "Not quite", "miss");
      setTimeout(function () {
        nodes.forEach(function (n) { n.classList.remove("wrong"); });
        game.busy = false;
        if (game.mistakes >= MAX_MISTAKES) { revealAll(); } else { updateControls(); }
        persist();
      }, 480);
    }
  }

  function solveGroup(name) {
    var g = game.puzzle.groups.filter(function (x) { return x.name === name; })[0];
    game.solved.push(name);
    game.selected = [];
    game.order = game.order.filter(function (i) { return g.items.indexOf(i) === -1; });
    say(TIERS[g.tier].label + " — solved", "hit");
    render(false);
    game.busy = false; persist();
    if (game.solved.length === 4) { setTimeout(function () { finish(true, false); }, 420); }
    else { updateControls(); }
  }

  function revealAll() {
    game.busy = true; game.selected = [];
    var left = game.puzzle.groups
      .filter(function (g) { return game.solved.indexOf(g.name) === -1; })
      .sort(function (a, b) { return a.tier - b.tier; });
    left.forEach(function (g, i) {
      setTimeout(function () {
        game.solved.push(g.name);
        game.order = game.order.filter(function (it) { return g.items.indexOf(it) === -1; });
        render(false);
        if (i === left.length - 1) { finish(false, false); }
      }, i * 560);
    });
  }

  function finish(won, restored) {
    game.over = true; game.won = won; game.busy = false;
    persist();
    if (!restored) recordStats(won);

    el.controls.hidden = true; el.mistakesRow.hidden = true; el.endgame.hidden = false;
    say("");

    var perfect = won && game.mistakes === 0;
    el.ftBadge.textContent = won ? (perfect ? "Clean sheet" : "Win") : "Full time";
    el.ftBadge.className = "ft-badge" + (won ? " win" : "");
    if (won) {
      el.endTitle.textContent = perfect ? "Clean sheet!" : "Back of the net!";
      var spare = MAX_MISTAKES - game.mistakes;
      el.endSub.textContent = perfect ? "Four from four, no mistakes."
        : "Solved with " + spare + " mistake" + (spare === 1 ? "" : "s") + " to spare.";
    } else {
      el.endTitle.textContent = "Full time";
      el.endSub.textContent = "Out of mistakes — the back four is revealed.";
    }
    renderShareGrid();
  }

  function renderShareGrid() {
    el.shareGrid.innerHTML = "";
    game.guesses.forEach(function (g) {
      g.tiers.forEach(function (t) {
        var s = document.createElement("span");
        s.style.background = "var(--" + TIERS[t].key + ")";
        el.shareGrid.appendChild(s);
      });
    });
  }

  function defaultStats() { return { played: 0, won: 0, streak: 0, best: 0, perfect: 0, lastNumber: null }; }
  function recordStats(won) {
    if (!game.isDaily) return;
    var s = load(KEY.stats, defaultStats());
    var n = puzzleNumber();
    if (s.lastNumber === n) return;
    s.played++;
    if (won) {
      s.won++;
      if (game.mistakes === 0) s.perfect++;
      s.streak = (s.lastNumber === n - 1) ? s.streak + 1 : 1;
      if (s.streak > s.best) s.best = s.streak;
    } else { s.streak = 0; }
    s.lastNumber = n;
    save(KEY.stats, s);
  }

  function shareText() {
    var head = "Back Four " + (game.isDaily ? "#" + puzzleNumber() : "Puzzle " + game.puzzle.id) + " — " + game.puzzle.theme;
    var grid = game.guesses.map(function (g) {
      return g.tiers.map(function (t) { return TIERS[t].emoji; }).join("");
    }).join("\n");
    var result = game.won ? (game.mistakes === 0 ? "Clean sheet" : (MAX_MISTAKES - game.mistakes) + "/4 lives left") : "Full time";
    return head + "\n" + result + "\n" + grid + "\nplay: backfour.game";
  }

  function doShare() {
    var text = shareText();
    if (navigator.share) { navigator.share({ text: text }).catch(function () { copy(text); }); }
    else { copy(text); }
  }
  function copy(text) {
    var done = function () { el.share.textContent = "Copied!"; setTimeout(function () { el.share.textContent = "Share result"; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else { fallbackCopy(text, done); }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  function openModal(title, html) {
    el.modalTitle.textContent = title; el.modalBody.innerHTML = html; el.modal.hidden = false;
  }
  function closeModal() { el.modal.hidden = true; }

  function howToPlay() {
    openModal("How to play", [
      "<p>Every tile fits the day's <strong>theme</strong>. Your job is to split the 16 into the <strong>four groups of four</strong> hiding inside it.</p>",
      "<ul>",
      "<li>Pick four tiles, then <strong>Submit</strong>.</li>",
      "<li><strong>Four mistakes</strong> and it's full time.</li>",
      "<li>Three of four right? You'll be told you're <strong>one away</strong>.</li>",
      "</ul>",
      "<p>Groups get harder as you climb the competitions:</p>",
      '<div class="ladder">',
      '<div class="ladder-row"><span class="ladder-chip t0"></span><b>League Cup</b><span>— the gimme</span></div>',
      '<div class="ladder-row"><span class="ladder-chip t1"></span><b>FA Cup</b><span>— steady</span></div>',
      '<div class="ladder-row"><span class="ladder-chip t2"></span><b>Premier League</b><span>— tricky</span></div>',
      '<div class="ladder-row"><span class="ladder-chip t3"></span><b>Champions League</b><span>— the killer</span></div>',
      "</div>",
      "<p>Watch for tiles that <strong>look like they fit two groups</strong> — a player who turned out for both rivals, a name that's also a place. Only one full set of four groups works. That's the whole game.</p>"
    ].join(""));
  }

  function showStats() {
    var s = load(KEY.stats, defaultStats());
    var pct = s.played ? Math.round((s.won / s.played) * 100) : 0;
    openModal("Your record", [
      '<div class="stats-grid">',
      '<div class="stat"><b>' + s.played + "</b><span>Played</span></div>",
      '<div class="stat"><b>' + pct + "%</b><span>Win rate</span></div>",
      '<div class="stat"><b>' + s.streak + "</b><span>Streak</span></div>",
      '<div class="stat"><b>' + s.best + "</b><span>Best</span></div>",
      "</div>",
      "<p style='margin-top:14px'>Clean sheets (solved with no mistakes): <strong>" + s.perfect + "</strong></p>",
      "<p>Only the daily puzzle counts toward your streak — archive rounds are just for fun.</p>"
    ].join(""));
  }

  function showArchive() {
    var today = todayIndex();
    var html = ['<p>Every puzzle in the book. Today\'s is marked.</p><div class="archive-list">'];
    PUZZLES.forEach(function (p, i) {
      var prog = load(KEY.progress + p.id, null);
      var tag = (prog && prog.over) ? (prog.won ? "Solved" : "Played") : (i === today ? "Today" : "New");
      html.push(
        '<button class="archive-item' + (prog && prog.won ? " done" : "") + '" data-index="' + i + '">' +
        "<span>" + p.id + ". " + p.name + ' <span class="a-theme">· ' + p.theme + "</span></span>" +
        '<span class="tag">' + tag + "</span></button>"
      );
    });
    html.push("</div>");
    openModal("Puzzle archive", html.join(""));
    Array.prototype.forEach.call(el.modalBody.querySelectorAll(".archive-item"), function (b) {
      b.addEventListener("click", function () {
        var idx = parseInt(b.dataset.index, 10);
        closeModal(); resetView();
        startPuzzle(idx, idx === todayIndex());
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function resetView() {
    el.endgame.hidden = true; el.controls.hidden = false; el.mistakesRow.hidden = false; say("");
  }

  el.submit.addEventListener("click", submit);
  el.deselect.addEventListener("click", function () {
    if (game.busy) return; game.selected = []; renderBoard(false); updateControls(); say("");
  });
  el.shuffle.addEventListener("click", function () {
    if (game.busy) return; game.order = shuffle(game.order); renderBoard(true); updateControls();
  });
  el.share.addEventListener("click", doShare);
  el.next.addEventListener("click", showArchive);

  document.getElementById("btn-how").addEventListener("click", howToPlay);
  document.getElementById("btn-stats").addEventListener("click", showStats);
  document.getElementById("btn-archive").addEventListener("click", showArchive);
  el.modalClose.addEventListener("click", closeModal);
  el.modal.addEventListener("click", function (e) { if (e.target === el.modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
    if (e.key === "Enter" && !el.submit.disabled && el.modal.hidden) submit();
  });

  function requestedIndex() {
    var m = /[?&]p=(\d+)/.exec(window.location.search);
    if (!m) return null;
    for (var i = 0; i < PUZZLES.length; i++) { if (PUZZLES[i].id === parseInt(m[1], 10)) return i; }
    return null;
  }

  var boot = requestedIndex();
  if (boot === null) { startPuzzle(todayIndex(), true); }
  else { startPuzzle(boot, boot === todayIndex()); }

  if (!load(KEY.seen, false)) { howToPlay(); save(KEY.seen, true); }
})();
