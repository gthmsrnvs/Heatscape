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
<a href="https://www.figma.com/proto/f08fZuaZlyEmnoRLUH5ViL/DECO3200-Iteration-6?type=design&node-id=22675-6024&t=QWBPD5fZL8SYN6QQ-0&scaling=scale-down&page-id=5322%3A0&starting-point-node-id=22675%3A5944" class="navbarItem">
    <i class="fa-solid fa-lightbulb"></i>
    <span>
        Help
    </span>
</a>
<a href="https://www.figma.com/proto/f08fZuaZlyEmnoRLUH5ViL/DECO3200-Iteration-6?type=design&node-id=22754-11634&t=QWBPD5fZL8SYN6QQ-0&scaling=scale-down&page-id=5322%3A0&starting-point-node-id=22675%3A5944" class="navbarItem">
    <i class="fa-solid fa-location-dot"></i>
    <span>
        Map
    </span>
</a>
<a href="https://www.figma.com/proto/f08fZuaZlyEmnoRLUH5ViL/DECO3200-Iteration-6?type=design&node-id=23578-11141&t=QWBPD5fZL8SYN6QQ-0&scaling=scale-down&page-id=5322%3A0" class="navbarItem">
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
    let navbarItemsHref = navbarItems[i].href.substring(navbarItems[i].href.lastIndexOf('/'));

    if (url === navbarItemsHref) {
        navbarItems[i].style.setProperty("color", "var(--primary)");
    }
}