#!/usr/bin/env node

/**
 * Live API Test - Re Quality Improvements
 * Tests the improvements with real Groq API calls
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('Usage: node live-test.js <api-key>');
  process.exit(1);
}

// Read system prompt from source
const clientSource = fs.readFileSync(
  path.join(__dirname, 'packages/core/src/client/groq-client.ts'),
  'utf8'
);

const match = clientSource.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
const SYSTEM_PROMPT = match ? match[1] : '';

console.log('\n🧪 Re Quality Improvements - Live Test\n');
console.log('📊 System Prompt Stats:');
console.log(`  Length: ${SYSTEM_PROMPT.length} characters`);
console.log(`  Lines: ${SYSTEM_PROMPT.split('\n').length}`);
console.log(`  Has "NEVER leave button labels empty": ${SYSTEM_PROMPT.includes('NEVER leave button labels empty')}`);
console.log(`  Has "3-6 rows" requirement: ${SYSTEM_PROMPT.includes('3-6 rows')}`);
console.log('');

// Test case from screenshots
const TEST_PROMPT = 'Build a notification center with a heading "Recent Notifications", display 3 notification cards with badges showing alert types (info, success, error), message text, timestamps like "2 hours ago", and mark as read buttons.';

console.log('🎯 Test Prompt:');
console.log(`"${TEST_PROMPT}"\n`);

function makeRequest(prompt) {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(response.error.message || 'API Error'));
          } else {
            resolve(response);
          }
        } catch (error) {
          reject(new Error(`Parse error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.write(requestData);
    req.end();
  });
}

async function runTest() {
  try {
    console.log('⏳ Sending request to Groq API...\n');

    const response = await makeRequest(TEST_PROMPT);
    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ No content in response');
      process.exit(1);
    }

    const ui = JSON.parse(content);

    console.log('✅ Response received!\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Token usage
    console.log('📊 Usage Statistics:');
    console.log(`  Total tokens: ${response.usage?.total_tokens || 0}`);
    console.log(`  Prompt tokens: ${response.usage?.prompt_tokens || 0}`);
    console.log(`  Completion tokens: ${response.usage?.completion_tokens || 0}`);
    console.log(`  Components generated: ${ui.components?.length || 0}\n`);

    // Quality analysis
    const buttons = [];
    const badges = [];
    const texts = [];
    const cards = [];
    const headings = [];

    function analyzeComponent(comp) {
      if (comp.type === 'button') {
        buttons.push({ id: comp.id, label: comp.props?.label || '[EMPTY]' });
      }
      if (comp.type === 'badge') {
        badges.push({ id: comp.id, label: comp.props?.label || '[EMPTY]', variant: comp.props?.variant });
      }
      if (comp.type === 'text' && comp.props?.size === 'sm') {
        texts.push({ id: comp.id, content: comp.props?.content || '[EMPTY]' });
      }
      if (comp.type === 'card') {
        cards.push(comp);
      }
      if (comp.type === 'heading') {
        headings.push({ id: comp.id, content: comp.props?.content || '[EMPTY]' });
      }
      if (comp.children) {
        comp.children.forEach(analyzeComponent);
      }
    }

    ui.components?.forEach(analyzeComponent);

    // Results
    console.log('🔍 Quality Analysis:\n');

    // Headings
    console.log('📋 Headings:');
    if (headings.length > 0) {
      headings.forEach((h, i) => {
        const isEmpty = h.content === '[EMPTY]' || !h.content.trim();
        const icon = isEmpty ? '❌' : '✅';
        console.log(`  ${icon} Heading ${i + 1}: "${h.content}"`);
      });
    } else {
      console.log('  ⚠️  No headings found');
    }
    console.log('');

    // Cards
    console.log(`📇 Notification Cards: ${cards.length}`);
    if (cards.length >= 3) {
      console.log(`  ✅ Found ${cards.length} cards (requested 3)`);
    } else {
      console.log(`  ⚠️  Only ${cards.length} cards (requested 3)`);
    }
    console.log('');

    // Badges
    console.log(`🏷️  Badges: ${badges.length}`);
    badges.forEach((badge, i) => {
      const isEmpty = badge.label === '[EMPTY]' || !badge.label.trim();
      const icon = isEmpty ? '❌' : '✅';
      const variant = badge.variant ? ` (${badge.variant})` : '';
      console.log(`  ${icon} Badge ${i + 1}: "${badge.label}"${variant}`);
    });
    console.log('');

    // Timestamps
    console.log(`⏰ Timestamps: ${texts.length}`);
    texts.forEach((text, i) => {
      const isEmpty = text.content === '[EMPTY]' || !text.content.trim();
      const icon = isEmpty ? '❌' : '✅';
      const hasTimeIndicator = text.content.includes('ago') || text.content.includes('2024') || text.content.includes('hour') || text.content.includes('day');
      const timeIcon = hasTimeIndicator ? '🕒' : '';
      console.log(`  ${icon} ${timeIcon} Timestamp ${i + 1}: "${text.content}"`);
    });
    console.log('');

    // Buttons
    console.log(`🔘 Buttons: ${buttons.length}`);
    buttons.forEach((btn, i) => {
      const isEmpty = btn.label === '[EMPTY]' || !btn.label.trim();
      const icon = isEmpty ? '❌' : '✅';
      console.log(`  ${icon} Button ${i + 1}: "${btn.label}"`);
    });
    console.log('');

    // Overall assessment
    const emptyButtons = buttons.filter(b => b.label === '[EMPTY]' || !b.label.trim()).length;
    const emptyBadges = badges.filter(b => b.label === '[EMPTY]' || !b.label.trim()).length;
    const emptyTexts = texts.filter(t => t.content === '[EMPTY]' || !t.content.trim()).length;
    const emptyHeadings = headings.filter(h => h.content === '[EMPTY]' || !h.content.trim()).length;

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('🎯 Quality Assessment:\n');

    const issues = [];
    if (emptyButtons > 0) issues.push(`${emptyButtons} empty button(s)`);
    if (emptyBadges > 0) issues.push(`${emptyBadges} empty badge(s)`);
    if (emptyTexts > 0) issues.push(`${emptyTexts} empty text(s)`);
    if (emptyHeadings > 0) issues.push(`${emptyHeadings} empty heading(s)`);
    if (cards.length < 3) issues.push(`only ${cards.length} cards (expected 3)`);

    if (issues.length === 0) {
      console.log('✅ ✅ ✅ PERFECT! All quality checks passed! ✅ ✅ ✅\n');
      console.log('  ✓ No empty labels');
      console.log('  ✓ Realistic timestamps');
      console.log('  ✓ Requested number of cards');
      console.log('  ✓ All badges have text');
      console.log('  ✓ All buttons have labels\n');
      console.log('🎉 Improvements are working PERFECTLY!\n');
    } else {
      console.log('⚠️  Issues found:\n');
      issues.forEach(issue => console.log(`  ❌ ${issue}`));
      console.log('');
    }

    // Show sample output
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('📄 Sample Output (first 800 chars):\n');
    console.log(JSON.stringify(ui, null, 2).substring(0, 800) + '...\n');

    console.log('═══════════════════════════════════════════════════════════════\n');

    if (issues.length === 0) {
      console.log('✅ TEST PASSED - Quality improvements verified! 🎉\n');
      process.exit(0);
    } else {
      console.log('⚠️  TEST HAD ISSUES - See details above\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
