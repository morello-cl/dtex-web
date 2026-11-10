# Portal web de comercios DTEx® — diseño

Fecha: 2026-11-10. Autor: Marco Antonio (MUFIN SpA), con Claude.
Estado: borrador para aprobación.

## 1. Intención

Hoy el dueño de un comercio DTEx® no tiene dónde ver sus números. Para saber
cuánto vendió o por qué su abono llegó con otro monto, llama a soporte o le
pregunta a su distribuidor. El portal le da tres cosas, en este orden de
importancia:

1. **Cómo va su negocio**: lo que vendió en los últimos 7 días comparado con
   períodos anteriores. El caso típico es el lunes por la mañana, cuando
   revisa el fin de semana.
2. **Su plata**: si el abono ya se pagó, cuándo llega y cómo se llegó al
   monto (bruto, comisión, ajustes). Es la razón número uno de los llamados a
   soporte.
3. **Sus datos**: ver los datos de su comercio, su logo y su cuenta de
   depósito.

**En esta etapa el portal es solo de lectura y muestra solo la información
que ya existe** (decisión de Marco). No edita nada. Las únicas escrituras
nuevas son las que exige el acceso (usuarios y enlaces) y el registro del
resultado del pago, que se hace desde dtex_dashboard y no desde el portal.

Éxito = el comercio responde solo "¿cuánto vendí?" y "¿cuándo me pagan y por
qué ese monto?", y bajan los llamados a soporte por abonos.

## 2. Objetivos, no-objetivos y anti-objetivos

**Objetivos**
- Login seguro con el correo de empresa, que debe validarse antes de habilitar
  el acceso.
- Pantalla de inicio con los últimos 7 días y cinco comparativos.
- Abonos por día de venta, con estado y desglose claro.
- Vista de los datos del comercio, del logo (color y blanco y negro) y de la
  cuenta de depósito.

**No-objetivos (por ahora)**
- Varios usuarios por comercio y roles admin/user/view. El modelo de datos
  queda preparado, pero solo existe el usuario del correo de empresa.
- MFA.
- Descuentos por cuota o arriendo de equipo, créditos MUFIN u otros (hoy no
  existen en tomahawk; ver §8).
- Tasa de comisión aplicada a cada venta.
- Cualquier edición desde el portal: datos de contacto y logo pasan a la
  etapa 2.
- Cambiar o agregar la cuenta de depósito: validar una cuenta tiene costo real
  y cambiarla requiere más seguridad (MFA).
- Editar el nombre de fantasía, el horario, el RUT, la razón social, los
  servicios, el estado o la dirección.
- Comercios de otros distribuidores: la fase 1 cubre solo `dist = 1` (MUFIN).

**Anti-objetivos (sería un fracaso aunque "funcione")**
- Mostrar "pagado" o una fecha de llegada como hecho cuando es solo una
  estimación.
- Que el portal cambie algo que afecte al SII, al contenido fiscal de la
  boleta o a la configuración de pagos. El logo impreso es la única excepción,
  pedida explícitamente: es imagen de marca, no dato fiscal.
- Que un usuario vea datos de otro comercio.
- Exponer el número de cuenta completo o el JWT de tomahawk en el navegador.
- Que la sección de abonos sea más difícil de entender que llamar a soporte.

## 3. Restricciones

- **Back:** tomahawk (Node + Express, MySQL `in_be`, respuesta
  `{ error, message, data }`, JWT en `x-token-dtex`). Sus convenciones:
  - rutas snake_case versionadas y campos snake_case en inglés, con prefijo
    `cl_` para conceptos chilenos;
  - identificadores UUID;
  - 404 (no 403) cuando el recurso es de otro comercio;
  - **lo existente no se modifica**: todo cambio va en una versión nueva del
    endpoint.
  - `dev.dtex.cl` escribe en la base de prod.
- **Front:** este repo (Next.js 16, React 19, Tailwind v4, sin backend
  propio). El portal agrega rutas de servidor que solo actúan como
  intermediario (BFF) hacia tomahawk; no hay base de datos en este repo.
- `dtex_customers` (`/Users/maoo/py/web/dtex_customers`) está **descartado como
  base**. Se reciclan ideas y piezas: contratos, el patrón BFF con lista
  blanca y el manejo de la cookie de sesión.
