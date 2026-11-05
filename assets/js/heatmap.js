/* ============================================================================
 * SciClaimEval — interactive per-sample evaluation heatmap.
 *
 * A port of vis/heatmap.py (the matplotlib script that produced the static
 * figures) to a canvas-rendered, hoverable page. The Python script remains the
 * source of truth for row/column ordering, grouping, gaps, colours and the
 * consensus track; this file reproduces that behaviour with one deliberate
 * difference, flagged at DIFFERENCE-FROM-PYTHON below.
 *
 * Data: assets/complete_run_results.json, fetched at runtime, never modified.
 * ========================================================================== */
(function () {
  "use strict";

  /* ── Hugging Face links ───────────────────────────────────────────────────
   * The test set is gated until after NTCIR-19. We never probe whether it is
   * public — a gated visitor simply lands on the dataset page, which is fine.
   * While a template is still TODO_FILL_IN, every link falls back to the
   * dataset page. */
  const HF_SAMPLE_URL = {
    1: "TODO_FILL_IN?q={id}",
    2: "TODO_FILL_IN?q={id}",
  };
  const HF_DATASET_URL =
    "https://huggingface.co/datasets/alabnii/sciclaimeval-shared-task-test";

  const DATA_URL = "/assets/complete_run_results.json";

  /* ── Palette (verbatim from heatmap.py) ──────────────────────────────── */

  const TEAM_PALETTE = [
    "#1F77B4", "#E31A1C", "#2CA02C", "#D95F02", "#6A3D9A", "#B8860B", "#1B9E77",
    "#E7298A", "#08519C", "#A63603", "#66A61E", "#8C001A", "#4A1486", "#8C564B",
  ];

  const WRONG = "#e07a5f";
  const CORRECT = "#e7e7e7";

  /* 4-outcome palette, ordered by code 0..3 — Subtask 1 only.
   *   0 = False Negative, 1 = False Positive, 2 = True Negative, 3 = True Positive
   * FN/FP and TN/TP deliberately share colours with the binary view so the two
   * views read as the same barcode with extra detail, not a different chart. */
  const OUTCOME_COLORS = { 0: "#e07a5f", 1: "#f2cc8f", 2: "#e7e7e7", 3: "#e7e7e7" };
  const OUTCOME_LABELS = {
    0: "False Negative", 1: "False Positive", 2: "True Negative", 3: "True Positive",
  };

  const EVI_TYPE_ORDER = ["figure", "table"];
  const EVI_TYPE_LABELS = { figure: "Figures", table: "Tables" };

  const GAP_MAJOR = 2; // blank columns between evidence-type groups
  const GAP_MINOR = 2; // blank columns between operation groups
  const TICK_EVERY = 10; // claim-id tick spacing in dataset-order mode

  /* Evidence-format filters. Every TeX run in the data is also an HTML run
   * (evidence_format is always ".PNG", ".TEX and/or .HTML" or ".JSON"), so TeX
   * and HTML are one option here rather than two identical ones — matching how
   * the results tables on the home page already label it. */
  const FORMAT_FILTERS = [
    { key: "png", label: "PNG", formats: ["png"] },
    { key: "texhtml", label: "TeX / HTML", formats: ["tex", "html"] },
    { key: "json", label: "JSON", formats: ["json"] },
    { key: "all", label: "All", formats: null },
  ];

  /* The sentinel `pair` value for Supported claims that have no partner. */
  const NO_PAIR = "no pair";

  /* ── 256-stop viridis, sampled from matplotlib ───────────────────────── */
  const VIRIDIS = [
    [68,1,84],[68,2,86],[69,4,87],[69,5,89],[70,7,90],[70,8,92],[70,10,93],[70,11,94],
    [71,13,96],[71,14,97],[71,16,99],[71,17,100],[71,19,101],[72,20,103],[72,22,104],[72,23,105],
    [72,24,106],[72,26,108],[72,27,109],[72,28,110],[72,29,111],[72,31,112],[72,32,113],[72,33,115],
    [72,35,116],[72,36,117],[72,37,118],[72,38,119],[72,40,120],[72,41,121],[71,42,122],[71,44,122],
    [71,45,123],[71,46,124],[71,47,125],[70,48,126],[70,50,126],[70,51,127],[70,52,128],[69,53,129],
    [69,55,129],[69,56,130],[68,57,131],[68,58,131],[68,59,132],[67,61,132],[67,62,133],[66,63,133],
    [66,64,134],[66,65,134],[65,66,135],[65,68,135],[64,69,136],[64,70,136],[63,71,136],[63,72,137],
    [62,73,137],[62,74,137],[62,76,138],[61,77,138],[61,78,138],[60,79,138],[60,80,139],[59,81,139],
    [59,82,139],[58,83,139],[58,84,140],[57,85,140],[57,86,140],[56,88,140],[56,89,140],[55,90,140],
    [55,91,141],[54,92,141],[54,93,141],[53,94,141],[53,95,141],[52,96,141],[52,97,141],[51,98,141],
    [51,99,141],[50,100,142],[50,101,142],[49,102,142],[49,103,142],[49,104,142],[48,105,142],[48,106,142],
    [47,107,142],[47,108,142],[46,109,142],[46,110,142],[46,111,142],[45,112,142],[45,113,142],[44,113,142],
    [44,114,142],[44,115,142],[43,116,142],[43,117,142],[42,118,142],[42,119,142],[42,120,142],[41,121,142],
    [41,122,142],[41,123,142],[40,124,142],[40,125,142],[39,126,142],[39,127,142],[39,128,142],[38,129,142],
    [38,130,142],[38,130,142],[37,131,142],[37,132,142],[37,133,142],[36,134,142],[36,135,142],[35,136,142],
    [35,137,142],[35,138,141],[34,139,141],[34,140,141],[34,141,141],[33,142,141],[33,143,141],[33,144,141],
    [33,145,140],[32,146,140],[32,146,140],[32,147,140],[31,148,140],[31,149,139],[31,150,139],[31,151,139],
    [31,152,139],[31,153,138],[31,154,138],[30,155,138],[30,156,137],[30,157,137],[31,158,137],[31,159,136],
    [31,160,136],[31,161,136],[31,161,135],[31,162,135],[32,163,134],[32,164,134],[33,165,133],[33,166,133],
    [34,167,133],[34,168,132],[35,169,131],[36,170,131],[37,171,130],[37,172,130],[38,173,129],[39,173,129],
    [40,174,128],[41,175,127],[42,176,127],[44,177,126],[45,178,125],[46,179,124],[47,180,124],[49,181,123],
    [50,182,122],[52,182,121],[53,183,121],[55,184,120],[56,185,119],[58,186,118],[59,187,117],[61,188,116],
    [63,188,115],[64,189,114],[66,190,113],[68,191,112],[70,192,111],[72,193,110],[74,193,109],[76,194,108],
    [78,195,107],[80,196,106],[82,197,105],[84,197,104],[86,198,103],[88,199,101],[90,200,100],[92,200,99],
    [94,201,98],[96,202,96],[99,203,95],[101,203,94],[103,204,92],[105,205,91],[108,205,90],[110,206,88],
    [112,207,87],[115,208,86],[117,208,84],[119,209,83],[122,209,81],[124,210,80],[127,211,78],[129,211,77],
    [132,212,75],[134,213,73],[137,213,72],[139,214,70],[142,214,69],[144,215,67],[147,215,65],[149,216,64],
    [152,216,62],[155,217,60],[157,217,59],[160,218,57],[162,218,55],[165,219,54],[168,219,52],[170,220,50],
    [173,220,48],[176,221,47],[178,221,45],[181,222,43],[184,222,41],[186,222,40],[189,223,38],[192,223,37],
    [194,223,35],[197,224,33],[200,224,32],[202,225,31],[205,225,29],[208,225,28],[210,226,27],[213,226,26],
    [216,226,25],[218,227,25],[221,227,24],[223,227,24],[226,228,24],[229,228,25],[231,228,25],[234,229,26],
    [236,229,27],[239,229,28],[241,229,29],[244,230,30],[246,230,32],[248,230,33],[251,231,35],[253,231,37],
  ];

  function viridis(t) {
    if (t === null || t === undefined || Number.isNaN(t)) return null;
    const i = Math.max(0, Math.min(255, Math.round(t * 255)));
    const c = VIRIDIS[i];
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  /* ── Small helpers ───────────────────────────────────────────────────── */

  /* Claim IDs consistently end in a 4-digit number (e.g. test_tab_0011) — show
   * just that number in tick labels for readability. Mirrors _short_id(). */
  function shortId(qid) {
    const s = String(qid);
    return s.length >= 4 ? s.slice(-4) : s;
  }

  /* Lowercase + strip for label comparisons — some submissions came back
   * capitalized, and this makes every comparison (correctness, agreement,
   * outcome codes) robust to that regardless of task/vocabulary. */
  function norm(s) {
    return String(s === null || s === undefined ? "" : s).trim().toLowerCase();
  }

  function fmtPct(x, digits) {
    return x === null || x === undefined || Number.isNaN(x)
      ? "–"
      : x.toFixed(digits === undefined ? 1 : digits);
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  /* Team labels carry "\n" for a line break (e.g. "Bonn-Juelich\nInformatics"). */
  function labelLines(label) {
    return String(label).split("\n");
  }

  function sampleUrl(taskNum, id) {
    const tpl = HF_SAMPLE_URL[taskNum];
    if (!tpl || tpl.indexOf("TODO_FILL_IN") !== -1) return HF_DATASET_URL;
    return tpl.replace("{id}", encodeURIComponent(id));
  }

  /* ========================================================================
   * State
   * ===================================================================== */

  const DEFAULTS = {
    task: "1",
    format: "png",
    top: "0",
    sort: "difficulty",
    evi: "1",
    op: "0",
    view: "binary",
    consensus: "1",
  };

  const state = Object.assign({}, DEFAULTS);

  function readUrlState() {
    const q = new URLSearchParams(window.location.search);
    Object.keys(DEFAULTS).forEach(function (k) {
      if (q.has(k)) state[k] = q.get(k);
    });
    // Guard against hand-edited / stale URLs selecting an impossible view.
    if (state.task !== "1" && state.task !== "2") state.task = "1";
    if (!FORMAT_FILTERS.some(function (f) { return f.key === state.format; })) {
      state.format = DEFAULTS.format;
    }
    if (state.task === "2") {
      state.op = "0";
      state.view = "binary";
    }
  }

  function writeUrlState() {
    const q = new URLSearchParams();
    Object.keys(DEFAULTS).forEach(function (k) {
      if (state[k] !== DEFAULTS[k]) q.set(k, state[k]);
    });
    const s = q.toString();
    const url = window.location.pathname + (s ? "?" + s : "");
    window.history.replaceState(null, "", url);
  }

  const on = function (k) { return state[k] === "1" || state[k] === "true"; };

  /* ========================================================================
   * Model — everything derived from the raw JSON for the current controls.
   * ===================================================================== */

  let DATA = null;

  /* Per-task caches that don't depend on the controls, built once. */
  const taskCache = {};

  function buildTaskCache(taskNum) {
    const key = String(taskNum);
    if (taskCache[key]) return taskCache[key];

    const T = DATA.tasks[key];
    const labels = T.labels;
    const samples = T.samples;
    const n = samples.length;

    /* Decode every run's preds string once: a base-36 digit indexes `labels`,
     * "-" means the run made no prediction for that sample. Correctness is
     * derived here from normalized pred/true, never trusted from elsewhere —
     * some submissions came back capitalized, and recomputing both the sort
     * key and the consensus rows from the same normalized source guarantees
     * they cannot disagree. */
    const trueNorm = samples.map(function (s) { return norm(s.label); });
    const positive = T.positive_label ? norm(T.positive_label) : null;

    const runs = T.runs.map(function (r, ri) {
      const preds = r.preds;
      const pred = new Array(n);      // normalized predicted label, or null
      const predRaw = new Array(n);   // as-written label, for display
      const correct = new Int8Array(n); // 1 / 0; meaningless where pred is null
      const outcome = new Int8Array(n); // 0..3, Subtask 1 only
      let nCorrect = 0;
      let nAnswered = 0;

      for (let i = 0; i < n; i++) {
        const c = preds.charAt(i);
        if (c === "-") { pred[i] = null; predRaw[i] = null; continue; }
        const raw = labels[parseInt(c, 36)];
        predRaw[i] = raw;
        const p = norm(raw);
        pred[i] = p;
        nAnswered++;
        const ok = p === trueNorm[i];
        correct[i] = ok ? 1 : 0;
        if (ok) nCorrect++;
        if (positive !== null) {
          const tp = trueNorm[i] === positive;
          const pp = p === positive;
          outcome[i] = tp && pp ? 3 : (!tp && !pp ? 2 : (!tp && pp ? 1 : 0));
        }
      }

      return {
        idx: ri,
        file: r.file,
        run_id: r.run_id,
        team: r.team,
        timestamp: r.timestamp,
        evidence_format: r.evidence_format,
        formats: r.formats || [],
        method_name: r.method_name,
        metrics: r.metrics || {},
        n_correct: r.n_correct,
        n_answered: r.n_answered,
        pred: pred,
        predRaw: predRaw,
        correct: correct,
        outcome: outcome,
        /* Verified against the JSON at load; see checkIntegrity(). */
        computed_n_correct: nCorrect,
        computed_n_answered: nAnswered,
      };
    });

    /* Pairs (Subtask 1). `pair` alone is almost unique, but the sentinel
     * "no pair" is shared by 42 partnerless Supported claims across BOTH
     * evidence types — so the key has to include evi_type, and the sentinel
     * has to mean "no partner" rather than "a 42-way pair". */
    const partner = new Array(n).fill(-1);
    if (key === "1") {
      const groups = new Map();
      samples.forEach(function (s, i) {
        if (s.pair === NO_PAIR || s.pair === undefined || s.pair === null) return;
        const gk = s.evi_type + "\u0000" + s.pair;
        if (!groups.has(gk)) groups.set(gk, []);
        groups.get(gk).push(i);
      });
      groups.forEach(function (ix) {
        if (ix.length === 2) {
          partner[ix[0]] = ix[1];
          partner[ix[1]] = ix[0];
        }
      });
    }

    const cache = {
      taskNum: Number(key),
      name: T.name,
      idField: T.id_field,
      labels: labels,
      positive: positive,
      positiveRaw: T.positive_label,
      samples: samples,
      trueNorm: trueNorm,
      teams: T.teams,
      runs: runs,
      partner: partner,
      n: n,
    };
    taskCache[key] = cache;
    return cache;
  }

  /* Which format filters actually have runs for this task. */
  function availableFormats(task) {
    return FORMAT_FILTERS.filter(function (f) {
      if (!f.formats) return task.runs.length > 0;
      return task.runs.some(function (r) { return matchesFormat(r, f); });
    });
  }

  function matchesFormat(run, filter) {
    if (!filter || !filter.formats) return true;
    return filter.formats.some(function (f) { return run.formats.indexOf(f) !== -1; });
  }

  /* Display accuracy = the organisers' official metric (n_correct over ALL
   * samples), which is also what the right-edge numbers on the static figure
   * are and what the leaderboard tables on the home page show. Runs that
   * skipped samples are not rewarded for skipping. Missing cells are still
   * drawn blank and still stay out of the per-column difficulty rate and the
   * consensus means below. */
  function displayAccuracy(run, nSamples) {
    const m = run.metrics || {};
    if (typeof m.accuracy === "number") return m.accuracy;
    return (run.n_correct / nSamples) * 100;
  }

  /* ── The model for the current control state ─────────────────────────── */

  function buildModel() {
    const task = buildTaskCache(state.task);
    const filter = FORMAT_FILTERS.filter(function (f) { return f.key === state.format; })[0];
    const n = task.n;

    let runs = task.runs.filter(function (r) { return matchesFormat(r, filter); });
    if (!runs.length) return { task: task, empty: true, filter: filter };

    /* Rows: teams by their best run's number of correct cells (descending),
     * runs inside a team by accuracy (descending). Team colours are assigned
     * in that order. Mirrors heatmap.py exactly. */
    const byTeam = new Map();
    runs.forEach(function (r) {
      if (!byTeam.has(r.team)) byTeam.set(r.team, []);
      byTeam.get(r.team).push(r);
    });

    const teamBest = new Map();
    byTeam.forEach(function (rs, t) {
      teamBest.set(t, Math.max.apply(null, rs.map(function (r) { return r.n_correct; })));
    });

    const teamOrder = Array.from(byTeam.keys()).sort(function (a, b) {
      const d = teamBest.get(b) - teamBest.get(a);
      return d !== 0 ? d : String(a).localeCompare(String(b));
    });

    const teamColor = new Map();
    teamOrder.forEach(function (t, i) {
      teamColor.set(t, TEAM_PALETTE[i % TEAM_PALETTE.length]);
    });

    byTeam.forEach(function (rs) {
      rs.sort(function (a, b) {
        return displayAccuracy(b, n) - displayAccuracy(a, n);
      });
    });

    /* With "only best run per team", the barcode shows each team's top run —
     * and, per DIFFERENCE-FROM-PYTHON below, the consensus rows and the
     * difficulty sort use exactly those same rows. */
    const visibleRuns = [];
    const rowItems = []; // {type: "run"|"gap", run?, team?}
    teamOrder.forEach(function (t, ti) {
      if (ti > 0) rowItems.push({ type: "gap" });
      const rs = on("top") ? byTeam.get(t).slice(0, 1) : byTeam.get(t);
      rs.forEach(function (r) {
        visibleRuns.push(r);
        rowItems.push({ type: "run", run: r, team: t });
      });
    });

    /* ── Consensus + difficulty, over the VISIBLE runs ──────────────────
     * DIFFERENCE-FROM-PYTHON: heatmap.py sorts columns by difficulty using
     * every format-matching run, but draws the consensus track from the
     * displayed runs only — so with TOP_PERFORMER=True its sort and its
     * "Majority correct" row can disagree. Here both read the same rows, so
     * the Majority row is always monotonic with the hardest→easiest order. */
    const pCorrect = new Float64Array(n).fill(NaN);
    const agreement = new Float64Array(n).fill(NaN);
    const majority = new Float64Array(n).fill(NaN);
    const nVotes = new Int32Array(n);

    for (let i = 0; i < n; i++) {
      const counts = new Map();
      let votes = 0;
      let nc = 0;
      for (let k = 0; k < visibleRuns.length; k++) {
        const p = visibleRuns[k].pred[i];
        if (p === null) continue;
        votes++;
        counts.set(p, (counts.get(p) || 0) + 1);
        if (p === task.trueNorm[i]) nc++;
      }
      nVotes[i] = votes;
      if (!votes) continue;
      pCorrect[i] = nc / votes;
      if (votes >= 2) {
        /* Fraction of all run pairs that made the same call as each other
         * (not whether that call was right) — grouped by whichever distinct
         * vote values actually occur, so this works for any label vocabulary,
         * including the stray free-text answers a few submissions returned. */
        let agreePairs = 0;
        counts.forEach(function (c) { agreePairs += (c * (c - 1)) / 2; });
        agreement[i] = agreePairs / ((votes * (votes - 1)) / 2);
      }
      /* For a strictly binary label, "more than half the votes were correct"
       * and "the majority's predicted label matched the truth" are the same
       * statement — thresholding P(correct) directly avoids needing a
       * tie-break rule for 50/50 splits that could disagree with the sort. */
      majority[i] = pCorrect[i] >= 0.5 ? 1 : 0;
    }

    /* ── Columns: grouping, then difficulty or dataset order ───────────── */
    const colItems = []; // {type: "col", sample, i} | {type: "gap", width}
    const groupSpans = []; // {label, level, start, end}
    const leafSpans = []; // {start, end}
    const tickItems = []; // {pos, sample}
    let disp = 0;
    let globalCounter = 0;

    const idxs = [];
    for (let i = 0; i < n; i++) idxs.push(i);

    let superKeys, superKeyFn;
    if (on("evi")) {
      const present = new Set(task.samples.map(function (s) { return s.evi_type; }));
      superKeys = EVI_TYPE_ORDER.filter(function (g) { return present.has(g); });
      if (task.samples.some(function (s) { return EVI_TYPE_ORDER.indexOf(s.evi_type) === -1; })) {
        superKeys.push("unknown");
      }
      superKeyFn = function (i) {
        const t = task.samples[i].evi_type;
        return EVI_TYPE_ORDER.indexOf(t) !== -1 ? t : "unknown";
      };
    } else {
      superKeys = [null];
      superKeyFn = function () { return null; };
    }

    const groupByOp = on("op") && state.task === "1";

    superKeys.forEach(function (skey, si) {
      if (si > 0) { colItems.push({ type: "gap", width: GAP_MAJOR }); disp += GAP_MAJOR; }
      const superCols = idxs.filter(function (i) { return superKeyFn(i) === skey; });
      if (!superCols.length) return;
      const superStart = disp;

      let subKeys, subKeyFn;
      if (groupByOp) {
        /* The `operation` stored on a Supported claim is its PAIR's operation
         * (both members share it), so it must not be used to bucket Supported
         * claims — they all belong in "original". */
        subKeyFn = function (i) {
          if (task.trueNorm[i] === task.positive) return "original";
          return task.samples[i].operation || "unknown";
        };
        const present = new Set(superCols.map(subKeyFn));
        subKeys = present.has("original") ? ["original"] : [];
        subKeys = subKeys.concat(
          Array.from(present)
            .filter(function (k) { return k !== "original" && k !== "unknown"; })
            .sort()
        );
        if (present.has("unknown")) subKeys.push("unknown");
      } else {
        subKeys = [null];
        subKeyFn = function () { return null; };
      }

      subKeys.forEach(function (subkey, sj) {
        if (sj > 0) { colItems.push({ type: "gap", width: GAP_MINOR }); disp += GAP_MINOR; }
        const subCols = superCols.filter(function (i) { return subKeyFn(i) === subkey; });
        if (!subCols.length) return;
        const subStart = disp;

        if (state.sort === "difficulty") {
          /* Hardest first. A column with no visible votes at all (NaN) sorts
           * to the hard end, where a 0% column would sit anyway. */
          subCols.sort(function (a, b) {
            const pa = Number.isNaN(pCorrect[a]) ? -1 : pCorrect[a];
            const pb = Number.isNaN(pCorrect[b]) ? -1 : pCorrect[b];
            return pa !== pb ? pa - pb : a - b;
          });
        } else {
          subCols.sort(function (a, b) { return a - b; }); // dataset order
        }

        subCols.forEach(function (i) {
          colItems.push({ type: "col", i: i, sample: task.samples[i] });
          if (state.sort !== "difficulty" && globalCounter % TICK_EVERY === 0) {
            tickItems.push({ pos: disp, sample: task.samples[i] });
          }
          globalCounter++;
          disp++;
        });

        leafSpans.push({ start: subStart, end: disp - 1 });
        if (groupByOp) {
          groupSpans.push({ label: subkey, level: 2, start: subStart, end: disp - 1 });
        }
      });

      if (on("evi")) {
        groupSpans.push({
          label: EVI_TYPE_LABELS[skey] || String(skey).replace(/^./, function (c) { return c.toUpperCase(); }),
          level: 1,
          start: superStart,
          end: disp - 1,
        });
      }
    });

    const nCols = disp;
    /* colOf[displayColumn] -> sample index, or -1 for a gap column. */
    const colOf = new Int32Array(nCols).fill(-1);
    let cursor = 0;
    for (let k = 0; k < colItems.length; k++) {
      const it = colItems[k];
      if (it.type === "gap") { cursor += it.width; }
      else { colOf[cursor] = it.i; cursor++; }
    }

    return {
      task: task,
      filter: filter,
      empty: false,
      teamOrder: teamOrder,
      teamColor: teamColor,
      rowItems: rowItems,
      visibleRuns: visibleRuns,
      nRows: rowItems.length,
      nCols: nCols,
      colOf: colOf,
      groupSpans: groupSpans,
      leafSpans: leafSpans,
      tickItems: tickItems,
      pCorrect: pCorrect,
      agreement: agreement,
      majority: majority,
      nVotes: nVotes,
    };
  }

  /* ========================================================================
   * Layout + rendering
   * ===================================================================== */

  const LAYOUT = {
    minCellW: 1,      // never squash a column below this
    maxCellW: 6,
    rowH: 11,         // matrix row height (incl. the blank team-gap rows)
    consensusRowH: 11,
    consensusGap: 14, // vertical space between matrix and consensus track
  };

  const dom = {};
  let model = null;
  let geom = null;
  let pinned = null;  // {col, rowIdx|null, kind} while a panel is pinned
  let hovered = null;

  function computeGeometry(availableWidth) {
    const nCols = model.nCols;
    let cellW = availableWidth / nCols;
    cellW = Math.min(LAYOUT.maxCellW, cellW);
    /* On narrow screens, scroll horizontally rather than squashing columns
     * below ~1px, where the barcode stops being readable at all. */
    const scroll = cellW < LAYOUT.minCellW;
    if (scroll) cellW = LAYOUT.minCellW;

    const width = Math.max(1, Math.round(cellW * nCols));
    const matrixH = model.nRows * LAYOUT.rowH;
    const consensusH = on("consensus") ? 3 * LAYOUT.consensusRowH : 0;

    return {
      cellW: cellW,
      width: width,
      matrixH: matrixH,
      consensusH: consensusH,
      scroll: scroll,
    };
  }

  function setupCanvas(canvas, cssW, cssH) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    /* Crisp 1px columns: no smoothing between adjacent cells. */
    ctx.imageSmoothingEnabled = false;
    return ctx;
  }

  function cellColor(run, i) {
    if (run.pred[i] === null) return null; // blank, and out of every mean
    if (state.view === "outcome" && state.task === "1") {
      return OUTCOME_COLORS[run.outcome[i]];
    }
    return run.correct[i] ? CORRECT : WRONG;
  }

  function drawMatrix() {
    const ctx = setupCanvas(dom.canvas, geom.width, geom.matrixH);
    const cw = geom.cellW;
    const colOf = model.colOf;

    for (let r = 0; r < model.rowItems.length; r++) {
      const item = model.rowItems[r];
      if (item.type !== "run") continue; // blank row between team blocks
      const run = item.run;
      const y = r * LAYOUT.rowH;

      /* Batch adjacent same-colour cells into one fillRect — at ~1px columns
       * this turns ~70k draw calls into a few hundred and is what keeps a
       * redraw on resize inside a frame. */
      let runStart = 0;
      let runColor = null;
      for (let c = 0; c <= model.nCols; c++) {
        const i = c < model.nCols ? colOf[c] : -2;
        const color = i >= 0 ? cellColor(run, i) : null;
        if (color !== runColor || c === model.nCols) {
          if (runColor !== null) {
            ctx.fillStyle = runColor;
            const x0 = runStart * cw;
            ctx.fillRect(x0, y, Math.max(cw, c * cw - x0), LAYOUT.rowH);
          }
          runStart = c;
          runColor = color;
        }
      }
    }
  }

  function drawConsensus() {
    if (!on("consensus")) return;
    const ctx = setupCanvas(dom.consensusCanvas, geom.width, geom.consensusH);
    const cw = geom.cellW;
    const colOf = model.colOf;

    const rows = [
      { values: model.pCorrect, kind: "viridis" },
      { values: model.agreement, kind: "viridis" },
      { values: model.majority, kind: "binary" },
    ];

    rows.forEach(function (row, ri) {
      const y = ri * LAYOUT.consensusRowH;
      let runStart = 0;
      let runColor = null;
      for (let c = 0; c <= model.nCols; c++) {
        const i = c < model.nCols ? colOf[c] : -2;
        let color = null;
        if (i >= 0) {
          const v = row.values[i];
          if (!Number.isNaN(v)) {
            color = row.kind === "viridis" ? viridis(v) : (v >= 1 ? CORRECT : WRONG);
          }
        }
        if (color !== runColor || c === model.nCols) {
          if (runColor !== null) {
            ctx.fillStyle = runColor;
            const x0 = runStart * cw;
            ctx.fillRect(x0, y, Math.max(cw, c * cw - x0), LAYOUT.consensusRowH);
          }
          runStart = c;
          runColor = color;
        }
      }
    });
  }

  /* The crosshair lives on its own overlay canvas so hovering never forces a
   * redraw of the 70k-cell matrix underneath. */
  function drawCrosshair() {
    const target = hovered || pinned;
    const ctx = setupCanvas(dom.overlay, geom.width, geom.matrixH + LAYOUT.consensusGap + geom.consensusH);
    if (!target) return;
    const cw = geom.cellW;
    const x = target.col * cw;

    ctx.fillStyle = "rgba(20,20,20,0.10)";
    ctx.fillRect(0, 0, geom.width, geom.matrixH + LAYOUT.consensusGap + geom.consensusH);
    ctx.clearRect(Math.max(0, x - 0.5), 0, Math.max(cw, 1.5), geom.matrixH + LAYOUT.consensusGap + geom.consensusH);

    ctx.strokeStyle = "rgba(20,20,20,0.55)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      Math.round(x) - 0.5,
      -0.5,
      Math.max(Math.round(cw), 1) + 1,
      geom.matrixH + LAYOUT.consensusGap + geom.consensusH + 1
    );

    if (target.rowIdx !== null && target.rowIdx !== undefined && target.kind === "matrix") {
      const y = target.rowIdx * LAYOUT.rowH;
      ctx.clearRect(0, y, geom.width, LAYOUT.rowH);
      ctx.strokeRect(-0.5, Math.round(y) - 0.5, geom.width + 1, LAYOUT.rowH + 1);
    }
  }

  /* ── HTML furniture: labels, accuracies, block headers, ticks ────────── */

  function renderRowLabels() {
    dom.rowLabels.innerHTML = "";
    dom.rowValues.innerHTML = "";
    dom.rowLabels.style.height = geom.matrixH + "px";
    dom.rowValues.style.height = geom.matrixH + "px";

    /* Team name sits on the left in bold, in that team's colour, centred on
     * its block of runs. */
    const blocks = new Map();
    model.rowItems.forEach(function (item, r) {
      if (item.type !== "run") return;
      if (!blocks.has(item.team)) blocks.set(item.team, []);
      blocks.get(item.team).push(r);
    });

    blocks.forEach(function (rowsIdx, team) {
      const mid = (rowsIdx[0] + rowsIdx[rowsIdx.length - 1] + 1) / 2;
      const node = el("div", "hm-team-label");
      node.style.top = mid * LAYOUT.rowH + "px";
      node.style.color = model.teamColor.get(team);
      const meta = model.task.teams[team] || {};
      labelLines(meta.label || team).forEach(function (line, k) {
        if (k > 0) node.appendChild(document.createElement("br"));
        node.appendChild(document.createTextNode(line));
      });
      node.title = meta.name || team;
      dom.rowLabels.appendChild(node);
    });

    /* Each run's accuracy, small and grey, at the right edge. */
    model.rowItems.forEach(function (item, r) {
      if (item.type !== "run") return;
      const v = el("div", "hm-run-value", fmtPct(displayAccuracy(item.run, model.task.n)));
      v.style.top = (r + 0.5) * LAYOUT.rowH + "px";
      v.title = item.run.method_name || item.run.run_id;
      dom.rowValues.appendChild(v);
    });
  }

  /* Both hint labels together need roughly this much room; below it they
   * would print on top of each other, which is what happened on the narrow
   * operation blocks. */
  const HINT_MIN_PX = 150;
  /* A block narrower than this gets its operation name rotated. */
  const FLAT_LABEL_MIN_PX = 90;

  function renderColumnFurniture() {
    dom.blockLabels.innerHTML = "";
    dom.blockLabelsTop.innerHTML = "";
    dom.axisHints.innerHTML = "";
    dom.blockLabels.style.width = geom.width + "px";
    dom.blockLabelsTop.style.width = geom.width + "px";
    dom.axisHints.style.width = geom.width + "px";

    const cw = geom.cellW;
    let anyRotated = false;
    let anyTopLabel = false;

    model.groupSpans.forEach(function (span) {
      const node = el("div", "hm-block-label hm-level-" + span.level, String(span.label));
      const widthPx = (span.end - span.start + 1) * cw;
      const mid = (span.start + span.end + 1) / 2;

      if (span.level === 2) {
        /* Operation names go ABOVE the matrix, so they cannot collide with
         * the Figures / Tables labels underneath it. A narrow block gets a
         * rotated label anchored at its own left edge, which keeps adjacent
         * narrow groups parallel and clear of each other. */
        anyTopLabel = true;
        if (widthPx < FLAT_LABEL_MIN_PX) {
          node.classList.add("hm-rotated");
          node.style.left = span.start * cw + "px";
          anyRotated = true;
        } else {
          node.style.left = mid * cw + "px";
        }
        dom.blockLabelsTop.appendChild(node);
      } else {
        node.style.left = mid * cw + "px";
        dom.blockLabels.appendChild(node);
      }
    });

    /* Reserve only as much room above the matrix as the labels need, so the
     * figure gains no gap when operation grouping is off. The gutters read
     * this back through --hm-top-band and drop by the same amount. */
    const bandH = anyTopLabel ? (anyRotated ? 72 : 18) : 0;
    dom.blockLabelsTop.style.height = bandH + "px";
    dom.grid.style.setProperty("--hm-top-band", bandH + "px");

    if (state.sort === "difficulty") {
      dom.axisHints.classList.remove("hm-ticks-mode");
      model.leafSpans.forEach(function (span) {
        const len = span.end - span.start + 1;
        /* Measured in pixels, not columns: a 40-column block is roomy at
         * 6px/col and hopeless at 1px/col. Narrow blocks get no hints at all
         * rather than two labels printed over each other. */
        if (len * cw < HINT_MIN_PX) return;
        const offset = Math.min(15, Math.max(1, Math.floor(len / 4)));
        if (len <= 2 * offset) return;
        const a = el("div", "hm-axis-hint", "← hardest");
        a.style.left = (span.start + offset) * cw + "px";
        const b = el("div", "hm-axis-hint", "easiest →");
        b.style.left = (span.end - offset) * cw + "px";
        dom.axisHints.appendChild(a);
        dom.axisHints.appendChild(b);
      });
    } else {
      model.tickItems.forEach(function (t) {
        const node = el("div", "hm-tick", shortId(t.sample.id));
        node.style.left = t.pos * cw + "px";
        node.title = t.sample.id;
        dom.axisHints.appendChild(node);
      });
      dom.axisHints.classList.add("hm-ticks-mode");
    }
  }

  function renderConsensusLabels() {
    dom.consensusLabels.innerHTML = "";
    if (!on("consensus")) return;
    ["P(correct)", "Agreement", "Majority correct"].forEach(function (label, i) {
      const node = el("div", "hm-consensus-label", label);
      node.style.top = (i + 0.5) * LAYOUT.consensusRowH + "px";
      dom.consensusLabels.appendChild(node);
    });
  }

  function sizeLegendColumn() {
    /* The legends are absolutely positioned, so their column has no height of
     * its own — measure the lowest one and give the column that height, or
     * the consensus key gets drawn straight over the footnote below. */
    let bottom = geom.matrixH + LAYOUT.consensusGap + geom.consensusH;
    [dom.legendOutcome, dom.legendConsensus].forEach(function (n) {
      if (n.hidden) return;
      bottom = Math.max(bottom, (parseFloat(n.style.top) || 0) + n.offsetHeight);
    });
    dom.legends.style.height = bottom + "px";
  }

  /* The consensus key is several times taller than the three-row track it
   * explains, so top-aligning the two left it hanging well below the figure.
   * Bottom-align it with the last consensus row instead, which reads as
   * belonging to the track rather than floating under it. Called only after
   * the box has content, since it needs a real offsetHeight. */
  function positionConsensusLegend() {
    if (dom.legendConsensus.hidden) return;
    const trackBottom = geom.matrixH + LAYOUT.consensusGap + geom.consensusH;
    let top = trackBottom - dom.legendConsensus.offsetHeight;
    /* With few runs the matrix is short, so keep clear of the outcome key
     * sitting at the top of the same column. */
    if (!dom.legendOutcome.hidden) {
      top = Math.max(top, dom.legendOutcome.offsetHeight + 10);
    }
    dom.legendConsensus.style.top = Math.max(0, top) + "px";
  }

  function renderLegends() {
    dom.legendOutcome.style.top = "0px";

    dom.legendOutcome.innerHTML = "";
    dom.legendOutcome.hidden = !(state.view === "outcome" && state.task === "1");
    if (!dom.legendOutcome.hidden) {
      const box = el("div", "hm-legend-box");
      box.appendChild(el("div", "hm-legend-title", model.task.positiveRaw + " = positive"));
      [3, 2, 1, 0].forEach(function (code) {
        const row = el("div", "hm-legend-row");
        const sw = el("span", "hm-swatch");
        sw.style.background = OUTCOME_COLORS[code];
        row.appendChild(sw);
        row.appendChild(el("span", null, OUTCOME_LABELS[code]));
        box.appendChild(row);
      });
      dom.legendOutcome.appendChild(box);
    }

    dom.legendConsensus.innerHTML = "";
    dom.legendConsensus.hidden = !on("consensus");
    if (!dom.legendConsensus.hidden) {
      const box = el("div", "hm-legend-box");
      const gradWrap = el("div", "hm-grad-wrap");
      gradWrap.appendChild(el("div", "hm-legend-title", "P(correct) /\nAgreement"));
      const inner = el("div", "hm-grad-inner");
      const bar = el("div", "hm-grad-bar");
      /* Built from the same 256 stops the canvas samples, so the legend and
       * the track cannot drift apart. */
      bar.style.background =
        "linear-gradient(to top, " +
        VIRIDIS.map(function (c, i) {
          return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ") " + ((i / 255) * 100).toFixed(2) + "%";
        }).join(", ") +
        ")";
      const ticks = el("div", "hm-grad-ticks");
      ticks.appendChild(el("span", null, "1"));
      ticks.appendChild(el("span", null, "0"));
      inner.appendChild(bar);
      inner.appendChild(ticks);
      gradWrap.appendChild(inner);
      box.appendChild(gradWrap);

      const maj = el("div", "hm-legend-sub");
      maj.appendChild(el("div", "hm-legend-title", "Majority label"));
      [["Correct", CORRECT], ["Wrong", WRONG]].forEach(function (p) {
        const row = el("div", "hm-legend-row");
        const sw = el("span", "hm-swatch");
        sw.style.background = p[1];
        row.appendChild(sw);
        row.appendChild(el("span", null, p[0]));
        maj.appendChild(row);
      });
      box.appendChild(maj);
      dom.legendConsensus.appendChild(box);
    }

    positionConsensusLegend();
    sizeLegendColumn();
  }

  function renderTitle() {
    const fmtLabel = model.filter ? model.filter.label : "All";
    dom.title.textContent =
      "Per Sample Evaluation — Subtask " + state.task + " (" + fmtLabel + ")";
    const nRuns = model.visibleRuns ? model.visibleRuns.length : 0;
    const nTeams = model.teamOrder ? model.teamOrder.length : 0;
    dom.subtitle.textContent =
      nRuns + " run" + (nRuns === 1 ? "" : "s") +
      " from " + nTeams + " team" + (nTeams === 1 ? "" : "s") +
      " · " + model.task.n + " samples";
  }

  /* ========================================================================
   * Hit testing + the info panel
   * ===================================================================== */

  function hitTest(clientX, clientY) {
    const rect = dom.plot.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || x >= geom.width) return null;

    const col = Math.floor(x / geom.cellW);
    if (col < 0 || col >= model.nCols) return null;
    if (model.colOf[col] < 0) return null; // a gap column holds no sample

    if (y >= 0 && y < geom.matrixH) {
      const rowIdx = Math.floor(y / LAYOUT.rowH);
      const item = model.rowItems[rowIdx];
      if (!item || item.type !== "run") return null; // blank team-gap row
      return { kind: "matrix", col: col, rowIdx: rowIdx, run: item.run, i: model.colOf[col] };
    }

    const cTop = geom.matrixH + LAYOUT.consensusGap;
    if (on("consensus") && y >= cTop && y < cTop + geom.consensusH) {
      return { kind: "consensus", col: col, rowIdx: null, run: null, i: model.colOf[col] };
    }
    return null;
  }

  function section(title) {
    const s = el("div", "hm-panel-section");
    s.appendChild(el("div", "hm-panel-head", title));
    return s;
  }

  function field(parent, key, value, cls) {
    const row = el("div", "hm-panel-row" + (cls ? " " + cls : ""));
    row.appendChild(el("span", "hm-panel-key", key));
    row.appendChild(el("span", "hm-panel-val", value));
    parent.appendChild(row);
  }

  function buildPanel(hit) {
    const task = model.task;
    const i = hit.i;
    const s = task.samples[i];
    const frag = document.createDocumentFragment();

    /* ── Run ──────────────────────────────────────────────────────────── */
    if (hit.run) {
      const run = hit.run;
      const teamMeta = task.teams[run.team] || {};
      const sec = section("Run");
      const teamRow = el("div", "hm-panel-team");
      teamRow.textContent = labelLines(teamMeta.label || run.team).join(" ");
      teamRow.style.color = model.teamColor.get(run.team);
      sec.appendChild(teamRow);
      field(sec, "Method", run.method_name || "–");
      field(sec, "Accuracy", fmtPct(run.metrics.accuracy, 2) + "%");
      if (state.task === "1") {
        field(sec, "Pair accuracy",
          typeof run.metrics.pair_accuracy === "number"
            ? fmtPct(run.metrics.pair_accuracy, 2) + "%"
            : "–");
      }
      field(sec, "Run ID", run.run_id);
      field(sec, "Timestamp", run.timestamp || "–");
      field(sec, "Format", run.evidence_format || "–");
      if (run.n_answered < task.n) {
        field(sec, "Answered", run.n_answered + " / " + task.n);
      }
      frag.appendChild(sec);
    }

    /* ── Sample ───────────────────────────────────────────────────────── */
    const sec2 = section("Sample");
    field(sec2, task.idField === "claim_id" ? "Claim ID" : "Sample ID", s.id);
    field(sec2, "Evidence type", s.evi_type || "unknown");
    field(sec2, "Domain", s.domain || "–");
    if (state.task === "1") {
      /* The operation on a Supported claim is its partner's manipulation —
       * the Supported claim itself is the untouched original. */
      field(sec2, "Operation",
        task.trueNorm[i] === task.positive ? "none (original claim)" : (s.operation || "–"));
    } else if (s.operation) {
      field(sec2, "Operation", s.operation);
    }
    if (s.use_context) field(sec2, "Uses context", s.use_context);
    field(sec2, "True label", s.label, "hm-strong");

    if (hit.run) {
      const pred = hit.run.predRaw[i];
      if (pred === null) {
        field(sec2, "Predicted", "no prediction", "hm-missing");
        field(sec2, "Result", "missing — excluded from all means", "hm-missing");
      } else {
        field(sec2, "Predicted", pred, "hm-strong");
        const ok = hit.run.correct[i] === 1;
        let verdict = ok ? "Correct" : "Wrong";
        if (state.view === "outcome" && state.task === "1") {
          verdict = OUTCOME_LABELS[hit.run.outcome[i]];
        }
        const row = el("div", "hm-panel-row hm-verdict " + (ok ? "hm-ok" : "hm-bad"));
        row.appendChild(el("span", "hm-panel-key", "Result"));
        row.appendChild(el("span", "hm-panel-val", verdict));
        sec2.appendChild(row);
      }
    }
    frag.appendChild(sec2);

    /* ── Pair (Subtask 1) ─────────────────────────────────────────────── */
    if (state.task === "1") {
      const pi = task.partner[i];
      const sec3 = section("Pair");
      if (pi < 0) {
        field(sec3, "Partner", "none — unpaired claim");
      } else {
        field(sec3, "Partner ID", task.samples[pi].id);
        field(sec3, "Partner label", task.samples[pi].label);
        if (hit.run) {
          const a = hit.run.pred[i];
          const b = hit.run.pred[pi];
          if (b === null) {
            field(sec3, "Partner result", "no prediction", "hm-missing");
          } else {
            const pOk = hit.run.correct[pi] === 1;
            field(sec3, "Partner result", pOk ? "Correct" : "Wrong", pOk ? "hm-ok" : "hm-bad");
          }
          if (a === null || b === null) {
            field(sec3, "Pair correct", "unknown (missing prediction)", "hm-missing");
          } else {
            const both = hit.run.correct[i] === 1 && hit.run.correct[pi] === 1;
            field(sec3, "Pair correct", both ? "Yes — both right" : "No", both ? "hm-ok" : "hm-bad");
          }
        }
      }
      frag.appendChild(sec3);
    }

    /* ── Column stats over the visible runs ───────────────────────────── */
    const sec4 = section("Across " + model.visibleRuns.length + " shown run" +
      (model.visibleRuns.length === 1 ? "" : "s"));
    const p = model.pCorrect[i];
    const ag = model.agreement[i];
    field(sec4, "P(correct)", Number.isNaN(p) ? "–" : (p * 100).toFixed(1) + "%");
    field(sec4, "Agreement", Number.isNaN(ag) ? "–" : (ag * 100).toFixed(1) + "%");
    field(sec4, "Majority", Number.isNaN(model.majority[i])
      ? "–" : (model.majority[i] >= 1 ? "Correct" : "Wrong"),
      Number.isNaN(model.majority[i]) ? null : (model.majority[i] >= 1 ? "hm-ok" : "hm-bad"));
    if (model.nVotes[i] < model.visibleRuns.length) {
      field(sec4, "Voted", model.nVotes[i] + " / " + model.visibleRuns.length);
    }
    frag.appendChild(sec4);

    /* ── Link ─────────────────────────────────────────────────────────── */
    const link = el("a", "hm-panel-link", "Open sample on Hugging Face ↗");
    link.href = sampleUrl(Number(state.task), s.id);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    frag.appendChild(link);

    return frag;
  }

  function showPanel(hit, clientX, clientY) {
    dom.panel.innerHTML = "";
    dom.panel.appendChild(buildPanel(hit));
    dom.panel.hidden = false;
    positionPanel(clientX, clientY);
  }

  function positionPanel(clientX, clientY) {
    const pad = 14;
    const w = dom.panel.offsetWidth;
    const h = dom.panel.offsetHeight;
    let x = clientX + pad;
    let y = clientY + pad;
    if (x + w > window.innerWidth - 8) x = clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = Math.max(8, window.innerHeight - h - 8);
    if (x < 8) x = 8;
    dom.panel.style.left = x + "px";
    dom.panel.style.top = y + "px";
  }

  function hidePanel() {
    dom.panel.hidden = true;
    dom.panel.innerHTML = "";
  }

  function setPinned(hit, clientX, clientY) {
    pinned = hit;
    dom.panel.classList.add("hm-pinned");
    dom.plot.classList.add("hm-has-pin");
    showPanel(hit, clientX, clientY);
    drawCrosshair();
  }

  function clearPinned() {
    if (!pinned) return;
    pinned = null;
    dom.panel.classList.remove("hm-pinned");
    dom.plot.classList.remove("hm-has-pin");
    hidePanel();
    drawCrosshair();
  }

  /* Columns are about a pixel wide, so exact hovering is hard — arrow keys
   * step through cells while a panel is pinned. */
  function stepPinned(dCol, dRow) {
    if (!pinned) return;
    let col = pinned.col;
    let rowIdx = pinned.rowIdx;

    if (dCol) {
      let c = col;
      for (let guard = 0; guard < model.nCols; guard++) {
        c += dCol;
        if (c < 0 || c >= model.nCols) return;
        if (model.colOf[c] >= 0) { col = c; break; } // skip gap columns
      }
    }
    if (dRow && pinned.kind === "matrix") {
      let r = rowIdx;
      for (let guard = 0; guard < model.rowItems.length; guard++) {
        r += dRow;
        if (r < 0 || r >= model.rowItems.length) return;
        if (model.rowItems[r].type === "run") { rowIdx = r; break; } // skip team gaps
      }
    }

    const i = model.colOf[col];
    const hit = pinned.kind === "matrix"
      ? { kind: "matrix", col: col, rowIdx: rowIdx, run: model.rowItems[rowIdx].run, i: i }
      : { kind: "consensus", col: col, rowIdx: null, run: null, i: i };

    pinned = hit;
    dom.panel.innerHTML = "";
    dom.panel.appendChild(buildPanel(hit));
    drawCrosshair();
    scrollColumnIntoView(col);
  }

  function scrollColumnIntoView(col) {
    const x = col * geom.cellW;
    const sc = dom.scroller;
    if (x < sc.scrollLeft + 40) sc.scrollLeft = Math.max(0, x - 40);
    else if (x > sc.scrollLeft + sc.clientWidth - 40) sc.scrollLeft = x - sc.clientWidth + 40;
  }

  /* ========================================================================
   * Controls
   * ===================================================================== */

  function buildControls() {
    const task = buildTaskCache(state.task);
    const isT1 = state.task === "1";

    /* Only offer formats that actually have runs for the current subtask. */
    const avail = availableFormats(task);
    if (!avail.some(function (f) { return f.key === state.format; })) {
      state.format = avail.length ? avail[0].key : "all";
    }

    dom.controls.innerHTML = "";

    function group(label, name, options, current, onPick, hidden) {
      if (hidden) return;
      const g = el("div", "hm-control");
      g.appendChild(el("span", "hm-control-label", label));
      const btns = el("div", "hm-btn-group");
      btns.setAttribute("role", "group");
      btns.setAttribute("aria-label", label);
      options.forEach(function (opt) {
        const b = el("button", "hm-btn" + (opt.value === current ? " active" : ""), opt.label);
        b.type = "button";
        b.setAttribute("aria-pressed", opt.value === current ? "true" : "false");
        if (opt.title) b.title = opt.title;
        b.addEventListener("click", function () { onPick(opt.value); });
        btns.appendChild(b);
      });
      g.appendChild(btns);
      dom.controls.appendChild(g);
    }

    function toggle(label, key, title, hidden) {
      if (hidden) return;
      const g = el("div", "hm-control hm-control-toggle");
      const id = "hm-toggle-" + key;
      const input = el("input");
      input.type = "checkbox";
      input.id = id;
      input.checked = on(key);
      input.addEventListener("change", function () {
        state[key] = input.checked ? "1" : "0";
        apply();
      });
      const lab = el("label", "hm-control-label", label);
      lab.setAttribute("for", id);
      if (title) lab.title = title;
      g.appendChild(input);
      g.appendChild(lab);
      dom.controls.appendChild(g);
    }

    group("Subtask", "task",
      [{ value: "1", label: "1", title: "Claim verification" },
       { value: "2", label: "2", title: "Pick the right evidence of two" }],
      state.task,
      function (v) {
        state.task = v;
        /* Subtask 2 has no positive class and no operations, so these views
         * simply do not exist there — reset rather than carry them over. */
        if (v === "2") { state.op = "0"; state.view = "binary"; }
        clearPinned();
        apply(true);
      });

    group("Evidence format", "format",
      avail.map(function (f) { return { value: f.key, label: f.label }; }),
      state.format,
      function (v) { state.format = v; clearPinned(); apply(); });

    group("View", "view",
      [{ value: "binary", label: "Correct / wrong" },
       { value: "outcome", label: "TP / TN / FP / FN" }],
      state.view,
      function (v) { state.view = v; apply(); },
      !isT1);

    group("Sort", "sort",
      [{ value: "difficulty", label: "By difficulty" },
       { value: "dataset", label: "Dataset order" }],
      state.sort,
      function (v) { state.sort = v; clearPinned(); apply(); });

    toggle("Only best run per team", "top",
      "Show one run per team; the consensus rows and the difficulty sort follow the same runs.");
    toggle("Group by evidence type", "evi", "Split columns into Figures / Tables blocks.");
    toggle("Group by operation", "op",
      "Split each block by manipulation operation. Supported claims form an “original” bucket.",
      !isT1);
    toggle("Show consensus rows", "consensus",
      "P(correct), Agreement and Majority correct, over the runs shown above.");
  }

  /* ========================================================================
   * Apply + resize
   * ===================================================================== */

  function availableWidth() {
    return Math.max(200, dom.scroller.clientWidth);
  }

  function apply(rebuildControls) {
    writeUrlState();
    model = buildModel();

    if (model.empty) {
      dom.empty.hidden = false;
      dom.figure.hidden = true;
      if (rebuildControls !== false) buildControls();
      return;
    }
    dom.empty.hidden = true;
    dom.figure.hidden = false;

    buildControls();
    geom = computeGeometry(availableWidth());

    dom.plot.style.width = geom.width + "px";
    dom.plot.style.height = (geom.matrixH + LAYOUT.consensusGap + geom.consensusH) + "px";
    dom.consensusWrap.hidden = !on("consensus");
    dom.consensusWrap.style.top = (geom.matrixH + LAYOUT.consensusGap) + "px";
    dom.consensusLabels.style.height = geom.consensusH + "px";
    dom.scroller.classList.toggle("hm-scrolling", geom.scroll);

    renderTitle();
    drawMatrix();
    drawConsensus();
    drawCrosshair();
    renderRowLabels();
    renderColumnFurniture();
    renderConsensusLabels();
    renderLegends();
  }

  function relayout() {
    if (!model || model.empty) return;
    geom = computeGeometry(availableWidth());
    dom.plot.style.width = geom.width + "px";
    dom.plot.style.height = (geom.matrixH + LAYOUT.consensusGap + geom.consensusH) + "px";
    dom.consensusWrap.style.top = (geom.matrixH + LAYOUT.consensusGap) + "px";
    dom.scroller.classList.toggle("hm-scrolling", geom.scroll);
    drawMatrix();
    drawConsensus();
    drawCrosshair();
    renderRowLabels();
    renderColumnFurniture();
    renderLegends();
  }

  /* ========================================================================
   * Integrity check — every run's computed correct count must equal the
   * n_correct the organisers' JSON carries. A mismatch means our decode of
   * `preds` has drifted from the data and the whole figure is suspect, so it
   * is loud in the console rather than silent.
   * ===================================================================== */
  function checkIntegrity() {
    const problems = [];
    ["1", "2"].forEach(function (k) {
      if (!DATA.tasks[k]) return;
      const t = buildTaskCache(k);
      t.runs.forEach(function (r) {
        if (r.computed_n_correct !== r.n_correct) {
          problems.push("task " + k + " " + r.file + ": n_correct " +
            r.computed_n_correct + " != " + r.n_correct);
        }
        if (r.computed_n_answered !== r.n_answered) {
          problems.push("task " + k + " " + r.file + ": n_answered " +
            r.computed_n_answered + " != " + r.n_answered);
        }
      });
    });
    if (problems.length) {
      console.error("[heatmap] data integrity check FAILED:\n" + problems.join("\n"));
    } else {
      console.info("[heatmap] data integrity OK — computed n_correct/n_answered " +
        "match the JSON for every run.");
    }
    return problems;
  }

  /* ========================================================================
   * Boot
   * ===================================================================== */

  function cacheDom() {
    [
      "controls", "figure", "title", "subtitle", "grid", "scroller", "plot", "canvas",
      "consensusCanvas", "overlay", "rowLabels", "rowValues", "blockLabels",
      "blockLabelsTop", "axisHints", "consensusLabels", "consensusWrap",
      "legends", "legendOutcome", "legendConsensus", "panel", "empty", "status",
    ].forEach(function (k) {
      dom[k] = document.getElementById(
        "hm-" + k.replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); })
      );
    });
  }

  function bindEvents() {
    dom.plot.addEventListener("mousemove", function (e) {
      if (pinned) return; // a pinned panel stays put so its link is clickable
      const hit = hitTest(e.clientX, e.clientY);
      const changed = !hit !== !hovered ||
        (hit && hovered && (hit.col !== hovered.col || hit.rowIdx !== hovered.rowIdx));
      hovered = hit;
      if (hit) {
        if (changed) showPanel(hit, e.clientX, e.clientY);
        else positionPanel(e.clientX, e.clientY);
      } else {
        hidePanel();
      }
      if (changed) drawCrosshair();
    });

    dom.plot.addEventListener("mouseleave", function () {
      if (pinned) return;
      hovered = null;
      hidePanel();
      drawCrosshair();
    });

    dom.plot.addEventListener("click", function (e) {
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) { clearPinned(); return; }
      if (pinned && pinned.col === hit.col && pinned.rowIdx === hit.rowIdx) {
        clearPinned();
        return;
      }
      hovered = null;
      setPinned(hit, e.clientX, e.clientY);
      e.stopPropagation();
    });

    /* A tap acts as a click: suppress the synthetic mousemove that would
     * otherwise immediately replace the panel we just pinned. */
    dom.plot.addEventListener("touchstart", function (e) {
      const t = e.touches[0];
      if (!t) return;
      const hit = hitTest(t.clientX, t.clientY);
      if (!hit) { clearPinned(); return; }
      e.preventDefault();
      hovered = null;
      setPinned(hit, t.clientX, t.clientY);
    }, { passive: false });

    document.addEventListener("click", function (e) {
      if (!pinned) return;
      if (dom.panel.contains(e.target) || dom.plot.contains(e.target)) return;
      clearPinned();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { clearPinned(); return; }
      if (!pinned) return;
      const map = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      stepPinned(d[0], d[1]);
    });

    let rafId = null;
    const onResize = function () {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () { rafId = null; relayout(); });
    };
    window.addEventListener("resize", onResize);
    if (window.ResizeObserver) {
      new ResizeObserver(onResize).observe(dom.scroller);
    }
    window.addEventListener("popstate", function () {
      readUrlState();
      clearPinned();
      apply();
    });
  }

  function boot() {
    cacheDom();
    if (!dom.plot) return;
    readUrlState();

    fetch(DATA_URL)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " fetching " + DATA_URL);
        return r.json();
      })
      .then(function (json) {
        DATA = json;
        dom.status.hidden = true;
        checkIntegrity();
        bindEvents();
        apply();
        /* Exposed so the checks in the console (and the Node check) can call
         * the same code path the page uses, rather than a reimplementation. */
        window.SciClaimEvalHeatmap = {
          get model() { return model; },
          state: state,
          checkIntegrity: checkIntegrity,
          buildTaskCache: buildTaskCache,
        };
      })
      .catch(function (err) {
        console.error("[heatmap]", err);
        dom.status.hidden = false;
        dom.status.textContent = "Could not load the run results: " + err.message;
        dom.status.classList.add("hm-error");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
