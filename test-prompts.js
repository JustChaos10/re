/**
 * Test Script for Re Generative UI Quality
 *
 * This script tests the improved system prompt with real-world prompts
 * to validate that the output quality improvements are working.
 *
 * Usage: node test-prompts.js
 * Requires: GROQ_API_KEY environment variable
 */

const { GroqClient } = require('./packages/core/dist/index.js');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error(`${colors.red}Error: GROQ_API_KEY environment variable not set${colors.reset}`);
  console.log('Set it with: export GROQ_API_KEY="your-key-here"');
  process.exit(1);
}

// Test prompts from the screenshots
const testCases = [
  {
    name: 'Notification Center (Screenshot Test)',
    prompt: `Build a notification center with a heading "Recent Notifications", display 5-6 notification items as cards with icons, message text, timestamp, different alert types (info, success, warning, error) with appropriate colors, mark as read buttons, and a Clear All button at the top.`,
    validations: [
      { check: (ui) => ui.components?.length >= 7, message: 'Should have 7+ components (heading, button, 5-6 cards)' },
      { check: (ui) => ui.components?.some(c => c.type === 'heading' && c.props?.content?.includes('Notification')), message: 'Should have "Recent Notifications" heading' },
      { check: (ui) => ui.components?.some(c => c.type === 'button' && c.props?.label?.includes('Clear')), message: 'Should have "Clear All" button' },
      { check: (ui) => ui.components?.filter(c => c.type === 'card').length >= 5, message: 'Should have 5-6 notification cards' },
      { check: (ui) => {
        const cards = ui.components?.filter(c => c.type === 'card') || [];
        return cards.some(card =>
          card.children?.some(child => child.type === 'badge') &&
          card.children?.some(child => child.type === 'text' && child.props?.size === 'sm') &&
          card.children?.some(child => child.type === 'button' && child.props?.label?.includes('Read'))
        );
      }, message: 'Cards should have badges, timestamps, and "Mark as Read" buttons' },
    ]
  },
  {
    name: 'Project Dashboard (Screenshot Test)',
    prompt: `Design a project overview with heading "Project Alpha Dashboard", show project progress with a large progress bar at 67%, display milestone cards with dates and completion badges, a bar chart comparing planned vs actual timeline, team member avatars with names, and upcoming deadline alerts.`,
    validations: [
      { check: (ui) => ui.components?.some(c => c.type === 'heading' && c.props?.content?.includes('Project')), message: 'Should have project heading' },
      { check: (ui) => ui.components?.some(c => c.type === 'progress' && c.props?.value === 67), message: 'Should have 67% progress bar' },
      { check: (ui) => ui.components?.filter(c => c.type === 'card').length >= 2, message: 'Should have milestone cards' },
      { check: (ui) => ui.components?.some(c => c.type === 'chart' && c.props?.chartType === 'bar'), message: 'Should have bar chart' },
      { check: (ui) => {
        const chart = ui.components?.find(c => c.type === 'chart');
        return chart && chart.props?.data?.length >= 3;
      }, message: 'Chart should have 3+ data points' },
    ]
  },
  {
    name: 'Order History Table (Screenshot Test)',
    prompt: `Display an order history table showing Order Number, Date, Items, Total Amount, and Status columns. Include 6 recent orders, use color-coded badges for status (Delivered in green, Shipped in blue, Processing in orange, Cancelled in red), and add a View Details button for each order.`,
    validations: [
      { check: (ui) => ui.components?.some(c => c.type === 'table'), message: 'Should have a table' },
      { check: (ui) => {
        const table = ui.components?.find(c => c.type === 'table');
        return table?.props?.headers?.length === 5;
      }, message: 'Table should have 5 columns' },
      { check: (ui) => {
        const table = ui.components?.find(c => c.type === 'table');
        return table?.props?.rows?.length >= 5;
      }, message: 'Table should have 5-6 rows' },
      { check: (ui) => {
        const table = ui.components?.find(c => c.type === 'table');
        return table?.props?.headers?.includes('Order Number') &&
               table?.props?.headers?.includes('Status');
      }, message: 'Table should have Order Number and Status columns' },
      { check: (ui) => {
        const table = ui.components?.find(c => c.type === 'table');
        const firstRow = table?.props?.rows?.[0];
        return firstRow &&
               firstRow['Order Number'] &&
               firstRow['Order Number'].includes('#');
      }, message: 'Order numbers should be formatted (e.g., #12345)' },
    ]
  },
  {
    name: 'Contact Form',
    prompt: `Build a contact form with name field (text input, required), email field (email input, required), message field (text input, optional), country selector dropdown with 4 countries, and a submit button labeled "Send Message".`,
    validations: [
      { check: (ui) => ui.components?.some(c => c.type === 'form'), message: 'Should have a form' },
      { check: (ui) => {
        const form = ui.components?.find(c => c.type === 'form');
        return form?.children?.filter(c => c.type === 'input').length >= 3;
      }, message: 'Form should have 3 input fields' },
      { check: (ui) => {
        const form = ui.components?.find(c => c.type === 'form');
        return form?.children?.some(c => c.type === 'select' && c.props?.options?.length >= 4);
      }, message: 'Should have country selector with 4+ options' },
      { check: (ui) => {
        const form = ui.components?.find(c => c.type === 'form');
        return form?.props?.submitLabel?.includes('Send');
      }, message: 'Submit button should say "Send Message"' },
    ]
  },
  {
    name: 'Sales Dashboard with Metrics',
    prompt: `Create a sales dashboard with heading "Sales Overview", 3 metric cards showing Total Revenue ($12,450 with +12.5% badge), Orders (234 with +8% badge), and Customers (156 with +15% badge), and a line chart showing last 6 months revenue trend.`,
    validations: [
      { check: (ui) => ui.components?.some(c => c.type === 'heading'), message: 'Should have heading' },
      { check: (ui) => ui.components?.filter(c => c.type === 'card').length >= 3, message: 'Should have 3 metric cards' },
      { check: (ui) => {
        const cards = ui.components?.filter(c => c.type === 'card') || [];
        return cards.some(card =>
          card.children?.some(child => child.type === 'badge' && child.props?.label?.includes('%'))
        );
      }, message: 'Metric cards should have percentage badges' },
      { check: (ui) => ui.components?.some(c => c.type === 'chart' && c.props?.chartType === 'line'), message: 'Should have line chart' },
      { check: (ui) => {
        const chart = ui.components?.find(c => c.type === 'chart');
        return chart?.props?.data?.length >= 6;
      }, message: 'Chart should have 6 months of data' },
    ]
  }
];

