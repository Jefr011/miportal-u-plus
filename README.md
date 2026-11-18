# MiPortal U Plus

**Rediseño y modernización de la experiencia estudiantil de la Universidad Autónoma de Bucaramanga (UNAB).**

Proyecto académico desarrollado para la asignatura **Diseño de Interfaces de Usuario**, del programa de **Ingeniería de Sistemas**.

## Información del proyecto

- **Institución:** Universidad Autónoma de Bucaramanga (UNAB).
- **Programa:** Ingeniería de Sistemas.
- **Asignatura:** Diseño de Interfaces de Usuario.
- **Profesor:** Julián Santiago Santoyo.
- **Proyecto:** MiPortal U Plus — Rediseño y modernización de la experiencia estudiantil.
- **Participantes:**
  - Jefferson Steven Useche Duarte.
  - Andres Felipe Nichoy Calderon.
  - Vismar Andres Mendez Romero.
- **Fecha de la propuesta:** octubre de 2026.

---

## 1. Descripción

MiPortal U Plus es un prototipo web académico que propone reorganizar y modernizar la experiencia de consulta de información estudiantil tomando como referencia Mi Portal U de la UNAB.

El proyecto reúne en una interfaz común accesos a información académica, cursos, horarios, calificaciones, calendario, Horas Libres, servicios universitarios, lugares y campus, perfil y configuración. La interfaz conserva una identidad visual inspirada en la UNAB y se adapta a computadores, tabletas y teléfonos.

El objetivo es facilitar la localización de información y reducir los pasos necesarios para llegar a las funciones frecuentes del estudiante. El prototipo no reemplaza las plataformas institucionales ni consulta sus bases de datos reales.

## 2. Tecnologías

- **HTML5:** estructura de las páginas.
- **CSS3:** estilos, componentes compartidos, diseño responsive, temas y estilos específicos por página.
- **JavaScript:** navegación interactiva, validaciones, búsqueda, calendario, notificaciones, preferencias y comunicación con los endpoints PHP.
- **PHP 8.1 o superior:** servidor de desarrollo, sesiones, registro e inicio de sesión, control de roles y procesamiento de solicitudes.
- **JSON:** almacenamiento sencillo de datos del prototipo en archivos del directorio temporal del sistema.
- **localStorage:** persistencia de preferencias y datos personales de interfaz en el navegador.

No se necesita Node.js, npm, Composer ni una base de datos para ejecutar la versión actual del prototipo.

## 3. Funcionalidades y páginas

### Páginas principales

| Página | Contenido |
|---|---|
| Inicio / Dashboard | Resumen del estudiante, horario del día, próximos eventos, progreso, favoritos y accesos rápidos. |
| Inicio de sesión | Acceso a una cuenta del prototipo. |
| Registro | Creación de cuenta de estudiante o docente para probar los roles. |
| Mis cursos | Consulta de asignaturas y organización por periodo académico. |
| Horario | Visualización semanal de las materias del periodo seleccionado e inscripciones de Horas Libres. |
| Calendario | Calendario académico, agenda diaria y creación de eventos personales. |
| Calificaciones | Consulta de notas, calculadora de notas y, para docentes, registro de calificaciones. |
| Notificaciones | Avisos, filtros, lectura de notificaciones y preferencias. |
| Recursos y servicios | Accesos a servicios universitarios y recomendaciones. |
| Horas Libres | Consulta de actividades, estadísticas, inscripciones y publicación de actividades para docentes. |
| Lugares y Campus | Exploración de El Jardín, CSU y El Bosque, mapa ilustrativo y lugares favoritos. |
| Perfil | Consulta y edición de información personal. |
| Configuración | Preferencias de visualización, accesibilidad y seguridad. |

### Diez funcionalidades adicionales de la propuesta

