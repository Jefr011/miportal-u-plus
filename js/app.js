document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const themeButtons = document.querySelectorAll("[data-theme]");
    const savedTheme = localStorage.getItem("miportal-theme") || "light";

    const applyTheme = theme => {
        body.classList.toggle("dark-mode", theme === "dark");
        themeButtons.forEach(button => {
            button.classList.toggle("selected", button.dataset.theme === theme);
            button.classList.toggle("active", button.dataset.theme === theme);
        });
        localStorage.setItem("miportal-theme", theme);
    };

    applyTheme(savedTheme);

    themeButtons.forEach(button => {
        button.addEventListener("click", () => applyTheme(button.dataset.theme));
    });

    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    const menuButton = document.getElementById("mobileMenu");

    const closeMenu = () => {
        sidebar?.classList.remove("mobile-open");
        backdrop?.classList.remove("visible");
    };

    menuButton?.addEventListener("click", () => {
        sidebar?.classList.toggle("mobile-open");
        backdrop?.classList.toggle("visible");
    });

    backdrop?.addEventListener("click", closeMenu);

    document.querySelectorAll(".nav-item").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    const search = document.getElementById("globalSearch");
    search?.addEventListener("input", () => {
        const query = search.value.trim().toLocaleLowerCase("es");
        const candidates = document.querySelectorAll(".course-card, .service-card, .notice-item, .event-row, .place-list article");
        candidates.forEach(item => {
            item.hidden = query.length > 0 && !item.textContent.toLocaleLowerCase("es").includes(query);
        });
    });

    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".tab-button").forEach(tab => tab.classList.remove("active"));
            button.classList.add("active");
            const filter = button.dataset.filter;
            document.querySelectorAll(".notice-item").forEach(item => {
                item.hidden = filter !== "all" && item.dataset.category !== filter;
            });
        });
    });

    const monthLabel = document.getElementById("monthLabel");
    const calendarGrid = document.getElementById("calendarGrid");
    if (monthLabel && calendarGrid) {
        let month = 9;
        let year = 2025;
        const eventDays = [14, 24, 28, 31];

        const drawCalendar = () => {
            monthLabel.textContent = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
            calendarGrid.querySelectorAll(".calendar-date").forEach(day => day.remove());

            const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const previousMonthDays = new Date(year, month, 0).getDate();

            for (let i = 0; i < 42; i++) {
                const cell = document.createElement("button");
                cell.type = "button";
                cell.className = "calendar-date";
                let dayNumber;
                if (i < firstDay) {
                    dayNumber = previousMonthDays - firstDay + i + 1;
                    cell.classList.add("muted");
                } else if (i >= firstDay + daysInMonth) {
                    dayNumber = i - firstDay - daysInMonth + 1;
                    cell.classList.add("muted");
                } else {
                    dayNumber = i - firstDay + 1;
                    if (year === 2025 && month === 9 && dayNumber === 24) cell.classList.add("today");
                    if (eventDays.includes(dayNumber)) cell.classList.add("has-event");
                }
                cell.textContent = dayNumber;
                cell.addEventListener("click", () => {
                    calendarGrid.querySelectorAll(".calendar-date").forEach(date => date.classList.remove("selected-day"));
                    cell.classList.add("selected-day");
                });
                calendarGrid.appendChild(cell);
            }
        };

        document.getElementById("prevMonth")?.addEventListener("click", () => {
            month--;
            if (month < 0) { month = 11; year--; }
            drawCalendar();
        });
        document.getElementById("nextMonth")?.addEventListener("click", () => {
            month++;
            if (month > 11) { month = 0; year++; }
            drawCalendar();
        });
        drawCalendar();
    }

    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("passwordInput");
    togglePassword?.addEventListener("click", () => {
        const visible = passwordInput.type === "password";
        passwordInput.type = visible ? "text" : "password";
        togglePassword.textContent = visible ? "◉" : "◉";
    });

    document.getElementById("loginForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const feedback = document.getElementById("loginFeedback");
        feedback.textContent = "Esta es una demostración visual. La autenticación se conectará posteriormente.";
    });

    document.getElementById("downloadSchedule")?.addEventListener("click", () => {
        window.print();
    });
});
