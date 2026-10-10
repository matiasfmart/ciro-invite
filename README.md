# Invitaciones mobile

Invitación de cumpleaños mobile-first con React, TypeScript y Vite. El entregable es un sitio 100% estático: HTML, CSS, JavaScript, imágenes y fuentes locales. No necesita Node, servidor de aplicación, API ni base de datos en producción. La confirmación prepara un mensaje para WhatsApp; no almacena asistentes ni afirma que el mensaje haya sido enviado.

## Desarrollo

```sh
npm install
npm run dev
npm test
npm run build
```

## Crear otra invitación

Editá `src/config/invitation.ts` para cambiar el nombre, la edad, la fecha, el horario, el salón, la dirección y el número de WhatsApp. El tema visual se importa desde `src/themes/david.ts`: allí están la imagen, la paleta, los personajes, los textos, las piedras y el cierre del mensaje de confirmación. `src/config/types.ts` define el contrato compartido.

- Usá la fecha `YYYY-MM-DD`, la hora `HH:mm` y una zona horaria IANA.
- Si aún no hay horario, dejá `time: null`: se muestra "A confirmar" y se cuentan días calendario en la zona del evento, sin asumir una hora.
- El teléfono debe incluir el código de país. Si es `null`, la confirmación queda deshabilitada.
- Los personajes se muestran exclusivamente con los PNG oficiales de `public/assets/characters/`. David no se espeja; Goliat de pie y golpeado se orientan a la izquierda porque los archivos reales miran a la derecha. El cuadro caído conserva su orientación original, con la cabeza hacia donde cae. El hero usa solo los cuadros del juego; la pradera usa `david-pastor.png` y cuatro copias de `oveja.png`. `david-saludo.png` ya no aparece en la invitación.
- Para otra temática, creá un archivo en `src/themes/` e importalo en la configuración. Podés cambiar paleta, personajes, textos, valores coleccionables y cierre del mensaje sin tocar las fechas ni WhatsApp. El juego es independiente de las otras secciones.
- Activá o desactivá secciones con `sections.countdown`, `sections.details` y `sections.rsvp`.
- El título, la descripción y los metadatos Open Graph del HTML estático se generan desde la configuración durante el build; no requieren cambios manuales ni servidor.

## Módulos

Cada sección recibe la configuración por propiedades: `Hero` integra nombre, edad, fecha, lugar y juego en una única escena de `100svh`; `Countdown` mantiene el mismo cálculo y presenta la pradera; `EventDetails` ofrece datos y mapa; `Rsvp` conserva nombre, cantidad y WhatsApp, sin personajes; `Closing` permite soplar la vela de `torta.png`. Ninguna interacción es obligatoria para consultar los datos o confirmar.

`OfficialSlingshot` mantiene el mismo juego dentro del hero, con un canvas transparente sobre el fondo de la portada. El encuadre y la conversión de coordenadas táctiles son de presentación; `src/lib/official-game.ts`, la física Matter.js, las horquillas, colisiones y tiempos de caída permanecen iguales. La piedra se dibuja por encima del texto si pasa por el cielo. La pista del gesto desaparece al primer agarre y la victoria aparece dentro de la escena, no en una franja independiente.

La piedra sigue el dedo con tensión limitada y muestra una trayectoria prevista por la misma física. Solo la cabeza inicia el derribo; el torso rebota y los tiros fallidos vuelven a estar disponibles. La secuencia usa `goliat-golpeado.png` para impacto y tambaleo, un hit-stop de 80 ms y rotación acelerada desde los pies. A los 1.150 ms cambia a `goliat-caido.png` con rebote, polvo y estrellas. La victoria muestra `david-festejo.png`, el mensaje de cumpleaños y el botón de repetir. No requiere WebGL, Node ni servidor de aplicación.

Los fondos reales son `public/assets/characters/fondo-hero.jpg` para vertical y `fondo-juego.jpg` para horizontal. Los pies se apoyan en la línea del pasto y el cielo cubre la portada completa. `david-listo.png` reemplaza al nombre alternativo `david-gomera.png`, que no existe en el repositorio. Las capturas están en `screenshots/` y no forman parte del compilado publicado.

`Meadow` mantiene una única oveja saltadora. `src/lib/meadow.ts` calcula la altura según el cerco, el tamaño visible de la oveja y un margen para la panza. El recorrido incluye impulso, parábola, squash de aterrizaje y regreso por delante del cerco; se repite cada 4,5 segundos mientras la escena está visible. Las otras ovejas solo saltan en su lugar al tocarlas. Las pezuñas se alinean usando el recorte visible del PNG y las sombras siguen el movimiento. Con movimiento reducido solo aparece "¡Beee!". La frase "Valentía, amistad y mucho amor." queda debajo de la escena.

## Nitidez Y Resoluciones

