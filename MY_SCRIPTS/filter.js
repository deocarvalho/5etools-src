import fs from 'fs';

function removeBySourceNotXPHBAndNonSRDSubclasses() {
    const srdSubclasses = [
        ['Barbarian', 'Berserker'], ['Bard', 'Lore'], ['Cleric', 'Life'], ['Druid', 'Land'],
        ['Fighter', 'Champion'], ['Monk', 'Open Hand'], ['Paladin', 'Devotion'], ['Ranger', 'Hunter'],
        ['Rogue', 'Thief'], ['Sorcerer', 'Draconic'], ['Warlock', 'Fiend'], ['Wizard', 'Evoker']
    ];

    const keysToFilter = [
        'class', 'subclass', 'classFeature', 'subclassFeature'
    ];

    srdSubclasses.forEach(cl => {
        try {
            const rawData = fs.readFileSync('c:/Users/andre/Cursor Project/5etools-src/data/class/class-' + cl[0].toLowerCase() + '.json', 'utf8');
            const data = JSON.parse(rawData);

            keysToFilter.forEach(key => {
                if (Array.isArray(data[key])) {
                    data[key] = data[key].filter(item => {
                        var keep = false;
                        if (typeof item === 'object' && item !== null) {
                            // keep items that are from XPHB
                            keep = item.source === 'XPHB';

                            // removes non srd subclasses and subclass features
                            if (key == 'subclass') {
                                keep = srdSubclasses.some(srdSubclass => item.className === srdSubclass[0] && item.shortName === srdSubclass[1]);
                            }
                            else if (key === 'subclassFeature') {
                                keep = srdSubclasses.some(srdSubclass => item.className === srdSubclass[0] && item.subclassShortName === srdSubclass[1]);
                            }
                        }

                        return keep; // Keep strings if any
                    });
                }
            });

            // Formatting with tabs to match original 5etools formatting
            fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
            console.log('Successfully filtered file: ' + path);
        } catch (e) {
            console.error('Error with file: ' + path, e);
        }
    });
}

// removeBySourceNotXPHBAndNonSRDSubclasses();

function removeNonSRDSpells() {
    try {
        const path = 'c:/Users/andre/Cursor Project/5etools-src/data/spells/spells-xphb.json';

        const rawData = fs.readFileSync(path, 'utf8');
        const data = JSON.parse(rawData);

        data.spell = data.spell.filter(item => {
            var keep = typeof item === 'object' && item !== null && item.srd52 !== null && item.srd52 !== undefined && item.srd52 === true;
            if (!keep)
                console.log(item.name + ' removed');

            return keep;
        });

        // Formatting with tabs to match original 5etools formatting
        fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
        console.log('Successfully filtered file: ' + path);
    } catch (e) {
        console.error('Error with file: ' + path, e);
    }
}

// removeNonSRDSpells();

