"""
Generates a standalone LaTeX table for each results JSON in _data/.

Reuses the exact same JSON files the website reads ({"entries": [...],
"best": {...}}), so anything that already went through results_processor.py
(NaN-cleaned, filtered, best-per-team, best-per-column) is reflected here
automatically. Sub-runs are intentionally ignored -- this only renders the
one "best" row per team/baseline, matching the collapsed (non-expanded)
view of the HTML tables.

Usage:
    python latex_tables_generator.py

Output:
    assets/latex/subtask1_png.tex
    assets/latex/subtask1_json.tex
    assets/latex/subtask1_tex.tex
    assets/latex/subtask2_png.tex
    assets/latex/subtask2_json.tex
    assets/latex/subtask2_tex.tex

Each .tex file is a complete `table` environment using booktabs rules
(\\toprule/\\midrule/\\bottomrule). Include it in your paper with:
    \\usepackage{booktabs}
    \\input{assets/latex/subtask1_png.tex}
"""

import json
import re
from pathlib import Path

DATA_DIR = Path("_data")
OUT_DIR = Path("assets/latex")

# Column keys (matching the JSON) -> LaTeX header label, per task.
# Keep this in sync with METRICS in results_processor.py.
COLUMN_SPECS = {
    "subtask1": [
        ("precision", "P"),
        ("recall", "R"),
        ("macro_f1", "Macro-F1"),
        ("accuracy", "Acc."),
        ("pair_accuracy", "Pair Acc."),
    ],
    "subtask2": [
        ("accuracy", "Accuracy"),
    ],
}

CAPTIONS = {
    "subtask1": "Subtask 1 results",
    "subtask2": "Subtask 2 results",
}

FORMAT_LABEL = {"png": "PNG", "json": "JSON", "tex": "TeX/HTML"}

FILENAME_RE = re.compile(r"^(subtask\d)_(png|json|tex)\.json$")


def escape_latex(value):
    """Escape LaTeX special characters in team names / arbitrary text.
    Processed one source character at a time so replacement text (which
    itself contains backslashes/braces) never gets re-escaped."""
    if value is None:
        return ""
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(ch, ch) for ch in str(value))


def fmt_value(v):
    if v is None:
        return "--"
    return f"{v:.1f}"


def build_table(task_key, fmt_key, payload):
    columns = COLUMN_SPECS[task_key]
    entries = payload.get("entries", [])
    best = payload.get("best", {})

    n_cols = 1 + len(columns)
    col_spec = "l" + "c" * len(columns)
    caption = f"{CAPTIONS[task_key]} ({FORMAT_LABEL.get(fmt_key, fmt_key)} evidence)"

    lines = [
        r"\begin{table}[ht]",
        r"\centering",
        r"\small",
        f"\\caption{{{caption}}}",
        f"\\label{{tab:{task_key}_{fmt_key}}}",
        f"\\begin{{tabular}}{{{col_spec}}}",
        r"\toprule",
    ]

    header = ["Team"] + [label for _, label in columns]
    lines.append(" & ".join(header) + r" \\")
    lines.append(r"\midrule")

    if not entries:
        lines.append(
            f"\\multicolumn{{{n_cols}}}{{c}}{{\\textit{{No submissions in this format yet.}}}} \\\\"
        )
    else:
        for entry in entries:
            team_name = escape_latex(entry.get("team", ""))
            team_name = team_name.replace(" NTCIR team", "")
            if entry.get("is_baseline"):
                team_name = f"\\textit{{{team_name}}}"

            row_cells = [team_name]
            for key, _ in columns:
                val = entry.get(key)
                cell = fmt_value(val)
                if val is not None and best.get(key) is not None and val == best[key]:
                    cell = f"\\textbf{{{cell}}}"
                row_cells.append(cell)

            lines.append(" & ".join(row_cells) + r" \\")

    lines += [
        r"\bottomrule",
        r"\end{tabular}",
        r"\end{table}",
    ]
    return "\n".join(lines) + "\n"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    json_files = sorted(DATA_DIR.glob("*.json"))
    if not json_files:
        print(f"No JSON files found in {DATA_DIR}/ -- run results_processor.py first.")
        return

    for path in json_files:
        m = FILENAME_RE.match(path.name)
        if not m:
            print(f"Skipping {path.name} (doesn't match subtaskN_format.json)")
            continue

        task_key, fmt_key = m.group(1), m.group(2)
        if task_key not in COLUMN_SPECS:
            print(f"Skipping {path.name} (no column spec for task '{task_key}')")
            continue

        with open(path) as f:
            payload = json.load(f)

        tex = build_table(task_key, fmt_key, payload)
        out_path = OUT_DIR / f"{task_key}_{fmt_key}.tex"
        with open(out_path, "w") as f:
            f.write(tex)

        print(f"wrote {out_path} ({len(payload.get('entries', []))} row(s))")


if __name__ == "__main__":
    main()