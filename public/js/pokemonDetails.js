const urlParams = new URLSearchParams(window.location.search);
let pokemonId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async function() {
    const container = document.getElementById("entryContainer");
    let pokemon = await getPokemonData(pokemonId);
    let pokedexEntry = "";
    if (!pokemon) {
        pokedexEntry = "<h1>Error 404: Pokemon not found</h1>";
        container.innerHTML = pokedexEntry;
    } else {
        if (pokemon.id.toString().length < 3) {
            pokemon.id = pokemon.id.toString().padStart(3, "0");
        }

        let moreDetails = await fetch(pokemon.species.url);
        moreDetails = await moreDetails.json();
        
        // get category, check if there is none
        let category = moreDetails.genera.find(genus => genus.language.name === "en");
        category = category ? category.genus : "No category";

        let weaknesses = pokemon.types.map(type => derivePokemonWeakness(type.type.name)).flat();
        let resistances = pokemon.types.map(type => derivePokemonResistances(type.type.name)).flat();

        weaknesses = weaknesses.filter((type, index) => weaknesses.indexOf(type) === index && !resistances.includes(type));

        let eggGroups = moreDetails.egg_groups;
       
        let evolutionChainData = await fetch(moreDetails.evolution_chain.url);
        evolutionChainData = await evolutionChainData.json();

        let evolutionChain = getEvolutionChain(evolutionChainData.chain);
        let stages = divideEvolutions(evolutionChain);
     

        pokedexEntry = createPokedexEntry(pokemon, category, weaknesses, eggGroups);
        container.innerHTML = pokedexEntry;

        const eggGroupsContainer = document.getElementById("eggGroups");
        if (eggGroups.length > 0) {
            eggGroupsContainer.innerHTML = `<h3>Egg Groups</h3>`;
            const eggGroupsList = document.createElement("ul");
            eggGroupsList.classList.add("egg-groups");
            eggGroups.forEach(group => {
                const item = `<li class = "${group.name}">${capitalize(group.name)}</li>`;
                eggGroupsList.innerHTML += item;
            });
            eggGroupsContainer.appendChild(eggGroupsList);
        }

        const evolutionChainContainer = document.getElementById("evolutionChainContainer");

        stages.forEach(stage => {
            const stageDiv = document.createElement("div");
            stageDiv.classList.add("evolutionStage");
            stage.forEach(pokemon => {
                const pokemonDiv = 
                `
                <a href = "/pokemon?id=${pokemon.id}"><div class="evolutionPokemon">
                    <h3>${capitalize(pokemon.name)}</h3>
                    <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemon.id}.png" class="evolutionPokemonImage" onerror="this.src='/images/whodat.png'">
                </div></a>
                `
                stageDiv.innerHTML += pokemonDiv;
            });
            evolutionChainContainer.appendChild(stageDiv);
        });
    }

    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");

    prevButton.addEventListener("click", () => {
        if (pokemon.id > 1) {
            window.location.href = `pokemon?id=${parseInt(pokemon.id) - 1}`;
        } else {
            window.location.href = `pokemon?id=1025`;
        }
    });

    nextButton.addEventListener("click", () => {
        if (pokemon.id < 1025) {
            window.location.href = `pokemon?id=${parseInt(pokemon.id) + 1}`;
        } else {
            window.location.href = `pokemon?id=1`;
        }
    });

});

