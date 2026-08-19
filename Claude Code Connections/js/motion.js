/* Back Four — ambient parallax + tactile tile motion (progressive enhancement) */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  /* ---------- cursor parallax on the floating art ---------- */
  var floaties = Array.prototype.slice.call(document.querySelectorAll(".floaty"));
  var tx = 0, ty = 0, cx = 0, cy = 0, ticking = false;

  function onMove(e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!ticking) { ticking = true; requestAnimationFrame(loop); }
  }
  function loop() {
    cx += (tx - cx) * 0.09;
    cy += (ty - cy) * 0.09;
    for (var i = 0; i < floaties.length; i++) {
      var d = parseFloat(floaties[i].getAttribute("data-depth")) || 20;
      floaties[i].style.transform = "translate3d(" + (-cx * d).toFixed(2) + "px," + (-cy * d).toFixed(2) + "px,0)";
    }
    if (Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015) requestAnimationFrame(loop);
    else ticking = false;
  }
  if (floaties.length) window.addEventListener("mousemove", onMove, { passive: true });

  /* ---------- 3D tile tilt toward the cursor ---------- */
  var board = document.getElementById("board");
  if (!board) return;
  var raf = null, pending = null, MAX = 9;

  board.addEventListener("pointermove", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    var tile = e.target.closest ? e.target.closest(".tile") : null;
    if (!tile) return;
    pending = { tile: tile, x: e.clientX, y: e.clientY };
    if (!raf) raf = requestAnimationFrame(applyTilt);
  }, { passive: true });

  function applyTilt() {
    raf = null;
    if (!pending) return;
    var tile = pending.tile, r = tile.getBoundingClientRect();
    var px = (pending.x - r.left) / r.width - 0.5;
    var py = (pending.y - r.top) / r.height - 0.5;
    tile.classList.add("tilting");
    tile.style.setProperty("--ry", (px * MAX).toFixed(2) + "deg");
    tile.style.setProperty("--rx", (-py * MAX).toFixed(2) + "deg");
  }
  function resetTile(t) {
    t.classList.remove("tilting");
    t.style.setProperty("--rx", "0deg");
    t.style.setProperty("--ry", "0deg");
  }
  board.addEventListener("pointerout", function (e) {
    var tile = e.target.closest ? e.target.closest(".tile") : null;
    if (tile && (!e.relatedTarget || !tile.contains(e.relatedTarget))) resetTile(tile);
  }, { passive: true });
  board.addEventListener("pointerleave", function () {
    var t = board.querySelectorAll(".tile");
    for (var i = 0; i < t.length; i++) resetTile(t[i]);
  }, { passive: true });
})();
