document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.world-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const worldSelect = document.getElementById('world-campaign-select');
    
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
    
    // Campaign world selector functionality
    worldSelect.addEventListener('change', function() {
        loadWorldData(this.value);
    });
    
    // Initial load
    loadWorldData(worldSelect.value);
    
    // Interactive map functionality
    setupMapInteraction();
    
    // DM Mode functionality
    function checkDmMode() {
        const isDmMode = localStorage.getItem('dmModeActive') === 'true' || 
                         document.cookie.includes('dmMode=active');
        
        if (isDmMode) {
            document.body.classList.add('dm-mode');
            document.querySelectorAll('.dm-only').forEach(el => {
                el.classList.add('visible');
            });
        }
    }
    
    // Check DM mode on page load
    checkDmMode();
});

// Function to set up map interaction
function setupMapInteraction() {
    const mapLocations = document.querySelectorAll('.map-location');
    const worldMap = document.getElementById('world-map');
    const mapMarkers = document.querySelector('.map-markers');
    
    // Clear existing markers
    mapMarkers.innerHTML = '';
    
    // Create map markers
    mapLocations.forEach(location => {
        const locationId = location.getAttribute('data-location');
        const markerType = location.querySelector('.location-dot').classList[1];
        
        // Create marker element
        const marker = document.createElement('div');
        marker.className = `map-marker ${markerType}`;
        marker.setAttribute('data-location', locationId);
        
        // Add marker to map
        mapMarkers.appendChild(marker);
        
        // Add hover interaction between list and markers
        location.addEventListener('mouseenter', () => {
            marker.classList.add('active');
        });
        
        location.addEventListener('mouseleave', () => {
            marker.classList.remove('active');
        });
        
        marker.addEventListener('mouseenter', () => {
            location.classList.add('active');
        });
        
        marker.addEventListener('mouseleave', () => {
            location.classList.remove('active');
        });
        
        // Add click functionality to show location details
        marker.addEventListener('click', () => {
            // Switch to locations tab and scroll to the relevant location
            const locationsTab = document.querySelector('[data-tab="locations"]');
            locationsTab.click();
            
            // Find the corresponding location card and highlight it
            const locationCards = document.querySelectorAll('.location-card');
            locationCards.forEach(card => {
                card.classList.remove('highlight');
                if (card.querySelector('h4').textContent.toLowerCase().includes(locationId)) {
                    card.classList.add('highlight');
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    });
    
    // Position markers based on current campaign
    const currentCampaign = document.getElementById('world-campaign-select').value;
    positionMapMarkers(currentCampaign);
}

// Function to position map markers based on predefined coordinates
function positionMapMarkers(campaignId) {
    // Predefined coordinates for each location (percentages of map width/height)
    const markerPositions = {
        campaign1: { // Sword Coast
            neverwinter: { x: 25, y: 30 },
            phandalin: { x: 35, y: 45 },
            'cragmaw-castle': { x: 40, y: 38 },
            'wave-echo-cave': { x: 45, y: 50 }
        },
        campaign2: { // Barovia
            'village-of-barovia': { x: 40, y: 60 },
            'castle-ravenloft': { x: 50, y: 30 },
            vallaki: { x: 30, y: 45 },
            'amber-temple': { x: 70, y: 20 }
        },
        campaign3: { // The North
            waterdeep: { x: 20, y: 70 },
            triboar: { x: 45, y: 40 },
            'eye-of-the-all-father': { x: 65, y: 25 },
            maelstrom: { x: 75, y: 60 }
        }
    };
    
    // Get all markers
    const markers = document.querySelectorAll('.map-marker');
    
    // Position each marker
    markers.forEach(marker => {
        const locationId = marker.getAttribute('data-location');
        const positions = markerPositions[campaignId];
        
        if (positions && positions[locationId]) {
            marker.style.left = `${positions[locationId].x}%`;
            marker.style.top = `${positions[locationId].y}%`;
        } else {
            // Fallback to random positioning if coordinates aren't defined
            const randomX = Math.floor(Math.random() * 80) + 10; // 10-90% of map width
            const randomY = Math.floor(Math.random() * 80) + 10; // 10-90% of map height
            
            marker.style.left = `${randomX}%`;
            marker.style.top = `${randomY}%`;
        }
    });
}

// Function to load world data based on campaign selection
function loadWorldData(campaignId) {
    // This would typically fetch data from a JSON file or API
    // For now, we'll use a simple object to demonstrate
    const worldData = {
        campaign1: {
            name: "The Sword Coast",
            mapImage: "img/maps/sword-coast-map.jpg",
            locations: [
                { id: "neverwinter", name: "Neverwinter", type: "city", description: "Known as the City of Skilled Hands or the Jewel of the North." },
                { id: "phandalin", name: "Phandalin", type: "town", description: "A small mining town recently resettled by hardy frontiersmen." },
                { id: "cragmaw-castle", name: "Cragmaw Castle", type: "dungeon", description: "A ruined castle serving as the base for the Cragmaw goblins." },
                { id: "wave-echo-cave", name: "Wave Echo Cave", type: "secret", description: "The legendary mine containing the Forge of Spells.", dmOnly: true }
            ],
            factions: [
                { id: "lords-alliance", name: "The Lords' Alliance", type: "political", description: "A coalition of political powers concerned with mutual security." },
                { id: "harpers", name: "The Harpers", type: "secretive", description: "A scattered network of spellcasters and spies who advocate equality." },
                { id: "zhentarim", name: "The Zhentarim", type: "mercantile", description: "An ambitious network of merchants and mercenaries.", dmOnly: true }
            ],
            currentDate: "Hammer 15, 1491 DR"
        },
        campaign2: {
            name: "Barovia",
            mapImage: "img/maps/barovia-map.jpg",
            locations: [
                { id: "village-of-barovia", name: "Village of Barovia", type: "town", description: "A gloomy village living under Strahd's shadow." },
                { id: "castle-ravenloft", name: "Castle Ravenloft", type: "dungeon", description: "The imposing castle home of Strahd von Zarovich." },
                { id: "vallaki", name: "Vallaki", type: "town", description: "A larger settlement with walls that keep out the wolves and fog." },
                { id: "amber-temple", name: "Amber Temple", type: "secret", description: "An ancient vault of forbidden knowledge.", dmOnly: true }
            ],
            factions: [
                { id: "vistani", name: "The Vistani", type: "nomadic", description: "Traveling folk with the ability to enter and leave Barovia." },
                { id: "keepers-of-the-feather", name: "Keepers of the Feather", type: "secretive", description: "A secret society of wereravens opposing Strahd." },
                { id: "dark-powers", name: "The Dark Powers", type: "supernatural", description: "Mysterious entities that control the Domains of Dread.", dmOnly: true }
            ],
            currentDate: "Unknown (time flows differently in Barovia)"
        },
        campaign3: {
            name: "The North",
            mapImage: "img/maps/the-north-map.jpg",
            locations: [
                { id: "waterdeep", name: "Waterdeep", type: "city", description: "The City of Splendors, the most influential city in the North." },
                { id: "triboar", name: "Triboar", type: "town", description: "A frontier town at the junction of the Long Road and the Evermoor Way." },
                { id: "eye-of-the-all-father", name: "Eye of the All-Father", type: "dungeon", description: "An ancient temple dedicated to Annam, the giant deity." },
                { id: "maelstrom", name: "Maelstrom", type: "secret", description: "The underwater fortress of the storm giants.", dmOnly: true }
            ],
            factions: [
                { id: "emerald-enclave", name: "The Emerald Enclave", type: "druidic", description: "A widespread group of wilderness survivalists preserving the natural order." },
                { id: "giants", name: "Giant Tribes", type: "tribal", description: "Various giant tribes competing to prove their worth to their gods." },
                { id: "kraken-society", name: "The Kraken Society", type: "cult", description: "A secretive cult devoted to a powerful kraken named Slarkrethel.", dmOnly: true }
            ],
            currentDate: "Mirtul 10, 1491 DR"
        }
    };
    
    // Update the UI with the loaded data
    updateWorldUI(worldData[campaignId]);
    
    // Update map markers for the new campaign
    setupMapInteraction();
}

function updateWorldUI(data) {
    // Update world map
    document.getElementById('world-map').src = data.mapImage;
    document.querySelector('#map-content h3').textContent = `World Map: ${data.name}`;
    
    // Update locations tab
    document.querySelector('#locations-content h3').textContent = `Key Locations: ${data.name}`;
    
    // Update factions tab
    document.querySelector('#factions-content h3').textContent = `Factions & Powers: ${data.name}`;
    
    // Update calendar tab
    document.querySelector('#calendar-content h3').textContent = `Calendar & Time: ${data.name}`;
    
    // Update current date if available
    const currentDateElements = document.querySelectorAll('.current-date');
    currentDateElements.forEach(el => {
        el.textContent = `Current campaign date: ${data.currentDate}`;
    });
    
    // In a full implementation, we would update all the location cards, faction cards,
    // map markers, etc. based on the loaded data
    
    // For now, we'll just update the map locations list
    updateMapLocationsList(data.locations);
}

// Function to update the map locations list
function updateMapLocationsList(locations) {
    const locationsList = document.getElementById('map-locations-list');
    locationsList.innerHTML = '';
    
    locations.forEach(location => {
        const li = document.createElement('li');
        li.className = 'map-location';
        if (location.dmOnly) li.classList.add('dm-only');
        li.setAttribute('data-location', location.id);
        
        li.innerHTML = `
            <span class="location-dot ${location.type}"></span>
            ${location.name} - ${capitalizeFirstLetter(location.type)}
        `;
        
        locationsList.appendChild(li);
    });
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
