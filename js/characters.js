document.addEventListener('DOMContentLoaded', function() {
    // Sample character data with stats, player, and campaign info
    const sampleCharacters = [
        {
            id: 1,
            name: 'Thorin Oakenshield',
            race: 'Dwarf',
            class: 'Fighter',
            level: 5,
            background: 'Noble',
            alignment: 'Lawful Good',
            player: 'Mike',
            campaign: 'The Lost Mines',
            stats: {
                strength: 16,
                dexterity: 12,
                constitution: 18,
                intelligence: 10,
                wisdom: 14,
                charisma: 13
            },
            description: 'A stoic dwarf warrior seeking to reclaim his homeland.'
        },
        {
            id: 2,
            name: 'Elara Nightshade',
            race: 'Elf',
            class: 'Wizard',
            level: 4,
            background: 'Sage',
            alignment: 'Neutral Good',
            player: 'Sarah',
            campaign: 'Curse of Strahd',
            stats: {
                strength: 8,
                dexterity: 16,
                constitution: 12,
                intelligence: 18,
                wisdom: 14,
                charisma: 10
            },
            description: 'A curious elven mage with a thirst for ancient knowledge.'
        },
        {
            id: 3,
            name: 'Grimm Ironheart',
            race: 'Half-Orc',
            class: 'Barbarian',
            level: 3,
            background: 'Outlander',
            alignment: 'Chaotic Neutral',
            player: 'Mike',
            campaign: 'Storm King\'s Thunder',
            stats: {
                strength: 18,
                dexterity: 14,
                constitution: 16,
                intelligence: 8,
                wisdom: 12,
                charisma: 10
            },
            description: 'A fierce warrior with a troubled past and a mighty axe.'
        }
    ];

    // Load characters from localStorage or use sample data
    let characters = JSON.parse(localStorage.getItem('characters')) || sampleCharacters;
    
    // Load campaigns from shared system
    let campaigns = SharedCampaigns.getAllCampaigns();
    
    // Track current filters
    let currentFilters = {
        player: 'all',
        campaign: 'all'
    };

    // Function to populate filter dropdowns
    function populateFilters() {
        const playerFilter = document.getElementById('player-filter');
        const campaignFilter = document.getElementById('campaign-filter');
        
        // Get unique players
        const players = ['all', ...new Set(characters.map(char => char.player).filter(Boolean))];
        
        // Populate player filter
        playerFilter.innerHTML = '';
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player === 'all' ? 'All Players' : player;
            playerFilter.appendChild(option);
        });
        
        // Populate campaign filter using shared campaigns
        campaignFilter.innerHTML = '';
        
        // Add "All Campaigns" option
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All Campaigns';
        campaignFilter.appendChild(allOption);
        
        // Add all campaigns from shared system
        campaigns = SharedCampaigns.getAllCampaigns();
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign.name;
            option.textContent = campaign.name;
            campaignFilter.appendChild(option);
        });
        
        // Also populate the campaign dropdown in the edit form
        const editCampaignSelect = document.getElementById('edit-character-campaign');
        if (editCampaignSelect) {
            // Save current selection if any
            const currentSelection = editCampaignSelect.value;
            
            // Clear and repopulate
            editCampaignSelect.innerHTML = '';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '-- Select Campaign --';
            editCampaignSelect.appendChild(emptyOption);
            
            // Add all campaigns from shared system
            campaigns.forEach(campaign => {
                const option = document.createElement('option');
                option.value = campaign.name;
                option.textContent = campaign.name;
                editCampaignSelect.appendChild(option);
            });
            
            // Restore selection if possible
            if (currentSelection && campaigns.some(c => c.name === currentSelection)) {
                editCampaignSelect.value = currentSelection;
            }
        }
    }

    // Function to apply filters
    function applyFilters() {
        const playerFilter = document.getElementById('player-filter').value;
        const campaignFilter = document.getElementById('campaign-filter').value;
        
        currentFilters = {
            player: playerFilter,
            campaign: campaignFilter
        };
        
        renderCharacters();
    }

    // Function to render all characters with filters
    function renderCharacters() {
        const container = document.getElementById('characters-container');
        container.innerHTML = '';
        
        // Filter characters
        let filteredCharacters = characters;
        
        if (currentFilters.player !== 'all') {
            filteredCharacters = filteredCharacters.filter(char => 
                char.player === currentFilters.player);
        }
        
        if (currentFilters.campaign !== 'all') {
            filteredCharacters = filteredCharacters.filter(char => 
                char.campaign === currentFilters.campaign);
        }
        
        // Show message if no characters match filters
        if (filteredCharacters.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <p>No characters found matching the selected filters.</p>
                <button id="reset-filters-btn">Reset Filters</button>
            `;
            container.appendChild(noResults);
            
            document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
            return;
        }

        // Render filtered characters
        filteredCharacters.forEach(character => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';
            
            // Create stat blocks HTML
            let statsHTML = '';
            const stats = character.stats || {
                strength: 10, dexterity: 10, constitution: 10,
                intelligence: 10, wisdom: 10, charisma: 10
            };
            
            const statNames = {
                strength: 'STR', dexterity: 'DEX', constitution: 'CON',
                intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA'
            };
            
            for (const [key, label] of Object.entries(statNames)) {
                const value = stats[key];
                const mod = getModifier(value);
                statsHTML += `
                    <div class="stat-block">
                        <div class="stat-label">${label}</div>
                        <div class="stat-value">${value}</div>
                        <div class="stat-modifier">${formatModifier(mod)}</div>
                    </div>
                `;
            }
            
            characterCard.innerHTML = `
                <h3>${character.name}</h3>
                <div class="character-meta">
                    <span class="player-tag">Player: ${character.player || 'Unknown'}</span>
                    <span class="campaign-tag">Campaign: ${character.campaign || 'None'}</span>
                </div>
                <div class="character-basics">
                    <p><strong>Race:</strong> ${character.race}</p>
                    <p><strong>Class:</strong> ${character.class}</p>
                    <p><strong>Level:</strong> ${character.level}</p>
                </div>
                
                <div class="character-stats">
                    ${statsHTML}
                </div>
                
                <div class="character-details">
                    <p><strong>Background:</strong> ${character.background}</p>
                    <p><strong>Alignment:</strong> ${character.alignment}</p>
                </div>
                
                <div class="character-description">
                    <p>${character.description}</p>
                </div>
                
                <div class="character-actions">
                    <button class="edit-btn" data-id="${character.id}">Edit</button>
                    <button class="delete-btn" data-id="${character.id}">Delete</button>
                </div>
            `;
            container.appendChild(characterCard);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editCharacter);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteCharacter);
        });
    }

    // Function to reset filters
    function resetFilters() {
        document.getElementById('player-filter').value = 'all';
        document.getElementById('campaign-filter').value = 'all';
        currentFilters = {
            player: 'all',
            campaign: 'all'
        };
        renderCharacters();
    }

    // Calculate ability modifier
    function getModifier(stat) {
        return Math.floor((stat - 10) / 2);
    }

    // Format modifier for display (+2, -1, etc.)
    function formatModifier(mod) {
        return mod >= 0 ? `+${mod}` : `${mod}`;
    }

    // Function to add a new character
    function addCharacter() {
        // This would typically open a form modal
        alert('Add character functionality will be implemented here');
        // For now, we'll just add a placeholder character
        const newCharacter = {
            id: Date.now(), // Use timestamp as a simple unique ID
            name: 'New Character',
            race: 'Human',
            class: 'Fighter',
            level: 1,
            background: 'Soldier',
            alignment: 'Neutral',
            stats: {
                strength: 14,
                dexterity: 12,
                constitution: 13,
                intelligence: 10,
                wisdom: 11,
                charisma: 8
            },
            description: 'A new adventurer ready for action.'
        };
        
        characters.push(newCharacter);
        saveCharacters();
        renderCharacters();
    }

    // Function to edit a character
    function editCharacter(e) {
        const characterId = parseInt(e.target.dataset.id);
        const character = characters.find(char => char.id === characterId);
        
        if (!character) return;
        
        // Populate the edit form
        document.getElementById('edit-character-id').value = character.id;
        document.getElementById('edit-character-name').value = character.name;
        document.getElementById('edit-character-race').value = character.race;
        document.getElementById('edit-character-class').value = character.class;
        document.getElementById('edit-character-level').value = character.level;
        document.getElementById('edit-character-background').value = character.background;
        document.getElementById('edit-character-alignment').value = character.alignment;
        document.getElementById('edit-character-player').value = character.player || '';
        document.getElementById('edit-character-description').value = character.description;
        
        // Populate stats
        const stats = character.stats || {
            strength: 10, dexterity: 10, constitution: 10,
            intelligence: 10, wisdom: 10, charisma: 10
        };
        
        document.getElementById('edit-character-strength').value = stats.strength;
        document.getElementById('edit-character-dexterity').value = stats.dexterity;
        document.getElementById('edit-character-constitution').value = stats.constitution;
        document.getElementById('edit-character-intelligence').value = stats.intelligence;
        document.getElementById('edit-character-wisdom').value = stats.wisdom;
        document.getElementById('edit-character-charisma').value = stats.charisma;
        
        // Make sure campaign dropdown is populated before setting value
        populateFilters();
        
        // Set campaign value
        const campaignSelect = document.getElementById('edit-character-campaign');
        if (character.campaign) {
            // If the campaign exists in the dropdown, select it
            if ([...campaignSelect.options].some(opt => opt.value === character.campaign)) {
                campaignSelect.value = character.campaign;
            } else {
                // If not, add it as an option and select it
                const newOption = document.createElement('option');
                newOption.value = character.campaign;
                newOption.textContent = character.campaign;
                campaignSelect.appendChild(newOption);
                campaignSelect.value = character.campaign;
            }
        } else {
            campaignSelect.value = '';
        }
        
        // Show the modal
        document.getElementById('edit-character-modal').style.display = 'block';
    }
    
    // Function to save edited character
    function saveEditedCharacter(e) {
        e.preventDefault();
        
        const characterId = parseInt(document.getElementById('edit-character-id').value);
        const characterIndex = characters.findIndex(char => char.id === characterId);
        
        if (characterIndex === -1) return;
        
        // Update character with form values
        characters[characterIndex] = {
            id: characterId,
            name: document.getElementById('edit-character-name').value,
            race: document.getElementById('edit-character-race').value,
            class: document.getElementById('edit-character-class').value,
            level: parseInt(document.getElementById('edit-character-level').value),
            background: document.getElementById('edit-character-background').value,
            alignment: document.getElementById('edit-character-alignment').value,
            player: document.getElementById('edit-character-player').value,
            campaign: document.getElementById('edit-character-campaign').value,
            description: document.getElementById('edit-character-description').value,
            stats: {
                strength: parseInt(document.getElementById('edit-character-strength').value),
                dexterity: parseInt(document.getElementById('edit-character-dexterity').value),
                constitution: parseInt(document.getElementById('edit-character-constitution').value),
                intelligence: parseInt(document.getElementById('edit-character-intelligence').value),
                wisdom: parseInt(document.getElementById('edit-character-wisdom').value),
                charisma: parseInt(document.getElementById('edit-character-charisma').value)
            }
        };
        
        // Save and refresh
        saveCharacters();
        populateFilters(); // Refresh filters in case player or campaign changed
        renderCharacters();
        
        // Hide the modal
        document.getElementById('edit-character-modal').style.display = 'none';
    }
    
    // Function to delete a character
    function deleteCharacter(e) {
        const characterId = parseInt(e.target.dataset.id);
        if (confirm('Are you sure you want to delete this character?')) {
            characters = characters.filter(char => char.id !== characterId);
            saveCharacters();
            renderCharacters();
        }
    }

    // Function to save characters to localStorage
    function saveCharacters() {
        localStorage.setItem('characters', JSON.stringify(characters));
    }
    
    // Function to add a new campaign directly from the character edit form
    function addNewCampaign() {
        const newCampaignInput = document.getElementById('new-campaign-input');
        const campaignSelect = document.getElementById('edit-character-campaign');
        
        if (newCampaignInput.value.trim() === '') {
            alert('Please enter a campaign name');
            return;
        }
        
        const newCampaignName = newCampaignInput.value.trim();
        
        // Check if campaign already exists in shared system
        if (campaigns.some(c => c.name === newCampaignName)) {
            alert('This campaign already exists');
            return;
        }
        
        // Create new campaign object
        const newCampaign = {
            id: Date.now().toString(),
            name: newCampaignName,
            dm: '',
            status: 'active',
            startDate: new Date().toISOString().split('T')[0]
        };
        
        // Add to shared campaigns
        SharedCampaigns.addCampaign(newCampaign);
        
        // Refresh campaigns list
        campaigns = SharedCampaigns.getAllCampaigns();
        
        // Add new option to select
        const newOption = document.createElement('option');
        newOption.value = newCampaignName;
        newOption.textContent = newCampaignName;
        campaignSelect.appendChild(newOption);
        
        // Select the new option
        campaignSelect.value = newCampaignName;
        
        // Clear the input
        newCampaignInput.value = '';
        
        // Hide the new campaign form
        document.getElementById('new-campaign-form').style.display = 'none';
    }

    // Add event listener to the add character button
    document.getElementById('add-character-btn').addEventListener('click', addCharacter);

    // Add event listeners for filters
    document.getElementById('player-filter').addEventListener('change', applyFilters);
    document.getElementById('campaign-filter').addEventListener('change', applyFilters);
    document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);

    // Add event listener for the "Add New Campaign" button
    document.getElementById('add-campaign-btn').addEventListener('click', function() {
        document.getElementById('new-campaign-form').style.display = 'block';
    });
    
    // Add event listener for the "Cancel" button in the new campaign form
    document.getElementById('cancel-campaign-btn').addEventListener('click', function() {
        document.getElementById('new-campaign-form').style.display = 'none';
        document.getElementById('new-campaign-input').value = '';
    });
    
    // Add event listener for the "Add" button in the new campaign form
    document.getElementById('confirm-campaign-btn').addEventListener('click', addNewCampaign);
    
    // Close the modal when clicking the close button or outside the modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('edit-character-modal').style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('edit-character-modal')) {
            document.getElementById('edit-character-modal').style.display = 'none';
        }
    });
    
    // Add event listener to the edit form
    document.getElementById('edit-character-form').addEventListener('submit', saveEditedCharacter);

    // Initialize filters and render characters
    populateFilters();
    renderCharacters();
});
