---
name: workout-chart
description: >
  Generates a monthly workout frequency bar chart from the PostgreSQL database and saves it
  as workout_chart.png in the project root. Use this skill whenever the user asks to
  visualize, chart, graph, or plot their workout history, frequency, or activity — including
  requests like "show me my workouts", "how often have I been working out", "generate a
  workout chart", "chart my lifting history", or anything involving a visual summary of
  workout data over time.
---

## What this skill does

Queries the `workouts` table for entries in the past 12 months, groups them by calendar month,
and renders a bar chart (X = month label, Y = number of workouts). The chart is saved as
`workout_chart.png` in the project root.

## Step 1 — Find the Neon project

Use `mcp__neon__list_projects` to get the project ID for this workspace (look for
"LiftingDiaryCourse" or similar). You only need the project ID — the branch will default to main.

## Step 2 — Query the database

Run this SQL via `mcp__neon__run_sql` (substitute the real `project_id`):

```sql
SELECT
  TO_CHAR(DATE_TRUNC('month', started_at AT TIME ZONE 'UTC'), 'Mon YYYY') AS month_label,
  DATE_TRUNC('month', started_at AT TIME ZONE 'UTC')                       AS month_start,
  COUNT(*)::int                                                             AS workout_count
FROM workouts
WHERE started_at >= NOW() - INTERVAL '1 year'
GROUP BY 1, 2
ORDER BY 2
```

## Step 3 — Install matplotlib if needed

```bash
pip3 install matplotlib python-dateutil --break-system-packages -q 2>/dev/null || true
```

## Step 4 — Run the chart script

Pass the query results as a JSON string to the bundled script:

```bash
python3 /Users/jacob.seib/liftingdiarycourse/.claude/skills/workout-chart/scripts/generate_chart.py \
  '<JSON_DATA>'
```

Where `<JSON_DATA>` is a JSON array built from the MCP query results, like:
```json
[["May 2026", "2026-05-01", 5], ["Jun 2026", "2026-06-01", 3]]
```

Each element is `[month_label, month_start_iso, workout_count]`.

Run this command from the project root (`/Users/jacob.seib/liftingdiarycourse`) so the PNG is
saved there.

## Step 5 — Confirm output

Tell the user:
> "Your workout chart has been saved to `workout_chart.png` in the project root."

If the query returned 0 rows (no workouts in the past year), tell the user the chart shows an
empty 12-month span and their data may be outside the date range.

## Troubleshooting

- **Script not found**: use the full absolute path shown in Step 4.
- **matplotlib not found**: run the install command in Step 3 first.
- **Neon project not found**: check `mcp__neon__list_projects` — the project may have a different name.
