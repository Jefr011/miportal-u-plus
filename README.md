# MiPortal U Plus

Prototipo académico de rediseño de la experiencia estudiantil de la Universidad Autónoma de Bucaramanga (UNAB). Está construido con HTML, CSS, JavaScript y PHP, con datos de demostración y persistencia local/de servidor para los flujos incluidos.

## Estructura

- `index.html`: dashboard.
- `login.html` y `register.html`: inicio de sesión y registro de cuenta del prototipo.
- `pages/`: Mis cursos, Horario, Calendario, Calificaciones, Notificaciones, Recursos, Horas Libres, Lugares y Campus, Perfil y Configuración.
- `css/`: estilos base, estructura compartida, componentes, interacciones, tema, responsive y estilos individuales por página.
- `js/`: lógica principal, funcionalidades adicionales, datos del pensum y horario semanal de demostración.
- `api/`: endpoints PHP para cuentas, sesión, publicación e inscripción a Horas Libres y consulta/registro de calificaciones.
- `assets/`: imágenes utilizadas por las páginas.
- `docs/`: propuesta, fuentes consultadas, checklist de implementación y wireframes originales, incluido el croquis del Campus El Jardín.

## Las diez funcionalidades adicionales

1. **Notificaciones de eventos importantes:** menú de vista previa, estados leída/no leída, filtros por categoría y preferencias persistentes.
2. **Calendario académico integrado:** fechas de referencia, agenda diaria y eventos personales guardados en el navegador.
3. **Recordatorios de horario y clases:** avisos opcionales del navegador antes de una clase; requieren permiso y que el portal permanezca abierto.
4. **Estadísticas de Horas Libres:** acumulado frente a la meta demostrativa de 80 horas, actividades disponibles, inscripciones y clasificación semanal de ejemplo.
5. **Buscador general:** sugerencias de páginas, servicios, lugares y contenidos, con selección por teclado y Enter.
6. **Modo oscuro:** tema persistente, estilos para las páginas y control de reducción de movimiento.
7. **Lugares favoritos:** marcadores de espacios del campus guardados por cuenta en el navegador y visibles en el dashboard.
8. **Mapa visual de campus:** mapa esquemático interactivo de El Jardín reconstruido a partir del croquis del equipo; CSU y El Bosque tienen fichas descriptivas.
9. **Accesos rápidos personalizables:** selección y orden de accesos del dashboard.
10. **Recomendaciones de servicios:** sugerencias según las secciones y búsquedas realizadas en el prototipo, junto con accesos a servicios institucionales.

## Roles del prototipo

El registro permite crear una cuenta de demostración como estudiante o docente. El rol seleccionado sirve para probar las vistas y permisos; no verifica una vinculación real con la UNAB.

- **Estudiante:** consulta sus datos y notas, se inscribe en actividades de Horas Libres y ve esas inscripciones marcadas en su horario.
- **Docente:** publica actividades de Horas Libres y registra calificaciones de estudiantes existentes mediante su correo registrado.

El servidor PHP valida los permisos de cada endpoint según la sesión. El control de rol es demostrativo y no debe utilizarse como mecanismo de autorización institucional real.

## Ejecutar el proyecto

Para probar únicamente la navegación y las funciones locales, puedes abrir `index.html` con Live Server. Para probar registro, inicio de sesión, publicación de actividades, inscripciones y registro/consulta de calificaciones, utiliza PHP 8 o superior.

Desde la carpeta raíz del proyecto ejecuta:

```bash
php -S localhost:8000
```

Abre `http://localhost:8000/index.html`. Para crear una cuenta, entra en `register.html`, completa los datos y selecciona el rol de demostración. Luego podrás ingresar desde `login.html`.

### Flujo docente

1. Crea una cuenta de demostración con rol Docente.
2. Entra en Horas Libres y publica una actividad.
3. En Calificaciones, selecciona periodo y asignatura, escribe el correo de un estudiante registrado y guarda la evaluación.

### Flujo estudiante

1. Crea una cuenta con rol Estudiante.
2. En Horas Libres, inscríbete en una actividad disponible.
3. La inscripción queda guardada y se incorpora al horario con una marca visual diferenciada.
4. Consulta las calificaciones que un docente haya asociado al correo de tu cuenta.

## Persistencia

Preferencias, tema, favoritos, accesos rápidos, notificaciones leídas, eventos personales, calculadoras e inscripciones de respaldo se guardan en `localStorage` por usuario cuando corresponde. Las cuentas, sesiones, actividades publicadas, inscripciones y calificaciones compartidas utilizan endpoints PHP y archivos JSON en un directorio temporal del servidor. Las contraseñas se guardan con `password_hash()` y se validan con `password_verify()`.

Este almacenamiento está pensado para una demostración académica. No es una base de datos de producción, y los datos del servidor pueden borrarse cuando el entorno temporal se limpie.

## Lugares y Campus

La navegación contiene únicamente **El Jardín**, **CSU** y **El Bosque**. El mapa de El Jardín es un SVG interactivo y esquemático trazado a partir de `docs/wireframes/croquis-campus-jardin.png`. Conserva las posiciones relativas y nombres visibles en el croquis; E y F se dejan como puntos pendientes de identificación. El dibujo no está a escala y no es un plano institucional oficial. CSU y El Bosque muestran información general porque no se proporcionó un croquis de esos campus.

## Servicios institucionales

Los accesos de Correo UNAB, Cosmos, Office 365 y Canvas utilizan los enlaces publicados en el portal oficial de Acceso UNAB: https://acceso.unab.edu.co/. El inicio de sesión externo depende de las credenciales y permisos institucionales correspondientes.

## Datos demostrativos y límites

Los horarios, salones, docentes, calificaciones iniciales, eventos académicos, estadísticas de Horas Libres y ranking incluyen datos de ejemplo. El pensum se organiza en los cuatro periodos de demostración `2026-1` a `2026-4`. Las actividades publicadas por docentes y las inscripciones se conservan en el almacenamiento del prototipo; el reconocimiento de horas requiere validación y no se acredita automáticamente.

Consulta `docs/funcionalidades-implementadas.md` para la lista de alcance y `docs/fuentes-campus.md` para las referencias y límites del mapa.


## Correcciones de cuenta y campus

- `assets/campus-jardin-map.webp` es la ilustración isométrica generada a partir del croquis del Campus El Jardín. Los marcadores HTML superpuestos abren la ficha de cada lugar. La imagen es conceptual y no está a escala.
- Las páginas internas consultan `api/session.php`; si no existe una sesión válida, redirigen al inicio de sesión. Ya no se utiliza un estudiante Juan Pérez de demostración como identidad por defecto.
- El nombre corto del encabezado muestra el primer nombre de la cuenta autenticada. El menú desplegable muestra el nombre completo.
- El perfil permite editar tanto campos ya diligenciados como campos vacíos. Los cambios se guardan mediante `api/update-profile.php`.
- Seguridad permite cambiar la contraseña mediante `api/change-password.php`, verificando la contraseña actual y almacenando el nuevo hash.
