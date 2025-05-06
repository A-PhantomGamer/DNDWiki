document.addEventListener('DOMContentLoaded', function() {
    const campaignSelect = document.getElementById('character-campaign-select');
    const characterGrid = document.getElementById('character-grid');
    const characterCards = document.querySelectorAll('.character-card');
    
    // Filter characters by campaign
    campaignSelect.addEventListener('change', function() {
        const selectedCampaign = this.value;
        
        characterCards.forEach(card => {
            if (selectedCampaign === 'all' || card.getAttribute('data-campaign') === selectedCampaign) {
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
    });
    
    // Add hover effect to character cards
    characterCards.forEach(card => {
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
        
        // Add click event for character cards
        card.addEventListener('click', function(e) {
            // Only trigger if not clicking on the view more link
            if (!e.target.classList.contains('view-more')) {
                const characterName = this.querySelector('h3').textContent;
                alert(`Character sheet for ${characterName} will open in a new tab (not implemented yet)`);
            }
        });
    });
    
    // Make the character cards look more interactive
    const viewMoreLinks = document.querySelectorAll('.view-more');
    viewMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const characterName = this.closest('.character-card').querySelector('h3').textContent;
            alert(`Character sheet for ${characterName} will open in a new tab (not implemented yet)`);
        });
    });
});
