#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const coveragePath = join(process.cwd(), 'coverage', 'coverage-summary.json');
  const coverage = JSON.parse(readFileSync(coveragePath, 'utf8'));
  
  const { lines, functions, branches, statements } = coverage.total;
  
  console.log('📊 Coverage Report:');
  console.log('==================');
  console.log(`Lines:      ${lines.pct}% (${lines.covered}/${lines.total})`);
  console.log(`Functions:  ${functions.pct}% (${functions.covered}/${functions.total})`);
  console.log(`Branches:   ${branches.pct}% (${branches.covered}/${branches.total})`);
  console.log(`Statements: ${statements.pct}% (${statements.covered}/${statements.total})`);
  console.log('==================');
  
  // Generate badge URL
  const mainCoverage = Math.round(lines.pct);
  let color = 'red';
  if (mainCoverage >= 90) color = 'brightgreen';
  else if (mainCoverage >= 80) color = 'green';
  else if (mainCoverage >= 70) color = 'yellow';
  else if (mainCoverage >= 60) color = 'orange';
  
  const badgeUrl = `https://img.shields.io/badge/coverage-${mainCoverage}%25-${color}`;
  console.log('\n🏷️  Coverage Badge URL:');
  console.log(badgeUrl);
  console.log('\n📋 Markdown for README:');
  console.log(`[![Coverage](${badgeUrl})](./coverage/index.html)`);
  
} catch (error) {
  console.error('❌ Could not read coverage file:', error.message);
  console.log('💡 Run "npm run test:coverage" first to generate coverage data');
}