document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const root = document.documentElement;
    const readStorage = (key, fallback = null) => {
        try { const value = localStorage.getItem(key); return value === null ? fallback : value; }
        catch { return fallback; }
    };
    const writeStorage = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
    const reduceMotionInput = document.querySelector("[data-reduce-motion]");

    const applyReducedMotion = enabled => {
        root.classList.toggle("reduce-motion", enabled);
        body.classList.toggle("reduce-motion", enabled);
        if (reduceMotionInput) reduceMotionInput.checked = enabled;
        writeStorage("miportal-reduce-motion", String(enabled));
    };
    applyReducedMotion(readStorage("miportal-reduce-motion", "false") === "true");
    reduceMotionInput?.addEventListener("change", () => applyReducedMotion(reduceMotionInput.checked));

    const themeGroups = [...document.querySelectorAll(".theme-icons")];
    const themeButtons = [...document.querySelectorAll("[data-theme]")];
    const applyTheme = (theme, animate = false) => {
        const chosen = theme === "dark" ? "dark" : "light";
        body.classList.toggle("dark-mode", chosen === "dark");
        themeGroups.forEach(group => {
            group.dataset.activeTheme = chosen;
            group.classList.remove("is-jumping");
            if (animate && !root.classList.contains("reduce-motion")) {
                void group.offsetWidth;
                group.classList.add("is-jumping");
                group.addEventListener("animationend", () => group.classList.remove("is-jumping"), { once: true });
            }
        });
        themeButtons.forEach(button => {
            const active = button.dataset.theme === chosen;
            button.classList.toggle("selected", active);
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        writeStorage("miportal-theme", chosen);
    };
    applyTheme(readStorage("miportal-theme", "light"), false);
    themeButtons.forEach(button => button.addEventListener("click", event => {
        event.preventDefault();
        if (button.dataset.theme !== (body.classList.contains("dark-mode") ? "dark" : "light")) applyTheme(button.dataset.theme, true);
    }));

    const dropdowns = [
        { trigger: document.getElementById("notificationToggle"), menu: document.getElementById("notificationPopover"), wrapper: document.querySelector(".notification-wrap") },
        { trigger: document.getElementById("profileToggle"), menu: document.getElementById("profilePopover"), wrapper: document.querySelector(".profile-wrap") }
    ].filter(item => item.trigger && item.menu);
    const closeDropdown = item => {
        if (item.menu.hidden || item.menu.classList.contains("is-closing")) return;
        item.menu.classList.remove("is-open");
        item.menu.classList.add("is-closing");
        item.wrapper?.classList.remove("open");
        item.trigger.setAttribute("aria-expanded", "false");
        item.closeTimer = window.setTimeout(() => {
            item.menu.hidden = true;
            item.menu.classList.remove("is-closing");
        }, root.classList.contains("reduce-motion") ? 1 : 180);
    };
    const closeDropdowns = except => dropdowns.forEach(item => { if (item !== except) closeDropdown(item); });
    dropdowns.forEach(item => {
        item.trigger.addEventListener("click", event => {
            event.stopPropagation();
            const open = item.menu.hidden || item.menu.classList.contains("is-closing");
            closeDropdowns(item);
            if (open) {
                window.clearTimeout(item.closeTimer);
                item.menu.hidden = false;
                item.menu.classList.remove("is-closing");
                void item.menu.offsetWidth;
                item.menu.classList.add("is-open");
                item.wrapper?.classList.add("open");
                item.trigger.setAttribute("aria-expanded", "true");
            } else closeDropdown(item);
        });
        item.menu.addEventListener("click", event => event.stopPropagation());
    });
    document.addEventListener("click", event => {
        dropdowns.forEach(item => { if (!item.wrapper?.contains(event.target)) closeDropdown(item); });
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeDropdowns();
            closeInfoDialog();
        }
    });

    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    const menuButton = document.getElementById("mobileMenu");
    const closeMobileMenu = () => {
        sidebar?.classList.remove("mobile-open");
        backdrop?.classList.remove("visible");
        menuButton?.setAttribute("aria-expanded", "false");
    };
    menuButton?.addEventListener("click", () => {
        const opening = !sidebar?.classList.contains("mobile-open");
        sidebar?.classList.toggle("mobile-open", opening);
        backdrop?.classList.toggle("visible", opening);
        menuButton.setAttribute("aria-expanded", String(opening));
    });
    backdrop?.addEventListener("click", closeMobileMenu);
    document.querySelectorAll(".nav-item").forEach(link => link.addEventListener("click", closeMobileMenu));

    const openInfoDialog = (title, content) => {
        let wrapper = document.getElementById("infoDialogBackdrop");
        if (!wrapper) {
            document.body.insertAdjacentHTML("beforeend", `<div class="info-dialog-backdrop" id="infoDialogBackdrop" hidden><section class="info-dialog" role="dialog" aria-modal="true" aria-labelledby="infoDialogTitle"><button class="info-dialog-close" type="button" aria-label="Cerrar">×</button><span class="eyebrow">MiPortal U Plus</span><h2 id="infoDialogTitle"></h2><div id="infoDialogContent"></div><button class="primary-button info-dialog-ok" type="button">Entendido</button></section></div>`);
            wrapper = document.getElementById("infoDialogBackdrop");
            wrapper.querySelectorAll(".info-dialog-close,.info-dialog-ok").forEach(button => button.addEventListener("click", closeInfoDialog));
            wrapper.addEventListener("click", event => { if (event.target === wrapper) closeInfoDialog(); });
        }
        wrapper.querySelector("#infoDialogTitle").textContent = title;
        wrapper.querySelector("#infoDialogContent").innerHTML = content;
        wrapper.hidden = false;
        wrapper.querySelector(".info-dialog-close")?.focus();
    };
    function closeInfoDialog() {
        const wrapper = document.getElementById("infoDialogBackdrop");
        if (wrapper) wrapper.hidden = true;
    }

    const isNestedPage = body.dataset.page && body.dataset.page !== "dashboard" && body.dataset.page !== "login";
    const prefix = isNestedPage ? "../" : "";
    const search = document.getElementById("globalSearch");
    const searchBox = search?.closest(".search-box");
    if (search && searchBox) {
        const suggestions = document.createElement("div");
        suggestions.className = "search-suggestions";
        suggestions.id = "globalSearchSuggestions";
        suggestions.hidden = true;
        searchBox.insertAdjacentElement("afterend", suggestions);
        search.setAttribute("aria-controls", suggestions.id);
        search.setAttribute("aria-autocomplete", "list");
        const destinations = [
            { title: "Inicio", detail: "Panel principal", terms: "inicio dashboard principal", href: "index.html" },
            { title: "Mis cursos", detail: "Asignaturas y docentes", terms: "cursos materias asignaturas pensum notas", href: "pages/mis-cursos.html" },
            { title: "Horario", detail: "Clases de la semana", terms: "horario clases aula semana calendario", href: "pages/horario.html" },
            { title: "Calendario", detail: "Fechas y eventos académicos", terms: "calendario agenda fechas eventos", href: "pages/calendario.html" },
            { title: "Calificaciones", detail: "Notas y rendimiento", terms: "calificaciones notas promedio rendimiento", href: "pages/calificaciones.html" },
            { title: "Recursos y servicios", detail: "Biblioteca, certificados y soporte", terms: "recursos servicios biblioteca certificados soporte bienestar pagos matrícula tecnología", href: "pages/servicios.html" },
            { title: "Biblioteca", detail: "Catálogo y recursos digitales", terms: "biblioteca libros base datos salas estudio", href: "pages/servicios.html#biblioteca" },
            { title: "Certificados", detail: "Documentos académicos", terms: "certificados constancias documentos", href: "pages/servicios.html#certificados" },
            { title: "Soporte técnico", detail: "Ayuda con plataformas y acceso", terms: "soporte tecnología correo contraseña plataforma", href: "pages/servicios.html#soporte" },
            { title: "Bienestar universitario", detail: "Actividades y acompañamiento", terms: "bienestar deporte cultura actividades", href: "pages/servicios.html#bienestar" },
            { title: "Horas libres", detail: "Registro, eventos y ranking", terms: "horas libres actividades voluntariado ranking", href: "pages/horas-libres.html" },
            { title: "Lugares y campus", detail: "Espacios e instalaciones", terms: "lugares campus mapa salones edificios", href: "pages/lugares-campus.html" },
            { title: "Mi perfil", detail: "Información personal", terms: "perfil usuario cuenta datos personales", href: "pages/perfil.html" },
            { title: "Configuración", detail: "Apariencia y preferencias", terms: "configuración tema oscuro claro animaciones preferencias", href: "pages/configuracion.html" },
            { title: "Notificaciones", detail: "Avisos académicos y eventos", terms: "notificaciones avisos mensajes correos", href: "pages/notificaciones.html" },
            { title: "Mapa interactivo del campus", detail: "Ubica edificios y espacios UNAB", terms: "mapa campus biblioteca edificio ingeniería plazoleta auditorio reloj solar", href: "pages/lugares-campus.html" },
            { title: "Mis lugares favoritos", detail: "Espacios que guardaste", terms: "favoritos lugares campus guardados", href: "pages/lugares-campus.html#favoritePlacesListPanel" },
            { title: "Registrar una actividad de Horas Libres", detail: "Propón una actividad o lugar", terms: "registrar actividad lugar horas libres voluntariado", href: "pages/horas-libres.html#activityRegistration" },
            { title: "Correo institucional", detail: "Comunicaciones académicas", terms: "correo email institucional outlook unab", href: "pages/servicios.html#correo" },
            { title: "Cosmos", detail: "Herramientas institucionales", terms: "cosmos plataforma", href: "pages/servicios.html#cosmos" },
            { title: "Canvas", detail: "Recursos académicos", terms: "canvas aula virtual", href: "pages/servicios.html#canvas" },
            { title: "Office 365", detail: "Herramientas de productividad", terms: "office microsoft 365", href: "pages/servicios.html#office" },
            { title: "MUSUNAB", detail: "Museo universitario de colecciones", terms: "musunab museo colecciones", href: "pages/lugares-campus.html?place=musunab" },
            { title: "Reloj Solar", detail: "Espacio cultural entre El Jardín y CSU", terms: "reloj solar ruta cósmica", href: "pages/lugares-campus.html?place=sundial" },
            { title: "Biblioteca Central", detail: "Luis Carlos Galán Sarmiento", terms: "biblioteca central libros catálogo salas estudio", href: "pages/lugares-campus.html?place=library" },
            { title: "Facultad de Ingeniería", detail: "Campus El Jardín", terms: "facultad ingeniería bloque ingeniería laboratorios", href: "pages/lugares-campus.html?place=engineering" },
            { title: "Edificio Armando Puyana Puyana", detail: "Campus El Jardín", terms: "armando puyana edificio administrativo", href: "pages/lugares-campus.html?place=admin" },
            { title: "Plazoleta principal", detail: "Campus El Jardín", terms: "plazoleta principal encuentro", href: "pages/lugares-campus.html?place=plaza" },
            { title: "Auditorio Mayor Carlos Gómez Albarracín", detail: "Campus El Jardín", terms: "auditorio mayor conferencias eventos", href: "pages/lugares-campus.html?place=auditorium" },
            { title: "Campus El Bosque", detail: "Facultad de Ciencias de la Salud", terms: "campus bosque salud floridablanca", href: "pages/lugares-campus.html" },
            { title: "Centro de Servicios Universitarios CSU", detail: "Bienestar, lenguas y UNAB Tec", terms: "csu centro servicios universitarios bienestar lenguas", href: "pages/lugares-campus.html" }
        ];
        let selectedIndex = -1;
        let currentResults = [];
        const hideSuggestions = () => { suggestions.hidden = true; suggestions.innerHTML = ""; selectedIndex = -1; currentResults = []; };
        const navigateResult = item => { if (item) window.location.href = prefix + item.href; };
        const paintSelection = () => suggestions.querySelectorAll("button").forEach((button, index) => button.classList.toggle("selected", index === selectedIndex));
        const renderSuggestions = () => {
            const query = search.value.trim().toLocaleLowerCase("es-CO");
            if (!query) { hideSuggestions(); return; }
            const queryWords = query.split(/\s+/).filter(Boolean);
            currentResults = destinations.map(item => {
                const title = item.title.toLocaleLowerCase("es-CO");
                const words = `${item.title} ${item.detail} ${item.terms}`.toLocaleLowerCase("es-CO");
                let score = 0;
                if (title.startsWith(query)) score += 10;
                if (title.includes(query)) score += 7;
                queryWords.forEach(word => { if (title.includes(word)) score += 4; else if (words.includes(word)) score += 2; });
                return { ...item, score };
            }).filter(item => item.score > 0).sort((a,b) => b.score-a.score).slice(0,6);
            suggestions.innerHTML = currentResults.length ? currentResults.map((item,index) => `<button type="button" class="search-suggestion" data-search-index="${index}"><span class="search-suggestion-icon">⌕</span><span><strong>${item.title}</strong><small>${item.detail}</small></span><span class="search-suggestion-arrow">↗</span></button>`).join("") : `<div class="search-no-results">No encontramos coincidencias. Prueba con “Horario”, “Cursos” o “Horas libres”.</div>`;
            suggestions.hidden = false;
            selectedIndex = currentResults.length ? 0 : -1;
            paintSelection();
        };
        search.addEventListener("input", renderSuggestions);
        search.addEventListener("focus", () => { if (search.value.trim()) renderSuggestions(); });
        search.addEventListener("keydown", event => {
            if (event.key === "ArrowDown" && currentResults.length) { event.preventDefault(); selectedIndex = (selectedIndex + 1) % currentResults.length; paintSelection(); }
            else if (event.key === "ArrowUp" && currentResults.length) { event.preventDefault(); selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length; paintSelection(); }
            else if (event.key === "Enter" && currentResults.length) { event.preventDefault(); navigateResult(currentResults[Math.max(selectedIndex,0)]); }
            else if (event.key === "Escape") hideSuggestions();
        });
        suggestions.addEventListener("click", event => {
            const button = event.target.closest("[data-search-index]");
            if (button) navigateResult(currentResults[Number(button.dataset.searchIndex)]);
        });
        document.addEventListener("click", event => { if (!searchBox.contains(event.target) && !suggestions.contains(event.target)) hideSuggestions(); });
    }

    const noticeItems = [...document.querySelectorAll(".notice-item")];
    const notificationUser = (() => {
        try { return JSON.parse(localStorage.getItem("miportal-current-user") || "null"); }
        catch { return null; }
    })();
    const notificationUserId = notificationUser?.id || "guest";
    const notificationReadKey = `miportal-notifications-read:${notificationUserId}`;
    const knownNoticeIds = ["notice-grade", "notice-event", "notice-schedule", "notice-wellbeing", "notice-classroom", "notice-library"];
    const initialUnreadIds = ["notice-grade", "notice-event", "notice-schedule"];
    const readNoticeIds = new Set((() => {
        try {
            const saved = JSON.parse(localStorage.getItem(notificationReadKey) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch { return []; }
    })());
    const persistReadNotices = () => {
        try { localStorage.setItem(notificationReadKey, JSON.stringify([...readNoticeIds])); } catch {}
    };
    const isNoticeRead = id => readNoticeIds.has(id) || !initialUnreadIds.includes(id);
    const applyNoticeState = item => {
        const id = item.id;
        const read = isNoticeRead(id);
        item.classList.toggle("is-read", read);
        item.classList.toggle("is-unread", !read);
        const action = item.querySelector(".notice-action");
        if (action) {
            action.textContent = read ? "Leída" : "Marcar leída";
            action.disabled = read;
        }
    };
    const markNoticeRead = id => {
        if (!id) return;
        readNoticeIds.add(id);
        persistReadNotices();
        const node = document.getElementById(id);
        if (node) applyNoticeState(node);
        updateUnreadCount();
    };
    const updateUnreadCount = () => {
        const unread = knownNoticeIds.filter(id => !isNoticeRead(id)).length;
        document.querySelectorAll(".notification-count").forEach(badge => {
            badge.textContent = String(unread);
            badge.hidden = unread === 0;
            badge.setAttribute("aria-label", `${unread} notificaciones sin leer`);
        });
        const unreadLabel = document.getElementById("unreadCount");
        if (unreadLabel) unreadLabel.textContent = String(unread);
        document.querySelectorAll(".popover-heading small").forEach(label => {
            label.textContent = unread === 1 ? "1 nueva" : `${unread} nuevas`;
        });
        document.querySelectorAll(".preview-notice").forEach(link => {
            const id = link.dataset.noticeTarget;
            const read = !id || isNoticeRead(id);
            link.classList.toggle("is-read", read);
            link.classList.toggle("is-unread", !read);
            const dot = link.querySelector(".preview-dot");
            if (dot) dot.hidden = read;
        });
    };
    noticeItems.forEach(item => applyNoticeState(item));
    document.querySelectorAll(".preview-notice").forEach(link => {
        link.addEventListener("click", event => {
            const destination = link.getAttribute("href");
            if (!destination) return;
            event.preventDefault();
            markNoticeRead(link.dataset.noticeTarget);
            window.location.assign(new URL(destination, window.location.href).href);
        });
    });
    const filterNotices = filter => noticeItems.forEach(item => { item.hidden = filter !== "all" && item.dataset.category !== filter; });
    document.querySelectorAll(".tab-button[data-filter]").forEach(button => button.addEventListener("click", () => {
        document.querySelectorAll(".tab-button[data-filter]").forEach(tab => tab.classList.toggle("active", tab === button));
        filterNotices(button.dataset.filter);
    }));
    noticeItems.forEach(item => item.querySelector(".notice-action")?.addEventListener("click", () => {
        markNoticeRead(item.id);
    }));
    document.querySelector(".mark-all-read")?.addEventListener("click", () => {
        knownNoticeIds.forEach(id => readNoticeIds.add(id));
        persistReadNotices();
        noticeItems.forEach(applyNoticeState);
        updateUnreadCount();
    });
    const preferenceToggles = [...document.querySelectorAll("[data-notification-pref]")];
    preferenceToggles.forEach(toggle => {
        const key = `miportal-pref-${notificationUserId}-${toggle.dataset.notificationPref}`;
        const saved = readStorage(key);
        if (saved !== null) toggle.checked = saved === "true";
        toggle.addEventListener("change", () => {
            writeStorage(key, String(toggle.checked));
            if (toggle.dataset.notificationPref === "preview") document.querySelectorAll(".preview-notice").forEach(item => item.hidden = !toggle.checked);
            const feedback = document.getElementById("preferenceFeedback");
            if (feedback) feedback.textContent = "Preferencia actualizada correctamente.";
        });
    });
    const previewPref = readStorage(`miportal-pref-${notificationUserId}-preview`, "true") === "true";
    document.querySelectorAll(".preview-notice").forEach(item => item.hidden = !previewPref);
    updateUnreadCount();
    const requestedNoticeId = new URLSearchParams(window.location.search).get("notice");
    if (requestedNoticeId && document.getElementById(requestedNoticeId)) {
        document.querySelectorAll(".tab-button[data-filter]").forEach(tab => tab.classList.toggle("active", tab.dataset.filter === "all"));
        filterNotices("all");
        markNoticeRead(requestedNoticeId);
        const requestedNotice = document.getElementById(requestedNoticeId);
        requestedNotice.classList.add("notice-targeted");
        window.setTimeout(() => requestedNotice.scrollIntoView({ behavior: root.classList.contains("reduce-motion") ? "auto" : "smooth", block: "center" }), 80);
    }

    const periods = ["2026-1", "2026-2", "2026-3", "2026-4"];
    const storedPeriod = readStorage("miportal-academic-period", "2026-4");
    const currentPeriod = () => periods.includes(storedPeriod) ? storedPeriod : "2026-4";
    if (!periods.includes(storedPeriod)) writeStorage("miportal-academic-period", "2026-4");
    const levelFromPeriod = period => {
        const match = /^2026-([1-4])$/.exec(period || "");
        return match ? Number(match[1]) : null;
    };
    const subjectsFor = period => {
        const level = levelFromPeriod(period);
        return level ? (window.MiPortalCurriculum?.semesters[level] || []) : [];
    };
    const fillPeriodSelect = (select, value) => {
        if (!select) return;
        select.innerHTML = periods.map(period => `<option value="${period}">${period}</option>`).join("");
        select.value = periods.includes(value) ? value : "2026-4";
    };
    const savePeriod = period => writeStorage("miportal-academic-period", period);
    const periodSelects = [
        document.getElementById("coursePeriodSelect"),
        document.getElementById("gradePeriodSelect"),
        document.getElementById("schedulePeriodSelect")
    ].filter(Boolean);
    periodSelects.forEach(select => fillPeriodSelect(select, currentPeriod()));

    const renderCourseCard = (course, index, period) => {
        const colors = ["purple", "orange", "green", "pink", "blue"];
        const progress = [72, 65, 80, 78, 88, 70, 84, 76][index % 8];
        return `<article class="course-card course-${colors[index % colors.length]}" data-course-name="${course.name.toLocaleLowerCase("es-CO")}"><div class="course-top"><span class="course-icon">${["▤","⌘","∑","⌨","◈"][index % 5]}</span><span class="course-code">${String(index+1).padStart(2,"0")} · ${course.credits} cr.</span></div><h3>${course.name}</h3><p>${course.area} · ${course.credits} créditos</p><div class="course-meta">Nivel curricular ${levelFromPeriod(period) || "—"}</div><div class="progress-label"><span>Avance de referencia</span><b>${progress}%</b></div><div class="bar"><i style="width:${progress}%"></i></div><button class="outline-button course-detail-trigger" type="button" data-course-index="${index}">Ver detalles ›</button></article>`;
    };
    const renderCourses = period => {
        const grid = document.getElementById("courseGrid"); if (!grid) return;
        const courses = subjectsFor(period); const level = levelFromPeriod(period);
        grid.innerHTML = courses.length ? courses.map((course, index) => renderCourseCard(course, index, period)).join("") : `<div class="academic-empty-state">El periodo ${period} no tiene un nivel del pensum asociado en este prototipo. La secuencia del folleto llega hasta el nivel 9.</div>`;
        const credits = courses.reduce((sum, course) => sum + course.credits, 0);
        const label = document.getElementById("courseCurrentPeriod"); if(label) label.textContent=period;
        const count = document.getElementById("courseCount"); if(count) count.textContent=courses.length;
        const creditLabel = document.getElementById("courseCredits"); if(creditLabel) creditLabel.textContent=credits;
        grid.querySelectorAll(".course-detail-trigger").forEach(button => button.addEventListener("click", () => {
            const course = courses[Number(button.dataset.courseIndex)];
            openInfoDialog(course.name, `<div class="detail-grid"><div><small>Créditos</small><strong>${course.credits}</strong></div><div><small>Área</small><strong>${course.area}</strong></div><div><small>Periodo</small><strong>${period}</strong></div><div><small>Nivel del pensum</small><strong>${level} de 9</strong></div></div><p>Asignatura incluida en el folleto del programa de Ingeniería de Sistemas. Docente, grupo, aula y avance real deben confirmarse con la información oficial de matrícula.</p>`);
        }));
    };
    const coursePeriodSelect = document.getElementById("coursePeriodSelect");
    if (coursePeriodSelect) {
        renderCourses(coursePeriodSelect.value);
        coursePeriodSelect.addEventListener("change", () => { savePeriod(coursePeriodSelect.value); renderCourses(coursePeriodSelect.value); });
    }

    const renderGrades = period => {
        const tbody = document.getElementById("gradeTableBody"); if (!tbody) return;
        const courses = subjectsFor(period); const level = levelFromPeriod(period);
        const isCurrentPeriod = period === "2026-4";
        const scores = courses.map((course,index) => ({ course, score: Number((3.4 + ((index * 7 + (level || 1)) % 15) / 10).toFixed(1)) }));
        tbody.innerHTML = scores.length ? scores.map(({course,score}) => {
            if (isCurrentPeriod) return `<tr><td>${course.name}</td><td>${course.credits}</td><td><strong>—</strong></td><td><span class="status in-progress">Cursando</span></td></tr>`;
            return `<tr><td>${course.name}</td><td>${course.credits}</td><td><strong>${score.toFixed(1)}</strong></td><td><span class="status ${score >= 3 ? "approved" : "pending"}">${score >= 3 ? "Aprobado" : "En seguimiento"}</span></td></tr>`;
        }).join("") : `<tr><td colspan="4">No hay asignaturas disponibles para este periodo.</td></tr>`;
        const periodText=document.getElementById("gradeCurrentPeriod"); if(periodText) periodText.textContent=period;
        const average=document.getElementById("gradeAverage"); if(average) average.textContent=isCurrentPeriod ? "En curso" : (scores.length ? (scores.reduce((sum,item)=>sum+item.score,0)/scores.length).toFixed(1) : "—");
        const credits=document.getElementById("gradeCredits"); if(credits) credits.textContent=courses.reduce((sum,course)=>sum+course.credits,0);
        const levelText=document.getElementById("gradeLevel"); if(levelText) levelText.textContent=level ? `${level}.º nivel curricular` : "Sin nivel asociado";
        const pending=document.getElementById("gradePendingCredits"); if(pending) pending.textContent=`${151 - (window.MiPortalCurriculum?.semesters && Object.keys(window.MiPortalCurriculum.semesters).slice(0,level||0).reduce((sum,key)=>sum + window.MiPortalCurriculum.semesters[key].reduce((s,c)=>s+c.credits,0),0) || 0)} créditos del plan por cursar`;
    };
    const gradeSelect=document.getElementById("gradePeriodSelect");
    if (gradeSelect) { renderGrades(gradeSelect.value); gradeSelect.addEventListener("change",()=>{savePeriod(gradeSelect.value);renderGrades(gradeSelect.value);}); }
    const calculatorCourseSelect = document.getElementById("calculatorCourseSelect");
    const assessmentRows = document.getElementById("assessmentRows");
    const calculatorFeedback = document.getElementById("calculatorFeedback");
    const calculatorStorageKey = (period, course) => `miportal-grade-calculator:${period}:${encodeURIComponent(course)}`;
    const readAssessmentData = (period, course) => {
        try {
            const saved = JSON.parse(readStorage(calculatorStorageKey(period, course), "[]"));
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    };
    const saveAssessmentData = () => {
        if (!calculatorCourseSelect || !assessmentRows || !gradeSelect) return;
        const rows = [...assessmentRows.querySelectorAll(".assessment-row")].map(row => ({
            name: row.querySelector("[data-assessment-name]")?.value.trim() || "Evaluación",
            grade: row.querySelector("[data-assessment-grade]")?.value ?? "",
            weight: row.querySelector("[data-assessment-weight]")?.value ?? ""
        }));
        writeStorage(calculatorStorageKey(gradeSelect.value, calculatorCourseSelect.value), JSON.stringify(rows));
    };
    const makeAssessmentRow = (assessment = {}) => {
        const row = document.createElement("div");
        row.className = "assessment-row";
        row.innerHTML = `<input type="text" maxlength="48" data-assessment-name aria-label="Nombre de la evaluación" placeholder="Ej. Parcial 1"><input type="number" min="0" max="5" step="0.1" inputmode="decimal" data-assessment-grade aria-label="Nota de la evaluación" placeholder="0 a 5"><input type="number" min="0" max="100" step="0.1" inputmode="decimal" data-assessment-weight aria-label="Porcentaje de la evaluación" placeholder="%"><button type="button" class="assessment-remove" aria-label="Eliminar evaluación" title="Eliminar evaluación">×</button>`;
        row.querySelector("[data-assessment-name]").value = assessment.name || "";
        row.querySelector("[data-assessment-grade]").value = assessment.grade ?? "";
        row.querySelector("[data-assessment-weight]").value = assessment.weight ?? "";
        return row;
    };
    const renderAssessmentRows = () => {
        if (!calculatorCourseSelect || !assessmentRows) return;
        const saved = readAssessmentData(gradeSelect?.value || "2026-4", calculatorCourseSelect.value);
        assessmentRows.replaceChildren();
        const rows = saved.length ? saved : [{ name: "", grade: "", weight: "" }];
        rows.forEach(assessment => assessmentRows.appendChild(makeAssessmentRow(assessment)));
        calculateGradeRequirement();
    };
    const setCalculatorFeedback = (message, state = "neutral") => {
        if (!calculatorFeedback) return;
        calculatorFeedback.textContent = message;
        calculatorFeedback.dataset.state = state;
    };
    const updateCalculatorMetric = (id, value) => {
        const node = document.getElementById(id);
        if (node) node.textContent = value;
    };
    const calculateGradeRequirement = () => {
        if (!assessmentRows) return;
        const rows = [...assessmentRows.querySelectorAll(".assessment-row")];
        let assignedWeight = 0;
        let gradedWeight = 0;
        let weightedPoints = 0;
        let invalid = "";
        rows.forEach(row => {
            const gradeInput = row.querySelector("[data-assessment-grade]");
            const weightInput = row.querySelector("[data-assessment-weight]");
            const gradeText = gradeInput.value.trim();
            const weightText = weightInput.value.trim();
            const weight = weightText === "" ? 0 : Number(weightText);
            const grade = gradeText === "" ? null : Number(gradeText);
            if (!Number.isFinite(weight) || weight < 0 || weight > 100) invalid = "Cada porcentaje debe estar entre 0 y 100.";
            if (grade !== null && (!Number.isFinite(grade) || grade < 0 || grade > 5)) invalid = "Cada calificación debe estar entre 0,0 y 5,0.";
            assignedWeight += Number.isFinite(weight) ? weight : 0;
            if (grade !== null && weight > 0 && Number.isFinite(grade) && Number.isFinite(weight)) {
                gradedWeight += weight;
                weightedPoints += grade * weight;
            }
            if (grade !== null && weight <= 0) invalid = "Asigna un porcentaje mayor que 0 a cada nota registrada.";
        });
        const accumulated = weightedPoints / 100;
        const pendingWeight = Math.max(0, 100 - gradedWeight);
        updateCalculatorMetric("calculatorAccumulated", `${accumulated.toFixed(2).replace(".", ",")} / 5,00`);
        updateCalculatorMetric("calculatorGradedWeight", `${gradedWeight.toFixed(1).replace(/\.0$/, "")}%`);
        updateCalculatorMetric("calculatorPendingWeight", `${pendingWeight.toFixed(1).replace(/\.0$/, "")}%`);
        if (invalid) {
            setCalculatorFeedback(invalid, "error");
            return;
        }
        if (assignedWeight > 100.0001) {
            setCalculatorFeedback(`Los porcentajes suman ${assignedWeight.toFixed(1)}%. Deben sumar como máximo 100%.`, "error");
            return;
        }
        if (pendingWeight <= 0.0001) {
            const finalGrade = weightedPoints / 100;
            setCalculatorFeedback(`Nota final calculada: ${finalGrade.toFixed(2).replace(".", ",")}. ${finalGrade >= 3 ? "¡Aprobaste la asignatura!" : "No alcanzaste la nota mínima de 3,0."}`, finalGrade >= 3 ? "success" : "error");
            return;
        }
        const needed = (300 - weightedPoints) / pendingWeight;
        if (needed <= 0) {
            setCalculatorFeedback("Ya tienes asegurada la nota mínima de 3,0. Las evaluaciones pendientes pueden mejorar tu resultado.", "success");
        } else if (needed > 5) {
            setCalculatorFeedback(`Necesitarías ${needed.toFixed(2).replace(".", ",")} en el porcentaje pendiente. No es posible alcanzar 3,0 con las evaluaciones restantes.`, "error");
        } else {
            setCalculatorFeedback(`Necesitas un promedio mínimo de ${needed.toFixed(2).replace(".", ",")} en el ${pendingWeight.toFixed(1).replace(/\.0$/, "")}% pendiente para aprobar con 3,0.`, "neutral");
        }
    };
    const refreshCalculatorCourses = period => {
        if (!calculatorCourseSelect) return;
        const courses = subjectsFor(period);
        const previous = calculatorCourseSelect.value;
        calculatorCourseSelect.innerHTML = courses.map(course => `<option value="${course.name.replaceAll('"', '&quot;')}">${course.name}</option>`).join("");
        if (courses.some(course => course.name === previous)) calculatorCourseSelect.value = previous;
        if (!courses.length) {
            assessmentRows?.replaceChildren();
            setCalculatorFeedback("No hay asignaturas disponibles para el periodo seleccionado.", "neutral");
            return;
        }
        renderAssessmentRows();
    };
    if (calculatorCourseSelect && assessmentRows && gradeSelect) {
        refreshCalculatorCourses(gradeSelect.value);
        calculatorCourseSelect.addEventListener("change", renderAssessmentRows);
        document.getElementById("addAssessment")?.addEventListener("click", () => {
            assessmentRows.appendChild(makeAssessmentRow());
            saveAssessmentData();
            calculateGradeRequirement();
        });
        assessmentRows.addEventListener("input", () => {
            saveAssessmentData();
            calculateGradeRequirement();
        });
        assessmentRows.addEventListener("click", event => {
            const remove = event.target.closest(".assessment-remove");
            if (!remove) return;
            remove.closest(".assessment-row")?.remove();
            if (!assessmentRows.children.length) assessmentRows.appendChild(makeAssessmentRow());
            saveAssessmentData();
            calculateGradeRequirement();
        });
        gradeSelect.addEventListener("change", () => refreshCalculatorCourses(gradeSelect.value));
    }


    const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    const scheduleColors = ["purple", "orange", "green", "pink", "blue"];
    const scheduleTimeZone = window.MiPortalSchedule?.timeZone || "America/Bogota";
    const getBogotaNow = () => {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: scheduleTimeZone,
            weekday: "long",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).formatToParts(new Date());
        const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
        const weekdayIndex = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4 }[values.weekday] ?? -1;
        return {
            weekdayIndex,
            minutes: Number(values.hour) * 60 + Number(values.minute),
            dateISO: `${values.year}-${values.month}-${values.day}`,
            dateLabel: new Intl.DateTimeFormat("es-CO", {
                timeZone: scheduleTimeZone,
                weekday: "long",
                day: "numeric",
                month: "long"
            }).format(new Date())
        };
    };
    const timeToMinutes = value => {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""))) return null;
        const [hour, minute] = value.split(":").map(Number);
        return hour * 60 + minute;
    };
    const displayTime = value => {
        const minutes = timeToMinutes(value);
        if (minutes === null) return "Hora no registrada";
        const hour24 = Math.floor(minutes / 60);
        const hour12 = hour24 % 12 || 12;
        const suffix = hour24 < 12 ? "a. m." : "p. m.";
        return `${hour12}:${String(minutes % 60).padStart(2, "0")} ${suffix}`;
    };
    const getPeriodSchedule = period => {
        const courses = subjectsFor(period);
        const scheduleConfig = window.MiPortalSchedule;
        const placements = scheduleConfig?.patterns?.[period];
        const slots = scheduleConfig?.slots;
        if (!Array.isArray(courses) || !Array.isArray(placements) || !Array.isArray(slots)) return [];
        const classItems = courses.map((course, index) => {
            const placement = placements[index % placements.length];
            if (!placement) return null;
            const slot = slots[placement.slot];
            if (!slot) return null;
            const roomIndex = ((index * 3) + (levelFromPeriod(period) || 1)) % scheduleConfig.rooms.length;
            const professorIndex = ((index + (levelFromPeriod(period) || 1)) * 2) % scheduleConfig.professors.length;
            return {
                id: `course-${index}`,
                index,
                course: course.name,
                credits: course.credits,
                area: course.area,
                day: placement.day,
                start: slot.start,
                end: slot.end,
                room: scheduleConfig.rooms[roomIndex],
                professor: scheduleConfig.professors[professorIndex],
                color: scheduleColors[(index + (levelFromPeriod(period) || 1)) % scheduleColors.length],
                startMinutes: timeToMinutes(slot.start),
                endMinutes: timeToMinutes(slot.end),
                isHoursEvent: false
            };
        }).filter(Boolean);
        const signedUser = (() => {
            try { return JSON.parse(localStorage.getItem("miportal-current-user") || "null"); }
            catch { return null; }
        })();
        const registrationKey = `miportal-hour-event-registrations:${signedUser?.id || "guest"}`;
        let enrollments = [];
        try {
            const saved = JSON.parse(localStorage.getItem(registrationKey) || "[]");
            if (Array.isArray(saved)) enrollments = saved;
        } catch {}
        const enrolledItems = enrollments.filter(entry => entry.period === period && /^\d{4}-\d{2}-\d{2}$/.test(entry.date || ""))
            .map((entry, index) => {
                const [year, month, day] = entry.date.split("-").map(Number);
                const date = new Date(year, month - 1, day, 12, 0, 0);
                const weekday = date.getDay();
                const dayIndex = weekday >= 1 && weekday <= 5 ? weekday - 1 : -1;
                const startMinutes = timeToMinutes(entry.startTime || "09:00");
                const duration = Number(entry.hours || 1);
                if (dayIndex < 0 || startMinutes === null || !Number.isFinite(duration) || duration <= 0) return null;
                const endMinutes = Math.min(startMinutes + duration * 60, 23 * 60 + 59);
                const hh = String(Math.floor(endMinutes / 60)).padStart(2, "0");
                const mm = String(endMinutes % 60).padStart(2, "0");
                return {
                    id: `hours-${entry.eventId || index}`,
                    index: `hours-${entry.eventId || index}`,
                    course: entry.title || "Actividad de Horas Libres",
                    credits: 0,
                    area: "Horas Libres",
                    day: dayIndex,
                    start: entry.startTime || "09:00",
                    end: `${hh}:${mm}`,
                    room: entry.place || "Campus UNAB",
                    professor: "Actividad inscrita",
                    color: "teal",
                    startMinutes,
                    endMinutes,
                    isHoursEvent: true,
                    eventDate: entry.date,
                    eventHours: duration,
                    eventId: entry.eventId
                };
            }).filter(Boolean);
        return [...classItems, ...enrolledItems].sort((a, b) => a.day - b.day || a.startMinutes - b.startMinutes);
    };
    const currentAcademicPeriod = () => {
        const saved = readStorage("miportal-academic-period", "2026-4");
        return /^2026-[1-4]$/.test(saved) ? saved : "2026-4";
    };
    const formatClassTime = item => `${displayTime(item.start)} – ${displayTime(item.end)}`;
    const scheduleEmptyMessage = (period, todayOnly = false) => todayOnly
        ? `<div class="schedule-empty-state"><strong>No hay clases programadas hoy</strong><span>El horario de referencia de ${period} no tiene asignaturas para este día.</span></div>`
        : `<div class="schedule-empty-state"><strong>No hay asignaturas programadas</strong><span>No encontramos materias para el periodo ${period}.</span></div>`;
    const renderDashboardTodaySchedule = () => {
        const list = document.getElementById("todayScheduleList");
        if (!list) return;
        const today = getBogotaNow();
        const period = currentAcademicPeriod();
        const dateLabel = document.getElementById("todayScheduleDate");
        if (dateLabel) {
            const formatted = today.dateLabel;
            dateLabel.textContent = `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)} · ${period}`;
        }
        const allClasses = getPeriodSchedule(period);
        if (!allClasses.length) {
            list.innerHTML = scheduleEmptyMessage(period, true);
            return;
        }
        if (today.weekdayIndex < 0) {
            list.innerHTML = `<div class="schedule-empty-state"><strong>Hoy no hay clases de lunes a viernes</strong><span>El horario semanal no registra clases para este día.</span></div>`;
            return;
        }
        const todaysClasses = allClasses
            .filter(item => item.day === today.weekdayIndex && item.endMinutes > today.minutes && (!item.eventDate || item.eventDate === today.dateISO))
            .sort((a, b) => a.startMinutes - b.startMinutes);
        if (!todaysClasses.length) {
            list.innerHTML = `<div class="schedule-empty-state"><strong>Ya no tienes clases pendientes hoy</strong><span>El horario de ${dayNames[today.weekdayIndex].toLowerCase()} para ${period} no tiene más clases por comenzar.</span></div>`;
            return;
        }
        list.innerHTML = todaysClasses.map(item => {
            const place = item.room ? item.room : "Ubicación no registrada";
            const inProgress = item.startMinutes <= today.minutes && item.endMinutes > today.minutes;
            const status = inProgress ? "En curso · " : "";
            const enrollmentLabel = item.isHoursEvent ? `<em class="schedule-enrollment-tag">Inscrito · Horas Libres</em>` : "";
            return `<div class="class-row ${item.isHoursEvent ? "enrolled-hours-row" : ""}" role="button" tabindex="0" data-class-title="${item.course.replaceAll('"', '&quot;')}" data-class-time="${formatClassTime(item)}" data-class-place="${place.replaceAll('"', '&quot;')}" data-class-professor="${(item.professor || "").replaceAll('"', '&quot;')}" data-class-kind="${item.isHoursEvent ? "hours" : "course"}" data-class-date="${item.eventDate || ""}"><span class="class-color ${item.color}"></span><div><small>${status}${formatClassTime(item)}</small><strong>${item.course}</strong>${enrollmentLabel}<span>${place}</span></div><span class="row-arrow" aria-hidden="true">›</span></div>`;
        }).join("");
        list.querySelectorAll(".class-row").forEach(row => {
            row.addEventListener("click", () => openDashboardClass(row));
            row.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDashboardClass(row);
                }
            });
        });
    };
    renderDashboardTodaySchedule();
    window.setInterval(renderDashboardTodaySchedule, 60000);

    const schedulePeriodSelect = document.getElementById("schedulePeriodSelect");
    const renderSchedule = period => {
        const grid = document.getElementById("scheduleGrid");
        if (!grid) return;
        const classes = getPeriodSchedule(period);
        const courses = subjectsFor(period);
        const headers = `<div class="week-head">Hora</div>${dayNames.map(day => `<div class="week-head">${day}</div>`).join("")}`;
        grid.style.gridTemplateColumns = "72px repeat(5,minmax(86px,1fr))";
        grid.innerHTML = headers;
        if (!classes.length) {
            grid.insertAdjacentHTML("beforeend", `<div class="schedule-empty-state schedule-empty-grid">${scheduleEmptyMessage(period)}</div>`);
        } else {
            const intervals = [...new Set(classes.map(item => `${item.start}|${item.end}`))].sort((a, b) => timeToMinutes(a.split("|")[0]) - timeToMinutes(b.split("|")[0]));
            intervals.forEach(interval => {
                const [start, end] = interval.split("|");
                grid.insertAdjacentHTML("beforeend", `<div class="time-cell">${displayTime(start)}<span>–</span>${displayTime(end)}</div>`);
                dayNames.forEach((day, dayIndex) => {
                    const matching = classes.filter(item => item.day === dayIndex && item.start === start && item.end === end);
                    const content = matching.map(item => `<button type="button" class="schedule-chip ${item.color} ${item.isHoursEvent ? "hours-event-chip" : ""}" data-schedule-index="${item.id}"><strong>${item.course}</strong>${item.room ? `<small>${item.isHoursEvent ? `${item.eventDate} · ${item.room}` : item.room}</small>` : ""}${item.isHoursEvent ? `<em>Inscrito · Horas Libres</em>` : ""}</button>`).join("");
                    grid.insertAdjacentHTML("beforeend", `<div class="week-cell"><div class="schedule-class-stack">${content}</div></div>`);
                });
            });
        }
        grid.querySelectorAll("[data-schedule-index]").forEach(button => button.addEventListener("click", () => {
            const item = classes.find(entry => entry.id === button.dataset.scheduleIndex);
            if (!item) return;
            const course = courses.find(entry => entry.name === item.course);
            const details = [
                `<div><small>Día</small><strong>${dayNames[item.day]}</strong></div>`,
                `<div><small>Horario</small><strong>${formatClassTime(item)}</strong></div>`,
                item.isHoursEvent ? `<div><small>Fecha</small><strong>${item.eventDate}</strong></div>` : (course ? `<div><small>Créditos</small><strong>${course.credits}</strong></div>` : ""),
                item.room ? `<div><small>${item.isHoursEvent ? "Lugar" : "Salón"}</small><strong>${item.room}</strong></div>` : "",
                item.isHoursEvent ? `<div><small>Estado</small><strong>Inscripción guardada</strong></div>` : (item.professor ? `<div><small>Docente de referencia</small><strong>${item.professor}</strong></div>` : "")
            ].filter(Boolean).join("");
            openInfoDialog(item.course, `<div class="detail-grid">${details}</div><p>${item.isHoursEvent ? "Esta actividad de Horas Libres está asociada a tu inscripción y se conserva en tu horario." : `Horario demostrativo del prototipo para el periodo ${period}. Las franjas, aulas y docentes son ilustrativos y no corresponden a una matrícula oficial.`}</p>`);
        }));
        const periodNode = document.getElementById("scheduleCurrentPeriod");
        if (periodNode) periodNode.textContent = period;
        const uniqueCourseNames = [...new Set(classes.map(item => item.course))];
        const countNode = document.getElementById("scheduleCourseCount");
        if (countNode) countNode.textContent = uniqueCourseNames.length;
        const credits = uniqueCourseNames.reduce((sum, name) => sum + (courses.find(course => course.name === name)?.credits || 0), 0);
        const creditNode = document.getElementById("scheduleCredits");
        if (creditNode) creditNode.textContent = credits;
        const upcoming = document.getElementById("upcomingSchedule");
        if (upcoming) {
            const now = getBogotaNow();
            const upcomingClasses = [...classes].map(item => ({
                ...item,
                daysUntil: item.eventDate ? Math.max(0, Math.round((new Date(`${item.eventDate}T12:00:00-05:00`) - new Date(`${now.dateISO}T12:00:00-05:00`)) / 86400000)) : (item.day - now.weekdayIndex + 7) % 7
            })).filter(item => {
                if (item.eventDate) return item.eventDate >= now.dateISO && (item.eventDate !== now.dateISO || item.endMinutes > now.minutes);
                if (now.weekdayIndex < 0) return true;
                if (item.daysUntil === 0) return item.endMinutes > now.minutes;
                return true;
            }).sort((a, b) => a.daysUntil - b.daysUntil || a.startMinutes - b.startMinutes).slice(0, 5);
            upcoming.innerHTML = upcomingClasses.length ? upcomingClasses.map(item => `<div class="upcoming-item"><b class="dot ${item.color}-bg"></b><div><strong>${item.course}</strong><small>${item.eventDate ? item.eventDate : dayNames[item.day]} · ${formatClassTime(item)}${item.room ? ` · ${item.room}` : ""}</small></div></div>`).join("") : `<p>No hay próximas clases registradas para este periodo.</p>`;
        }
        grid.dataset.period = period;
        grid._scheduleClasses = classes;
    };
    if (schedulePeriodSelect) {
        renderSchedule(schedulePeriodSelect.value);
        schedulePeriodSelect.addEventListener("change", () => {
            savePeriod(schedulePeriodSelect.value);
            renderSchedule(schedulePeriodSelect.value);
            renderDashboardTodaySchedule();
        });
    }
    window.addEventListener("miportal:schedule-updated", () => {
        renderDashboardTodaySchedule();
        if (schedulePeriodSelect) renderSchedule(schedulePeriodSelect.value);
    });
    window.addEventListener("storage", event => {
        if (event.key?.startsWith("miportal-hour-event-registrations:")) {
            renderDashboardTodaySchedule();
            if (schedulePeriodSelect) renderSchedule(schedulePeriodSelect.value);
        }
    });
    document.getElementById("downloadSchedule")?.addEventListener("click", () => {
        const grid = document.getElementById("scheduleGrid");
        if (!grid) return;
        const classes = grid._scheduleClasses || [];
        if (!classes.length) {
            openInfoDialog("Horario no disponible", "Todavía no hay horarios oficiales registrados para descargar.");
            return;
        }
        const period = grid.dataset.period || "2026-4";
        const width = 1700;
        const maxRows = Math.max(...dayNames.map((day, dayIndex) => classes.filter(item => item.day === dayIndex).length), 1);
        const rowHeight = 125;
        const height = 190 + maxRows * rowHeight;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#f8f7ff";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#5121ad";
        ctx.font = "bold 48px Arial";
        ctx.fillText("Mi horario semanal", 55, 62);
        ctx.fillStyle = "#7f739b";
        ctx.font = "25px Arial";
        ctx.fillText(`Ingeniería de Sistemas · Periodo ${period}`, 58, 103);
        const left = 55;
        const top = 130;
        const colWidth = 318;
        dayNames.forEach((day, dayIndex) => {
            const x = left + dayIndex * colWidth;
            ctx.fillStyle = "#5524b2";
            ctx.fillRect(x, top, colWidth - 10, 48);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px Arial";
            ctx.fillText(day, x + 16, top + 31);
            const dayClasses = classes.filter(item => item.day === dayIndex).sort((a, b) => a.startMinutes - b.startMinutes);
            dayClasses.forEach((item, rowIndex) => {
                const y = top + 58 + rowIndex * rowHeight;
                ctx.fillStyle = ["#eee5ff", "#fff0dd", "#def7ef", "#ffeaf3", "#e9f1ff"][rowIndex % 5];
                ctx.beginPath();
                ctx.roundRect(x + 3, y, colWidth - 18, rowHeight - 12, 14);
                ctx.fill();
                ctx.fillStyle = "#30204f";
                ctx.font = "bold 18px Arial";
                ctx.fillText(item.course.slice(0, 31), x + 16, y + 33);
                ctx.font = "15px Arial";
                ctx.fillStyle = "#665783";
                ctx.fillText(formatClassTime(item), x + 16, y + 61);
                if (item.room) ctx.fillText(item.room.slice(0, 35), x + 16, y + 88);
            });
        });
        const link = document.createElement("a");
        link.download = `horario-${period}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });

    const openDashboardClass = row => {
        const isHoursEvent = row.dataset.classKind === "hours";
        const professor = !isHoursEvent && row.dataset.classProfessor ? `<div><small>Docente</small><strong>${row.dataset.classProfessor}</strong></div>` : "";
        const date = isHoursEvent ? `<div><small>Fecha</small><strong>${row.dataset.classDate || "Fecha registrada"}</strong></div>` : "";
        const state = isHoursEvent ? `<div><small>Inscripción</small><strong>Confirmada en tu cuenta</strong></div>` : "";
        const message = isHoursEvent ? "Esta actividad quedó añadida a tu horario porque tienes una inscripción registrada." : "Consulta la sección Horario para revisar la programación semanal de tus asignaturas.";
        openInfoDialog(row.dataset.classTitle || "Clase", `<div class="detail-grid"><div><small>Horario</small><strong>${row.dataset.classTime || "No registrado"}</strong></div>${date}<div><small>Ubicación</small><strong>${row.dataset.classPlace || "No registrada"}</strong></div>${state}${professor}</div><p>${message}</p><a class="outline-button" href="pages/horario.html">Abrir horario completo ›</a>`);
    };
    document.querySelectorAll(".event-row[data-event-title]").forEach(row=>{
        const open=()=>openInfoDialog(row.dataset.eventTitle,`<p>${row.dataset.eventDescription}</p><p>Consulta el calendario académico para revisar fechas, ubicación y actualizaciones.</p><a class="outline-button" href="pages/calendario.html">Abrir calendario ›</a>`);
        row.addEventListener("click",open);row.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();open();}});
    });

    const calendarMonthLabel=document.getElementById("monthLabel");
    const calendarGrid=document.getElementById("calendarGrid");
    if(calendarMonthLabel && calendarGrid){
        const today=new Date();today.setHours(0,0,0,0);
        let viewedMonth=new Date(today.getFullYear(),today.getMonth(),1);let selectedDate=new Date(today);
        const dateOffset=offset=>{const date=new Date(today);date.setDate(date.getDate()+offset);return date;};
        const baseEvents=[
            {date:dateOffset(2),title:"Feria de emprendimiento",place:"Zona verde",time:"10:00 a.m.",category:"eventos",description:"Muestra de proyectos y emprendimientos estudiantiles."},
            {date:dateOffset(5),title:"Evaluación parcial",place:"Bloque L",time:"8:00 a.m.",category:"academico",description:"Evaluación académica programada por la asignatura."},
            {date:dateOffset(9),title:"Entrega de trabajo final",place:"Plataforma virtual",time:"11:59 p.m.",category:"academico",description:"Fecha límite de entrega en la plataforma del curso."},
            {date:dateOffset(13),title:"Jornada de bienestar",place:"Campus central",time:"2:00 p.m.",category:"bienestar",description:"Actividad de bienestar y convivencia universitaria."},
            {date:dateOffset(18),title:"Encuentro de semilleros",place:"Auditorio",time:"9:00 a.m.",category:"eventos",description:"Presentación de grupos y proyectos de investigación."},
            {date:dateOffset(24),title:"Asesoría de matrícula",place:"Atención académica",time:"10:00 a.m.",category:"academico",description:"Espacio demostrativo de orientación sobre matrícula."}
        ];
        const parseLocalDate=value=>{const [year,month,day]=String(value).split("-").map(Number);return new Date(year,month-1,day);};
        let personalEvents=[];
        try { personalEvents=JSON.parse(readStorage("miportal-personal-calendar-events","[]")||"[]").map(event=>({...event,date:parseLocalDate(event.date)})); } catch { personalEvents=[]; }
        let events=[...baseEvents,...personalEvents].sort((a,b)=>a.date-b.date);
        const sameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
        const formatDate=(date,options={weekday:"long",day:"numeric",month:"long"})=>new Intl.DateTimeFormat("es-CO",options).format(date);
        const eventsFor=date=>events.filter(event=>sameDay(event.date,date));
        const label=document.getElementById("selectedDateLabel");const eventList=document.getElementById("calendarEventList");const upcoming=document.getElementById("upcomingCalendarEvents");
        const eventMarkup=event=>`<article class="timeline-item${event.category==="personal"?" personal-timeline-item":""}"><span class="event-date ${event.category==="personal"?"personal-date":event.category==="eventos"?"orange-date":event.category==="bienestar"?"pink-date":"purple-date"}"><b>${event.date.getDate()}</b><small>${new Intl.DateTimeFormat("es-CO",{month:"short"}).format(event.date).replace(".","").toUpperCase()}</small></span><div><strong>${event.title}</strong><small>${event.place} · ${event.time}</small><p>${event.description}</p><span class="event-category-label ${event.category==="personal"?"personal-category-label":""}">${event.category==="personal"?"Personal":event.category}</span></div></article>`;
        const renderAgenda=()=>{
            if(label) label.textContent=formatDate(selectedDate);
            if(eventList){const list=eventsFor(selectedDate);eventList.innerHTML=list.length?list.map(eventMarkup).join(""):`<div class="calendar-empty-card"><span>✦</span><strong>No hay eventos para este día</strong><small>Tu agenda está libre. Selecciona otra fecha para consultar actividades.</small></div>`;}
        };
        const renderUpcoming=()=>{if(upcoming)upcoming.innerHTML=events.filter(event=>event.date>=today).slice(0,4).map(eventMarkup).join("");};
        const draw=()=>{
            const text=formatDate(viewedMonth,{month:"long",year:"numeric"});calendarMonthLabel.textContent=text.charAt(0).toUpperCase()+text.slice(1);
            calendarGrid.querySelectorAll(".calendar-date").forEach(node=>node.remove());
            const first=(new Date(viewedMonth.getFullYear(),viewedMonth.getMonth(),1).getDay()+6)%7;const total=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()+1,0).getDate();const prevTotal=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth(),0).getDate();
            for(let index=0;index<42;index++){
                let date,muted=false;
                if(index<first){date=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()-1,prevTotal-first+index+1);muted=true;}
                else if(index>=first+total){date=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()+1,index-first-total+1);muted=true;}
                else date=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth(),index-first+1);
                const cell=document.createElement("button");cell.type="button";cell.className="calendar-date";cell.textContent=date.getDate();cell.setAttribute("aria-label",formatDate(date));
                const dayEvents=eventsFor(date);
                if(muted)cell.classList.add("muted");if(sameDay(date,today))cell.classList.add("today");if(sameDay(date,selectedDate))cell.classList.add("selected-day");
                if(dayEvents.some(event=>event.category!=="personal"))cell.classList.add("has-event");
                if(dayEvents.some(event=>event.category==="personal"))cell.classList.add("has-personal-event");
                cell.addEventListener("click",()=>{selectedDate=new Date(date);if(date.getMonth()!==viewedMonth.getMonth())viewedMonth=new Date(date.getFullYear(),date.getMonth(),1);draw();renderAgenda();});calendarGrid.appendChild(cell);
            }
        };
        document.getElementById("prevMonth")?.addEventListener("click",()=>{viewedMonth=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()-1,1);selectedDate=new Date(viewedMonth);draw();renderAgenda();});
        document.getElementById("nextMonth")?.addEventListener("click",()=>{viewedMonth=new Date(viewedMonth.getFullYear(),viewedMonth.getMonth()+1,1);selectedDate=new Date(viewedMonth);draw();renderAgenda();});
        document.getElementById("todayButton")?.addEventListener("click",()=>{selectedDate=new Date(today);viewedMonth=new Date(today.getFullYear(),today.getMonth(),1);draw();renderAgenda();});
        const personalButton=document.getElementById("addPersonalEvent");
        if(personalButton){
            document.body.insertAdjacentHTML("beforeend",`<div class="personal-event-backdrop" id="personalEventBackdrop" hidden><form class="personal-event-dialog" id="personalEventForm" role="dialog" aria-modal="true" aria-labelledby="personalEventTitle"><button class="personal-event-close" id="closePersonalEvent" type="button" aria-label="Cerrar">×</button><span class="eyebrow">Tu agenda</span><h2 id="personalEventTitle">Agregar evento personal</h2><label>Nombre del evento<input name="title" type="text" maxlength="70" required placeholder="Ej. Estudiar para parcial"></label><div class="personal-event-form-row"><label>Fecha<input name="date" id="personalEventDate" type="date" required></label><label>Hora<input name="time" type="time" value="12:00" required></label></div><label>Lugar<input name="place" type="text" maxlength="70" placeholder="Ej. Biblioteca"></label><label>Descripción<textarea name="description" rows="3" maxlength="240" placeholder="Agrega detalles (opcional)"></textarea></label><div class="personal-event-actions"><button class="outline-button" id="cancelPersonalEvent" type="button">Cancelar</button><button class="primary-button" type="submit">Guardar evento</button></div></form></div>`);
            const backdrop=document.getElementById("personalEventBackdrop");const form=document.getElementById("personalEventForm");const dateInput=document.getElementById("personalEventDate");
            const closeForm=()=>{backdrop.hidden=true;form.reset();};
            personalButton.addEventListener("click",()=>{dateInput.value=`${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,"0")}-${String(selectedDate.getDate()).padStart(2,"0")}`;backdrop.hidden=false;form.querySelector('[name="title"]').focus();});
            document.getElementById("closePersonalEvent").addEventListener("click",closeForm);document.getElementById("cancelPersonalEvent").addEventListener("click",closeForm);
            backdrop.addEventListener("click",event=>{if(event.target===backdrop)closeForm();});
            form.addEventListener("submit",event=>{
                event.preventDefault();const data=new FormData(form);const dateValue=String(data.get("date")||"");
                if(!dateValue||!String(data.get("title")||"").trim())return;
                const saved={id:`personal-${Date.now()}`,date:dateValue,title:String(data.get("title")).trim(),time:String(data.get("time")||"12:00"),place:String(data.get("place")||"").trim()||"Por definir",category:"personal",description:String(data.get("description")||"").trim()||"Evento personal agregado a tu calendario."};
                personalEvents.push({...saved,date:parseLocalDate(saved.date)});events=[...baseEvents,...personalEvents].sort((a,b)=>a.date-b.date);
                writeStorage("miportal-personal-calendar-events",JSON.stringify(personalEvents.map(item=>({...item,date:`${item.date.getFullYear()}-${String(item.date.getMonth()+1).padStart(2,"0")}-${String(item.date.getDate()).padStart(2,"0")}`}))));
                selectedDate=parseLocalDate(dateValue);viewedMonth=new Date(selectedDate.getFullYear(),selectedDate.getMonth(),1);draw();renderAgenda();renderUpcoming();closeForm();
            });
        }
        draw();renderAgenda();renderUpcoming();
    }
    document.querySelectorAll("[data-important-offset]").forEach(item=>{
        const date=new Date();date.setDate(date.getDate()+Number(item.dataset.importantOffset));
        const label=item.querySelector(".important-date-label");if(label)label.textContent=new Intl.DateTimeFormat("es-CO",{weekday:"long",day:"numeric",month:"long"}).format(date);
    });

    document.querySelectorAll("[data-service-filter]").forEach(button=>button.addEventListener("click",()=>{
        document.querySelectorAll("[data-service-filter]").forEach(item=>item.classList.toggle("active",item===button));
        const filter=button.dataset.serviceFilter;
        document.querySelectorAll(".service-card[data-service-category]").forEach(card=>card.hidden=filter!=="all"&&card.dataset.serviceCategory!==filter);
    }));
    document.querySelectorAll(".service-card[data-service-title],.recommendation-action").forEach(card=>card.addEventListener("click",event=>{
        const destination = card.getAttribute("href") || "";
        if (card.target === "_blank" || /^https?:\/\//i.test(destination)) return;
        event.preventDefault();
        openInfoDialog(card.dataset.serviceTitle,`<p>${card.dataset.serviceDescription}</p><div class="service-next-step"><strong>¿Qué puedes hacer?</strong><p>Consulta los canales oficiales de la UNAB y revisa requisitos, horarios y disponibilidad antes de iniciar un trámite.</p></div>`);
    }));

    const leaderboardBody = document.getElementById("hoursLeaderboardBody");
    if (leaderboardBody) {
        const weeklyHours = Number((document.getElementById("hoursWeekStat")?.textContent || "9").replace(/[^0-9.]/g, ""));
        const participants = [
            { name: "Valentina Gómez", program: "Ingeniería de Sistemas", hours: 16 },
            { name: "Mateo Rodríguez", program: "Administración", hours: 14 },
            { name: "Isabella Martínez", program: "Comunicación Social", hours: 12 },
            { name: "Santiago Pérez", program: "Ingeniería Industrial", hours: 11 },
            { name: "Mariana Rojas", program: "Psicología", hours: 10 },
            { name: `${window.MiPortalUser?.name || "Tu cuenta"} (Tú)`, program: window.MiPortalUser?.program || "Programa no registrado", hours: weeklyHours, current: true },
            { name: "Samuel Torres", program: "Ingeniería de Mercados", hours: 8 },
            { name: "Luciana Herrera", program: "Derecho", hours: 7 },
            { name: "Andrés Castillo", program: "Ingeniería de Sistemas", hours: 6 },
            { name: "Gabriela Díaz", program: "Medicina", hours: 5 },
            { name: "Nicolás Vargas", program: "Diseño", hours: 4 },
            { name: "Daniela Moreno", program: "Contaduría Pública", hours: 3 }
        ].filter(person => person.hours > 0).sort((a, b) => b.hours - a.hours).slice(0, 12);
        leaderboardBody.innerHTML = participants.map((person, index) => {
            const position = index + 1;
            const rankClass = position === 1 ? "rank-one" : position === 2 ? "rank-two" : position === 3 ? "rank-three" : "";
            const positionMarkup = position <= 3 ? `<span class="rank ${rankClass}">${position}</span>` : String(position);
            return `<tr class="leaderboard-row${person.current ? " current-student" : ""}"><td>${positionMarkup}</td><td>${person.name}</td><td>${person.program}</td><td><strong>${person.hours} h</strong></td></tr>`;
        }).join("");
    }

    document.querySelectorAll(".hours-event[data-day-offset]").forEach(item=>{
        const date=new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()+Number(item.dataset.dayOffset));
        const label=item.querySelector(".dynamic-event-date");if(label)label.textContent=new Intl.DateTimeFormat("es-CO",{weekday:"long",day:"numeric",month:"long"}).format(date);
        item.removeAttribute("role");item.removeAttribute("tabindex");
    });

    const togglePassword=document.getElementById("togglePassword");const passwordInput=document.getElementById("passwordInput");
    togglePassword?.addEventListener("click",()=>{const visible=passwordInput.type==="password";passwordInput.type=visible?"text":"password";togglePassword.setAttribute("aria-label",visible?"Ocultar contraseña":"Mostrar contraseña");});
});
