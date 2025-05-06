document.addEventListener('DOMContentLoaded', function() {
    // Campaign timeline tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const campaignSelect = document.getElementById('campaign-select');
    
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
        loadCampaignData(this.value);
    });
    
    // Initial load
    loadCampaignData(campaignSelect.value);
});

// Function to load campaign data based on selection
function loadCampaignData(campaignId) {
    // This would typically fetch data from a JSON file or API
    // For now, we'll use a simple object to demonstrate
    const campaignData = {
        campaign1: {
            name: "The Lost Mines of Phandelver",
            pre: {
                worldLore: "A once-prosperous mining region now plagued by mysterious disappearances. The Rockseeker brothers discovered the legendary Wave Echo Cave, site of the Forge of Spells, but dark forces have taken notice...",
                keyNPCs: [
                    { name: "Gundren Rockseeker", description: "Dwarven miner who discovered the lost mine" },
                    { name: "Black Spider", description: "Mysterious drow seeking control of the mines" },
                    { name: "Sildar Hallwinter", description: "Member of the Lords' Alliance investigating disappearances" }
                ],
                hiddenTruths: "The mines contain an ancient forge connected to the creation of powerful magic items. The Black Spider is actually working for a more sinister entity that seeks to corrupt the forge's power."
            },
            current: {
                recaps: [
                    { session: 1, summary: "Party met in Neverwinter, escorted supplies to Phandalin" },
                    { session: 2, summary: "Discovered Gundren was kidnapped, cleared Cragmaw Hideout" },
                    { session: 3, summary: "Arrived in Phandalin, confronted Redbrands at the Sleeping Giant" }
                ],
                quests: [
                    { title: "Find Gundren", status: "Active" },
                    { title: "Investigate the Lost Mine", status: "Pending" },
                    { title: "Deal with the Redbrands", status: "Active" }
                ],
                worldUpdates: "Phandalin is now free from the Redbrands' influence. The townmaster has offered a reward for clearing Tresendar Manor. Rumors of goblin activity have decreased in the region."
            },
            post: {
                consequences: "The region has become prosperous again with the mine reopened. A new settlement has formed near Wave Echo Cave, primarily populated by dwarves and gnomes specializing in magical crafting.",
                epilogues: "The party established a trading company based in Phandalin, with exclusive rights to distribute items from the Forge of Spells. Gundren Rockseeker became the mine's overseer.",
                legacyArtifacts: "The Forge of Spells remains, creating occasional magic items. The party recovered Lightbringer, a mace with radiant powers, and Dragonguard, a breastplate resistant to dragon breath."
            }
        },
        campaign2: {
            name: "Curse of Strahd",
            pre: {
                worldLore: "Barovia, a land shrouded in mist and ruled by the vampire Count Strahd von Zarovich for centuries. Once a beautiful valley, it has been corrupted by Strahd's dark influence after he made a pact with dark powers in his quest for immortality and his love, Tatyana.",
                keyNPCs: [
                    { name: "Strahd von Zarovich", description: "Vampire lord and ruler of Barovia" },
                    { name: "Ireena Kolyana", description: "Woman who resembles Strahd's long-lost love Tatyana" },
                    { name: "Madam Eva", description: "Vistani fortune teller who knows much about Barovia's fate" }
                ],
                hiddenTruths: "Strahd is cursed to forever seek but never obtain his true love. The Dark Powers that granted his immortality ensure his eternal torment. Barovia exists in its own demiplane, cut off from the rest of the multiverse."
            },
            current: {
                recaps: [
                    { session: 1, summary: "Party drawn into the mists, arrived at village of Barovia" },
                    { session: 2, summary: "Met Ireena, defended her from Strahd's minions" },
                    { session: 3, summary: "Visited Madam Eva for a fortune reading about powerful artifacts" }
                ],
                quests: [
                    { title: "Protect Ireena", status: "Active" },
                    { title: "Find the Sunsword", status: "Active" },
                    { title: "Locate the Holy Symbol of Ravenkind", status: "Pending" },
                    { title: "Investigate Castle Ravenloft", status: "Pending" }
                ],
                worldUpdates: "The village of Barovia remains in fear, but has hope with the heroes' arrival. The church has been reconsecrated after the defeat of the vampire spawn. Strahd has taken notice of the party and sent wolves to track their movements."
            },
            post: {
                consequences: "Barovia freed from Strahd's curse, though the land remains isolated. Sunlight has returned to the valley, and the mists have partially receded, allowing limited travel between Barovia and neighboring domains.",
                epilogues: "The party escaped the mists, though forever changed by their experience. Ireena, revealed to be Tatyana's reincarnation, established a new order of knights to protect the valley.",
                legacyArtifacts: "The Sunsword remains as a symbol of hope against darkness. The Tome of Strahd is preserved as a warning about the dangers of unchecked ambition and dark pacts."
            }
        },
        campaign3: {
            name: "Storm King's Thunder",
            pre: {
                worldLore: "The ordning—the divine social structure of giant-kind—has been shattered by King Hekaton's disappearance. Giants of all types now raid small folk settlements across the Sword Coast, each trying to prove their worth to their gods through increasingly destructive acts.",
                keyNPCs: [
                    { name: "King Hekaton", description: "Missing ruler of the storm giants" },
                    { name: "Iymrith", description: "Ancient blue dragon disguised as a storm giant advisor" },
                    { name: "Zephyros", description: "Cloud giant wizard seeking to restore peace" }
                ],
                hiddenTruths: "King Hekaton has been kidnapped as part of a plot orchestrated by Iymrith, the ancient blue dragon, who seeks to weaken giant society and claim their treasures. The dragon has infiltrated the storm giant court in disguise."
            },
            current: {
                recaps: [
                    { session: 1, summary: "Party survived a giant attack on Nightstone" },
                    { session: 2, summary: "Met Zephyros who transported them in his flying tower" },
                    { session: 3, summary: "Defended Goldenfields from hill giant raiders" }
                ],
                quests: [
                    { title: "Investigate Giant Attacks", status: "Active" },
                    { title: "Find King Hekaton", status: "Pending" },
                    { title: "Recover Giant Relics", status: "Active" },
                    { title: "Visit the Eye of the All-Father", status: "Pending" }
                ],
                worldUpdates: "Giant attacks have increased across the Sword Coast. The Lords' Alliance has called for adventurers to help defend settlements. Rumors speak of ancient giant artifacts being unearthed."
            },
            post: {
                consequences: "The ordning has been reestablished in a new form, with greater respect between giant types. Relations between giants and small folk have improved in many regions, leading to new trade agreements.",
                epilogues: "King Hekaton rules with a new perspective on the small folk. The party became honorary members of the storm giant court, with standing invitations to Maelstrom.",
                legacyArtifacts: "The Conch of Teleportation remains in the party's possession as a symbol of trust. The Wyrmskull Throne was restored to its rightful place in Maelstrom."
            }
        }
    };
    
    // Update the UI with the loaded data
    updateCampaignUI(campaignData[campaignId]);
}

