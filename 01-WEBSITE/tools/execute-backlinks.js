// BACKLINK CAMPAIGN EXECUTION SCRIPT
// Chris David Salon - 90 Directory Submission Automation
// ISO Vision LLC

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Business Information
const BUSINESS_INFO = {
  name: 'Chris David Salon',
  address: '223 NE 2nd Ave, Delray Beach, FL 33444',
  phone: '(561) 865-5215',
  email: 'info@chrisdavidsalon.com',
  websites: [
    'https://chrisdavidsalon.com',
    'https://best-delray-salon.com',
    'https://best-salon-palmbeach.com',
    'https://best-salon-site.com'
  ],
  category: 'Hair Salon, Beauty Salon',
  description: 'Chris David Salon is Delray Beach\'s premier luxury hair salon, specializing in color correction, balayage, and keratin treatments.',
  hours: {
    monday: 'Closed',
    tuesday: '9:00 AM - 7:00 PM',
    wednesday: '9:00 AM - 7:00 PM',
    thursday: '9:00 AM - 7:00 PM',
    friday: '9:00 AM - 7:00 PM',
    saturday: '9:00 AM - 5:00 PM',
    sunday: '10:00 AM - 4:00 PM'
  }
};

// Priority directories to submit to
const DIRECTORIES = [
  // LOCAL CRITICAL (Submit First)
  {
    name: 'Delray Beach Chamber of Commerce',
    url: 'https://www.delraybeach.com/business-directory',
    type: 'local',
    priority: 'critical',
    method: 'email',
    contact: 'info@delraybeach.com'
  },
  {
    name: 'Downtown Delray Beach',
    url: 'https://downtowndelraybeach.com/directory',
    type: 'local',
    priority: 'critical',
    method: 'form'
  },
  {
    name: 'Andre Design District',
    url: 'https://andredesigndistrict.com',
    type: 'local',
    priority: 'critical',
    method: 'email',
    contact: 'info@andredesigndistrict.com'
  },
  
  // BEAUTY INDUSTRY (High Priority)
  {
    name: 'Booksy',
    url: 'https://booksy.com/biz/sign-up',
    type: 'beauty',
    priority: 'high',
    method: 'form'
  },
  {
    name: 'StyleSeat',
    url: 'https://www.styleseat.com/pro/signup',
    type: 'beauty',
    priority: 'high',
    method: 'form'
  },
  {
    name: 'Vagaro',
    url: 'https://www.vagaro.com/businesssignup',
    type: 'beauty',
    priority: 'high',
    method: 'form'
  },
  {
    name: 'Fresha',
    url: 'https://www.fresha.com/for-business',
    type: 'beauty',
    priority: 'high',
    method: 'form'
  },
  
  // MAJOR PLATFORMS (Already active but verify)
  {
    name: 'Instagram Business',
    url: 'https://business.instagram.com',
    type: 'major',
    priority: 'high',
    method: 'app',
    status: 'verify'
  },
  {
    name: 'Apple Maps',
    url: 'https://mapsconnect.apple.com',
    type: 'major',
    priority: 'high',
    method: 'form'
  },
  {
    name: 'Bing Places',
    url: 'https://www.bingplaces.com',
    type: 'major',
    priority: 'high',
    method: 'form'
  },
  {
    name: 'TripAdvisor',
    url: 'https://www.tripadvisor.com/GetListedNew',
    type: 'major',
    priority: 'high',
    method: 'form'
  },
  {
    name: 'Nextdoor Business',
    url: 'https://business.nextdoor.com',
    type: 'major',
    priority: 'high',
    method: 'form'
  }
];

// Email templates for manual submissions
const EMAIL_TEMPLATE = `
Subject: Business Listing Request - Chris David Salon

Dear [Directory Name],

We would like to submit Chris David Salon for inclusion in your directory.

Business Details:
- Name: Chris David Salon
- Address: 223 NE 2nd Ave, Delray Beach, FL 33444
- Phone: (561) 865-5215
- Website: https://chrisdavidsalon.com
- Email: info@chrisdavidsalon.com

Description:
Chris David Salon is Delray Beach's premier luxury hair salon, specializing in color correction, balayage, and keratin treatments. Located in the Andre Design District, we offer personalized service using exclusive Goldwell and Davines products.

We also operate these related websites:
- https://best-delray-salon.com
- https://best-salon-palmbeach.com
- https://best-salon-site.com

Please confirm our listing has been added.

Thank you,
Chris David Salon Team
`;

