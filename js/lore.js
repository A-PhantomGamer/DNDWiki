document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.lore-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const campaignSelect = document.getElementById('lore-campaign-select');
    
    // Hide DM Secrets tab button when not in DM mode
    function updateDmSecretTabVisibility() {
        const isDmMode = document.body.classList.contains('dm-mode');
        const secretsTabBtn = document.querySelector('.tab-btn[data-tab="secrets"]');
        
        if (secretsTabBtn) {
            if (isDmMode) {
                secretsTabBtn.style.display = 'block';
            } else {
                secretsTabBtn.style.display = 'none';
                
                // If the secrets tab is active, switch to another tab
                if (secretsTabBtn.classList.contains('active')) {
                    // Find the first non-secrets tab and activate it
                    const firstTabBtn = document.querySelector('.tab-btn:not([data-tab="secrets"])');
                    if (firstTabBtn) {
                        firstTabBtn.click();
                    }
                }
            }
        }
    }
    
    // Call this function on page load
    updateDmSecretTabVisibility();
    
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
        loadLoreData(this.value);
    });
    
    // Initial load
    loadLoreData(campaignSelect.value);
    
    // DM Mode functionality
    const dmToggle = document.getElementById('dm-toggle');
    
    // Create custom DM login modal (more stylish alternative to browser prompt)
    function createDmLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'dm-login-modal';
        modal.innerHTML = `
            <div class="dm-login-form">
                <button class="close-btn" aria-label="Close">&times;</button>
                <h3>DM Access Required</h3>
                <input type="password" id="dm-password" placeholder="Enter DM password">
                <button id="dm-login-btn">Access DM View</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close button functionality
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.classList.remove('active');
            // Clear the password field when closing
            document.getElementById('dm-password').value = '';
        });
        
        // Login button functionality
        modal.querySelector('#dm-login-btn').addEventListener('click', () => {
            const password = document.getElementById('dm-password').value;
            if (password === 'dm123') {
                // Enter DM mode
                document.body.classList.add('dm-mode');
                dmToggle.classList.add('active');
                dmToggle.textContent = 'Exit DM View';
                
                // Show all DM-only content
                document.querySelectorAll('.dm-only').forEach(el => {
                    el.classList.add('visible');
                });
                
                // Update DM Secrets tab visibility
                updateDmSecretTabVisibility();
                
                // Update edit buttons visibility
                updateEditButtonsVisibility();
                
                // Store DM mode state
                localStorage.setItem('dmModeActive', 'true');
                document.cookie = "dmMode=active; path=/";
                
                // Close modal and clear password
                modal.classList.remove('active');
                document.getElementById('dm-password').value = '';
            } else {
                alert('Incorrect password. DM access denied.');
            }
        });
        
        // Allow Enter key to submit
        modal.querySelector('#dm-password').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                modal.querySelector('#dm-login-btn').click();
            }
        });
        
        // Prevent clicks inside the form from closing the modal
        modal.querySelector('.dm-login-form').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Allow clicking outside the form to close the modal
        modal.addEventListener('click', () => {
            modal.classList.remove('active');
            document.getElementById('dm-password').value = '';
        });
        
        return modal;
    }

    // Initialize the modal
    const dmLoginModal = createDmLoginModal();

    // Update the toggle button to use the custom modal
    dmToggle.addEventListener('click', function() {
        const isDmMode = document.body.classList.contains('dm-mode');
        
        if (isDmMode) {
            // Turn off DM mode
            document.body.classList.remove('dm-mode');
            this.classList.remove('active');
            this.textContent = 'DM Mode';
            document.querySelectorAll('.dm-only').forEach(el => {
                el.classList.remove('visible');
            });
            
            // Update DM Secrets tab visibility
            updateDmSecretTabVisibility();
            
            // Update edit buttons visibility
            updateEditButtonsVisibility();
            
            localStorage.setItem('dmModeActive', 'false');
            document.cookie = "dmMode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } else {
            // Show custom login modal instead of browser prompt
            dmLoginModal.classList.add('active');
            setTimeout(() => {
                document.getElementById('dm-password').focus();
            }, 100);
        }
    });
    
    // Check DM mode on page load
    function checkDmMode() {
        const isDmMode = localStorage.getItem('dmModeActive') === 'true' || 
                         document.cookie.includes('dmMode=active');
        
        if (isDmMode) {
            document.body.classList.add('dm-mode');
            document.querySelectorAll('.dm-only').forEach(el => {
                el.classList.add('visible');
            });
            dmToggle.classList.add('active');
            dmToggle.textContent = 'Exit DM View';
        }
        
        // Update DM Secrets tab visibility
        updateDmSecretTabVisibility();
        
        // Update edit buttons visibility
        updateEditButtonsVisibility();
    }
    
    // Check DM mode on page load
    checkDmMode();
    
    // Edit lore functionality
    const editButtons = document.querySelectorAll('.edit-lore-btn');
    const editModal = document.getElementById('lore-edit-modal');
    const editForm = document.getElementById('lore-edit-form');
    const closeEditModal = editModal.querySelector('.close-modal');
    const cancelEditBtn = editModal.querySelector('.cancel-btn');
    
    // Add event listeners to all edit buttons
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const loreCard = this.closest('.lore-card, .timeline-item, .artifact-card, .deity-card, .secret-card');
            
            // Populate the edit form with the lore data
            populateEditForm(loreCard);
            
            // Show the edit modal
            editModal.style.display = 'block';
        });
    });
    
    // Close edit modal when clicking the X
    closeEditModal.addEventListener('click', function() {
        editModal.style.display = 'none';
    });
    
    // Close edit modal when clicking Cancel
    cancelEditBtn.addEventListener('click', function() {
        editModal.style.display = 'none';
    });
    
    // Close edit modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Handle edit form submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            title: document.getElementById('lore-title').value,
            type: document.getElementById('lore-type').value,
            content: document.getElementById('lore-content').value,
            source: document.getElementById('lore-source').value,
            status: document.getElementById('lore-status').value
        };
        
        // Get the lore card that's being edited
        const loreCardId = editForm.getAttribute('data-lore-id');
        
        // Update the lore card with the new data
        updateLoreCard(loreCardId, formData);
        
        // Close the modal
        editModal.style.display = 'none';
    });
    
    // Add new lore functionality
    const addButtons = document.querySelectorAll('.add-lore-btn');
    const addModal = document.getElementById('add-lore-modal');
    const addForm = document.getElementById('add-lore-form');
    const closeAddModal = addModal.querySelector('.close-modal');
    const cancelAddBtn = addModal.querySelector('.cancel-btn');
    
    // Add event listeners to all add buttons
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Determine which tab we're in
            const tabContent = this.closest('.tab-content');
            const tabId = tabContent.id.replace('-content', '');
            
            // Set the category in the form
            document.getElementById('lore-category').value = tabId;
            
            // Show the add modal
            addModal.style.display = 'block';
        });
    });
    
    // Close add modal when clicking the X
    closeAddModal.addEventListener('click', function() {
        addModal.style.display = 'none';
    });
    
    // Close add modal when clicking Cancel
    cancelAddBtn.addEventListener('click', function() {
        addModal.style.display = 'none';
    });
    
    // Close add modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === addModal) {
            addModal.style.display = 'none';
        }
    });
    
    // Handle add form submission
    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            title: document.getElementById('new-lore-title').value,
            type: document.getElementById('new-lore-type').value,
            content: document.getElementById('new-lore-content').value,
            source: document.getElementById('new-lore-source').value,
            status: document.getElementById('new-lore-status').value,
            category: document.getElementById('lore-category').value
        };
        
        // Add the new lore entry
        addLoreEntry(formData);
        
        // Reset the form
        addForm.reset();
        
        // Close the modal
        addModal.style.display = 'none';
    });
    
    // Function to populate the edit form with lore data
    function populateEditForm(loreCard) {
        // Get the lore data from the card
        let title, type, content, source, status;
        
        if (loreCard.classList.contains('lore-card')) {
            // Legend card
            title = loreCard.querySelector('h4').textContent;
            type = loreCard.querySelector('.lore-type').textContent;
            content = Array.from(loreCard.querySelectorAll('.lore-card-content p'))
                .map(p => p.textContent)
                .join('\n\n');
            source = loreCard.querySelector('.lore-source').textContent.replace('Source: ', '');
        } else if (loreCard.classList.contains('timeline-item')) {
            // Historical event
            title = loreCard.querySelector('h4').textContent;
            type = loreCard.querySelector('.event-significance').textContent;
            content = loreCard.querySelector('.timeline-content > p').textContent;
            source = '';
        } else if (loreCard.classList.contains('artifact-card')) {
            // Artifact
            title = loreCard.querySelector('h4').textContent;
            type = loreCard.querySelector('.artifact-type').textContent;
            content = loreCard.querySelector('.artifact-description p').textContent;
            source = '';
            status = loreCard.querySelector('.artifact-status').textContent.replace('Current Location: ', '');
        } else if (loreCard.classList.contains('deity-card')) {
            // Deity
            title = loreCard.querySelector('h4').textContent;
            type = loreCard.querySelector('.deity-title').textContent;
            content = loreCard.querySelector('.deity-description p').textContent;
            source = '';
            status = loreCard.querySelector('.deity-status').textContent;
        } else if (loreCard.classList.contains('secret-card')) {
            // Secret
            title = loreCard.querySelector('h4').textContent;
            type = loreCard.querySelector('.secret-type').textContent;
            content = Array.from(loreCard.querySelectorAll('.secret-content p'))
                .map(p => p.textContent)
                .join('\n\n');
            source = '';
            status = loreCard.querySelector('.secret-status').textContent;
        }
        
        // Populate the form
        document.getElementById('lore-title').value = title;
        document.getElementById('lore-type').value = type;
        document.getElementById('lore-content').value = content;
        document.getElementById('lore-source').value = source || '';
        
        if (status) {
            document.getElementById('lore-status').value = status;
        }
        
        // Store the lore card ID for later
        editForm.setAttribute('data-lore-id', loreCard.id || generateId());
        if (!loreCard.id) {
            loreCard.id = editForm.getAttribute('data-lore-id');
        }
    }
    
    // Function to update a lore card with new data
    function updateLoreCard(loreCardId, formData) {
        const loreCard = document.getElementById(loreCardId);
        
        if (!loreCard) return;
        
        if (loreCard.classList.contains('lore-card')) {
            // Update legend card
            loreCard.querySelector('h4').textContent = formData.title;
            loreCard.querySelector('.lore-type').textContent = formData.type;
            
            // Split content by paragraphs
            const paragraphs = formData.content.split('\n\n');
            const contentDiv = loreCard.querySelector('.lore-card-content');
            contentDiv.innerHTML = '';
            paragraphs.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                contentDiv.appendChild(p);
            });
            
            loreCard.querySelector('.lore-source').textContent = `Source: ${formData.source}`;
        } else if (loreCard.classList.contains('timeline-item')) {
            // Update historical event
            loreCard.querySelector('h4').textContent = formData.title;
            loreCard.querySelector('.event-significance').textContent = formData.type;
            loreCard.querySelector('.timeline-content > p').textContent = formData.content;
        } else if (loreCard.classList.contains('artifact-card')) {
            // Update artifact
            loreCard.querySelector('h4').textContent = formData.title;
            loreCard.querySelector('.artifact-type').textContent = formData.type;
            loreCard.querySelector('.artifact-description p').textContent = formData.content;
            loreCard.querySelector('.artifact-status').textContent = `Current Location: ${formData.status}`;
        } else if (loreCard.classList.contains('deity-card')) {
            // Update deity
            loreCard.querySelector('h4').textContent = formData.title;
            loreCard.querySelector('.deity-title').textContent = formData.type;
            loreCard.querySelector('.deity-description p').textContent = formData.content;
            loreCard.querySelector('.deity-status').textContent = formData.status;
        } else if (loreCard.classList.contains('secret-card')) {
            // Update secret
            loreCard.querySelector('h4').textContent = formData.title;
            loreCard.querySelector('.secret-type').textContent = formData.type;
            
            // Split content by paragraphs
            const paragraphs = formData.content.split('\n\n');
            const contentDiv = loreCard.querySelector('.secret-content');
            contentDiv.innerHTML = '';
            paragraphs.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                contentDiv.appendChild(p);
            });
            
            loreCard.querySelector('.secret-status').textContent = formData.status;
        }
        
        // Save to localStorage
        saveLoreData();
    }
    
    // Function to add a new lore entry
    function addLoreEntry(formData) {
        // Create a new lore card based on the category
        let newCard;
        const category = formData.category;
        const container = document.querySelector(`#${category}-content .lore-grid, #${category}-content .timeline, #${category}-content .artifacts-grid, #${category}-content .pantheon-grid, #${category}-content .secrets-container`);
        
        if (!container) return;
        
        const cardId = generateId();
        
        if (category === 'legends') {
            // Create a new legend card
            newCard = document.createElement('div');
            newCard.className = 'lore-card';
            newCard.id = cardId;
            newCard.innerHTML = `
                <div class="lore-card-header">
                    <h4>${formData.title}</h4>
                    <span class="lore-type">${formData.type}</span>
                </div>
                <div class="lore-card-content">
                    ${formData.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
                </div>
                <div class="lore-card-footer">
                    <span class="lore-source">Source: ${formData.source}</span>
                    <button class="edit-lore-btn">Edit</button>
                </div>
            `;
        } else if (category === 'history') {
            // Create a new historical event
            newCard = document.createElement('div');
            newCard.className = 'timeline-item';
            newCard.id = cardId;
            newCard.innerHTML = `
                <div class="timeline-date">
                    <span>${formData.source || 'Date Unknown'}</span>
                </div>
                <div class="timeline-content">
                    <h4>${formData.title}</h4>
                    <p>${formData.content}</p>
                    <div class="timeline-footer">
                        <span class="event-significance">${formData.type}</span>
                        <button class="edit-lore-btn">Edit</button>
                    </div>
                </div>
            `;
        } else if (category === 'artifacts') {
            // Create a new artifact
            newCard = document.createElement('div');
            newCard.className = 'artifact-card';
            newCard.id = cardId;
            newCard.innerHTML = `
                <div class="artifact-image">
                    <img src="img/artifacts/placeholder.jpg" alt="${formData.title}">
                </div>
                <div class="artifact-info">
                    <h4>${formData.title}</h4>
                    <p class="artifact-type">${formData.type}</p>
                    <div class="artifact-description">
                        <p>${formData.content}</p>
                    </div>
                    <div class="artifact-properties">
                        <h5>Properties</h5>
                        <ul>
                            <li>Add properties here</li>
                        </ul>
                    </div>
                    <div class="artifact-history">
                        <h5>History</h5>
                        <p>Add history here</p>
                    </div>
                    <div class="artifact-footer">
                        <span class="artifact-status">Current Location: ${formData.status || 'Unknown'}</span>
                        <button class="edit-lore-btn">Edit</button>
                    </div>
                </div>
            `;
        } else if (category === 'religions') {
            // Create a new deity
            newCard = document.createElement('div');
            newCard.className = 'deity-card';
            newCard.id = cardId;
            newCard.innerHTML = `
                <div class="deity-image">
                    <img src="img/deities/placeholder.jpg" alt="${formData.title}">
                </div>
                <div class="deity-info">
                    <h4>${formData.title}</h4>
                    <p class="deity-title">${formData.type}</p>
                    <div class="deity-details">
                        <p><strong>Alignment:</strong> Add alignment</p>
                        <p><strong>Domains:</strong> Add domains</p>
                        <p><strong>Symbol:</strong> Add symbol</p>
                    </div>
                    <div class="deity-description">
                        <p>${formData.content}</p>
                    </div>
                    <div class="deity-worship">
                        <h5>Worship</h5>
                        <p>Add worship details here</p>
                    </div>
                    <div class="deity-footer">
                        <span class="deity-status">${formData.status || 'Minor deity'}</span>
                        <button class="edit-lore-btn">Edit</button>
                    </div>
                </div>
            `;
        } else if (category === 'secrets') {
            // Create a new secret
            newCard = document.createElement('div');
            newCard.className = 'secret-card';
            newCard.id = cardId;
            newCard.innerHTML = `
                <div class="secret-header">
                    <h4>${formData.title}</h4>
                    <span class="secret-type">${formData.type}</span>
                </div>
                <div class="secret-content">
                    ${formData.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
                </div>
                <div class="secret-footer">
                    <span class="secret-status">${formData.status || 'Not Yet Revealed'}</span>
                    <button class="edit-lore-btn">Edit</button>
                </div>
            `;
        }
        
        if (newCard) {
            // Add the new card to the container
            container.appendChild(newCard);
            
            // Add event listener to the edit button
            const editButton = newCard.querySelector('.edit-lore-btn');
            editButton.addEventListener('click', function() {
                populateEditForm(newCard);
                editModal.style.display = 'block';
            });
            
            // Save to localStorage
            saveLoreData();
        }
    }
    
    // Function to generate a unique ID
    function generateId() {
        return 'lore-' + Math.random().toString(36).substr(2, 9);
    }
    
    // Function to save lore data to localStorage
    function saveLoreData() {
        const campaignId = campaignSelect.value;
        const loreData = {
            legends: Array.from(document.querySelectorAll('#legends-content .lore-card')).map(card => ({
                id: card.id,
                title: card.querySelector('h4').textContent,
                type: card.querySelector('.lore-type').textContent,
                content: Array.from(card.querySelectorAll('.lore-card-content p')).map(p => p.textContent),
                source: card.querySelector('.lore-source').textContent.replace('Source: ', '')
            })),
            history: Array.from(document.querySelectorAll('#history-content .timeline-item')).map(item => ({
                id: item.id,
                title: item.querySelector('h4').textContent,
                type: item.querySelector('.event-significance').textContent,
                content: item.querySelector('.timeline-content > p').textContent,
                date: item.querySelector('.timeline-date span').textContent
            })),
            artifacts: Array.from(document.querySelectorAll('#artifacts-content .artifact-card')).map(card => ({
                id: card.id,
                title: card.querySelector('h4').textContent,
                type: card.querySelector('.artifact-type').textContent,
                description: card.querySelector('.artifact-description p').textContent,
                properties: Array.from(card.querySelectorAll('.artifact-properties li')).map(li => li.textContent),
                history: card.querySelector('.artifact-history p').textContent,
                status: card.querySelector('.artifact-status').textContent.replace('Current Location: ', '')
            })),
            religions: Array.from(document.querySelectorAll('#religions-content .deity-card')).map(card => ({
                id: card.id,
                name: card.querySelector('h4').textContent,
                title: card.querySelector('.deity-title').textContent,
                alignment: card.querySelector('.deity-details p:nth-child(1)').textContent.replace('<strong>Alignment:</strong> ', ''),
                domains: card.querySelector('.deity-details p:nth-child(2)').textContent.replace('<strong>Domains:</strong> ', ''),
                symbol: card.querySelector('.deity-details p:nth-child(3)').textContent.replace('<strong>Symbol:</strong> ', ''),
                description: card.querySelector('.deity-description p').textContent,
                worship: card.querySelector('.deity-worship p').textContent,
                status: card.querySelector('.deity-status').textContent
            })),
            secrets: Array.from(document.querySelectorAll('#secrets-content .secret-card')).map(card => ({
                id: card.id,
                title: card.querySelector('h4').textContent,
                type: card.querySelector('.secret-type').textContent,
                content: Array.from(card.querySelectorAll('.secret-content p')).map(p => p.textContent),
                status: card.querySelector('.secret-status').textContent
            }))
        };
        
        // Get existing lore data or initialize empty object
        let allLoreData = JSON.parse(localStorage.getItem('dndLoreData') || '{}');
        
        // Update data for this campaign
        allLoreData[campaignId] = loreData;
        
        // Save back to localStorage
        localStorage.setItem('dndLoreData', JSON.stringify(allLoreData));
    }
    
    // Function to load lore data based on selection
    function loadLoreData(campaignId) {
        // This would typically fetch data from a JSON file or API
        // For now, we'll use a simple object to demonstrate
        const loreData = {
            campaign1: {
                name: "The Lost Mines of Phandelver",
                legends: [
                    { id: "legend1", title: "The Forge of Spells", content: "Long ago, dwarves and gnomes made an alliance called the Phandelver's Pact, where they agreed to share a rich mine in a wondrous cavern known as Wave Echo Cave. In addition to its mineral wealth, the mine contained great magical power." },
                    { id: "legend2", title: "The Black Spider", content: "A mysterious figure known as the Black Spider has come to the Sword Coast seeking Wave Echo Cave and its magic." }
                ],
                history: [
                    { id: "hist1", title: "The Orc Invasion", date: "400 years ago", content: "Orcs overran the mines, and the location of Wave Echo Cave was lost for centuries." },
                    { id: "hist2", title: "Rediscovery", date: "Recent", content: "The Rockseeker brothers recently located the entrance to Wave Echo Cave." }
                ],
                artifacts: [
                    { id: "art1", title: "Lightbringer", type: "Weapon", content: "A magical mace that glows with radiant energy when its wielder commands." },
                    { id: "art2", title: "Dragonguard", type: "Armor", content: "A breastplate that grants resistance to dragon breath weapons." }
                ],
                religions: [
                    { id: "rel1", title: "Moradin", type: "Dwarven God", content: "The Soulforger, god of dwarves and creation." },
                    { id: "rel2", title: "Tymora", type: "Human Goddess", content: "Lady Luck, goddess of good fortune." }
                ],
                secrets: [
                    { id: "sec1", title: "True Identity of Iarno", type: "NPC Secret", content: "Iarno Albrek is actually working for the Black Spider and has established the Redbrands to control Phandalin.", status: "Unrevealed" },
                    { id: "sec2", title: "Dragon's Location", type: "Location Secret", content: "A young green dragon has made its lair at Thundertree, disguised as a helpful figure.", status: "Partially Revealed" }
                ]
            },
            campaign2: {
                name: "Curse of Strahd",
                legends: [
                    { id: "legend1", title: "The Amber Temple", content: "An ancient vault of forbidden knowledge where dark vestiges offer terrible power to those who seek it." },
                    { id: "legend2", title: "The Blood of Strahd", content: "It is said that drinking the blood of Strahd can grant immortality, but at a terrible cost." }
                ],
                history: [
                    { id: "hist1", title: "Strahd's Transformation", date: "400 years ago", content: "Strahd von Zarovich made a pact with dark powers to gain immortality, becoming the first vampire." },
                    { id: "hist2", title: "The Mists Descend", date: "400 years ago", content: "After Strahd's transformation, the land of Barovia was cut off from the rest of the world by mysterious mists." }
                ],
                artifacts: [
                    { id: "art1", title: "Sunsword", type: "Weapon", content: "A legendary blade of pure radiance that is especially effective against Strahd." },
                    { id: "art2", title: "Holy Symbol of Ravenkind", type: "Holy Relic", content: "A powerful amulet that can hold vampires at bay and emit a powerful burst of sunlight." }
                ],
                religions: [
                    { id: "rel1", title: "The Morninglord", type: "God of Light", content: "The primary deity worshipped in Barovia before Strahd's curse." },
                    { id: "rel2", title: "Mother Night", type: "Goddess of Darkness", content: "A mysterious entity worshipped by the witches of Barovia." }
                ],
                secrets: [
                    { id: "sec1", title: "Ireena's True Identity", type: "NPC Secret", content: "Ireena Kolyana is the reincarnation of Tatyana, Strahd's lost love.", status: "Unrevealed" },
                    { id: "sec2", title: "The Dark Powers", type: "Cosmic Secret", content: "The mists of Barovia are controlled by mysterious entities known as the Dark Powers, who use Barovia as a prison for Strahd.", status: "Partially Revealed" }
                ]
            },
            campaign3: {
                name: "Storm King's Thunder",
                legends: [
                    { id: "legend1", title: "The Ordning", content: "The divine hierarchy that determines status among giants, established by their god Annam the All-Father." },
                    { id: "legend2", title: "Ostorian Empire", content: "An ancient empire of giants that once ruled the North, leaving behind massive ruins and powerful artifacts." }
                ],
                history: [
                    { id: "hist1", title: "Breaking of the Ordning", date: "Recent", content: "The giant social hierarchy was mysteriously shattered, causing chaos among giantkind." },
                    { id: "hist2", title: "Dragon-Giant War", date: "Thousands of years ago", content: "A devastating conflict between dragons and giants that ended the Ostorian Empire." }
                ],
                artifacts: [
                    { id: "art1", title: "Conch of Teleportation", type: "Magic Item", content: "A giant-crafted shell that allows teleportation to Maelstrom, the storm giant fortress." },
                    { id: "art2", title: "Gurt's Greataxe", type: "Weapon", content: "A massive greataxe once wielded by the legendary frost giant hero Gurt." }
                ],
                religions: [
                    { id: "rel1", title: "Annam the All-Father", type: "Giant God", content: "The creator deity of giantkind who established the Ordning." },
                    { id: "rel2", title: "Stronmaus", type: "Storm Giant God", content: "The god of storm giants, sun, sky, and weather, son of Annam." }
                ],
                secrets: [
                    { id: "sec1", title: "Iymrith's Disguise", type: "NPC Secret", content: "The storm giant king's advisor 'Advisor Uthor' is actually Iymrith, an ancient blue dragon in disguise.", status: "Unrevealed" },
                    { id: "sec2", title: "The Kraken Society", type: "Faction Secret", content: "A secret cult devoted to a powerful kraken named Slarkrethel is manipulating events to increase chaos among giants and small folk alike.", status: "Partially Revealed" }
                ]
            }
        };
        
        // Update the UI with the loaded data
        updateLoreUI(loreData[campaignId]);
    }

    // Function to update the UI with loaded lore data
    function updateLoreUI(data) {
        if (!data) return;
        
        // Update legends tab
        const legendsContainer = document.querySelector('#legends-content .lore-grid');
        if (legendsContainer) {
            legendsContainer.innerHTML = '';
            data.legends.forEach(legend => {
                const card = document.createElement('div');
                card.className = 'lore-card';
                card.id = legend.id;
                card.innerHTML = `
                    <h4>${legend.title}</h4>
                    <p>${legend.content}</p>
                    <button class="edit-lore-btn">Edit</button>
                `;
                legendsContainer.appendChild(card);
            });
        }
        
        // Update history tab
        const historyContainer = document.querySelector('#history-content .timeline');
        if (historyContainer) {
            historyContainer.innerHTML = '';
            data.history.forEach(event => {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.id = event.id;
                item.innerHTML = `
                    <div class="timeline-date">${event.date}</div>
                    <div class="timeline-content">
                        <h4>${event.title}</h4>
                        <p>${event.content}</p>
                        <button class="edit-lore-btn">Edit</button>
                    </div>
                `;
                historyContainer.appendChild(item);
            });
        }
        
        // Update artifacts tab
        const artifactsContainer = document.querySelector('#artifacts-content .artifacts-grid');
        if (artifactsContainer) {
            artifactsContainer.innerHTML = '';
            data.artifacts.forEach(artifact => {
                const card = document.createElement('div');
                card.className = 'artifact-card';
                card.id = artifact.id;
                card.innerHTML = `
                    <h4>${artifact.title}</h4>
                    <div class="artifact-type">${artifact.type}</div>
                    <p>${artifact.content}</p>
                    <button class="edit-lore-btn">Edit</button>
                `;
                artifactsContainer.appendChild(card);
            });
        }
        
        // Update religions tab
        const religionsContainer = document.querySelector('#religions-content .pantheon-grid');
        if (religionsContainer) {
            religionsContainer.innerHTML = '';
            data.religions.forEach(deity => {
                const card = document.createElement('div');
                card.className = 'deity-card';
                card.id = deity.id;
                card.innerHTML = `
                    <h4>${deity.title}</h4>
                    <div class="deity-type">${deity.type}</div>
                    <p>${deity.content}</p>
                    <button class="edit-lore-btn">Edit</button>
                `;
                religionsContainer.appendChild(card);
            });
        }
        
        // Update secrets tab (DM only)
        const secretsContainer = document.querySelector('#secrets-content .secrets-container');
        if (secretsContainer) {
            secretsContainer.innerHTML = '';
            data.secrets.forEach(secret => {
                const card = document.createElement('div');
                card.className = 'secret-card';
                card.id = secret.id;
                card.innerHTML = `
                    <h4>${secret.title}</h4>
                    <div class="secret-type">${secret.type}</div>
                    <div class="secret-content">
                        <p>${secret.content}</p>
                    </div>
                    <div class="secret-status">${secret.status}</div>
                    <button class="edit-lore-btn">Edit</button>
                `;
                secretsContainer.appendChild(card);
            });
        }
        
        // Update edit buttons visibility
        updateEditButtonsVisibility();
        
        // Reattach event listeners to edit buttons
        attachEditButtonListeners();
    }

    // Function to attach event listeners to edit buttons
    function attachEditButtonListeners() {
        const editButtons = document.querySelectorAll('.edit-lore-btn');
        
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const loreCard = this.closest('.lore-card, .timeline-item, .artifact-card, .deity-card, .secret-card');
                
                // Populate the edit form with the lore data
                populateEditForm(loreCard);
                
                // Show the edit modal
                const editModal = document.getElementById('lore-edit-modal');
                if (editModal) {
                    editModal.style.display = 'block';
                }
            });
        });
    }
    
    // Function to update edit buttons visibility based on DM mode
    function updateEditButtonsVisibility() {
        const isDmMode = document.body.classList.contains('dm-mode');
        const editButtons = document.querySelectorAll('.edit-lore-btn, .add-lore-btn');
        
        editButtons.forEach(button => {
            if (isDmMode) {
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        });
    }
    
    // Call this function on page load
    updateEditButtonsVisibility();
});









