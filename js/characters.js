// Global variables
let currentCharacterData = null;
let cardToDelete = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing characters...');
    // Clear any existing static cards
    const charactersContainer = document.getElementById('characters-container');
    if (charactersContainer) {
        charactersContainer.innerHTML = '';
    }
    
    // Load characters from localStorage
    loadCharacters();
    
    // Set up event listeners
    setupEventListeners();
    
    updateCampaignSelectors();
});

// Load characters from localStorage and display them
function loadCharacters() {
    console.log('Loading characters...');
    
    const charactersContainer = document.getElementById('characters-container');
    if (!charactersContainer) {
        console.error('Characters container not found!');
        return;
    }
    
    // Clear existing cards
    charactersContainer.innerHTML = '';
    
    // Get characters from localStorage
    const characters = JSON.parse(localStorage.getItem('characters') || '[]');
    console.log('Found characters:', characters);
    
    if (characters.length === 0) {
        charactersContainer.innerHTML = `
            <div class="no-characters">
                <p>No characters found. Create or import a character to get started.</p>
            </div>
        `;
        return;
    }
    
    // Create cards for each character
    characters.forEach(character => {
        console.log('Creating card for character:', character);
        const card = createCharacterCard(character);
        charactersContainer.appendChild(card);
    });
}

// Add this after your loadCharacters() function to debug
function debugCharacters() {
    const characters = JSON.parse(localStorage.getItem('characters') || '[]');
    console.log('Characters in localStorage:', characters);
    
    const container = document.getElementById('characters-container');
    console.log('Container element:', container);
    
    // Add a test character if none exist
    if (characters.length === 0) {
        const testCharacter = {
            id: generateId(),
            name: 'Test Character',
            image: 'img/default-character.png'
        };
        addCharacter(testCharacter);
        console.log('Added test character');
        loadCharacters();
    }
}

// Create a character card element
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.id = character.id;
    card.dataset.campaign = character.campaign || 'Unassigned'; // Add campaign data attribute
    
    // Create card content with more detailed information
    card.innerHTML = `
        <div class="character-card-content">
            <div class="character-image">
                <img src="${character.image || './img/default-character.png'}" 
                     alt="${character.name}"
                     onerror="this.src='./img/default-character.png'">
            </div>
            <div class="character-info">
                <h3>${character.name}</h3>
                <p class="character-subtitle">${character.race} ${character.class}, Level ${character.level || 1}</p>
                <p class="character-campaign">Campaign: ${character.campaign || 'Unassigned'}</p>
            </div>
            <div class="character-actions">
                <button class="view-character">View</button>
                <button class="edit-character">Edit</button>
                <button class="delete-character">Delete</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.view-character').addEventListener('click', () => openCharacterSheet(character.id));
    card.querySelector('.edit-character').addEventListener('click', () => openCharacterSheet(character.id, true));
    card.querySelector('.delete-character').addEventListener('click', () => confirmDeleteCharacter(character.id));
    
    return card;
}

function openCharacterSheet(characterId, editMode = false) {
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    const character = characters.find(c => c.id === characterId);
    
    if (!character) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content character-sheet">
            <span class="close-modal">&times;</span>
            <h2>${editMode ? 'Edit' : 'View'} Character</h2>
            <div class="character-form">
                <div class="form-group">
                    <label for="char-name">Name:</label>
                    <input type="text" id="char-name" value="${character.name}" ${!editMode ? 'readonly' : ''}>
                </div>
                <div class="form-group">
                    <label for="char-race">Race:</label>
                    <input type="text" id="char-race" value="${character.race || ''}" ${!editMode ? 'readonly' : ''}>
                </div>
                <div class="form-group">
                    <label for="char-class">Class:</label>
                    <input type="text" id="char-class" value="${character.class || ''}" ${!editMode ? 'readonly' : ''}>
                </div>
                <div class="form-group">
                    <label for="char-level">Level:</label>
                    <input type="number" id="char-level" value="${character.level || 1}" ${!editMode ? 'readonly' : ''}>
                </div>
                <div class="form-group">
                    <label for="char-campaign">Campaign:</label>
                    <select id="char-campaign" ${!editMode ? 'disabled' : ''}>
                        <option value="">Select Campaign</option>
                    </select>
                </div>
                ${editMode ? `
                    <div class="form-actions">
                        <button class="save-changes">Save Changes</button>
                        <button class="cancel">Cancel</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    updateCampaignSelectors();
    
    if (editMode) {
        const saveBtn = modal.querySelector('.save-changes');
        saveBtn.addEventListener('click', () => saveCharacterChanges(character.id, modal));
    }

    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function saveCharacterChanges(characterId, modal) {
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    const characterIndex = characters.findIndex(c => c.id === characterId);
    
    if (characterIndex === -1) return;

    const updatedCharacter = {
        ...characters[characterIndex],
        name: modal.querySelector('#char-name').value,
        race: modal.querySelector('#char-race').value,
        class: modal.querySelector('#char-class').value,
        level: parseInt(modal.querySelector('#char-level').value),
        campaign: modal.querySelector('#char-campaign').value
    };

    characters[characterIndex] = updatedCharacter;
    localStorage.setItem('characters', JSON.stringify(characters));
    
    document.body.removeChild(modal);
    loadCharacters();
}

