document.addEventListener('DOMContentLoaded', function() {
    const campaignSelect = document.getElementById('npc-campaign-select');
    const typeSelect = document.getElementById('npc-type-select');
    const searchInput = document.getElementById('npc-search');
    const searchBtn = document.getElementById('search-btn');
    const npcGrid = document.getElementById('npc-grid');
    const npcCards = document.querySelectorAll('.npc-card');
    
    // Function to filter NPCs based on all criteria
    function filterNPCs() {
        const selectedCampaign = campaignSelect.value;
        const selectedType = typeSelect.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        npcCards.forEach(card => {
            const campaignMatch = selectedCampaign === 'all' || card.getAttribute('data-campaign') === selectedCampaign;
            const typeMatch = selectedType === 'all' || card.getAttribute('data-type') === selectedType;
            const nameMatch = card.querySelector('h3').textContent.toLowerCase().includes(searchTerm);
            const descMatch = card.querySelector('.npc-description').textContent.toLowerCase().includes(searchTerm);
            const searchMatch = searchTerm === '' || nameMatch || descMatch;
            
            if (campaignMatch && typeMatch && searchMatch) {
                card.style.display = 'flex';
                // Add a slight delay for a staggered animation effect
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, Math.random() * 300);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // Event listeners for filters
    campaignSelect.addEventListener('change', filterNPCs);
    typeSelect.addEventListener('change', filterNPCs);
    searchBtn.addEventListener('click', filterNPCs);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterNPCs();
        }
    });
    
    // Add hover effect to NPC cards
    npcCards.forEach(card => {
        // Set initial state for animation
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.transition = 'all 0.4s ease';
        
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
        
        // Add click event for NPC cards
        card.addEventListener('click', function(e) {
            // Only trigger if not clicking on the view more link
            if (!e.target.classList.contains('view-more')) {
                const npcName = this.querySelector('h3').textContent;
                // Toggle DM-only content visibility only if not in DM mode
                if (!document.body.classList.contains('dm-mode')) {
                    const dmContent = this.querySelector('.npc-stats');
                    if (dmContent) {
                        // Toggle the visible class
                        if (dmContent.classList.contains('visible')) {
                            dmContent.classList.remove('visible');
                        } else {
                            // Hide all other visible stats first
                            document.querySelectorAll('.npc-stats.visible').forEach(el => {
                                if (el !== dmContent) el.classList.remove('visible');
                            });
                            dmContent.classList.add('visible');
                        }
                    }
                }
            }
        });
    });
    
    // Make the NPC cards look more interactive
    const viewMoreLinks = document.querySelectorAll('.view-more');
    viewMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const npcName = this.closest('.npc-card').querySelector('h3').textContent;
            alert(`Full details for ${npcName} will open in a new tab (not implemented yet)`);
        });
    });
    
    // Add toggle button for DM-only content with password protection
    const dmToggleBtn = document.createElement('button');
    dmToggleBtn.id = 'dm-toggle';
    dmToggleBtn.className = 'dm-toggle-btn';
    dmToggleBtn.textContent = 'DM Access';
    document.querySelector('.filters').appendChild(dmToggleBtn);

    // Store DM password (in a real app, this would be handled server-side)
    // For demo purposes only - in production this should never be in client-side code
    const DM_PASSWORD = 'dragon123'; 
    let dmModeActive = false;

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
            if (password === DM_PASSWORD) {
                // Enter DM mode
                document.body.classList.add('dm-mode');
                dmToggleBtn.classList.add('active');
                dmToggleBtn.textContent = 'Exit DM View';
                dmModeActive = true;
                
                // Show all DM-only content
                document.querySelectorAll('.dm-only, .npc-stats').forEach(el => {
                    el.classList.add('visible');
                });
                
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
    dmToggleBtn.addEventListener('click', function() {
        if (dmModeActive) {
            // Exit DM mode
            document.body.classList.remove('dm-mode');
            this.classList.remove('active');
            this.textContent = 'DM Access';
            dmModeActive = false;
            
            // Hide all DM-only content
            document.querySelectorAll('.dm-only, .npc-stats').forEach(el => {
                el.classList.remove('visible');
            });
            
            // Update stored state
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

    // Check if DM mode was previously active (optional, for convenience)
    document.addEventListener('DOMContentLoaded', function() {
        // Check for DM mode cookie or localStorage
        const isDmMode = localStorage.getItem('dmModeActive') === 'true' || 
                         document.cookie.includes('dmMode=active');
        
        if (isDmMode) {
            // Reactivate DM mode
            document.body.classList.add('dm-mode');
            dmToggleBtn.classList.add('active');
            dmToggleBtn.textContent = 'Exit DM View';
            dmModeActive = true;
            
            // Show all DM-only content
            document.querySelectorAll('.dm-only, .npc-stats').forEach(el => {
                el.classList.add('visible');
            });
        }
    });
});
