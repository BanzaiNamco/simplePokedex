let pokemonList = [];
let pokedexOffset = 0;

document.addEventListener("DOMContentLoaded", function() {

    const sort = document.getElementById("sort-pokedex");

    sortPokedex(clearContainer = true);

    sort.addEventListener("change", function() {
        pokedexOffset = 0;
        if (sort.value === "id") {
            sortPokedex(clearContainer = true);
        } else {
            sortPokedexByName_AllPoke(clearContainer = true);
        }
    });

    const showMore = document.getElementById("show-more");

    showMore.addEventListener("click", function() {
        pokedexOffset += 10;
        if (sort.value === "id") {
            sortPokedex();
        } else {
            sortPokedexByName_AllPoke();
        }
    });

    const search = document.getElementById("search-form");

    search.addEventListener("submit", function(event) {
        event.preventDefault();
        const searchValue = document.getElementById("search").value;
        if (searchValue === "") {
            sortPokedex(clearContainer = true);
        } else {
            //change this part to the modal stuff
            const container = document.getElementById("pokemon-container");
            container.innerHTML = "";
            createCard({name: searchValue}).then(card => container.innerHTML += card);
        }
    });

})


function sortPokedex(clearContainer = false){
    const container = document.getElementById("pokemon-container");
    if (clearContainer) { 
        container.innerHTML = "";
        pokemonList = [];
    }
    getPokemon(pokedexOffset).then(data => {
        pokemonList = pokemonList.concat(data.results);
        // remove pokemon with "-" in their name
        pokemonList = pokemonList.filter(pokemon => !pokemon.name.includes("-"));

        const listToLoad = pokemonList.slice(pokedexOffset, pokedexOffset + 10);
        const promises = listToLoad.map((pokemon) => createCard(pokemon));
        Promise.all(promises).then(cards => {
            cards.forEach(card => container.innerHTML += card);
        });
    });
}

function sortPokedexByName_AllPoke(clearContainer = false){
  
}

async function getPokemon(offset, limit = 10) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    return data;
}

async function getPokemonData(name) {
    if (parseInt(name)) {
        name = parseInt(name);
    }

    const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    if (!pokemon.ok) {
        return null;
    } else {
        const data = await pokemon.json();
        return data;
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
        console.log("Pokemon not found");
        // TODO delete next 2 lines
        pokemonList = [];
        pokedexOffset = 0;
        return "<h1>No Pokemon found</h1>";
    }
    const ThreeDigitIndex = integerTo3DigitString(data.id);

    const card = `
        <div class="pokemon-card" id = "${data.id}" onclick = openDetails(this)>
            <div class="pokemon-image-container">
                <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/full/${ThreeDigitIndex}.png" class="pokemon-image" onerror="this.src='./images/whodat.png'">
            </div>
            <div class="pokemon-details">
                <p class="pokemon-id">#${ThreeDigitIndex}</p>
                <h3 class = "pokemon-name" id = "${data.name}">
                    ${data.name.charAt(0).toUpperCase() + data.name.slice(1)}
                </h3>
                <div class="pokemon-type-list">
                    <ul class = "pokemon-types">
                        ${data.types.map(type => `<li class = "${type.type.name}">${type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}</li>`).join("")}
                    </ul>    

                </div>
            </div>
        </div>
    `
    return card;
}

function openDetails(pokemonDiv){
    const id = pokemonDiv.id;
}