1. **Notificaciones de eventos importantes:** avisos de actividades y fechas relevantes, con vista previa, filtros, estados de lectura y preferencias.
2. **Calendario académico integrado:** visualización de fechas académicas importantes, agenda diaria y eventos personales.
3. **Recordatorios de horario y clases:** identificación de próximas clases y recordatorios del navegador cuando se concede permiso y el portal permanece abierto.
4. **Estadísticas de Horas Libres:** resumen de horas registradas, horas pendientes frente a la meta demostrativa, actividades y clasificación de ejemplo.
5. **Buscador general:** búsqueda de secciones, servicios y contenidos con sugerencias mientras se escribe y navegación por teclado.
6. **Modo oscuro:** tema claro/oscuro persistente y opción para reducir animaciones.
7. **Lugares favoritos:** posibilidad de guardar espacios del campus y consultarlos desde el dashboard.
8. **Mapa visual de campus y lugares:** representación gráfica interactiva para seleccionar lugares y consultar su información.
9. **Panel de accesos rápidos personalizable:** selección y organización de accesos frecuentes.
10. **Centro de recomendaciones de servicios:** sugerencias de secciones y servicios a partir de la navegación del prototipo.

## 4. Roles del prototipo

El formulario de registro permite crear una cuenta de demostración con uno de estos roles:

### Estudiante

- Consultar sus datos de perfil.
- Consultar cursos, horario y calificaciones disponibles.
- Utilizar la calculadora de notas.
- Consultar actividades de Horas Libres e inscribirse.
- Consultar sus inscripciones en el horario.
- Usar favoritos, calendario, notificaciones, búsqueda y preferencias.

### Docente

- Consultar y editar su perfil.
- Publicar actividades de Horas Libres.
- Registrar calificaciones para estudiantes que tengan una cuenta en el prototipo.
- Consultar las demás secciones disponibles según la interfaz.

Los endpoints PHP comprueban la sesión y el rol antes de permitir operaciones restringidas. **La selección de rol es únicamente demostrativa:** el prototipo no verifica que una persona sea estudiante o docente de la UNAB ni está integrado con el sistema institucional de identidad.

## 5. Estructura del proyecto

```text
MiPortalUPlus/
│
├── index.html                 # Dashboard principal
├── login.html                 # Inicio de sesión
├── register.html              # Registro de cuenta
│
├── pages/                     # Páginas internas del portal
│   ├── mis-cursos.html
│   ├── horario.html
│   ├── calendario.html
│   ├── calificaciones.html
│   ├── notificaciones.html
│   ├── servicios.html
│   ├── horas-libres.html
│   ├── lugares-campus.html
│   ├── perfil.html
│   └── configuracion.html
│
├── css/
│   ├── base.css               # Variables, tipografía y reglas base
│   ├── shell.css              # Encabezado, navegación y estructura común
│   ├── components.css         # Tarjetas, botones, paneles y componentes
│   ├── interactions.css       # Estados y efectos de interacción
│   ├── features.css           # Estilos de funcionalidades compartidas
│   ├── theme.css              # Tema claro y oscuro
│   ├── responsive.css         # Adaptación a distintos tamaños de pantalla
│   └── pages/                 # Estilos específicos de cada página
│
├── js/
│   ├── app.js                 # Tema, menús, interacciones generales
│   ├── features.js            # Sesión, perfil, búsqueda y funcionalidades
│   ├── curriculum-data.js     # Datos académicos del pensum de referencia
│   └── schedule-data.js       # Horario semanal demostrativo por periodo
│
├── api/
│   ├── storage.php            # Sesiones y almacenamiento JSON
│   ├── session.php            # Consulta de sesión actual
│   ├── register-user.php      # Registro de usuario
│   ├── login.php              # Inicio de sesión
│   ├── logout.php             # Cierre de sesión
│   ├── update-profile.php     # Actualización del perfil
│   ├── change-password.php    # Cambio de contraseña
│   ├── hours-events.php       # Consulta de actividades e inscripciones
│   ├── register-hours.php     # Publicación de actividad por docente
│   ├── enroll-hours.php       # Inscripción de estudiante
│   ├── grades.php             # Consulta de calificaciones
│   └── record-grade.php       # Registro de calificación por docente
│
├── assets/                    # Imágenes y recursos visuales
│   ├── dashboard/
│   └── campus-jardin-map.webp
│
├── docs/                      # Documentación y material de referencia
│   ├── propuesta-inscripcion.pdf
│   ├── funcionalidades-implementadas.md
│   ├── fuentes-campus.md
│   ├── correcciones-cuenta-y-campus.md
│   └── wireframes/
│
├── .gitignore
└── README.md
```

## 6. Requisitos para ejecutar el proyecto

- Windows, macOS o Linux.
- PHP **8.1 o superior** disponible desde la terminal.
- Navegador actualizado (Chrome, Firefox, Edge, etc.).
- Visual Studio Code es recomendado, pero no obligatorio.

