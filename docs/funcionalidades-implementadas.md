# Funcionalidades implementadas

## Páginas del portal

- [x] Inicio / Dashboard.
- [x] Inicio de sesión.
- [x] Registro de cuenta del prototipo.
- [x] Perfil del estudiante o docente.
- [x] Mis cursos y pensum.
- [x] Horario semanal por periodo.
- [x] Calendario y eventos personales.
- [x] Calificaciones y calculadora de notas.
- [x] Notificaciones y preferencias.
- [x] Recursos y servicios.
- [x] Horas Libres: estadísticas, publicación docente e inscripción estudiante.
- [x] Lugares y Campus: El Jardín, CSU y El Bosque.
- [x] Configuración y preferencias.

## Diez funcionalidades adicionales de la propuesta

- [x] Notificaciones de eventos importantes, con lectura, filtros y preferencias.
- [x] Calendario académico integrado con agenda y eventos personales.
- [x] Recordatorios de horario y clases mediante notificaciones del navegador opcionales.
- [x] Estadísticas de Horas Libres: acumulado, meta, actividades y ranking demostrativo.
- [x] Buscador general con sugerencias y navegación por teclado.
- [x] Modo oscuro persistente y reducción de movimiento.
- [x] Lugares favoritos persistentes.
- [x] Mapa visual interactivo de campus y lugares.
- [x] Accesos rápidos personalizables.
- [x] Recomendaciones de servicios ajustadas a la navegación y búsquedas del prototipo.

## Captura y procesamiento de información

- [x] Registro e inicio de sesión con cuentas de demostración, sesión PHP y contraseñas con hash.
- [x] Publicación de actividades de Horas Libres por docentes.
- [x] Inscripción de estudiantes en actividades y sincronización de la inscripción con su horario.
- [x] Registro de calificaciones por docentes para estudiantes registrados y consulta por parte del estudiante.

## Roles y permisos

- **Estudiante:** consultar información, inscribirse en actividades, consultar notas y usar calculadora.
- **Docente:** publicar actividades de Horas Libres y registrar calificaciones.
- Los endpoints PHP validan sesión y rol. El rol se selecciona en un formulario de demostración y no verifica identidad institucional.

## Alcance de campus

- **El Jardín:** mapa SVG esquemático trazado a partir del croquis del equipo. E y F permanecen por identificar.
- **CSU y El Bosque:** fichas descriptivas; no se inventan mapas internos porque no se proporcionaron croquis.
- El mapa no está a escala y no reemplaza un plano institucional oficial.

## Límites del prototipo

Horarios, salones, docentes, notas iniciales, ranking y eventos base son datos ilustrativos. Las actividades publicadas y las inscripciones requieren validación académica para su reconocimiento real. La persistencia PHP utiliza archivos JSON temporales y no una base de datos de producción.
