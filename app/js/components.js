const navbar = document.getElementById('navbar')
const navbarItems = navbar.getElementsByClassName('navbarItem')

// Set the navbar
navbar.innerHTML = `
<a href="index.html"  class="navbarItem">
    <i class="fa-solid fa-house"></i>
    <span>
        Home
    </span>
</a>
<a href="chatbot.html" class="navbarItem">
    <i class="fa-solid fa-lightbulb"></i>
    <span>
        Help
    </span>
</a>
<a href="#" class="navbarItem">
    <i class="fa-solid fa-location-dot"></i>
    <span>
        Map
    </span>
</a>
<a href="#" class="navbarItem">
    <i class="fa-solid fa-gear"></i>
    <span>
        Settings
    </span>
</a>
`

// Set the active class to the current page
let url = window.location.pathname;
if (url === "/") url += "index.html";

for (let i = 0; i < navbarItems.length; i++) {
    let navbarItemsHref = navbarItems[i].href.replace("http://localhost:5173", "")

    if (url === navbarItemsHref) {
        navbarItems[i].style.setProperty("color", "var(--primary)");
    }
}