document.addEventListener('DOMContentLoaded', function() {
    loadNPCs();
    setupEventListeners();
});

function loadNPCs() {
    const npcs = JSON.parse(localStorage.getItem('npcs')) || [];
    const npcGrid = document.getElementById('npc-grid');
    npcGrid.innerHTML = '';

    if (npcs.length === 0) {
        npcGrid.innerHTML = '<p class="no-npcs">No NPCs added yet. Use DM mode to add NPCs.</p>';
        return;
    }

    npcs.forEach(npc => {
        npcGrid.appendChild(createNPCCard(npc));
    });
}

function createNPCCard(npc) {
    const card = document.createElement('div');
    card.className = 'npc-card';
    card.innerHTML = `
        <div class="npc-info">
            <h3 class="npc-name">${npc.name}</h3>
            <p class="npc-description">${npc.description || ''}</p>
            <div class="npc-secret dm-only">${npc.secret || ''}</div>
        </div>
    `;
    return card;
}

function setupEventListeners() {
    // Search functionality
    document.getElementById('npc-search').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.npc-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });

    // Add NPC
    document.getElementById('add-npc').addEventListener('click', function() {
        if (!window.isAuthenticated) return;
        
        const name = prompt('Enter NPC name:');
        if (!name) return;

        const description = prompt('Enter NPC description:');
        const npc = { name, description };

        const npcs = JSON.parse(localStorage.getItem('npcs')) || [];
        npcs.push(npc);
        localStorage.setItem('npcs', JSON.stringify(npcs));
        
        loadNPCs();
    });
}
