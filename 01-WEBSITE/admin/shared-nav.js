/**
 * Shared Navigation for Admin Dashboard
 * Single source of truth for all admin page navigation
 *
 * Usage: Include this script in head and call renderNav('page-name') after body loads
 */

const ADMIN_NAV_CONFIG = {
    brandName: 'Chris David SEO',
    pages: [
        { id: 'dashboard', label: 'Dashboard', path: 'index.html', icon: 'fa-gauge-high' },
        { id: 'progress', label: 'Progress', path: 'progress-report.html', icon: 'fa-chart-line' },
        { id: 'weekly-brain', label: 'Weekly Brain', path: 'weekly-brain.html', icon: 'fa-brain' },
        { id: 'improvement', label: 'Improvement Plan', path: 'improvement-planner.html', icon: 'fa-list-check' },
        { id: 'traffic', label: 'Traffic', path: 'traffic.html', icon: 'fa-users' },
        { id: 'rankings', label: 'Rankings', path: 'rankings.html', icon: 'fa-ranking-star' },
        { id: 'authority', label: 'Authority', path: 'authority.html', icon: 'fa-crown' },
        { id: 'microsites', label: 'Microsites', path: 'microsites.html', icon: 'fa-globe' },
        { id: 'seo-learning', label: 'Learning', path: 'seo-learning.html', icon: 'fa-graduation-cap' },
    ]
};

function renderAdminNav(currentPageId) {
    const navContainer = document.getElementById('admin-nav');
    if (!navContainer) {
        console.error('No element with id="admin-nav" found');
        return;
    }

    const navHTML = `
        <nav class="bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center">
                            <div class="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            <span class="font-bold text-xl">${ADMIN_NAV_CONFIG.brandName}</span>
                        </div>
                        <span id="versionBadge" class="bg-green-500 px-2 py-1 rounded text-xs font-bold">Loading...</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="lastUpdate" class="text-sm text-indigo-200"></span>
                        <a href="../index.html" class="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm font-semibold">View Site</a>
                    </div>
                </div>
                <div class="flex space-x-1 pb-2 overflow-x-auto">
                    ${ADMIN_NAV_CONFIG.pages.map(page => {
                        const isActive = page.id === currentPageId;
                        const activeClass = isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10';
                        return `<a href="${page.path}" class="px-4 py-2 ${activeClass} rounded-t whitespace-nowrap">
                            <i class="fas ${page.icon} mr-1 text-xs"></i>${page.label}
                        </a>`;
                    }).join('\n                    ')}
                </div>
            </div>
        </nav>
    `;

    navContainer.innerHTML = navHTML;

    // Load version badge
    loadVersionBadge();
}

async function loadVersionBadge() {
    try {
        const res = await fetch('https://www.chrisdavidsalon.com/data/version.json');
        const data = await res.json();
        const badge = document.getElementById('versionBadge');
        if (badge) {
            badge.textContent = `v${data.version}`;
        }
    } catch (e) {
        const badge = document.getElementById('versionBadge');
        if (badge) {
            badge.textContent = 'v?.?.?';
        }
    }
}

// Auto-initialize if nav container exists
document.addEventListener('DOMContentLoaded', function() {
    // Check if page wants auto-init
    const navContainer = document.getElementById('admin-nav');
    if (navContainer && navContainer.dataset.page) {
        renderAdminNav(navContainer.dataset.page);
    }
});
