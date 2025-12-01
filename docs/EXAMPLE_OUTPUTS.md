# Example Outputs - Re Generative UI

This document shows example JSON outputs from Re's improved system prompt to demonstrate the quality of generated UIs.

---

## Example 1: Notification Center

**Prompt:**
```
Build a notification center with a heading "Recent Notifications", display 5-6 notification items as cards with icons, message text, timestamp, different alert types (info, success, warning, error) with appropriate colors, mark as read buttons, and a Clear All button at the top.
```

**Expected Output:**

```json
{
  "components": [
    {
      "id": "heading-1",
      "type": "heading",
      "props": {
        "content": "Recent Notifications",
        "level": 2
      }
    },
    {
      "id": "clear-btn",
      "type": "button",
      "props": {
        "label": "Clear All",
        "variant": "ghost",
        "size": "sm"
      }
    },
    {
      "id": "notif-1",
      "type": "card",
      "children": [
        {
          "id": "badge-1",
          "type": "badge",
          "props": {
            "label": "info",
            "variant": "info"
          }
        },
        {
          "id": "title-1",
          "type": "heading",
          "props": {
            "content": "New Message",
            "level": 3
          }
        },
        {
          "id": "desc-1",
          "type": "text",
          "props": {
            "content": "You have a new message from John Doe"
          }
        },
        {
          "id": "time-1",
          "type": "text",
          "props": {
            "content": "2 hours ago",
            "size": "sm"
          }
        },
        {
          "id": "btn-1",
          "type": "button",
          "props": {
            "label": "Mark as Read",
            "variant": "ghost",
            "size": "sm"
          }
        }
      ]
    },
    {
      "id": "notif-2",
      "type": "card",
      "children": [
        {
          "id": "badge-2",
          "type": "badge",
          "props": {
            "label": "success",
            "variant": "success"
          }
        },
        {
          "id": "title-2",
          "type": "heading",
          "props": {
            "content": "Payment Successful",
            "level": 3
          }
        },
        {
          "id": "desc-2",
          "type": "text",
          "props": {
            "content": "Your payment has been processed successfully"
          }
        },
        {
          "id": "time-2",
          "type": "text",
          "props": {
            "content": "5 hours ago",
            "size": "sm"
          }
        },
        {
          "id": "btn-2",
          "type": "button",
          "props": {
            "label": "Mark as Read",
            "variant": "ghost",
            "size": "sm"
          }
        }
      ]
    },
    {
      "id": "notif-3",
      "type": "card",
      "children": [
        {
          "id": "badge-3",
          "type": "badge",
          "props": {
            "label": "warning",
            "variant": "warning"
          }
        },
        {
          "id": "title-3",
          "type": "heading",
          "props": {
            "content": "System Update",
            "level": 3
          }
        },
        {
          "id": "desc-3",
          "type": "text",
          "props": {
            "content": "A new system update is available"
          }
        },
        {
          "id": "time-3",
          "type": "text",
          "props": {
            "content": "1 day ago",
            "size": "sm"
          }
        },
        {
          "id": "btn-3",
          "type": "button",
          "props": {
            "label": "Mark as Read",
            "variant": "ghost",
            "size": "sm"
          }
        }
      ]
    },
    {
      "id": "notif-4",
      "type": "card",
      "children": [
        {
          "id": "badge-4",
          "type": "badge",
          "props": {
            "label": "error",
            "variant": "error"
          }
        },
        {
          "id": "title-4",
          "type": "heading",
          "props": {
            "content": "Error Occurred",
            "level": 3
          }
        },
        {
          "id": "desc-4",
          "type": "text",
          "props": {
            "content": "An error occurred while processing your request"
          }
        },
        {
          "id": "time-4",
          "type": "text",
          "props": {
            "content": "2 days ago",
            "size": "sm"
          }
        },
        {
          "id": "btn-4",
          "type": "button",
          "props": {
            "label": "Mark as Read",
            "variant": "ghost",
            "size": "sm"
          }
        }
      ]
    }
  ],
  "metadata": {
    "title": "Notifications"
  }
}
```

**Quality Indicators:**
- ✅ All buttons have labels ("Clear All", "Mark as Read")
- ✅ All badges have text ("info", "success", "warning", "error")
- ✅ All timestamps present ("2 hours ago", "5 hours ago", etc.)
- ✅ Different variants for different alert types
- ✅ Realistic message content

