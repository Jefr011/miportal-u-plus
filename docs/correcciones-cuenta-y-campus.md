# Correcciones de cuenta y Campus El Jardín

## Mapa del Jardín
- Se reemplazó el SVG esquemático anterior por `assets/campus-jardin-map.webp`, una ilustración isométrica generada a partir del croquis proporcionado.
- Los 12 marcadores se mantienen como botones HTML accesibles y siguen usando las mismas claves de lugares que el directorio y los favoritos.
- El mapa es ilustrativo, no está a escala ni debe usarse como plano oficial de orientación.

## Identidad y acceso
- Las páginas privadas consultan `api/session.php` y redirigen a `login.html` cuando no existe una sesión válida.
- Se eliminó la identidad de demostración fija. El encabezado muestra el primer nombre de la cuenta y el menú desplegable puede mostrar el nombre completo.
- El ranking de Horas Libres identifica a la cuenta estudiantil autenticada; las cuentas docentes no se insertan en el ranking de estudiantes.

## Perfil y seguridad
- Los botones de edición abren un formulario con todos los campos personales, tanto completos como vacíos.
- `api/update-profile.php` valida y persiste los cambios, incluyendo la comprobación de correo duplicado.
- La sección Seguridad permite cambiar la contraseña, verificando la contraseña actual, confirmando la nueva y almacenando un hash.
- `api/login.php` devuelve también los campos extendidos del perfil para que se conserven después de cerrar e iniciar sesión.

## Prueba local
Desde la carpeta del proyecto: `php -S localhost:8000`. Después abrir `http://localhost:8000/login.html`.
