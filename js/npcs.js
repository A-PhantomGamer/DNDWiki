document.addEventListener('DOMContentLoaded', function() {
    // Empty sample NPC data
    const sampleNPCs = [];

    // Load NPCs from localStorage or use empty array
    let npcs = JSON.parse(localStorage.getItem('npcs')) || sampleNPCs;
    
    // Load locations from localStorage or initialize empty array
    let locations = JSON.parse(localStorage.getItem('locations')) || [];
    
    // Load campaigns from shared system
    let campaigns = SharedCampaigns.getAllCampaigns();
    
    // Extract unique locations from NPCs if array is empty
    if (locations.length === 0) {
        locations = [...new Set(npcs.map(npc => npc.location).filter(Boolean))];
        localStorage.setItem('locations', JSON.stringify(locations));
    }
    
    // Current filters and search term
    let currentFilters = {
        location: 'all',
        campaign: 'all',
        type: 'all'
    };
    let searchTerm = '';
    
    // Add a function to clear all data
    function clearAllData() {
        if (confirm('Are you sure you want to delete ALL NPCs? This cannot be undone.')) {
            // Clear the arrays
            npcs = [];
            locations = [];
            campaigns = [];
            
            // Clear localStorage
            localStorage.removeItem('npcs');
            localStorage.removeItem('locations');
            localStorage.removeItem('campaigns');
            
            // Refresh the page
            populateFilters();
            populateFormDropdowns();
            renderNPCs();
            
            alert('All NPC data has been cleared.');
        }
    }
    
    // Add a clear data button to the HTML
    const filterControls = document.querySelector('.filter-controls');
    const clearDataBtn = document.createElement('button');
    clearDataBtn.id = 'clear-data-btn';
    clearDataBtn.textContent = 'Clear All Data';
    clearDataBtn.className = 'danger-btn';
    clearDataBtn.addEventListener('click', clearAllData);
    filterControls.appendChild(clearDataBtn);
    
    // Add CSS for the danger button
    const style = document.createElement('style');
    style.textContent = `
        .danger-btn {
            background-color: #7c2020;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Roboto', sans-serif;
            font-weight: bold;
            margin-left: auto;
        }
        
        .danger-btn:hover {
            background-color: #5e1818;
        }
    `;
    document.head.appendChild(style);
    
    // Function to populate filter dropdowns
    function populateFilters() {
        const locationFilter = document.getElementById('location-filter');
        const campaignFilter = document.getElementById('campaign-filter');
        const typeFilter = document.getElementById('type-filter');
        
        // Populate location filter
        locationFilter.innerHTML = '<option value="all">All Locations</option>';
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
        
        // Populate campaign filter using shared campaigns
        campaignFilter.innerHTML = '<option value="all">All Campaigns</option>';
        
        // Get fresh campaigns list
        campaigns = SharedCampaigns.getAllCampaigns();
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign.name;
            option.textContent = campaign.name;
            campaignFilter.appendChild(option);
        });
        
        // Populate type filter (static options)
        typeFilter.innerHTML = `
            <option value="all">All Types</option>
            <option value="ally">Allies</option>
            <option value="neutral">Neutral</option>
            <option value="villain">Villains</option>
            <option value="merchant">Merchants</option>
            <option value="quest-giver">Quest Givers</option>
        `;
    }
    
    // Function to populate form dropdowns
    function populateFormDropdowns() {
        const locationSelect = document.getElementById('edit-npc-location');
        const campaignSelect = document.getElementById('edit-npc-campaign');
        
        // Save current selections
        const currentLocation = locationSelect.value;
        const currentCampaign = campaignSelect.value;
        
        // Clear and repopulate location dropdown
        locationSelect.innerHTML = '<option value="">-- Select Location --</option>';
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });
        
        // Clear and repopulate campaign dropdown using shared campaigns
        campaignSelect.innerHTML = '<option value="">-- Select Campaign --</option>';
        
        // Get fresh campaigns list
        campaigns = SharedCampaigns.getAllCampaigns();
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign.name;
            option.textContent = campaign.name;
            campaignSelect.appendChild(option);
        });
        
        // Restore selections if possible
        if (currentLocation && locations.includes(currentLocation)) {
            locationSelect.value = currentLocation;
        }
        
        if (currentCampaign && campaigns.some(c => c.name === currentCampaign)) {
            campaignSelect.value = currentCampaign;
        }
    }
    
    // Function to render NPCs with current filters
    function renderNPCs() {
        const container = document.getElementById('npcs-container');
        container.innerHTML = '';
        
        // Apply filters
        let filteredNPCs = npcs;
        
        if (currentFilters.location !== 'all') {
            filteredNPCs = filteredNPCs.filter(npc => npc.location === currentFilters.location);
        }
        
        if (currentFilters.campaign !== 'all') {
            filteredNPCs = filteredNPCs.filter(npc => npc.campaign === currentFilters.campaign);
        }
        
        if (currentFilters.type !== 'all') {
            filteredNPCs = filteredNPCs.filter(npc => npc.type === currentFilters.type);
        }
        
        // Apply search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredNPCs = filteredNPCs.filter(npc => 
                npc.name.toLowerCase().includes(term) ||
                (npc.description && npc.description.toLowerCase().includes(term)) ||
                (npc.race && npc.race.toLowerCase().includes(term)) ||
                (npc.occupation && npc.occupation.toLowerCase().includes(term))
            );
        }
        
        // Show message if no NPCs match filters
        if (filteredNPCs.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <p>No NPCs found matching your criteria.</p>
                <button id="reset-filters-btn">Reset Filters</button>
            `;
            container.appendChild(noResults);
            
            document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
            return;
        }
        
        // Render filtered NPCs
        filteredNPCs.forEach(npc => {
            const npcCard = document.createElement('div');
            npcCard.className = `npc-card ${npc.type}`;
            
            // Format type label
            let typeLabel = npc.type.replace('-', ' ');
            typeLabel = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);
            
            // Format status label
            let statusLabel = npc.status.charAt(0).toUpperCase() + npc.status.slice(1);
            
            npcCard.innerHTML = `
                <h3>${npc.name}</h3>
                
                <div class="npc-meta">
                    ${npc.location ? `<span class="location-tag">${npc.location}</span>` : ''}
                    ${npc.campaign ? `<span class="campaign-tag">${npc.campaign}</span>` : ''}
                    <span class="type-tag ${npc.type}">${typeLabel}</span>
                    <span class="status-tag ${npc.status}">${statusLabel}</span>
                </div>
                
                <div class="npc-basics">
                    ${npc.race ? `<p><strong>Race:</strong> ${npc.race}</p>` : ''}
                    ${npc.occupation ? `<p><strong>Occupation:</strong> ${npc.occupation}</p>` : ''}
                </div>
                
                ${npc.description ? `<div class="npc-description">${npc.description}</div>` : ''}
                
                <div class="npc-details">
                    ${npc.appearance ? `
                        <h4>Appearance</h4>
                        <p>${npc.appearance}</p>
                    ` : ''}
                    
                    ${npc.personality ? `
                        <h4>Personality</h4>
                        <p>${npc.personality}</p>
                    ` : ''}
                    
                    ${npc.motivation ? `
                        <h4>Motivation</h4>
                        <p>${npc.motivation}</p>
                    ` : ''}
                    
                    ${npc.notes ? `
                        <h4>Notes</h4>
                        <p>${npc.notes}</p>
                    ` : ''}
                </div>
                
                <div class="npc-actions">
                    <button class="edit-btn" data-id="${npc.id}">Edit</button>
                    <button class="delete-btn" data-id="${npc.id}">Delete</button>
                </div>
            `;
            
            container.appendChild(npcCard);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editNPC);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteNPC);
        });
    }
    
    // Function to reset filters
    function resetFilters() {
        document.getElementById('location-filter').value = 'all';
        document.getElementById('campaign-filter').value = 'all';
        document.getElementById('type-filter').value = 'all';
        document.getElementById('npc-search').value = '';
        
        currentFilters = {
            location: 'all',
            campaign: 'all',
            type: 'all'
        };
        searchTerm = '';
        
        renderNPCs();
    }
    
    // Function to apply filters
    function applyFilters() {
        currentFilters.location = document.getElementById('location-filter').value;
        currentFilters.campaign = document.getElementById('campaign-filter').value;
        currentFilters.type = document.getElementById('type-filter').value;
        
        renderNPCs();
    }
    
    // Function to apply search
    function applySearch() {
        searchTerm = document.getElementById('npc-search').value.trim();
        renderNPCs();
    }
    
    // Function to open the edit modal for a new NPC
    function addNewNPC() {
        // Clear the form
        document.getElementById('edit-npc-form').reset();
        document.getElementById('edit-npc-id').value = '';
        
        // Set default values
        document.getElementById('edit-npc-type').value = 'neutral';
        document.getElementById('edit-npc-status').value = 'alive';
        
        // Show the modal
        document.getElementById('edit-npc-modal').style.display = 'block';
    }
    
    // Function to open the edit modal for an existing NPC
    function editNPC(e) {
        const npcId = parseInt(e.target.dataset.id);
        const npc = npcs.find(n => n.id === npcId);
        
        if (!npc) return;
        
        // Fill the form with NPC data
        document.getElementById('edit-npc-id').value = npc.id;
        document.getElementById('edit-npc-name').value = npc.name || '';
        document.getElementById('edit-npc-race').value = npc.race || '';
        document.getElementById('edit-npc-occupation').value = npc.occupation || '';
        document.getElementById('edit-npc-location').value = npc.location || '';
        document.getElementById('edit-npc-campaign').value = npc.campaign || '';
        document.getElementById('edit-npc-type').value = npc.type || 'neutral';
        document.getElementById('edit-npc-status').value = npc.status || 'alive';
        document.getElementById('edit-npc-description').value = npc.description || '';
        document.getElementById('edit-npc-appearance').value = npc.appearance || '';
        document.getElementById('edit-npc-personality').value = npc.personality || '';
        document.getElementById('edit-npc-motivation').value = npc.motivation || '';
        document.getElementById('edit-npc-notes').value = npc.notes || '';
        
        // Show the modal
        document.getElementById('edit-npc-modal').style.display = 'block';
    }
    
    // Function to save NPC data from the form
    function saveNPC(e) {
        e.preventDefault();
        
        const npcId = document.getElementById('edit-npc-id').value;
        const name = document.getElementById('edit-npc-name').value.trim();
        const race = document.getElementById('edit-npc-race').value.trim();
        const occupation = document.getElementById('edit-npc-occupation').value.trim();
        const location = document.getElementById('edit-npc-location').value.trim();
        const campaign = document.getElementById('edit-npc-campaign').value.trim();
        const type = document.getElementById('edit-npc-type').value;
        const status = document.getElementById('edit-npc-status').value;
        const description = document.getElementById('edit-npc-description').value.trim();
        const appearance = document.getElementById('edit-npc-appearance').value.trim();
        const personality = document.getElementById('edit-npc-personality').value.trim();
        const motivation = document.getElementById('edit-npc-motivation').value.trim();
        const notes = document.getElementById('edit-npc-notes').value.trim();
        
        // Validate required fields
        if (!name) {
            alert('Name is required');
            return;
        }
        
        // Create NPC object
        const npc = {
            name,
            race,
            occupation,
            location,
            campaign,
            type,
            status,
            description,
            appearance,
            personality,
            motivation,
            notes
        };
        
        // Update existing NPC or add new one
        if (npcId) {
            npc.id = parseInt(npcId);
            const index = npcs.findIndex(n => n.id === npc.id);
            if (index !== -1) {
                npcs[index] = npc;
            }
        } else {
            npc.id = Date.now(); // Use timestamp as a simple unique ID
            npcs.push(npc);
        }
        
        // Save to localStorage
        localStorage.setItem('npcs', JSON.stringify(npcs));
        
        // Update locations if needed
        if (location && !locations.includes(location)) {
            locations.push(location);
            localStorage.setItem('locations', JSON.stringify(locations));
        }
        
        // Close the modal and refresh the display
        document.getElementById('edit-npc-modal').style.display = 'none';
        populateFilters();
        renderNPCs();
    }
    
    // Function to delete an NPC
    function deleteNPC(e) {
        const npcId = parseInt(e.target.dataset.id);
        
        if (confirm('Are you sure you want to delete this NPC?')) {
            npcs = npcs.filter(npc => npc.id !== npcId);
            localStorage.setItem('npcs', JSON.stringify(npcs));
            renderNPCs();
        }
    }
    
    // Function to add a new location
    function addNewLocation() {
        const newLocationForm = document.getElementById('new-location-form');
        newLocationForm.style.display = 'block';
        document.getElementById('new-location-input').focus();
    }
    
    // Function to confirm adding a new location
    function confirmNewLocation() {
        const newLocationInput = document.getElementById('new-location-input');
        const newLocation = newLocationInput.value.trim();
        
        if (!newLocation) return;
        
        // Add to locations array if not already present
        if (!locations.includes(newLocation)) {
            locations.push(newLocation);
            localStorage.setItem('locations', JSON.stringify(locations));
            
            // Add new option to select
            const locationSelect = document.getElementById('edit-npc-location');
            const newOption = document.createElement('option');
            newOption.value = newLocation;
            newOption.textContent = newLocation;
            locationSelect.appendChild(newOption);
            
            // Select the new option
            locationSelect.value = newLocation;
        }
        
        // Clear the input and hide the form
        newLocationInput.value = '';
        document.getElementById('new-location-form').style.display = 'none';
    }
    
    // Function to add a new campaign
    function addNewCampaign() {
        const newCampaignForm = document.getElementById('new-campaign-form');
        newCampaignForm.style.display = 'block';
        document.getElementById('new-campaign-input').focus();
    }
    
    // Function to confirm adding a new campaign
    function confirmNewCampaign() {
        const newCampaignInput = document.getElementById('new-campaign-input');
        const newCampaign = newCampaignInput.value.trim();
        
        if (!newCampaign) return;
        
        // Add to campaigns array if not already present
        if (!campaigns.includes(newCampaign)) {
            campaigns.push(newCampaign);
            localStorage.setItem('campaigns', JSON.stringify(campaigns));
            
            // Add new option to select
            const campaignSelect = document.getElementById('edit-npc-campaign');
            const newOption = document.createElement('option');
            newOption.value = newCampaign;
            newOption.textContent = newCampaign;
            campaignSelect.appendChild(newOption);
            
            // Select the new option
            campaignSelect.value = newCampaign;
        }
        
        // Clear the input and hide the form
        newCampaignInput.value = '';
        document.getElementById('new-campaign-form').style.display = 'none';
    }
    
    // Add event listeners
    document.getElementById('location-filter').addEventListener('change', applyFilters);
    document.getElementById('campaign-filter').addEventListener('change', applyFilters);
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
    
    document.getElementById('search-btn').addEventListener('click', applySearch);
    document.getElementById('npc-search').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applySearch();
        }
    });
    
    document.getElementById('add-npc-btn').addEventListener('click', addNewNPC);
    document.getElementById('edit-npc-form').addEventListener('submit', saveNPC);
    
    document.getElementById('add-location-btn').addEventListener('click', addNewLocation);
    document.getElementById('confirm-location-btn').addEventListener('click', confirmNewLocation);
    document.getElementById('cancel-location-btn').addEventListener('click', function() {
        document.getElementById('new-location-input').value = '';
        document.getElementById('new-location-form').style.display = 'none';
    });
    
    document.getElementById('add-campaign-btn').addEventListener('click', addNewCampaign);
    document.getElementById('confirm-campaign-btn').addEventListener('click', confirmNewCampaign);
    document.getElementById('cancel-campaign-btn').addEventListener('click', function() {
        document.getElementById('new-campaign-input').value = '';
        document.getElementById('new-campaign-form').style.display = 'none';
    });
    
    // Close the modal when clicking the close button or outside the modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('edit-npc-modal').style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('edit-npc-modal')) {
            document.getElementById('edit-npc-modal').style.display = 'none';
        }
    });
    
    // Initialize the page
    populateFilters();
    populateFormDropdowns();
    renderNPCs();
});