---

## Example 2: Order History Table

**Prompt:**
```
Display an order history table showing Order Number, Date, Items, Total Amount, and Status columns. Include 6 recent orders, use color-coded badges for status (Delivered in green, Shipped in blue, Processing in orange, Cancelled in red).
```

**Expected Output:**

```json
{
  "components": [
    {
      "id": "heading-1",
      "type": "heading",
      "props": {
        "content": "Order History",
        "level": 2
      }
    },
    {
      "id": "orders-table",
      "type": "table",
      "props": {
        "headers": ["Order Number", "Date", "Items", "Total Amount", "Status"],
        "rows": [
          {
            "Order Number": "#12345",
            "Date": "Jan 15, 2024",
            "Items": "3",
            "Total Amount": "$99.99",
            "Status": "Delivered"
          },
          {
            "Order Number": "#12346",
            "Date": "Jan 16, 2024",
            "Items": "1",
            "Total Amount": "$49.50",
            "Status": "Shipped"
          },
          {
            "Order Number": "#12347",
            "Date": "Jan 17, 2024",
            "Items": "5",
            "Total Amount": "$249.99",
            "Status": "Processing"
          },
          {
            "Order Number": "#12348",
            "Date": "Jan 18, 2024",
            "Items": "2",
            "Total Amount": "$79.99",
            "Status": "Processing"
          },
          {
            "Order Number": "#12349",
            "Date": "Jan 19, 2024",
            "Items": "4",
            "Total Amount": "$159.99",
            "Status": "Cancelled"
          },
          {
            "Order Number": "#12350",
            "Date": "Jan 20, 2024",
            "Items": "7",
            "Total Amount": "$399.99",
            "Status": "Delivered"
          }
        ],
        "striped": true
      }
    }
  ],
  "metadata": {
    "title": "Orders"
  }
}
```

