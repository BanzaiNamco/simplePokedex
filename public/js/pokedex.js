let pokemonList = [];
let pokedexOffset = 0;
const maxPokedexEntryNum = 1025;

document.addEventListener("DOMContentLoaded", function() {

    const sort = document.getElementById("sort-pokedex");

    sortPokedex(true);
    let sortType

    sort.addEventListener("change", function() {
        pokedexOffset = 0;
        if (sort.value.includes("id")) {
            sortType = sort.value.slice(2, sort.value.length);
            sortPokedex(true, sortType);
        } else {
            sortType = sort.value.slice(4, sort.value.length);
            sortPokedexByName_AllPoke(true, sortType);
        }
    });
    
    const showMore = document.getElementById("show-more");
    
    showMore.addEventListener("click", function() {
        pokedexOffset += 10;
        if (sort.value.includes("id")) {
            sortType = sort.value.slice(2, sort.value.length);
            sortPokedex(false, sortType);
        } else {
            sortPokedexByName_AllPoke();
        }
    });
})


function sortPokedex(clearContainer = false, sortType = "asc"){
    const container = document.getElementById("pokemon-container");
    if (clearContainer) { 
        container.innerHTML = "";
        pokemonList = [];
    }

    if (sortType === "asc") {
        getPokemon(pokedexOffset).then(data => {
            pokemonList = pokemonList.concat(data.results);
            pokemonList.sort((a, b) => a.id - b.id);
            const listToLoad = pokemonList.slice(pokedexOffset, pokedexOffset + 10);
            const promises = listToLoad.map((pokemon) => createCard(pokemon));
            Promise.all(promises).then(cards => {
                cards.forEach(card => container.innerHTML += card);
            });
        });
    } else if (sortType === "desc") {
        const newOffset = maxPokedexEntryNum - pokedexOffset - 10;
        getPokemon(newOffset).then(data => {
            pokemonList = pokemonList.concat(data.results);
            pokemonList.sort((a, b) => b.id - a.id);
            const listToLoad = pokemonList.slice(pokedexOffset, pokedexOffset + 10);
            const promises = listToLoad.map((pokemon) => createCard(pokemon));
            Promise.all(promises).then(cards => {
                cards.forEach(card => container.innerHTML += card);
            });
        });
    }
}

// if clearContainer = false -> sortType is not needed
function sortPokedexByName_AllPoke(clearContainer = false, sortType = "asc"){
    const container = document.getElementById("pokemon-container");
    if (clearContainer) { 
        container.innerHTML = "";
        pokemonList = [];
        getPokemon(0, 9999).then(data => {
            pokemonList = pokemonList.concat(data.results);
            
            if (sortType === "asc") {
                pokemonList.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortType === "desc") {
                pokemonList.sort((a, b) => b.name.localeCompare(a.name));
            }

            const listToLoad = pokemonList.slice(pokedexOffset, pokedexOffset + 10);
            const promises = listToLoad.map((pokemon) => createCard(pokemon));
            Promise.all(promises).then(cards => {
                cards.forEach(card => container.innerHTML += card);
            });
        });
    } else {
        const listToLoad = pokemonList.slice(pokedexOffset, pokedexOffset + 10);
        const promises = listToLoad.map((pokemon) => createCard(pokemon));
        Promise.all(promises).then(cards => {
            cards.forEach(card => container.innerHTML += card);
        });
    }
}

function integerTo3DigitString(num) {
    if (num.toString().length < 3) {
        num = num.toString().padStart(3, "0");
    }
    return num; 
}

async function createCard(pokemon){
    const data = await getPokemonData(pokemon.name);
    if (!data) {
        alert("No Pokemon found");
        return "";
    }
    const ThreeDigitIndex = integerTo3DigitString(data.id);

    const card = `
        <div class="pokemon-card" id = "${data.id}" onclick = openDetails(this.id)>
            <div class="pokemon-image-container">
                <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${ThreeDigitIndex}.png" class="pokemon-image" onerror="this.src='/images/whodat.png'">
            </div>
            <div class="pokemon-details">
                <p class="pokemon-id">#${ThreeDigitIndex}</p>
                <h3 class = "pokemon-name" id = "${data.name}">
                    ${capitalize(data.name)}
                </h3>
                <div class="pokemon-type-list">
                    <ul class = "pokemon-types">
                        ${data.types.map(type => 
                            `<li class = "${type.type.name}">${capitalize(type.type.name)}</li>`).join("")}
                    </ul>    
                </div>
            </div>
        </div>
    `
    return card;
}