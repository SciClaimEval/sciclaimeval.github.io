import pandas as pd
import json
import math
import os
from pathlib import Path

ASSETS_PATH = Path("assets")
XLSX_RESULTS_PATH = os.path.join(ASSETS_PATH, "SciClaimEval26_Results.xlsx")
XLSX_TEAMREG_PATH = os.path.join(ASSETS_PATH, "2026_team_info.xlsx")
OUT_DIR = Path("_data")

METRIC_COLS = ["precision", "recall", "macro_f1", "accuracy", "pair_accuracy"]

# Individual baseline models. Grouped into a single "Baseline" row per task
# at build time, the same way a team's multiple runs are grouped.
BASELINE_MODELS = {
    "subtask1": [
        {"method_name": "o4-mini",              "precision": 83.4, "recall": 82.4, "macro_f1": 82.9, "accuracy": 82.3, "pair_accuracy": 68.2},
        {"method_name": "Qwen3-VL-30B-A3B",      "precision": 77.1, "recall": 74.8, "macro_f1": 76.0, "accuracy": 75.0, "pair_accuracy": 54.8},
        {"method_name": "Qwen3-VL-8B",           "precision": 76.3, "recall": 68.3, "macro_f1": 72.1, "accuracy": 68.3, "pair_accuracy": 46.9},
        {"method_name": "InternVL3_5-38B",       "precision": 72.1, "recall": 68.1, "macro_f1": 67.8, "accuracy": 69.2, "pair_accuracy": 40.1},
        {"method_name": "Llama-3.2-11B-Vision",  "precision": 57.4, "recall": 52.9, "macro_f1": 48.6, "accuracy": 54.8, "pair_accuracy": 10.8},
    ],
    "subtask2": [
        {"method_name": "o4-mini",              "accuracy": 85.2},
        {"method_name": "Qwen3-VL-8B",           "accuracy": 56.2},
        {"method_name": "InternVL3_5-38B",       "accuracy": 54.5},
        {"method_name": "Qwen3-VL-30B-A3B",      "accuracy": 54.3},
        {"method_name": "Llama-3.2-11B-Vision",  "accuracy": 34.7},
    ],
}

RANK_METRIC = {"subtask1": "pair_accuracy", "subtask2": "accuracy"}
TASK_LABEL = {"subtask1": "Subtask 1", "subtask2": "Subtask 2"}
METRICS = {"subtask1": METRIC_COLS, "subtask2": ["accuracy"]}

EVIDENCE_FORMATS = [".PNG", ".JSON", ".TEX AND/OR .HTML"]

CHAR_LIMIT = 13


# --------------------------------------------------------------------------
# NaN / empty-value sanitization
# --------------------------------------------------------------------------

def is_nan(v):
    return v is None or (isinstance(v, float) and math.isnan(v))


def clean_text(v):
    """Return a clean string, never NaN/None -> renders as an empty cell."""
    if is_nan(v):
        return ""
    return str(v).strip()


def clean_metric(v):
    """Return a rounded float, or None (JSON null) if missing.
    None is used instead of NaN because NaN is not valid JSON."""
    if is_nan(v):
        return None
    try:
        return round(float(v), 1)
    except (TypeError, ValueError):
        return None


def truncate(text):
    """Shorten long text for display, returning (short, tooltip).
    tooltip is "" when no truncation happened, matching the templates'
    `{% if run.tooltip != "" %}` check."""
    if len(text) > CHAR_LIMIT:
        return text[:CHAR_LIMIT] + "...", text
    return text, ""


# --------------------------------------------------------------------------
# Filters — add new rules here as they come up. Each filter takes the full
# dataframe and returns a filtered dataframe. They run in order.
# --------------------------------------------------------------------------

FILTERS = []


def register_filter(name):
    def decorator(fn):
        FILTERS.append((name, fn))
        return fn
    return decorator


@register_filter("exclude_organizer_submissions")
def exclude_organizer_submissions(df):
    # Placeholder rule: drop any row submitted under the organizers' own
    # group_id so our own sanity-check runs never show up as "results".
    if "group_id" not in df.columns:
        return df
    return df[df["group_id"].astype(str).str.strip() != "SciClaimEval"]


@register_filter("exclude_tests")
def exclude_test_submissions(df):
    if "group_id" not in df.columns:
        return df
    return df[~df["group_id"].astype(str).str.strip().str.lower().str.startswith("test")]


