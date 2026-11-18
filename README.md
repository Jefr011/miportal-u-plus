# MiPortal U Plus+

Prototipo de interfaz universitaria. Abre `index.html` con Live Server para recorrerlo.

## Estructura

- `index.html`: dashboard.
- `pages/`: páginas interiores.
- `css/base.css`: variables, tipografía y reinicio.
- `css/shell.css`: encabezado, navegación lateral y menús desplegables.
- `css/components.css`: tarjetas, paneles, botones y componentes compartidos.
- `css/pages/`: estilos específicos de cada página.
- `css/theme.css`: modo claro/oscuro y animación del selector.
- `css/responsive.css`: adaptación a escritorio, tabletas y móviles.
- `js/app.js`: interacciones del prototipo.
- `assets/`: imágenes y recursos.
- `wareframes/`: wireframes de referencia.

## Interacciones incluidas

- Calendario basado en la fecha local del navegador, navegación entre meses, selección de días y eventos demostrativos.
- Flechas de las clases del dashboard abren una ficha de detalle.
- Menú desplegable de notificaciones y menú de perfil.
- Filtros de notificaciones, marcar como leídas y preferencias guardadas localmente.
- Tema claro/oscuro persistente con transición animada del indicador.
- Horas libres con próximas actividades y ranking ficticio de 12 estudiantes.

Los datos y las acciones son demostrativos. No hay conexión con sistemas oficiales de la UNAB, autenticación real ni almacenamiento en servidor.


## Actualización de interacciones y plan de estudios

- Los estilos se conservan separados por capa general y página; `css/interactions.css` reúne interacciones transversales.
- `js/curriculum-data.js` contiene los nueve niveles y créditos del folleto UNAB de Ingeniería de Sistemas suministrado para este proyecto.
- El prototipo limita los periodos académicos disponibles a `2026-1`, `2026-2`, `2026-3` y `2026-4`. No se ofrecen periodos posteriores porque aún no se han cursado.
- Docentes, aulas, franjas horarias, notas, actividades y ranking son datos de demostración y no proceden del folleto.
- El folleto menciona ocho semestres en la sección de duración, pero su tabla de plan de estudios presenta nueve niveles, incluido el nivel 9 con práctica profesional. Se conserva la tabla completa sin reinterpretar esa diferencia.
- La página Lugares y campus se mantiene sin cambios funcionales ni visuales, según lo solicitado.


## Últimos ajustes

- Corregido el contraste de la fecha del dashboard en modo oscuro.
- Las notificaciones del menú compacto navegan a la página completa y posicionan la notificación seleccionada; no abren un cuadro modal.
- Periodos limitados a `2026-1` hasta `2026-4`.
- Horarios distintos para cada uno de los cuatro periodos.
- Calendario conserva su diseño e incorpora eventos personales guardados en el navegador, con indicador verde azulado.
- Las asignaturas de `2026-4` aparecen como `Cursando` en calificaciones.
- Las próximas actividades de horas libres se mantienen estáticas.


## Correcciones adicionales (17 de noviembre de 2026)

- La fecha del bloque de próximos eventos tiene contraste explícito en modo oscuro.
- Los avisos del menú pequeño enlazan a la página de Notificaciones y posicionan el aviso seleccionado, sin abrir un cuadro modal.
- Los periodos disponibles se limitan a `2026-1`, `2026-2`, `2026-3` y `2026-4`; los valores guardados de años posteriores se normalizan a `2026-4`.
- Cada periodo de 2026 tiene una distribución de horario distinta.
- El calendario permite agregar eventos personales, que se guardan en `localStorage` y se identifican con un punto verde azulado.
- Las asignaturas de `2026-4` aparecen con estado `Cursando`.
- Las actividades próximas de Horas libres son estáticas y no tienen hover ni acción de apertura.
