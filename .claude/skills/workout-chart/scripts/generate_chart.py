#!/usr/bin/env python3
"""
Generate a monthly workout frequency bar chart.

Usage:
    python generate_chart.py '<json_data>'

json_data: JSON array of [month_label, month_start_iso, count] rows
  e.g. '[["May 2026","2026-05-01",5],["Jun 2026","2026-06-01",3]]'

Saves workout_chart.png to the current working directory.
"""

import sys
import json
import os
from datetime import datetime, timezone

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


def parse_rows(json_str):
    """Parse [[label, iso_date, count], ...] from JSON string."""
    try:
        rows = json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"ERROR: Could not parse JSON data: {e}", file=sys.stderr)
        sys.exit(1)
    return rows


def build_full_12_months(rows):
    """
    Fill in any missing months so the chart always shows a 12-month span.
    rows: list of [label, iso_date, count]
    """
    from dateutil.relativedelta import relativedelta

    # Index provided data by (year, month)
    data = {}
    for label, iso_date, count in rows:
        dt = datetime.fromisoformat(str(iso_date).replace('Z', '+00:00'))
        data[(dt.year, dt.month)] = (label, int(count))

    now = datetime.now(timezone.utc)
    start = (now - relativedelta(months=11)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    labels, counts = [], []
    cursor = start
    for _ in range(12):
        key = (cursor.year, cursor.month)
        if key in data:
            labels.append(data[key][0])
            counts.append(data[key][1])
        else:
            labels.append(cursor.strftime('%b %Y'))
            counts.append(0)
        cursor += relativedelta(months=1)

    return labels, counts


def plot_chart(labels, counts, output_path):
    fig, ax = plt.subplots(figsize=(12, 6))

    bars = ax.bar(labels, counts, color='#4F86C6', edgecolor='white', linewidth=0.5)

    for bar, count in zip(bars, counts):
        if count > 0:
            ax.text(
                bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.15,
                str(count),
                ha='center', va='bottom', fontsize=9, color='#333333'
            )

    ax.set_xlabel('Month', fontsize=12, labelpad=10)
    ax.set_ylabel('Number of Workouts', fontsize=12, labelpad=10)
    ax.set_title('Workouts per Month — Last 12 Months', fontsize=14, fontweight='bold', pad=15)
    ax.set_ylim(0, max(counts) * 1.2 + 1 if any(counts) else 5)
    ax.tick_params(axis='x', rotation=45)
    ax.yaxis.set_major_locator(plt.MaxNLocator(integer=True))
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.grid(axis='y', alpha=0.3, linestyle='--')

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()


def main():
    if len(sys.argv) < 2:
        print("Usage: generate_chart.py '<json_data>'", file=sys.stderr)
        print("  json_data: [[\"Mon YYYY\", \"YYYY-MM-DD\", count], ...]", file=sys.stderr)
        sys.exit(1)

    # Install dateutil silently if missing
    try:
        from dateutil.relativedelta import relativedelta  # noqa: F401
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'python-dateutil', '-q',
                               '--break-system-packages'], stdout=subprocess.DEVNULL)

    rows = parse_rows(sys.argv[1])

    if not rows:
        print("WARNING: No workout data provided — chart will show all-zero months.")

    labels, counts = build_full_12_months(rows)

    output_path = os.path.join(os.getcwd(), 'workout_chart.png')
    plot_chart(labels, counts, output_path)

    total = sum(counts)
    print(f"Chart saved to: {output_path}")
    print(f"Total workouts in range: {total}")
    for label, count in zip(labels, counts):
        print(f"  {label}: {count}")


if __name__ == '__main__':
    main()