function confirmDeleteCharacter(characterId) {
    if (confirm('Are you sure you want to delete this character?')) {
        deleteCharacter(characterId);
    }
}

function deleteCharacter(characterId) {
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    const updatedCharacters = characters.filter(c => c.id !== characterId);
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
    loadCharacters();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const character = JSON.parse(e.target.result);
            addCharacter(character);
        } catch (error) {
            console.error('Error importing character:', error);
            alert('Invalid character file format');
        }
    };
    reader.readAsText(file);
}

function exportCharacter(characterId) {
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    const character = characters.find(c => c.id === characterId);
    
    if (!character) return;

    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', `${character.name}.json`);
    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);
}

function exportAllCharacters() {
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    const dataStr = JSON.stringify(characters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', 'all-characters.json');
    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);
}

function setupEventListeners() {
    // Character import/export buttons
    const importBtn = document.querySelector('.import-character-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = handleFileImport;
            input.click();
        });
    }

    // Campaign filter
    const campaignFilter = document.getElementById('campaign-filter');
    if (campaignFilter) {
        campaignFilter.addEventListener('change', filterCharacters);
    }

    // Search input
    const searchInput = document.getElementById('character-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterCharacters);
    }

    // Create character button
    const createBtn = document.querySelector('.create-character-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => openCharacterSheet(null, true));
    }
}

function updateCampaignSelectors() {
    const campaigns = JSON.parse(localStorage.getItem('campaigns')) || [];
    const selectors = document.querySelectorAll('#campaign-filter, #char-campaign, #character-campaign-select');
    
    selectors.forEach(select => {
        if (!select) return;

        // Keep existing first option
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);

        // Add campaign options
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign.id;
            option.textContent = campaign.name;
            select.appendChild(option);
        });
    });
}

function filterCharacters() {
    const campaignFilter = document.getElementById('campaign-filter');
    const searchInput = document.getElementById('character-search');
    const selectedCampaign = campaignFilter ? campaignFilter.value : 'all';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
        const campaignMatch = selectedCampaign === 'all' || 
                            card.dataset.campaign === selectedCampaign;
        const searchMatch = !searchTerm || 
                          card.textContent.toLowerCase().includes(searchTerm);
        
        card.style.display = campaignMatch && searchMatch ? 'block' : 'none';
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function addCharacter(characterData) {
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    const newCharacter = {
        id: generateId(),
        ...characterData,
        dateCreated: new Date().toISOString()
    };
    
    characters.push(newCharacter);
    localStorage.setItem('characters', JSON.stringify(characters));
    loadCharacters();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCharacters();
    setupEventListeners();
    updateCampaignSelectors();
});
