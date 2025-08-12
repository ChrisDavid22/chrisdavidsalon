#!/usr/bin/env node

/**
 * White Label Directory Automation Execution Script
 * Integrates with the admin panel to execute directory submissions
 * 
 * @author Claude Code - ISO Vision LLC
 * @date 2025-08-11
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs');

// Import the automation engine
const WhiteLabelDirectoryEngine = require('./directory-automation-engine.js');

// Configuration
const CONFIG = {
    headless: false, // Set to true for production
    screenshotsDir: path.join(__dirname, 'screenshots'),
    reportsDir: path.join(__dirname, 'reports'),
    logFile: path.join(__dirname, 'automation.log')
};

// Default business configuration (Chris David Salon)
const DEFAULT_BUSINESS = {
    name: 'Chris David Salon',
    owner: 'Chris David',
    address: '223 NE 2nd Ave, Delray Beach, FL 33444',
    phone: '(561) 865-5215',
    email: 'chrisdavidsalon@gmail.com',
    website: 'https://chrisdavidsalon.com',
    category: 'hair-salon',
    hours: 'Tue-Fri 9-7, Sat 9-5, Sun 10-4, Mon Closed',
    description: 'Premier luxury hair salon specializing in color correction, balayage, and keratin treatments. Chris David is a master colorist with 20+ years experience, formerly an educator for Davines professional hair care.',
    city: 'Delray Beach',
    state: 'FL',
    zip: '33444'
};

// Directory databases by business type
const DIRECTORY_DATABASES = {
    'hair-salon': [
        { name: 'Google My Business', url: 'https://business.google.com', priority: 1, da: 100, automated: true, category: 'Essential' },
        { name: 'Yelp Business', url: 'https://biz.yelp.com', priority: 2, da: 94, automated: true, category: 'Essential' },
        { name: 'Facebook Business', url: 'https://business.facebook.com', priority: 3, da: 96, automated: true, category: 'Social' },
        { name: 'Instagram Business', url: 'https://business.instagram.com', priority: 4, da: 93, automated: true, category: 'Social' },
        { name: 'Booksy', url: 'https://booksy.com/biz/sign-up', priority: 5, da: 73, automated: true, category: 'Booking' },
        { name: 'StyleSeat', url: 'https://www.styleseat.com/pro/signup', priority: 6, da: 71, automated: true, category: 'Booking' },
        { name: 'Vagaro', url: 'https://www.vagaro.com/businesssignup', priority: 7, da: 69, automated: true, category: 'Booking' },
        { name: 'Apple Maps', url: 'https://mapsconnect.apple.com', priority: 8, da: 100, automated: false, category: 'Maps' },
        { name: 'Bing Places', url: 'https://www.bingplaces.com', priority: 9, da: 91, automated: true, category: 'Maps' },
        { name: 'Yellow Pages', url: 'https://www.yellowpages.com', priority: 10, da: 85, automated: true, category: 'Directory' }
    ]
};

class DirectoryAutomationExecutor {
    constructor() {
        this.engine = new WhiteLabelDirectoryEngine();
        this.startTime = null;
        this.results = [];
        this.setupDirectories();
    }

    setupDirectories() {
        // Create necessary directories
        [CONFIG.screenshotsDir, CONFIG.reportsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    log(message, writeToFile = true) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        
        console.log(logMessage);
        
        if (writeToFile) {
            fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
        }
    }

    async executeAutomation(businessConfig = DEFAULT_BUSINESS, selectedDirectories = null, options = {}) {
        try {
            this.startTime = Date.now();
            this.log('🚀 Starting White Label Directory Automation System');
            this.log(`📋 Business: ${businessConfig.name}`);
            
            // Initialize automation engine
            const initialized = await this.engine.initialize(CONFIG.headless);
            if (!initialized) {
                throw new Error('Failed to initialize automation engine');
            }
            
            // Configure business
            this.engine.setBusiness(businessConfig);
            
            // Get directories to process
            const directories = selectedDirectories || this.getOptimalDirectories(businessConfig.category);
            this.log(`🎯 Processing ${directories.length} directories`);
            
            // Execute submissions
            const results = await this.engine.executeSubmissions(directories, {
                onProgress: (progress) => {
                    this.log(`📊 Progress: ${progress.percentage}% - ${progress.currentDirectory} (${progress.result})`);
                }
            });
            
            this.results = results;
            
            // Generate and save report
            const report = this.generateComprehensiveReport();
            await this.saveReport(report);
            
            // Display summary
            this.displaySummary(report);
            
            return report;
            
        } catch (error) {
            this.log(`❌ Automation failed: ${error.message}`, true);
            throw error;
        } finally {
            await this.engine.cleanup();
        }
    }

    getOptimalDirectories(businessCategory) {
        const directories = DIRECTORY_DATABASES[businessCategory] || DIRECTORY_DATABASES['hair-salon'];
        // Return top priority directories that are automated
        return directories.filter(dir => dir.priority <= 7 && dir.da >= 70);
    }

    generateComprehensiveReport() {
        const engineReport = this.engine.generateReport();
        const runtime = Math.round((Date.now() - this.startTime) / 60000);
        
        return {
            ...engineReport,
            executionMetrics: {
                totalRuntime: runtime,
                averageTimePerDirectory: Math.round(runtime / this.results.length),
                screenshotsTaken: this.engine.screenshots.length,
                automationMode: CONFIG.headless ? 'headless' : 'headed'
            },
            nextActions: this.generateNextActions(),
            whiteLabel: {
                version: '1.0.0',
                provider: 'ISO Vision LLC',
                deployment: 'Chris David Salon Admin System'
            }
        };
    }

    generateNextActions() {
        const actions = [];
        
        const manualItems = this.results.filter(r => r.result.status === 'manual_required');
        const failedItems = this.results.filter(r => r.result.status === 'error');
        const successItems = this.results.filter(r => r.result.status === 'success');
        
        if (manualItems.length > 0) {
            actions.push({
                type: 'manual_completion',
                priority: 'high',
                count: manualItems.length,
                description: `Complete manual setup for ${manualItems.length} directories`,
                directories: manualItems.map(item => item.directory),
                estimatedTime: `${manualItems.length * 15} minutes`
            });
        }
        
        if (failedItems.length > 0) {
            actions.push({
                type: 'retry_submissions',
                priority: 'medium',
                count: failedItems.length,
                description: `Retry failed submissions for ${failedItems.length} directories`,
                directories: failedItems.map(item => item.directory),
                estimatedTime: `${failedItems.length * 10} minutes`
            });
        }
        
        if (successItems.length > 0) {
            actions.push({
                type: 'verification',
                priority: 'low',
                count: successItems.length,
                description: `Verify successful submissions are live and accurate`,
                directories: successItems.map(item => item.directory),
                estimatedTime: `${successItems.length * 5} minutes`
            });
        }
        
        // Add follow-up scheduling
        actions.push({
            type: 'follow_up',
            priority: 'medium',
            description: 'Schedule 30-day follow-up to verify all listings are active',
            scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
        return actions;
    }

    async saveReport(report) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFilename = `directory-automation-report-${timestamp}.json`;
        const reportPath = path.join(CONFIG.reportsDir, reportFilename);
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Also create an HTML report
        const htmlReport = this.generateHTMLReport(report);
        const htmlFilename = `directory-automation-report-${timestamp}.html`;
        const htmlPath = path.join(CONFIG.reportsDir, htmlFilename);
        
        fs.writeFileSync(htmlPath, htmlReport);
        
        this.log(`📊 Report saved: ${reportPath}`);
        this.log(`🌐 HTML Report saved: ${htmlPath}`);
        
        return { jsonReport: reportPath, htmlReport: htmlPath };
    }

    generateHTMLReport(report) {
        const { summary } = report;
        const successRate = Math.round((summary.successful / summary.totalDirectories) * 100);
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Directory Automation Report - ${report.business.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="max-w-6xl mx-auto p-6">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-lg p-6 mb-6">
            <h1 class="text-3xl font-bold mb-2">
                <i class="fas fa-robot mr-3"></i>Directory Automation Report
            </h1>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div class="text-center">
                    <div class="text-2xl font-bold">${report.business.name}</div>
                    <div class="text-purple-200">Business</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold">${new Date(report.timestamp).toLocaleDateString()}</div>
                    <div class="text-purple-200">Execution Date</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold">${summary.totalDirectories}</div>
                    <div class="text-purple-200">Directories Processed</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-300">${successRate}%</div>
                    <div class="text-purple-200">Success Rate</div>
                </div>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center">
                    <div class="p-3 bg-green-100 rounded-full mr-4">
                        <i class="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-green-600">${summary.successful}</div>
                        <div class="text-gray-600">Successful Submissions</div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center">
                    <div class="p-3 bg-yellow-100 rounded-full mr-4">
                        <i class="fas fa-user text-yellow-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-yellow-600">${summary.manualRequired}</div>
                        <div class="text-gray-600">Manual Setup Required</div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center">
                    <div class="p-3 bg-red-100 rounded-full mr-4">
                        <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-red-600">${summary.errors}</div>
                        <div class="text-gray-600">Failed/Errors</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Results -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-2xl font-bold mb-4">Detailed Results</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="text-left p-3">Directory</th>
                            <th class="text-left p-3">Category</th>
                            <th class="text-left p-3">DA</th>
                            <th class="text-left p-3">Status</th>
                            <th class="text-left p-3">Details</th>
                            <th class="text-left p-3">Screenshot</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${report.results.map(result => `
                        <tr>
                            <td class="p-3 font-semibold">${result.directory}</td>
                            <td class="p-3">
                                <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    ${result.category}
                                </span>
                            </td>
                            <td class="p-3">${result.da}</td>
                            <td class="p-3">
                                <span class="px-2 py-1 rounded text-xs ${this.getStatusClass(result.result.status)}">
                                    ${result.result.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </td>
                            <td class="p-3 text-xs">${result.result.message}</td>
                            <td class="p-3">
                                ${result.screenshot ? `<i class="fas fa-camera text-blue-500" title="${result.screenshot}"></i>` : '-'}
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Next Actions -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold mb-4">
                <i class="fas fa-tasks mr-2 text-blue-600"></i>Next Actions Required
            </h2>
            <div class="space-y-4">
                ${report.nextActions.map(action => `
                <div class="p-4 border-l-4 ${this.getPriorityBorder(action.priority)} bg-gray-50 rounded-r">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-gray-800">${action.description}</h3>
                            ${action.directories ? `<div class="text-sm text-gray-600 mt-1">Directories: ${action.directories.join(', ')}</div>` : ''}
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-semibold ${this.getPriorityText(action.priority)}">${action.priority.toUpperCase()}</div>
                            ${action.estimatedTime ? `<div class="text-xs text-gray-500">${action.estimatedTime}</div>` : ''}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center text-gray-500 text-sm">
            <p>Generated by White Label Directory Automation System v${report.whiteLabel.version}</p>
            <p>Powered by ${report.whiteLabel.provider} | ${report.whiteLabel.deployment}</p>
        </div>
    </div>
</body>
</html>`;
    }

    getStatusClass(status) {
        const classes = {
            'success': 'bg-green-100 text-green-800',
            'manual_required': 'bg-yellow-100 text-yellow-800',
            'error': 'bg-red-100 text-red-800',
            'partial': 'bg-blue-100 text-blue-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getPriorityBorder(priority) {
        const borders = {
            'high': 'border-red-500',
            'medium': 'border-yellow-500',
            'low': 'border-green-500'
        };
        return borders[priority] || 'border-gray-500';
    }

    getPriorityText(priority) {
        const colors = {
            'high': 'text-red-600',
            'medium': 'text-yellow-600',
            'low': 'text-green-600'
        };
        return colors[priority] || 'text-gray-600';
    }

    displaySummary(report) {
        const { summary, executionMetrics } = report;
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DIRECTORY AUTOMATION COMPLETED!');
        console.log('='.repeat(60));
        console.log(`📋 Business: ${report.business.name}`);
        console.log(`⏱️  Total Runtime: ${executionMetrics.totalRuntime} minutes`);
        console.log(`📊 Success Rate: ${Math.round((summary.successful / summary.totalDirectories) * 100)}%`);
        console.log('');
        console.log('📈 RESULTS SUMMARY:');
        console.log(`   ✅ Successful: ${summary.successful}`);
        console.log(`   ⚠️  Manual Required: ${summary.manualRequired}`);
        console.log(`   ❌ Errors: ${summary.errors}`);
        console.log('');
        console.log('🎯 NEXT STEPS:');
        report.nextActions.forEach((action, index) => {
            console.log(`   ${index + 1}. ${action.description} (${action.priority} priority)`);
        });
        console.log('');
        console.log('📊 Reports available in: ' + CONFIG.reportsDir);
        console.log('📸 Screenshots available in: ' + CONFIG.screenshotsDir);
        console.log('='.repeat(60));
    }
}

// Command line execution
if (require.main === module) {
    const executor = new DirectoryAutomationExecutor();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};
    
    if (args.includes('--headless')) {
        CONFIG.headless = true;
    }
    
    if (args.includes('--optimal-only')) {
        options.optimalOnly = true;
    }
    
    // Execute automation
    executor.executeAutomation(DEFAULT_BUSINESS, null, options)
        .then(report => {
            console.log('✅ Automation completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Automation failed:', error.message);
            process.exit(1);
        });
}

module.exports = DirectoryAutomationExecutor;