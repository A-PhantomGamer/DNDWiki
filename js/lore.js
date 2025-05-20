document.addEventListener('DOMContentLoaded', function() {
    // Check if markdown.min.js is loaded
    if (typeof markdown === 'undefined') {
        console.error('Markdown library not loaded. Some formatting may not work.');
        // Create a simple fallback
        window.markdown = {
            toHTML: function(text) {
                return text.replace(/\n/g, '<br>');
            }
        };
    }
    
    // Load campaigns from shared system
    let campaigns = SharedCampaigns.getAllCampaigns();
    
    // Current campaign ID
    let currentCampaignId = null;
    
    // Function to populate campaign dropdown
    function populateCampaignDropdown() {
        const campaignSelect = document.getElementById('campaign-select');
        SharedCampaigns.populateDropdown(campaignSelect);
    }
    
    // Function to render campaign lore
    function renderCampaignLore(campaignId) {
        const container = document.getElementById('campaign-lore-container');
        
        // If no campaign is selected, show empty state
        if (!campaignId) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Select a campaign from the dropdown above or create a new one to begin.</p>
                </div>
            `;
            return;
        }
        
        // Find the selected campaign
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Campaign not found. Please select a different campaign.</p>
                </div>
            `;
            return;
        }
        
        // Clone the template
        const template = document.getElementById('campaign-lore-template');
        const loreContent = template.content.cloneNode(true);
        
        // Set campaign title
        loreContent.querySelector('.campaign-title').textContent = campaign.name;
        
        // Set content for each section
        if (campaign.overview) {
            loreContent.querySelector('.overview-content').innerHTML = markdown.toHTML(campaign.overview);
        }
        
        if (campaign.before) {
            loreContent.querySelector('.before-content').innerHTML = markdown.toHTML(campaign.before);
        }
        
        if (campaign.during) {
            loreContent.querySelector('.during-content').innerHTML = markdown.toHTML(campaign.during);
        }
        
        if (campaign.after) {
            loreContent.querySelector('.after-content').innerHTML = markdown.toHTML(campaign.after);
        }
        
        if (campaign.locations) {
            loreContent.querySelector('.locations-content').innerHTML = markdown.toHTML(campaign.locations);
        }
        
        if (campaign.events) {
            loreContent.querySelector('.events-content').innerHTML = markdown.toHTML(campaign.events);
        }
        
        // Clear container and append the new content
        container.innerHTML = '';
        container.appendChild(loreContent);
        
        // Add event listeners to buttons
        container.querySelector('.edit-campaign-btn').addEventListener('click', () => editCampaign(campaignId));
        container.querySelector('.delete-campaign-btn').addEventListener('click', () => deleteCampaign(campaignId));
        
        // Add event listeners to edit section buttons
        container.querySelectorAll('.edit-section-btn').forEach(btn => {
            btn.addEventListener('click', () => editSection(campaignId, btn.dataset.section));
        });
    }
    
    // Function to open the campaign modal for adding a new campaign
    function addCampaign() {
        document.getElementById('campaign-modal-title').textContent = 'Add New Campaign';
        document.getElementById('campaign-form').reset();
        document.getElementById('campaign-id').value = '';
        document.getElementById('campaign-modal').style.display = 'block';
    }
    
    // Function to open the campaign modal for editing an existing campaign
    function editCampaign(campaignId) {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) return;
        
        document.getElementById('campaign-modal-title').textContent = 'Edit Campaign';
        document.getElementById('campaign-id').value = campaign.id;
        document.getElementById('campaign-name').value = campaign.name;
        document.getElementById('campaign-modal').style.display = 'block';
    }
    
    // Function to save campaign data from the form
    function saveCampaign(e) {
        e.preventDefault();
        
        const campaignId = document.getElementById('campaign-id').value;
        const name = document.getElementById('campaign-name').value.trim();
        
        if (!name) {
            alert('Campaign name is required');
            return;
        }
        
        // Update existing campaign or add new one
        if (campaignId) {
            // Update existing campaign
            const campaign = campaigns.find(c => c.id === campaignId);
            if (campaign) {
                campaign.name = name;
                SharedCampaigns.updateCampaign(campaign);
            }
        } else {
            // Add new campaign
            const newCampaign = {
                id: Date.now().toString(), // Use timestamp as a simple unique ID
                name: name,
                overview: '',
                before: '',
                during: '',
                after: '',
                locations: '',
                events: ''
            };
            campaigns.push(newCampaign);
            currentCampaignId = newCampaign.id;
            
            // Add to shared system
            SharedCampaigns.addCampaign(newCampaign);
        }
        
        // Close the modal
        document.getElementById('campaign-modal').style.display = 'none';
        
        // Refresh the dropdown and display
        populateCampaignDropdown();
        
        // If this was a new campaign, select it in the dropdown
        if (currentCampaignId) {
            document.getElementById('campaign-select').value = currentCampaignId;
            renderCampaignLore(currentCampaignId);
            currentCampaignId = null; // Reset after use
        } else if (campaignId) {
            // If editing existing, re-render it
            renderCampaignLore(campaignId);
        }
    }
    
    // Function to delete a campaign
    function deleteCampaign(campaignId) {
        if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            return;
        }
        
        // Remove the campaign from the array
        campaigns = campaigns.filter(c => c.id !== campaignId);
        
        // Remove from shared system
        SharedCampaigns.deleteCampaign(campaignId);
        
        // Refresh the dropdown
        populateCampaignDropdown();
        
        // Show empty state
        document.getElementById('campaign-select').value = '';
        renderCampaignLore('');
    }
    
    // Function to edit a specific section of campaign lore
    function editSection(campaignId, sectionName) {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) return;
        
        // Set up the section modal
        const sectionTitles = {
            overview: 'World Overview',
            before: 'Before the Heroes',
            during: 'During the Adventure',
            after: 'After the Heroes',
            locations: 'Key Locations',
            events: 'Key Events'
        };
        
        document.getElementById('section-modal-title').textContent = `Edit ${sectionTitles[sectionName]}`;
        document.getElementById('section-id').value = sectionName;
        document.getElementById('section-content').value = campaign[sectionName] || '';
        
        // Show the modal
        document.getElementById('lore-section-modal').style.display = 'block';
        
        // Focus the textarea
        document.getElementById('section-content').focus();
        
        // Set up the form submission handler
        document.getElementById('lore-section-form').onsubmit = function(e) {
            e.preventDefault();
            
            const content = document.getElementById('section-content').value;
            const sectionId = document.getElementById('section-id').value;
            
            // Update the campaign
            const index = campaigns.findIndex(c => c.id === campaignId);
            if (index !== -1) {
                campaigns[index][sectionId] = content;
                
                // Save to localStorage
                localStorage.setItem('lore-campaigns', JSON.stringify(campaigns));
                
                // Re-render the campaign
                renderCampaignLore(campaignId);
            }
            
            // Close the modal
            document.getElementById('lore-section-modal').style.display = 'none';
        };
    }
    
    // Event listeners
    
    // Campaign dropdown change
    document.getElementById('campaign-select').addEventListener('change', function() {
        const campaignId = this.value;
        renderCampaignLore(campaignId);
    });
    
    // Add campaign button
    document.getElementById('add-campaign-btn').addEventListener('click', addCampaign);
    
    // Campaign form submission
    document.getElementById('campaign-form').addEventListener('submit', saveCampaign);
    
    // Close modals when clicking the close button
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('campaign-modal').style.display = 'none';
            document.getElementById('lore-section-modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('campaign-modal')) {
            document.getElementById('campaign-modal').style.display = 'none';
        }
        if (e.target === document.getElementById('lore-section-modal')) {
            document.getElementById('lore-section-modal').style.display = 'none';
        }
    });
    
    // Initialize the page
    populateCampaignDropdown();
    
    // If there's a campaign in the URL hash, load it
    const hashCampaignId = window.location.hash.substring(1);
    if (hashCampaignId && campaigns.some(c => c.id === hashCampaignId)) {
        document.getElementById('campaign-select').value = hashCampaignId;
        renderCampaignLore(hashCampaignId);
    } else {
        renderCampaignLore('');
    }
});