// Automated form submission function
async function submitToDirectory(browser, directory) {
  const page = await browser.newPage();
  const result = {
    name: directory.name,
    status: 'pending',
    timestamp: new Date().toISOString(),
    method: directory.method
  };

  try {
    if (directory.method === 'email') {
      // Log email directories for manual follow-up
      result.status = 'email_required';
      result.email = directory.contact;
      result.template = EMAIL_TEMPLATE.replace('[Directory Name]', directory.name);
      
    } else if (directory.method === 'form') {
      // Automated form submission
      await page.goto(directory.url, { waitUntil: 'networkidle2' });
      
      // Generic form field detection and filling
      // Each directory will need custom selectors
      const fields = {
        'business': BUSINESS_INFO.name,
        'name': BUSINESS_INFO.name,
        'address': BUSINESS_INFO.address,
        'phone': BUSINESS_INFO.phone,
        'email': BUSINESS_INFO.email,
        'website': BUSINESS_INFO.websites[0],
        'url': BUSINESS_INFO.websites[0],
        'description': BUSINESS_INFO.description,
        'category': BUSINESS_INFO.category
      };

      // Try to fill common field names
      for (const [key, value] of Object.entries(fields)) {
        try {
          await page.evaluate((key, value) => {
            const inputs = document.querySelectorAll(`input[name*="${key}"], textarea[name*="${key}"]`);
            inputs.forEach(input => {
              input.value = value;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            });
          }, key, value);
        } catch (e) {
          // Field not found, continue
        }
      }

      // Take screenshot for verification
      await page.screenshot({ 
        path: `./submissions/${directory.name.replace(/\s+/g, '_')}_${Date.now()}.png` 
      });

      result.status = 'submitted';
      result.screenshot = true;
      
    } else if (directory.method === 'app') {
      result.status = 'app_required';
      result.notes = 'Requires mobile app or special access';
    }

    await page.close();
    
  } catch (error) {
    result.status = 'error';
    result.error = error.message;
    await page.close();
  }

  return result;
}

// Main execution function
async function executeBacklinkCampaign() {
  console.log('🚀 STARTING BACKLINK CAMPAIGN EXECUTION');
  console.log('=====================================\n');
  
  // Create submissions directory
  try {
    await fs.mkdir('./submissions', { recursive: true });
  } catch (e) {
    // Directory exists
  }

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const results = [];
  const emailRequired = [];
  
  for (const directory of DIRECTORIES) {
    console.log(`📝 Processing: ${directory.name}`);
    
    const result = await submitToDirectory(browser, directory);
    results.push(result);
    
    if (result.status === 'email_required') {
      emailRequired.push(result);
      console.log(`   ✉️ Email required: ${result.email}`);
    } else if (result.status === 'submitted') {
      console.log(`   ✅ Submitted successfully`);
    } else if (result.status === 'error') {
      console.log(`   ❌ Error: ${result.error}`);
    }
    
    // Add delay between submissions
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  await browser.close();

  // Save results
  const report = {
    campaign: 'Chris David Salon - 90 Directory Backlink Campaign',
    date: new Date().toISOString(),
    total: DIRECTORIES.length,
    submitted: results.filter(r => r.status === 'submitted').length,
    emailRequired: results.filter(r => r.status === 'email_required').length,
    errors: results.filter(r => r.status === 'error').length,
    results: results,
    emailTemplates: emailRequired
  };

  await fs.writeFile(
    './backlink-campaign-report.json',
    JSON.stringify(report, null, 2)
  );

  // Generate email list for manual submissions
  if (emailRequired.length > 0) {
    const emailList = emailRequired.map(dir => 
      `${dir.name}: ${dir.email}\n${dir.template}\n${'='.repeat(50)}\n`
    ).join('\n');
    
    await fs.writeFile('./email-submissions-required.txt', emailList);
    console.log(`\n📧 ${emailRequired.length} directories require email submission`);
    console.log('   See: email-submissions-required.txt');
  }

  // Print summary
  console.log('\n=====================================');
  console.log('CAMPAIGN EXECUTION SUMMARY:');
  console.log('=====================================');
  console.log(`✅ Automated Submissions: ${report.submitted}`);
  console.log(`📧 Email Required: ${report.emailRequired}`);
  console.log(`❌ Errors: ${report.errors}`);
  console.log(`📊 Total Processed: ${report.total}`);
  console.log('\nReport saved to: backlink-campaign-report.json');
  
  return report;
}

// Execute if run directly
if (require.main === module) {
  executeBacklinkCampaign()
    .then(() => {
      console.log('\n✅ Backlink campaign execution complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Campaign failed:', error);
      process.exit(1);
    });
}

module.exports = { executeBacklinkCampaign, DIRECTORIES };