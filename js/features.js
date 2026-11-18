document.addEventListener("DOMContentLoaded", async () => {
    const readJSON = (key, fallback) => {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    };
    const writeJSON = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {}
    };
    const page = document.body.dataset.page || "dashboard";
    const rootPages = new Set(["dashboard", "login", "register"]);
    const prefix = rootPages.has(page) ? "" : "../";
    const isAuthPage = page === "login" || page === "register";
    const safeText = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

    if (page === "login" && new URLSearchParams(window.location.search).has("loggedout")) {
        localStorage.removeItem("miportal-current-user");
    }

    let currentUser = null;
    try {
        const sessionResponse = await fetch(`${prefix}api/session.php`, { credentials: "same-origin", cache: "no-store" });
        if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            currentUser = sessionData.user || null;
        }
    } catch (error) {
        currentUser = null;
    }

    if (!isAuthPage && !currentUser) {
        localStorage.removeItem("miportal-current-user");
        window.location.replace(`${prefix}login.html?required=1`);
        return;
    }
    if (isAuthPage && currentUser) {
        window.location.replace(`${prefix}index.html`);
        return;
    }
    if (!isAuthPage && currentUser) {
        localStorage.setItem("miportal-current-user", JSON.stringify(currentUser));
    }
    document.documentElement.classList.remove("auth-checking");

    const currentRole = currentUser?.role === "teacher" ? "teacher" : "student";
    const currentUserId = currentUser?.id || "guest";
    window.MiPortalUser = currentUser;
    const roleLabel = currentRole === "teacher" ? "Docente" : "Estudiante";
    const firstName = currentUser?.name?.trim().split(/\s+/)[0] || "";
    const fullName = currentUser?.name || "";
    const showField = value => value && String(value).trim() ? String(value) : "No registrado";

    document.querySelectorAll("[data-role]").forEach(node => { node.hidden = node.dataset.role !== currentRole; });
    document.querySelectorAll("[data-user-first-name], .user-name strong").forEach(node => { node.textContent = firstName; });
    document.querySelectorAll("[data-user-full-name], .profile-popover-user strong").forEach(node => { node.textContent = fullName; });
    document.querySelectorAll(".user-name small").forEach(node => { node.textContent = roleLabel; });
    document.querySelectorAll("[data-user-role-full], .profile-popover-user small").forEach(node => { node.textContent = `${roleLabel} UNAB`; });

    const refreshProfileUI = () => {
        const displayName = document.getElementById("profileDisplayName");
        const greetingName = document.getElementById("dashboardGreetingName");
        const displayProgram = document.getElementById("profileDisplayProgram");
        const displayEmail = document.getElementById("profileDisplayEmail");
        const statusLabel = document.getElementById("profileStatusLabel");
        const name = currentUser?.name || "";
        const first = name.trim().split(/\s+/)[0] || "";
        if (displayName) displayName.textContent = name;
        if (greetingName) greetingName.textContent = first;
        if (displayProgram) displayProgram.textContent = currentRole === "teacher" ? `Docente · ${currentUser?.program || "UNAB"}` : `Estudiante de ${currentUser?.program || "Ingeniería de Sistemas"}`;
        if (displayEmail) displayEmail.textContent = currentUser?.email || "No registrado";
        if (statusLabel) statusLabel.textContent = currentRole === "teacher" ? "Docente activo" : "Estudiante activo";
        const fields = { name, email: currentUser?.email, program: currentUser?.program, document: currentUser?.document, phone: currentUser?.phone, birthDate: currentUser?.birthDate, city: currentUser?.city, interests: currentUser?.interests, activities: currentUser?.activities, role: roleLabel };
        Object.entries(fields).forEach(([key, value]) => {
            document.querySelectorAll(`[data-profile-field="${key}"]`).forEach(node => { node.textContent = key === "role" || key === "name" || key === "email" || key === "program" ? (value || "No registrado") : showField(value); });
        });
        document.querySelectorAll("[data-user-first-name], .user-name strong").forEach(node => { node.textContent = first; });
        document.querySelectorAll("[data-user-full-name], .profile-popover-user strong").forEach(node => { node.textContent = name; });
    };
    refreshProfileUI();
    document.querySelectorAll("[data-student-only]").forEach(node => { node.hidden = currentRole !== "student"; });
    document.querySelectorAll("[data-teacher-only]").forEach(node => { node.hidden = currentRole !== "teacher"; });

    // The weekly leaderboard must show the authenticated student, never a prototype identity.
    const currentStudentRow = document.querySelector("#hoursLeaderboardBody tr.current-student");
    if (currentStudentRow) {
        if (currentRole !== "student") currentStudentRow.remove();
        else {
            const cells = currentStudentRow.querySelectorAll("td");
            if (cells[1]) cells[1].innerHTML = `${safeText(fullName)} <small>(Tú)</small>`;
            if (cells[2]) cells[2].textContent = currentUser?.program || "Programa no registrado";
        }
    }

    // Profile editor for every populated or empty personal field.
    const makeModal = (id, title, formMarkup) => {
        let overlay = document.getElementById(id);
        if (overlay) return overlay;
        overlay = document.createElement("div");
        overlay.className = "feature-modal-backdrop account-modal-backdrop";
        overlay.id = id;
        overlay.hidden = true;
        overlay.innerHTML = `<section class="feature-modal account-modal" role="dialog" aria-modal="true" aria-labelledby="${id}Title"><button class="feature-modal-close" type="button" data-modal-close aria-label="Cerrar">×</button><span class="eyebrow">MiPortal U Plus</span><h2 id="${id}Title">${title}</h2>${formMarkup}</section>`;
        document.body.appendChild(overlay);
        overlay.querySelectorAll("[data-modal-close]").forEach(button => button.addEventListener("click", () => { overlay.hidden = true; }));
        overlay.addEventListener("click", event => { if (event.target === overlay) overlay.hidden = true; });
        return overlay;
    };
    const profileFormMarkup = `<form id="profileEditForm" class="account-form-grid"><label>Nombre completo<input name="name" required maxlength="90"></label><label>Correo electrónico<input name="email" required type="email"></label><label>Programa o área<input name="program" maxlength="120"></label><label>Documento<input name="document" maxlength="30"></label><label>Teléfono<input name="phone" maxlength="30"></label><label>Fecha de nacimiento<input name="birthDate" type="date"></label><label>Ciudad<input name="city" maxlength="80"></label><label>Intereses<input name="interests" maxlength="160"></label><label class="account-form-wide">Actividades de interés<input name="activities" maxlength="180"></label><p class="feature-feedback account-form-wide" id="profileEditFeedback" aria-live="polite"></p><div class="feature-modal-actions account-form-wide"><button type="button" class="outline-button" data-modal-close>Cancelar</button><button type="submit" class="primary-button">Guardar cambios</button></div></form>`;
    document.querySelectorAll("[data-edit-profile]").forEach(button => button.addEventListener("click", () => {
        const modal = makeModal("profileEditModal", "Editar información personal", profileFormMarkup);
        const form = modal.querySelector("#profileEditForm");
        ["name", "email", "program", "document", "phone", "birthDate", "city", "interests", "activities"].forEach(key => { if (form.elements[key]) form.elements[key].value = currentUser?.[key] || (key === "program" ? currentUser?.program || "" : ""); });
        modal.hidden = false;
        form.onsubmit = async event => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            const feedback = form.querySelector("#profileEditFeedback");
            try {
                const response = await fetch(`${prefix}api/update-profile.php`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                const result = await response.json();
                if (!response.ok || !result.ok) throw new Error(result.message || "No se pudieron guardar los cambios.");
                currentUser = result.user;
                window.MiPortalUser = currentUser;
                localStorage.setItem("miportal-current-user", JSON.stringify(currentUser));
                refreshProfileUI();
                if (feedback) feedback.textContent = "Tus datos se actualizaron correctamente.";
                window.setTimeout(() => { modal.hidden = true; }, 650);
            } catch (error) { if (feedback) feedback.textContent = error.message; }
        };
    }));

    const passwordMarkup = `<form id="changePasswordForm" class="account-form-grid"><label class="account-form-wide">Contraseña actual<input name="currentPassword" type="password" autocomplete="current-password" required></label><label>Nueva contraseña<input name="newPassword" type="password" minlength="8" autocomplete="new-password" required></label><label>Confirmar nueva contraseña<input name="confirmPassword" type="password" minlength="8" autocomplete="new-password" required></label><p class="feature-feedback account-form-wide" id="changePasswordFeedback" aria-live="polite"></p><div class="feature-modal-actions account-form-wide"><button type="button" class="outline-button" data-modal-close>Cancelar</button><button type="submit" class="primary-button">Actualizar contraseña</button></div></form>`;
    document.querySelectorAll("[data-change-password]").forEach(button => button.addEventListener("click", () => {
        const modal = makeModal("changePasswordModal", "Cambiar contraseña", passwordMarkup);
        const form = modal.querySelector("#changePasswordForm");
        form.reset(); modal.hidden = false;
        form.onsubmit = async event => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            const feedback = form.querySelector("#changePasswordFeedback");
            if (data.newPassword.length < 8 || data.newPassword !== data.confirmPassword) { feedback.textContent = "La nueva contraseña debe tener al menos 8 caracteres y ambas coincidir."; return; }
            try {
                const response = await fetch(`${prefix}api/change-password.php`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
                const result = await response.json();
                if (!response.ok || !result.ok) throw new Error(result.message || "No se pudo cambiar la contraseña.");
                feedback.textContent = "Contraseña actualizada correctamente.";
                form.reset();
                window.setTimeout(() => { modal.hidden = true; }, 700);
            } catch (error) { feedback.textContent = error.message; }
        };
    }));

    const historyKey = "miportal-activity-history";
    const history = readJSON(historyKey, []);
    if (page !== "login" && page !== "register") {
        history.push({ page, at: Date.now() });
        writeJSON(historyKey, history.slice(-60));
    }
    const recordSearch = document.getElementById("globalSearch");
    let lastRecordedQuery = "";
    recordSearch?.addEventListener("input", () => {
        const query = recordSearch.value.trim();
        if (query.length < 2 || query.toLocaleLowerCase("es-CO") === lastRecordedQuery) return;
        lastRecordedQuery = query.toLocaleLowerCase("es-CO");
        const searches = readJSON("miportal-search-history", []);
        searches.push({ query, at: Date.now() });
        writeJSON("miportal-search-history", searches.slice(-30));
    });

    const quickItems = {
        courses: { title: "Mis cursos", detail: "Accede a tus materias", href: "pages/mis-cursos.html", color: "purple-card", icon: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"></path><path d="M4 5.5V20M8 7h8M8 11h7"></path>' },
        schedule: { title: "Horario", detail: "Consulta tus clases", href: "pages/horario.html", color: "orange-card", icon: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h6"></path>' },
        calendar: { title: "Calendario", detail: "Eventos y pendientes", href: "pages/calendario.html", color: "green-card", icon: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"></path>' },
        grades: { title: "Calificaciones", detail: "Revisa tu progreso", href: "pages/calificaciones.html", color: "pink-card", icon: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"></path>' },
        hours: { title: "Horas libres", detail: "Registra tu participación", href: "pages/horas-libres.html", color: "green-card", icon: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>' },
        services: { title: "Recursos", detail: "Servicios universitarios", href: "pages/servicios.html", color: "orange-card", icon: '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"></path>' },
        campus: { title: "Lugares y campus", detail: "Explora el mapa universitario", href: "pages/lugares-campus.html", color: "purple-card", icon: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"></path><path d="M9 3v15M15 6v15"></path>' },
        profile: { title: "Mi perfil", detail: "Consulta tus datos", href: "pages/perfil.html", color: "pink-card", icon: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>' }
    };
    const quickContainer = document.getElementById("quickLinks");
    if (quickContainer) {
        let selectedQuick = readJSON("miportal-quick-links", ["courses", "schedule", "calendar", "grades"]);
        const renderQuick = () => {
            quickContainer.innerHTML = selectedQuick.filter(id => quickItems[id]).map(id => {
                const item = quickItems[id];
                return `<a class="quick-card ${item.color}" href="${item.href}" data-dynamic-quick="${id}"><div class="quick-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg></div><span class="card-arrow">›</span><h2>${item.title}</h2><p>${item.detail}</p></a>`;
            }).join("");
        };
        const openQuickEditor = () => {
            let overlay = document.getElementById("quickAccessEditor");
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.className = "feature-modal-backdrop";
                overlay.id = "quickAccessEditor";
                overlay.hidden = true;
                overlay.innerHTML = `<section class="feature-modal" role="dialog" aria-modal="true" aria-labelledby="quickEditorTitle"><button class="feature-modal-close" type="button" data-close-quick aria-label="Cerrar">×</button><span class="eyebrow">Tu inicio</span><h2 id="quickEditorTitle">Personalizar accesos rápidos</h2><p>Selecciona los accesos que quieres mostrar en tu dashboard. Puedes ordenarlos con las flechas.</p><div class="quick-editor-list" id="quickEditorList"></div><p class="feature-feedback" id="quickEditorFeedback" aria-live="polite"></p><div class="feature-modal-actions"><button class="outline-button" type="button" data-close-quick>Cancelar</button><button class="primary-button" type="button" id="saveQuickAccess">Guardar cambios</button></div></section>`;
                document.body.appendChild(overlay);
                overlay.querySelectorAll("[data-close-quick]").forEach(button => button.addEventListener("click", () => overlay.hidden = true));
                overlay.addEventListener("click", event => { if (event.target === overlay) overlay.hidden = true; });
            }
            const list = overlay.querySelector("#quickEditorList");
            const renderOptions = () => {
                const displayOrder = [...selectedQuick, ...Object.keys(quickItems).filter(id => !selectedQuick.includes(id))];
                list.innerHTML = displayOrder.map(id => {
                    const item = quickItems[id];
                    const checked = selectedQuick.includes(id);
                    const index = selectedQuick.indexOf(id);
                    return `<div class="quick-editor-row" data-quick-row="${id}"><label><input type="checkbox" value="${id}" data-quick-check ${checked ? "checked" : ""}><span><strong>${item.title}</strong><small>${item.detail}</small></span></label><div class="quick-editor-order"><button type="button" data-quick-up="${id}" aria-label="Mover ${item.title} arriba" ${!checked || index === 0 ? "disabled" : ""}>↑</button><button type="button" data-quick-down="${id}" aria-label="Mover ${item.title} abajo" ${!checked || index === selectedQuick.length - 1 ? "disabled" : ""}>↓</button></div></div>`;
                }).join("");
            };
            renderOptions();
            list.onchange = event => {
                const input = event.target.closest("[data-quick-check]");
                if (!input) return;
                if (input.checked && !selectedQuick.includes(input.value)) selectedQuick.push(input.value);
                if (!input.checked) selectedQuick = selectedQuick.filter(id => id !== input.value);
                renderOptions();
            };
            list.onclick = event => {
                const up = event.target.closest("[data-quick-up]");
                const down = event.target.closest("[data-quick-down]");
                if (up) {
                    const index = selectedQuick.indexOf(up.dataset.quickUp);
                    if (index > 0) [selectedQuick[index - 1], selectedQuick[index]] = [selectedQuick[index], selectedQuick[index - 1]];
                    renderOptions();
                }
                if (down) {
                    const index = selectedQuick.indexOf(down.dataset.quickDown);
                    if (index >= 0 && index < selectedQuick.length - 1) [selectedQuick[index + 1], selectedQuick[index]] = [selectedQuick[index], selectedQuick[index + 1]];
                    renderOptions();
                }
            };
            overlay.querySelector("#saveQuickAccess").onclick = () => {
                if (!selectedQuick.length) {
                    overlay.querySelector("#quickEditorFeedback").textContent = "Selecciona al menos un acceso rápido.";
                    return;
                }
                selectedQuick = selectedQuick.slice(0, 6);
                writeJSON("miportal-quick-links", selectedQuick);
                renderQuick();
                overlay.hidden = true;
            };
            overlay.hidden = false;
        };
        renderQuick();
        document.getElementById("customizeQuickAccess")?.addEventListener("click", openQuickEditor);
    }

    const campuses = {
        jardin: { title: "Campus El Jardín", subtitle: "Campus principal · Bucaramanga", description: "El esquema recrea la distribución que compartiste: Bloque B y Biblioteca en la franja superior; Auditorio Mayor, Punto U y Plazoleta en la zona elevada; los caminos descienden hacia cafetería y la entrada del parqueadero. La ruta azul representa el sendero peatonal descendente y la amarilla la conexión de la zona superior.", services: ["Biblioteca", "Auditorio Mayor", "Punto U", "Plazoleta", "Edificios B, D y L", "Cafetería"], link: "https://unab.edu.co/campus/", map: true },
        csu: { title: "Centro de Servicios Universitarios (CSU)", subtitle: "Campus Octavio Cadena Gómez", description: "El CSU reúne servicios y espacios destinados al bienestar, la actividad física, la cultura y el acompañamiento universitario. Esta vista mantiene información general porque no se ha proporcionado un croquis de distribución para este campus.", services: ["Bienestar Universitario", "Departamento de Lenguas", "UNAB Tec", "Espacios deportivos y recreativos"], link: "https://unab.edu.co/campus/", map: false },
        bosque: { title: "Campus El Bosque", subtitle: "Floridablanca · Ciencias de la Salud", description: "Campus asociado a la formación en Ciencias de la Salud. La vista presenta información general y no dibuja ubicaciones internas que no estén respaldadas por un plano suministrado.", services: ["Facultad de Ciencias de la Salud", "Laboratorios especializados", "Espacios académicos y de estudio"], link: "https://unab.edu.co/campus/", map: false }
    };
    const places = {
        "block-b": { title: "Bloque B", campus: "Campus El Jardín", type: "Edificio señalado en el croquis", description: "El Bloque B aparece en la parte superior izquierda del esquema que compartiste. El croquis no especifica qué dependencias funcionan allí.", services: ["Referencia de ubicación", "Orientación dentro del campus"], link: "https://unab.edu.co/campus/" },
        library: { title: "Biblioteca", campus: "Campus El Jardín", type: "Estudio e investigación", description: "El croquis ubica la biblioteca en la parte superior, junto al Bloque B. La Biblioteca Central UNAB ofrece catálogo bibliográfico, recursos digitales y servicios de apoyo al estudio.", services: ["Consultar catálogo bibliográfico", "Acceder a recursos digitales", "Consultar salas y servicios", "Orientación bibliotecaria"], link: "https://unab.edu.co/sistema-de-bibliotecas-unab/" },
        auditorium: { title: "Auditorio Mayor", campus: "Campus El Jardín", type: "Auditorio", description: "El Auditorio Mayor aparece en la zona superior del croquis, junto al sector de Punto U y antes del descenso hacia la plazoleta. La posición representa tu esquema y no es una medición topográfica.", services: ["Referencia de ubicación", "Orientación para eventos y actividades"], link: "https://unab.edu.co/campus/" },
        "punto-u": { title: "Punto U", campus: "Campus El Jardín", type: "Punto de referencia", description: "Punto U está señalado en el costado izquierdo del Auditorio Mayor. Se conserva su nombre exactamente como aparece en el croquis.", services: ["Punto de referencia para orientarse"], link: "https://unab.edu.co/campus/" },
        "building-d": { title: "Edificio D", campus: "Campus El Jardín", type: "Edificio señalado en el croquis", description: "El Edificio D aparece en el sector inferior izquierdo del mapa, debajo de Punto U. El croquis no detalla sus dependencias internas.", services: ["Referencia de ubicación", "Orientación dentro del campus"], link: "https://unab.edu.co/campus/" },
        plaza: { title: "Plazoleta", campus: "Campus El Jardín", type: "Espacio abierto", description: "La plazoleta se representa en la zona central y elevada del croquis, entre el Auditorio Mayor y el camino que desciende hacia la entrada.", services: ["Punto de encuentro", "Espacio abierto", "Conexión peatonal"], link: "https://unab.edu.co/campus/" },
        "music-area": { title: "Parte para música", campus: "Campus El Jardín", type: "Zona identificada en el croquis", description: "El esquema marca una franja vertical como 'parte para música'. Se conserva esa denominación sin atribuirle una función institucional adicional que el croquis no confirma.", services: ["Referencia de ubicación"], link: "https://unab.edu.co/campus/" },
        "space-e": { title: "Espacio E", campus: "Campus El Jardín", type: "Punto por identificar", description: "El dibujo marca este espacio con la letra E. Su nombre y uso específico quedan pendientes de confirmación.", services: ["Referencia de ubicación"], link: "https://unab.edu.co/campus/" },
        "space-f": { title: "Espacio F", campus: "Campus El Jardín", type: "Punto por identificar", description: "El dibujo marca este espacio con la letra F. Su nombre y uso específico quedan pendientes de confirmación.", services: ["Referencia de ubicación"], link: "https://unab.edu.co/campus/" },
        "building-l": { title: "Edificio L", campus: "Campus El Jardín", type: "Edificio señalado en el croquis", description: "El Edificio L ocupa el costado derecho del esquema y se extiende en sentido vertical. El plano compartido no especifica qué programas o dependencias alberga.", services: ["Referencia de ubicación", "Orientación dentro del campus"], link: "https://unab.edu.co/campus/" },
        cafeteria: { title: "Cafetería", campus: "Campus El Jardín", type: "Servicio de alimentación", description: "La cafetería está señalada en la zona inferior derecha, cerca de la entrada del parqueadero y del punto donde confluyen los caminos azules.", services: ["Referencia de ubicación", "Servicio de alimentación"], link: "https://unab.edu.co/campus/" },
        "parking-entry": { title: "Entrada parqueadero", campus: "Campus El Jardín", type: "Acceso", description: "El croquis ubica la entrada del parqueadero en el borde inferior, al final del camino descendente. La ruta se dibuja como referencia de orientación.", services: ["Acceso y salida", "Referencia de llegada"], link: "https://unab.edu.co/campus/" }
    };
    const campusTabs = document.getElementById("campusTabs");
    const mapStage = document.getElementById("campusMapStage");
    const campusInfo = document.getElementById("otherCampusInfo");
    const campusDetail = document.getElementById("campusPlaceDetail");
    const directory = document.getElementById("placeDirectory");
    const favoritesList = document.getElementById("favoritePlacesList");
    if (campusTabs && mapStage && campusDetail && directory) {
        const favoriteStorageKey = `miportal-favorite-places:${currentUserId}`;
        let favoritePlaces = readJSON(favoriteStorageKey, readJSON("miportal-favorite-places", []));
        const renderFavoriteState = () => {
            document.querySelectorAll("[data-favorite-place]").forEach(button => {
                const active = favoritePlaces.includes(button.dataset.favoritePlace);
                button.classList.toggle("is-favorite", active);
                button.setAttribute("aria-pressed", String(active));
                button.textContent = active ? "★" : "☆";
            });
            const favoriteCount = document.getElementById("favoritePlaceCount");
            const favoriteCountLabel = document.getElementById("favoritePlaceCountLabel");
            if (favoriteCount) favoriteCount.textContent = favoritePlaces.length;
            if (favoriteCountLabel) favoriteCountLabel.textContent = favoritePlaces.length;
            if (favoritesList) {
                favoritesList.innerHTML = favoritePlaces.length ? favoritePlaces.map(id => `<button class="favorite-place-chip" type="button" data-show-place="${id}">★ ${safeText(places[id]?.title || id)}</button>`).join("") : `<p class="muted-note">Aún no guardas lugares favoritos. Selecciona la estrella de un espacio para guardarlo aquí.</p>`;
            }
        };
        const renderPlace = id => {
            const place = places[id];
            if (!place) return;
            campusDetail.innerHTML = `<div class="place-detail-top"><span class="eyebrow">${safeText(place.type)}</span><button type="button" class="favorite-place-button ${favoritePlaces.includes(id) ? "is-favorite" : ""}" data-favorite-place="${id}" aria-pressed="${favoritePlaces.includes(id)}" aria-label="Guardar ${safeText(place.title)} como favorito">${favoritePlaces.includes(id) ? "★" : "☆"}</button></div><h2>${safeText(place.title)}</h2><p class="place-campus-label">${safeText(place.campus)}</p><p>${safeText(place.description)}</p><h3>¿Qué encontrarás?</h3><ul>${place.services.map(service => `<li>${safeText(service)}</li>`).join("")}</ul><a class="outline-button" href="${place.link}" target="_blank" rel="noopener">Consultar información UNAB ↗</a>`;
            campusDetail.dataset.activePlace = id;
            renderFavoriteState();
        };
        const renderDirectory = () => {
            directory.innerHTML = Object.entries(places).map(([id, place]) => `<div class="place-directory-item"><button type="button" class="place-directory-open" data-show-place="${id}"><strong>${safeText(place.title)}</strong><small>${safeText(place.type)}</small></button><button type="button" class="favorite-place-button" data-favorite-place="${id}" aria-label="Guardar ${safeText(place.title)} como favorito" aria-pressed="${favoritePlaces.includes(id)}">${favoritePlaces.includes(id) ? "★" : "☆"}</button></div>`).join("");
            renderFavoriteState();
        };
        const selectCampus = id => {
            const campus = campuses[id];
            if (!campus) return;
            campusTabs.querySelectorAll("[data-campus]").forEach(button => {
                const active = button.dataset.campus === id;
                button.classList.toggle("active", active);
                button.setAttribute("aria-selected", String(active));
            });
            mapStage.hidden = !campus.map;
            const jardinDirectory = document.querySelector(".campus-directory-panel");
            if (jardinDirectory) jardinDirectory.hidden = !campus.map;
            if (campusInfo) {
                campusInfo.hidden = campus.map;
                campusInfo.innerHTML = campus.map ? "" : `<span class="eyebrow">Campus UNAB</span><h2>${safeText(campus.title)}</h2><small>${safeText(campus.subtitle)}</small><p>${safeText(campus.description)}</p><h3>Espacios y servicios</h3><ul>${campus.services.map(service => `<li>${safeText(service)}</li>`).join("")}</ul><a href="${campus.link}" target="_blank" rel="noopener" class="outline-button">Ver campus en la UNAB ↗</a>`;
            }
            if (campus.map) renderPlace("library");
            else campusDetail.innerHTML = `<span class="eyebrow">Campus seleccionado</span><h2>${safeText(campus.title)}</h2><p>${safeText(campus.description)}</p><a class="outline-button" href="${campus.link}" target="_blank" rel="noopener">Consultar información oficial ↗</a>`;
        };
        renderDirectory();
        renderPlace("library");
        campusTabs.addEventListener("click", event => {
            const button = event.target.closest("[data-campus]");
            if (button) selectCampus(button.dataset.campus);
        });
        mapStage.addEventListener("keydown", event => {
            const marker = event.target.closest("[data-campus-place]");
            if (marker && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                renderPlace(marker.dataset.campusPlace);
                mapStage.querySelectorAll("[data-campus-place]").forEach(item => item.classList.toggle("selected", item === marker));
            }
        });
        document.addEventListener("click", event => {
            const show = event.target.closest("[data-show-place]");
            if (show) {
                selectCampus("jardin");
                renderPlace(show.dataset.showPlace);
                document.querySelectorAll("[data-campus-place]").forEach(pin => pin.classList.toggle("selected", pin.dataset.campusPlace === show.dataset.showPlace));
            }
            const favorite = event.target.closest("[data-favorite-place]");
            if (favorite) {
                const id = favorite.dataset.favoritePlace;
                favoritePlaces = favoritePlaces.includes(id) ? favoritePlaces.filter(item => item !== id) : [...favoritePlaces, id];
                writeJSON(favoriteStorageKey, favoritePlaces);
                writeJSON("miportal-favorite-places", favoritePlaces);
                renderDirectory();
                if (campusDetail.dataset.activePlace) renderPlace(campusDetail.dataset.activePlace);
            }
            const pin = event.target.closest("[data-campus-place]");
            if (pin) {
                renderPlace(pin.dataset.campusPlace);
                document.querySelectorAll("[data-campus-place]").forEach(item => item.classList.toggle("selected", item === pin));
            }
        });
        const requestedPlace = new URLSearchParams(window.location.search).get("place");
        if (requestedPlace && places[requestedPlace]) renderPlace(requestedPlace);
    }

    const dashboardFavoritePlaces = document.getElementById("dashboardFavoritePlaces");
    if (dashboardFavoritePlaces) {
        const favoriteNames = {
            "block-b": "Bloque B", library: "Biblioteca", auditorium: "Auditorio Mayor", "punto-u": "Punto U",
            "building-d": "Edificio D", plaza: "Plazoleta", "music-area": "Parte para música", "space-e": "Espacio E",
            "space-f": "Espacio F", "building-l": "Edificio L", cafeteria: "Cafetería", "parking-entry": "Entrada parqueadero"
        };
        const favoriteIds = readJSON(`miportal-favorite-places:${currentUserId}`, readJSON("miportal-favorite-places", [])).filter(id => favoriteNames[id]);
        dashboardFavoritePlaces.innerHTML = favoriteIds.length
            ? favoriteIds.map(id => `<a class="dashboard-favorite-chip" href="pages/lugares-campus.html?place=${encodeURIComponent(id)}">★ ${safeText(favoriteNames[id])}</a>`).join("")
            : `<p class="muted-note">Todavía no has guardado lugares favoritos. Explora el campus y marca la estrella de tus espacios preferidos.</p>`;
    }

    const teacherGradeForm = document.getElementById("teacherGradeForm");
    if (teacherGradeForm) {
        const periodSelect = document.getElementById("teacherGradePeriod");
        const courseSelect = document.getElementById("teacherGradeCourse");
        const recordsNode = document.getElementById("teacherGradeRecords");
        const feedbackNode = document.getElementById("teacherGradeFeedback");
        const teacherGradeKey = `miportal-teacher-gradebook:${currentUserId}`;
        const fillTeacherCourses = () => {
            const period = periodSelect.value;
            const level = Number(period.split("-")[1]);
            const courses = window.MiPortalCurriculum?.semesters?.[level] || [];
            courseSelect.innerHTML = courses.map(course => `<option value="${safeText(course.name)}">${safeText(course.name)}</option>`).join("");
        };
        const readTeacherRecords = () => readJSON(teacherGradeKey, []);
        const renderTeacherRecords = records => {
            const ownRecords = records.filter(item => item.createdBy === currentUserId || item.teacherId === currentUserId);
            recordsNode.innerHTML = ownRecords.length ? ownRecords.slice().reverse().map(item => `<article class="teacher-grade-record"><div><strong>${safeText(item.course)}</strong><small>${safeText(item.studentName)} · ${safeText(item.studentEmail)} · ${safeText(item.period)}</small><small>${safeText(item.assessment)}</small></div><b>${Number(item.grade).toFixed(1).replace(".", ",")}</b></article>`).join("") : `<p class="muted-note">Todavía no has registrado calificaciones.</p>`;
        };
        fillTeacherCourses();
        periodSelect.addEventListener("change", fillTeacherCourses);
        renderTeacherRecords(readTeacherRecords());
        fetch(`${prefix}api/grades.php`, { credentials: "same-origin" }).then(response => response.ok ? response.json() : null).then(payload => {
            if (!payload?.ok || !Array.isArray(payload.grades)) return;
            const saved = readTeacherRecords();
            const merged = [...saved];
            payload.grades.forEach(item => { if (!merged.some(existing => existing.id === item.id)) merged.push(item); });
            writeJSON(teacherGradeKey, merged);
            renderTeacherRecords(merged);
        }).catch(() => {});
        teacherGradeForm.addEventListener("submit", async event => {
            event.preventDefault();
            if (currentRole !== "teacher") return;
            const data = new FormData(teacherGradeForm);
            const record = {
                studentName: String(data.get("studentName") || "").trim(),
                studentEmail: String(data.get("studentEmail") || "").trim().toLowerCase(),
                period: String(data.get("period") || "2026-4"),
                course: String(data.get("course") || ""),
                assessment: String(data.get("assessment") || "").trim(),
                grade: Number(data.get("grade")),
                createdBy: currentUserId,
                teacherName: currentUser?.name || "Docente"
            };
            if (record.studentName.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.studentEmail) || !/^2026-[1-4]$/.test(record.period) || !record.course || !record.assessment || !Number.isFinite(record.grade) || record.grade < 0 || record.grade > 5) {
                feedbackNode.textContent = "Verifica los datos. La nota debe estar entre 0 y 5.";
                return;
            }
            let savedOnServer = false;
            try {
                const response = await fetch(`${prefix}api/record-grade.php`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
                const payload = await response.json();
                if (!response.ok || !payload.ok) throw new Error(payload.message || "No fue posible guardar la nota.");
                record.id = payload.grade.id;
                savedOnServer = true;
            } catch (error) {
                record.id = `local-grade-${Date.now()}`;
                feedbackNode.textContent = `${error.message} Se guardará localmente en este navegador.`;
            }
            const records = readTeacherRecords();
            records.push(record);
            writeJSON(teacherGradeKey, records);
            renderTeacherRecords(records);
            if (savedOnServer) feedbackNode.textContent = "Calificación guardada correctamente para el estudiante.";
            teacherGradeForm.reset();
            periodSelect.value = "2026-4";
            fillTeacherCourses();
        });
    }

    const recommendationContainer = document.getElementById("recommendations");
    if (page === "servicios" && recommendationContainer) {
        const recent = readJSON(historyKey, []);
        const counts = recent.reduce((result, item) => { result[item.page] = (result[item.page] || 0) + 1; return result; }, {});
        const searchHistory = readJSON("miportal-search-history", []);
        const recommended = [
            { page: "horas-libres", title: "Actividades para tus Horas Libres", label: "Participación", description: "Consulta actividades, registra una propuesta y revisa tu avance hacia las 80 horas.", href: "horas-libres.html", image: "../assets/estudiantes-campus.jpg" },
            { page: "lugares-campus", title: "Explora lugares favoritos", label: "Campus", description: "Consulta espacios de la universidad y guarda los que visitas con frecuencia.", href: "lugares-campus.html", image: "../assets/campus-principal.jpg" },
            { page: "calendario", title: "Revisa tu agenda académica", label: "Organización", description: "Consulta fechas importantes y agrega recordatorios personales.", href: "calendario.html", image: "../assets/campus-recursos.jpg" },
            { page: "horario", title: "Organiza tu semana", label: "Académico", description: "Consulta tus clases y activa los recordatorios de horario.", href: "horario.html", image: "../assets/estudiantes-campus.jpg" },
            { page: "mis-cursos", title: "Continúa con tus materias", label: "Académico", description: "Revisa el pensum y los detalles de las asignaturas del periodo seleccionado.", href: "mis-cursos.html", image: "../assets/campus-recursos.jpg" },
            { page: "calificaciones", title: "Calcula tu promedio", label: "Académico", description: "Usa la calculadora de notas para estimar qué necesitas en tus evaluaciones.", href: "calificaciones.html", image: "../assets/campus-principal.jpg" }
        ];
        const topSearch = searchHistory.slice(-12).map(item => item.query.toLowerCase()).join(" ");
        const keywordScore = item => {
            const keywords = { "horas-libres": ["horas", "libres", "actividad", "voluntariado"], "lugares-campus": ["campus", "biblioteca", "edificio", "lugar"], calendario: ["calendario", "fecha", "evento"], horario: ["horario", "clases", "aula"], "mis-cursos": ["curso", "materia", "pensum"], calificaciones: ["nota", "calificación", "promedio"] }[item.page] || [];
            return keywords.reduce((score, word) => score + (topSearch.includes(word) ? 2 : 0), 0);
        };
        const sorted = recommended.map(item => ({ ...item, score: (counts[item.page] || 0) * 3 + keywordScore(item) })).sort((a, b) => b.score - a.score).slice(0, 3);
        recommendationContainer.innerHTML = sorted.map(item => `<article class="recommend-card"><img src="${item.image}" alt=""><div><span class="eyebrow">${item.label}</span><h3>${item.title}</h3><p>${item.description}</p><a class="outline-button" href="${item.href}">Abrir servicio ›</a></div></article>`).join("");
        const externalLinks = [
            { name: "Correo institucional", href: "https://mail.google.com/", detail: "Consulta tu correo UNAB" },
            { name: "Canvas", href: "https://canvas.unab.edu.co/", detail: "Entra a tus aulas virtuales" },
            { name: "Office 365", href: "https://portal.office.com/", detail: "Abre tus herramientas de productividad" },
            { name: "Cosmos", href: "https://cosmos.unab.edu.co/", detail: "Accede al sistema institucional" }
        ];
        recommendationContainer.insertAdjacentHTML("beforeend", `<section class="external-recommendation-links"><h3>Plataformas institucionales</h3><div>${externalLinks.map(item => `<a class="external-recommendation-link" href="${item.href}" target="_blank" rel="noopener noreferrer"><strong>${item.name}</strong><small>${item.detail}</small><b>↗</b></a>`).join("")}</div></section>`);
        const note = document.getElementById("recommendationActivityNote");
        if (note) note.textContent = recent.length ? "Estas sugerencias se ajustan a las secciones que has consultado en este prototipo." : "Empieza a explorar el portal para adaptar estas sugerencias a tus consultas.";
    }

    const completedHoursKey = `miportal-hours-completed:${currentUserId}`;
    const registeredActivitiesKey = `miportal-hour-event-registrations:${currentUserId}`;
    const localPublishedEventsKey = "miportal-published-hours-events";
    const readHoursRegistrations = () => readJSON(registeredActivitiesKey, []);
    const renderStudentEnrollments = () => {
        const node = document.getElementById("studentEnrollmentList");
        if (!node) return;
        const entries = readHoursRegistrations();
        node.innerHTML = entries.length ? entries.slice().reverse().map(item => `<article class="hours-request-card"><div><strong>${safeText(item.title)}</strong><small>${safeText(item.date)} · ${safeText(item.startTime || "Hora no indicada")} · ${safeText(item.place)} · ${Number(item.hours)} h</small></div><span class="request-status">Inscripción guardada</span></article>`).join("") : `<p class="muted-note">Aún no tienes inscripciones. Revisa los próximos eventos y selecciona “Inscribirme”.</p>`;
    };
    const getLocalDateISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    const prettyEventDate = iso => {
        const [year, month, day] = String(iso).split("-").map(Number);
        if (!year || !month || !day) return "Fecha por confirmar";
        return new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }).format(new Date(year, month-1, day, 12));
    };
    const setHoursCompletedDisplay = () => {
        const stored = localStorage.getItem(completedHoursKey);
        const legacy = localStorage.getItem("miportal-hours-completed");
        const completed = Math.max(0, Math.min(80, Number(stored ?? legacy ?? 48) || 0));
        const totalNode = document.getElementById("hoursCompletedStat");
        if (totalNode) totalNode.textContent = `${completed} h`;
        const circleValue = document.querySelector(".hours-total-circle strong");
        if (circleValue) circleValue.textContent = completed;
        const summaryText = document.querySelector(".hours-summary > p");
        if (summaryText) summaryText.textContent = `Has acumulado ${completed} de las 80 horas libres requeridas durante toda la carrera.`;
        const progress = document.querySelector(".hours-progress span");
        if (progress) progress.style.width = `${completed / 80 * 100}%`;
        const summaryFoot = document.querySelector(".hours-summary-foot strong");
        if (summaryFoot) summaryFoot.textContent = `${completed} / 80 h`;
    };
    const renderHoursEvent = event => {
        const container = document.getElementById("upcomingHoursEvents");
        if (!container || container.querySelector(`[data-event-id="${CSS.escape(event.id)}"]`)) return;
        const card = document.createElement("article");
        card.className = "hours-event teacher-created-event";
        card.dataset.eventId = event.id;
        card.dataset.eventDate = event.date;
        card.dataset.startTime = event.startTime || "09:00";
        card.dataset.hours = String(event.hours || 1);
        card.dataset.place = event.place || "Campus UNAB";
        card.innerHTML = `<span class="hours-event-icon purple">✦</span><div><strong>${safeText(event.title)}</strong><small class="dynamic-event-date">${safeText(prettyEventDate(event.date))} · ${safeText(event.startTime || "09:00")}</small><p>${safeText(event.description || event.category || "Actividad de Horas Libres")}</p></div><span class="hours-value">${Number(event.hours)} h</span>`;
        container.appendChild(card);
        addEnrollmentButton(card);
    };
    const addEnrollmentButton = card => {
        if (!card || currentRole !== "student" || card.querySelector("[data-enroll-event]")) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "outline-button hours-enroll-button";
        button.dataset.enrollEvent = "true";
        button.textContent = "Inscribirme";
        card.appendChild(button);
        const existing = readHoursRegistrations().some(item => item.eventId === card.dataset.eventId);
        if (existing) { button.textContent = "Inscrito ✓"; button.disabled = true; }
    };
    const loadPublishedHoursEvents = async () => {
        const localEvents = readJSON(localPublishedEventsKey, []);
        localEvents.forEach(renderHoursEvent);
        try {
            const response = await fetch(`${prefix}api/hours-events.php`, { credentials: "same-origin" });
            if (!response.ok) return;
            const payload = await response.json();
            if (!payload.ok || !Array.isArray(payload.events)) return;
            if (Array.isArray(payload.enrollments) && currentRole === "student") {
                const existingEnrollments = readHoursRegistrations();
                const mergedEnrollments = [...existingEnrollments];
                payload.enrollments.forEach(item => {
                    if (!mergedEnrollments.some(existing => existing.eventId === item.eventId)) {
                        mergedEnrollments.push({ ...item, period: item.period || localStorage.getItem("miportal-academic-period") || "2026-4" });
                    }
                });
                writeJSON(registeredActivitiesKey, mergedEnrollments);
                renderStudentEnrollments();
                window.dispatchEvent(new Event("miportal:schedule-updated"));
            }
            const merged = [...localEvents];
            payload.events.forEach(event => {
                if (!merged.some(item => item.id === event.id)) merged.push(event);
                renderHoursEvent(event);
            });
            writeJSON(localPublishedEventsKey, merged);
            if (currentRole === "teacher") {
                const ownEvents = payload.events.filter(item => item.createdBy === currentUserId);
                const requestListNode = document.getElementById("hoursRequestList");
                if (requestListNode && ownEvents.length) requestListNode.innerHTML = ownEvents.slice().reverse().map(item => `<article class="hours-request-card"><div><strong>${safeText(item.title)}</strong><small>${safeText(item.date)} · ${safeText(item.startTime)} · ${safeText(item.place)} · ${Number(item.hours)} h</small></div><span class="request-status">Publicada · Servidor</span></article>`).join("");
                const pendingNode = document.getElementById("hoursPendingCount");
                if (pendingNode) pendingNode.textContent = ownEvents.length;
            }
        } catch {}
        document.querySelectorAll(".hours-event[data-event-id]").forEach(addEnrollmentButton);
        const count = document.getElementById("hoursUpcomingCount");
        if (count) count.textContent = document.querySelectorAll(".hours-event[data-event-id]").length;
    };

    if (document.getElementById("hoursCompletedStat")) {
        setHoursCompletedDisplay();
        document.querySelectorAll(".hours-event[data-day-offset]").forEach(card => {
            const offset = Number(card.dataset.dayOffset || 0);
            const date = new Date();
            date.setHours(12,0,0,0);
            date.setDate(date.getDate() + offset);
            const iso = getLocalDateISO(date);
            card.dataset.eventDate = iso;
            const dateNode = card.querySelector(".dynamic-event-date");
            if (dateNode) dateNode.textContent = `${prettyEventDate(iso)} · ${card.dataset.startTime || "09:00"}`;
            card.dataset.place = card.dataset.place || "Campus El Jardín";
        });
        if (currentRole === "student") {
            document.querySelectorAll(".hours-event[data-event-id]").forEach(addEnrollmentButton);
            renderStudentEnrollments();
        }
        const activityForm = document.getElementById("hoursActivityForm");
        activityForm?.addEventListener("submit", async event => {
            event.preventDefault();
            if (currentRole !== "teacher") return;
            const data = new FormData(activityForm);
            const record = {
                id: `local-hl-${Date.now()}`,
                title: String(data.get("title") || "").trim(),
                place: String(data.get("place") || "").trim(),
                date: String(data.get("date") || ""),
                startTime: String(data.get("startTime") || "09:00"),
                hours: Number(data.get("hours")),
                category: String(data.get("category") || "Servicio universitario"),
                description: String(data.get("description") || "").trim(),
                createdBy: currentUserId,
                createdByName: currentUser?.name || "Docente"
            };
            const dateParts = record.date.split("-").map(Number);
            const validDate = dateParts.length === 3 && dateParts[0] >= 2026 && dateParts[1] >= 1 && dateParts[1] <= 12 && dateParts[2] >= 1 && dateParts[2] <= 31;
            if (record.title.length < 4 || record.place.length < 2 || !validDate || !/^([01]\d|2[0-3]):[0-5]\d$/.test(record.startTime) || !Number.isInteger(record.hours) || record.hours < 1 || record.hours > 8) {
                const feedback = document.getElementById("hoursActivityFeedback");
                if (feedback) feedback.textContent = "Completa los campos. La duración debe estar entre 1 y 8 horas.";
                return;
            }
            const feedback = document.getElementById("hoursActivityFeedback");
            let published = false;
            try {
                const response = await fetch(`${prefix}api/register-hours.php`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
                const payload = await response.json();
                if (!response.ok || !payload.ok) throw new Error(payload.message || "No se pudo publicar en el servidor.");
                record.id = payload.event.id;
                published = true;
            } catch (error) {
                if (feedback) feedback.textContent = `${error.message} Se conservará localmente para esta demostración.`;
            }
            const saved = readJSON(localPublishedEventsKey, []);
            saved.push(record);
            writeJSON(localPublishedEventsKey, saved);
            renderHoursEvent(record);
            const ownEvents = saved.filter(item => item.createdBy === currentUserId);
            const requestListNode = document.getElementById("hoursRequestList");
            if (requestListNode) requestListNode.innerHTML = ownEvents.slice().reverse().map(item => `<article class="hours-request-card"><div><strong>${safeText(item.title)}</strong><small>${safeText(item.date)} · ${safeText(item.startTime)} · ${safeText(item.place)} · ${Number(item.hours)} h</small></div><span class="request-status">Publicada${published ? " · Servidor" : " · Local"}</span></article>`).join("") || `<p class="muted-note">Todavía no has publicado actividades.</p>`;
            const pendingNode = document.getElementById("hoursPendingCount");
            if (pendingNode) pendingNode.textContent = ownEvents.length;
            if (feedback && published) feedback.textContent = "Actividad publicada. Los estudiantes ya pueden verla e inscribirse.";
            activityForm.reset();
            const count = document.getElementById("hoursUpcomingCount");
            if (count) count.textContent = document.querySelectorAll(".hours-event[data-event-id]").length;
        });
        document.addEventListener("click", async event => {
            const button = event.target.closest("[data-enroll-event]");
            if (!button || currentRole !== "student") return;
            const card = button.closest(".hours-event");
            if (!card) return;
            const record = {
                eventId: card.dataset.eventId,
                title: card.querySelector("strong")?.textContent || "Actividad de Horas Libres",
                date: card.dataset.eventDate,
                startTime: card.dataset.startTime || "09:00",
                place: card.dataset.place || "Campus UNAB",
                hours: Number(card.dataset.hours || card.querySelector(".hours-value")?.textContent.match(/\d+/)?.[0] || 1),
                period: localStorage.getItem("miportal-academic-period") || "2026-4",
                status: "Inscripción registrada"
            };
            if (!record.eventId || !record.date) return;
            const registrations = readHoursRegistrations();
            if (!registrations.some(item => item.eventId === record.eventId)) {
                registrations.push(record);
                writeJSON(registeredActivitiesKey, registrations);
                window.dispatchEvent(new Event("miportal:schedule-updated"));
            }
            button.textContent = "Inscrito ✓";
            button.disabled = true;
            renderStudentEnrollments();
            try {
                const response = await fetch(`${prefix}api/enroll-hours.php`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
                const payload = await response.json();
                if (!response.ok || !payload.ok) console.warn(payload.message || "Inscripción guardada en este navegador.");
            } catch {}
        });
        loadPublishedHoursEvents();
    }

    if (page === "calificaciones" && currentRole === "student") {
        const cachedStudentGrades = readJSON(`miportal-personal-grades:${currentUserId}`, []);
        const renderPersonalGrades = records => {
            const body = document.getElementById("gradeTableBody");
            if (!body || !Array.isArray(records)) return;
            body.querySelectorAll(".published-grade-row").forEach(row => row.remove());
            records.forEach(item => {
                const row = document.createElement("tr");
                row.className = "published-grade-row";
                row.innerHTML = `<td>${safeText(item.course)}<small class="grade-assessment-label">${safeText(item.assessment)} · ${safeText(item.period)}</small></td><td>—</td><td><strong>${Number(item.grade).toFixed(1).replace(".", ",")}</strong></td><td><span class="grade-status">Publicada</span></td>`;
                body.appendChild(row);
            });
        };
        renderPersonalGrades(cachedStudentGrades);
        fetch(`${prefix}api/grades.php`, { credentials: "same-origin" }).then(response => response.ok ? response.json() : null).then(payload => {
            if (!payload?.ok || !Array.isArray(payload.grades) || !payload.grades.length) return;
            const records = payload.grades;
            renderPersonalGrades(records);
            const cacheKey = `miportal-personal-grades:${currentUserId}`;
            writeJSON(cacheKey, records);
        }).catch(() => {});
    }

    const reminderToggle = document.getElementById("enableClassReminders");
    const reminderSetting = document.querySelector("[data-schedule-reminder-setting]");
    const reminderStatus = document.getElementById("classReminderStatus");
    const reminderKey = "miportal-class-reminders-enabled";
    const remindersEnabled = () => localStorage.getItem(reminderKey) === "true";
    const syncReminderControls = () => {
        if (reminderToggle) reminderToggle.checked = remindersEnabled();
        if (reminderSetting) reminderSetting.checked = remindersEnabled();
    };
    const setReminders = async enabled => {
        if (enabled && !("Notification" in window)) {
            localStorage.setItem(reminderKey, "false");
            if (reminderStatus) reminderStatus.textContent = "Este navegador no permite notificaciones de escritorio. Puedes revisar las próximas clases dentro del portal.";
            syncReminderControls();
            return;
        }
        if (enabled && Notification.permission === "default") await Notification.requestPermission();
        if (enabled && Notification.permission !== "granted") {
            localStorage.setItem(reminderKey, "false");
            if (reminderStatus) reminderStatus.textContent = "No se concedió el permiso de notificaciones. Puedes activarlo desde los permisos del navegador.";
        } else {
            localStorage.setItem(reminderKey, String(enabled));
            if (reminderStatus) reminderStatus.textContent = enabled ? "Recordatorios activados: recibirás un aviso 10 minutos antes de la clase mientras el portal esté abierto." : "Recordatorios desactivados.";
        }
        syncReminderControls();
    };
    syncReminderControls();
    reminderToggle?.addEventListener("change", () => setReminders(reminderToggle.checked));
    reminderSetting?.addEventListener("change", () => setReminders(reminderSetting.checked));
    if (reminderStatus) reminderStatus.textContent = remindersEnabled() ? "Recordatorios activados. Mantén el portal abierto para recibir avisos." : "Activa esta opción para recibir avisos 10 minutos antes de tus clases.";

    const getBogotaParts = () => {
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Bogota", weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
        return Object.fromEntries(parts.map(part => [part.type, part.value]));
    };
    const buildScheduleForPeriod = period => {
        const schedule = window.MiPortalSchedule;
        const curriculum = window.MiPortalCurriculum;
        const level = Number(String(period).split("-")[1]);
        const courses = curriculum?.semesters?.[level] || [];
        const placements = schedule?.patterns?.[period] || [];
        if (!schedule || !courses.length || !placements.length) return [];
        return courses.map((course, index) => {
            const placement = placements[index % placements.length];
            const slot = schedule.slots[placement.slot];
            if (!slot) return null;
            return { course: course.name, day: placement.day, start: slot.start, end: slot.end, startMinutes: Number(slot.start.slice(0, 2)) * 60 + Number(slot.start.slice(3)), endMinutes: Number(slot.end.slice(0, 2)) * 60 + Number(slot.end.slice(3)) };
        }).filter(Boolean);
    };
    const reminderCheck = () => {
        if (!remindersEnabled() || !("Notification" in window) || Notification.permission !== "granted") return;
        const values = getBogotaParts();
        const weekdayIndex = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 }[values.weekday] ?? -1;
        if (weekdayIndex < 0) return;
        const nowMinutes = Number(values.hour) * 60 + Number(values.minute);
        const period = localStorage.getItem("miportal-academic-period") || "2026-4";
        const classes = buildScheduleForPeriod(period).filter(item => item.day === weekdayIndex && item.startMinutes - nowMinutes <= 10 && item.startMinutes - nowMinutes >= 0);
        const dayKey = `${values.year}-${values.month}-${values.day}`;
        const notified = readJSON("miportal-notified-classes", []);
        classes.forEach(item => {
            const key = `${dayKey}|${period}|${item.course}|${item.start}`;
            if (notified.includes(key)) return;
            const remainingMinutes = item.startMinutes - nowMinutes;
            new Notification("Tu próxima clase comienza pronto", { body: `${item.course} · ${item.start}. ${remainingMinutes === 0 ? "Comienza ahora." : `Faltan ${remainingMinutes} minuto${remainingMinutes === 1 ? "" : "s"}.`}`, tag: key });
            notified.push(key);
        });
        writeJSON("miportal-notified-classes", notified.slice(-80));
    };
    if (remindersEnabled()) reminderCheck();
    window.setInterval(reminderCheck, 30000);

    const registerForm = document.getElementById("registerForm");
    registerForm?.addEventListener("submit", async event => {
        event.preventDefault();
        const feedback = document.getElementById("registerFeedback");
        const data = new FormData(registerForm);
        const password = String(data.get("password") || "");
        const confirmation = String(data.get("confirmPassword") || "");
        if (password.length < 8) {
            if (feedback) feedback.textContent = "La contraseña debe tener al menos 8 caracteres.";
            return;
        }
        if (password !== confirmation) {
            if (feedback) feedback.textContent = "Las contraseñas no coinciden.";
            return;
        }
        const payload = { name: String(data.get("name") || "").trim(), email: String(data.get("email") || "").trim(), program: String(data.get("program") || "Ingeniería de Sistemas"), role: String(data.get("role") || "student"), password };
        try {
            const response = await fetch("api/register-user.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (!response.ok || !result.ok) throw new Error(result.message || "No fue posible crear la cuenta.");
            writeJSON("miportal-current-user", result.user);
            if (feedback) feedback.textContent = "Cuenta creada correctamente. Abriendo tu portal...";
            window.location.href = "index.html";
        } catch (error) {
            if (feedback) feedback.textContent = error.message || "No se pudo conectar con el servidor PHP. Consulta el README para iniciarlo.";
        }
    });

    const loginForm = document.getElementById("loginForm");
    loginForm?.addEventListener("submit", async event => {
        event.preventDefault();
        const feedback = document.getElementById("loginFeedback");
        const data = new FormData(loginForm);
        try {
            const response = await fetch("api/login.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
            const result = await response.json();
            if (!response.ok || !result.ok) throw new Error(result.message || "No se pudo iniciar sesión.");
            writeJSON("miportal-current-user", result.user);
            if (feedback) feedback.textContent = "Sesión iniciada. Abriendo tu portal...";
            window.location.href = "index.html";
        } catch (error) {
            if (feedback) feedback.textContent = error.message || "Activa el servidor PHP local para validar tu cuenta.";
        }
    });
});
