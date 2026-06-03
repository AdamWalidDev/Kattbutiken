
// Lägg din API-nyckel här om du har en
const CAT_API_KEY = '';


// Viktiga globala variabler måste deklareras direkt
let allBreeds = [];
let currentPage = 1;
const itemsPerPage = 10;
let searchTerm = '';
let cart = [];

const contentDiv = document.getElementById('content');

// 1. Definiera ALLA vyer först
const menuHtml = `
<nav>
    <ul>
        <li><a id="link-home" href="index.html">Start</a></li>
        <li><a id="link-about" href="about.html">Om Ägaren</a></li>
        <li><a id="link-contact" href="contact.html">Kontakt</a></li>
        <li><a id="link-cats" href="katter.html">Katter</a></li>
        <li><a id="link-cart" href="kundvagn.html">Kundvagn</a></li>
    </ul>
</nav>
`;

function addMenuEventListeners() {
    const home = document.getElementById('link-home');
    if (home) home.addEventListener('click', (e) => { e.preventDefault(); showHome(); });
    const about = document.getElementById('link-about');
    if (about) about.addEventListener('click', (e) => { e.preventDefault(); showAbout(); });
    const contact = document.getElementById('link-contact');
    if (contact) contact.addEventListener('click', (e) => { e.preventDefault(); showContact(); });
    const cats = document.getElementById('link-cats');
    if (cats) cats.addEventListener('click', (e) => { e.preventDefault(); showCats(); });
    const cartLink = document.getElementById('link-cart');
    if (cartLink) cartLink.addEventListener('click', (e) => { e.preventDefault(); showCart(); });
}

const showHome = () => {
    contentDiv.innerHTML = `
    ${menuHtml}
    <h1>Välkommen till Kattbutiken!</h1>
    <p>Här hittar du de mest fantastiska kattraserna från hela världen.</p>`;
    addMenuEventListeners();
};

const showAbout = () => {
    contentDiv.innerHTML = `
    ${menuHtml}
    <h1>Om ägaren</h1>
    <p>Kontakt: info@kattbutiken.se</p>
    <p>Adress: Kattgränd 1, Mjau-stad.</p>`;
    addMenuEventListeners();
};

const showContact = () => {
    contentDiv.innerHTML = `
    ${menuHtml}
    <h1>Kontakt</h1>
    <p>Du kan nå oss på <a href="mailto:info@kattbutiken.com">info@kattbutiken.com</a>.</p>`;
    addMenuEventListeners();
};

const showCats = () => {
    console.log('showCats körs');
    currentPage = 1; // Återställ till första sidan varje gång kattsidan visas
    contentDiv.innerHTML = `
        ${menuHtml}
        <h1>Våra Katter</h1>
        <input type="text" id="cat-search" placeholder="Sök kattnamn..." style="margin-bottom:15px;max-width:300px;width:100%;padding:8px;">
        <div id="cat-list-content"><p>Laddar katter...</p></div>
    `;
    addMenuEventListeners();
    const searchInput = document.getElementById('cat-search');
    if (searchInput) {
        searchInput.value = searchTerm;
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            currentPage = 1;
            renderCatList();
        });
    }
    fetchCats();
};

const showCart = () => {
    if (cart.length === 0) {
        contentDiv.innerHTML = `${menuHtml}<h1>Din Kundvagn</h1><p>Kundvagnen är tom.</p>`;
        addMenuEventListeners();
        return;
    }

    let html = `${menuHtml}<h1>Din Kundvagn</h1><ul class="cart-lis">`;

    cart.forEach((item, index) => {
        html += `
            <li>
                <strong>${item.name}</strong> - 1000 kr
                <button onclick="removeFromCart(${index})"> Ta bort</button>
            </li>`;
    });

    html += '</ul>';

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
    addMenuEventListeners();

    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').ariaValueMax;
        alert(`Tack för din beställning, ${name}! Vi skickar dina katter snart.`);
        cart = [];
        showHome();
    });
};

//Möjlighet att ta bort från kundvagnen
window.removeFromCart = (index) => {
    cart.slice(index, 1);
    showCart();
};
// FLYTTAD HIT: showCats måste finnas innan EventListeners körs

// 3. Resten av logiken
// ...existing code...
// ...existing code...
// ...existing code...

async function fetchCats() {
    console.log('fetchCats körs');
    try {
        const response = await fetch('https://api.thecatapi.com/v1/breeds?limit=30', {
            headers: CAT_API_KEY ? { 'x-api-key': CAT_API_KEY } : {}
        });
        console.log('fetch response:', response);
        if (!response.ok) {
            throw new Error(`Fel från API: ${response.status} ${response.statusText}`);
        }
        allBreeds = await response.json();
        console.log('allBreeds:', allBreeds);
        // Om vi är på kattsidan, rendera listan
        if (document.getElementById('cat-list-content')) {
            renderCatList();
        }
    } catch (error) {
        console.error('Fel i fetchCats:', error);
        const catListDiv = document.getElementById('cat-list-content');
        if (catListDiv) {
            catListDiv.innerHTML = `<p>Gick inte att hämta katter just nu.<br><span style='color:red;'>${error.message}</span></p>`;
        } else {
            contentDiv.innerHTML = `<p>Gick inte att hämta katter just nu.<br><span style='color:red;'>${error.message}</span></p>`;
        }
    }
}

function renderCatList() {
    console.log('renderCatList körs');
    // Filtrera katter baserat på sökterm (case-insensitive)
    let filteredBreeds = allBreeds;
    if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.trim().toLowerCase();
        filteredBreeds = allBreeds.filter(cat => cat.name.toLowerCase().includes(term));
    }
    // Justera currentPage om det behövs
    const maxPage = Math.max(1, Math.ceil(filteredBreeds.length / itemsPerPage));
    if (currentPage > maxPage) currentPage = maxPage;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const catsToShow = filteredBreeds.slice(start, end);

    console.log('catsToShow:', catsToShow);

    let html = '<div class="cat-grid">';
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

    html += `
    <div class="pagination">
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Föregående</button>
        <span>Sida ${currentPage} av ${maxPage}</span>
        <button onclick="changePage(1)" ${currentPage * itemsPerPage >= filteredBreeds.length ? 'disabled' : ''}>Nästa</button>
    </div>`;

    // Sätt HTML i rätt container
    const catListDiv = document.getElementById('cat-list-content');
    if (catListDiv) {
        catListDiv.innerHTML = html;
    } else {
        // fallback om container saknas
        contentDiv.innerHTML = html;
    }
}

window.changePage = (direction) => {
    currentPage += direction;
    renderCatList();
};

window.addToCart = (catId) => {
    const selectedCat = allBreeds.find(cat => cat.id === catId);
    cart.push(selectedCat);
    alert(`${selectedCat.name} har lagts till i kundvagn!`);
};



// Starta hemvyn
showHome();

