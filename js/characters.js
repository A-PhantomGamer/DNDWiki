document.addEventListener('DOMContentLoaded', function() {
    const campaignSelect = document.getElementById('character-campaign-select');
    const characterGrid = document.getElementById('character-grid');
    const characterCards = document.querySelectorAll('.character-card');
    const modal = document.getElementById('character-sheet-modal');
    const closeModal = document.querySelector('.close-modal');
    let currentCharacterData = null; // Store the current character data
    let editMode = false; // Track if we're in edit mode
    
    // Add edit button to modal
    const editButton = document.createElement('button');
    editButton.id = 'edit-character-btn';
    editButton.className = 'edit-character-btn';
    editButton.textContent = 'Edit Character';
    document.querySelector('.character-sheet-header').appendChild(editButton);
    
    // Add save button to modal (initially hidden)
    const saveButton = document.createElement('button');
    saveButton.id = 'save-character-btn';
    saveButton.className = 'save-character-btn';
    saveButton.textContent = 'Save Changes';
    saveButton.style.display = 'none';
    document.querySelector('.character-sheet-header').appendChild(saveButton);
    
    // Edit button click handler
    editButton.addEventListener('click', function() {
        toggleEditMode(true);
    });
    
    // Save button click handler
    saveButton.addEventListener('click', function() {
        saveCharacterChanges();
        toggleEditMode(false);
    });
    
    // Function to toggle edit mode
    function toggleEditMode(enable) {
        editMode = enable;
        
        // Toggle button visibility
        editButton.style.display = enable ? 'none' : 'block';
        saveButton.style.display = enable ? 'block' : 'none';
        
        // Get all editable fields
        const editableFields = document.querySelectorAll('.editable');
        
        if (enable) {
            // Make fields editable
            editableFields.forEach(field => {
                const value = field.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.className = 'edit-input';
                input.dataset.originalValue = value;
                field.textContent = '';
                field.appendChild(input);
            });
            
            // Make stat values editable
            document.querySelectorAll('.ability-value, .combat-stat-value').forEach(stat => {
                if (!stat.querySelector('input')) {
                    const value = stat.textContent;
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.value = value;
                    input.className = 'edit-input stat-input';
                    input.dataset.originalValue = value;
                    stat.textContent = '';
                    stat.appendChild(input);
                }
            });
            
            // Make lists editable
            makeListsEditable(true);
            
        } else {
            // Restore non-edit mode
            editableFields.forEach(field => {
                const input = field.querySelector('input');
                if (input) {
                    field.textContent = input.value;
                }
            });
            
            // Restore stat values
            document.querySelectorAll('.ability-value, .combat-stat-value').forEach(stat => {
                const input = stat.querySelector('input');
                if (input) {
                    stat.textContent = input.value;
                }
            });
            
            // Restore lists
            makeListsEditable(false);
            
            // Update character data object with new values
            updateCharacterDataFromUI();
        }
    }
    
    // Function to make lists editable
    function makeListsEditable(enable) {
        // Features
        const featuresList = document.getElementById('modal-features');
        if (enable) {
            const features = Array.from(featuresList.querySelectorAll('.feature')).map(feature => {
                return {
                    name: feature.querySelector('h4').textContent,
                    description: feature.querySelector('p').textContent
                };
            });
            
            featuresList.innerHTML = '';
            features.forEach((feature, index) => {
                const div = document.createElement('div');
                div.className = 'feature editable-item';
                div.innerHTML = `
                    <input type="text" class="edit-input feature-name" value="${feature.name}">
                    <textarea class="edit-input feature-description">${feature.description}</textarea>
                    <button class="remove-item" data-index="${index}">Remove</button>
                `;
                featuresList.appendChild(div);
            });
            
            // Add button to add new feature
            const addButton = document.createElement('button');
            addButton.className = 'add-item';
            addButton.textContent = 'Add Feature';
            addButton.addEventListener('click', function() {
                const div = document.createElement('div');
                div.className = 'feature editable-item';
                div.innerHTML = `
                    <input type="text" class="edit-input feature-name" value="New Feature">
                    <textarea class="edit-input feature-description">Description here</textarea>
                    <button class="remove-item">Remove</button>
                `;
                featuresList.appendChild(div);
            });
            featuresList.appendChild(addButton);
            
            // Add event listeners to remove buttons
            featuresList.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', function() {
                    this.closest('.editable-item').remove();
                });
            });
            
        } else {
            // Convert back to non-editable
            const features = Array.from(featuresList.querySelectorAll('.editable-item')).map(feature => {
                return {
                    name: feature.querySelector('.feature-name').value,
                    description: feature.querySelector('.feature-description').value
                };
            });
            
            featuresList.innerHTML = '';
            features.forEach(feature => {
                const div = document.createElement('div');
                div.className = 'feature';
                div.innerHTML = `
                    <h4>${feature.name}</h4>
                    <p>${feature.description}</p>
                `;
                featuresList.appendChild(div);
            });
        }
        
        // Similar functions for inventory, spells, etc.
        // For brevity, I'm only showing features, but you would repeat this pattern
    }
    
    // Function to update character data from UI
    function updateCharacterDataFromUI() {
        if (!currentCharacterData) return;
        
        // Update basic info
        currentCharacterData.name = document.getElementById('modal-character-name').textContent;
        currentCharacterData.subtitle = document.getElementById('modal-character-subtitle').textContent;
        currentCharacterData.playerName = document.getElementById('modal-player-name').textContent;
        currentCharacterData.campaignName = document.getElementById('modal-campaign-name').textContent;
        
        // Update ability scores
        currentCharacterData.stats.str = parseInt(document.getElementById('modal-str').textContent);
        currentCharacterData.stats.dex = parseInt(document.getElementById('modal-dex').textContent);
        currentCharacterData.stats.con = parseInt(document.getElementById('modal-con').textContent);
        currentCharacterData.stats.int = parseInt(document.getElementById('modal-int').textContent);
        currentCharacterData.stats.wis = parseInt(document.getElementById('modal-wis').textContent);
        currentCharacterData.stats.cha = parseInt(document.getElementById('modal-cha').textContent);
        
        // Recalculate modifiers
        for (const [stat, value] of Object.entries(currentCharacterData.stats)) {
            currentCharacterData.modifiers[stat] = Math.floor((value - 10) / 2);
        }
        
        // Update combat stats
        const hpText = document.getElementById('modal-hp').textContent;
        const [current, max] = hpText.split('/').map(val => parseInt(val.trim()));
        currentCharacterData.hp.current = current;
        currentCharacterData.hp.max = max;
        
        currentCharacterData.ac = parseInt(document.getElementById('modal-ac').textContent);
        currentCharacterData.initiative = parseInt(document.getElementById('modal-initiative').textContent.replace('+', ''));
        currentCharacterData.speed = document.getElementById('modal-speed').textContent;
        
        // Update features
        currentCharacterData.features = Array.from(document.querySelectorAll('#modal-features .feature')).map(feature => {
            return {
                name: feature.querySelector('h4').textContent,
                description: feature.querySelector('p').textContent
            };
        });
        
        // Update character card with new data
        updateCharacterCard(currentCharacterData);
        
        // In a real application, you would save this data to a database or localStorage
        saveCharacterToStorage(currentCharacterData);
    }
    
    // Function to save character to localStorage
    function saveCharacterToStorage(characterData) {
        // Get existing characters or initialize empty array
        let characters = JSON.parse(localStorage.getItem('dndCharacters') || '[]');
        
        // Find if character already exists
        const index = characters.findIndex(char => char.name === characterData.name);
        
        if (index !== -1) {
            // Update existing character
            characters[index] = characterData;
        } else {
            // Add new character
            characters.push(characterData);
        }
        
        // Save back to localStorage
        localStorage.setItem('dndCharacters', JSON.stringify(characters));
    }
    
    // Function to update character card with new data
    function updateCharacterCard(characterData) {
        // Find the character card that matches this character
        const cards = document.querySelectorAll('.character-card');
        let matchingCard = null;
        
        cards.forEach(card => {
            const cardName = card.querySelector('h3').textContent;
            if (cardName === characterData.name) {
                matchingCard = card;
            }
        });
        
        if (matchingCard) {
            // Update card with new data
            matchingCard.querySelector('h3').textContent = characterData.name;
            matchingCard.querySelector('.character-subtitle').textContent = characterData.subtitle;
            matchingCard.querySelector('.character-details p:nth-child(1)').textContent = `Player: ${characterData.playerName}`;
            matchingCard.querySelector('.character-details p:nth-child(2)').textContent = `Campaign: ${characterData.campaignName}`;
            
            // Update stats
            const statElements = matchingCard.querySelectorAll('.stat');
            statElements.forEach(stat => {
                const statName = stat.querySelector('.stat-name').textContent.toLowerCase();
                stat.querySelector('.stat-value').textContent = characterData.stats[statName];
            });
        }
    }
    
    // Function to save all character changes
    function saveCharacterChanges() {
        // This would typically involve an API call or localStorage update
        alert('Character changes saved successfully!');
    }
    
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
                openCharacterSheet(characterName, this);
            }
        });
    });
    
    // Make the character cards look more interactive
    const viewMoreLinks = document.querySelectorAll('.view-more');
    viewMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const characterCard = this.closest('.character-card');
            const characterName = characterCard.querySelector('h3').textContent;
            openCharacterSheet(characterName, characterCard);
        });
    });
    
    // Close modal when clicking the X
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Tab switching functionality for character sheet
    const sheetTabButtons = document.querySelectorAll('.sheet-tab-btn');
    const sheetTabContents = document.querySelectorAll('.sheet-tab-content');
    
    sheetTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            sheetTabButtons.forEach(btn => btn.classList.remove('active'));
            sheetTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Function to open character sheet modal and load data
    function openCharacterSheet(characterName, characterCard) {
        // Display the modal
        modal.style.display = 'block';
        
        // Get character data
        currentCharacterData = getCharacterData(characterName, characterCard);
        
        // Populate the modal with character data
        populateCharacterSheet(currentCharacterData);
    }
    
    // Function to get character data from the card or a database/API
    function getCharacterData(characterName, characterCard) {
        // First check if we have this character in localStorage
        const savedCharacters = JSON.parse(localStorage.getItem('dndCharacters') || '[]');
        const savedCharacter = savedCharacters.find(char => char.name === characterName);
        
        if (savedCharacter) {
            return savedCharacter;
        }
        
        // If not in localStorage, extract from card and add mock data
        const characterClass = characterCard.querySelector('.character-subtitle').textContent.split(',')[0];
        const playerName = characterCard.querySelector('.character-details p:nth-child(1)').textContent.split(':')[1].trim();
        const campaignName = characterCard.querySelector('.character-details p:nth-child(2)').textContent.split(':')[1].trim();
        const background = characterCard.querySelector('.character-details p:nth-child(3)').textContent.split(':')[1].trim();
        const portraitSrc = characterCard.querySelector('.character-portrait img').src;
        
        // Get ability scores
        const stats = {};
        const statElements = characterCard.querySelectorAll('.stat');
        statElements.forEach(stat => {
            const statName = stat.querySelector('.stat-name').textContent.toLowerCase();
            const statValue = parseInt(stat.querySelector('.stat-value').textContent);
            stats[statName] = statValue;
        });
        
        // Calculate ability modifiers
        const modifiers = {};
        for (const [stat, value] of Object.entries(stats)) {
            modifiers[stat] = Math.floor((value - 10) / 2);
        }
        
        // Mock data for the rest of the character sheet
        return {
            name: characterName,
            subtitle: characterCard.querySelector('.character-subtitle').textContent,
            playerName: playerName,
            campaignName: campaignName,
            background: background,
            portraitSrc: portraitSrc,
            stats: stats,
            modifiers: modifiers,
            hp: {
                current: 45,
                max: 45
            },
            ac: 16,
            initiative: modifiers.dex,
            speed: '30 ft',
            savingThrows: [
                { name: 'Strength', modifier: modifiers.str, proficient: false },
                { name: 'Dexterity', modifier: modifiers.dex, proficient: false },
                { name: 'Constitution', modifier: modifiers.con, proficient: true },
                { name: 'Intelligence', modifier: modifiers.int, proficient: false },
                { name: 'Wisdom', modifier: modifiers.wis, proficient: false },
                { name: 'Charisma', modifier: modifiers.cha, proficient: true }
            ],
            skills: [
                { name: 'Acrobatics', ability: 'DEX', modifier: modifiers.dex, proficient: false },
                { name: 'Animal Handling', ability: 'WIS', modifier: modifiers.wis, proficient: false },
                { name: 'Arcana', ability: 'INT', modifier: modifiers.int, proficient: true },
                { name: 'Athletics', ability: 'STR', modifier: modifiers.str, proficient: false },
                { name: 'Deception', ability: 'CHA', modifier: modifiers.cha, proficient: false },
                { name: 'History', ability: 'INT', modifier: modifiers.int, proficient: true },
                { name: 'Insight', ability: 'WIS', modifier: modifiers.wis, proficient: false },
                { name: 'Intimidation', ability: 'CHA', modifier: modifiers.cha, proficient: false },
                { name: 'Investigation', ability: 'INT', modifier: modifiers.int, proficient: false },
                { name: 'Medicine', ability: 'WIS', modifier: modifiers.wis, proficient: false },
                { name: 'Nature', ability: 'INT', modifier: modifiers.int, proficient: false },
                { name: 'Perception', ability: 'WIS', modifier: modifiers.wis, proficient: true },
                { name: 'Performance', ability: 'CHA', modifier: modifiers.cha, proficient: false },
                { name: 'Persuasion', ability: 'CHA', modifier: modifiers.cha, proficient: true },
                { name: 'Religion', ability: 'INT', modifier: modifiers.int, proficient: false },
                { name: 'Sleight of Hand', ability: 'DEX', modifier: modifiers.dex, proficient: false },
                { name: 'Stealth', ability: 'DEX', modifier: modifiers.dex, proficient: false },
                { name: 'Survival', ability: 'WIS', modifier: modifiers.wis, proficient: false }
            ],
            features: [
                { name: 'Spellcasting', description: 'You can cast spells from the sorcerer spell list.' },
                { name: 'Font of Magic', description: 'You have 6 sorcery points that you can spend to fuel various magical effects.' },
                { name: 'Metamagic', description: 'You can twist your spells to suit your needs. You gain two Metamagic options of your choice.' }
            ],
            currency: {
                pp: 0,
                gp: 120,
                sp: 35,
                cp: 42
            },
            weapons: [
                { name: 'Quarterstaff', attack: '+2', damage: '1d6 bludgeoning', properties: 'Versatile (1d8)' },
                { name: 'Dagger', attack: '+5', damage: '1d4+2 piercing', properties: 'Finesse, light, thrown (20/60)' }
            ],
            armor: [
                { name: 'None', ac: '13 (Dex + Mage Armor)', properties: 'Spell effect' }
            ],
            inventory: [
                'Spellcasting focus (crystal)',
                'Backpack',
                'Bedroll',
                'Mess kit',
                'Tinderbox',
                'Torch (10)',
                'Rations (10 days)',
                'Waterskin',
                'Rope, hempen (50 feet)',
                'Book of lore',
                'Ink pen',
                'Ink bottle',
                'Parchment (10 sheets)',
                'Small knife',
                'Potion of healing (2)'
            ],
            spellcasting: {
                class: characterClass.split(' ')[1] || 'Sorcerer',
                ability: 'CHA',
                saveDC: 8 + 2 + modifiers.cha, // 8 + proficiency + ability modifier
                attack: 2 + modifiers.cha // proficiency + ability modifier
            },
            spellSlots: [
                { level: 1, total: 4, used: 1 },
                { level: 2, total: 3, used: 0 },
                { level: 3, total: 3, used: 1 }
            ],
            spells: [
                { level: 0, name: 'Cantrips', spells: ['Fire Bolt', 'Light', 'Mage Hand', 'Prestidigitation', 'Ray of Frost'] },
                { level: 1, name: '1st Level', spells: ['Magic Missile', 'Shield', 'Mage Armor', 'Detect Magic'] },
                { level: 2, name: '2nd Level', spells: ['Misty Step', 'Scorching Ray', 'Invisibility'] },
                { level: 3, name: '3rd Level', spells: ['Fireball', 'Counterspell'] }
            ],
            backgroundDescription: 'As a sage, you spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you.',
            personality: 'I use polysyllabic words that convey the impression of great erudition. I\'ve read every book in the world\'s greatest libraries—or I like to boast that I have.',
            ideals: 'Knowledge. The path to power and self-improvement is through knowledge.',
            bonds: 'I work to preserve a library, university, scriptorium, or monastery.',
            flaws: 'I am easily distracted by the promise of information.',
            backstory: 'Born to humble beginnings, I discovered my magical talents at a young age. Seeking to understand these powers, I devoted myself to study, eventually finding my way to the great libraries of Candlekeep. There, I uncovered ancient texts about the nature of magic that helped me harness my innate abilities. Now I travel the world, seeking to expand my knowledge and magical prowess.',
            connections: [
                { name: 'Elminster', relationship: 'Mentor', description: 'The famous wizard has taken an interest in my development.' },
                { name: 'The Harpers', relationship: 'Ally', description: 'I occasionally provide information to this secret organization.' }
            ],
            adventureNotes: [
                { date: 'Hammer 15, 1491 DR', note: 'Arrived in Phandalin, met with Gundren Rockseeker who hired us to escort supplies.' },
                { date: 'Hammer 17, 1491 DR', note: 'Found Gundren\'s ambushed campsite. Tracked goblins to their hideout.' },
                { date: 'Hammer 20, 1491 DR', note: 'Cleared Cragmaw Hideout, rescued Sildar Hallwinter.' }
            ],
            characterDevelopment: [
                { milestone: 'First kill', description: 'Defeated the bugbear Klarg, felt the rush of combat magic for the first time.' },
                { milestone: 'New spell', description: 'Learned Fireball after studying an ancient tome found in Wave Echo Cave.' }
            ],
            dmNotes: [
                { title: 'Secret Lineage', note: 'Player doesn\'t know yet, but their character is descended from a powerful sorcerer bloodline tied to the main campaign villain.' },
                { title: 'Future Plot Hook', note: 'Consider having an agent of the Arcane Brotherhood approach this character with an offer.' }
            ]
        };
    }
    
    // Function to populate the character sheet modal with data
    function populateCharacterSheet(data) {
        // Basic info
        document.getElementById('modal-character-portrait').src = data.portraitSrc;
        document.getElementById('modal-character-name').textContent = data.name;
        document.getElementById('modal-character-subtitle').textContent = data.subtitle;
        document.getElementById('modal-player-name').textContent = data.playerName;
        document.getElementById('modal-campaign-name').textContent = data.campaignName;
        
        // Ability scores and modifiers
        document.getElementById('modal-str').textContent = data.stats.str;
        document.getElementById('modal-str-mod').textContent = formatModifier(data.modifiers.str);
        document.getElementById('modal-dex').textContent = data.stats.dex;
        document.getElementById('modal-dex-mod').textContent = formatModifier(data.modifiers.dex);
        document.getElementById('modal-con').textContent = data.stats.con;
        document.getElementById('modal-con-mod').textContent = formatModifier(data.modifiers.con);
        document.getElementById('modal-int').textContent = data.stats.int;
        document.getElementById('modal-int-mod').textContent = formatModifier(data.modifiers.int);
        document.getElementById('modal-wis').textContent = data.stats.wis;
        document.getElementById('modal-wis-mod').textContent = formatModifier(data.modifiers.wis);
        document.getElementById('modal-cha').textContent = data.stats.cha;
        document.getElementById('modal-cha-mod').textContent = formatModifier(data.modifiers.cha);
        
        // Combat stats
        document.getElementById('modal-hp').textContent = `${data.hp.current}/${data.hp.max}`;
        document.getElementById('modal-ac').textContent = data.ac;
        document.getElementById('modal-initiative').textContent = formatModifier(data.initiative);
        document.getElementById('modal-speed').textContent = data.speed;
        
        // Saving throws
        const savingThrowsList = document.getElementById('modal-saving-throws');
        savingThrowsList.innerHTML = '';
        data.savingThrows.forEach(save => {
            const li = document.createElement('li');
            li.className = save.proficient ? 'proficient' : '';
            li.innerHTML = `${save.name} <span class="modifier">${formatModifier(save.modifier + (save.proficient ? 2 : 0))}</span>`;
            savingThrowsList.appendChild(li);
        });
        
        // Skills
        const skillsList = document.getElementById('modal-skills');
        skillsList.innerHTML = '';
        data.skills.forEach(skill => {
            const li = document.createElement('li');
            li.className = skill.proficient ? 'proficient' : '';
            li.innerHTML = `${skill.name} (${skill.ability}) <span class="modifier">${formatModifier(skill.modifier + (skill.proficient ? 2 : 0))}</span>`;
            skillsList.appendChild(li);
        });
        
        // Features
        const featuresList = document.getElementById('modal-features');
        featuresList.innerHTML = '';
        data.features.forEach(feature => {
            const div = document.createElement('div');
            div.className = 'feature';
            div.innerHTML = `
                <h4>${feature.name}</h4>
                <p>${feature.description}</p>
            `;
            featuresList.appendChild(div);
        });
        
        // Currency
        document.getElementById('modal-pp').textContent = data.currency.pp;
        document.getElementById('modal-gp').textContent = data.currency.gp;
        document.getElementById('modal-sp').textContent = data.currency.sp;
        document.getElementById('modal-cp').textContent = data.currency.cp;
        
        // Weapons
        const weaponsList = document.getElementById('modal-weapons');
        weaponsList.innerHTML = '';
        data.weapons.forEach(weapon => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${weapon.name}</td>
                <td>${weapon.attack}</td>
                <td>${weapon.damage}</td>
                <td>${weapon.properties}</td>
            `;
            weaponsList.appendChild(tr);
        });
        
        // Armor
        const armorList = document.getElementById('modal-armor');
        armorList.innerHTML = '';
        data.armor.forEach(armor => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${armor.name}</td>
                <td>${armor.ac}</td>
                <td>${armor.properties}</td>
            `;
            armorList.appendChild(tr);
        });
        
        // Inventory
        const inventoryList = document.getElementById('modal-inventory');
        inventoryList.innerHTML = '';
        data.inventory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            inventoryList.appendChild(li);
        });
        
        // Spellcasting
        document.getElementById('modal-spellcasting-class').textContent = data.spellcasting.class;
        document.getElementById('modal-spellcasting-ability').textContent = data.spellcasting.ability;
        document.getElementById('modal-spell-save-dc').textContent = data.spellcasting.saveDC;
        document.getElementById('modal-spell-attack').textContent = formatModifier(data.spellcasting.attack);
        
        // Spell slots
        const spellSlotsList = document.getElementById('modal-spell-slots');
        spellSlotsList.innerHTML = '';
        data.spellSlots.forEach(slot => {
            const div = document.createElement('div');
            div.className = 'spell-slot-level';
            
            let slotHtml = `<div class="spell-slot-header">Level ${slot.level}</div><div class="spell-slot-bubbles">`;
            
            for (let i = 0; i < slot.total; i++) {
                const isUsed = i < slot.used;
                slotHtml += `<span class="spell-slot-bubble ${isUsed ? 'used' : ''}"></span>`;
            }
            
            slotHtml += `</div>`;
            div.innerHTML = slotHtml;
            spellSlotsList.appendChild(div);
        });
        
        // Spells
        const spellsList = document.getElementById('modal-spells');
        spellsList.innerHTML = '';
        data.spells.forEach(level => {
            const levelDiv = document.createElement('div');
            levelDiv.className = 'spell-level';
            levelDiv.innerHTML = `
                <h5>${level.level === 0 ? 'Cantrips' : level.level + 'th Level'}</h5>
                <ul class="spell-list">
                    ${level.spells.map(spell => `<li>${spell}</li>`).join('')}
                </ul>
            `;
            spellsList.appendChild(levelDiv);
        });
        
        // Background tab
        document.getElementById('modal-background-description').textContent = data.backgroundDescription;
        document.getElementById('modal-personality').textContent = data.personality;
        document.getElementById('modal-ideals').textContent = data.ideals;
        document.getElementById('modal-bonds').textContent = data.bonds;
        document.getElementById('modal-flaws').textContent = data.flaws;
        document.getElementById('modal-backstory').textContent = data.backstory;
        
        // Connections
        const connectionsDiv = document.getElementById('modal-connections');
        connectionsDiv.innerHTML = '';
        data.connections.forEach(connection => {
            const div = document.createElement('div');
            div.className = 'connection';
            div.innerHTML = `
                <h4>${connection.name} <span class="relationship">(${connection.relationship})</span></h4>
                <p>${connection.description}</p>
            `;
            connectionsDiv.appendChild(div);
        });
        
        // Notes tab
        // Adventure notes
        const adventureNotesDiv = document.getElementById('modal-adventure-notes');
        adventureNotesDiv.innerHTML = '';
        data.adventureNotes.forEach(note => {
            const div = document.createElement('div');
            div.className = 'note';
            div.innerHTML = `
                <div class="note-date">${note.date}</div>
                <div class="note-text">${note.note}</div>
            `;
            adventureNotesDiv.appendChild(div);
        });
        
        // Character development
        const characterDevelopmentDiv = document.getElementById('modal-character-development');
        characterDevelopmentDiv.innerHTML = '';
        data.characterDevelopment.forEach(milestone => {
            const div = document.createElement('div');
            div.className = 'milestone';
            div.innerHTML = `
                <h4>${milestone.milestone}</h4>
                <p>${milestone.description}</p>
            `;
            characterDevelopmentDiv.appendChild(div);
        });
        
        // DM notes
        const dmNotesDiv = document.getElementById('modal-dm-notes');
        dmNotesDiv.innerHTML = '';
        data.dmNotes.forEach(note => {
            const div = document.createElement('div');
            div.className = 'dm-note';
            div.innerHTML = `
                <h4>${note.title}</h4>
                <p>${note.note}</p>
            `;
            dmNotesDiv.appendChild(div);
        });
        
        // Check if DM mode is active and show/hide DM-only content
        const isDmMode = localStorage.getItem('dmModeActive') === 'true' || 
                         document.cookie.includes('dmMode=active');
        
        document.querySelectorAll('.dm-only').forEach(el => {
            if (isDmMode) {
                el.classList.add('visible');
            } else {
                el.classList.remove('visible');
            }
        });
        
        // Make certain fields editable
        document.getElementById('modal-character-name').className = 'editable';
        document.getElementById('modal-character-subtitle').className = 'editable';
        document.getElementById('modal-player-name').className = 'editable';
        document.getElementById('modal-campaign-name').className = 'editable';
        document.getElementById('modal-background-description').className = 'editable';
        document.getElementById('modal-personality').className = 'editable';
        document.getElementById('modal-ideals').className = 'editable';
        document.getElementById('modal-bonds').className = 'editable';
        document.getElementById('modal-flaws').className = 'editable';
        document.getElementById('modal-backstory').className = 'editable';
    }
    
    // Function to format ability modifiers
    function formatModifier(modifier) {
        return modifier >= 0 ? `+${modifier}` : modifier;
    }
    
    // Load characters from localStorage on page load
    function loadCharactersFromStorage() {
        const savedCharacters = JSON.parse(localStorage.getItem('dndCharacters') || '[]');
        
        if (savedCharacters.length > 0) {
            console.log(`Loaded ${savedCharacters.length} characters from storage`);
        }
    }
    
    // Call this function when the page loads
    loadCharactersFromStorage();
});

