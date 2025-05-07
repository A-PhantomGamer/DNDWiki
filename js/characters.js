// Global variables
let currentCharacterData = null;
let cardToDelete = null;

// Make loadCharacters available globally
window.loadCharacters = loadCharacters;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the container for character cards
    const cardsContainer = document.querySelector('.character-cards');
    
    // Load characters from localStorage
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    
    // Clear existing content
    cardsContainer.innerHTML = '';
    
    // If no characters exist, show a message
    if (characters.length === 0) {
        cardsContainer.innerHTML = `
            <div class="empty-state">
                <p>No characters yet. Create a new character or import one to get started.</p>
            </div>
        `;
        return;
    }
    
    // Render each character as a card
    characters.forEach(char => {
        const card = `
            <div class="character-card">
                <div class="card-header">
                    <h2 class="character-name">${char.name || 'Unnamed Character'}</h2>
                    <div class="character-subtitle">${char.race || 'Unknown Race'} ${char.class || 'Unknown Class'} - Level ${char.level || 1}</div>
                </div>

                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-label">STR</div>
                        <div class="stat-value">${char.abilities?.str || 10}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">DEX</div>
                        <div class="stat-value">${char.abilities?.dex || 10}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">CON</div>
                        <div class="stat-value">${char.abilities?.con || 10}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">INT</div>
                        <div class="stat-value">${char.abilities?.int || 10}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">WIS</div>
                        <div class="stat-value">${char.abilities?.wis || 10}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">CHA</div>
                        <div class="stat-value">${char.abilities?.cha || 10}</div>
                    </div>
                </div>

                <div class="combat-stats">
                    <div class="stat-box">
                        <div class="stat-label">AC</div>
                        <div class="stat-value">${char.ac || 10}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">HP</div>
                        <div class="stat-value">${char.hp?.current || 0}/${char.hp?.max || 0}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Speed</div>
                        <div class="stat-value">${char.speed || 30}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Proficiencies</div>
                    <div class="section-content">
                        ${char.proficiencies?.skills?.join(', ') || 'None listed'}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Equipment</div>
                    <div class="section-content">
                        ${char.equipment?.gear || 'None listed'}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Features</div>
                    <div class="section-content">
                        ${char.features?.map(f => f.name).join(', ') || 'None listed'}
                    </div>
                </div>
            </div>
        `;
        cardsContainer.insertAdjacentHTML('beforeend', card);
    });

    // Add click handler to open character sheet
    document.querySelectorAll('.character-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            openCharacterSheet(characters[index].id);
        });
    });
});

// Load characters from localStorage and display them
function loadCharacters() {
    console.log('Loading characters...');
    
    // Try multiple selectors to find the character container
    const charactersContainer = document.getElementById('character-grid') || 
                               document.querySelector('.character-grid') ||
                               document.getElementById('characters-container');
    
    if (!charactersContainer) {
        console.error('Characters container not found! Searched for #character-grid, .character-grid, and #characters-container');
        // List all elements with IDs for debugging
        const allElements = document.querySelectorAll('[id]');
        console.log('All elements with IDs:', Array.from(allElements).map(el => el.id));
        return;
    }
    
    console.log('Found characters container:', charactersContainer);
    
    // Clear existing cards
    charactersContainer.innerHTML = '';
    
    // Get characters from localStorage
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    console.log('Characters loaded from localStorage:', characters);
    
    if (characters.length === 0) {
        charactersContainer.innerHTML = `
            <div class="empty-state">
                <p>No characters found. Import or create a new character to get started!</p>
            </div>
        `;
        return;
    }
    
    // Create character cards
    characters.forEach(character => {
        try {
            const card = createCharacterCard(character);
            charactersContainer.appendChild(card);
            console.log('Added card for character:', character.name);
        } catch (error) {
            console.error('Error creating card for character:', character, error);
        }
    });
    
    console.log('Finished loading characters. Container now has', charactersContainer.children.length, 'children');
}

// Add this after your loadCharacters() function to debug
function debugCharacters() {
    const characters = JSON.parse(localStorage.getItem('characters') || '[]');
    console.log('Characters in localStorage:', characters);
    
    const container = document.getElementById('characters-container');
    console.log('Container element:', container);
    
    // Comment out the test character creation
    /*
    // Add a test character if none exist
    if (characters.length === 0) {
        const testCharacter = {
            id: generateId(),
            name: 'Test Character',
            image: 'img/default-character.png'
        };
        addCharacter(testCharacter);
        console.log('Added test character');
        loadCharacters();
    }
    */
}

// Create a character card element
function createCharacterCard(character) {
    return `
        <div class="character-card">
            <div class="card-header">
                <h2 class="character-name">${character.name}</h2>
                <div class="character-subtitle">${character.race} ${character.class} - Level ${character.level}</div>
            </div>

            <div class="stats-grid">
                ${renderAbilityScores(character.abilities)}
            </div>

            <div class="combat-stats">
                ${renderCombatStats(character)}
            </div>

            <div class="section">
                <div class="section-title">Proficiencies</div>
                <div class="section-content">
                    ${character.proficiencies || 'None listed'}
                </div>
            </div>

            <div class="section">
                <div class="section-title">Equipment</div>
                <div class="section-content">
                    ${character.equipment || 'None listed'}
                </div>
            </div>

            <div class="section">
                <div class="section-title">Features</div>
                <div class="section-content">
                    ${character.features || 'None listed'}
                </div>
            </div>
        </div>
    `;
}

// Helper functions for rendering card sections
function renderAbilityScores(abilities) {
    const scores = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    return scores.map(ability => `
        <div class="stat-box">
            <div class="stat-label">${ability.toUpperCase()}</div>
            <div class="stat-value">${abilities[ability]}</div>
        </div>
    `).join('');
}

