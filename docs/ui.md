# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

Do not create custom components. Every piece of UI must be composed from shadcn/ui components installed via the shadcn CLI (`npx shadcn add <component>`). Components live in `src/components/ui/` and must not be modified unless shadcn itself instructs otherwise.

If a needed component does not exist in shadcn/ui, open a discussion before building anything custom.

## Adding Components

```bash
npx shadcn add <component-name>
```

Check [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components) for the full list of available components.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/).

Dates must be displayed in the following format: `do MMM yyyy`

| Raw date       | Displayed as   |
|----------------|----------------|
| 2025-09-01     | 1st Sep 2025   |
| 2025-08-02     | 2nd Aug 2025   |
| 2026-01-03     | 3rd Jan 2026   |
| 2024-06-04     | 4th Jun 2024   |

### Usage

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```

Never use `Date.prototype.toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.
