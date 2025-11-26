#!/usr/bin/env node

/**
 * Citation Automation Agent v2.0
 *
 * Advanced Playwright-based system for automating business directory submissions
 * with sophisticated anti-detection and evasion capabilities.
 *
 * Features:
 * - Advanced anti-detection (fingerprint randomization, human-like behavior)
 * - Dynamic CAPTCHA detection and handling
 * - Adaptive rate limiting with backoff
 * - Multiple browser fingerprint profiles
 * - Human-like mouse movements (Bezier curves)
 * - Natural typing with occasional "typos"
 * - Multiple form-filling strategies
 * - Verification system
 * - Progress tracking and reporting
 *
 * Usage:
 *   node index.js submit <directory-id>  - Submit to specific directory
 *   node index.js submit --all           - Submit to all directories
 *   node index.js submit --safe-only     - Submit to easy directories only
 *   node index.js adaptive <directory>   - Use advanced adaptive submission
 *   node index.js adaptive --all         - Adaptive batch submission
 *   node index.js verify                 - Verify all citations
 *   node index.js status                 - Show submission status
 *   node index.js report                 - Generate verification report
 *   node index.js list                   - List available directories
 *   node index.js test                   - Test browser stealth
 *   node index.js test-evasion           - Test advanced evasion engine
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { submitToDirectory, submitToAll, getStatus } from './submitter.js';
import { adaptiveSubmit, adaptiveBatchSubmit } from './adaptive-submitter.js';
import { verifyAllCitations, generateReport } from './verifier.js';
import { createStealthBrowser } from './browser-utils.js';
import { createStealthContext, detectAndHandleCaptcha } from './evasion-engine.js';
import { directories } from './config.js';

const program = new Command();

program
  .name('citation-agent')
  .description('Automated citation/directory submission system')
  .version('1.0.0');

// Submit command
program
  .command('submit [directoryId]')
  .description('Submit business to directory')
  .option('-a, --all', 'Submit to all directories')
  .option('-s, --safe-only', 'Only submit to easy/safe directories')
  .option('-k, --keep-open', 'Keep browser open after submission')
  .action(async (directoryId, options) => {
    console.log(chalk.blue.bold('\n🚀 Citation Submission Agent\n'));

    try {
      if (options.all || options.safeOnly) {
        const spinner = ora('Submitting to directories...').start();
        const results = await submitToAll({
          safeOnly: options.safeOnly,
          keepOpen: options.keepOpen
        });

        spinner.succeed('Submissions complete!\n');

        console.log(chalk.green(`✅ Successful: ${results.filter(r => r.success).length}`));
        console.log(chalk.red(`❌ Failed: ${results.filter(r => !r.success).length}`));

        for (const result of results) {
          const icon = result.success ? '✅' : '❌';
          console.log(`  ${icon} ${result.directory}: ${result.message || result.error}`);
        }

      } else if (directoryId) {
        const spinner = ora(`Submitting to ${directoryId}...`).start();
        const result = await submitToDirectory(directoryId, {
          keepOpen: options.keepOpen
        });
        spinner.succeed(`Submission to ${directoryId} complete!`);

        console.log(`\nResult: ${result.success ? chalk.green('Success') : chalk.red('Failed')}`);
        console.log(`Message: ${result.message}`);
        if (result.screenshot) {
          console.log(`Screenshot: ${result.screenshot}`);
        }

      } else {
        console.log(chalk.yellow('Please specify a directory ID or use --all'));
        console.log('Run "node index.js list" to see available directories');
      }

    } catch (error) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

// Verify command
program
  .command('verify')
  .description('Verify business listings on directories')
  .option('-a, --all', 'Check all directories (not just priority ones)')
  .action(async (options) => {
    console.log(chalk.blue.bold('\n🔍 Citation Verification Agent\n'));

    const spinner = ora('Verifying citations...').start();

    try {
      const results = await verifyAllCitations({ all: options.all });
      spinner.succeed('Verification complete!\n');

      console.log(chalk.white('Results:'));
      console.log(`  Total checked: ${results.totalChecked}`);
      console.log(chalk.green(`  Listed: ${results.listedCount}`));
      console.log(chalk.red(`  Not listed: ${results.notListedCount}`));

      console.log('\nDetails:');
      for (const result of results.results) {
        const icon = result.listed ? chalk.green('✅') : chalk.red('❌');
        console.log(`  ${icon} ${result.directory}`);
      }

    } catch (error) {
      spinner.fail('Verification failed');
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show submission status')
  .action(() => {
    console.log(chalk.blue.bold('\n📊 Citation Submission Status\n'));

    const status = getStatus();

    if (Object.keys(status).length === 0) {
      console.log(chalk.yellow('No submissions yet. Run "node index.js submit --all" to start.'));
      return;
    }

    for (const [directoryId, info] of Object.entries(status)) {
      const statusIcon =
        info.status === 'submitted' ? chalk.green('✅') :
        info.status === 'failed' ? chalk.red('❌') :
        chalk.yellow('⏳');

      console.log(`${statusIcon} ${directoryId}`);
      console.log(`   Status: ${info.status}`);
      console.log(`   Last attempt: ${info.lastAttempt}`);
      if (info.message) console.log(`   Message: ${info.message}`);
      console.log('');
    }
  });

// Report command
program
  .command('report')
  .description('Generate verification report')
  .action(() => {
    const report = generateReport();
    console.log(report);
  });

// List command
program
  .command('list')
  .description('List available directories')
  .action(() => {
    console.log(chalk.blue.bold('\n📋 Available Directories\n'));

    const sorted = [...directories].sort((a, b) => (a.priority || 99) - (b.priority || 99));

    for (const dir of sorted) {
      const difficultyColor =
        dir.difficulty === 'easy' ? chalk.green :
        dir.difficulty === 'medium' ? chalk.yellow :
        chalk.red;

      console.log(`${chalk.white.bold(dir.id.padEnd(20))} ${difficultyColor(dir.difficulty.padEnd(10))} Priority: ${dir.priority || '-'}`);
      console.log(`  ${chalk.gray(dir.url)}`);
      if (dir.requiresVerification) {
        console.log(`  ${chalk.yellow(`⚠️  Requires ${dir.verificationType} verification`)}`);
      }
      console.log('');
    }

    console.log(`\nTotal: ${directories.length} directories`);
    console.log(`Easy: ${directories.filter(d => d.difficulty === 'easy').length}`);
    console.log(`Medium: ${directories.filter(d => d.difficulty === 'medium').length}`);
  });

// Test command
program
  .command('test')
  .description('Test browser setup and anti-detection')
  .action(async () => {
    console.log(chalk.blue.bold('\n🧪 Testing Browser Setup\n'));

    const spinner = ora('Launching stealth browser...').start();

    try {
      const { browser, context } = await createStealthBrowser();
      spinner.text = 'Opening test page...';

      const page = await context.newPage();
      await page.goto('https://bot.sannysoft.com/');
      await page.waitForTimeout(5000);

      const screenshot = await page.screenshot({
        path: './screenshots/bot-detection-test.png',
        fullPage: true
      });

      spinner.succeed('Browser test complete!');
      console.log(chalk.green('\nScreenshot saved: ./screenshots/bot-detection-test.png'));
      console.log('Check the screenshot to verify anti-detection measures are working.');

      await browser.close();

    } catch (error) {
      spinner.fail('Browser test failed');
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Adaptive submit command (advanced evasion)
program
  .command('adaptive [directoryId]')
  .description('Use advanced adaptive submission with evasion engine')
  .option('-a, --all', 'Submit to all directories')
  .option('-d, --dry-run', 'Fill forms but do not submit')
  .option('-k, --keep-open', 'Keep browser open after submission')
  .action(async (directoryId, options) => {
    console.log(chalk.magenta.bold('\n🥷 Advanced Adaptive Citation Agent\n'));
    console.log(chalk.gray('Using advanced evasion techniques...\n'));

    try {
      if (options.all) {
        const results = await adaptiveBatchSubmit(null, {
          dryRun: options.dryRun,
          keepOpen: options.keepOpen
        });

        console.log('\n' + chalk.magenta.bold('Final Results:'));
        console.log(chalk.green(`✅ Successful: ${results.filter(r => r.success).length}`));
        console.log(chalk.red(`❌ Failed: ${results.filter(r => !r.success).length}`));

      } else if (directoryId) {
        const spinner = ora(`Adaptive submission to ${directoryId}...`).start();

        const result = await adaptiveSubmit(directoryId, {
          dryRun: options.dryRun,
          keepOpen: options.keepOpen
        });

        if (result.success) {
          spinner.succeed(`Adaptive submission to ${directoryId} complete!`);
        } else {
          spinner.warn(`Submission may need manual verification`);
        }

        console.log(`\nResult: ${result.success ? chalk.green('Success') : chalk.yellow('Needs Review')}`);
        console.log(`Message: ${result.message || result.reason || result.error}`);
        if (result.screenshotBefore) {
          console.log(`Screenshot (before): ${result.screenshotBefore}`);
        }
        if (result.screenshotAfter) {
          console.log(`Screenshot (after): ${result.screenshotAfter}`);
        }

      } else {
        console.log(chalk.yellow('Please specify a directory ID or use --all'));
        console.log('Run "node index.js list" to see available directories');
      }

    } catch (error) {
      console.error(chalk.red(`\nError: ${error.message}`));
      process.exit(1);
    }
  });

// Test evasion engine command
program
  .command('test-evasion')
  .description('Test advanced evasion engine capabilities')
  .action(async () => {
    console.log(chalk.magenta.bold('\n🥷 Testing Advanced Evasion Engine\n'));

    const spinner = ora('Initializing stealth context...').start();

    try {
      const { browser, context, fingerprint } = await createStealthContext();

      spinner.text = 'Fingerprint generated';
      console.log('\n');
      console.log(chalk.cyan('Generated Fingerprint:'));
      console.log(`  User Agent: ${fingerprint.userAgent.substring(0, 60)}...`);
      console.log(`  Screen: ${fingerprint.screen.width}x${fingerprint.screen.height}`);
      console.log(`  Cores: ${fingerprint.hardwareConcurrency}`);
      console.log(`  Memory: ${fingerprint.deviceMemory}GB`);
      console.log(`  Timezone: ${fingerprint.timezone}`);

      spinner.text = 'Testing on bot detection sites...';

      const page = await context.newPage();

      // Test 1: SannySoft (comprehensive bot detection)
      console.log(chalk.yellow('\n📍 Test 1: SannySoft Bot Detection'));
      await page.goto('https://bot.sannysoft.com/');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: './screenshots/evasion-test-sannysoft.png', fullPage: true });
      console.log(chalk.green('  ✓ Screenshot saved: ./screenshots/evasion-test-sannysoft.png'));

      // Test 2: BrowserLeaks (fingerprint analysis)
      console.log(chalk.yellow('\n📍 Test 2: BrowserLeaks Fingerprint'));
      await page.goto('https://browserleaks.com/javascript');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: './screenshots/evasion-test-browserleaks.png', fullPage: true });
      console.log(chalk.green('  ✓ Screenshot saved: ./screenshots/evasion-test-browserleaks.png'));

      // Test 3: CreepJS (advanced detection)
      console.log(chalk.yellow('\n📍 Test 3: CreepJS Advanced Detection'));
      await page.goto('https://abrahamjuliot.github.io/creepjs/');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: './screenshots/evasion-test-creepjs.png', fullPage: true });
      console.log(chalk.green('  ✓ Screenshot saved: ./screenshots/evasion-test-creepjs.png'));

      spinner.succeed('Evasion engine tests complete!');

      console.log(chalk.cyan('\n📸 Review the screenshots to verify evasion effectiveness:'));
      console.log('  - ./screenshots/evasion-test-sannysoft.png');
      console.log('  - ./screenshots/evasion-test-browserleaks.png');
      console.log('  - ./screenshots/evasion-test-creepjs.png');

      console.log(chalk.green('\n✅ Green results = passed detection'));
      console.log(chalk.red('❌ Red results = detected as bot'));

      await browser.close();

    } catch (error) {
      spinner.fail('Evasion test failed');
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
