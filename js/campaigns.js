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
    
    // Load sessions from localStorage or initialize empty array
    let sessions = JSON.parse(localStorage.getItem('campaign-sessions')) || [];
    
    // Load quests from localStorage or initialize empty array
    let quests = JSON.parse(localStorage.getItem('campaign-quests')) || [];
    
    // Current campaign ID
    let currentCampaignId = null;
    
    // Function to populate campaign dropdown
    function populateCampaignDropdown() {
        const campaignSelect = document.getElementById('campaign-select');
        SharedCampaigns.populateDropdown(campaignSelect);
    }
    
    // Function to render campaign details
    function renderCampaign(campaignId) {
        const container = document.getElementById('campaign-container');
        
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
        const template = document.getElementById('campaign-template');
        const campaignContent = template.content.cloneNode(true);
        
        // Set campaign title
        campaignContent.querySelector('.campaign-title').textContent = campaign.name;
        
        // Set campaign metadata
        campaignContent.querySelector('.dm-name').textContent = campaign.dm || 'Not specified';
        
        // Format status text
        let statusText = 'Unknown';
        let statusClass = '';
        
        switch(campaign.status) {
            case 'planning':
                statusText = 'Planning';
                statusClass = 'status-planning';
                break;
            case 'active':
                statusText = 'Active';
                statusClass = 'status-active';
                break;
            case 'hiatus':
                statusText = 'On Hiatus';
                statusClass = 'status-hiatus';
                break;
            case 'completed':
                statusText = 'Completed';
                statusClass = 'status-completed';
                break;
            case 'abandoned':
                statusText = 'Abandoned';
                statusClass = 'status-abandoned';
                break;
        }
        
        const statusElement = campaignContent.querySelector('.campaign-status');
        statusElement.textContent = statusText;
        if (statusClass) {
            statusElement.classList.add(statusClass);
        }
        
        // Set start date
        const startDate = campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Not set';
        campaignContent.querySelector('.start-date').textContent = startDate;
        
        // Count sessions for this campaign
        const campaignSessions = sessions.filter(s => s.campaignId === campaignId);
        campaignContent.querySelector('.session-count').textContent = campaignSessions.length;
        
        // Set content for each section
        if (campaign.summary) {
            campaignContent.querySelector('.summary-content').innerHTML = markdown.toHTML(campaign.summary);
        } else {
            campaignContent.querySelector('.summary-content').innerHTML = '<p class="empty-content">No summary has been added yet.</p>';
        }
        
        if (campaign.setting) {
            campaignContent.querySelector('.setting-content').innerHTML = markdown.toHTML(campaign.setting);
        } else {
            campaignContent.querySelector('.setting-content').innerHTML = '<p class="empty-content">No setting information has been added yet.</p>';
        }
        
        if (campaign.plot) {
            campaignContent.querySelector('.plot-content').innerHTML = markdown.toHTML(campaign.plot);
        } else {
            campaignContent.querySelector('.plot-content').innerHTML = '<p class="empty-content">No plot information has been added yet.</p>';
        }
        
        if (campaign.notes) {
            campaignContent.querySelector('.notes-content').innerHTML = markdown.toHTML(campaign.notes);
        } else {
            campaignContent.querySelector('.notes-content').innerHTML = '<p class="empty-content">No DM notes have been added yet.</p>';
        }
        
        // Render sessions
        const sessionsList = campaignContent.querySelector('.sessions-list');
        sessionsList.innerHTML = '';
        
        if (campaignSessions.length === 0) {
            sessionsList.innerHTML = '<p class="empty-content">No sessions have been recorded yet.</p>';
        } else {
            // Sort sessions by number
            campaignSessions.sort((a, b) => a.number - b.number);
            
            campaignSessions.forEach(session => {
                const sessionCard = document.createElement('div');
                sessionCard.className = 'session-card';
                
                const sessionDate = session.date ? new Date(session.date).toLocaleDateString() : 'Unknown date';
                
                sessionCard.innerHTML = `
                    <div class="session-header">
                        <span class="session-number">Session ${session.number}</span>
                        <h4 class="session-title">${session.title}</h4>
                        <span class="session-date">${sessionDate}</span>
                    </div>
                    <div class="session-content">
                        ${markdown.toHTML(session.summary)}
                    </div>
                    <div class="session-actions">
                        <button class="edit-session-btn" data-id="${session.id}">Edit</button>
                        <button class="delete-session-btn" data-id="${session.id}">Delete</button>
                    </div>
                `;
                
                sessionsList.appendChild(sessionCard);
            });
        }
        
        // Render quests
        const questsList = campaignContent.querySelector('.quests-list');
        questsList.innerHTML = '';
        
        // Filter active quests for this campaign
        const campaignQuests = quests.filter(q => q.campaignId === campaignId);
        
        if (campaignQuests.length === 0) {
            questsList.innerHTML = '<p class="empty-content">No quests have been added yet.</p>';
        } else {
            // Sort quests by status (active first)
            campaignQuests.sort((a, b) => {
                if (a.status === 'active' && b.status !== 'active') return -1;
                if (a.status !== 'active' && b.status === 'active') return 1;
                return 0;
            });
            
            campaignQuests.forEach(quest => {
                const questCard = document.createElement('div');
                questCard.className = 'quest-card';
                
                let statusClass = '';
                switch(quest.status) {
                    case 'active': statusClass = 'status-active'; break;
                    case 'completed': statusClass = 'status-completed'; break;
                    case 'failed': statusClass = 'status-failed'; break;
                    case 'abandoned': statusClass = 'status-abandoned'; break;
                }
                
                questCard.innerHTML = `
                    <div class="quest-header">
                        <h4 class="quest-title">${quest.title}</h4>
                        <span class="quest-status ${statusClass}">${quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}</span>
                    </div>
                    <div class="quest-content">
                        ${quest.giver ? `<div class="quest-giver">Given by: ${quest.giver}</div>` : ''}
                        ${markdown.toHTML(quest.description)}
                        ${quest.reward ? `<div class="quest-reward">Reward: ${quest.reward}</div>` : ''}
                    </div>
                    <div class="quest-actions">
                        <button class="edit-quest-btn" data-id="${quest.id}">Edit</button>
                        <button class="delete-quest-btn" data-id="${quest.id}">Delete</button>
                    </div>
                `;
                
                questsList.appendChild(questCard);
            });
        }
        
        // Clear container and append the new content
        container.innerHTML = '';
        container.appendChild(campaignContent);
        
        // Add event listeners to buttons
        container.querySelector('.edit-campaign-btn').addEventListener('click', () => editCampaign(campaignId));
        container.querySelector('.delete-campaign-btn').addEventListener('click', () => deleteCampaign(campaignId));
        
        // Add event listeners to edit section buttons
        container.querySelectorAll('.edit-section-btn').forEach(btn => {
            btn.addEventListener('click', () => editSection(campaignId, btn.dataset.section));
        });
        
        // Add event listener to add session button
        container.querySelector('.add-session-btn').addEventListener('click', () => addSession(campaignId));
        
        // Add event listener to add quest button
        container.querySelector('.add-quest-btn').addEventListener('click', () => addQuest(campaignId));
        
        // Add event listeners to edit/delete session buttons
        container.querySelectorAll('.edit-session-btn').forEach(btn => {
            btn.addEventListener('click', () => editSession(btn.dataset.id));
        });
        
        container.querySelectorAll('.delete-session-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteSession(btn.dataset.id));
        });
        
        // Add event listeners to edit/delete quest buttons
        container.querySelectorAll('.edit-quest-btn').forEach(btn => {
            btn.addEventListener('click', () => editQuest(btn.dataset.id));
        });
        
        container.querySelectorAll('.delete-quest-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteQuest(btn.dataset.id));
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
        document.getElementById('campaign-dm').value = campaign.dm || '';
        document.getElementById('campaign-status').value = campaign.status || 'active';
        document.getElementById('campaign-start-date').value = campaign.startDate || '';
        
        document.getElementById('campaign-modal').style.display = 'block';
    }
    
    // Function to save campaign data from the form
    function saveCampaign(e) {
        e.preventDefault();
        
        const campaignId = document.getElementById('campaign-id').value;
        const name = document.getElementById('campaign-name').value.trim();
        const dm = document.getElementById('campaign-dm').value.trim();
        const status = document.getElementById('campaign-status').value;
        const startDate = document.getElementById('campaign-start-date').value;
        
        if (!name) {
            alert('Campaign name is required');
            return;
        }
        
        // Update existing campaign or add new one
        if (campaignId) {
            // Update existing campaign
            const index = campaigns.findIndex(c => c.id === campaignId);
            if (index !== -1) {
                campaigns[index].name = name;
                campaigns[index].dm = dm;
                campaigns[index].status = status;
                campaigns[index].startDate = startDate;
                
                // Update in shared system
                SharedCampaigns.updateCampaign(campaigns[index]);
            }
        } else {
            // Add new campaign
            const newCampaign = {
                id: Date.now().toString(), // Use timestamp as a simple unique ID
                name: name,
                dm: dm,
                status: status,
                startDate: startDate,
                summary: '',
                setting: '',
                plot: '',
                notes: ''
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
            renderCampaign(currentCampaignId);
            currentCampaignId = null; // Reset after use
        } else if (campaignId) {
            // If editing existing, re-render it
            renderCampaign(campaignId);
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
        
        // Remove associated sessions and quests
        sessions = sessions.filter(s => s.campaignId !== campaignId);
        quests = quests.filter(q => q.campaignId !== campaignId);
        
        // Save to localStorage
        localStorage.setItem('campaign-sessions', JSON.stringify(sessions));
        localStorage.setItem('campaign-quests', JSON.stringify(quests));
        
        // Refresh the dropdown
        populateCampaignDropdown();
        
        // Show empty state
        document.getElementById('campaign-select').value = '';
        renderCampaign('');
    }
    
    // Function to edit a specific section of campaign
    function editSection(campaignId, sectionName) {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) return;
        
        // Set up the section modal
        const sectionTitles = {
            summary: 'Campaign Summary',
            setting: 'Setting',
            plot: 'Main Plot',
            notes: 'DM Notes'
        };
        
        document.getElementById('section-modal-title').textContent = `Edit ${sectionTitles[sectionName]}`;
        document.getElementById('section-id').value = sectionName;
        document.getElementById('section-content').value = campaign[sectionName] || '';
        
        // Show the modal
        document.getElementById('section-modal').style.display = 'block';
        
        // Focus the textarea
        document.getElementById('section-content').focus();
        
        // Set up the form submission handler
        document.getElementById('section-form').onsubmit = function(e) {
            e.preventDefault();
            
            const content = document.getElementById('section-content').value;
            const sectionId = document.getElementById('section-id').value;
            
            // Update the campaign
            const index = campaigns.findIndex(c => c.id === campaignId);
            if (index !== -1) {
                campaigns[index][sectionId] = content;
                
                // Save to localStorage
                localStorage.setItem('campaigns', JSON.stringify(campaigns));
                
                // Re-render the campaign
                renderCampaign(campaignId);
            }
            
            // Close the modal
            document.getElementById('section-modal').style.display = 'none';
        };
    }
    
    // Function to add a new session
    function addSession(campaignId) {
        // Reset the form
        document.getElementById('session-form').reset();
        document.getElementById('session-id').value = '';
        document.getElementById('session-campaign-id').value = campaignId;
        
        // Set default values
        const campaignSessions = sessions.filter(s => s.campaignId === campaignId);
        const nextSessionNumber = campaignSessions.length > 0 
            ? Math.max(...campaignSessions.map(s => s.number)) + 1 
            : 1;
        
        document.getElementById('session-number').value = nextSessionNumber;
        document.getElementById('session-date').value = new Date().toISOString().split('T')[0]; // Today's date
        
        // Show the modal
        document.getElementById('session-modal-title').textContent = 'Add Session';
        document.getElementById('session-modal').style.display = 'block';
    }
    
    // Function to edit an existing session
    function editSession(sessionId) {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;
        
        document.getElementById('session-modal-title').textContent = 'Edit Session';
        document.getElementById('session-id').value = session.id;
        document.getElementById('session-campaign-id').value = session.campaignId;
        document.getElementById('session-number').value = session.number;
        document.getElementById('session-title').value = session.title;
        document.getElementById('session-summary').value = session.summary;
        
        if (session.date) {
            document.getElementById('session-date').value = session.date;
        }
        
        document.getElementById('session-modal').style.display = 'block';
    }
    
    // Function to save session data
    function saveSession(e) {
        e.preventDefault();
        
        const sessionId = document.getElementById('session-id').value;
        const campaignId = document.getElementById('session-campaign-id').value;
        const number = parseInt(document.getElementById('session-number').value);
        const title = document.getElementById('session-title').value.trim();
        const date = document.getElementById('session-date').value;
        const summary = document.getElementById('session-summary').value.trim();
        
        if (!title || !summary) {
            alert('Title and summary are required');
            return;
        }
        
        // Update existing session or add new one
        if (sessionId) {
            // Update existing session
            const index = sessions.findIndex(s => s.id === sessionId);
            if (index !== -1) {
                sessions[index].number = number;
                sessions[index].title = title;
                sessions[index].date = date;
                sessions[index].summary = summary;
            }
        } else {
            // Add new session
            const newSession = {
                id: Date.now().toString(), // Use timestamp as a simple unique ID
                campaignId: campaignId,
                number: number,
                title: title,
                date: date,
                summary: summary
            };
            sessions.push(newSession);
        }
        
        // Save to localStorage
        localStorage.setItem('campaign-sessions', JSON.stringify(sessions));
        
        // Close the modal
        document.getElementById('session-modal').style.display = 'none';
        
        // Re-render the campaign
        renderCampaign(campaignId);
    }
    
    // Function to delete a session
    function deleteSession(sessionId) {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;
        
        if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            return;
        }
        
        // Remove the session
        sessions = sessions.filter(s => s.id !== sessionId);
        
        // Save to localStorage
        localStorage.setItem('campaign-sessions', JSON.stringify(sessions));
        
        // Re-render the campaign
        renderCampaign(session.campaignId);
    }
    
    // Function to add a new quest
    function addQuest(campaignId) {
        // Reset the form
        document.getElementById('quest-form').reset();
        document.getElementById('quest-id').value = '';
        document.getElementById('quest-campaign-id').value = campaignId;
        
        // Set default values
        document.getElementById('quest-status').value = 'active';
        
        // Show the modal
        document.getElementById('quest-modal-title').textContent = 'Add Quest';
        document.getElementById('quest-modal').style.display = 'block';
    }
    
    // Function to edit an existing quest
    function editQuest(questId) {
        const quest = quests.find(q => q.id === questId);
        if (!quest) return;
        
        document.getElementById('quest-modal-title').textContent = 'Edit Quest';
        document.getElementById('quest-id').value = quest.id;
        document.getElementById('quest-campaign-id').value = quest.campaignId;
        document.getElementById('quest-title').value = quest.title;
        document.getElementById('quest-giver').value = quest.giver || '';
        document.getElementById('quest-status').value = quest.status;
        document.getElementById('quest-description').value = quest.description;
        document.getElementById('quest-reward').value = quest.reward || '';
        
        document.getElementById('quest-modal').style.display = 'block';
    }
    
    // Function to save quest data
    function saveQuest(e) {
        e.preventDefault();
        
        const questId = document.getElementById('quest-id').value;
        const campaignId = document.getElementById('quest-campaign-id').value;
        const title = document.getElementById('quest-title').value.trim();
        const giver = document.getElementById('quest-giver').value.trim();
        const status = document.getElementById('quest-status').value;
        const description = document.getElementById('quest-description').value.trim();
        const reward = document.getElementById('quest-reward').value.trim();
        
        if (!title || !description) {
            alert('Title and description are required');
            return;
        }
        
        // Update existing quest or add new one
        if (questId) {
            // Update existing quest
            const index = quests.findIndex(q => q.id === questId);
            if (index !== -1) {
                quests[index].title = title;
                quests[index].giver = giver;
                quests[index].status = status;
                quests[index].description = description;
                quests[index].reward = reward;
            }
        } else {
            // Add new quest
            const newQuest = {
                id: Date.now().toString(),
                campaignId: campaignId,
                title: title,
                giver: giver,
                status: status,
                description: description,
                reward: reward
            };
            quests.push(newQuest);
        }
        
        // Save to localStorage
        localStorage.setItem('campaign-quests', JSON.stringify(quests));
        
        // Close the modal
        document.getElementById('quest-modal').style.display = 'none';
        
        // Re-render the campaign
        renderCampaign(campaignId);
    }
    
    // Function to delete a quest
    function deleteQuest(questId) {
        const quest = quests.find(q => q.id === questId);
        if (!quest) return;
        
        if (!confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
            return;
        }
        
        // Remove the quest
        quests = quests.filter(q => q.id !== questId);
        
        // Save to localStorage
        localStorage.setItem('campaign-quests', JSON.stringify(quests));
        
        // Re-render the campaign
        renderCampaign(quest.campaignId);
    }
    
    // Event listeners
    
    // Campaign dropdown change
    document.getElementById('campaign-select').addEventListener('change', function() {
        const campaignId = this.value;
        renderCampaign(campaignId);
    });
    
    // Add campaign button
    document.getElementById('add-campaign-btn').addEventListener('click', addCampaign);
    
    // Campaign form submission
    document.getElementById('campaign-form').addEventListener('submit', saveCampaign);
    
    // Session form submission
    document.getElementById('session-form').addEventListener('submit', saveSession);
    
    // Quest form submission
    document.getElementById('quest-form').addEventListener('submit', saveQuest);
    
    // Close modals when clicking the close button
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('campaign-modal').style.display = 'none';
            document.getElementById('section-modal').style.display = 'none';
            document.getElementById('session-modal').style.display = 'none';
            document.getElementById('quest-modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside the modal content
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Initialize the page
    populateCampaignDropdown();
    
    // If there's a campaign selected in the dropdown, render it
    const selectedCampaignId = document.getElementById('campaign-select').value;
    if (selectedCampaignId) {
        renderCampaign(selectedCampaignId);
    } else {
        renderCampaign('');
    }
});