function updateCampaignUI(data) {
    // Update pre-campaign content
    document.querySelector('#pre-content h3').textContent = `World Before Heroes: ${data.name}`;
    document.getElementById('pre-world-lore').textContent = data.pre.worldLore;
    
    // Update NPCs list
    const npcsList = document.getElementById('pre-key-npcs');
    npcsList.innerHTML = '';
    data.pre.keyNPCs.forEach(npc => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${npc.name}</strong>: ${npc.description}`;
        npcsList.appendChild(li);
    });
    
    // Update hidden truths
    document.getElementById('pre-hidden-truths').textContent = data.pre.hiddenTruths;
    
    // Update current campaign content
    document.querySelector('#current-content h3').textContent = `Current Adventures: ${data.name}`;
    
    // Update recaps
    const recapsList = document.getElementById('current-recaps');
    recapsList.innerHTML = '';
    data.current.recaps.forEach(recap => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Session ${recap.session}</strong>: ${recap.summary}`;
        recapsList.appendChild(li);
    });
    
    // Update quests
    const questsList = document.getElementById('current-quests');
    questsList.innerHTML = '';
    data.current.quests.forEach(quest => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${quest.title}</strong> - <span class="status ${quest.status.toLowerCase()}">${quest.status}</span>`;
        questsList.appendChild(li);
    });
    
    // Update world updates
    document.getElementById('current-world-updates').textContent = data.current.worldUpdates;
    
    // Update post-campaign content
    document.querySelector('#post-content h3').textContent = `The World After: ${data.name}`;
    document.getElementById('post-consequences').textContent = data.post.consequences;
    document.getElementById('post-epilogues').textContent = data.post.epilogues;
    document.getElementById('post-legacy-artifacts').textContent = data.post.legacyArtifacts;
}