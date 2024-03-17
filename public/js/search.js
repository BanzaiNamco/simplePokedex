document.addEventListener("DOMContentLoaded", function() {

    const search = document.getElementById("search-form");

    search.addEventListener("submit", function(event) {
        event.preventDefault();
        const searchValue = document.getElementById("search").value;
        if (searchValue === "") {
            window.location.href = "/";
        } else {
            openDetails(searchValue);
        }
    });
})

function openDetails(pokemonId){
    window.location.href = `/pokemon?id=${pokemonId}`;
}
