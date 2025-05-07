/**
 * DM Mode Functionality
 * This file handles DM mode across all pages of the D&D Campaign Wiki
 */

const DM_PASSWORD = 'dm123';
let isAuthenticated = false;

// Initialize DM Mode
document.addEventListener('DOMContentLoaded', function() {
    const editableElements = document.querySelectorAll('.card-content, .card-description');
    
    // Make all content non-editable by default
    editableElements.forEach(element => {
        element.contentEditable = false;
        
        // Add click handler
        element.addEventListener('click', function(e) {
            if (!isAuthenticated) {
                e.preventDefault();
                return false;
            }
        });
    });

    setupDMAuthentication();
});

function setupDMAuthentication() {
    const dmToggle = document.getElementById('dm-mode-toggle');
    const dmModal = document.getElementById('dm-password-modal');
    const verifyBtn = document.getElementById('verify-password');
    const cancelBtn = document.getElementById('cancel-password');
    const logoutBtn = document.getElementById('dm-logout');
    const dmPanel = document.querySelector('.dm-panel');

    // Hide DM panel by default
    if (dmPanel) {
        dmPanel.style.display = 'none';
    }

    // Check if already authenticated
    isAuthenticated = localStorage.getItem('dmAuthenticated') === 'true';
    if (isAuthenticated) {
        document.body.classList.add('dm-mode-active');
        dmToggle.textContent = 'Exit DM Mode';
        // Only show panel if authenticated
        if (dmPanel) {
            dmPanel.style.display = 'block';
        }
    }

    // DM Mode Toggle
    dmToggle.addEventListener('click', function() {
        if (!isAuthenticated) {
            dmModal.style.display = 'block';
        } else {
            disableDMMode();
        }
    });

    // Verify Password
    verifyBtn.addEventListener('click', function() {
        const password = document.getElementById('dm-password').value;
        if (password === DM_PASSWORD) {
            enableDMMode();
            dmModal.style.display = 'none';
            document.getElementById('dm-password').value = '';
        } else {
            alert('Incorrect password');
        }
    });

    // Cancel Login
    cancelBtn.addEventListener('click', function() {
        dmModal.style.display = 'none';
        document.getElementById('dm-password').value = '';
    });

    // Logout
    logoutBtn.addEventListener('click', disableDMMode);

    // Load saved campaigns on startup
    loadSavedCampaigns();
    loadSavedContent();
}

function enableDMMode() {
    isAuthenticated = true;
    localStorage.setItem('dmAuthenticated', 'true');
    document.body.classList.add('dm-mode-active');
    const dmToggle = document.getElementById('dm-mode-toggle');
    const dmPanel = document.querySelector('.dm-panel');
    
    dmToggle.textContent = 'Exit DM Mode';
    
    // Show panel when enabling DM mode
    if (dmPanel) {
        dmPanel.style.display = 'block';
    }

    // Make content editable
    const editableElements = document.querySelectorAll('.card-content, .card-description');
    editableElements.forEach(element => {
        element.contentEditable = true;
        element.classList.add('dm-editable');
        
        // Add blur event to save content when editing stops
        element.addEventListener('blur', function() {
            if (isAuthenticated) {
                saveContent(this);
            }
        });
    });

    // Setup campaign management
    setupCampaignManagement();
}

function disableDMMode() {
    isAuthenticated = false;
    localStorage.removeItem('dmAuthenticated');
    document.body.classList.remove('dm-mode-active');
    const dmToggle = document.getElementById('dm-mode-toggle');
    const dmPanel = document.querySelector('.dm-panel');
    
    dmToggle.textContent = 'DM Mode';
    
    // Hide panel when disabling DM mode
    if (dmPanel) {
        dmPanel.style.display = 'none';
    }

    // Make content non-editable
    const editableElements = document.querySelectorAll('.card-content, .card-description');
    editableElements.forEach(element => {
        element.contentEditable = false;
        element.classList.remove('dm-editable');
    });
}

// Add these new functions
function setupCampaignManagement() {
    const addCampaignBtn = document.querySelector('.dm-panel button:nth-child(4)');
    if (!addCampaignBtn) return;

    addCampaignBtn.addEventListener('click', function() {
        if (!isAuthenticated) return;

        const campaignName = prompt('Enter new campaign name:');
        if (!campaignName) return;

        const campaignId = 'campaign_' + Date.now();
        addCampaign(campaignId, campaignName);
        saveCampaigns();
    });
}

function addCampaign(id, name) {
    const campaignSelect = document.getElementById('campaign-select');
    if (!campaignSelect) return;

    const option = document.createElement('option');
    option.value = id;
    option.textContent = name;
    campaignSelect.appendChild(option);
}

function saveCampaigns() {
    const campaignSelect = document.getElementById('campaign-select');
    if (!campaignSelect) return;

    const campaigns = Array.from(campaignSelect.options).map(option => ({
        id: option.value,
        name: option.textContent
    }));

    localStorage.setItem('campaigns', JSON.stringify(campaigns));
}

function loadSavedCampaigns() {
    const savedCampaigns = localStorage.getItem('campaigns');
    if (!savedCampaigns) return;

    const campaigns = JSON.parse(savedCampaigns);
    campaigns.forEach(campaign => {
        addCampaign(campaign.id, campaign.name);
    });
}

function saveContent(element) {
    if (!isAuthenticated) return;
    
    const content = element.innerHTML;
    const sectionCard = element.closest('.section-card');
    if (!sectionCard) return;

    const sectionId = sectionCard.id || `section_${Date.now()}`;
    sectionCard.id = sectionId;

    const campaignSelect = document.getElementById('campaign-select');
    const currentCampaign = campaignSelect ? campaignSelect.value : 'default';
    
    // Save content with campaign context
    const savedContent = JSON.parse(localStorage.getItem('dmContent') || '{}');
    if (!savedContent[currentCampaign]) {
        savedContent[currentCampaign] = {};
    }
    savedContent[currentCampaign][sectionId] = content;
    
    localStorage.setItem('dmContent', JSON.stringify(savedContent));
    console.log(`Saved content for section ${sectionId} in campaign ${currentCampaign}`);
}

function loadSavedContent() {
    const savedContent = localStorage.getItem('dmContent');
    if (!savedContent) return;

    const content = JSON.parse(savedContent);
    const campaignSelect = document.getElementById('campaign-select');
    const currentCampaign = campaignSelect ? campaignSelect.value : 'default';

    if (content[currentCampaign]) {
        Object.entries(content[currentCampaign]).forEach(([sectionId, html]) => {
            const section = document.getElementById(sectionId);
            if (section) {
                const contentElement = section.querySelector('.card-content, .card-description');
                if (contentElement) {
                    contentElement.innerHTML = html;
                }
            }
        });
    }
}

// Add campaign change listener
document.addEventListener('DOMContentLoaded', function() {
    const campaignSelect = document.getElementById('campaign-select');
    if (campaignSelect) {
        campaignSelect.addEventListener('change', loadSavedContent);
    }
});