function renderCombatStats(character) {
    return `
        <div class="stat-box">
            <div class="stat-label">AC</div>
            <div class="stat-value">${character.ac}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">HP</div>
            <div class="stat-value">${character.hp.current}/${character.hp.max}</div>
        </div>
        <div class="stat-box">
            <div class="stat-label">Speed</div>
            <div class="stat-value">${character.speed}</div>
        </div>
    `;
}

// Helper function to render skills
function renderSkills(skills) {
    const skillNames = {
        acrobatics: 'Acrobatics (Dex)',
        animalHandling: 'Animal Handling (Wis)',
        arcana: 'Arcana (Int)',
        athletics: 'Athletics (Str)',
        deception: 'Deception (Cha)',
        history: 'History (Int)',
        insight: 'Insight (Wis)',
        intimidation: 'Intimidation (Cha)',
        investigation: 'Investigation (Int)',
        medicine: 'Medicine (Wis)',
        nature: 'Nature (Int)',
        perception: 'Perception (Wis)',
        performance: 'Performance (Cha)',
        persuasion: 'Persuasion (Cha)',
        religion: 'Religion (Int)',
        sleightOfHand: 'Sleight of Hand (Dex)',
        stealth: 'Stealth (Dex)',
        survival: 'Survival (Wis)'
    };
    
    let html = '';
    for (const [key, name] of Object.entries(skillNames)) {
        const value = skills[key] || 0;
        html += `
            <div class="skill">
                <div class="skill-name">${name}</div>
                <div class="skill-value ${editMode ? 'editable-content' : ''}">${value >= 0 ? '+' : ''}${value}</div>
            </div>
        `;
    }
    return html;
}