El canvas se dimensiona como tamaño CSS por `devicePixelRatio`, sin limitarlo a 2. Se dibuja desde las imágenes originales con `imageSmoothingEnabled` y `imageSmoothingQuality: 'high'`. En 390 x 844 con DPR 3, el canvas interno es 1170 x 2532. El fondo utiliza cover sin deformación. La victoria es una pastilla sobre el pasto y el confeti se dibuja solo en el canvas del juego.

| Recurso activo | Resolución original |
| --- | --- |
| david-listo.png | 768 x 1368 |
| david-tirando.png | 1024 x 1024 |
| david-festejo.png | 1024 x 1024 |
| goliat-pie.png | 768 x 1369 |
| goliat-golpeado.png | 1024 x 1024 |
| goliat-caido.png | 1024 x 1024 |
| david-pastor.png | 1024 x 1024 |
| oveja.png | 768 x 1366 |
| torta.png | 768 x 1369 |
| fondo-hero.jpg | 768 x 1376 |
| fondo-juego.jpg | 1376 x 768 |

Los PNG cuadrados tienen menos de 1200 px en su lado mayor, pero sus píxeles disponibles superan el tamaño de dibujo actual incluso a DPR 3. Los fondos sí requieren ampliación de píxeles al llenar pantallas de alta densidad: se recomienda regenerar fondo-hero.jpg a 1536 x 2752 y fondo-juego.jpg a 2752 x 1536, conservando composición y proporciones. Aumentar el canvas no recupera detalle que falta en el recurso original. arbol.png (768 x 1366) y david-saludo.png (768 x 1368) se conservan en public, pero no se dibujan en la invitación actual.

`Closing` calibra la llama sobre la mecha del PNG de la torta. Al tocarla, se apaga, sale humo y el confeti nace desde la vela con los colores de los banderines. El aplauso corto solo se reproduce si el sonido está activado. Después de 3,2 segundos aparece "Volver a encender". Con movimiento reducido, se usa un fundido y no se genera confeti. El cierre de torta corresponde al pedido más reciente y reemplaza al cierre anterior con foto.

Las secciones inferiores usan `src/themes/living.css` para bordes ondulados y entradas sutiles una sola vez. `AnimatedDays` cuenta hasta el valor real al aparecer y el reloj pequeño se actualiza cada segundo; sin horario confirmado se rotula como tiempo hasta la fecha, no hasta una hora de fiesta inventada. `DetailsTrail` dibuja huellas y mueve una oveja decorativa con scroll pasivo y un máximo de una actualización por frame, sin interceptar el desplazamiento. `GuestFlock` muestra hasta ocho ovejas con gorritos y agrupa las restantes en `+N`. Al confirmar, el grupo salta durante 260 ms antes de abrir el enlace preparado de WhatsApp; con movimiento reducido se abre inmediatamente. La torta conserva confeti y agradecimiento, pero no reserva espacio vacío para mensajes o botones todavía ocultos. La portada y la física no se modifican con estos efectos.

`AdventureProvider` comparte sonidos opcionales y el confeti del cumpleaños. `App` compone las secciones y aplica los tokens del tema. `src/themes/storybook.css` conserva los estilos funcionales y `src/themes/journey.css` define portada, pradera y vela. `src/lib/event.ts` contiene fechas, mapa y WhatsApp, sin cambios en su lógica.

## Publicación Estática En Render

1. Ejecutá `npm run build` localmente. Node se usa solo para generar el compilado, no en producción.
2. El entregable es todo el contenido de `dist/`: `index.html`, `assets/` y `licenses/`. Las rutas son relativas y las fuentes y sus licencias están incluidas. No hace falta enviar `src/`, `node_modules/` ni el código de desarrollo.
3. Copiá ese contenido a la raíz del repositorio que vas a publicar. Render toma archivos desde Git; no ofrece subida manual de carpetas como un hosting por FTP.
4. En Render elegí **New > Static Site**, conectá ese repositorio y configurá **Build Command: `true`**, **Publish Directory: `.`**. `true` solo termina el paso de build sin ejecutar Node.
5. Configurá **`SKIP_INSTALL_DEPS=true`** para evitar instalación automática de dependencias. No uses **Web Service**.

No se necesitan APIs, puertos de aplicación ni reglas de SPA: la invitación es una página con anclas. Compartí la URL pública que entregue Render, no la dirección del servidor de desarrollo.

Las fuentes Fredoka y DM Sans se empaquetan localmente. El sonido se activa voluntariamente. El movimiento reducido desactiva los efectos ambientales y sustituye las transiciones del juego por estados breves. La piedra tiene una zona táctil HTML de al menos 44 px; fuera de ella se puede hacer scroll. Las flechas apuntan, Enter o espacio lanzan y Escape cancela. El formulario abre WhatsApp con el mensaje preparado: el invitado debe enviarlo para confirmar.# ciro-invite