@register_filter("exclude_errors")
def exclude_errored_submissions(df):
    if "errors" not in df.columns:
        return df
    return df[df["errors"].apply(is_nan).astype(bool)]

def apply_filters(df):
    for name, fn in FILTERS:
        before = len(df)
        df = fn(df)
        removed = before - len(df)
        if removed:
            print(f"  filter '{name}' removed {removed} row(s)")
    return df


# --------------------------------------------------------------------------
# Baseline grouping
# --------------------------------------------------------------------------

def build_baseline_entry(task_key):
    metric = RANK_METRIC[task_key]
    models = BASELINE_MODELS[task_key]

    runs_sorted = sorted(models, key=lambda m: (m.get(metric) is not None, m.get(metric, 0)), reverse=True)

    run_list = []
    for m in runs_sorted:
        method, tooltip = truncate(clean_text(m.get("method_name")))
        run = {
            "method_name": method,
            "tooltip": tooltip,
            "team_notes": "",
            "notes_tooltip": "",
        }
        for c in METRICS[task_key]:
            run[c] = clean_metric(m.get(c))
        run_list.append(run)

    best = run_list[0]
    return {
        "team": "Baselines",
        "is_baseline": True,
        **{c: best.get(c) for c in METRICS[task_key]},
        "runs": run_list,
    }


# --------------------------------------------------------------------------
# Team submissions
# --------------------------------------------------------------------------

def build_task(df, df_teams, task_key, evidence_format):
    metric = RANK_METRIC[task_key]

    sub = df[
        (df["task"] == TASK_LABEL[task_key])
        & (df["evidence_format"].astype(str).str.upper() == evidence_format)
    ].copy()

    sub = apply_filters(sub)

    teams = []
    for team_id, group in sub.groupby("group_id"):
        team_row = df_teams[df_teams['group id'] == team_id.strip().lower()]
        if team_row.empty:
            print(f"Unable to identify ID {team_id} in teams excel. Skipping.")
            continue

        team_name = team_row.iloc[0]['group name']

        runs = group.sort_values(metric, ascending=False, na_position="last")

        run_list = []
        for _, r in runs.iterrows():
            method, tooltip = truncate(clean_text(r.get("method_name")))
            notes, notes_tooltip = truncate(clean_text(r.get("team_notes")))

            run_list.append({
                "method_name": method,
                "tooltip": tooltip,
                "team_notes": notes,
                "notes_tooltip": notes_tooltip,
                **{c: clean_metric(r.get(c)) for c in METRICS[task_key]},
            })

        best = run_list[0]
        teams.append({
            "team": clean_text(team_name),
            "is_baseline": False,
            **{c: best.get(c) for c in METRICS[task_key]},
            "runs": run_list,
        })

    # Baselines were only run on PNG evidence — only attach them there.
    if evidence_format == ".PNG":
        teams.append(build_baseline_entry(task_key))

    teams.sort(key=lambda t: (t.get(metric) is not None, t.get(metric, 0)), reverse=True)
    return teams


def compute_best(entries, task_key):
    """Per-column max across the displayed (best-run-per-team + baseline)
    rows. Used by the templates to bold the best value in each column."""
    best = {}
    for c in METRICS[task_key]:
        vals = [e.get(c) for e in entries if e.get(c) is not None]
        best[c] = max(vals) if vals else None
    return best


def main():
    df = pd.read_excel(XLSX_RESULTS_PATH)
    df.columns = [c.strip().lower() for c in df.columns]

    df_teams = pd.read_excel(XLSX_TEAMREG_PATH)
    df_teams.columns = [c.strip().lower() for c in df_teams.columns]
    df_teams['group id'] = df_teams['group id'].astype(str).str.strip().str.lower()

    OUT_DIR.mkdir(exist_ok=True)

    for task_key in ["subtask1", "subtask2"]:
        for fmt in EVIDENCE_FORMATS:
            print(f"Processing {task_key} / {fmt} ...")
            entries = build_task(df, df_teams, task_key, fmt)
            payload = {
                "entries": entries,
                "best": compute_best(entries, task_key),
            }
            fmt_clean = fmt[1:5] if fmt.startswith(".J") else fmt[1:4]
            out_name = f"{task_key}_{fmt_clean.lower()}.json"
            with open(OUT_DIR / out_name, "w") as f:
                json.dump(payload, f, indent=2)
            print(f"  -> {out_name}: {len(entries)} row(s)")

if __name__ == "__main__":
    main()