function createPokedexEntry(pokemon, category, weaknesses, eggGroups) {
    return `
        <div id = "pokemon-details">
                <div id = "firstlayer">
                    <div class = "navbutton">
                        <button id = "prev">Previous</button>
                    </div>
                    <div id = "basicInfo">
                        <h1 id = "pokemon-id">#${pokemon.id}</h1>
                        <h1 id = "pokemon-name">${capitalize(pokemon.name)}</h1>
                    </div>
                    <div class = "navbutton">
                        <button id = "next">Next</button>
                    </div>
                </div>
                <div id = "secondlayer">
                    <div id = "pokemon-image">
                    <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pokemon.id}.png" class="pokemon-image" onerror="this.src='/images/whodat.png'">
                    </div>
                    <div id = "secondlayerRight">
                        <div id = "biologicalInfo">
                            <div id = "bioRightCol">
                                <div id = "height">
                                    <h3>Height</h3>
                                    <p>${pokemon.height / 10} m</p>
                                </div>
                                <div id = "weight">
                                    <h3>Weight</h3>
                                    <p>${pokemon.weight / 10} kg</p>
                                </div>
                            </div>
                            <div id = "bioLeftCol">
                                <div id = "abilities">
                                    <h3>Abilities</h3>
                                    ${pokemon.abilities.map(ability => `<p>${capitalize(ability.ability.name)}</p>`).join("")}
                                </div>
                                <div id = "category">
                                    <h3>Category</h3>
                                    ${category}
                                </div>
                            </div>
                        </div>
                        <div id = "eggGroups">
                            
                        </div>
                        <div id = "types">
                            <h2>Types</h2>
                            <ul class = "pokemon-types">
                                ${pokemon.types.map(type => `<li class = "${type.type.name}">${capitalize(type.type.name)}</li>`).join("")}
                            </ul>   
                        </div>
                    </div>
                </div>
                <div id = "thirdlayer">
                    <div id = "thirdlayerLeft">
                        <div id = "stats">
                            <h2>Base Stats</h2>
                            <div id = "statsContainer">
                                <div id = "statsLeftCol">
                                    <div id = "hp">
                                        <h4>HP</h4>
                                        <p>${pokemon.stats.find(stat => stat.stat.name === "hp").base_stat}</p>
                                    </div>
                                    <div id = "attack">
                                        <h4>Attack</h4>
                                        <p>${pokemon.stats.find(stat => stat.stat.name === "attack").base_stat}</p>
                                    </div>
                                    <div id = "defense">
                                        <h4>Defense</h4>
                                        <p>${pokemon.stats.find(stat => stat.stat.name === "defense").base_stat}</p>
                                    </div>
                                </div>
                                <div id = "statsRightCol">
                                    <div id = "special-attack">
                                        <h4>Special Attack</h4>
                                        <p>${pokemon.stats.find(stat => stat.stat.name === "special-attack").base_stat}</p>
                                    </div>
                                    <div id = "special-defense">
                                        <h4>Special Defense</h4>
                                        <p>${pokemon.stats.find(stat => stat.stat.name === "special-defense").base_stat}</p>
                                    </div>
                                    <div id = "speed">
                                        <h4>Speed</h4>
                                        <p>${pokemon.stats.find(stat => stat.stat.name === "speed").base_stat}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id = "thirdlayerRight">
                        <div id = "weaknesses">
                            <h2>Weaknesses</h2>
                            <ul class = "pokemon-types">
                                ${weaknesses.map(type => `<li class = "${type}">${capitalize(type)}</li>`).join("")}
                            </ul>  
                        </div>
                    </div>
                </div>
                <div id = "evolutionChain">
                    <h2>Evolution Chain</h2>
                    <div id = "evolutionChainContainer">
                        
                    </div>
                </div>
            </div>
        `   
}

function getEvolutionChain(chain, stage = 1) {
    let id = chain.species.url.split("/")[6];
    if (id.toString().length < 3) {
        id = id.toString().padStart(3, "0");
    }

    let evolutionChain = [{name: chain.species.name, stage: stage, id: id}];

    chain.evolves_to.forEach(evolution => {
        evolutionChain = [...evolutionChain, ...getEvolutionChain(evolution, stage + 1)];
    });

    return evolutionChain;
}

function divideEvolutions(evolutionChain) {
    let stages = [];
    let currentStage = 1;
    let currentStageEvolutions = [];

    evolutionChain.forEach(evolution => {
        if (evolution.stage === currentStage) {
            currentStageEvolutions.push(evolution);
        } else {
            stages.push(currentStageEvolutions);
            currentStage++;
            currentStageEvolutions = [evolution];
        }
    });

    stages.push(currentStageEvolutions);

    return stages;
}

function derivePokemonWeakness(type) {
    const weaknesses = {
        normal: ["fighting"],
        fighting: ["flying", "psychic", "fairy"],
        flying: ["electric", "ice", "rock"],
        poison: ["ground", "psychic"],
        ground: ["water", "grass", "ice"],
        rock: ["water", "grass", "fighting", "ground", "steel"],
        bug: ["fire", "flying", "rock"],
        ghost: ["ghost", "dark"],
        steel: ["fire", "fighting", "ground"],
        fire: ["water", "rock", "ground"],
        water: ["electric", "grass"],
        grass: ["fire", "ice", "poison", "flying", "bug"],
        electric: ["ground"],
        psychic: ["bug", "ghost", "dark"],
        ice: ["fire", "fighting", "rock", "steel"],
        dragon: ["ice", "dragon", "fairy"],
        dark: ["fighting", "bug", "fairy"],
        fairy: ["poison", "steel"]
    }

    return weaknesses[type];
}

function derivePokemonResistances(type){
    const resistances = {
        normal: ["ghost"],
        fighting: ["bug", "rock", "dark"],
        flying: ["fighting", "bug", "grass", "ground"],
        poison: ["fighting", "poison", "grass", "fairy", "bug"],
        ground: ["poison", "rock", "electric"],
        rock: ["normal", "flying", "poison", "fire"],
        bug: ["fighting", "ground", "grass"],
        ghost: ["normal", "fighting", "poison", "bug"],
        steel: ["normal", "flying", "rock", "bug", "steel", "grass", "psychic", "ice", "dragon", "fairy", "poison"],
        fire: ["bug", "steel", "fire", "grass", "ice", "fairy"],
        water: ["steel", "fire", "water", "ice"],
        grass: ["ground", "water", "grass", "electric"],
        electric: ["flying", "steel", "electric"],
        psychic: ["fighting", "psychic"],
        ice: ["ice"],
        dragon: ["fire", "water", "grass", "electric"],
        dark: ["ghost", "psychic", "dark"],
        fairy: ["fighting", "bug", "dragon", "dark"]
    }

    return resistances[type];
}