- Los correos se envían por Resend desde `mail.dtex.cl` (el único dominio
  verificado).
- Las ventas se guardan en `dtes.date`/`time` en hora Chile. Los DATETIME
  están en UTC y el pool no declara zona horaria (salen +3 h): los agregados
  deben formatear en SQL.

## 4. Orden de trabajo

Son cinco proyectos, en este orden. Cada uno se entrega usable por sí mismo.

| # | Proyecto | Tomahawk | dtex (este repo) | dtex_dashboard |
|---|---|---|---|---|
| 1 | Acceso | usuarios de comercio, auth y correos | login, activación, recuperación, sesión | — |
| 2 | Inicio | endpoint de agregados de ventas | pantalla de 7 días y comparativos | — |
| 3 | Mi comercio | lectura con auth de comercio de datos, logo y cuenta | pantalla de datos, logo y cuenta (solo lectura) | — |
| 4 | Abonos v1 | registro del resultado del pago y lectura de `pagos_comercio` | pantalla de abonos | pantalla MUFIN para registrar pagos y rechazos |
| 5 | Abonos v2 | modelo de descuentos y tasa por venta | desglose ampliado | lo que corresponda |

El proyecto 5 se diseñará por separado cuando llegue su turno.

**Quién construye:** tomahawk lo construye la sesión tomahawk_8,
dtex_dashboard la sesión dtex_dashboard y el portal esta sesión (dtex_web).
Antes de empezar cada proyecto, se acuerda su contrato (endpoints, cuerpos y
errores) en `docs/portal/contratos.md`, en este repo. dtex construye contra
ese contrato con datos de prueba mientras tomahawk lo implementa.
*(Decisión de Claude.)*

**Alcance de "comercio":** un usuario corresponde a un `client_id`. Inicio y
Abonos **suman todas las sucursales y equipos** del comercio, y en la fase 1
no hay filtro por sucursal. La cuenta de depósito es una por comercio
(`clients.cuenta_bancaria_id`). *(Decisión de Claude. El filtro por sucursal
se agrega cuando se pida.)*

## 5. Proyecto 1: Acceso

### Reglas (decididas por Marco)
- El usuario del comercio es el **correo de empresa**, `clients.email`
  normalizado (trim + minúsculas). Es el admin/root del comercio. **No se usa
  `dist_cli.email`**: se evaluará eliminarlo en el futuro (decisión de Marco).
- Mientras no valide el correo, el usuario está **inactivo**.
- Solo pueden tener usuario los comercios de `dist = 1` con un correo **único
  en todos los distribuidores**. Medición del 2026-11-10: 1.009 comercios, 719
  aptos, 288 con correo compartido y 2 sin correo. (La medición se hizo
  sobre `dist_cli.email`; solo un comercio difiere de `clients.email`, así que
  hay que repetirla sobre `clients.email` antes de la carga inicial.) Los no aptos **no tienen
  acceso** hasta que su distribuidor corrija el correo con
  `POST /api/customers/v4/register`.
- **Si el distribuidor cambia el correo de empresa, el correo anterior pierde
  el acceso.** El correo nuevo parte inactivo y debe validarse.
- Sin MFA en la fase 1.

### Flujo
1. **Activar cuenta** (primera vez): el comercio ingresa su correo. Si el
   correo es apto, tomahawk envía un enlace de un solo uso con vigencia
   limitada. Al abrirlo, el correo queda validado y el usuario define su
   contraseña en el mismo paso. Nunca se envían contraseñas por correo.
