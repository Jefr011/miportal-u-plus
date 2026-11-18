window.MiPortalSchedule = {
    timeZone: "America/Bogota",
    slots: [
        { start: "06:00", end: "08:00", label: "6:00 a. m. – 8:00 a. m." },
        { start: "08:00", end: "10:00", label: "8:00 a. m. – 10:00 a. m." },
        { start: "10:00", end: "12:00", label: "10:00 a. m. – 12:00 m." },
        { start: "13:00", end: "15:00", label: "1:00 p. m. – 3:00 p. m." },
        { start: "15:00", end: "17:00", label: "3:00 p. m. – 5:00 p. m." }
    ],
    patterns: {
        "2026-1": [
            { day: 0, slot: 0 }, { day: 0, slot: 1 }, { day: 1, slot: 3 },
            { day: 2, slot: 0 }, { day: 3, slot: 4 }, { day: 4, slot: 2 }
        ],
        "2026-2": [
            { day: 0, slot: 4 }, { day: 1, slot: 0 }, { day: 1, slot: 2 },
            { day: 2, slot: 3 }, { day: 3, slot: 0 }, { day: 3, slot: 1 },
            { day: 4, slot: 4 }, { day: 2, slot: 1 }
        ],
        "2026-3": [
            { day: 0, slot: 2 }, { day: 0, slot: 3 }, { day: 1, slot: 1 },
            { day: 2, slot: 4 }, { day: 3, slot: 2 }, { day: 4, slot: 0 },
            { day: 4, slot: 3 }
        ],
        "2026-4": [
            { day: 0, slot: 0 }, { day: 0, slot: 2 }, { day: 2, slot: 1 },
            { day: 2, slot: 2 }, { day: 3, slot: 3 }, { day: 4, slot: 0 }
        ]
    },
    rooms: [
        "Aula B-203 · Edificio C",
        "Laboratorio D-1 · Edificio D",
        "Aula C-204 · Edificio C",
        "Aula B-102 · Edificio B",
        "Laboratorio de informática · Edificio D"
    ],
    professors: [
        "María Fernanda Gómez",
        "Carlos Andrés Rueda",
        "Laura Jiménez",
        "Andrés Felipe Rojas",
        "Diana Marcela Pérez"
    ]
};
