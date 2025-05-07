document.addEventListener('DOMContentLoaded', function() {
    initializeLore();
    setupEventListeners();
    updateCampaignSelector();
});

// Initialize lore data
function initializeLore() {
    const tabs = document.querySelectorAll('.tab-btn');
    const activeTab = localStorage.getItem('activeTab') || 'legends';
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    switchTab(activeTab);
    loadLoreContent(getCampaign());
}

// Setup event listeners
function setupEventListeners() {
    const campaignSelect = document.getElementById('campaign-filter');
    const addButtons = document.querySelectorAll('.add-entry-btn');

    if (campaignSelect) {
        campaignSelect.addEventListener('change', () => {
            loadLoreContent(campaignSelect.value);
        });
    }

    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.closest('.tab-content').id;
            openAddEntryModal(tabId);
        });
    });
}

// Update campaign selector with available campaigns
function updateCampaignSelector() {
    const campaigns = JSON.parse(localStorage.getItem('campaigns')) || [];
    const select = document.getElementById('campaign-filter');
    
    if (!select) return;

    select.innerHTML = '<option value="">Select Campaign</option>';
    campaigns.forEach(campaign => {
        select.innerHTML += `
            <option value="${campaign.id}">${campaign.name}</option>
        `;
    });
}

// Switch between tabs
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    contents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });

    localStorage.setItem('activeTab', tabId);
}

// Load lore content based on campaign
function loadLoreContent(campaignId) {
    if (!campaignId) return;

    const loreData = JSON.parse(localStorage.getItem('lore')) || {};
    const campaignLore = loreData[campaignId] || {
        legends: [],
        history: [],
        artifacts: [],
        religion: [],
        secrets: []
    };

    // Load legends
    const legendsContainer = document.getElementById('legends-container');
    if (legendsContainer) {
        legendsContainer.innerHTML = campaignLore.legends.map(legend => createLegendCard(legend)).join('');
    }

    // Load historical events
    const historyContainer = document.getElementById('history-container');
    if (historyContainer) {
        historyContainer.innerHTML = campaignLore.history.map(event => createHistoryCard(event)).join('');
    }

    // Load artifacts
    const artifactsContainer = document.getElementById('artifacts-container');
    if (artifactsContainer) {
        artifactsContainer.innerHTML = campaignLore.artifacts.map(artifact => createArtifactCard(artifact)).join('');
    }

    // Load religions
    const religionContainer = document.getElementById('religion-container');
    if (religionContainer) {
        religionContainer.innerHTML = campaignLore.religion.map(deity => createDeityCard(deity)).join('');
    }

    // Load DM secrets
    if (isAuthenticated) {
        const secretsContainer = document.getElementById('secrets-container');
        if (secretsContainer) {
            secretsContainer.innerHTML = campaignLore.secrets.map(secret => createSecretCard(secret)).join('');
        }
    }
}

// Card creation functions
function createLegendCard(legend) {
    return `
        <div class="lore-card" data-id="${legend.id}">
            <h4>${legend.title}</h4>
            <p>${legend.description}</p>
            ${isAuthenticated ? `
                <div class="card-actions">
                    <button onclick="editEntry('legends', '${legend.id}')">Edit</button>
                    <button onclick="deleteEntry('legends', '${legend.id}')">Delete</button>
                </div>
            ` : ''}
        </div>
    `;
}

function createHistoryCard(event) {
    return `
        <div class="timeline-entry" data-id="${event.id}">
            <div class="timeline-content">
                <span class="date">${event.date}</span>
                <h4>${event.title}</h4>
                <p>${event.description}</p>
                ${isAuthenticated ? `
                    <div class="entry-actions">
                        <button onclick="editEntry('history', '${event.id}')">Edit</button>
                        <button onclick="deleteEntry('history', '${event.id}')">Delete</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function createArtifactCard(artifact) {
    return `
        <div class="lore-card" data-id="${artifact.id}">
            <h4>${artifact.name}</h4>
            <p class="artifact-type">${artifact.type}</p>
            <p>${artifact.description}</p>
            ${isAuthenticated ? `
                <div class="card-actions">
                    <button onclick="editEntry('artifacts', '${artifact.id}')">Edit</button>
                    <button onclick="deleteEntry('artifacts', '${artifact.id}')">Delete</button>
                </div>
            ` : ''}
        </div>
    `;
}

function createDeityCard(deity) {
    return `
        <div class="lore-card" data-id="${deity.id}">
            <h4>${deity.name}</h4>
            <p class="deity-domain">${deity.domain}</p>
            <p>${deity.description}</p>
            ${isAuthenticated ? `
                <div class="card-actions">
                    <button onclick="editEntry('religion', '${deity.id}')">Edit</button>
                    <button onclick="deleteEntry('religion', '${deity.id}')">Delete</button>
                </div>
            ` : ''}
        </div>
    `;
}

function createSecretCard(secret) {
    return `
        <div class="lore-card secret" data-id="${secret.id}">
            <h4>${secret.title}</h4>
            <p>${secret.description}</p>
            <div class="card-actions">
                <button onclick="editEntry('secrets', '${secret.id}')">Edit</button>
                <button onclick="deleteEntry('secrets', '${secret.id}')">Delete</button>
            </div>
        </div>
    `;
}

// Utility functions
function getCampaign() {
    const select = document.getElementById('campaign-filter');
    return select ? select.value : null;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// CRUD Operations
function addEntry(type, data) {
    const campaignId = getCampaign();
    if (!campaignId) return;

    const loreData = JSON.parse(localStorage.getItem('lore')) || {};
    if (!loreData[campaignId]) {
        loreData[campaignId] = { legends: [], history: [], artifacts: [], religion: [], secrets: [] };
    }

    const entry = {
        id: generateId(),
        ...data,
        dateCreated: new Date().toISOString()
    };

    loreData[campaignId][type].push(entry);
    localStorage.setItem('lore', JSON.stringify(loreData));
    loadLoreContent(campaignId);
}

function editEntry(type, id) {
    // Implementation will be added for editing entries
}

function deleteEntry(type, id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const campaignId = getCampaign();
    if (!campaignId) return;

    const loreData = JSON.parse(localStorage.getItem('lore')) || {};
    if (!loreData[campaignId]) return;

    loreData[campaignId][type] = loreData[campaignId][type].filter(entry => entry.id !== id);
    localStorage.setItem('lore', JSON.stringify(loreData));
    loadLoreContent(campaignId);
}