function removeNonSrdSpellFluffs() {
    const fluffPath = 'c:/Users/andre/Cursor Project/5etools-src/data/spells/fluff-spells-xphb.json';
    const rawFluffData = fs.readFileSync(fluffPath, 'utf8');
    const fluffData = JSON.parse(rawFluffData);

    const spellPath = 'c:/Users/andre/Cursor Project/5etools-src/data/spells/spells-xphb.json';
    const rawSpellData = fs.readFileSync(spellPath, 'utf8');
    const spellData = JSON.parse(rawSpellData);

    fluffData.spellFluff = fluffData.spellFluff.filter(spellFluff => {
        var keep = spellData.spell.some(spell => spell.name === spellFluff.name);
        if (!keep)
            console.log(spellFluff.name + ' removed');

        return keep;
    });

    fs.writeFileSync(fluffPath, JSON.stringify(fluffData, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + fluffPath);
}

// removeNonSrdSpellFluffs();

function removeNonSrdSpellSources() {
    console.log('Starting removeNonSrdSpellSources');

    const sourcePath = 'c:/Users/andre/Cursor Project/5etools-src/data/spells/sources.json';
    const rawSourceData = fs.readFileSync(sourcePath, 'utf8');
    const sourceData = JSON.parse(rawSourceData);

    const spellPath = 'c:/Users/andre/Cursor Project/5etools-src/data/spells/spells-xphb.json';
    const rawSpellData = fs.readFileSync(spellPath, 'utf8');
    const spellData = JSON.parse(rawSpellData);

    // Build a Set of SRD spell names for fast lookup
    const srdSpellNames = new Set(spellData.spell.map(s => s.name));

    // sourceData.XPHB is an object { "Spell Name": { class: [...], ... }, ... }
    const filteredXPHB = {};

    for (const [spellName, spellEntry] of Object.entries(sourceData.XPHB)) {
        // Remove spells not in spells-xphb.json
        if (!srdSpellNames.has(spellName)) {
            console.log(spellName + ' removed');
            continue;
        }

        // From remaining spells, filter class array to only source === 'XPHB'
        const entry = { ...spellEntry };
        if (Array.isArray(entry.class)) {
            entry.class = entry.class.filter(c => c.source === 'XPHB');
        }

        filteredXPHB[spellName] = entry;
    }

    sourceData.XPHB = filteredXPHB;

    // Formatting with tabs to match original 5etools formatting
    fs.writeFileSync(sourcePath, JSON.stringify(sourceData, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + sourcePath);
}

// removeNonSrdSpellSources();

function removeNonSrdBackgrounds() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/backgrounds.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const before = data.background.length;
    data.background = data.background.filter(bg => {
        const keep = bg.srd52 === true;
        if (!keep)
            console.log(bg.name + ' (' + bg.source + ') removed');
        return keep;
    });

    console.log(`Kept ${data.background.length} of ${before} backgrounds`);
    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdBackgrounds();

function removeNonSrdRaces() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/races.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const beforeRaces = data.race.length;
    data.race = data.race.filter(r => {
        const keep = r.srd52 === true;
        if (!keep) console.log(r.name + ' (' + r.source + ') removed');
        return keep;
    });

    const beforeSubraces = (data.subrace || []).length;
    if (data.subrace) {
        data.subrace = data.subrace.filter(r => {
            const keep = r.srd52 === true;
            if (!keep) console.log('[subrace] ' + r.name + ' (' + r.source + ') removed');
            return keep;
        });
    }

    console.log(`Kept ${data.race.length} of ${beforeRaces} races`);
    console.log(`Kept ${(data.subrace || []).length} of ${beforeSubraces} subraces`);
    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdRaces();

function removeNonSrdFeats() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/feats.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const before = data.feat.length;
    data.feat = data.feat.filter(f => {
        const keep = f.srd52 === true;
        if (!keep) console.log(f.name + ' (' + f.source + ') removed');
        return keep;
    });

    console.log(`Kept ${data.feat.length} of ${before} feats`);
    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdFeats();

function removeNonSrdActions() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/actions.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const before = data.action.length;
    data.action = data.action.filter(a => {
        const keep = a.srd52 === true;
        if (!keep) console.log(a.name + ' (' + a.source + ') removed');
        return keep;
    });

    console.log(`Kept ${data.action.length} of ${before} actions`);
    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdActions();

function removeNonSrdConditionsDiseases() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/conditionsdiseases.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    for (const key of ['condition', 'disease', 'status']) {
        if (!Array.isArray(data[key])) continue;
        const before = data[key].length;
        data[key] = data[key].filter(x => {
            const keep = x.srd52 === true;
            if (!keep) console.log('[' + key + '] ' + x.name + ' (' + x.source + ') removed');
            return keep;
        });
        console.log(key + ': kept ' + data[key].length + ' of ' + before);
    }

    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdConditionsDiseases();

function removeNonSrdItems() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/items.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    for (const key of ['item', 'itemGroup']) {
        if (!Array.isArray(data[key])) continue;
        const before = data[key].length;
        data[key] = data[key].filter(x => {
            const keep = x.srd52 === true;
            if (!keep) console.log('[' + key + '] ' + x.name + ' (' + x.source + ') removed');
            return keep;
        });
        console.log(key + ': kept ' + data[key].length + ' of ' + before);
    }

    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdItems();

function removeNonSrdItemsBase() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/items-base.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    // Filter by srd52
    const before = data.baseitem.length;
    data.baseitem = data.baseitem.filter(x => {
        const keep = x.srd52 === true;
        if (!keep) console.log('[baseitem] ' + x.name + ' (' + x.source + ') removed');
        return keep;
    });
    console.log('baseitem: kept ' + data.baseitem.length + ' of ' + before);

    // Reference tables: keep only XPHB/XDMG (remove duplicate PHB/DMG/AAG entries)
    const xSources = new Set(['XPHB', 'XDMG']);
    for (const key of ['itemProperty', 'itemType', 'itemTypeAdditionalEntries', 'itemEntry']) {
        if (!Array.isArray(data[key])) continue;
        const b = data[key].length;
        data[key] = data[key].filter(x => xSources.has(x.source));
        console.log(key + ': kept ' + data[key].length + ' of ' + b);
    }
    // itemMastery: all XPHB, keep all
    console.log('itemMastery: keeping all ' + (data.itemMastery || []).length);

    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

removeNonSrdItemsBase();

function removeNonSrdDecks() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/decks.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    for (const key of ['deck', 'card']) {
        if (!Array.isArray(data[key])) continue;
        const before = data[key].length;
        data[key] = data[key].filter(x => {
            const keep = x.srd52 === true;
            if (!keep) console.log('[' + key + '] ' + x.name + ' (' + x.source + ') removed');
            return keep;
        });
        console.log(key + ': kept ' + data[key].length + ' of ' + before);
    }

    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdDecks();

function removeNonSrdLanguages() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/languages.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    for (const key of ['language', 'languageScript']) {
        if (!Array.isArray(data[key])) continue;
        const before = data[key].length;
        data[key] = data[key].filter(x => {
            const keep = x.srd52 === true;
            if (!keep) console.log('[' + key + '] ' + x.name + ' (' + x.source + ') removed');
            return keep;
        });
        console.log(key + ': kept ' + data[key].length + ' of ' + before);
    }

    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdLanguages();

function removeNonSrdOptionalFeatures() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/optionalfeatures.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const before = data.optionalfeature.length;
    data.optionalfeature = data.optionalfeature.filter(x => {
        const keep = x.srd52 === true;
        if (!keep) console.log(x.name + ' (' + x.source + ') removed');
        return keep;
    });

    console.log('optionalfeature: kept ' + data.optionalfeature.length + ' of ' + before);
    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdOptionalFeatures();

function removeNonSrdSenses() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/senses.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const before = data.sense.length;
    data.sense = data.sense.filter(x => {
        const keep = x.srd52 === true;
        if (!keep) console.log(x.name + ' (' + x.source + ') removed');
        return keep;
    });

    console.log('sense: kept ' + data.sense.length + ' of ' + before);
    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdSenses();

function removeNonSrdSkills() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/skills.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const before = data.skill.length;
    data.skill = data.skill.filter(x => {
        const keep = x.srd52 === true;
        if (!keep) console.log(x.name + ' (' + x.source + ') removed');
        return keep;
    });

    console.log('skill: kept ' + data.skill.length + ' of ' + before);
    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

// removeNonSrdSkills();

function removeNonSrdTrapsHazards() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/trapshazards.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    for (const key of ['trap', 'hazard']) {
        if (!Array.isArray(data[key])) continue;
        const before = data[key].length;
        data[key] = data[key].filter(x => {
            const keep = x.srd52 === true;
            if (!keep) console.log('[' + key + '] ' + x.name + ' (' + x.source + ') removed');
            return keep;
        });
        console.log(key + ': kept ' + data[key].length + ' of ' + before);
    }

    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

removeNonSrdTrapsHazards();

function removeNonSrdVariantRules() {
    const path = 'c:/Users/andre/Cursor Project/5etools-src/data/variantrules.json';
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));

    const before = data.variantrule.length;
    data.variantrule = data.variantrule.filter(x => {
        const keep = x.srd52 === true;
        if (!keep) console.log(x.name + ' (' + x.source + ') removed');
        return keep;
    });

    console.log('variantrule: kept ' + data.variantrule.length + ' of ' + before);
    fs.writeFileSync(path, JSON.stringify(data, null, '\t') + '\n', 'utf8');
    console.log('Successfully filtered file: ' + path);
}

removeNonSrdVariantRules();