La versión actual utiliza el servidor integrado de PHP. No es necesario iniciar Apache desde XAMPP para ejecutar el comando `php -S`.

## 7. Instalación y ejecución en Windows

### Paso 1. Descargar y descomprimir

Descarga el ZIP del proyecto y descomprímelo. Abre la carpeta raíz `MiPortalUPlus` en Visual Studio Code. Comprueba que dentro de esa carpeta se encuentren `index.html`, `login.html`, `register.html` y las carpetas `api`, `assets`, `css`, `js` y `pages`.

### Paso 2. Instalar PHP

Una forma sencilla de instalar PHP en Windows es utilizar XAMPP:

1. Descarga XAMPP desde [apachefriends.org](https://www.apachefriends.org/es/index.html).
2. Instálalo. La ruta utilizada en este proyecto es `C:\xampp\php`.
3. Comprueba que exista `C:\xampp\php\php.exe`.

### Paso 3. Agregar PHP al PATH (solo una vez)

Para poder ejecutar `php` sin escribir la ruta completa:

1. Presiona `Windows + R`.
2. Escribe `sysdm.cpl` y presiona Enter.
3. Abre **Opciones avanzadas** y selecciona **Variables de entorno**.
4. En las variables de usuario, selecciona `Path` y pulsa **Editar**.
5. Añade una entrada con esta ruta:

   ```text
   C:\xampp\php
   ```

6. Acepta las ventanas y cierra y vuelve a abrir la terminal o Visual Studio Code.

Comprueba la instalación:

```powershell
php -v
```

También puedes ejecutar PHP sin configurar el PATH, utilizando la ruta completa:

```powershell
C:\xampp\php\php.exe -v
```

### Paso 4. Abrir la terminal en la carpeta del proyecto

En Visual Studio Code abre **Terminal → Nuevo terminal**. Comprueba que la ruta actual sea la carpeta raíz del proyecto. Si necesitas llegar a ella manualmente, utiliza `cd` con la ruta donde descomprimiste la carpeta. Por ejemplo:

```powershell
cd "C:\Users\TU_USUARIO\OneDrive\Documentos\VS Code\miPortalUPlus"
```

Reemplaza `TU_USUARIO` por el nombre de tu carpeta de usuario y ajusta la ruta si guardaste el proyecto en otro lugar.

### Paso 5. Iniciar el servidor

Ejecuta desde la carpeta raíz:

```powershell
php -S localhost:8000
```

Si no configuraste el PATH, utiliza:

```powershell
C:\xampp\php\php.exe -S localhost:8000
```

Cuando aparezca un mensaje similar a `PHP Development Server started`, el servidor estará activo.

### Paso 6. Abrir MiPortal U Plus

Para entrar al inicio de sesión, abre:

```text
http://localhost:8000/login.html
```

Para abrir directamente el dashboard (requiere una sesión iniciada):

```text
http://localhost:8000/index.html
```

También puedes abrir el registro:

```text
http://localhost:8000/register.html
```

### Paso 7. Detener el servidor

Regresa a la terminal donde está ejecutándose PHP y presiona:

```text
Ctrl + C
```

Esto detiene el servidor local.

## 8. Flujo de prueba de las funcionalidades

### Crear una cuenta

1. Abre `http://localhost:8000/register.html`.
2. Completa nombre, correo, programa o área y contraseña.
3. Selecciona el tipo de cuenta: Estudiante o Docente.
4. Utiliza una contraseña de al menos 8 caracteres y confirma la contraseña.
5. Envía el formulario. El prototipo crea la cuenta e inicia la sesión.

El correo debe ser único dentro de los datos locales del prototipo. Para probar dos roles distintos, registra dos cuentas con correos diferentes.

### Probar el flujo de estudiante

1. Crea o inicia sesión con una cuenta de tipo Estudiante.
2. Entra a **Horas Libres** y consulta las actividades disponibles.
3. Inscríbete en una actividad.
4. Revisa la página **Horario**: la inscripción se muestra con una marca visual diferenciada.
5. Consulta las calificaciones que un docente haya registrado para el correo de esa cuenta.
6. Utiliza la calculadora de notas y las demás herramientas de estudiante.

### Probar el flujo de docente

1. Crea o inicia sesión con una cuenta de tipo Docente.
2. Entra a **Horas Libres** y publica una actividad indicando título, lugar, fecha, hora y duración.
3. En **Calificaciones**, registra una nota para un estudiante existente utilizando su correo registrado, periodo, asignatura y evaluación.
4. Cierra sesión y entra con la cuenta del estudiante para comprobar la inscripción y la calificación.

El servidor valida los roles. Un estudiante no puede publicar actividades ni registrar calificaciones mediante los endpoints protegidos.

## 9. Endpoints PHP

| Endpoint | Método / uso | Descripción |
|---|---|---|
| `api/session.php` | GET | Devuelve la sesión actual. |
| `api/register-user.php` | POST | Valida y crea una cuenta. |
| `api/login.php` | POST | Comprueba las credenciales e inicia sesión. |
| `api/logout.php` | GET | Cierra la sesión. |
| `api/update-profile.php` | POST | Actualiza los datos del perfil. |
| `api/change-password.php` | POST | Cambia la contraseña verificando la actual. |
| `api/hours-events.php` | GET | Consulta actividades e inscripciones disponibles para el usuario. |
| `api/register-hours.php` | POST | Publica una actividad; requiere rol docente. |
| `api/enroll-hours.php` | POST | Registra una inscripción; requiere rol estudiante. |
| `api/grades.php` | GET | Consulta calificaciones según la sesión. |
| `api/record-grade.php` | POST | Registra una calificación; requiere rol docente. |

`api/storage.php` es el módulo auxiliar que centraliza respuestas JSON, lectura de solicitudes, sesiones y almacenamiento de colecciones.

## 10. Persistencia de datos

El prototipo utiliza dos mecanismos:

### Navegador (`localStorage`)

Guarda, según la funcionalidad, preferencias visuales, tema, reducción de movimiento, favoritos, accesos rápidos, notificaciones leídas, filtros, eventos personales y otros ajustes de interfaz. Estos datos quedan en el navegador y perfil de usuario local donde se hayan creado; no se sincronizan automáticamente entre dispositivos.

### Servidor PHP (archivos JSON temporales)

Las cuentas, actividades de Horas Libres, inscripciones y calificaciones se almacenan mediante `api/storage.php` en el directorio temporal del sistema operativo:

```text
<directorio-temporal-del-sistema>/miportal-uplus-data/
```

En Windows suele corresponder a una carpeta dentro de `%TEMP%`. Las colecciones utilizadas son `users.json`, `hours-events.json`, `hours-enrollments.json` y `grades.json`.

Las sesiones PHP se mantienen mediante cookies de sesión. Las contraseñas se guardan con `password_hash()` y se verifican con `password_verify()`; nunca se almacenan como texto plano.

**Importante:** este mecanismo es para desarrollo y demostración. El directorio temporal puede ser limpiado por Windows o por herramientas de mantenimiento. Antes de una demostración importante, conserva una copia de los datos que necesites. No es una base de datos de producción ni ofrece sincronización multiusuario robusta para despliegue público.

## 11. Horario y datos académicos

- `js/curriculum-data.js` contiene la estructura de asignaturas y créditos del pensum de referencia.
- `js/schedule-data.js` contiene distribuciones semanales demostrativas para los periodos `2026-1`, `2026-2`, `2026-3` y `2026-4`.
- El dashboard y la página Horario utilizan la misma fuente de programación para evitar que las materias se contradigan.
- El horario se filtra por día y por fecha/hora de Colombia (`America/Bogota`).

Los horarios, docentes, salones y algunos datos académicos son demostrativos: no corresponden a una matrícula individual ni se consultan desde los sistemas de la UNAB.

## 12. Lugares y Campus

La sección contempla únicamente:

- **El Jardín:** incluye una ilustración conceptual basada en el croquis proporcionado por el equipo, con marcadores interactivos y fichas de lugares.
- **CSU:** ficha descriptiva del campus.
- **El Bosque:** ficha descriptiva del campus.

La imagen `assets/campus-jardin-map.webp` es una ilustración generada para el prototipo. No es un levantamiento arquitectónico, plano oficial ni mapa a escala. Las posiciones, recorridos y detalles deben contrastarse con información institucional antes de usarlos para orientación física.

Las fuentes institucionales de referencia se encuentran en `docs/fuentes-campus.md`.

## 13. Servicios externos

La sección de Recursos y Servicios contiene accesos a plataformas externas de la universidad, como Correo, Canvas, Office 365 y otros servicios enlazados desde el portal de acceso institucional. Estos accesos abren las páginas externas correspondientes. Su uso puede requerir credenciales institucionales y está sujeto a la disponibilidad y políticas de cada plataforma.

## 14. Diseño y criterios de interfaz

- Identidad visual inspirada en la UNAB, con predominio de morado, naranja y fondos claros.
- Tipografía Shantell Sans, cargada desde Google Fonts con alternativas de respaldo.
- Iconografía SVG integrada en el HTML.
- Componentes compartidos y hojas de estilo separadas por responsabilidad.
- Estados hover, focus, active y selected.
- Diseño adaptable a escritorio, tabletas y teléfonos.
- Tema claro y oscuro, con preferencia persistente.
- Opción para reducir animaciones.
- Navegación global y navegación contextual entre páginas.

## 15. Solución de problemas

### PowerShell muestra que `php` no se reconoce

PHP no está agregado al `PATH` o la terminal estaba abierta antes de modificarlo.

- Comprueba que exista `C:\xampp\php\php.exe`.
- Agrega `C:\xampp\php` a la variable de usuario `Path`.
- Cierra y vuelve a abrir PowerShell o Visual Studio Code.
- Ejecuta `php -v`.

Como alternativa temporal, inicia el servidor con:

```powershell
C:\xampp\php\php.exe -S localhost:8000
```

### El puerto 8000 ya está ocupado

Inicia el servidor en otro puerto:

```powershell
php -S localhost:8001
```

Y abre `http://localhost:8001/login.html`.

### Se abre el dashboard en lugar del login

Abre directamente `http://localhost:8000/login.html`. La ruta raíz puede servir el dashboard porque `index.html` es la página principal del proyecto.

### Los formularios no responden o las API muestran errores

- Asegúrate de estar usando `http://localhost:8000` y no abriendo los HTML con `file://`.
- Inicia PHP desde la carpeta raíz que contiene `api/`, `index.html` y `login.html`.
- Revisa la terminal donde ejecutaste `php -S`; allí aparecen las solicitudes y los errores PHP.
- Confirma que PHP tenga disponibles las extensiones estándar `json` y `session`.

### Se perdió la sesión o los datos

Las cuentas y los datos del servidor están en el directorio temporal del sistema, no dentro del repositorio. Windows puede limpiar esa ubicación. Los datos de `localStorage` también dependen del navegador y del perfil local que se esté utilizando.

## 16. Git y colaboración

El archivo `.gitignore` evita agregar al repositorio archivos temporales del sistema, configuraciones privadas locales, logs, cachés y dependencias generadas. No excluye los HTML, CSS, JavaScript, PHP, imágenes, wireframes ni documentos del proyecto.

Comandos básicos para iniciar el repositorio:

```bash
git init
git add .
git commit -m "Initial commit: MiPortal U Plus"
```

Para comprobar los archivos que Git detecta:

```bash
git status
```

No subas contraseñas reales, claves privadas, archivos `.env` ni información personal sensible. Si más adelante se incorpora una base de datos, se debe revisar su configuración y excluir las credenciales y copias locales.

## 17. Alcance y limitaciones

MiPortal U Plus es un prototipo académico de interfaz y flujo de navegación. No está integrado con el backend institucional, el sistema real de notas, matrículas, horarios, autenticación, servicios de correo ni registro oficial de Horas Libres de la UNAB.

Los roles se pueden seleccionar en el registro de demostración; por tanto, no constituyen una verificación de identidad o autorización institucional. Las actividades, notas, horas, horarios y demás datos de ejemplo no tienen validez académica. El servidor integrado de PHP está destinado al desarrollo local y no debe exponerse como servidor de producción.

## 18. Documentación adicional

- `docs/propuesta-inscripcion.pdf`: documento de propuesta del proyecto.
- `docs/funcionalidades-implementadas.md`: lista de funcionalidades y alcance.
- `docs/fuentes-campus.md`: fuentes y límites de la información de campus.
- `docs/correcciones-cuenta-y-campus.md`: notas de correcciones de cuenta y campus.
- `docs/wireframes/`: diseños de referencia y croquis proporcionados por el equipo.

---

**MiPortal U Plus — Universidad Autónoma de Bucaramanga (UNAB)**  
Proyecto académico · Ingeniería de Sistemas · Diseño de Interfaces de Usuario · Octubre de 2026