// Validation helper
function runValidations(testCase, ui) {
  const results = testCase.validations.map(validation => {
    const passed = validation.check(ui);
    return { passed, message: validation.message };
  });

  const allPassed = results.every(r => r.passed);
  return { results, allPassed };
}

// Quality checks
function analyzeQuality(ui) {
  const issues = [];
  const warnings = [];

  // Check for empty labels
  const checkComponent = (component) => {
    if (component.type === 'button' && (!component.props?.label || component.props.label.trim() === '')) {
      issues.push(`Button ${component.id} has empty label`);
    }
    if (component.type === 'badge' && (!component.props?.label || component.props.label.trim() === '')) {
      issues.push(`Badge ${component.id} has empty label`);
    }
    if (component.type === 'table') {
      if (!component.props?.rows || component.props.rows.length === 0) {
        issues.push(`Table ${component.id} has no rows`);
      } else if (component.props.rows.length < 3) {
        warnings.push(`Table ${component.id} has only ${component.props.rows.length} rows (recommended: 3-6)`);
      }
    }
    if (component.type === 'chart') {
      if (!component.props?.data || component.props.data.length === 0) {
        issues.push(`Chart ${component.id} has no data`);
      } else if (component.props.data.length < 4) {
        warnings.push(`Chart ${component.id} has only ${component.props.data.length} data points (recommended: 4-8)`);
      }
    }

    // Check children recursively
    if (component.children) {
      component.children.forEach(checkComponent);
    }
  };

  ui.components?.forEach(checkComponent);

  return { issues, warnings };
}

