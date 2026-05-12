const contentDiv = document.getElementById('content');

// 1. Definiera ALLA vyer först
const showHome = () => {
    contentDiv.innerHTML = `
    <h1>Välkommen till Kattbutiken!</h1>
    <p>Här hittar du de mest fantastiska kattraserna från hela världen.</p>`;
};

const showAbout = () => {
    contentDiv.innerHTML = `
    <h1>Om ägaren</h1>
    <p>Kontakt: info@kattbutiken.se</p>
    <p>Adress: Kattgränd 1, Mjau-stad.</p>`;
};

//const showCart = () => { contentDiv.innerHTML = '<h1>Din Kundvagn</h1>'; };
const showCart = () => {
    if (cart.length === 0) {
        contentDiv.innerHTML = '<h1>Din Kundvagn</h1><p>Kundvagnen är tom.</p>';
        return;
    }

    let html = '<h1>Din Kundvagn</h1><ul class="cart-lis">';

    cart.forEach((item, index) => {
        html += `
            <li>
                <strong>${item.name}</strong> - 1000 kr
                <button onclick="removeFromCart(${index})"> Ta bort</button>
            </li>`;
    });

    html += '</ul>';

    // Lägg till ett beställningsformulär

    html += `
        <div class="order-form">
            <h2>Slutför din beställning<h2>
            <form id="checkout-form">
                <input type="text" id="name" placeholder="Ditt namn" required><br>
                <iput type="email" id="email" placeholder="Din e-post" required><br>
                <button type="submit">Skicka beställning</button>
            </form>
        </div>
        `;

    contentDiv.innerHTML = html;

    // Hantera formulärets inskickning

    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').ariaValueMax;
        alert(`Tack för din beställning, ${name}! Vi skickar dina katter snart.`);
        cart = [];
        showHome(); //gå tillbaka

    });
};

//Möjlighet att ta bort från kundvagnen
window.removeFromCart = (index) => {
    cart.slice(index, 1);
    showCart();
};
// FLYTTAD HIT: showCats måste finnas innan EventListeners körs
const showCats = () => {
    contentDiv.innerHTML = '<h1>Våra Katter</h1><p>Laddar katter...</p>';
    fetchCats();
};

// 2. Event listeners (nu känner de till showCats!)
document.getElementById('link-home').addEventListener('click', showHome);
document.getElementById('link-about').addEventListener('click', showAbout);
document.getElementById('link-cats').addEventListener('click', showCats);
document.getElementById('link-cart').addEventListener('click', showCart);

// 3. Resten av logiken
let allBreeds = []; 
let currentPage = 1;
const itemsPerPage = 10;

async function fetchCats() {
    try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds');
        allBreeds = await response.json();
        renderCatList(); 
    } catch (error) {
        contentDiv.innerHTML = "<p>Gick inte att hämta katter just nu...</p>";
    }
}

function renderCatList() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const catsToShow = allBreeds.slice(start, end);

    let html = '<h1>Våra Katter</h1><div class="cat-grid">';
    catsToShow.forEach(cat => {
        let imageUrl = 'https://via.placeholder.com/200x200?text=No+Image';
        if (cat.image && cat.image.url) {
            imageUrl = cat.image.url;
        }
        html += `
            <div class="cat-card">
                <img src="${imageUrl}" alt ="${cat.name}" style="width:100%; max-height:200px; object-fit:cover;">
                <h3>${cat.name}</h3>
                <p><strong>Ursprung:</strong> ${cat.origin}</p>
                <button onclick="addToCart('${cat.id}')">Köp</button>
            </div>
        `;
    });
    html += '</div>';

    // Fixade även en felaktig </button> här nere
    html += `
    <div class="pagination">
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Föregående</button>
        <span>Sida ${currentPage} av ${Math.ceil(allBreeds.length / itemsPerPage)}</span>
        <button onclick="changePage(1)" ${currentPage * itemsPerPage >= allBreeds.length ? 'disabled' : ''}>Nästa</button>
    </div>`;

    contentDiv.innerHTML = html;
}

window.changePage = (direction) => {
    currentPage += direction;
    renderCatList();
};

let cart = [];

window.addToCart = (catId) => {
    const selectedCat = allBreeds.find(cat => cat.id === catId);
    cart.push(selectedCat);
    alert(`${selectedCat.name} har lagts till i kundvagn!`);
};



// Starta hemvyn
showHome();

