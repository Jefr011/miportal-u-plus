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
            { title: "Notificaciones", detail: "Avisos académicos y eventos", terms: "notificaciones avisos mensajes correos", href: "pages/notificaciones.html" }
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
    document.querySelectorAll(".preview-notice").forEach(link => {
        link.addEventListener("click", event => {
            const destination = link.getAttribute("href");
            if (!destination) return;
            event.preventDefault();
            window.location.assign(new URL(destination, window.location.href).href);
        });
    });
    const updateUnreadCount = () => {
        const hasNotificationList = Boolean(document.querySelector(".notification-list"));
        const unread = hasNotificationList ? document.querySelectorAll(".notice-item.is-unread").length : Number(document.querySelector(".notification-count")?.textContent || 3);
        const count = document.getElementById("unreadCount");
        if (count) count.textContent = unread;
        if (hasNotificationList) document.querySelectorAll(".notification-count").forEach(badge => badge.textContent = unread);
    };
    const filterNotices = filter => noticeItems.forEach(item => { item.hidden = filter !== "all" && item.dataset.category !== filter; });
    document.querySelectorAll(".tab-button[data-filter]").forEach(button => button.addEventListener("click", () => {
        document.querySelectorAll(".tab-button[data-filter]").forEach(tab => tab.classList.toggle("active", tab === button));
        filterNotices(button.dataset.filter);
    }));
    noticeItems.forEach(item => item.querySelector(".notice-action")?.addEventListener("click", event => {
        const action = event.currentTarget;
        item.classList.remove("is-unread"); item.classList.add("is-read"); action.textContent = "Leída"; action.disabled = true; updateUnreadCount();
    }));
    document.querySelector(".mark-all-read")?.addEventListener("click", () => {
        noticeItems.forEach(item => { item.classList.remove("is-unread"); item.classList.add("is-read"); const action=item.querySelector(".notice-action"); if(action){action.textContent="Leída";action.disabled=true;} });
        updateUnreadCount();
    });
    const preferenceToggles = [...document.querySelectorAll("[data-notification-pref]")];
    preferenceToggles.forEach(toggle => {
        const key = `miportal-pref-${toggle.dataset.notificationPref}`;
        const saved = readStorage(key);
        if (saved !== null) toggle.checked = saved === "true";
        toggle.addEventListener("change", () => {
            writeStorage(key, String(toggle.checked));
            if (toggle.dataset.notificationPref === "preview") document.querySelectorAll(".preview-notice").forEach(item => item.hidden = !toggle.checked);
            const feedback = document.getElementById("preferenceFeedback"); if (feedback) feedback.textContent = "Preferencia actualizada correctamente.";
        });
    });
    const previewPref = readStorage("miportal-pref-preview", "true") === "true";
    document.querySelectorAll(".preview-notice").forEach(item => item.hidden = !previewPref);
    updateUnreadCount();
    const requestedNoticeId = new URLSearchParams(window.location.search).get("notice");
    if (requestedNoticeId && document.getElementById(requestedNoticeId)) {
        document.querySelectorAll(".tab-button[data-filter]").forEach(tab => tab.classList.toggle("active", tab.dataset.filter === "all"));
        filterNotices("all");
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

    const dayNames = ["Lunes","Martes","Miércoles","Jueves","Viernes"];
    const scheduleSlots = ["6:00 a.m. – 8:00 a.m.","8:00 a.m. – 10:00 a.m.","10:00 a.m. – 12:00 m.","1:00 p.m. – 3:00 p.m.","3:00 p.m. – 5:00 p.m."];
    const scheduleColors = ["purple","orange","green","pink","blue"];
    const schedulePatterns = {
        "2026-1": [{day:0,slot:0},{day:0,slot:1},{day:1,slot:3},{day:2,slot:0},{day:3,slot:4},{day:4,slot:2}],
        "2026-2": [{day:0,slot:4},{day:1,slot:0},{day:1,slot:2},{day:2,slot:3},{day:3,slot:0},{day:3,slot:1},{day:4,slot:4},{day:2,slot:1}],
        "2026-3": [{day:0,slot:2},{day:0,slot:3},{day:1,slot:1},{day:2,slot:4},{day:3,slot:2},{day:4,slot:0},{day:4,slot:3}],
        "2026-4": [{day:0,slot:0},{day:0,slot:2},{day:2,slot:1},{day:2,slot:2},{day:3,slot:3},{day:4,slot:0}]
    };
    const makeSchedule = (courses, period) => {
        const placement = schedulePatterns[period] || schedulePatterns["2026-4"];
        return courses.map((course,index) => ({
            course,
            day: placement[index % placement.length].day,
            slot: placement[index % placement.length].slot,
            room: ["Aula B-203 · Edificio C","Laboratorio D-1 · Edificio D","Aula C-204 · Edificio C","Aula B-102 · Edificio B","Laboratorio de informática · Edificio D"][((index * 3) + levelFromPeriod(period)) % 5],
            color: scheduleColors[(index + (levelFromPeriod(period) || 1)) % scheduleColors.length],
            professor: ["María Fernanda Gómez","Carlos Andrés Rueda","Laura Jiménez","Andrés Felipe Rojas","Diana Marcela Pérez"][((index + (levelFromPeriod(period) || 1)) * 2) % 5]
        }));
    };
    const schedulePeriodSelect=document.getElementById("schedulePeriodSelect");
    const renderSchedule=period=>{
        const grid=document.getElementById("scheduleGrid"); if(!grid) return;
        const courses=subjectsFor(period); const level=levelFromPeriod(period); const classes=makeSchedule(courses, period);
        const slots=[0,1,2,3,4];
        grid.style.gridTemplateColumns="62px repeat(5,minmax(86px,1fr))";
        grid.innerHTML=`<div class="week-head">Hora</div>${dayNames.map(day=>`<div class="week-head">${day}</div>`).join("")}`;
        slots.forEach(slot=>{
            grid.insertAdjacentHTML("beforeend",`<div class="time-cell">${["6:00","8:00","10:00","1:00","3:00"][slot]}</div>`);
            dayNames.forEach((day,dayIndex)=>{
                const match=classes.find(item=>item.day===dayIndex && item.slot===slot);
                if(match){
                    const index=classes.indexOf(match);
                    grid.insertAdjacentHTML("beforeend",`<div class="week-cell"><button type="button" class="schedule-chip ${match.color}" data-schedule-index="${index}"><strong>${match.course.name}</strong><small>${scheduleSlots[slot]}</small></button></div>`);
                } else grid.insertAdjacentHTML("beforeend",`<div class="week-cell"></div>`);
            });
        });
        grid.querySelectorAll("[data-schedule-index]").forEach(button=>button.addEventListener("click",()=>{
            const item=classes[Number(button.dataset.scheduleIndex)];
            openInfoDialog(item.course.name,`<div class="detail-grid"><div><small>Día</small><strong>${dayNames[item.day]}</strong></div><div><small>Horario</small><strong>${scheduleSlots[item.slot]}</strong></div><div><small>Créditos</small><strong>${item.course.credits}</strong></div><div><small>Salón demostrativo</small><strong>${item.room}</strong></div></div><p>Docente de referencia: ${item.professor}. La asignación de grupos, docentes, aulas y horas es ilustrativa; consulta la programación oficial para confirmar tu matrícula.</p>`);
        }));
        const periodNode=document.getElementById("scheduleCurrentPeriod"); if(periodNode) periodNode.textContent=period;
        const countNode=document.getElementById("scheduleCourseCount"); if(countNode) countNode.textContent=courses.length;
        const creditNode=document.getElementById("scheduleCredits"); if(creditNode) creditNode.textContent=courses.reduce((sum,c)=>sum+c.credits,0);
        const upcoming=document.getElementById("upcomingSchedule");
        if(upcoming) upcoming.innerHTML=classes.slice(0,5).map(item=>`<div class="upcoming-item"><b class="dot ${item.color}-bg"></b><div><strong>${item.course.name}</strong><small>${dayNames[item.day]} · ${scheduleSlots[item.slot]} · ${item.room}</small></div></div>`).join("") || `<p>No hay clases asociadas a este periodo.</p>`;
        grid.dataset.period=period;
        grid._scheduleClasses=classes;
    };
    if(schedulePeriodSelect){
        renderSchedule(schedulePeriodSelect.value);
        schedulePeriodSelect.addEventListener("change",()=>{savePeriod(schedulePeriodSelect.value);renderSchedule(schedulePeriodSelect.value);});
    }
    document.getElementById("downloadSchedule")?.addEventListener("click",()=>{
        const grid=document.getElementById("scheduleGrid"); if(!grid) return;
        const classes=grid._scheduleClasses || []; const period=grid.dataset.period || "2026-4";
        const canvas=document.createElement("canvas"); canvas.width=1800; canvas.height=1040;
        const ctx=canvas.getContext("2d");
        ctx.fillStyle="#f8f7ff";ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle="#5121ad";ctx.font="bold 50px 'Shantell Sans', Arial";ctx.fillText("Mi horario semanal",70,85);
        ctx.fillStyle="#7f739b";ctx.font="28px Arial";ctx.fillText(`Ingeniería de Sistemas · Periodo ${period}`,72,135);
        const left=205,top=195,colW=300,rowH=150; const headers=["Hora",...dayNames];
        headers.forEach((label,index)=>{const x=index===0?55:left+(index-1)*colW;ctx.fillStyle=index===0?"#ebe3fb":"#5524b2";ctx.fillRect(x,top,index===0?150:colW-8,72);ctx.fillStyle=index===0?"#4b2a7f":"#ffffff";ctx.font="bold 25px Arial";ctx.fillText(label,x+18,top+45);});
        const labels=["6:00 a.m. – 8:00 a.m.","8:00 a.m. – 10:00 a.m.","10:00 a.m. – 12:00 m.","1:00 p.m. – 3:00 p.m.","3:00 p.m. – 5:00 p.m."];
        labels.forEach((label,slot)=>{
            const y=top+72+slot*rowH;
            ctx.fillStyle="#eee9f7";ctx.fillRect(55,y,150,rowH-7);ctx.fillStyle="#51436e";ctx.font="20px Arial";ctx.fillText(label,65,y+65);
            dayNames.forEach((day,dayIndex)=>{const x=left+dayIndex*colW;ctx.fillStyle="#ffffff";ctx.fillRect(x,y,colW-8,rowH-7);ctx.strokeStyle="#e3ddee";ctx.strokeRect(x,y,colW-8,rowH-7);const item=classes.find(c=>c.day===dayIndex&&c.slot===slot);if(item){const palette={purple:"#eee5ff",orange:"#fff0dd",green:"#def7ef",pink:"#ffeaf3",blue:"#e9f1ff"};ctx.fillStyle=palette[item.color]||"#eee5ff";ctx.beginPath();if(typeof ctx.roundRect === "function"){ctx.roundRect(x+10,y+10,colW-28,rowH-27,16);}else{ctx.rect(x+10,y+10,colW-28,rowH-27);}ctx.fill();ctx.fillStyle="#30204f";ctx.font="bold 19px Arial";const words=item.course.name.split(" ");let line="",lines=[];words.forEach(word=>{const test=line?line+" "+word:word;if(ctx.measureText(test).width>colW-55){lines.push(line);line=word;}else line=test;});if(line)lines.push(line);lines.slice(0,3).forEach((value,i)=>ctx.fillText(value,x+25,y+48+i*25));ctx.font="17px Arial";ctx.fillStyle="#665783";ctx.fillText(item.room,x+25,y+132);}});
        });
        const link=document.createElement("a");link.download=`horario-${period}.png`;link.href=canvas.toDataURL("image/png");link.click();
    });

    const openDashboardClass = row => openInfoDialog(row.dataset.classTitle || row.querySelector("strong")?.textContent || "Clase", `<div class="detail-grid"><div><small>Horario</small><strong>${row.dataset.classTime || row.querySelector("small")?.textContent || "Por confirmar"}</strong></div><div><small>Ubicación</small><strong>${row.dataset.classPlace || row.querySelector("div span")?.textContent || "Por confirmar"}</strong></div></div><p>Consulta la sección Horario para revisar la programación semanal de tus asignaturas.</p><a class="outline-button" href="pages/horario.html">Abrir horario completo ›</a>`);
    document.querySelectorAll(".class-row[data-class-title]").forEach(row=>{
        row.addEventListener("click",()=>openDashboardClass(row));
        row.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();openDashboardClass(row);}});
    });
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
        event.preventDefault();openInfoDialog(card.dataset.serviceTitle,`<p>${card.dataset.serviceDescription}</p><div class="service-next-step"><strong>¿Qué puedes hacer?</strong><p>Consulta los canales oficiales de la UNAB y revisa requisitos, horarios y disponibilidad antes de iniciar un trámite.</p></div>`);
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
            { name: "Juan Pérez (Tú)", program: "Ingeniería de Sistemas", hours: weeklyHours, current: true },
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
    document.getElementById("loginForm")?.addEventListener("submit",event=>{event.preventDefault();const feedback=document.getElementById("loginFeedback");if(feedback)feedback.textContent="Esta es una demostración visual. La autenticación se conectará posteriormente.";});
});
