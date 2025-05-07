document.addEventListener('DOMContentLoaded', function() {
    // Campaign timeline tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const campaignSelect = document.getElementById('campaign-select');
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Campaign selector functionality
    campaignSelect.addEventListener('change', function() {
        loadCampaignData(this.value);
    });
    
    // Initial load
    loadCampaignData(campaignSelect.value);
});

// Function to load campaign data based on selection
function loadCampaignData(campaignId) {
    const campaigns = JSON.parse(localStorage.getItem('campaigns')) || [];
    
    // Check if we're on the campaign details page
    const detailsElements = {
        name: document.getElementById('campaign-name'),
        desc: document.getElementById('campaign-description'),
        date: document.getElementById('campaign-date')
    };

    // Check if we're on the campaign selector page
    const selectorElements = {
        select: document.getElementById('campaign-select'),
        grid: document.getElementById('campaign-grid')
    };

    // Handle campaign details page
    if (Object.values(detailsElements).some(el => el)) {
        handleCampaignDetails(campaigns, detailsElements);
    }
    
    // Handle campaign selector page
    else if (Object.values(selectorElements).some(el => el)) {
        handleCampaignSelector(campaigns, selectorElements, campaignId);
    }
    
    // If neither page elements found, log warning
    else {
        console.warn('No campaign elements found - check your page structure');
    }
}

function handleCampaignDetails(campaigns, elements) {
    if (campaigns.length > 0) {
        const currentCampaign = campaigns[0];
        updateCampaignUI(currentCampaign);
    } else if (elements.name && elements.desc) {
        elements.name.textContent = 'No Campaign Selected';
        elements.desc.textContent = 'Create a new campaign to get started.';
    }
}

function handleCampaignSelector(campaigns, elements, campaignId) {
    if (elements.grid) {
        elements.grid.innerHTML = '';
        if (campaigns.length > 0) {
            campaigns.forEach(campaign => {
                const card = createCampaignCard(campaign);
                elements.grid.appendChild(card);
            });
        } else {
            elements.grid.innerHTML = `
                <div class="empty-state">
                    <p>No campaigns found. Create your first campaign to get started!</p>
                    <button class="create-campaign-btn">Create Campaign</button>
                </div>
            `;
        }
    }

    // Fixed: Use campaigns array instead of non-existent campaignDatabase
    if (elements.select && campaignId) {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (campaign) {
            updateCampaignUI(campaign);
        }
    }
}

function updateCampaignUI(campaign) {
    if (!campaign) return;

    // Get all possible elements
    const elements = {
        name: document.getElementById('campaign-name'),
        desc: document.getElementById('campaign-description'),
        date: document.getElementById('campaign-date'),
        worldLore: document.getElementById('pre-world-lore'),
        npcs: document.getElementById('pre-key-npcs'),
        hiddenTruths: document.getElementById('pre-hidden-truths')
    };

    // Update each element if it exists
    if (elements.name) elements.name.textContent = campaign.name || 'Untitled Campaign';
    if (elements.desc) elements.desc.textContent = campaign.description || 'No description available';
    if (elements.date) elements.date.textContent = campaign.date || 'Date not set';
    if (elements.worldLore) elements.worldLore.textContent = campaign.pre?.worldLore || '';
    if (elements.npcs && campaign.pre?.keyNPCs) {
        updateNPCsList(elements.npcs, campaign.pre.keyNPCs);
    }
    if (elements.hiddenTruths) elements.hiddenTruths.textContent = campaign.pre?.hiddenTruths || '';
}

// Ensure DOM is loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
    // Initialize campaign data
    loadCampaignData();
});