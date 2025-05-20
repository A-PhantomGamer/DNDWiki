// Shared campaign management utility
const SharedCampaigns = {
    // Storage key for campaigns
    STORAGE_KEY: 'shared-campaigns',
    
    // Get all campaigns
    getAllCampaigns() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    },
    
    // Save campaigns
    saveCampaigns(campaigns) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(campaigns));
    },
    
    // Add a new campaign
    addCampaign(campaign) {
        const campaigns = this.getAllCampaigns();
        campaigns.push(campaign);
        this.saveCampaigns(campaigns);
    },
    
    // Update an existing campaign
    updateCampaign(updatedCampaign) {
        const campaigns = this.getAllCampaigns();
        const index = campaigns.findIndex(c => c.id === updatedCampaign.id);
        if (index !== -1) {
            campaigns[index] = updatedCampaign;
            this.saveCampaigns(campaigns);
            return true;
        }
        return false;
    },
    
    // Delete a campaign
    deleteCampaign(campaignId) {
        const campaigns = this.getAllCampaigns();
        const filteredCampaigns = campaigns.filter(c => c.id !== campaignId);
        if (filteredCampaigns.length < campaigns.length) {
            this.saveCampaigns(filteredCampaigns);
            return true;
        }
        return false;
    },
    
    // Populate a select dropdown with campaigns
    populateDropdown(selectElement, selectedId = null) {
        const campaigns = this.getAllCampaigns();
        
        // Clear existing options
        selectElement.innerHTML = '<option value="">-- Select Campaign --</option>';
        
        // Add campaign options
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign.id;
            option.textContent = campaign.name;
            selectElement.appendChild(option);
        });
        
        // Select the specified campaign if provided
        if (selectedId && campaigns.some(c => c.id === selectedId)) {
            selectElement.value = selectedId;
        }
    }
};