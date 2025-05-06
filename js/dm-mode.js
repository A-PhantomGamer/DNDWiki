/**
 * DM Mode Functionality
 * This file handles DM mode across all pages of the D&D Campaign Wiki
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const DM_PASSWORD = 'dm123'; // In a real app, this would be handled server-side
    
    // Initialize DM mode
    initDmMode();
    
    function initDmMode() {
        const dmToggle = document.getElementById('dm-toggle');
        
        if (!dmToggle) return; // Exit if toggle button doesn't exist on this page
        
        // Create custom DM login modal
        const dmLoginModal = createDmLoginModal();
        
        // Set up toggle button
        setupDmToggleButton(dmToggle, dmLoginModal);
        
        // Check if DM mode was previously active
        checkDmMode(dmToggle);
        
        // Update DM-only content visibility
        updateDmOnlyContentVisibility();
    }
    
    function createDmLoginModal() {
        // Remove any existing modal first
        const existingModal = document.querySelector('.dm-login-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create new modal
        const modal = document.createElement('div');
        modal.className = 'dm-login-modal';
        modal.innerHTML = `
            <div class="dm-login-form">
                <button class="close-btn" aria-label="Close">&times;</button>
                <h3>DM Access Required</h3>
                <p>Enter the Dungeon Master password to access restricted content.</p>
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
            attemptDmLogin(modal);
        });
        
        // Allow Enter key to submit
        modal.querySelector('#dm-password').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                attemptDmLogin(modal);
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
    
    function attemptDmLogin(modal) {
        const password = document.getElementById('dm-password').value;
        const dmToggle = document.getElementById('dm-toggle');
        
        if (password === DM_PASSWORD) {
            // Enter DM mode
            activateDmMode(dmToggle);
            
            // Close modal and clear password
            modal.classList.remove('active');
            document.getElementById('dm-password').value = '';
        } else {
            alert('Incorrect password. DM access denied.');
        }
    }
    
    function activateDmMode(dmToggle) {
        document.body.classList.add('dm-mode');
        if (dmToggle) {
            dmToggle.classList.add('active');
            dmToggle.textContent = 'Exit DM View';
        }
        
        // Show all DM-only content
        document.querySelectorAll('.dm-only').forEach(el => {
            el.classList.add('visible');
        });
        
        // Store DM mode state
        localStorage.setItem('dmModeActive', 'true');
        document.cookie = "dmMode=active; path=/; max-age=86400"; // 24 hour expiry
        
        // Call page-specific DM mode functions if they exist
        if (typeof updateDmSecretTabVisibility === 'function') {
            updateDmSecretTabVisibility();
        }
        
        if (typeof updateEditButtonsVisibility === 'function') {
            updateEditButtonsVisibility();
        }
        
        // Dispatch a custom event that other scripts can listen for
        document.dispatchEvent(new CustomEvent('dmModeChanged', { detail: { active: true } }));
    }
    
    function deactivateDmMode(dmToggle) {
        document.body.classList.remove('dm-mode');
        if (dmToggle) {
            dmToggle.classList.remove('active');
            dmToggle.textContent = 'DM Mode';
        }
        
        // Hide all DM-only content
        document.querySelectorAll('.dm-only').forEach(el => {
            el.classList.remove('visible');
        });
        
        // Update stored state
        localStorage.setItem('dmModeActive', 'false');
        document.cookie = "dmMode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Call page-specific DM mode functions if they exist
        if (typeof updateDmSecretTabVisibility === 'function') {
            updateDmSecretTabVisibility();
        }
        
        if (typeof updateEditButtonsVisibility === 'function') {
            updateEditButtonsVisibility();
        }
        
        // Dispatch a custom event that other scripts can listen for
        document.dispatchEvent(new CustomEvent('dmModeChanged', { detail: { active: false } }));
    }
    
    function setupDmToggleButton(dmToggle, dmLoginModal) {
        dmToggle.addEventListener('click', function() {
            const isDmMode = document.body.classList.contains('dm-mode');
            
            if (isDmMode) {
                deactivateDmMode(this);
            } else {
                // Show custom login modal
                dmLoginModal.classList.add('active');
                setTimeout(() => {
                    document.getElementById('dm-password').focus();
                }, 100);
            }
        });
    }
    
    function checkDmMode(dmToggle) {
        const isDmMode = localStorage.getItem('dmModeActive') === 'true' || 
                         document.cookie.includes('dmMode=active');
        
        if (isDmMode) {
            activateDmMode(dmToggle);
        }
    }
    
    // Function to update DM-only content visibility
    function updateDmOnlyContentVisibility() {
        const isDmMode = document.body.classList.contains('dm-mode');
        
        document.querySelectorAll('.dm-only').forEach(el => {
            if (isDmMode) {
                el.classList.add('visible');
            } else {
                el.classList.remove('visible');
            }
        });
    }
    
    // Export functions for use in other scripts
    window.dmMode = {
        activate: function() { activateDmMode(document.getElementById('dm-toggle')); },
        deactivate: function() { deactivateDmMode(document.getElementById('dm-toggle')); },
        isActive: function() { return document.body.classList.contains('dm-mode'); },
        updateVisibility: updateDmOnlyContentVisibility
    };
});