**Quality Indicators:**
- ✅ 6 data rows (not empty!)
- ✅ Realistic order numbers (#12345, #12346, etc.)
- ✅ Current year dates (January 2024)
- ✅ Realistic prices ($99.99, $49.50, etc.)
- ✅ Varied status values
- ✅ All columns properly populated

---

## Example 3: Project Dashboard

**Prompt:**
```
Design a project overview with heading "Project Alpha Dashboard", show project progress with a large progress bar at 67%, display milestone cards with dates and completion badges, and a bar chart comparing planned vs actual timeline.
```

**Expected Output:**

```json
{
  "components": [
    {
      "id": "heading-1",
      "type": "heading",
      "props": {
        "content": "Project Alpha Dashboard",
        "level": 1
      }
    },
    {
      "id": "progress-1",
      "type": "progress",
      "props": {
        "value": 67,
        "label": "Overall Progress",
        "showPercentage": true
      }
    },
    {
      "id": "milestones-container",
      "type": "container",
      "props": {
        "direction": "row",
        "gap": "md"
      },
      "children": [
        {
          "id": "milestone-1",
          "type": "card",
          "props": {
            "title": "Milestone 1"
          },
          "children": [
            {
              "id": "m1-name",
              "type": "text",
              "props": {
                "content": "Project Kickoff",
                "weight": "bold"
              }
            },
            {
              "id": "m1-date",
              "type": "text",
              "props": {
                "content": "Jan 5, 2024",
                "size": "sm"
              }
            },
            {
              "id": "m1-status",
              "type": "badge",
              "props": {
                "label": "Completed",
                "variant": "success"
              }
            }
          ]
        },
        {
          "id": "milestone-2",
          "type": "card",
          "props": {
            "title": "Milestone 2"
          },
          "children": [
            {
              "id": "m2-name",
              "type": "text",
              "props": {
                "content": "Alpha Release",
                "weight": "bold"
              }
            },
            {
              "id": "m2-date",
              "type": "text",
              "props": {
                "content": "Feb 15, 2024",
                "size": "sm"
              }
            },
            {
              "id": "m2-status",
              "type": "badge",
              "props": {
                "label": "In Progress",
                "variant": "info"
              }
            }
          ]
        },
        {
          "id": "milestone-3",
          "type": "card",
          "props": {
            "title": "Milestone 3"
          },
          "children": [
            {
              "id": "m3-name",
              "type": "text",
              "props": {
                "content": "Beta Release",
                "weight": "bold"
              }
            },
            {
              "id": "m3-date",
              "type": "text",
              "props": {
                "content": "Mar 30, 2024",
                "size": "sm"
              }
            },
            {
              "id": "m3-status",
              "type": "badge",
              "props": {
                "label": "Pending",
                "variant": "default"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "timeline-chart",
      "type": "chart",
      "props": {
        "chartType": "bar",
        "title": "Planned vs Actual Timeline",
        "data": [
          {
            "milestone": "Milestone 1",
            "planned": 30,
            "actual": 28
          },
          {
            "milestone": "Milestone 2",
            "planned": 45,
            "actual": 38
          },
          {
            "milestone": "Milestone 3",
            "planned": 60,
            "actual": 0
          }
        ],
        "xKey": "milestone",
        "yKey": "actual"
      }
    }
  ],
  "metadata": {
    "title": "Project Dashboard"
  }
}
```

**Quality Indicators:**
- ✅ Progress bar at exactly 67%
- ✅ Milestone cards with complete data
- ✅ Status badges with appropriate variants (success, info, default)
- ✅ Dates in realistic format
- ✅ Chart with 3 data points showing planned vs actual
- ✅ All text fields populated

---

## Example 4: Sales Dashboard with Metrics

**Prompt:**
```
Create a sales dashboard with heading "Sales Overview", 3 metric cards showing Total Revenue ($12,450 with +12.5% badge), Orders (234 with +8% badge), and Customers (156 with +15% badge), and a line chart showing last 6 months revenue trend.
```

**Expected Output:**

```json
{
  "components": [
    {
      "id": "heading-1",
      "type": "heading",
      "props": {
        "content": "Sales Overview",
        "level": 1
      }
    },
    {
      "id": "metrics-container",
      "type": "container",
      "props": {
        "direction": "row",
        "gap": "lg"
      },
      "children": [
        {
          "id": "revenue-card",
          "type": "card",
          "props": {
            "title": "Total Revenue"
          },
          "children": [
            {
              "id": "revenue-amount",
              "type": "heading",
              "props": {
                "content": "$12,450",
                "level": 2
              }
            },
            {
              "id": "revenue-change",
              "type": "badge",
              "props": {
                "label": "+12.5%",
                "variant": "success"
              }
            }
          ]
        },
        {
          "id": "orders-card",
          "type": "card",
          "props": {
            "title": "Orders"
          },
          "children": [
            {
              "id": "orders-count",
              "type": "heading",
              "props": {
                "content": "234",
                "level": 2
              }
            },
            {
              "id": "orders-change",
              "type": "badge",
              "props": {
                "label": "+8%",
                "variant": "success"
              }
            }
          ]
        },
        {
          "id": "customers-card",
          "type": "card",
          "props": {
            "title": "Customers"
          },
          "children": [
            {
              "id": "customers-count",
              "type": "heading",
              "props": {
                "content": "156",
                "level": 2
              }
            },
            {
              "id": "customers-change",
              "type": "badge",
              "props": {
                "label": "+15%",
                "variant": "success"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "revenue-chart",
      "type": "chart",
      "props": {
        "chartType": "line",
        "title": "Revenue Trend (Last 6 Months)",
        "data": [
          { "month": "Aug", "revenue": 8200 },
          { "month": "Sep", "revenue": 9100 },
          { "month": "Oct", "revenue": 9800 },
          { "month": "Nov", "revenue": 10500 },
          { "month": "Dec", "revenue": 11200 },
          { "month": "Jan", "revenue": 12450 }
        ],
        "xKey": "month",
        "yKey": "revenue"
      }
    }
  ],
  "metadata": {
    "title": "Sales Dashboard"
  }
}
```

**Quality Indicators:**
- ✅ 3 metric cards with titles
- ✅ Large numbers displayed as headings
- ✅ Percentage badges with + sign
- ✅ All badges variant "success" (green)
- ✅ Line chart with exactly 6 months of data
- ✅ Realistic revenue values showing growth trend

---

## Example 5: Contact Form

**Prompt:**
```
Build a contact form with name field (text input, required), email field (email input, required), message field (text input, optional), country selector dropdown with 4 countries, and a submit button labeled "Send Message".
```

**Expected Output:**

```json
{
  "components": [
    {
      "id": "contact-form",
      "type": "form",
      "props": {
        "title": "Contact Us",
        "submitLabel": "Send Message"
      },
      "children": [
        {
          "id": "name-input",
          "type": "input",
          "props": {
            "name": "name",
            "label": "Name",
            "type": "text",
            "placeholder": "Enter your name",
            "required": true
          }
        },
        {
          "id": "email-input",
          "type": "input",
          "props": {
            "name": "email",
            "label": "Email Address",
            "type": "email",
            "placeholder": "you@example.com",
            "required": true
          }
        },
        {
          "id": "message-input",
          "type": "input",
          "props": {
            "name": "message",
            "label": "Message",
            "type": "text",
            "placeholder": "Your message here...",
            "required": false
          }
        },
        {
          "id": "country-select",
          "type": "select",
          "props": {
            "name": "country",
            "label": "Country",
            "options": [
              { "value": "us", "label": "United States" },
              { "value": "uk", "label": "United Kingdom" },
              { "value": "ca", "label": "Canada" },
              { "value": "au", "label": "Australia" }
            ],
            "required": false
          }
        }
      ]
    }
  ],
  "metadata": {
    "title": "Contact Form"
  }
}
```

**Quality Indicators:**
- ✅ All inputs have name and label
- ✅ Correct input types (text, email)
- ✅ Required fields marked correctly
- ✅ Placeholder text provided
- ✅ Select has 4 countries with value/label pairs
- ✅ Submit button labeled "Send Message"

---

## Common Patterns

### Pattern 1: Notification Card Structure
```json
{
  "id": "notification",
  "type": "card",
  "children": [
    { "type": "badge", "props": { "label": "TYPE", "variant": "VARIANT" } },
    { "type": "heading", "props": { "content": "TITLE" } },
    { "type": "text", "props": { "content": "DESCRIPTION" } },
    { "type": "text", "props": { "content": "TIMESTAMP", "size": "sm" } },
    { "type": "button", "props": { "label": "ACTION" } }
  ]
}
```

### Pattern 2: Metric Card Structure
```json
{
  "id": "metric",
  "type": "card",
  "props": { "title": "METRIC NAME" },
  "children": [
    { "type": "heading", "props": { "content": "VALUE" } },
    { "type": "badge", "props": { "label": "CHANGE %", "variant": "success" } }
  ]
}
```

### Pattern 3: Table with Data
```json
{
  "type": "table",
  "props": {
    "headers": ["COL1", "COL2", "COL3"],
    "rows": [
      { "COL1": "value1", "COL2": "value2", "COL3": "value3" },
      { "COL1": "value1", "COL2": "value2", "COL3": "value3" }
    ]
  }
}
```

---

## Quality Comparison

### Before Improvements ❌

```json
{
  "components": [
    {
      "type": "button",
      "props": { "label": "" }  // ❌ EMPTY
    },
    {
      "type": "table",
      "props": {
        "headers": ["Order", "Date"],
        "rows": []  // ❌ NO DATA
      }
    }
  ]
}
```

### After Improvements ✅

```json
{
  "components": [
    {
      "type": "button",
      "props": { "label": "Mark as Read" }  // ✅ FILLED
    },
    {
      "type": "table",
      "props": {
        "headers": ["Order", "Date"],
        "rows": [  // ✅ HAS DATA
          { "Order": "#12345", "Date": "Jan 15, 2024" },
          { "Order": "#12346", "Date": "Jan 16, 2024" }
        ]
      }
    }
  ]
}
```

---

## Validation Checklist

Use this checklist to validate any generated UI:

- [ ] All buttons have non-empty labels
- [ ] All badges have non-empty labels
- [ ] All text/heading components have content
- [ ] Tables have at least 3 rows of data
- [ ] Charts have at least 4 data points
- [ ] Dates are in current year (2024)
- [ ] Prices are formatted with $
- [ ] Order numbers have # prefix
- [ ] Status badges use appropriate variants
- [ ] Timestamps are realistic ("X hours/days ago" or dates)
- [ ] Names are realistic (not "User 1")
- [ ] All required props are present
- [ ] No placeholder text like "[value]" or "text"

If all checks pass, the output quality is excellent! ✅