function openCharacterSheet(characterId, editMode = false) {
    const characters = JSON.parse(localStorage.getItem('characters')) || [];
    const character = characters.find(c => c.id === characterId);
    
    if (!character) return;
    
    // Set default values for missing properties
    const char = {
        name: character.name || 'Unnamed Character',
        race: character.race || 'Unknown Race',
        class: character.class || 'Unknown Class',
        level: character.level || 1,
        background: character.background || '',
        alignment: character.alignment || '',
        experience: character.experience || '0',
        campaign: character.campaign || '',
        // Add appearance defaults
        appearance: character.appearance || {
            age: '',
            height: '',
            weight: '',
            eyes: '',
            skin: '',
            hair: '',
            description: ''
        },
        abilities: character.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        savingThrows: character.savingThrows || { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
        skills: character.skills || {},
        // Add expanded proficiencies
        proficiencies: character.proficiencies || {
            weapons: '',
            armor: '',
            tools: '',
            savingThrows: '',
            skills: ''
        },
        languages: character.languages || '',
        hp: character.hp || { current: 10, max: 10, temporary: 0 },
        ac: character.ac || 10,
        initiative: character.initiative || 0,
        speed: character.speed || '30',
        hitDice: character.hitDice || `${character.level || 1}d8`,
        // Add expanded equipment
        equipment: character.equipment || {
            weapons: [],
            armor: [],
            gear: '',
            treasure: '',
            magicItems: []
        },
        // Add background details
        backgroundDetails: character.backgroundDetails || {
            backstory: '',
            allies: '',
            enemies: '',
            organizations: '',
            additionalFeatures: ''
        },
        personalityTraits: character.personalityTraits || '',
        ideals: character.ideals || '',
        bonds: character.bonds || '',
        flaws: character.flaws || '',
        features: character.features || [],
        // Add spellcasting with spell slots
        spellcasting: character.spellcasting || {
            ability: '',
            saveDC: 0,
            attackBonus: 0,
            spellSlots: {
                level1: { total: 0, used: 0 },
                level2: { total: 0, used: 0 },
                level3: { total: 0, used: 0 },
                level4: { total: 0, used: 0 },
                level5: { total: 0, used: 0 },
                level6: { total: 0, used: 0 },
                level7: { total: 0, used: 0 },
                level8: { total: 0, used: 0 },
                level9: { total: 0, used: 0 }
            }
        },
        spells: character.spells || {
            cantrips: [],
            level1: [],
            level2: [],
            level3: [],
            level4: [],
            level5: [],
            level6: [],
            level7: [],
            level8: [],
            level9: []
        },
        notes: character.notes || ''
    };
    
    // Calculate ability modifiers
    const getModifier = (score) => Math.floor((score - 10) / 2);
    
    // Helper function to render equipment
    function renderEquipment(equipment) {
        if (typeof equipment === 'string') {
            return `<div class="equipment-content ${editMode ? 'editable-content' : ''}">${equipment}</div>`;
        }
        
        return `
            <div class="equipment-sections">
                <div class="equipment-section">
                    <h5>Weapons</h5>
                    <div class="equipment-list ${editMode ? 'editable-list' : ''}">
                        ${equipment.weapons && equipment.weapons.length > 0 ? 
                            equipment.weapons.map(weapon => `
                                <div class="equipment-item">
                                    <div class="item-name">${weapon.name}</div>
                                    <div class="item-properties">Damage: ${weapon.damage}, ${weapon.properties}</div>
                                </div>
                            `).join('') : 
                            '<p class="empty-message">No weapons added yet.</p>'
                        }
                        ${editMode ? '<button class="add-weapon-btn">+ Add Weapon</button>' : ''}
                    </div>
                </div>
                
                <div class="equipment-section">
                    <h5>Armor</h5>
                    <div class="equipment-list ${editMode ? 'editable-list' : ''}">
                        ${equipment.armor && equipment.armor.length > 0 ? 
                            equipment.armor.map(armor => `
                                <div class="equipment-item">
                                    <div class="item-name">${armor.name}</div>
                                    <div class="item-properties">Type: ${armor.type}, AC: ${armor.ac}, ${armor.properties}</div>
                                </div>
                            `).join('') : 
                            '<p class="empty-message">No armor added yet.</p>'
                        }
                        ${editMode ? '<button class="add-armor-btn">+ Add Armor</button>' : ''}
                    </div>
                </div>
                
                <div class="equipment-section">
                    <h5>Gear & Supplies</h5>
                    <div class="section-content ${editMode ? 'editable-content' : ''}">${equipment.gear || ''}</div>
                </div>
                
                <div class="equipment-section">
                    <h5>Treasure</h5>
                    <div class="section-content ${editMode ? 'editable-content' : ''}">${equipment.treasure || ''}</div>
                </div>
                
                <div class="equipment-section">
                    <h5>Magic Items</h5>
                    <div class="equipment-list ${editMode ? 'editable-list' : ''}">
                        ${equipment.magicItems && equipment.magicItems.length > 0 ? 
                            equipment.magicItems.map(item => `
                                <div class="equipment-item">
                                    <div class="item-name">${item.name}</div>
                                    <div class="item-properties">${item.description}</div>
                                </div>
                            `).join('') : 
                            '<p class="empty-message">No magic items added yet.</p>'
                        }
                        ${editMode ? '<button class="add-magic-item-btn">+ Add Magic Item</button>' : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Helper function to render proficiencies
    function renderProficiencies(proficiencies) {
        if (typeof proficiencies === 'string') {
            return `<div class="section-content ${editMode ? 'editable-content' : ''}">${proficiencies}</div>`;
        }
        
        return `
            <div class="proficiency-sections">
                <div class="proficiency-section">
                    <h5>Weapons</h5>
                    <div class="section-content ${editMode ? 'editable-content' : ''}">${proficiencies.weapons || ''}</div>
                </div>
                
                <div class="proficiency-section">
                    <h5>Armor</h5>
                    <div class="section-content ${editMode ? 'editable-content' : ''}">${proficiencies.armor || ''}</div>
                </div>
                
                <div class="proficiency-section">
                    <h5>Tools</h5>
                    <div class="section-content ${editMode ? 'editable-content' : ''}">${proficiencies.tools || ''}</div>
                </div>
                
                <div class="proficiency-section">
                    <h5>Saving Throws</h5>
                    <div class="section-content ${editMode ? 'editable-content' : ''}">${proficiencies.savingThrows || ''}</div>
                </div>
                
                <div class="proficiency-section">
                    <h5>Skills</h5>
                    <div class="section-content ${editMode ? 'editable-content' : ''}">${proficiencies.skills || ''}</div>
                </div>
            </div>
        `;
    }
    
    // Helper function to render spell slots
    function renderSpellSlots(spellcasting) {
        return `
            <div class="spell-slots-container">
                <div class="spell-casting-info">
                    <div class="spell-info-item">
                        <label>Spellcasting Ability</label>
                        <div class="spell-info-value ${editMode ? 'editable-content' : ''}">${spellcasting.ability || 'None'}</div>
                    </div>
                    <div class="spell-info-item">
                        <label>Spell Save DC</label>
                        <div class="spell-info-value ${editMode ? 'editable-content' : ''}">${spellcasting.saveDC || '—'}</div>
                    </div>
                    <div class="spell-info-item">
                        <label>Spell Attack Bonus</label>
                        <div class="spell-info-value ${editMode ? 'editable-content' : ''}">${spellcasting.attackBonus >= 0 ? '+' : ''}${spellcasting.attackBonus || '—'}</div>
                    </div>
                </div>
                
                <div class="spell-slots-grid">
                    ${Object.entries(spellcasting.spellSlots).map(([level, slots]) => {
                        const levelNum = level.replace('level', '');
                        return `
                            <div class="spell-slot-row">
                                <div class="spell-slot-level">Level ${levelNum}</div>
                                <div class="spell-slot-total">
                                    <label>Total</label>
                                    <div class="slot-value ${editMode ? 'editable-content' : ''}">${slots.total}</div>
                                </div>
                                <div class="spell-slot-used">
                                    <label>Used</label>
                                    <div class="slot-value ${editMode ? 'editable-content' : ''}">${slots.used}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Create modal HTML with new sections
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content character-sheet ${editMode ? 'edit-mode' : ''}">
            <span class="close-modal">&times;</span>
            <div class="character-sheet-header">
                <div class="character-header-info">
                    <h2 id="modal-character-name" class="${editMode ? 'editable-content' : ''}">${char.name}</h2>
                    <p id="modal-character-subtitle" class="${editMode ? 'editable-content' : ''}">${char.race} ${char.class}</p>
                    <div class="character-meta">
                        <p>Level: <span id="modal-character-level" class="${editMode ? 'editable-content' : ''}">${char.level}</span></p>
                        <p>Background: <span id="modal-character-background" class="${editMode ? 'editable-content' : ''}">${char.background}</span></p>
                        <p>Alignment: <span id="modal-character-alignment" class="${editMode ? 'editable-content' : ''}">${char.alignment}</span></p>
                        <p>XP: <span id="modal-character-xp" class="${editMode ? 'editable-content' : ''}">${char.experience}</span></p>
                        <p>Campaign: <span id="modal-campaign-name" class="${editMode ? 'editable-content' : ''}">${char.campaign}</span></p>
                    </div>
                </div>
            </div>
            
            <div class="sheet-tabs">
                <button class="sheet-tab active" data-tab="stats">Stats</button>
                <button class="sheet-tab" data-tab="proficiencies">Proficiencies</button>
                <button class="sheet-tab" data-tab="features">Features</button>
                <button class="sheet-tab" data-tab="equipment">Equipment</button>
                <button class="sheet-tab" data-tab="spells">Spells</button>
                <button class="sheet-tab" data-tab="background">Background</button>
                <button class="sheet-tab" data-tab="appearance">Appearance</button>
                <button class="sheet-tab" data-tab="notes">Notes</button>
            </div>
            
            <div class="sheet-tab-content active" id="stats-tab">
                <div class="stats-container">
                    <div class="ability-scores">
                        <h4>Ability Scores</h4>
                        <div class="ability-grid">
                            <div class="ability">
                                <div class="ability-name">STR</div>
                                <div class="ability-score ${editMode ? 'editable-content' : ''}">${char.abilities.str}</div>
                                <div class="ability-modifier">${getModifier(char.abilities.str) >= 0 ? '+' : ''}${getModifier(char.abilities.str)}</div>
                            </div>
                            <div class="ability">
                                <div class="ability-name">DEX</div>
                                <div class="ability-score ${editMode ? 'editable-content' : ''}">${char.abilities.dex}</div>
                                <div class="ability-modifier">${getModifier(char.abilities.dex) >= 0 ? '+' : ''}${getModifier(char.abilities.dex)}</div>
                            </div>
                            <div class="ability">
                                <div class="ability-name">CON</div>
                                <div class="ability-score ${editMode ? 'editable-content' : ''}">${char.abilities.con}</div>
                                <div class="ability-modifier">${getModifier(char.abilities.con) >= 0 ? '+' : ''}${getModifier(char.abilities.con)}</div>
                            </div>
                            <div class="ability">
                                <div class="ability-name">INT</div>
                                <div class="ability-score ${editMode ? 'editable-content' : ''}">${char.abilities.int}</div>
                                <div class="ability-modifier">${getModifier(char.abilities.int) >= 0 ? '+' : ''}${getModifier(char.abilities.int)}</div>
                            </div>
                            <div class="ability">
                                <div class="ability-name">WIS</div>
                                <div class="ability-score ${editMode ? 'editable-content' : ''}">${char.abilities.wis}</div>
                                <div class="ability-modifier">${getModifier(char.abilities.wis) >= 0 ? '+' : ''}${getModifier(char.abilities.wis)}</div>
                            </div>
                            <div class="ability">
                                <div class="ability-name">CHA</div>
                                <div class="ability-score ${editMode ? 'editable-content' : ''}">${char.abilities.cha}</div>
                                <div class="ability-modifier">${getModifier(char.abilities.cha) >= 0 ? '+' : ''}${getModifier(char.abilities.cha)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="combat-stats">
                        <h4>Combat</h4>
                        <div class="combat-grid">
                            <div class="combat-stat">
                                <div class="stat-label">Armor Class</div>
                                <div class="stat-value ${editMode ? 'editable-content' : ''}">${char.ac}</div>
                            </div>
                            <div class="combat-stat">
                                <div class="stat-label">Initiative</div>
                                <div class="stat-value ${editMode ? 'editable-content' : ''}">${char.initiative >= 0 ? '+' : ''}${char.initiative}</div>
                            </div>
                            <div class="combat-stat">
                                <div class="stat-label">Speed</div>
                                <div class="stat-value ${editMode ? 'editable-content' : ''}">${char.speed} ft</div>
                            </div>
                            <div class="combat-stat">
                                <div class="stat-label">Current HP</div>
                                <div class="stat-value ${editMode ? 'editable-content' : ''}">${char.hp.current}</div>
                            </div>
                            <div class="combat-stat">
                                <div class="stat-label">Max HP</div>
                                <div class="stat-value ${editMode ? 'editable-content' : ''}">${char.hp.max}</div>
                            </div>
                            <div class="combat-stat">
                                <div class="stat-label">Temp HP</div>
                                <div class="stat-value ${editMode ? 'editable-content' : ''}">${char.hp.temporary || 0}</div>
                            </div>
                            <div class="combat-stat">
                                <div class="stat-label">Hit Dice</div>
                                <div class="stat-value ${editMode ? 'editable-content' : ''}">${char.hitDice}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="saving-throws">
                        <h4>Saving Throws</h4>
                        <div class="saving-throws-grid">
                            <div class="save">
                                <div class="save-name">Strength</div>
                                <div class="save-value ${editMode ? 'editable-content' : ''}">${char.savingThrows.str >= 0 ? '+' : ''}${char.savingThrows.str}</div>
                            </div>
                            <div class="save">
                                <div class="save-name">Dexterity</div>
                                <div class="save-value ${editMode ? 'editable-content' : ''}">${char.savingThrows.dex >= 0 ? '+' : ''}${char.savingThrows.dex}</div>
                            </div>
                            <div class="save">
                                <div class="save-name">Constitution</div>
                                <div class="save-value ${editMode ? 'editable-content' : ''}">${char.savingThrows.con >= 0 ? '+' : ''}${char.savingThrows.con}</div>
                            </div>
                            <div class="save">
                                <div class="save-name">Intelligence</div>
                                <div class="save-value ${editMode ? 'editable-content' : ''}">${char.savingThrows.int >= 0 ? '+' : ''}${char.savingThrows.int}</div>
                            </div>
                            <div class="save">
                                <div class="save-name">Wisdom</div>
                                <div class="save-value ${editMode ? 'editable-content' : ''}">${char.savingThrows.wis >= 0 ? '+' : ''}${char.savingThrows.wis}</div>
                            </div>
                            <div class="save">
                                <div class="save-name">Charisma</div>
                                <div class="save-value ${editMode ? 'editable-content' : ''}">${char.savingThrows.cha >= 0 ? '+' : ''}${char.savingThrows.cha}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="skills">
                        <h4>Skills</h4>
                        <div class="skills-list">
                            ${renderSkills(char.skills)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sheet-tab-content" id="proficiencies-tab">
                <div class="proficiencies-container">
                    <h4>Proficiencies</h4>
                    ${renderProficiencies(char.proficiencies)}
                    
                    <div class="languages-section">
                        <h4>Languages</h4>
                        <div class="section-content ${editMode ? 'editable-content' : ''}">${char.languages}</div>
                    </div>
                </div>
            </div>
            
            <div class="sheet-tab-content" id="features-tab">
                <div class="features-container">
                    <h4>Class & Racial Features</h4>
                    <div class="features-list ${editMode ? 'editable-list' : ''}">
                        ${char.features.length > 0 ? 
                            char.features.map(feature => `
                                <div class="feature-item">
                                    <h5>${feature.name}</h5>
                                    <p>${feature.description}</p>
                                </div>
                            `).join('') : 
                            '<p class="empty-message">No features added yet.</p>'
                        }
                        ${editMode ? '<button class="add-feature-btn">+ Add Feature</button>' : ''}
                    </div>
                </div>
            </div>
            
            <div class="sheet-tab-content" id="equipment-tab">
                <div class="equipment-container">
                    <h4>Equipment & Inventory</h4>
                    ${renderEquipment(char.equipment)}
                </div>
            </div>
            
            <div class="sheet-tab-content" id="spells-tab">
                <div class="spells-container">
                    <h4>Spellcasting</h4>
                    ${renderSpellSlots(char.spellcasting)}
                    
                    <h4>Spellbook</h4>
                    <div class="spell-levels">
                        <div class="spell-level">
                            <h5>Cantrips</h5>
                            <div class="spell-list ${editMode ? 'editable-list' : ''}">
                                ${char.spells.cantrips.length > 0 ? 
                                    char.spells.cantrips.map(spell => `<div class="spell-item">${spell}</div>`).join('') : 
                                    '<p class="empty-message">No cantrips known.</p>'
                                }
                                ${editMode ? '<button class="add-spell-btn" data-level="cantrips">+ Add Cantrip</button>' : ''}
                            </div>
                        </div>
                        
                        <div class="spell-level">
                            <h5>1st Level</h5>
                            <div class="spell-list ${editMode ? 'editable-list' : ''}">
                                ${char.spells.level1.length > 0 ? 
                                    char.spells.level1.map(spell => `<div class="spell-item">${spell}</div>`).join('') : 
                                    '<p class="empty-message">No 1st level spells known.</p>'
                                }
                                ${editMode ? '<button class="add-spell-btn" data-level="level1">+ Add Spell</button>' : ''}
                            </div>
                        </div>
                        
                        <div class="spell-level">
                            <h5>2nd Level</h5>
                            <div class="spell-list ${editMode ? 'editable-list' : ''}">
                                ${char.spells.level2.length > 0 ? 
                                    char.spells.level2.map(spell => `<div class="spell-item">${spell}</div>`).join('') : 
                                    '<p class="empty-message">No 2nd level spells known.</p>'
                                }
                                ${editMode ? '<button class="add-spell-btn" data-level="level2">+ Add Spell</button>' : ''}
                            </div>
                        </div>
                        
                        <div class="spell-level">
                            <h5>3rd Level</h5>
                            <div class="spell-list ${editMode ? 'editable-list' : ''}">
                                ${char.spells.level3.length > 0 ? 
                                    char.spells.level3.map(spell => `<div class="spell-item">${spell}</div>`).join('') : 
                                    '<p class="empty-message">No 3rd level spells known.</p>'
                                }
                                ${editMode ? '<button class="add-spell-btn" data-level="level3">+ Add Spell</button>' : ''}
                            </div>
                        </div>
                        
                        <div class="spell-level">
                            <h5>4th Level</h5>
                            <div class="spell-list ${editMode ? 'editable-list' : ''}">
                                ${char.spells.level4.length > 0 ? 
                                    char.spells.level4.map(spell => `<div class="spell-item">${spell}</div>`).join('') : 
                                    '<p class="empty-message">No 4th level spells known.</p>'
                                }
                                ${editMode ? '<button class="add-spell-btn" data-level="level4">+ Add Spell</button>' : ''}
                            </div>
                        </div>
                        
                        <div class="spell-level">
                            <h5>5th Level</h5>
                            <div class="spell-list ${editMode ? 'editable-list' : ''}">
                                ${char.spells.level5.length > 0 ? 
                                    char.spells.level5.map(spell => `<div class="spell-item">${spell}</div>`).join('') : 
                                    '<p class="empty-message">No 5th level spells known.</p>'
                                }
                                ${editMode ? '<button class="add-spell-btn" data-level="level5">+ Add Spell</button>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sheet-tab-content" id="background-tab">
                <div class="background-container">
                    <h4>Character Background</h4>
                    <div class="background-sections">
                        <div class="background-section">
                            <h5>Personality Traits</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.personalityTraits || 'No personality traits defined.'}</div>
                        </div>
                        <div class="background-section">
                            <h5>Ideals</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.ideals || 'No ideals defined.'}</div>
                        </div>
                        <div class="background-section">
                            <h5>Bonds</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.bonds || 'No bonds defined.'}</div>
                        </div>
                        <div class="background-section">
                            <h5>Flaws</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.flaws || 'No flaws defined.'}</div>
                        </div>
                    </div>
                    
                    <h4>Background Details</h4>
                    <div class="background-details">
                        <div class="background-section">
                            <h5>Backstory</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.backgroundDetails.backstory || 'No backstory defined.'}</div>
                        </div>
                        <div class="background-section">
                            <h5>Allies & Organizations</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.backgroundDetails.allies || 'No allies defined.'}</div>
                        </div>
                        <div class="background-section">
                            <h5>Enemies</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.backgroundDetails.enemies || 'No enemies defined.'}</div>
                        </div>
                        <div class="background-section">
                            <h5>Organizations</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.backgroundDetails.organizations || 'No organizations defined.'}</div>
                        </div>
                        <div class="background-section">
                            <h5>Additional Features</h5>
                            <div class="section-content ${editMode ? 'editable-content' : ''}">${char.backgroundDetails.additionalFeatures || 'No additional features defined.'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="sheet-tab-content" id="appearance-tab">
                <div class="appearance-container">
                    <h4>Character Appearance</h4>
                    <div class="appearance-grid">
                        <div class="appearance-item">
                            <label>Age</label>
                            <div class="appearance-value ${editMode ? 'editable-content' : ''}">${char.appearance.age || '—'}</div>
                        </div>
                        <div class="appearance-item">
                            <label>Height</label>
                            <div class="appearance-value ${editMode ? 'editable-content' : ''}">${char.appearance.height || '—'}</div>
                        </div>
                        <div class="appearance-item">
                            <label>Weight</label>
                            <div class="appearance-value ${editMode ? 'editable-content' : ''}">${char.appearance.weight || '—'}</div>
                        </div>
                        <div class="appearance-item">
                            <label>Eyes</label>
                            <div class="appearance-value ${editMode ? 'editable-content' : ''}">${char.appearance.eyes || '—'}</div>
                        </div>
                        <div class="appearance-item">
                            <label>Skin</label>
                            <div class="appearance-value ${editMode ? 'editable-content' : ''}">${char.appearance.skin || '—'}</div>
                        </div>
                        <div class="appearance-item">
                            <label>Hair</label>
                            <div class="appearance-value ${editMode ? 'editable-content' : ''}">${char.appearance.hair || '—'}</div>
                        </div>
                    </div>
                    
                    <div class="appearance-description">
                        <h5>Description</h5>
                        <div class="section-content ${editMode ? 'editable-content' : ''}">${char.appearance.description || 'No description provided.'}</div>
                    </div>
                </div>
            </div>
            
            <div class="sheet-tab-content" id="notes-tab">
                <div class="notes-container">
                    <h4>Character Notes</h4>
                    <div class="notes-content ${editMode ? 'editable-content' : ''}">
                        ${char.notes || '<p class="empty-message">No notes added yet.</p>'}
                    </div>
                </div>
            </div>
            
            ${editMode ? `
                <div class="edit-controls">
                    <button class="save-changes primary-btn">Save Changes</button>
                    <button class="cancel-changes secondary-btn">Cancel</button>
                </div>
            ` : ''}
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Add event listeners for tabs
    const tabs = modal.querySelectorAll('.sheet-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            modal.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
            modal.querySelectorAll('.sheet-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            modal.querySelector(`#${tabName}-tab`).classList.add('active');
        });
    });
    
    // Close modal when clicking the X
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // If in edit mode, make content editable
    if (editMode) {
        // Make all editable content actually editable
        modal.querySelectorAll('.editable-content').forEach(el => {
            el.contentEditable = true;
        });
        
        // Add event listeners for add buttons
        const addFeatureBtn = modal.querySelector('.add-feature-btn');
        if (addFeatureBtn) {
            addFeatureBtn.addEventListener('click', () => {
                const featuresList = modal.querySelector('.features-list');
                const newFeature = document.createElement('div');
                newFeature.className = 'feature-item';
                newFeature.innerHTML = `
                    <h5 contenteditable="true">New Feature</h5>
                    <p contenteditable="true">Feature description</p>
                `;
                featuresList.insertBefore(newFeature, addFeatureBtn);
            });
        }
        
        // Add event listeners for add spell buttons
        modal.querySelectorAll('.add-spell-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const spellLevel = btn.getAttribute('data-level');
                const spellList = btn.parentElement;
                const emptyMessage = spellList.querySelector('.empty-message');
                if (emptyMessage) {
                    emptyMessage.remove();
                }
                
                const newSpell = document.createElement('div');
                newSpell.className = 'spell-item';
                newSpell.contentEditable = true;
                newSpell.textContent = 'New Spell';
                spellList.insertBefore(newSpell, btn);
            });
        });
        
        // Add event listeners for equipment buttons
        const addWeaponBtn = modal.querySelector('.add-weapon-btn');
        if (addWeaponBtn) {
            addWeaponBtn.addEventListener('click', () => {
                const weaponsList = addWeaponBtn.parentElement;
                const emptyMessage = weaponsList.querySelector('.empty-message');
                if (emptyMessage) {
                    emptyMessage.remove();
                }
                
                const newWeapon = document.createElement('div');
                newWeapon.className = 'equipment-item';
                newWeapon.innerHTML = `
                    <div class="item-name" contenteditable="true">New Weapon</div>
                    <div class="item-properties" contenteditable="true">Damage: 1d6, Properties: Light</div>
                `;
                weaponsList.insertBefore(newWeapon, addWeaponBtn);
            });
        }
        
        const addArmorBtn = modal.querySelector('.add-armor-btn');
        if (addArmorBtn) {
            addArmorBtn.addEventListener('click', () => {
                const armorList = addArmorBtn.parentElement;
                const emptyMessage = armorList.querySelector('.empty-message');
                if (emptyMessage) {
                    emptyMessage.remove();
                }
                
                const newArmor = document.createElement('div');
                newArmor.className = 'equipment-item';
                newArmor.innerHTML = `
                    <div class="item-name" contenteditable="true">New Armor</div>
                    <div class="item-properties" contenteditable="true">Type: Medium, AC: 14, Properties: None</div>
                `;
                armorList.insertBefore(newArmor, addArmorBtn);
            });
        }
        
        const addMagicItemBtn = modal.querySelector('.add-magic-item-btn');
        if (addMagicItemBtn) {
            addMagicItemBtn.addEventListener('click', () => {
                const magicItemsList = addMagicItemBtn.parentElement;
                const emptyMessage = magicItemsList.querySelector('.empty-message');
                if (emptyMessage) {
                    emptyMessage.remove();
                }
                
                const newMagicItem = document.createElement('div');
                newMagicItem.className = 'equipment-item';
                newMagicItem.innerHTML = `
                    <div class="item-name" contenteditable="true">New Magic Item</div>
                    <div class="item-properties" contenteditable="true">A magical item with special properties.</div>
                `;
                magicItemsList.insertBefore(newMagicItem, addMagicItemBtn);
            });
        }
        
        // Save changes button
        const saveBtn = modal.querySelector('.save-changes');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Get all editable content
                const updatedChar = {
                    ...character,
                    name: modal.querySelector('#modal-character-name').textContent,
                    race: modal.querySelector('#modal-character-subtitle').textContent.split(' ')[0],
                    class: modal.querySelector('#modal-character-subtitle').textContent.split(' ')[1],
                    level: parseInt(modal.querySelector('#modal-character-level').textContent),
                    background: modal.querySelector('#modal-character-background').textContent,
                    alignment: modal.querySelector('#modal-character-alignment').textContent,
                    experience: modal.querySelector('#modal-character-xp').textContent,
                    campaign: modal.querySelector('#modal-campaign-name').textContent,
                    
                    // Update appearance
                    appearance: {
                        age: modal.querySelector('#appearance-tab .appearance-item:nth-child(1) .appearance-value').textContent,
                        height: modal.querySelector('#appearance-tab .appearance-item:nth-child(2) .appearance-value').textContent,
                        weight: modal.querySelector('#appearance-tab .appearance-item:nth-child(3) .appearance-value').textContent,
                        eyes: modal.querySelector('#appearance-tab .appearance-item:nth-child(4) .appearance-value').textContent,
                        skin: modal.querySelector('#appearance-tab .appearance-item:nth-child(5) .appearance-value').textContent,
                        hair: modal.querySelector('#appearance-tab .appearance-item:nth-child(6) .appearance-value').textContent,
                        description: modal.querySelector('#appearance-tab .appearance-description .section-content').textContent
                    },
                    
                    // Update abilities
                    abilities: {
                        str: parseInt(modal.querySelector('.ability:nth-child(1) .ability-score').textContent),
                        dex: parseInt(modal.querySelector('.ability:nth-child(2) .ability-score').textContent),
                        con: parseInt(modal.querySelector('.ability:nth-child(3) .ability-score').textContent),
                        int: parseInt(modal.querySelector('.ability:nth-child(4) .ability-score').textContent),
                        wis: parseInt(modal.querySelector('.ability:nth-child(5) .ability-score').textContent),
                        cha: parseInt(modal.querySelector('.ability:nth-child(6) .ability-score').textContent)
                    },
                    
                    // Update saving throws
                    savingThrows: {
                        str: parseInt(modal.querySelector('.save:nth-child(1) .save-value').textContent),
                        dex: parseInt(modal.querySelector('.save:nth-child(2) .save-value').textContent),
                        con: parseInt(modal.querySelector('.save:nth-child(3) .save-value').textContent),
                        int: parseInt(modal.querySelector('.save:nth-child(4) .save-value').textContent),
                        wis: parseInt(modal.querySelector('.save:nth-child(5) .save-value').textContent),
                        cha: parseInt(modal.querySelector('.save:nth-child(6) .save-value').textContent)
                    },
                    
                    // Update proficiencies
                    proficiencies: {
                        weapons: modal.querySelector('#proficiencies-tab .proficiency-section:nth-child(1) .section-content').textContent,
                        armor: modal.querySelector('#proficiencies-tab .proficiency-section:nth-child(2) .section-content').textContent,
                        tools: modal.querySelector('#proficiencies-tab .proficiency-section:nth-child(3) .section-content').textContent,
                        savingThrows: modal.querySelector('#proficiencies-tab .proficiency-section:nth-child(4) .section-content').textContent,
                        skills: modal.querySelector('#proficiencies-tab .proficiency-section:nth-child(5) .section-content').textContent
                    },
                    
                    // Update languages
                    languages: modal.querySelector('#proficiencies-tab .languages-section .section-content').textContent,
                    
                    // Update combat stats
                    hp: {
                        current: parseInt(modal.querySelector('.combat-stat:nth-child(4) .stat-value').textContent),
                        max: parseInt(modal.querySelector('.combat-stat:nth-child(5) .stat-value').textContent),
                        temporary: parseInt(modal.querySelector('.combat-stat:nth-child(6) .stat-value').textContent) || 0
                    },
                    ac: parseInt(modal.querySelector('.combat-stat:nth-child(1) .stat-value').textContent),
                    initiative: parseInt(modal.querySelector('.combat-stat:nth-child(2) .stat-value').textContent),
                    speed: modal.querySelector('.combat-stat:nth-child(3) .stat-value').textContent.replace(' ft', ''),
                    hitDice: modal.querySelector('.combat-stat:nth-child(7) .stat-value').textContent,
                    
                    // Update background details
                    personalityTraits: modal.querySelector('#background-tab .background-section:nth-child(1) .section-content').textContent,
                    ideals: modal.querySelector('#background-tab .background-section:nth-child(2) .section-content').textContent,
                    bonds: modal.querySelector('#background-tab .background-section:nth-child(3) .section-content').textContent,
                    flaws: modal.querySelector('#background-tab .background-section:nth-child(4) .section-content').textContent,
                    
                    backgroundDetails: {
                        backstory: modal.querySelector('#background-tab .background-details .background-section:nth-child(1) .section-content').textContent,
                        allies: modal.querySelector('#background-tab .background-details .background-section:nth-child(2) .section-content').textContent,
                        enemies: modal.querySelector('#background-tab .background-details .background-section:nth-child(3) .section-content').textContent,
                        organizations: modal.querySelector('#background-tab .background-details .background-section:nth-child(4) .section-content').textContent,
                        additionalFeatures: modal.querySelector('#background-tab .background-details .background-section:nth-child(5) .section-content').textContent
                    },
                    
                    // Update notes
                    notes: modal.querySelector('#notes-tab .notes-content').innerHTML,
                    
                    // Update features
                    features: Array.from(modal.querySelectorAll('#features-tab .feature-item')).map(item => ({
                        name: item.querySelector('h5').textContent,
                        description: item.querySelector('p').textContent
                    })),
                    
                    // Update equipment
                    equipment: {
                        weapons: Array.from(modal.querySelectorAll('#equipment-tab .equipment-section:nth-child(1) .equipment-item')).map(item => ({
                            name: item.querySelector('.item-name').textContent,
                            damage: item.querySelector('.item-properties').textContent.split(',')[0].replace('Damage:', '').trim(),
                            properties: item.querySelector('.item-properties').textContent.split(',').slice(1).join(',').trim()
                        })),
                        armor: Array.from(modal.querySelectorAll('#equipment-tab .equipment-section:nth-child(2) .equipment-item')).map(item => ({
                            name: item.querySelector('.item-name').textContent,
                            type: item.querySelector('.item-properties').textContent.split(',')[0].replace('Type:', '').trim(),
                            ac: item.querySelector('.item-properties').textContent.split(',')[1].replace('AC:', '').trim(),
                            properties: item.querySelector('.item-properties').textContent.split(',').slice(2).join(',').trim()
                        })),
                        gear: modal.querySelector('#equipment-tab .equipment-section:nth-child(3) .section-content').textContent,
                        treasure: modal.querySelector('#equipment-tab .equipment-section:nth-child(4) .section-content').textContent,
                        magicItems: Array.from(modal.querySelectorAll('#equipment-tab .equipment-section:nth-child(5) .equipment-item')).map(item => ({
                            name: item.querySelector('.item-name').textContent,
                            description: item.querySelector('.item-properties').textContent
                        }))
                    },
                    
                    // Update spellcasting
                    spellcasting: {
                        ability: modal.querySelector('#spells-tab .spell-info-item:nth-child(1) .spell-info-value').textContent,
                        saveDC: parseInt(modal.querySelector('#spells-tab .spell-info-item:nth-child(2) .spell-info-value').textContent) || 0,
                        attackBonus: parseInt(modal.querySelector('#spells-tab .spell-info-item:nth-child(3) .spell-info-value').textContent) || 0,
                        spellSlots: {
                            level1: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(1) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(1) .spell-slot-used .slot-value').textContent) || 0
                            },
                            level2: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(2) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(2) .spell-slot-used .slot-value').textContent) || 0
                            },
                            level3: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(3) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(3) .spell-slot-used .slot-value').textContent) || 0
                            },
                            level4: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(4) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(4) .spell-slot-used .slot-value').textContent) || 0
                            },
                            level5: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(5) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(5) .spell-slot-used .slot-value').textContent) || 0
                            },
                            level6: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(6) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(6) .spell-slot-used .slot-value').textContent) || 0
                            },
                            level7: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(7) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(7) .spell-slot-used .slot-value').textContent) || 0
                            },
                            level8: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(8) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(8) .spell-slot-used .slot-value').textContent) || 0
                            },
                            level9: {
                                total: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(9) .spell-slot-total .slot-value').textContent) || 0,
                                used: parseInt(modal.querySelector('#spells-tab .spell-slot-row:nth-child(9) .spell-slot-used .slot-value').textContent) || 0
                            }
                        }
                    },
                    
                    // Update spells
                    spells: {
                        cantrips: Array.from(modal.querySelectorAll('#spells-tab .spell-level:nth-child(1) .spell-item')).map(item => item.textContent),
                        level1: Array.from(modal.querySelectorAll('#spells-tab .spell-level:nth-child(2) .spell-item')).map(item => item.textContent),
                        level2: Array.from(modal.querySelectorAll('#spells-tab .spell-level:nth-child(3) .spell-item')).map(item => item.textContent),
                        level3: Array.from(modal.querySelectorAll('#spells-tab .spell-level:nth-child(4) .spell-item')).map(item => item.textContent),
                        level4: Array.from(modal.querySelectorAll('#spells-tab .spell-level:nth-child(5) .spell-item')).map(item => item.textContent),
                        level5: Array.from(modal.querySelectorAll('#spells-tab .spell-level:nth-child(6) .spell-item')).map(item => item.textContent),
                        level6: [],
                        level7: [],
                        level8: [],
                        level9: []
                    }
                };
                
                // Update character in localStorage
                const characters = JSON.parse(localStorage.getItem('characters')) || [];
                const index = characters.findIndex(c => c.id === character.id);
                if (index !== -1) {
                    characters[index] = updatedChar;
                    localStorage.setItem('characters', JSON.stringify(characters));
                    
                    // Close modal
                    document.body.removeChild(modal);
                    
                    // Refresh character list
                    displayCharacters();
                }
            });
        }
        
        // Cancel button
        const cancelBtn = modal.querySelector('.cancel-changes');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }
    }
}