// Run test
async function runTest(testCase) {
  console.log(`\n${colors.cyan}${colors.bold}Testing: ${testCase.name}${colors.reset}`);
  console.log(`${colors.blue}Prompt: ${testCase.prompt}${colors.reset}\n`);

  try {
    const client = new GroqClient({ apiKey });
    const response = await client.generateUI({ prompt: testCase.prompt });

    // Run validations
    const { results, allPassed } = runValidations(testCase, response.ui);

    // Quality analysis
    const { issues, warnings } = analyzeQuality(response.ui);

    // Print results
    console.log(`${colors.bold}Validation Results:${colors.reset}`);
    results.forEach(result => {
      const icon = result.passed ? '✓' : '✗';
      const color = result.passed ? colors.green : colors.red;
      console.log(`  ${color}${icon} ${result.message}${colors.reset}`);
    });

    // Print quality issues
    if (issues.length > 0) {
      console.log(`\n${colors.red}${colors.bold}Quality Issues:${colors.reset}`);
      issues.forEach(issue => console.log(`  ${colors.red}✗ ${issue}${colors.reset}`));
    }

    if (warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}Warnings:${colors.reset}`);
      warnings.forEach(warning => console.log(`  ${colors.yellow}⚠ ${warning}${colors.reset}`));
    }

    // Print summary
    const status = allPassed && issues.length === 0 ? 'PASSED' : 'FAILED';
    const statusColor = allPassed && issues.length === 0 ? colors.green : colors.red;
    console.log(`\n${statusColor}${colors.bold}Status: ${status}${colors.reset}`);

    // Print component count
    console.log(`${colors.cyan}Components generated: ${response.ui.components?.length || 0}${colors.reset}`);

    // Print usage stats
    if (response.usage) {
      console.log(`${colors.cyan}Tokens: ${response.usage.totalTokens} (prompt: ${response.usage.promptTokens}, completion: ${response.usage.completionTokens})${colors.reset}`);
    }

    return {
      testCase: testCase.name,
      passed: allPassed && issues.length === 0,
      validationsPassed: results.filter(r => r.passed).length,
      validationsTotal: results.length,
      issues: issues.length,
      warnings: warnings.length,
      componentsGenerated: response.ui.components?.length || 0,
      tokens: response.usage?.totalTokens || 0
    };

  } catch (error) {
    console.log(`${colors.red}${colors.bold}ERROR: ${error.message}${colors.reset}`);
    return {
      testCase: testCase.name,
      passed: false,
      error: error.message
    };
  }
}

// Main
async function main() {
  console.log(`${colors.bold}${colors.cyan}Re Generative UI Quality Test Suite${colors.reset}`);
  console.log(`${colors.cyan}Testing ${testCases.length} scenarios...${colors.reset}\n`);

  const results = [];

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);

    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Print summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${colors.bold}${colors.cyan}SUMMARY${colors.reset}\n`);

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Tests Passed: ${colors.bold}${passed}/${total} (${passRate}%)${colors.reset}`);

  results.forEach(result => {
    const status = result.passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`  ${status} ${result.testCase}`);
    if (result.validationsPassed !== undefined) {
      console.log(`    Validations: ${result.validationsPassed}/${result.validationsTotal}, Issues: ${result.issues}, Warnings: ${result.warnings}`);
    }
  });

  // Calculate averages
  const avgComponents = (results.reduce((sum, r) => sum + (r.componentsGenerated || 0), 0) / results.length).toFixed(1);
  const avgTokens = (results.reduce((sum, r) => sum + (r.tokens || 0), 0) / results.length).toFixed(0);

  console.log(`\n${colors.cyan}Average components per test: ${avgComponents}${colors.reset}`);
  console.log(`${colors.cyan}Average tokens per test: ${avgTokens}${colors.reset}`);

  const finalStatus = passed === total ? `${colors.green}${colors.bold}ALL TESTS PASSED! ✓${colors.reset}` : `${colors.red}${colors.bold}SOME TESTS FAILED${colors.reset}`;
  console.log(`\n${finalStatus}\n`);

  process.exit(passed === total ? 0 : 1);
}

main();
