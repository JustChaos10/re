# Prompt Engineering Best Practices for Re

This guide helps you write effective prompts to get high-quality UI generation from Re.

## Quick Tips

### ✅ DO: Be Specific and Detailed

**Good Example:**
```
Build a notification center with a heading "Recent Notifications", display 5-6 notification
items as cards with icons, message text, timestamp, different alert types (info, success,
warning, error) with appropriate colors, mark as read buttons, and a Clear All button at
the top.
```

**Result:** Rich, complete UI with all requested elements

**Bad Example:**
```
Show me notifications
```

**Result:** Basic, potentially incomplete UI

---

## Component-Specific Tips

### Tables

**Good Prompt:**
```
Display an order history table showing Order Number, Date, Items, Total Amount, and Status
columns. Include 6 recent orders, use color-coded badges for status (Delivered in green,
Shipped in blue, Processing in orange, Cancelled in red), and add a View Details button
for each order.
```

**Key Elements:**
- Specify column names
- Request specific number of rows (3-6 is ideal)
- Describe status colors/badges
- Include action buttons if needed

### Dashboards

**Good Prompt:**
```
Create a project dashboard with:
- Heading "Project Alpha Dashboard"
- Progress bar showing 67% completion
- 3 milestone cards with names, completion badges
- Bar chart comparing planned vs actual timeline
- Team member section with names
```

**Key Elements:**
- Break down sections clearly
- Specify exact percentages/numbers
- List all components needed
- Describe relationships between data

### Forms

**Good Prompt:**
```
Build a contact form with:
- Name field (text input, required)
- Email field (email input, required)
- Message field (text input, optional)
- Country selector dropdown with 3-4 countries
- Submit button labeled "Send Message"
```

**Key Elements:**
- Specify field types
- Indicate required vs optional
- Name the submit button clearly
- Provide realistic options for selects

### Charts

**Good Prompt:**
```
Show monthly revenue as a bar chart with 6 months of data (Jan-Jun 2024), values
ranging from $3000 to $8000, with a title "Revenue Trend"
```

**Key Elements:**
- Specify chart type (bar, line, pie, area)
- Number of data points (4-8 ideal)
- Realistic value ranges
- Clear axis labels

---

## Data Quality Guidelines

### Timestamps
- ✅ "2 hours ago", "Jan 15, 2024", "Today at 3:45 PM"
- ❌ "timestamp", "[time]", "date"

### Status Badges
- ✅ Specify colors: "Delivered (green)", "Processing (orange)"
- ❌ Just "status"

### Names
- ✅ "John Doe", "Jane Smith", "Alice Johnson"
- ❌ "User 1", "Name", "Person"

### Numbers
- ✅ Realistic ranges: prices ($19.99-$999.99), quantities (1-100)
- ❌ Placeholder values: "0", "999999"

---

## Common Patterns

### Notification Card
```
For each notification, include:
- Alert type badge (info/success/warning/error)
- Clear heading
- Description text
- Timestamp
- "Mark as Read" button
```

### Data Table
```
For tables, always specify:
- All column names
- Number of rows (3-6 recommended)
- Data types for each column
- Status badges with colors
- Action buttons per row
```

### Metric Cards
```
For dashboard metrics:
- Card title
- Large number/value
- Change indicator (badge with +/- percentage)
- Optional subtitle/description
```

---

## Examples By Use Case

### E-Commerce

**Order History:**
```
Display order history table with Order #, Date, Customer, Items, Total, Status.
Show 5 recent orders from January 2024, use green badges for Delivered, blue for
Shipped, orange for Processing. Add View Details button for each order.
```

**Product Grid:**
```
Create a product grid with 6 products, each showing product image (placeholder),
name, price ($19.99-$99.99 range), rating (4-5 stars), and Add to Cart button.
```

### Analytics

**Sales Dashboard:**
```
Build a sales dashboard with:
- Heading "Sales Overview"
- 3 metric cards: Total Revenue ($12,450 +12.5%), Orders (234 +8%), Customers (156 +15%)
- Line chart showing last 6 months revenue trend
- Top products table with Product, Sales, Revenue, Growth columns
```

**Performance Metrics:**
```
Show performance metrics with:
- 4 progress bars: CPU (67%), Memory (45%), Disk (82%), Network (23%)
- Each with label, percentage, and color (green <50%, orange 50-80%, red >80%)
```

### Productivity

**Task List:**
```
Create a task list with 5-6 tasks, each showing:
- Checkbox for completion
- Task name
- Due date
- Priority badge (High/red, Medium/orange, Low/green)
- Assignee name
```

**Calendar View:**
```
Display this week's schedule with:
- Heading "This Week"
- 5-6 event cards showing time, title, duration, type badge
- Different colors for meeting/deadline/personal events
```

---

## Troubleshooting

### Problem: Empty buttons/badges
**Solution:** Explicitly request "Mark as Read button" instead of just "button"

### Problem: Empty tables
**Solution:** Specify "include 5 rows of data" in your prompt

### Problem: Generic data
**Solution:** Provide context: "order numbers like #12345", "dates in Jan 2024"

### Problem: Missing timestamps
**Solution:** Request "show timestamp like '2 hours ago' for each notification"

### Problem: No colors/variants
**Solution:** Specify "use green badges for success, red for errors"

---

## Template Prompts

### Notification Center Template
```
Build a notification center with heading "[TITLE]", display [NUMBER] notification
cards with [TYPE] badges, message text, timestamps, and action buttons
```

### Table Template
```
Display a [NAME] table with columns [COL1], [COL2], [COL3]. Include [NUMBER] rows
with realistic data, [STATUS COLUMN] with color-coded badges, and [ACTION] buttons
```

### Dashboard Template
```
Create a [NAME] dashboard with:
- Main heading "[TITLE]"
- [NUMBER] metric cards showing [METRICS]
- [CHART TYPE] chart displaying [DATA DESCRIPTION]
- [ADDITIONAL SECTIONS]
```

### Form Template
```
Build a [NAME] form with:
- [FIELD1 NAME] ([TYPE], [REQUIRED/OPTIONAL])
- [FIELD2 NAME] ([TYPE], [REQUIRED/OPTIONAL])
- Submit button labeled "[BUTTON TEXT]"
```

---

## Advanced Tips

### Combining Components
```
Create a user profile page with:
- Top section: heading "User Profile", edit button
- Middle: 2-column layout with avatar image (left) and info cards (right)
- Bottom: tabs for Activity, Settings, History
- Activity tab shows table of recent actions with timestamps
```

### Responsive Layouts
```
Design a pricing page with 3 pricing tiers in a row layout:
- Each tier in a card with plan name, price, feature list, and CTA button
- Highlight the middle "Popular" tier with different styling
- Include a comparison table below showing all features
```

### Interactive Elements
```
Build an interactive quiz with:
- Question heading
- 4 answer option buttons
- Progress bar showing question 3 of 10
- Next/Previous buttons
- Score display
```

---

## Summary

**The Secret to Great Results:**
1. **Be specific** about what you want
2. **Provide context** (dates, names, numbers)
3. **Specify quantities** (number of rows, data points)
4. **Request colors/variants** explicitly
5. **Name buttons clearly** ("Mark as Read", not "button")
6. **Break complex UIs into sections**

Remember: More detail in your prompt = Better quality UI output!
