async function getPokemon(offset, limit = 10) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();

    data.results.forEach((pokemon) => {
        pokemon.id = pokemon.url.split("/")[6];
    });

    data.results = data.results.filter(pokemon => pokemon.id <= 10000);
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

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}