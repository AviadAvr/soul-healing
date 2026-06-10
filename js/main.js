/* =========================================================
   Soul Pathways — main.js
   Mobile nav toggle, menu close on link click, footer year
   ========================================================= */
(function () {
    "use strict";

    // --- Mobile navigation toggle ---
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        // Close the menu after a link is tapped (mobile)
        menu.addEventListener("click", function (e) {
            if (e.target.closest(".nav__link")) {
                menu.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // --- Current year in footer ---
    var yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
})();