2. **Ingresar**: correo y contraseña.
3. **Olvidé mi contraseña**: el mismo mecanismo de enlace.
4. **Respuesta neutra**: activar y recuperar siempre responden igual ("si el
   correo corresponde a un comercio habilitado, te llegará un enlace"), para no
   revelar qué correos existen. *(Decisión de Claude.)*

### Tomahawk (trabajo nuevo)
- **Tabla de usuarios del portal** con `uuid`, `client_id`, `email`
  (`UNIQUE`: la tabla nace sin duplicados), hash de contraseña (bcrypt, como el
  login de distribuidor), `role` (en la fase 1 siempre `admin`), `status`
  (`inactive`/`active`/`revoked`), fechas y un contador de intentos fallidos.
  El `role` se incluye ahora para no tener que migrar cuando lleguen los roles.
- **Tokens de enlace:** se guarda solo su hash, son de un solo uso, vencen y
  tienen límite de envío por correo.
- **Revocación cuando cambia el correo:** cada request con sesión de comercio
  valida que `usuario.email` siga siendo igual al `clients.email` normalizado
  actual y que el usuario siga activo. Si no se cumple, responde 401. Esto
  cubre el cambio de correo sin tocar los endpoints de alta existentes.
  *(Decisión de Claude: así no se modifica lo existente. Cuesta una consulta
  por request.)*
- Endpoints de auth del comercio (nombres finales los define tomahawk):
  `activate`, `confirm` (token + contraseña), `login`, `forgot`, `reset`,
  `me`. Al iniciar sesión se emite un JWT propio de comercio, distinto del de
  distribuidor, que lleva `client_uuid` y `user_uuid`.
- Bloqueo temporal tras varios intentos de login fallidos.
- Envío de correos por Resend desde `mail.dtex.cl`.

### dtex (este repo)
- Rutas bajo `/portal`: `/portal/ingresar`, `/portal/activar`,
  `/portal/recuperar` y `/portal/clave/[token]` (sin sesión), e `/portal`,
  `/portal/abonos` y `/portal/comercio` (con sesión). *(Decisión de Claude:
  mismo deploy que la landing, sin subdominio nuevo.)*
- El JWT de tomahawk se guarda en una cookie httpOnly, `secure` y
  `sameSite=lax`, y **nunca llega al JS del navegador**. Las Server
  Components y Server Actions llaman a tomahawk desde el servidor.
- Un `proxy.ts` (el nuevo nombre de middleware en Next 16) redirige a
  `/portal/ingresar` si no hay sesión. Si tomahawk responde 401, se borra la
  cookie y se redirige.
- `/portal/*` lleva `noindex` y se excluye de `sitemap.ts`.
- Se puede tomar como referencia, sin copiar a ciegas, el manejo de la cookie
  de `dtex_customers/lib/auth.ts`.

## 6. Proyecto 2: Inicio (últimos 7 días)

### Contenido (decidido con Marco, mockup aprobado)
- **Ventana:** los últimos 7 días móviles, hasta hoy. El día de hoy se compara
  hasta la misma hora.
- **Cinco comparativos:** semana anterior, hace 2 semanas, hace 1 mes, hace 2
  meses y hace 1 año. Se alinean por día de semana (lunes contra lunes): 1 mes
  = 4 semanas, 2 meses = 8 semanas y 1 año = 52 semanas. *(Decisión de Claude
  para que la comparación por día tenga sentido.)*
- **Cifra principal:** el monto total de los 7 días y su variación contra el
  comparativo elegido (semana anterior por defecto).
- **Día por día:** barras pares, últimos 7 días contra el comparativo elegido.
  El día de hoy va parcial, con una frase: "Hoy llevas $X, N% menos que el
  martes pasado a esta hora".
- **Regla de comparativos:** los cinco períodos como barras horizontales a la
  misma escala, con una línea que marca el período actual y una frase de
  lectura. Si un período no tiene datos, se dice ("Aún no vendías con DTEx®"),
  nunca se muestra como 0%.
- **Franja inferior:** número de ventas, ticket promedio, porcentaje con
  tarjeta, hora de más venta y el próximo abono (que enlaza a Abonos). El
  "próximo abono" **se agrega con el proyecto 4**; antes no aparece.
  *(Decisión de Claude.)*
- **"Monto":** todo lo involucrado en el pago, incluidos la propina y el
  cashback (el efectivo que el cliente retira al pagar con tarjeta). Decisión
  de Marco. La columna o suma exacta la confirma tomahawk en el contrato.

### Tomahawk
- Un endpoint de agregados por comercio con auth de comercio, que devuelva
  para la ventana actual y cada comparativo los totales por día (monto,
  cantidad, ventas con tarjeta) y, para la ventana actual, la distribución por
  hora. El corte del día de hoy es la hora actual en Chile. Usa los índices
  existentes `(client_id, date, total)`.

### Dirección visual (revisada con frontend-design)
- **Paleta:**
  - morado MUFIN `#2D0D54` como eje (cifras, período actual, navegación);
  - morado del logo `#461FB6` para lo interactivo;
  - lavanda `#C9BFE6` para el período comparado;
  - fondo `#F8F7FB`, superficies blancas y bordes `#E4DFF0`;
  - turquesa `#0A7B69` para las alzas y ámbar `#8A4B00` para las bajas, nunca
    rojo.
- Se agregan como tokens nuevos en `globals.css` (`--mufin-*`). **Sin fondos
  oscuros** (decisión de Marco).
- Inter, igual que la landing, con `font-variant-numeric: tabular-nums` en
  los montos. Una sola cifra protagonista y el resto tranquilo.
- No usar etiquetas en mayúsculas, separadores "·", flechas "→" ni grillas de
  tarjetas idénticas.
- Los gráficos van en **SVG inline hecho a mano**, igual que los mockups
  existentes del sitio. No se agrega librería de gráficos. *(Decisión de
  Claude.)*
- Referencia: el mockup en
  `.superpowers/brainstorm/*/content/panel-semana-v3.html`.

## 7. Proyecto 3: Mi comercio

### Datos del comercio (solo lectura)
Se muestran razón social, RUT, giro, nombre de fantasía, correo de empresa,
dirección, sucursales con sus equipos, y el representante legal con su
contacto. Para cualquier cambio: "contacta a tu distribuidor".

**Etapa 2, edición:** solo lo que hoy cubre `PATCH /api/customers/v3/:id`, en
una versión nueva que acepte la auth de comercio:
- representante legal: RUT y nombre, siempre juntos;
- teléfono del representante legal (hasta 32 caracteres);
- correo del representante legal (hasta 120 caracteres);
- código postal de la casa matriz.

El correo de empresa es el login: cambiarlo desde el portal queda fuera
incluso en la etapa 2.

### Logo
**Fase 1: solo se muestra.** Se ven el logo en color y el de blanco y negro
del comercio, con la herencia resuelta por el servidor (`customers/v7/logo`).
**Modificarlo queda para la etapa 2** (decisión de Marco), con este diseño:
- Las mismas opciones que dtex_dashboard, sobre los endpoints existentes de
  `upload/v3`, en una versión con auth de comercio:
  - tres niveles: comercio, sucursal y equipo;
  - dos variantes: color (pantalla) y blanco y negro (impresora térmica);
  - PNG o JPG de hasta 200 KB, con al menos 360 px de alto o 576 px de ancho.
- La pantalla muestra el árbol comercio → sucursales → equipos e indica en
  cada nivel si usa un logo propio o lo hereda (y de quién). "Quitar" un logo
  vuelve a la herencia.
- Validar tamaño y formato en el navegador antes de subir, y mostrar los
  errores del servidor tal como vienen.
- El POS toma el logo nuevo en su siguiente consulta, sin reiniciar. Se le
  dice así al usuario.

### Cuenta de depósito
- Solo lectura: banco, tipo, número enmascarado (`***1234`), titular y estado
  de validación de la cuenta de abono.
- El número completo **nunca sale del servidor**: el endpoint con auth de
  comercio lo devuelve enmascarado.
- Si el hub no responde (`HUB_NO_DISPONIBLE`), se muestra "No pudimos cargar
  tu cuenta en este momento" sin bloquear el resto de la pantalla.

## 8. Proyecto 4: Abonos v1

### Qué se muestra
Una fila por cada día de venta (`pagos_comercio.fecha_venta`), solo de Kushki
(el único proveedor con `liquida_mufin = 1`). Datos desde octubre de 2026.

Desglose de cada abono, cada concepto en su propia línea:
- bruto vendido con tarjeta y número de transacciones;
- comisión (neta);
- IVA de la comisión;
- regularización (`ajuste`), con una explicación en lenguaje simple: "Devolución
  de diferencia: cobramos la tarifa más alta mientras no conocíamos el tipo de
  tarjeta";
- **monto a abonar** (`pagado`).

### Estados que ve el comercio

| Estado | Origen | Qué ve el comercio |
|---|---|---|
| En proceso | la fila existe, sin resultado de pago | "Tu abono está en proceso" y la fecha estimada de llegada, rotulada como estimada |

**Fecha estimada:** el abono se paga al día siguiente antes de las 10:00,
incluidos fines de semana y feriados (dato de Marco). No hace falta un
calendario de días hábiles.
| Pagado | registro de pago de MUFIN | "Pagado el {fecha}" |
| Rechazado | registro de rechazo de MUFIN | el motivo (por ejemplo, el límite mensual de la CuentaRUT) y qué hacer: cambiar la cuenta de abono con su distribuidor |

Información secundaria de cada abono:
- **Monto estimado o conciliado**: `metodo` y `conciliado_en`.
- **Diferencia pendiente**: `diferencia ≠ 0` sin `regularizada_en`. Se muestra
  como "Se ajustará en tu próximo abono".

### Registro del resultado del pago (dato nuevo)
- **Carga retroactiva:** se cargan como pagados todos los abonos ya
  transferidos. Son pocos, porque Kushki parte en septiembre u octubre de 2026.
- Hoy no queda registro de que el banco ejecutó la nómina. **El resultado se
  registra en dtex_dashboard, solo desde la cuenta MUFIN** (decisión de Marco).
- Tomahawk, en una tabla nueva (no se modifica `pagos_comercio`), registra:
  - por abono, el resultado (`paid`/`rejected`), la fecha de pago, el motivo
    del rechazo, quién lo registró y cuándo;
  - pensado para marcar una nómina completa como pagada y luego marcar los
    rechazos uno por uno. *(Suposición de Claude.)*
- **Rechazo:** el monto rechazado vuelve a quedar pendiente y entra en una
  nómina posterior. El portal lo muestra vinculado al abono original. La forma
  en que el job `kushki_payment` recoge los rechazados y el vínculo exacto se
  definen en el contrato del proyecto 4, antes de construir la pantalla.

### Endpoints
- Tomahawk: lectura de abonos con auth de comercio (lista por rango de fechas
  y detalle), y escritura del resultado del pago con auth MUFIN (`ROOT_ROLE`,
  `dist = 1`).
- dtex_dashboard: la pantalla de registro de pagos y rechazos.

## 9. Lo que se recicla de dtex_customers
- El patrón BFF: el navegador nunca ve el JWT de tomahawk y el `client_id`
  sale de la sesión, nunca de la URL.
- El manejo de la cookie (`lib/auth.ts`) como referencia.
- El formato de los contratos en `docs/backend-contracts.md`, como punto de
  partida para el contrato de auth. **Se descarta** su flujo de OTP de 6
  dígitos (lo reemplaza el enlace) y su soporte multi-mercado y multi-idioma.

## 10. Lo que queda a criterio de quien construye
- Los nombres finales de endpoints, tablas y columnas en tomahawk, siguiendo
  sus convenciones.
- La vigencia exacta del enlace, los límites de envío y la política de bloqueo
  por intentos.
- La duración de la sesión.
- La estructura de componentes en `src/components/portal/`.
- Los estados vacíos y de carga, siguiendo el tono de §6.

## 11. Pruebas
No hay un entorno aislado: `dev.dtex.cl` escribe en la base de prod. Se prueba
contra prod con **el comercio MUFIN** como comercio de prueba, y dtex
desarrolla con datos de prueba ajustados al contrato.

## 12. Pendientes registrados
- **Correo de empresa único:** `POST /api/customers/v4/register` está
  implementado en tomahawk (v7.79.0) **sin commit y sin smokes**. dtex_dashboard
  ya fue notificado del contrato y tiene que migrar su formulario de alta a v4
  y capturar el 409 `EMAIL_IN_USE`. Los otros flujos que escriben el correo
  (`upload/v1/customer`, `uploads`, `comerce/v2`) no validan unicidad.
- **Un comercio tiene `clients.email` distinto de `dist_cli.email`.** Revisarlo
  antes de la carga inicial.
- Evaluar eliminar `dist_cli.email`. El alta v4 valida contra ambos campos.
- Descuentos por equipo, créditos MUFIN y otros: modelarlos (proyecto 5).
- Tasa de comisión por venta: recalcularla o poblar `comisiones_trx`
  (proyecto 5).
- Roles admin/user/view y creación de usuarios por el admin.
- Agregar `.superpowers/` a `.gitignore`.
