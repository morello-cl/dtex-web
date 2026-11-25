# Kushki — referencia técnica para DTEx® (Chile)

Resumen de la documentación de Kushki para Chile (docs.kushki.com, protegida con
contraseña), descargada el 2026-11-24: 137 páginas de `cl/` más la página de
webhooks de Cloud Terminal API, App to app y Terminal SDK. Redactado con
palabras propias; cada apartado enlaza su página fuente, que manda ante
cualquier diferencia. Sin llaves ni credenciales de ejemplo.

Contexto: DTEx® se está certificando con Kushki en el terminal Sunmi P3 (ver
sección Redes en `CLAUDE.md`).

## Lo esencial

- **Modo recomendado para la app DTEx® en el Sunmi P3: Kushki ONE Connect por
  Localhost.** DTEx® mantiene su pantalla de venta y la app de pagos de Kushki
  lee la tarjeta y autoriza. Kushki ONE está en **Beta**: Kushki pide coordinar
  con ellos antes de usarlo en producción.
- **Raw card-present API no conviene**: exige PCI, HSM propio, intercambio de
  llaves DUKPT y certificaciones de marca (ADVT/CDET, M-TIP).
- App to app, Cloud Terminal API y Terminal SDK solo tienen documentados sus
  webhooks, con ejemplos de México. Hay que confirmar si están disponibles en Chile.
- Los webhooks de Kushki ONE **no documentan firma**. Los de la Raw API y los
  productos en línea se verifican con HMAC-SHA256 (`X-Kushki-Signature`).
- No hay datos de prueba publicados para Kushki ONE. Las preguntas abiertas
  para Kushki están al final de la sección 1.

## Contenido

1. Pagos con tarjeta presente (foco de DTEx®)
2. Base transversal: cuentas, ambientes, paso a producción, pruebas, errores, webhooks, glosario
3. Pagos en línea: mapa de productos y si aplican a DTEx®


---

## Pagos con tarjeta presente (Kushki Chile)

> Referencia técnica elaborada a partir de la documentación pública de Kushki para Chile (`docs.kushki.com/cl/card-present-payments*`) y de la página de webhooks de Cloud Terminal API, App to app y Terminal SDK. Todo lo que no aparece en esas páginas se indica de forma explícita como «no documentado». Las notas marcadas «Nota DTEx» son observaciones propias, no afirmaciones de Kushki.

### 1. Panorama de modos de integración

| Modo | Qué es | Quién controla la UI de cobro | Terminales | Estado en la documentación |
|---|---|---|---|---|
| **Kushki ONE Payment App (Standalone)** | App de cobro nativa de Kushki instalada en el SmartPOS. El operador ingresa el monto, la terminal lee la tarjeta y autoriza sin sistema externo. | Kushki (toda la experiencia: monto, propina, cuotas, tarjeta, comprobante). | Solo certificada en Sunmi P3 y Sunmi P2 SE. | Beta («Early Release»). |
| **Kushki ONE Connect (modo Semi-Integrado)** | API HTTP que permite que un sistema de caja envíe comandos (cobro, autorización, captura, anulación, impresión) a la Payment App. La app queda bloqueada en «Esperando llamada». Tres topologías: **Nube**, **Red Local** y **Localhost** (app propia en la misma terminal). | El POS decide qué cobrar; la Payment App de Kushki muestra las pantallas de lectura de tarjeta, PIN y firma. | Sunmi P3 y P2 SE. | Beta. Es la vía que Kushki describe para «App de caja propia instalada en la terminal». |
| **App to app** | Mencionada solo en el título de la página de webhooks y en la nota de que Localhost «reemplaza los flujos de integración app a app tradicionales». | No documentado. | No documentado. | Sin guía de integración (sin intents, sin parámetros) en los archivos revisados. |
| **Cloud Terminal API** | Mencionada solo en la página de webhooks compartida con App to app y Terminal SDK. | No documentado. | No documentado. | Solo hay definición de webhooks; los ejemplos usan datos de México (`cardCountry: "MX"`, resultado `rechazadaProsa`, marca `CARNET`). |
| **Terminal SDK** | Igual que la anterior: solo aparece en la página de webhooks. | No documentado. | No documentado. | Solo webhooks. |
| **Raw card-present API** | API REST para usar terminales propias sobre la red de Kushki. El comercio lee la tarjeta, cifra los datos con DUKPT y los envía desde su backend. | El comercio (toda la UI y el kernel EMV son propios). | Cualquier terminal con PCI PTS v6.0, EMV L1, EMV L2 y EMV Contactless L1. | Disponible solo para el modelo «Adquirente». Requiere HSM, ceremonia de llaves y certificación con marcas. |

**Recomendación para DTEx (app propia en el Sunmi P3).** De lo documentado, la vía natural es **Kushki ONE Connect por Localhost**: DTEx conserva su UI de venta y delega en la Payment App la lectura de la tarjeta, el PIN y la autorización, sin requerir red interna entre las apps. Raw card-present API daría control total de la UI, pero exige certificación PCI, HSM propio, ceremonia de llaves con *Security Officers*, kernel EMV y certificación ADVT/CDET (Visa) y M-TIP (Mastercard), lo que no se justifica si la terminal ya es la que Kushki certifica. App to app, Cloud Terminal API y Terminal SDK no tienen documentación de integración en Chile en estos archivos. Riesgo principal: Kushki ONE está en Beta y Kushki pide no usarlo en producción sin coordinarlo con su equipo de integraciones.

Fuentes: [Pagos con tarjeta presente](https://docs.kushki.com/cl/card-present-payments.md) · [Kushki ONE](https://docs.kushki.com/cl/card-present-payments/kushki-one.md) · [Kushki ONE App de Pagos](https://docs.kushki.com/cl/card-present-payments/kushki-one-payment-app.md) · [Raw card-present API](https://docs.kushki.com/cl/card-present-payments/raw-card-present-api.md) · [Acepta pagos con tarjeta presente](https://docs.kushki.com/cl/card-present-payments/accept-card-present-payments.md)

---

### 2. Kushki ONE Connect (semi-integrado: Nube, Red Local, Localhost)

#### 2.1 Topologías, URLs y red

Fuente: [Kushki ONE](https://docs.kushki.com/cl/card-present-payments/kushki-one.md) · [Pagos](https://docs.kushki.com/cl/card-present-payments/kushki-one/payments.md)

| Topología | Base URL | Uso |
|---|---|---|
| Red Local | `http://{TERMINAL_IP}:6868/terminal/v1` o `https://{TERMINAL_IP}:6869/terminal/v1` | Caja y terminal en la misma LAN; requiere IP fija o reserva DHCP. |
| Nube UAT | `https://uat-cloudt.kushkipagos.com/terminal/v1/{terminalSerial}` | Caja y terminal en redes distintas. |
| Nube producción | `https://cloudt.kushkipagos.com/terminal/v1/{terminalSerial}` | Ídem. |
| Localhost | No se publica una URL explícita; la guía solo dice que ambas apps «se comunican apuntando a localhost». | App propia en la misma terminal. |

- Forma general en Nube: `https://{host}/terminal/v1/{terminalSerial}/sync/{operación}`.
- El `terminalSerial` lo entrega Kushki durante el *onboarding*.
- Puertos locales de la terminal: TCP `6868` (HTTP) y `6869` (HTTPS).
- Salida a internet obligatoria (puerto 443), incluso en Localhost:

| Propósito | UAT | Producción |
|---|---|---|
| Relay de Nube | `uat-cloudt.kushkipagos.com` | `cloudt.kushkipagos.com` |
| Procesamiento de pagos | `api-uat.kushkipagos.com` | `api.kushkipagos.com` |
| Gestión de terminales (TMS) | `uat-tms.kushkipagos.com` | `tms.kushkipagos.com` |

- Diagnóstico sin mover dinero:
  - `GET /terminal/v1/sync/local/test` (Red Local) · `POST /terminal/v1/{terminalSerial}/sync/local/test` (Nube). Respuesta esperada: `200 { "success": true, "data": {} }`.
  - `GET /terminal/v1/sync/config/terminal_info` (Red Local) · `POST /terminal/v1/{terminalSerial}/sync/config/terminal_info` (Nube). Devuelve `{model, room, serialNumber}`; `room` es la versión de la app de la terminal.
- Timeouts de cliente recomendados: al menos 90 s en Nube y 15 s en Red Local.

> **Nota DTEx (medido en hardware, `kushki_one_local`):**
> - Localhost funciona en producción con `http://127.0.0.1:6868/terminal/v1/sync`. Android exige un `network_security_config` que permita HTTP en claro sólo para `127.0.0.1` y `localhost`.
> - 15 s en Red Local o Localhost es demasiado poco para `/sync/charge`. Kushki ONE puede retener un `/charge` unos 10 min (su paso interno `DEFERRED` espera un toque de pantalla) y aprobarlo después (P3, 15-10-2026).
> - La librería usa 90 s. Si se vencen, **no reenvía** el cobro: lanza `TransactionOutcomeUnknownException`, porque un reenvío hace que Kushki descarte su flujo y abra otro.
> - `/local/test` responde `IDLE` aunque Kushki esté ocupado con un cobro.

#### 2.2 Autenticación y cifrado

Fuente: [Autenticación y cifrado de requests](https://docs.kushki.com/cl/card-present-payments/kushki-one/authentication.md)

Mecanismo único (igual en las tres topologías): firma SHA-512 + payload cifrado con AES-CBC.

**Entradas:** `businessCode` (llave privada del comercio, entregada en el *onboarding*), `terminalSerial`, `timestamp` (Unix en **segundos**, UTC) y `requestData` (payload en texto plano).

> No confundir `Business-Code` con `private_credential_id`: este último es un campo de configuración de la terminal y nunca se usa para firmar.

**Derivación (resumen):**
1. `timestamp` único por request (se reutiliza en firma, cifrado y header).
2. `formattedDate` = `YYYY:MM:DD:HH:mm` en UTC (cambia cada minuto).
3. `password` = MD5 hex de `(businessCode + terminalSerial + formattedDate)` rellenado a la derecha con `0` hasta 32 caracteres.
4. `encodedKeyTimestamp` = Base64(`password` + `timestamp`); `dataWithKey` = `requestData` + campo `key` con ese valor (solo para firmar, nunca se envía).
5. Firma = SHA-512 hex de Base64(`JSON.stringify(dataWithKey)`).
6. `aesKey` = primeros 32 caracteres de `timestamp + "___" + password`; IV aleatorio de 16 bytes; AES-CBC con PKCS7 sobre `JSON.stringify(requestData)` (sin `key`). Resultado: `"<iv_hex>:<ciphertext_hex>"`.

**Request final:**

| Elemento | Valor |
|---|---|
| Header `Authorization` | `Basic <hash SHA-512>` |
| Header `timestamp` | Unix en segundos; tolerancia ±5 min respecto del servidor |
| Header `encrypted_http_communication` | `true` en **cada** request de Red Local y Localhost (UAT y producción). Nube no lo requiere |
| Header `Content-Type` | `application/json` (según el script de Postman) |
| Cuerpo POST/PATCH/PUT | `{"data": "<iv_hex>:<ciphertext_hex>"}` |
| GET | Query `?data=<iv_hex>:<ciphertext_hex>`, sin otros parámetros |

- Operaciones sin payload (por ejemplo `/abort`) firman el literal `{}`.
- Si se certifica sin `encrypted_http_communication: true`, todo falla en producción con `AUTH-001`.
- Toda firma inválida responde igual: `{"type":"AUTH","code":"AUTH-001","message":"Invalid or expired credentials"}`. Causas típicas: timestamp en milisegundos, reloj desfasado, fecha en hora local, cuerpo re-serializado tras firmar, campo `key` dentro del payload cifrado.
- No registrar el header `Authorization` completo en logs.

> **Nota DTEx (medido):**
> - `kushki_one_local` (v0.5.0 en adelante) firma y cifra así, pero **no envía** el header `encrypted_http_communication`. Igual cobra en producción por Localhost en los terminales que tienen el flag activo en el DMS.
> - El flag `encrypted_http_communication` y el `bussines_code` se configuran **por dispositivo** en el DMS.
> - Un terminal con el flag apagado acepta cualquier firma, incluso inventada; lo mismo ocurre en el backend UAT. Por eso "funciona en dev" no prueba nada sobre la autenticación.
> - Con el flag apagado, el agente responde `PAR-002` ("Invalid JSON payload… when HTTP encryption is disabled") a un body cifrado.
> - Pendiente medir si enviar el header resuelve ese `PAR-002` sin que Kushki active el flag. La decisión vigente es esperar a que Kushki lo active, no bajar a requests sin firma.

#### 2.3 Formato de montos

Fuente: [Formato de montos en Kushki ONE](https://docs.kushki.com/cl/card-present-payments/kushki-one/format-amount-kushki-one.md)

- Enteros en la unidad mínima de la moneda, sin separadores. **CLP tiene 0 decimales**: 15.990 CLP se envía como `15990`. Agregar `00` cobra 100 veces más.
- El objeto `amount` **no lleva moneda**: la terminal la toma de su configuración.
- Total cobrado = suma de los campos de `amount`:

| Campo | Descripción |
|---|---|
| `subtotal_iva` | Base afecta a IVA |
| `iva` | IVA de esa base |
| `subtotal_iva0` | Monto exento o total sin desglose |
| `extra_taxes` | `airport_tax`, `iac`, `ice`, `travel_agency` (enviar `0` si no aplican) |
| `tip` | Propina (en `/charge` y `/authorization`; en `/pos_tip` es el monto de la operación) |

- El `operation.amount` que llega en el webhook no es una copia del request (omite campos en cero y agrega `currency` y `tip`); no reutilizarlo para armar requests.

#### 2.4 Operaciones y endpoints

Fuente: [Realiza cobros con Kushki One](https://docs.kushki.com/cl/card-present-payments/kushki-one/payments.md)

Cada operación existe con prefijo `/sync/` (resultado en la respuesta HTTP) o `/async/` (acuse `TERMINAL_ACKNOWLEDGED` inmediato; resultado solo por webhook).

| Operación | Ruta | Sync | Async | Descripción |
|---|---|:-:|:-:|---|
| Venta | `/charge` | ✅ | ✅ | Autoriza y captura en un paso |
| Autorización | `/authorization` | ✅ | ✅ | Reserva fondos |
| Captura | `/capture` | ✅ | ✅ | Cobra una autorización |
| Reautorización | `/re_authorization` | ✅ | ✅ | Amplía monto o vigencia |
| Propina posterior | `/pos_tip` | ✅ | ✅ | Agrega propina a una transacción autorizada |
| Reversa | `/void` | ✅ | ✅ | Anulación el mismo día; devolución pasado el corte |
| Cancelar | `/abort` | ✅ | ✅ (solo Red Local) | Cancela una operación en curso. GET en Red Local; POST y solo síncrono en Nube |
| Consulta en línea | `/transaction_search_online` | ✅ | — | Historial en el adquirente |
| Consulta local | `/transaction_search_local` | ✅ | — | Historial guardado en la terminal |

Todas las rutas de pago usan POST salvo `/abort` en Red Local (GET). Ejemplo: `POST {BASE_URL}/sync/charge`.

**Campos del request (texto plano antes de cifrar):**

| Campo | Obligatorio | Aplica a | Descripción |
|---|:-:|---|---|
| `amount` | Sí | Operaciones con dinero | Ver 2.3 |
| `client_transaction_id` | Sí | Todas | UUID v4 generado por el POS; clave de idempotencia. Reutilizar solo al reintentar la misma operación |
| `transaction_reference` | Sí en captura, reautorización, propina posterior y reversa | Operaciones sobre una transacción previa | UUID devuelto por Kushki en la transacción original |
| `events_webhook_url` | Solo async | Endpoints `/async/` | URL HTTPS pública para eventos |
| `cashback_amount` | No | `/charge` | Retiro de efectivo; `0` si no aplica |
| `deferred` | No | `/charge` | Chile: `months` y, para cuotas comercio, `credit_type: "03"` (string). Máximo 12 con `credit_type`, 48 sin él. `query_deferred` es solo para México |
| `omit_card` | No | `/capture`, `/re_authorization`, `/void` | `true` ejecuta sin pedir la tarjeta |
| `metadata` | No | `/charge`, `/authorization`, `/pos_tip` | `reference`, `customer_email`, `device` |

Si una capacidad no está habilitada en la terminal, el campo se ignora sin error (un `200` no garantiza que la propina se aplicó). Según la propia documentación, en Beta solo `/charge` se probó de punta a punta con estos campos.

> **Nota DTEx (medido; contradice el párrafo anterior):** el campo **no** se ignora.
> - `tip` en un terminal sin propina habilitada: el cobro se rechaza **incluso con `tip: 0`**, con `CONF-4001: Tip is not enabled in terminal configuration` (producción, 14-11-2026).
> - `tip` ausente en un terminal **con** propina en el DMS: Kushki pregunta su propia propina y autoriza de más (P3: 100 → 105).
> - Por eso `kushki_one_local` ≥ 0.7.0 envía `tip` sólo si la app lo pide.
> - `cashback_amount > 0` sin vuelto habilitado devuelve `CONF-4002`, antes de leer la tarjeta. Con `0` el cobro no cambia.

**Respuesta síncrona:** la guía solo muestra `approved` (booleano) y `rawResponse.transaction_reference`. El esquema completo de la respuesta síncrona **no está documentado** en estos archivos (remite a `api-docs.kushkipagos.com`). Por analogía, el evento `APPROVAL` del webhook trae en `raw_response`: `transaction_reference`, `ticket_number`, `transaction_status`, `transaction_type`, `authorized_amount`, `kushki_response {code, message}`, `franchise`, `card_type`, `cvm_type`, `card_data {bank, brand, country, type}` y `message_fields` (`F38`, `F39`, `F55`).

> **Nota DTEx (forma medida de la respuesta síncrona de `/charge` en Localhost):**
> - Raíz en camelCase: `approved`, `responseCode`, `authCode`, `message`, `rawResponse`, `cardData` y `timestamp` (ms).
> - `rawResponse` en snake_case: `transaction_reference`, `authorized_amount`, `franchise`, `card_type`, `cvm_type`, `transaction_status`, `transaction_type`, `ticket_number`, `F11` y `kushki_response {code, message}`.
> - `cardData` trae `pan` enmascarado, `entryMode`, `bin` y `aid`, y la respuesta puede traer `F55`: **no persistir ni registrar datos de tarjeta**.
> - Valores de `card_type` vistos en hardware: sólo `debit`.

**Respuesta asíncrona inmediata:** `event_id`, `previous_status: ""`, `occurred_at`, `status: "TERMINAL_ACKNOWLEDGED"`, `merchant_id`, `client_transaction_id`, `terminal` (camelCase: `serialNumber`, `model`, `wifiMac`, `room`, `terminal_id`) y `operation` (eco del request; `type` ∈ `charge`, `pre-auth`, `re-auth`, `capture`). Errores posibles de la llamada: `400`, `401`, `409`, `422`, `500`.

**Estado HTTP:** en los endpoints de pago Kushki indica que el status es **siempre `200`** y que el resultado se evalúa en el cuerpo (excepción: impresión). Ver la contradicción en la pregunta 8 de la sección 8.

#### 2.5 Anulaciones y devoluciones

Fuentes: [Pagos](https://docs.kushki.com/cl/card-present-payments/kushki-one/payments.md) · [Servicios asíncronos y webhooks](https://docs.kushki.com/cl/card-present-payments/kushki-one/async-services-webhooks.md)

- Un solo endpoint, `/void`, con el `transaction_reference` del cobro. Corte a las **23:59 hora local**: antes es anulación (el cargo no se ve); después pasa a devolución (días hábiles).
- Esperar **al menos 1 minuto** tras la transacción original antes de reversarla.
- La búsqueda de transacciones indica el resultado: `VOID` (mismo día), `REFUND` (después del corte) o `REVERSE` (generado por la plataforma ante un corte de comunicación, sin que el POS lo pida).
- En webhook, una anulación llega con `operation.type: "CHARGE"` y `operation.transaction_mode: "Void"`; `operation.transaction_reference` es la del cobro anulado y `raw_response.transaction_reference` la nueva de la anulación. Con `omit_card: true` se reciben tres eventos (sin `CARD_PRESENTED`).
- Una vez en `APPROVAL_REQUESTED` ya no se puede usar `abort`: hay que esperar el resultado y luego anular.
- La guía de la API no menciona devoluciones parciales por `/void`; la Payment App sí permite devolución parcial desde la pantalla (ver 3).

> **Nota DTEx:**
> - La guía actual no lista ninguna ruta `/refund`: `/void` decide sola entre anulación y devolución. `kushki_one_local` en cambio llama a `/refund` (ruta del OpenAPI v1.2.0) pasado el corte **y también antes de cumplirse 1 minuto**.
> - Medido en P3 (15-10-2026): `/abort` sin transacción activa responde `200` con cuerpo vacío, no `409`. Con Kushki detenido en `DEFERRED` sólo cancela el lector (`TER-004`) y el cobro sigue abierto.

#### 2.6 Preautorización y captura

Fuente: [Pagos](https://docs.kushki.com/cl/card-present-payments/kushki-one/payments.md)

- Flujo: `POST /sync/authorization` → guardar `transaction_reference` → (opcional) `/re_authorization` → `POST /sync/capture` con esa referencia.
- `/re_authorization` con `subtotal_iva0: 0` extiende solo la vigencia. Una reautorización cancelada impide nuevas reautorizaciones.
- Vigencia: débito 7 días, crédito 28 días (Visa/Mastercard).
- Captura hasta el **110 %** de autorización + reautorizaciones no canceladas; **una sola captura** por ciclo.
- `omit_card: true` permite capturar o reautorizar sin la tarjeta presente.

#### 2.7 Pago dividido

Fuente: [Kushki ONE](https://docs.kushki.com/cl/card-present-payments/kushki-one.md)

- «Divide la cuenta» **no tiene endpoint**: solo existe en modo Standalone dentro de la Payment App. Con la API, DTEx tendría que encadenar varios `/charge` independientes (inferencia; no está documentado como flujo).
- No es el *Split Payment* de comercio electrónico (reparto entre varios comercios).

#### 2.8 Impresión (Print API)

Fuente: [Impresión en terminal SmartPOS](https://docs.kushki.com/cl/card-present-payments/kushki-one/printing.md)

| Topología | Encolar | Consultar estado |
|---|---|---|
| Red Local | `POST /terminal/v1/print` | `GET /terminal/v1/print_job` (el `print_job_id` va dentro del payload cifrado en `data`) |
| Nube | `POST /terminal/v1/{terminalSerial}/sync/print` | `POST /terminal/v1/{terminalSerial}/sync/print_job` con `{"print_job_id": "..."}` en el cuerpo |

Misma autenticación y cifrado que los pagos.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|:-:|---|
| `commands` | arreglo | Sí | Comandos ordenados |
| `printJobId` | texto | No | Clave de idempotencia (si falta, se genera un UUID) |
| `externalReference` | texto | No | Referencia libre |
| `webhookUrl` | texto | No | URL para el resultado final |
| `skipIfBusy` | booleano | No | `true` devuelve `409` si la cola está ocupada (por defecto `false`) |

- Tipos de comando (`type` obligatorio): `text`, `columns`, `divider` (`SOLID`, `DOTTED`, `EMPTY`), `feed`, `space`, `cut`, `image` (Base64 sin prefijo `data:`; `algorithm: BINARIZATION` para logos), `qr`, `barcode` (CODE128). Enumerados en mayúsculas.
- Respuestas: `202` (encolado, `status: PENDING`), `400` (payload inválido), `404` (job inexistente), `409` (cola ocupada; `TER-004`).
- Estados: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`. El webhook solo notifica `COMPLETED` y `FAILED`, **sin reintentos** (si no hay `2xx` en 5 s se pierde). Sondeo recomendado: cada 2 a 3 s.
- Errores de hardware (`type: TERMINAL-PRINTER`): `OUT_OF_PAPER`, `COVER_OPEN`, `COVER_INCOMPLETE`, `PAPER_JAM`, `PRINTER_HOT`, `MOTOR_HOT`, `CUTTER_ERROR`, `OFFLINE`, `UNKNOWN_ERROR`.

#### 2.9 Consulta de transacciones

Fuente: [Pagos](https://docs.kushki.com/cl/card-present-payments/kushki-one/payments.md) · [Catálogo de errores](https://docs.kushki.com/cl/card-present-payments/kushki-one/error-catalog-kushkione.md)

- `/transaction_search_online` (adquirente) y `/transaction_search_local` (terminal), solo síncronas. Sirven para conciliar cuando se pierde un webhook o la conexión.
- Los parámetros de búsqueda **no están documentados** en la guía. Los códigos de validación 2016–2021 sugieren `page` (> 0), `size` (> 0, máx. 500), `start_date` y `end_date` (no negativos, `start_date` < `end_date`).

---

### 3. Kushki ONE Payment App (Standalone)

Fuentes: [Descripción general](https://docs.kushki.com/cl/card-present-payments/kushki-one-payment-app.md) · [Procesa un cobro](https://docs.kushki.com/cl/card-present-payments/kushki-one-payment-app/make-a-charge.md) · [Devoluciones y PreAuth & Capture](https://docs.kushki.com/cl/card-present-payments/kushki-one-payment-app/refunds.md) · [Pago Dividido](https://docs.kushki.com/cl/card-present-payments/kushki-one-payment-app/split-payment.md) · [Configuración del terminal](https://docs.kushki.com/cl/card-present-payments/kushki-one-payment-app/terminal-setup.md) · [Consulta tus transacciones](https://docs.kushki.com/cl/card-present-payments/kushki-one-payment-app/transaction-search.md)

No es una integración programática: no tiene autenticación, endpoints ni campos. Es relevante para DTEx porque es la app que atiende las llamadas de Kushki ONE Connect y define las reglas de negocio visibles.

- **Operaciones (pestaña INICIO):** Venta, Devolución (total o parcial, con motivo), Autorización, Capturar Pago (Cancelar / Re-Auth / Capturar) y Pago Dividido.
- **Flujo de venta:** monto → propina (si está habilitada) → cuotas (si está habilitado y supera un umbral) → tarjeta (NFC, chip, banda) → firma (condicional) → resultado. La pantalla de espera de tarjeta aún aparece en inglés («Ready when you are», «Cancel Sale») y sin separador de miles.
- **Comprobante:** cada aprobación genera un **Ticket #** de 18 dígitos y comprobante imprimible (copia cliente/comercio). Se puede enviar por correo. Los rechazos quedan en la lista sin Ticket #.
- **Devolución:** antes de las 23:59 es anulación; después, reembolso en días hábiles. En ambos casos la app muestra «Aprobado». El detalle rotula el monto devuelto como «Anulado».
- **Preautorización:** referencia opcional de hasta 18 caracteres; vigencia 7 días (débito) y 28 días (crédito); captura de hasta +10 % y una sola por ciclo. El comprobante de la captura es el documento definitivo.
- **Pago dividido:** solo «División Igualitaria» (la personalizada no está disponible); cada pago es una transacción independiente con su Ticket #, propina y cuotas; un rechazo no revierte los pagos aprobados; las devoluciones son por pago.
- **Configuración en dos niveles:** Kushki habilita la funcionalidad y sus límites; el administrador del comercio la ajusta en la terminal (devoluciones con o sin supervisor, usuarios con PIN, idioma ES/EN/PT, recibos y copias, propinas por porcentaje o monto fijo con tres valores rápidos).
- **Consulta:** Lista de Ventas (filtros por estado, fecha, hora, empleado, tipo y marca de tarjeta, monto) y Resumen de Ventas (Ventas, Capturado, Autorizado, Propinas, Devoluciones), imprimible o enviable por correo.

---

### 4. App to app, Cloud Terminal API y Terminal SDK

Fuente: [Webhooks — Cloud Terminal API, App to app y Terminal SDK](https://docs.kushki.com/webhooks-cloud-terminal-api-app-to-app-y-terminal-sdk-2498954m0.md) (esta página no cuelga de `/cl/`).

- **No hay documentación de integración** en los archivos revisados: ni autenticación, ni endpoints, ni intents de Android, ni formato de montos, ni operaciones. Solo existe el esquema de webhooks (sección 6.3).
- Los ejemplos de esa página corresponden a México (montos con decimales como texto, `cardCountry: "MX"`, `rechazadaProsa`, `CARNET`). No queda claro si estos modos están disponibles en Chile.

---

### 5. Raw card-present API

#### 5.1 Requisitos, ambientes y autenticación

Fuentes: [Raw card-present API](https://docs.kushki.com/cl/card-present-payments/raw-card-present-api.md) · [Intercambio de claves](https://docs.kushki.com/cl/card-present-payments/raw-card-present-api/key-exchange.md) · [Script de cifrado](https://docs.kushki.com/cl/card-present-payments/raw-card-present-api/sample-script-to-encrypt-information.md)

- Solo para el modelo **Adquirente**. Requisitos: afiliación, cuenta de pruebas, terminales con PCI PTS v6.0, EMV L1/L2 y EMV Contactless L1, llaves pública y privada, NDA del servicio HSM, *Security Officers* registrados y un HSM propio.
- Certificación con marcas: Visa (ADVT y CDET) y Mastercard (M-TIP) ante integración nueva, nuevo modelo o firmware, o cambios en el kernel EMV. Solo se certifican los escenarios que se operarán.

| Ambiente | URL base |
|---|---|
| `dev` | `https://api-uat.kushkipagos.com` |
| Certificación con marcas | `https://api-qa-acq.orizaba.kushki.dev` |
| `live` | `https://api.kushkipagos.com` |

- **Cifrado de datos de tarjeta:** DUKPT con dos BDK (una para datos y otra para PIN), entregadas cifradas bajo una KEK en formato TR-31. La KEK llega por medios electrónicos en UAT (1 día hábil) y en sobres físicos a dos o más *Security Officers* en producción (unas 2 semanas); las BDK, en 1 día hábil. En pruebas sin HSM se pueden pedir BDK de prueba y cifrar con la herramienta `cardtool` (no compatible con Mac con chip M).
- **Credenciales:** `Merchant_id`, `Private-Credential-Id` (llave privada) y `Public-Credential-Id` (llave pública), visibles en la consola (Desarrolladores → Credenciales).
- **Headers de autenticación:** la guía solo indica el header `Private-Credential-Id` para la búsqueda de transacciones. Los headers exactos de cobro, anulación y reembolso **no aparecen** en estos archivos (se remite a `api-docs.kushkipagos.com`).

#### 5.2 Endpoints y operaciones

Fuentes: [Acepta pagos](https://docs.kushki.com/cl/card-present-payments/raw-card-present-api/take-payments.md) · [Anula un pago](https://docs.kushki.com/cl/card-present-payments/transactions/cancel-payments.md) · [Transacciones](https://docs.kushki.com/cl/card-present-payments/transactions/transactions.md) · [Preguntas frecuentes](https://docs.kushki.com/cl/card-present-payments/raw-card-present-api/faq.md)

| Operación | Endpoint (documentado) | `transaction_mode` | `transaction_type` | Extra |
|---|---|---|---|---|
| Venta | «Single payment» (ruta no explícita; las anulaciones y reversos usan `POST /pos/v1/transaction`) | `Authorization` | `charge` | — |
| Cashback | Ídem | `Authorization` | `charge` | `is_cashback: true`, `cashback_amount`; no con `NFC`; solo tarjetas locales |
| Propina previa | Ídem | `Authorization` | `charge` | `amount.tip` (no incluida en los subtotales) |
| Cuotas | Ídem | `Authorization` | `charge` | `is_deferred: true`, `deferred.months`; cuotas comercio 2–12 con `credit_type: "03"` (Beta); cuotas emisor 2–48 |
| Preautorización | «Authorization and capture» (ruta no explícita) | `Authorization` | `preAuth` | — |
| Reautorización | Ídem | `Authorization` | `reAuthorization` | Monto `0` extiende el plazo |
| Captura | Ídem | `Authorization` | `capture` | `transaction_reference` de la preautorización; monto igual o menor que el autorizado |
| Reverso | `POST /pos/v1/transaction` | `Reverse` | `charge` | `client_transaction_id` de la original; siempre por el total; mismo día antes de las 23:59 (Chile); esperar ≥ 1 min; admite `omit_card` |
| Anulación | `POST /pos/v1/transaction` | `Void` | `charge` | `transaction_reference`; parcial enviando `amount`; mismo día; 3 intentos con el procesador; admite `omit_card` |
| Reembolso | `POST /pos/v1/refund` | `Authorization` | `refund` | `transaction_reference`; parcial con `amount`; hasta 120 días; procesamiento hasta 7 días hábiles |
| Búsqueda | «Transaction Search» (ruta no explícita) | — | — | Header `Private-Credential-Id`; cuerpo con `page`, `size` (máx. 500), `filters` |

**Campos obligatorios del request de cobro:**

| Campo | Tipo | Notas |
|---|---|---|
| `amount.currency` | String | `CLP` en Chile |
| `amount.iva`, `amount.subtotal_iva`, `amount.subtotal_iva0` | Number | Opcionales: `tip`, `extra_taxes.*` |
| `card_details.reading_type` | String | `ICC`, `MCR`, `NFC` |
| `card_details.tracks` / `tracks.track_ksn` | Object / String | `enc_track2` obligatorio en ICC, MCR y NFC; `enc_track1` en MCR; `enc_tlv` en chip; `pin_block` + `pin_ksn` si hay PIN |
| `client_transaction_id` | String | UUID v4 |
| `country` | String | ISO 3166-1 alfa-3 (`CHL`) |
| `pos_details` / `pos_details.brand` | Object / String | Opcionales: `model`, `version`, `terminal_id`, `has_print`, `location` |
| `contact_details` / `contact_details.document_type` | Object / String | — |
| `transaction_mode` | String | `Authorization`, `Reverse`, `Void` |
| `transaction_type` | String | `capture`, `charge`, `preAuth`, `reAuthorization`, `tip`, `refund` |
| `cvm_type` | String | `none`, `pin`, `signature` |

Opcionales relevantes: `omit_card` (solo Chile), `metadata`, `merchant_id`, `sub_merchant.*`.

**Respuesta exitosa:** `transaction_status` (`APPROVAL`), `transaction_reference`, `transaction_type`, `authorized_amount`, `franchise`, `cvm_type`, `kushki_response {code, message}`, `message_fields` (`F38`, `F39`), `F11`, `additional_amounts`.
**Respuesta de error:** `{ "code": "E001", "details": { "Origin", "Message" }, "message" }`.

**Formato de montos:** el FAQ indica `subtotal_iva` como neto sin propina y `tip` aparte. En CLP los ejemplos usan enteros, pero la documentación no aclara formalmente los decimales para esta API.

**Búsqueda de transacciones:** filtros `bin`, `client_transaction_id`, `start_date`, `end_date` (epoch en ms en el ejemplo), `last_four_digits`, `transaction_reference`, `transaction_type` (`capture`, `charge`, `checkIn`, `checkout`, `preAuth`, `reAuthorization`, `tip`, `posTip`). Máximo 10.000 resultados por solicitud.

**Impresión y pago dividido:** no aplican; con esta API la terminal y su impresora son responsabilidad del comercio.

---

### 6. Webhooks

#### 6.1 Kushki ONE Connect (modo asíncrono)

Fuente: [Servicios asíncronos y webhooks](https://docs.kushki.com/cl/card-present-payments/kushki-one/async-services-webhooks.md)

- Se activa enviando `events_webhook_url` en el cuerpo de una operación `/async/` (endpoint HTTPS público que acepte POST). Las operaciones síncronas no emiten eventos.
- **Estados:** `TERMINAL_ACKNOWLEDGED` → `CARD_PRESENTED` (puede repetirse) → `APPROVAL_REQUESTED` → `APPROVAL` | `DECLINED`; o `TERMINAL_CANCELED` / `TERMINAL_REJECTED`. Son finales `APPROVAL`, `DECLINED`, `TERMINAL_REJECTED` y `TERMINAL_CANCELED`.
- **Payload (snake_case):** `event_id`, `occurred_at`, `status`, `merchant_id`, `client_transaction_id`, `terminal {serial_number, brand, model}`; desde el 2.º evento, `previous_status`; desde `CARD_PRESENTED`, `reading_type` (`CHIP`, `CONTACTLESS`, `MAGNETIC_STRIPE`). En el evento final: `operation` (`type`: `CHARGE`, `PREAUTH`, `REAUTHORIZATION`, `CAPTURE`; `transaction_mode`; `amount`; banderas), `failure_reason {type, code, message}` en `TERMINAL_REJECTED`/`DECLINED` y `raw_response` en `APPROVAL`/`DECLINED`. No incluye PAN ni nombre del tarjetahabiente.
- **Persistir** `raw_response.transaction_reference` y `raw_response.ticket_number` del evento `APPROVAL`.
- **Reintentos:** reintenta ante timeout, conexión cerrada, fallo de DNS o `408`, `429`, `500`, `502`, `503`, `504`. No reintenta ante `400`, `401`, `403`, `404`, `409`, `422`. Espera = `min(60 s, 2 s × 2^intento) + aleatorio(0..2 s)`; se detiene tras 10 intentos o 15 minutos. Sin conexión, la terminal encola los eventos y los reenvía en orden.
- **Consumidor:** deduplicar por `event_id`, correlacionar por `client_transaction_id`, detectar huecos con `previous_status`, responder `2xx` de inmediato y procesar después.
- **Firma/verificación:** **no documentada** para estos eventos.
- Duraciones observadas en certificación: ciclo aprobado de 8 a 33 s; rechazo 11 s; cancelación 2,5 s.

#### 6.2 Raw card-present API

Fuente: [Webhooks para tarjeta presente](https://docs.kushki.com/cl/card-present-payments/webhooks.md)

- **Eventos:** transacciones aprobadas, rechazadas, autorizaciones, captura de fondos, anulaciones, reversos y consulta de saldo.
- **Campos principales:** `transaction_reference`, `client_transaction_id`, `transaction_id`, `transaction_type` (p. ej. `SALE`, `PREAUTH`, `CAPTURE`, `REFUND`), `transaction_status`, `response_code`, `processor {code, message}`, `approved_transaction_amount`, `request_amount`, `amount {currency, subtotal_iva0, extra_taxes}`, `authorization_code`/`approval_code`, `ticket_number`, `masked_credit_card`, `last_four_digits`, `bin_card`, `card_type`, `payment_brand`/`franchise`, `card_details.reading_type`, `pos_details.*`, `deferred.months`, `created` (epoch ms) y `rules_response.*`.
- **Firma:** headers `X-Kushki-Key` (ID del comercio), `X-Kushki-Id` (timestamp Unix), `X-Kushki-Signature` (HMAC-SHA256 hex de `body + "." + X-Kushki-Id`) y `X-Kushki-SimpleSignature` (HMAC-SHA256 hex solo de `X-Kushki-Id`). La clave es la *Webhook signature* de la consola (Desarrolladores → Webhooks). IP de origen: UAT `54.208.105.247`; producción `34.230.185.20`.
- **Reintentos:** primer envío inmediato («Notify Now»); éxito con `200`/`201`. Si falla, 3 reintentos en la primera hora (min 20, 40, 60) y 4 en las 2 horas siguientes (cada 30 min); 7 reintentos en total en unas 3 horas. Después se marca como fallido.

#### 6.3 Cloud Terminal API, App to app y Terminal SDK

Fuente: [Webhooks — Cloud Terminal API, App to app y Terminal SDK](https://docs.kushki.com/webhooks-cloud-terminal-api-app-to-app-y-terminal-sdk-2498954m0.md)

- **Eventos:** aprobadas (`result: "aprobada"`), rechazadas (`result: "rechazadaProsa"`) y anulaciones (`aprobada`, `rechazadaRiesgo`, `rechazadaProsa`, `rechazada`, `pendiente`; con `transactionType: "devolucion"` y `transactionRefundedId`).
- **Campos (camelCase):** `result`, `amount` (String), `tip`, `payments`, `authorizationTime`, `reference`, `transactionid`, `authorization`, `creditcard`, `cardtype`, `arqc`, `userID`, `aid`, `applabel`, `url`, `email`, `phone`, `cardBrand`, `cardIssuer`, `cardCountry`, `cardClass`, `launchTime`, `maskedPAN`, `uniqueReference`.
- Firma, reintentos y configuración: **no documentados**.

---

### 7. Datos de prueba y códigos de error

#### 7.1 Datos de prueba

Fuente: [Datos de prueba](https://docs.kushki.com/cl/card-present-payments/test-data.md)

Solo existen para Raw card-present API (ambiente `dev`), por monto:

| Monto | Código | Resultado |
|---|---|---|
| 1000 | 01 | Rechazada: contactar al emisor |
| 3000 | 03 | Comercio inválido |
| 4000 | 04 | Tarjeta reportada |
| 5000 | 05 | Error al procesar |
| 7400 | 00 | Aprobada con demora |
| 17400 | 00 | Aprobada con demora (aplica a anulaciones) |
| Otro | — | Aprobada |

Para Kushki ONE **no hay datos de prueba publicados**; las terminales de prueba se piden a Kushki y pueden quedar inhabilitadas para cobros reales ([Acepta pagos con tarjeta presente](https://docs.kushki.com/cl/card-present-payments/accept-card-present-payments.md)).

#### 7.2 Errores de Kushki ONE Connect

Fuente: [Catálogo unificado de errores](https://docs.kushki.com/cl/card-present-payments/kushki-one/error-catalog-kushkione.md)

Envoltura HTTP: `{type, code, param?, message, object?}` (`object` con `client_transaction_id`, `terminal_id`, `serial_number`). En webhooks: `failure_reason {type, code, message}`.

| `type` | Códigos más relevantes | Acción |
|---|---|---|
| `PARAMETER` | `PAR-001` (requerido), `PAR-002` (tipo), `PAR-003` (formato), `BAD_FORMAT`; validadores `2002`–`2009` (montos negativos), `2010`/`2011` y `2014`/`2015` (UUID de `client_transaction_id` / `transaction_reference`), `2016`–`2021` (paginación y fechas) | Corregir el payload; `param` indica el campo |
| `TERMINAL` | `TER-001` (no vinculada), `TER-002` (no responde), `TER-003` (ocupada con una transacción), `TER-004` (impresora ocupada **o** cancelación del tarjetahabiente, según el endpoint), `TER-005` (modo incompatible), `TER-006` (operación no habilitada) | Reintentar solo `TER-003` y `TER-004` de impresión |
| `AUTH` | `AUTH-001` (firma inválida o vencida), `AUTH-002` (sin permisos) | Ver 2.2 |
| `NOT_FOUND` / `INTERNAL` | `NF-001`, `INT-001`, `MQTT_REQUEST_FAILED` (relay de Nube sin alcance a la terminal) | Escalar a soporte |
| `ACQUIRER` | Código nativo sin prefijo (p. ej. `E020`); conserva el status HTTP original | Mostrar el mensaje y registrar el código |
| `CONFIGURATION` | `CONF-4001` (propina), `CONF-4002`/`CONF-4003` (cashback), `CONF-4006` (límite de monto), `CONF-4007` (aprovisionamiento) | No reintentar; solicitar a soporte@kushkipagos.com |
| `TERMINAL-SUNMI` | `MAN-30005` (timeout de tarjeta o PIN) | Tratar como cancelación esperada |
| `TERMINAL-PRINTER` | Ver 2.8 | Mostrar al operador |

> **Nota DTEx (medido):**
> - **`TER-003`**: un P3 en terreno quedó trabado (23-11-2026) y reintentar no lo destrabó. El mensaje incluye el `client_transaction_id` del cobro que ocupa el terminal; hay que verificar ese cobro antes de cobrar otra vez.
> - **`MAN-50024`** (`type: MANUFACTURER`, no catalogado): el host **aprobó** (000), el kernel Sunmi falló después y el agente agendó un reverso en background. No equivale a un rechazo: reintentar con un UUID nuevo arriesga un doble cobro.
> - `kushki_one_local` no reconoce los types `TERMINAL`, `NOT_FOUND` ni `MANUFACTURER`, y los entrega como `InternalException` conservando el `code`.

#### 7.3 Errores de Raw card-present API

Fuente: [Códigos de error](https://docs.kushki.com/cl/card-present-payments/raw-card-present-api/error-codes.md)

- **Pre-procesamiento Kushki (`E0xx`):** `E001` (cuerpo inválido), `E006`/`E015` (transacción original no encontrada o no aprobada), `E014` (reautorización inválida), `E016` (reembolso no disponible: mínimo 1 día, máximo según país), `E017`/`E023` (anulación por sobre el monto), `E018`/`E044` (tipo no anulable; las reautorizaciones no se anulan directamente), `E020` (captura vencida), `E024` (datos de lectura inválidos), `E041` (operación no permitida, p. ej. captura sobre el porcentaje permitido o void parcial de preautorización), `E042`/`E055` (moneda distinta o no local), `E046` (reverso manual pasados 29 s), `E047` (timeout del procesador), `E048` (ya reversada), `E049` (no apta para cashback), `E322` (regla de seguridad).
- **Respuesta del emisor (`kushki_response.code`, ISO 8583):** `00`/`000` aprobada; los más frecuentes son `01`, `05`, `12`, `13`, `14`, `41`, `43`, `51`, `54`, `55`, `57`, `61`, `91` y `96`; `006` = marca no soportada por Kushki. La página trae el catálogo completo de Visa y Mastercard.
- **HTTP:** 200, 400, 401, 403, 404, 409, 410, 412, 429, 430, 500, 502, 503, 504.

---

### 8. Preguntas abiertas para Kushki

**Modo de integración y alcance**
1. ¿App to app, Cloud Terminal API y Terminal SDK están disponibles en Chile? Si es así, ¿dónde está su documentación (intents, parámetros, autenticación)? Los webhooks publicados parecen de México.
2. ¿Kushki ONE Connect por Localhost es la vía recomendada para una app propia (DTEx) en el Sunmi P3? ¿Qué fecha y condiciones hay para salir de Beta y operar en producción?
3. ¿Cuál es la URL y el puerto exactos para Localhost (¿`http://127.0.0.1:6868/terminal/v1`?), y debe usarse HTTP (6868) o HTTPS (6869)? Si es HTTPS, ¿qué certificado presenta la terminal? (Nota DTEx: en Android, HTTP en claro hacia localhost exige configurar `network_security_config`.)
4. ¿Cómo se lleva la Payment App a modo Semi-Integrado y cómo convive con la UI de DTEx (quién queda en primer plano durante el cobro y cómo vuelve el control a DTEx)?
   - *Nota DTEx (sobre la 3): respondida en la práctica. Se usa `http://127.0.0.1:6868` y funciona en producción.*
   - *Nota DTEx (sobre la 4): Kushki queda en primer plano. Para que DTEx vuelva sola, Android 10+ exige que DTEx tenga concedido "Mostrar sobre otras apps" (`SYSTEM_ALERT_WINDOW`); medido el 26-10-2026.*
5. ¿El `Business-Code` es uno por comercio o por terminal? ¿Cómo se entrega y rota de forma segura si DTEx atiende a muchos comercios? ¿Es seguro guardarlo dentro de la app en la terminal?

**Contrato de la API**
6. Esquema completo de la respuesta síncrona de `/charge`, `/authorization`, `/capture`, `/re_authorization`, `/pos_tip`, `/void`, `/abort` y de ambas búsquedas (la guía solo muestra `approved` y `rawResponse.transaction_reference`, en camelCase, mientras el webhook usa `raw_response`).
7. Parámetros de `/transaction_search_online` y `/transaction_search_local` (filtros, paginación, formato de fechas).
8. Contradicción de status HTTP: se afirma que los endpoints de pago responden siempre `200`, pero los errores `ACQUIRER` conservan el status original (p. ej. `400`), la llamada asíncrona documenta `400/401/409/422/500` y `/abort` devuelve `409`. ¿Cuál es el comportamiento real?
9. ¿`/void` admite anulación o devolución parcial (campo `amount`)? La Payment App permite devoluciones parciales; la guía de la API no lo menciona.
10. Para un comercio DTEx con varios cajeros o ventas divididas, ¿existe algo equivalente a «Divide la cuenta» por API o hay que encadenar `/charge`?
11. ¿Se pueden recibir webhooks (`events_webhook_url`) en una URL local de la propia terminal, o deben ir a un backend HTTPS público?

**Seguridad de webhooks**
12. Los eventos de Kushki ONE no documentan firma, headers de verificación ni IP de origen. ¿Cómo se verifica su autenticidad? ¿Aplican `X-Kushki-Signature` y las IPs de Raw card-present API?
13. Para los webhooks de Cloud Terminal API, App to app y Terminal SDK: ¿firma, reintentos y forma de configurar la URL?

**Operación y certificación**
14. ¿Hay montos o tarjetas de prueba para Kushki ONE en UAT (equivalentes a la tabla de Raw)? ¿Qué casos componen la certificación de DTEx?
15. ¿La impresión debe hacerse por la Print API de Kushki ONE o DTEx puede usar directamente la impresora del Sunmi (SDK del fabricante) sin conflicto con la Payment App? ¿La Payment App imprime su propio comprobante en modo Semi-Integrado?
16. Catálogo completo de códigos `MAN-` (Sunmi) y tiempo de espera de tarjeta/PIN de la terminal (la guía dice que no hay un valor publicado).
17. Para el Sunmi P3 de DTEx que hoy usa otra red: ¿la Payment App de Kushki puede convivir con apps de otros adquirentes en la misma terminal, y la terminal de prueba sirve después para producción?

**Inconsistencias de la documentación Raw (por si se evaluara esa vía)**
18. Headers exactos de autenticación para cobro, anulación y reembolso (solo se documenta `Private-Credential-Id` en la búsqueda) y rutas exactas de «Single payment», «Authorization and capture» y «Transaction Search».
19. Los ejemplos usan `country: "CLP"` o `"MEX"` con moneda CLP, aunque el campo exige ISO alfa-3 (`CHL`). El FAQ muestra `subtotal_iva: 119000` (incluyendo IVA) en el ejemplo con propina, en contradicción con su propia definición. Los webhooks muestran montos CLP con decimales (`101.99`).
20. Límite de captura: Raw dice «igual o menor al autorizado», mientras que Kushki ONE permite hasta el 110 %. ¿Cuál rige en Chile?

---

## Kushki Chile: base transversal

Referencia de lo que aplica a cualquier producto de Kushki en Chile, independiente del medio de pago. Lo específico de tarjeta presente (Kushki One, Raw Card-Present API) va en su propia sección.

### 1. Conceptos y cuentas

Fuentes: [Inicio Chile](https://docs.kushki.com/cl.md), [Inicio rápido](https://docs.kushki.com/cl/getting-started.md), [Paso a producción](https://docs.kushki.com/cl/getting-started/go-live.md), [Preguntas frecuentes](https://docs.kushki.com/cl/getting-started/faq.md), [Glosario](https://docs.kushki.com/cl/glossary/payment-glossary.md), [Marcas soportadas](https://docs.kushki.com/cl/card-payments/supported-card-brands.md)

**Credenciales (llaves).** Cada comercio tiene una llave pública (*Public Merchant ID*) y una privada (*Private Merchant ID*). Se administran en la Consola, en **Desarrolladores > Credenciales**. Al crear la cuenta se genera un par por defecto y se pueden crear más.
- La pública se usa en el front-end y los SDK (Kushki.js, iOS, Android) para tokenizar, en campos como `merchant_id`, `publicMerchantId` o `publicCredentialId`.
- La privada se usa solo en el back-end, en el header `Private-Merchant-Id`. Las llamadas que usan la llave pública llevan el header `Public-Merchant-Id`.
- Existe un rol opcional, «Maestro de Credenciales», que crea, edita y elimina credenciales del comercio principal y de los secundarios. Se habilita a pedido.

**Ambientes.**

| Ambiente | URL base del API | Uso |
|---|---|---|
| UAT (pruebas) | `https://api-uat.kushkipagos.com` | Desarrollo y certificación |
| Producción | `https://api.kushkipagos.com` | Pagos reales |

Para pasar a producción se quita el sufijo `-uat` de la URL y se cambian las credenciales. Cada ambiente tiene su propia cuenta y sus propias llaves. La cuenta de prueba sigue activa después de recibir la de producción.

**Consola.** Es el portal administrativo del comercio. Desde ahí se manejan credenciales, webhooks, Kajita, usuarios y roles, y se consultan transacciones. El *usuario maestro* tiene acceso a todos los módulos y asigna roles. Se recomienda pedir una cuenta de prueba distinta para cada país.

**Moneda.** En Chile todos los montos van en CLP.

**Medios de pago en Chile** (según la tabla de integraciones de Inicio rápido y el índice de Chile):
- Tarjeta no presente, crédito y débito en moneda local: pago único, diferido (cuotas con o sin interés), autorización y captura, OTP, 3DS y motor antifraude.
- Webpay Plus (Transbank). Según el glosario, es la única forma de recibir débito en Chile en pagos en línea.
- Pagos recurrentes: cargos calendarizados, *one click* y Webpay Oneclick.
- Transferencia bancaria (*transfer in*), solo desde cuentas de persona.
- Efectivo (*cash in*) en puntos de recaudo.
- Dispersión (*transfer out*) y envío de fondos a tarjetas Visa.
- Tarjeta presente con terminales POS y SmartPOS certificados (Kushki One, Raw Card-Present API).
- Links de pago (Smartlink), botón de pago, Kajita y plugins (Shopify, VTEX, WooCommerce, PrestaShop, Magento).
- Apple Pay.

Kushki advierte que, por sus políticas de riesgo, los medios de pago y el tipo de integración pueden cambiar al formalizar la afiliación.

**Marcas soportadas.** En la página de marcas, el detalle por marca solo aparece como imagen, así que el Markdown no lo trae. El texto sí dice lo siguiente:
- En Chile las tablas cubren el modelo agregador y la adquirencia. El modelo gateway figura como N/A.
- Las marcas habilitadas dependen del acuerdo comercial.
- Operaciones permitidas con tarjeta: autorización y captura, captura parcial, anulación, cargo, reembolso y reembolso parcial.
- Las tarjetas de **débito** Visa y Mastercard no admiten autorización y captura, captura parcial ni reembolsos, totales o parciales.
- El glosario nombra para Webpay Plus las redes Diners Club, Magna, Mastercard, Redcompra y Visa.
- 3DS (1.0 y 2.0) se ofrece para Visa y Mastercard.

**Token.** Dura 30 minutos y sirve para un solo uso.

### 2. Paso a producción y política de cambios del API

Fuentes: [Inicio rápido](https://docs.kushki.com/cl/getting-started.md), [Paso a producción](https://docs.kushki.com/cl/getting-started/go-live.md), [Política de cambios del API](https://docs.kushki.com/cl/getting-started/api-upgrades.md)

**Checklist**
1. Pedir la cuenta de prueba en kushki.com y construir la integración en UAT.
2. Postular a la cuenta de producción desde la consola de pruebas, con contacto comercial previo. Kushki hace una revisión comercial y de riesgo (KYC), que es obligatoria por ser adquirente.
3. Pasar la **certificación técnica**: un ingeniero de integración de Kushki prueba los escenarios. Los datos de prueba de la sección 3 son los que se exigen.
4. Recibir por correo las credenciales de producción.
5. **Configurar la cuenta de producción desde cero**, porque la configuración de UAT no se copia. Esto incluye webhooks, Kajita y usuarios.
6. Cambios en el front-end y los SDK:
   - Kushki.js y Kajita: `inTestEnvironment` en `false` y `merchant_id` con la llave pública de producción.
   - Hosted Fields: `inTest` en `false` y `publicCredentialId` con la llave de producción.
   - Kajita v2: en la Consola, ir a **Configuración > Integraciones > Kajita**, activar **Modo producción** y publicar.
   - Android e iOS: `KushkiEnvironment.production` y `publicMerchantId` con la llave de producción.
7. Cambios en el back-end: quitar `-uat` de la URL y usar las llaves `Public-Merchant-Id` y `Private-Merchant-Id` de producción.

**Política de cambios del API**
- No hay versiones en paralelo. Los *breaking changes* se avisan con **al menos 4 meses** de anticipación.
- Se consideran *breaking changes*:
  - quitar o renombrar endpoints, campos o valores de un enum;
  - agregar un campo obligatorio sin valor por defecto, o volver obligatorio uno opcional;
  - cambiar el tipo de un campo o el formato de la URL;
  - agregar validaciones nuevas;
  - cambiar permisos o la funcionalidad de un endpoint.
- Los arreglos de seguridad o de bugs graves pueden aplicarse de inmediato, dentro del SLA.
- Sin aviso previo pueden llegar cambios *non-breaking*:
  - campos nuevos en la respuesta y valores nuevos en enums;
  - cambios en el orden de los campos o en el largo de los valores;
  - cambios en los textos de error;
  - endpoints o headers opcionales nuevos.
- Por eso la integración debe tolerar campos y valores desconocidos y **decidir según el código, no según el texto del mensaje**.

### 3. Datos de prueba (UAT)

Fuente: [Datos de prueba](https://docs.kushki.com/cl/getting-started/testing-your-integration.md)

En las tarjetas de esta tabla sirve cualquier CVV y cualquier fecha de vencimiento futura.

| Escenario | Tarjeta | Respuesta esperada |
|---|---|---|
| Aprobada (pago único, *one click*, preautorización, OTP, Shopify) | `5451951574925480` | `(000) Transacción aprobada` |
| Rechazo al pedir el token (pago único) | `000000000000000000` | `K025 Tarjeta inválida` |
| Rechazo al pedir el token (*one click*, preautorización, OTP, Shopify) | `4574441215190335` | `(017) Tarjeta no válida` |
| Rechazo en el cobro | `4349003000047015` | `(017) Tarjeta no válida` |
| Tarjeta no compatible | `4349008516656431` | `(019) Tarjeta no compatible` |
| Sin fondos | `4349001210846432` | `(021) Tarjeta sin fondos` |
| CVV inválido | `4349003243371321` | `(022) Imposible verificar CVV` |
| Bloqueada por el banco | `4349001386781322` | `(023) Tarjeta bloqueada por el banco` |
| Rechazo en la captura de una preautorización | `4547004841271012` | `(579) Transacción declinada` |
| Rechazo en el cobro (Shopify) | `4000001278960006` | `(017) Tarjeta no válida` |
| Inscripción de tarjeta (suscripción) aprobada | `5451951574925480` | `(201) Suscripción creada` |
| Webpay Plus aprobada | `4051885600446623` | `(000) Transacción aprobada` |
| Webpay Plus rechazada | `5186059559590568` | `Error en la transacción` |
| Webpay Oneclick: suscripción creada | `4023655102252133` | `Transacción aprobada` |
| Webpay Oneclick rechazada | `4568652646042584` | `500 Transacción rechazada` |

Otros casos:
- **OTP:** el monto que valida la OTP con éxito es `150`.
- **Webpay:** el flujo de Transbank pide RUT y clave de prueba, que están en la página fuente. Con débito basta el número de tarjeta.
- **Efectivo:** con cualquier identificación la transacción es exitosa. Con `9999999999` queda inicializada y no genera webhook. Con `1000000000` queda expirada.
- **Transferencia y dispersión:** dependen de que el comercio tenga el sandbox activo y de que el procesador permita simular estados.

La página **no trae datos de prueba para tarjeta presente**.

### 4. Códigos de error

Fuentes: [Códigos de error (índice)](https://docs.kushki.com/cl/getting-started/error-codes.md), [Códigos de pagos únicos con tarjeta](https://docs.kushki.com/cl/card-payments/one-step-payments/error-codes.md)

La página general no trae una tabla propia. Enlaza a un catálogo por producto:
- pagos únicos con tarjeta;
- 3DS (`/cl/card-payments/3d-secure/3ds-error-codes`);
- OTP (`/cl/card-payments/one-step-payments/otp-error-codes`);
- cargos recurrentes (`/cl/recurring-payments/error-codes`);
- efectivo rechazado (`/cl/cash-payments/declined-cash-transaction`);
- dispersión (`/cl/payouts/transfer/error-codes`).

Tarjeta presente tiene catálogos aparte. Los más relevantes del catálogo de pagos únicos, agrupados:

| Categoría | Códigos | Qué hacer |
|---|---|---|
| Credenciales o comercio | `201`, `K004`, `K040` | Revisar las llaves pública y privada |
| Request mal formado | `K001` (body inválido), `703` (falta monto), `K039` (monto ≤ 0), `K042` (moneda distinta a la original) | Corregir la petición |
| Token | `577`, `K008`, `K048` (expirado), `K049` (ya usado) | Volver a tokenizar |
| Tarjeta o BIN | `017`, `K007`, `K011`, `K025`, `K029` | Pedir otra tarjeta |
| Montos en captura y anulación | `K012`, `K023`, `K038`, `K051` (ya capturada), `K220` (monto distinto al de la venta) | Revisar el monto |
| Timeout o procesador | `228`, `K013`, `K027`, `K030` | Reintentar |
| Error interno | `K002`, `K047` | Reintentar y, si persiste, escribir a soporte |
| Configuración del comercio | `K003`, `K005`, `K016`, `K026`, `K028` (diferidos no habilitados), `K041` | Escribir a soporte |
| Regla antifraude de Kushki | `K322` | Escribir a soporte |
| Abandono o cancelación por el usuario | `006`, `621`, `622` | Ninguna acción o reintentar |

Cuando el rechazo viene del procesador, el error llega en `processorError` con códigos de la serie 5xx. Algunos ejemplos:
- `501`, `505`, `512`, `515`: el emisor rechazó o no permite la transacción.
- `503`: el comercio no está registrado en el procesador.
- `518`: tarjeta vencida.
- `527`: monto en cero.
- `529`: no se encontró la transacción original al anular.

### 5. Notificaciones (webhooks)

Fuentes: [Notificaciones](https://docs.kushki.com/cl/notifications.md), [Buenas prácticas](https://docs.kushki.com/cl/notifications/recommendations.md), [Consulta tus webhooks](https://docs.kushki.com/cl/notifications/webhooks-check.md), [Preguntas frecuentes](https://docs.kushki.com/cl/getting-started/faq.md)

**Configuración.** Hay tres formas:
1. **Desde la Consola:** **Desarrolladores > Webhooks**, o con una solicitud a soporte indicando el ID del comercio, la URL y los eventos.
2. **Por transacción, vía API:** se agrega el objeto `webhooks` en el body de los endpoints de cobro, anulación y reembolso con tarjeta, y en los `init` de transfer in/out, cash in/out y card async. El objeto es un arreglo con `events` (por ejemplo `approvedTransaction` y `declinedTransaction`), `headers` (pares `label`/`value`) y `urls`.
3. Si existen webhooks en la Consola y también en la API, se notifica a ambos.

> **Tarjeta presente (el caso de DTEx®): los webhooks se configuran y se consultan solo desde la Consola. No se aceptan vía API.**

Desde la Consola también se puede:
- ver el estado de conexión de cada webhook (Exitoso o Fallido);
- simular una notificación;
- agregar hasta **4 headers propios** por webhook;
- revisar las notificaciones recibidas en **Desarrolladores > Notificaciones de webhooks**, donde el campo «Configuración» indica si vino de la API o de la Consola.

**Transporte.** Kushki envía un `POST` con body JSON. La guía principal dice que acepta HTTP o HTTPS, pero la FAQ pide certificado SSL. Usar HTTPS.

**Eventos por producto**

| Producto | Campo de estado | Valores o eventos |
|---|---|---|
| Tarjeta, pago único ([fuente](https://docs.kushki.com/cl/notifications/one-time-payments/webhook-card.md)) | `transaction_status` (con `transaction_type`: `"SALE"`) | `APPROVAL`, `DECLINED`. También notifica anulaciones y reembolsos aprobados |
| Webpay Plus ([fuente](https://docs.kushki.com/cl/notifications/one-time-payments/webhook-webpay-plus.md)) | `transaction_status` | `APPROVAL`, `DECLINED` |
| Transferencia, transfer in ([fuente](https://docs.kushki.com/cl/notifications/one-time-payments/webhook-transfer-in.md)) | `status` | `approvedTransaction`, `declinedTransaction`. En la doc también aparecen `initializedTransaction` y `expiredTransaction` |
| Efectivo, cash in ([fuente](https://docs.kushki.com/cl/notifications/one-time-payments/webhook-cash-in.md)) | `status` | `approvedTransaction`, `expiredTransaction` |
| Suscripciones con tarjeta ([fuente](https://docs.kushki.com/cl/notifications/recurring-payments/webhook-card-subscriptions.md)) | `status` | `subscriptionApproved` (o `approvedTransaction` si se creó con Smartlink), `succesfullCharge` (así, con esa ortografía), `declinedCharge`, `failedRetry`, `lastRetry`, `subscriptionDelete` |
| Webpay Oneclick ([fuente](https://docs.kushki.com/cl/notifications/recurring-payments/webhook-webpay-oneclick.md)) | `status` | `subscriptionApproved`, `subscriptionDeclined` (también menciona el estado pendiente) |
| Anulaciones y reembolsos ([fuente](https://docs.kushki.com/cl/notifications/refunds-chagebacks/webhook-refunds-voids.md)) | `transactionStatus` | `APPROVAL`, `DECLINED` |
| Contracargos ([fuente](https://docs.kushki.com/cl/notifications/refunds-chagebacks/webhook-chargeback.md)) | `status` | `INITIALIZED` (trae `deadLine` Unix; hay 15 días para subir documentos), `REVIEW`, `APPROVAL`, `DECLINED`, `EXPIRED` |
| Dispersión, transfer out ([fuente](https://docs.kushki.com/cl/notifications/payment-distribution/webhook-transfer-out.md)) | `transactionStatus` | `APPROVAL`, `DECLINED` |
| Botón de pago y Smartlink ([botón](https://docs.kushki.com/cl/notifications/payment-button/payment-button.md), [Smartlink](https://docs.kushki.com/cl/notifications/smartlinks/smartlinks.md)) | `status` | `approvedTransaction`, `declinedTransaction` (y `expiredTransaction` en botón de pago) |

Los webhooks de tarjeta presente (Kushki One, asíncronos) tienen su propia guía (`/cl/card-present-payments/webhooks` y `/cl/card-present-payments/kushki-one/async-services-webhooks`) y quedan fuera de esta sección.

**Payload común.** No hay un sobre único: los campos cambian según el producto. Por ejemplo, la tarjeta usa `snake_case` y transfer out o devoluciones usan `camelCase`. Lo que se repite en el webhook de tarjeta:
- identificación: `ticket_number`, `transaction_id`, `transaction_reference`, `merchant_id`;
- montos: `amount` (`subtotalIva`, `subtotalIva0`, `iva`, `ice`, `currency`), `request_amount`, `approved_transaction_amount`;
- resultado: `transaction_status`, `response_code`, `response_text`, `processor` (`code`, `message`), `approval_code`;
- tarjeta: `payment_brand`, `last_four_digits`, `bin_card`, `card_type`, `issuing_bank`;
- otros: `metadata` (libre, la que envía el comercio) y `created` (timestamp Unix).

**Verificación de firma.** Cada notificación trae estos headers:
- `X-Kushki-Key`: ID del comercio.
- `X-Kushki-Id`: timestamp Unix.
- `X-Kushki-Signature`: HMAC-SHA256 en hexadecimal sobre `<body>.<X-Kushki-Id>`, usando como clave el *webhook signature* del comercio, que se copia desde **Desarrolladores > Webhooks** en la Consola.
- `X-Kushki-SimpleSignature`: HMAC-SHA256 en hexadecimal sobre `X-Kushki-Id`, con la misma clave.

Basta con validar una de las dos firmas y responder `401` si no coincide.

Al implementarlo:
- Calcular la firma sobre el **body crudo**, como en el ejemplo PHP. El ejemplo JS vuelve a serializar con `JSON.stringify`, y eso puede cambiar los bytes.
- El ejemplo JS de `SimpleSignature` usa una variable que no está definida (`kushki_id`).
- La doc no pide validar la antigüedad del timestamp. Hacerlo de todos modos ayuda contra repeticiones.

**IP de origen (fija).**

| Ambiente | IP |
|---|---|
| UAT | `54.208.105.247` |
| Producción | `34.230.185.20` |

**Reintentos.** Kushki espera un `200` o `201`:
- El primer envío es inmediato (*Notify Now*).
- Si falla, hace hasta **7 reintentos en unas 3 horas**: 3 en la primera hora (minutos 20, 40 y 60) y 4 en las 2 horas siguientes (cada 30 minutos).
- Después marca el webhook como fallido y no reintenta más. Para recuperarlo hay que escribir a soporte.
- Los tiempos son aproximados.

La FAQ dice otra cosa: cada 5 minutos durante 5 horas. Vale la guía principal, que se actualizó en octubre de 2023.

**Buenas prácticas.**
- **Idempotencia:** puede llegar la misma notificación más de una vez. Deduplicar por `transaction_id` o `ticket_number` y por estado.
- **Responder rápido:** devolver `200` de inmediato y procesar en segundo plano, para evitar timeouts.
- **Probar antes de producción:** usar el botón «Simular conexión» de la Consola.
- **Reconfigurar en producción:** los webhooks de UAT no se copian.

### 6. Gestión de sucursales (onboarding de subcomercios)

Fuentes: [Administración de sucursales](https://docs.kushki.com/cl/branch-office-management.md), [Onboarding de subcomercios vía API](https://docs.kushki.com/cl/branch-office-management/branch-office-management.md)

Es un flujo para **PSP** que dan de alta subcomercios por API:
1. **Validación en lote.** Responde `INITIALIZED` o `VALIDATION_FAILED`, y para cada subcomercio entrega `submerchantId` con estado `VALID` o `INVALID`. Después llega un webhook, opcional y configurado durante la afiliación del PSP, con `READY_FOR_ONBOARDING` o `ERROR` y un `requestId`.
2. **Consulta de estado** por `requestId` o `submerchantId`. Los estados son:
   - `PSP_PENDING_INFORMATION`
   - `KUSHKI_KYC: ONGOING`
   - `KUSHKI_ACCOUNT_CREATION: ONGOING`
   - `APPROVED_WITH_CONDITIONS`
   - `APPROVED`
   - `REJECTED`
3. **Carga de documentos KYC y listado de `submerchantIds`.** Usan la API Key del PSP generada en el portal Appian.
4. **Credenciales del subcomercio.** Solo se obtienen cuando el estado es `APPROVED`.

La lista de documentos que trae la página está rotulada «para México», aunque está en la documentación de Chile. Hay que confirmarlo con Kushki si DTEx® opera como PSP.

### 7. Glosario esencial

Fuente: [Glosario de pagos](https://docs.kushki.com/cl/glossary/payment-glossary.md)

- **Adquirente:** entidad autorizada por las marcas para procesar tarjetas y afiliar comercios.
- **Agregador / modelo agregador:** Kushki recibe los fondos de las ventas, descuenta comisiones y liquida al comercio.
- **Modelo gateway:** el dinero va directo al comercio y Kushki actúa solo como proveedor tecnológico.
- **Anulación (*void*):** reversa automática de un cargo. En Chile se puede hasta 3 horas después de aprobado; pasado ese plazo pasa a ser reembolso.
- **Reembolso (*refund*):** devolución total o parcial (en Chile se permite la parcial) de un cargo ya liquidado.
- **Autorización y captura:** reserva de fondos y cobro posterior. En Chile hay hasta 7 días para capturar.
- **Captura:** cobro efectivo de fondos que estaban autorizados. Puede ser parcial.
- **Cargo:** transacción de cobro (`SALE`).
- **Contracargo:** disputa que inicia el tarjetahabiente con su banco por un cargo que no reconoce.
- **Conciliación:** cuadre entre las transacciones y los abonos recibidos.
- **Liquidación:** pago de los fondos netos al comercio.
- **Consola:** portal administrativo de Kushki para el comercio.
- **Usuario maestro:** usuario con acceso total a la Consola, que asigna roles.
- **Llaves pública y privada:** credenciales del comercio. La pública se usa en el front-end y para tokenizar; la privada en el back-end.
- **Tokenización:** reemplazo de los datos de la tarjeta por un token de un solo uso que dura 30 minutos.
- **UAT:** ambiente de pruebas y certificación.
- **CNP:** tarjeta no presente, es decir, pago en línea.
- **POS:** terminal punto de venta, para pagos con tarjeta presente.
- **CVM:** método de verificación del titular en el terminal (firma o PIN).
- **3DS:** autenticación del tarjetahabiente con el emisor en pagos en línea.
- **OTP:** clave de un solo uso para autenticar un pago.
- **BIN:** primeros dígitos de la tarjeta, que identifican al emisor.
- **Webpay Plus:** solución de Transbank para crédito y débito en línea en Chile.
- **Webhook:** notificación HTTP `POST` que Kushki envía cuando ocurre un evento.
- **Time out:** caída de una transacción por exceder el tiempo máximo.

---

## Pagos en línea (online) — mapa de referencia, Chile

> Mapa compacto de los productos *online* de Kushki para Chile. No reemplaza la
> documentación: cada bloque enlaza a su página fuente. El foco de DTEx® está en
> tarjeta presente; esta sección sirve para saber qué existe y qué podría usarse
> como complemento.

### Conceptos transversales

- **Ambientes**: pruebas `https://api-uat.kushkipagos.com`, producción
  `https://api.kushkipagos.com`. Las rutas de abajo son relativas a esa base.
- **Credenciales**: la tokenización (front-end o SDK) usa la credencial pública
  (`Public-Merchant-Id`); los cobros, capturas y anulaciones desde el back-end
  usan la privada (`Private-Merchant-Id`).
- **Patrón general**: *tokenizar* (front-end, SDK o API) → *ejecutar* la
  operación en el back-end con ese `token` → guardar el `ticketNumber` de la
  respuesta (identificador para captura, anulación y consultas).
- **Objeto `amount`** (Chile): `subtotalIva`, `subtotalIva0`, `iva`, `ice`
  (opcional) y `currency: "CLP"`. Los ejemplos para Chile usan montos enteros
  (p. ej. `10000`).
- **Datos recomendados en el cobro** (exigidos en la certificación):
  `contactDetails` (incluido `email` si se notifica al pagador),
  `orderDetails.billingDetails`, `orderDetails.shippingDetails` (si aplica),
  `productDetails` y `metadata` libre. `fullResponse` amplía la respuesta.
- **Front-end disponible**: Kajita/Cajita (formulario alojado), Kushki.js
  (`@kushki/js`), Kushki.js Hosted Fields (`@kushki/js-sdk`) y SDK móviles
  (`com.kushkipagos:kushki-android`, `kushki-ios-*`).
- **Modelo de afiliación**: varias funciones dependen de si el comercio es
  **Adquirente** (adquirencia Kushki) o **Agregador**. En Chile, Webpay Plus y
  Webpay OneClick son solo para Agregador, mientras que 3DS y el cargo sin token
  son solo para Adquirente.
- **Notificaciones**: webhooks por producto (configurados en la consola) y
  endpoints de consulta de estado.

Fuentes: [card-payments](https://docs.kushki.com/cl/card-payments.md) ·
[modelo](https://docs.kushki.com/cl/card-payments/model.md) ·
[marcas](https://docs.kushki.com/cl/card-payments/supported-card-brands.md)

---

### 1. Tarjeta en un paso (cargo directo)

**Qué resuelve**: cobro único inmediato (autorización y captura en una sola
llamada) con tarjeta de crédito o débito, en web o app.

**Flujo**
1. El front-end captura la tarjeta y pide el token (`requestToken` en Kushki.js
   o SDK; en Hosted Fields, `cardInstance.requestToken()`, que además ejecuta
   3DS, OTP y Sift si corresponden).
2. (Opcional) Consulta de cuotas por BIN (`requestDeferred({ bin })`).
3. El back-end ejecuta el cargo con el `token`.
4. Se muestra éxito o fracaso según la respuesta, y se confirma por webhook.

**Endpoints**
| Método | Ruta | Uso |
|---|---|---|
| POST | `/card/v1/tokens` | Token de tarjeta (vía API; requiere PCI) |
| POST | `/card/v1/charges` | Cargo con `token` |
| POST | `/card/v2/charges` | Cargo **sin token** (datos de tarjeta en `card`); solo Adquirente y PCI DSS |
| DELETE | `/v1/charges/{ticketNumber}` | Anulación/devolución |

Campos clave del cargo: `token`, `amount`, `contactDetails`, `orderDetails`,
`productDetails`, `metadata`, `fullResponse`; cuotas en `months` o `deferred`.

**Particularidades para Chile**
- **Cuotas**: con modelo **Agregador** se envía solo `months`. Con modelo
  **Adquirente** se envía `deferred` con `graceMonths: "00"`, `creditType` y
  `months`:
  - `creditType: "01"` → Cuotas Emisor, de 2 a 48 cuotas.
  - `creditType: "03"` → Cuotas Comercio, de 2 a 12 cuotas (beta, se activa con
    Kushki).
  Las opciones disponibles dependen del BIN de la tarjeta.
- **Cargo sin token (`/card/v2/charges`)**: Visa y Mastercard. Admite cuotas,
  recurrencias y preautorización. No admite las librerías front-end ni el
  OTP/3DS de Kushki (se puede enviar autenticación 3DS externa).
- **OTP** (opcional, solo web y crédito, activación con soporte): Kushki hace un
  cobro aleatorio de **500 a 999 CLP** y el pagador ingresa ese monto para
  validar. No disponible en los SDK de Android ni iOS.
- **Devoluciones**: si se piden el mismo día, son *void* (Agregador: hasta 3 h
  después de la aprobación; Adquirente: antes de las 23:59). Después de eso,
  pasan a *refund* (hasta 7 días hábiles en procesarse y hasta 20 en verse en el
  estado de cuenta). Plazo para pedirlas: 90 días (Agregador) o 120 días
  (Adquirente). Una devolución aprobada no se puede revertir. Las débito Visa y
  Mastercard no admiten reembolsos.
- **Apple Pay**: existe como flujo propio de tarjeta (fuera de este mapa).

Fuentes:
[accept-a-payment](https://docs.kushki.com/cl/card-payments/one-step-payments/accept-a-payment.md) ·
[create-payment (sin token)](https://docs.kushki.com/cl/card-payments/one-step-payments/create-payment.md) ·
[otp-payments](https://docs.kushki.com/cl/card-payments/one-step-payments/otp-payments.md) ·
[manage-voids-and-refunds](https://docs.kushki.com/cl/card-payments/refunds/manage-voids-and-refunds.md)

---

### 2. Tarjeta en dos pasos (autorización y captura)

**Qué resuelve**: retiene fondos ahora y los cobra después (p. ej., al
completarse el servicio). Permite reautorizar para cambiar el monto o extender
la vigencia.

**Flujo**
1. Token de tarjeta (igual que en un paso).
2. `preAuthorization` → guardar `ticketNumber`.
3. (Opcional) `reauthorization` con el mismo `ticketNumber`.
4. `capture` con `ticketNumber` y `amount`, o anulación para liberar los fondos.

**Endpoints**
| Método | Ruta |
|---|---|
| POST | `/card/v1/preAuthorization` |
| POST | `/card/v1/reauthorization` |
| POST | `/card/v1/capture` |
| DELETE | `/v1/charges/{ticketNumber}` (liberar la autorización) |

**Particularidades para Chile**
- Visa y Mastercard. La vigencia es de **7 días para débito y 28 para
  crédito**, y puede variar según la negociación comercial.
- Se permite **una sola captura** por autorización, por hasta un **10 % más**
  que la suma de la autorización y las reautorizaciones.
- La página de detalle lo marca como solo Adquirente, mientras que la tabla de
  modelos lo marca para ambos: hay que confirmarlo con Kushki.
- La página de marcas indica que las débito Visa y Mastercard no admiten
  autorización y captura, lo que contradice la vigencia de 7 días para débito:
  también hay que confirmarlo.

Fuentes:
[two-steps-payments](https://docs.kushki.com/cl/card-payments/two-steps-payments.md) ·
[authorization-capture](https://docs.kushki.com/cl/card-payments/two-steps-payments/authorization-capture.md) ·
[overview](https://docs.kushki.com/cl/card-payments/two-steps-payments/authorization-capture-overview.md)

---

### 3. Webpay Plus (Transbank, vía Kushki)

**Qué resuelve**: el medio de pago online más común en Chile. Acepta crédito,
débito RedCompra, prepago y OnePay. El pagador es **redirigido** al portal de
Transbank y a su banco para autenticarse. Solo para modelo **Agregador**.

**Flujo**
1. Front-end: `requestCardAsyncToken({ totalAmount, currency: "CLP",
   returnUrl, email, description })`, o Cajita con
   `payment_methods: ["card_async"]` y `return_url`.
2. Back-end: `POST /card-async/v1/init` con `token` y `amount` → la respuesta
   trae `redirect_url`.
3. Se redirige en la misma pestaña (sin iframe ni pop-up).
4. Transbank devuelve al pagador con
   `GET {returnUrl}?token=...`. El estado se consulta con el endpoint de estado
   de *card-async* o por webhook.

**Variante «reserva de fondos» (capture later)**
- `POST /card-async/v1/preAuthorization` → redirección → `ticketNumber`.
- `POST /card-async/v1/capture` con `ticketNumber`.
- La retención dura **7 días**; si no se captura, se cancela sola. Admite
  **varias capturas parciales** mientras no superen el monto autorizado.

Fuentes:
[webpay-plus](https://docs.kushki.com/cl/card-payments/webpay-plus.md) ·
[webpay-plus-capture-later](https://docs.kushki.com/cl/card-payments/webpay-plus/webpay-plus-capture-later.md)

---

### 4. Network tokens

**Qué resuelve**: procesar con un token emitido por Visa o Mastercard en lugar
del PAN. El token se actualiza solo si la tarjeta vence o se reemite.
Disponible en Chile, con modelo de adquirencia.

**Dos caminos independientes**
1. **Transporte** (beta, se habilita con el ejecutivo): se trae un network
   token propio (p. ej., desde Apple Pay). Va en `POST /card/v1/tokens` (o
   directamente en `POST /card/v2/charges`) con `card.number` igual al network
   token, `card.cryptogram` (20 a 28 caracteres, distinto del CVV; se recomienda
   enviar también `card.cvv`), `isNetworkToken: true` y el objeto
   `networkToken` (`deviceType`, `requestorId`, `source`, `walletId` —`01`
   Apple Pay, `04` otras—, `authenticationLevel` y `mvv` para Visa). Después,
   el flujo normal de cargo o preautorización.
2. **Creación** (requiere acuerdo comercial): se agrega
   `capabilities: ["networkToken"]` en `POST /card/v1/charges` o
   `/card/v1/preAuthorization` (también en sus variantes sin token). Si se
   tokenizó, la respuesta incluye el objeto `network` (`isNetworkToken`,
   `tmsMaskedCardNumber`, `tmsBin`, etc.). No todas las transacciones se
   tokenizan, así que hay que revisar `network` en cada respuesta.

Fuente: [network-tokens](https://docs.kushki.com/cl/card-payments/network-tokens.md)

---

### 5. Autenticación 3DS

**Qué resuelve**: un desafío adicional con el emisor (normalmente OTP del
banco) cuando las reglas de riesgo lo exigen. En Chile, solo con modelo
**Adquirente**, para Visa y Mastercard. En Agregación, Chile no tiene 3DS.

**Flujo con Kushki.js**: el token devuelve `secureId` y `secureService`, y se
valida con `kushki.requestValidate3DS({ secureId, ... })`. Hosted Fields lo hace
dentro de `requestToken()`.

**Flujo 100 % API** (comercio PCI):
1. `POST /card/v1/tokens` con `authValidation` (`"url"` o `"iframe"`) y
   `callbackUrl`. Con `require3DS: true` se fuerza el desafío.
2. Si se requiere 3DS, la respuesta trae `url`, `secureService: "3dsecure"` y
   `secureId`.
3. El pagador se autentica. En modo `url`, vuelve por `GET {callbackUrl}` con
   `success`, `token` y `message`. En modo `iframe`, se escuchan los eventos
   `INIT_VALIDATION`, `LAUNCH_VALIDATION`, `FAILED_VALIDATION` y
   `FINISH_VALIDATION`.
4. Se ejecuta el cargo o la preautorización. Si se omite la validación, el
   rechazo llega con código **K322** y subcódigo **K328**.

- Si se usa un motor 3DS propio, se envía el objeto `threeDomainSecure` en el
  cargo.
- El 3DS por API no cubre la creación de suscripciones ni los cargos one-click.
  Para suscripciones hay un 3DS aparte (beta) que se ejecuta solo al tokenizar
  la tarjeta.

Fuentes:
[3ds-overview](https://docs.kushki.com/cl/card-payments/3d-secure/3ds-overview.md) ·
[3ds-via-api](https://docs.kushki.com/cl/card-payments/3d-secure/3ds-via-api.md) ·
[3ds-kushkijs](https://docs.kushki.com/cl/card-payments/3d-secure/3ds-kushkijs.md) ·
[recurring 3DS](https://docs.kushki.com/cl/recurring-payments/3ds-authentication.md)

---

### 6. Pagos recurrentes calendarizados (suscripciones)

**Qué resuelve**: se inscribe una tarjeta una vez y Kushki cobra
automáticamente según una periodicidad.

**Flujo**
1. Front-end: `requestSubscriptionToken(...)` (o Kajita o Hosted Fields).
2. Back-end: `POST /subscriptions/v1/card` con `token`, `amount`, `planName`,
   `periodicity`, `startDate` (debe ser futura), `contactDetails` y `metadata`
   → `subscriptionId`.
3. Al inscribir, Kushki hace un **cobro de validación** pequeño que reversa de
   forma automática.
4. Kushki ejecuta los cobros. La lógica corre a diario desde las **6:00
   GMT-5**.

**Gestión**
| Método | Ruta | Uso |
|---|---|---|
| GET | `/subscriptions/v1/card/search/{subscriptionId}` | Consultar |
| PATCH | `/subscriptions/v1/card/{subscriptionId}` | Actualizar datos del plan o cambiar la tarjeta (nuevo `token`) |
| PUT | `/subscriptions/v1/card/{subscriptionId}` | Descuento temporal (monto y cantidad de períodos) |
| DELETE | `/subscriptions/v1/card/{subscriptionId}` | Cancelar |

- `periodicity`: `daily`, `weekly`, `biweekly`, `monthly`, `threefortnights`,
  `bimonthly`, `quarterly`, `fourmonths`, `halfyearly`, `yearly` o `custom`
  (este último para one-click).
- **Reintentos**: por defecto, 3 al día durante 3 días desde `startDate`. Se
  personalizan con `retryConfiguration.retryType`, que puede ser `"schedule"`
  (con `value`) o `"fixed"` (días del mes).
- **Suscripciones externas** (solo Adquirente, previa evaluación de Kushki):
  cobros desde un motor de suscripciones propio con `externalSubscriptionID`
  (20 caracteres alfanuméricos como máximo) y sin CVV (requiere PCI DSS).

Fuentes:
[scheduled overview](https://docs.kushki.com/cl/recurring-payments/scheduled-payments/overview.md) ·
[subscribe-a-card](https://docs.kushki.com/cl/recurring-payments/scheduled-payments/subscribe-a-card.md) ·
[manage-scheduled-charges](https://docs.kushki.com/cl/recurring-payments/scheduled-payments/manage-scheduled-charges.md) ·
[external-subscriptions](https://docs.kushki.com/cl/recurring-payments/external-subscriptions.md) ·
[modelo](https://docs.kushki.com/cl/recurring-payments/model.md)

---

### 7. Pagos one-click (tarjeta guardada, bajo demanda)

**Qué resuelve**: se guarda la tarjeta de **crédito** sin cobro inicial y
luego se cobra cuando el comercio lo decide, sin que el cliente reingrese sus
datos. Para débito, Kushki deriva a Webpay OneClick.

**Flujo**
1. **Inscripción**: `requestSubscriptionToken` → `POST /subscriptions/v1/card`
   con `periodicity: "custom"` (obligatorio; si no, se cobraría en forma
   recurrente) → `subscriptionId`. Incluye un cobro de verificación de
   **50 CLP** que se reversa.
2. **Cobro**: en el front-end, `requestDeviceToken({ subscriptionId })`, que
   aplica 3DS o Sift si corresponde. En el back-end, `POST
   /subscriptions/v1/card/{subscriptionId}` con `token`, `amount`,
   `language`, `deferred.months` (cuotas), `contactDetails` y `metadata`.
3. **Cancelar inscripción**: `DELETE /subscriptions/v1/card/{subscriptionId}`.

**Variante autorización y captura**
- `POST /subscriptions/v1/card/{subscriptionId}/authorize` → `ticketNumber`.
- `POST /subscriptions/v1/card/{subscriptionId}/capture`, o `DELETE
  /v1/charges/{ticketNumber}` para liberar los fondos.

Fuentes:
[one-click-payments](https://docs.kushki.com/cl/recurring-payments/one-click-payments.md) ·
[on-demand](https://docs.kushki.com/cl/recurring-payments/one-click-payments/on-demand.md) ·
[capture-later-subscribed-cards](https://docs.kushki.com/cl/recurring-payments/one-click-payments/capture-later-subscribed-cards.md)

---

### 8. Webpay OneClick (Transbank, vía Kushki)

**Qué resuelve**: inscribe crédito o **débito RedCompra** mediante el portal de
Transbank, para cobros one-click o calendarizados. Solo para modelo
**Agregador**.

**Flujo (one-click)**
1. Front-end: `requestSubscriptionCardAsyncToken({ currency: "CLP", email,
   callbackUrl })`.
2. Back-end: `POST /subscriptions/v1/card-async/init` con `token`, `amount`,
   `planName`, `periodicity: "custom"`, `contactDetails` y `metadata` → la
   respuesta trae `redirectUrl`.
3. El pagador se inscribe en Webpay y vuelve por `GET
   {callbackUrl}?subscriptionId=...`.
4. Cobro: `POST /subscriptions/v1/card/{subscriptionId}`. Las cuotas van en
   `deferred.months`.
5. Cancelar: `DELETE /subscriptions/v1/card/{subscriptionId}`.

**Variantes**
- **Calendarizado**: el mismo `init` con `periodicity` (p. ej. `monthly`) y
  `startDate` futuro. Kushki cobra en forma automática.
- **Reserva de fondos** (one-click o calendarizado):
  `/subscriptions/v1/card/{subscriptionId}/authorize` y `/capture`. Se puede
  capturar un monto igual o menor al autorizado, con varias capturas parciales.

**Particularidades para Chile**: verificación de **50 CLP** que se reversa. Las
tarjetas sin marca o sin CVV no funcionan, como algunas Cuenta RUT antiguas de
BancoEstado.

Fuentes:
[webpay-oneclick](https://docs.kushki.com/cl/recurring-payments/webpay-oneclick.md) ·
[webpay-oneclick (on-demand)](https://docs.kushki.com/cl/recurring-payments/webpay-oneclick/webpay-oneclick.md) ·
[ondemand capture later](https://docs.kushki.com/cl/recurring-payments/webpay-oneclick/webpay-oneclick-ondemand-capture-later.md) ·
[scheduled-payments-webpay](https://docs.kushki.com/cl/recurring-payments/scheduled-payments-webpay.md) ·
[scheduled webpay-oneclick](https://docs.kushki.com/cl/recurring-payments/scheduled-payments-webpay/webpay-oneclick.md) ·
[scheduled capture later](https://docs.kushki.com/cl/recurring-payments/scheduled-payments-webpay/webpay-oneclick-capture-later.md)

---

### 9. Transferencias bancarias (transfer in)

**Qué resuelve**: el pagador paga con el saldo de su cuenta bancaria, a través
del «Sistema de transferencias bancarias» (portal personalizable desde la
consola).

**Flujo**
1. (Opcional) `kushki.requestBankList(callback)` para que el pagador elija su
   banco.
2. `kushki.requestTransferToken({ bankId?, callbackUrl, userType,
   documentType: "RUT", documentNumber, paymentDescription, email, currency:
   "CLP", amount })`.
3. Back-end: `POST /transfer/v1/init` con `token` y `amount` → la respuesta
   trae la URL del portal, a la que se redirige al pagador.
4. El pagador vuelve por `GET {callbackUrl}?token=...`.
5. Estado: `GET /transfer/v1/status/{token}` (consultar periódicamente) o
   webhook.

**Particularidades para Chile**: funciona las 24 horas, todos los días, solo
desde **cuentas persona**. Hay montos mínimos y máximos por banco, por ejemplo:
BancoEstado, 200.000 CLP (Cuenta RUT) para destinatarios nuevos; Santander,
mínimo 1.000 CLP. Kushki no devuelve transferencias: cualquier devolución es
manual.

Fuentes:
[transfer-payments](https://docs.kushki.com/cl/transfer-payments.md) ·
[accept-a-payment](https://docs.kushki.com/cl/transfer-payments/accept-a-payment.md) ·
[bank-list](https://docs.kushki.com/cl/transfer-payments/bank-list.md) ·
[get-transfer-status](https://docs.kushki.com/cl/transfer-payments/get-transfer-status.md)

---

### 10. Pagos en efectivo (cash in)

**Qué resuelve**: compras online de clientes no bancarizados. Se genera un
voucher con un PIN y el cliente paga en un punto de recaudación.

**Flujo**
1. `kushki.requestCashToken({ name, lastName, identification, documentType,
   email, totalAmount, currency, description })`.
2. Back-end: `POST /cash/v1/charges/init` con `token`, `amount` y
   `expirationDate` → PIN, `ticketNumber` y URL del PDF del voucher.
3. Se redirige al PDF. El cliente paga en el punto y Kushki notifica por
   webhook.

**Particularidades para Chile**: los puntos de recaudación son Express (hasta
3.000.000 CLP), **Sencillito** (sin mínimo ni máximo) y Supermercados A Cuenta
(hasta 3.000.000 CLP). Los errores de la API usan códigos `C001`–`C009`. Las
devoluciones son manuales. Los ejemplos de la página usan `PEN` y hay que
reemplazarlo por `CLP`.

Fuentes:
[cash-payments](https://docs.kushki.com/cl/cash-payments.md) ·
[accept-a-payment](https://docs.kushki.com/cl/cash-payments/accept-a-payment.md) ·
[authorized-locations](https://docs.kushki.com/cl/cash-payments/authorized-locations.md) ·
[declined-cash-transaction](https://docs.kushki.com/cl/cash-payments/declined-cash-transaction.md)

---

### 11. Payouts / dispersión por transferencia (transfer out)

**Qué resuelve**: envía dinero desde una cuenta de dispersión en Kushki a
cuentas bancarias de terceros (proveedores, vendedores de un marketplace,
repartidores). **Solo bajo demanda.**

**Flujo**
1. Recargar la cuenta de dispersión con una transferencia a Kushki Chile SpA y
   enviar el comprobante. Los fondos quedan disponibles en unas 3 horas. El
   saldo se consulta con el endpoint *Balance for Payouts*.
2. `GET /payouts/transfer/v1/bankList` (credencial pública) → bancos con `name`
   y `code`.
3. `POST /payouts/transfer/v1/tokens` (credencial pública) con `name`,
   `documentType: "RUT"`, `documentNumber`, `accountNumber`, `accountType`
   (`CA`, `CC` o `CV`), `bankId`, `totalAmount`, `currency: "CLP"` y
   `paymentDescription`.
4. `POST /payouts/transfer/v1/init` (credencial privada) con `token` y `amount`.
5. Estado: webhook o el endpoint *Get Status* de transfer out.

**Particularidades para Chile**: entre 1 CLP y 7.000.000 CLP por transacción,
y hasta 80.000.000 CLP diarios por beneficiario. Funciona 24/7 y se acredita de
inmediato. El saldo se descuenta al iniciar la dispersión.

Fuentes:
[payouts](https://docs.kushki.com/cl/payouts.md) ·
[transfer](https://docs.kushki.com/cl/payouts/transfer.md) ·
[transfer-out](https://docs.kushki.com/cl/payouts/transfer/transfer-out.md) ·
[error-codes](https://docs.kushki.com/cl/payouts/transfer/error-codes.md)

---

### 12. Plugins (Shopify, VTEX)

**Qué resuelve**: acepta pagos en tiendas de comercio electrónico sin
desarrollo propio.

- **Shopify**: admite tarjeta (con cuotas), autorización y captura, efectivo,
  transferencias, OTP y 3DS, Sift, reembolsos totales y anulaciones del mismo
  día. **No** admite recurrencias. Requiere una cuenta de producción en Kushki,
  un usuario *master* en la consola y el **Botón de pago (webcheckout)**
  activado.
- **VTEX**: se integra mediante el proveedor **Yuno** (Store Settings →
  Providers), con webhooks en ambas plataformas. Ojo: el aviso general indica
  que el plugin anterior de VTEX quedó obsoleto en junio de 2025.
- Sin endpoints propios: se configura desde la consola o el panel de cada
  plataforma.

Fuentes:
[plugins](https://docs.kushki.com/cl/plugins.md) ·
[shopify](https://docs.kushki.com/cl/plugins/shopify.md) ·
[shopify-kushki](https://docs.kushki.com/cl/plugins/shopify/shopify-kushki.md) ·
[shopify-plugin-operation](https://docs.kushki.com/cl/plugins/shopify/shopify-plugin-operation.md) ·
[vtex](https://docs.kushki.com/cl/plugins/vtex.md) ·
[vtex-integration](https://docs.kushki.com/cl/plugins/vtex/vtex-integration.md)

---

### 13. Smartlinks (links de pago)

**Qué resuelve**: un enlace de pago que se comparte por chat, redes sociales o
correo, sin integración técnica. Acepta tarjeta, efectivo, transferencia y
Apple Pay.

**Flujo**
1. Se crea en la consola (o por API con *create a Smartlink*) con nombre,
   descripción, modalidad (**monto fijo** o **monto abierto**, con mínimo,
   máximo o monto sugerido), tipo de pago (único, suscripción o combinado),
   medios de pago, logo, estilo, número de usos y expiración, términos y un
   formulario dinámico.
2. Se copia la URL y se comparte.
3. Se puede editar, clonar o eliminar desde la consola, o por API con
   *update* y *delete*.

- El monto abierto solo admite pago único.
- La página no indica la ruta HTTP: solo enlaza a la referencia de la API
  (`api-docs.kushkipagos.com/chile/online-payments/smartlinks/create`).

Fuentes:
[smartlinks](https://docs.kushki.com/cl/smartlinks.md) ·
[smartlink](https://docs.kushki.com/cl/smartlinks/smartlink.md)

---

### 14. Formularios y botones de pago

**Kajita / Cajita** (formulario embebido): se carga `kushki-checkout.js` desde
el CDN de Kushki (no se debe empaquetar), se configura con `kformId`,
`publicMerchantId` y `amount`, y entrega un `token` que el back-end usa en el
endpoint de cada medio (p. ej. `POST /card/v1/charges`). Cubre tarjeta,
cuotas, transferencia, efectivo, suscripciones calendarizadas, autorización y
captura, OTP y 3DS. Las Kajitas se crean y personalizan en la consola.

**Botón de pago (webcheckout, página alojada por Kushki)**: solo bajo demanda.
1. `POST /smartlink/v1/webcheckout` (credencial privada) con `kind:
   "webcheckout"`, `contactDetail`, `redirectURL`, `products` y
   `paymentConfig` (`amount` y `paymentMethod`). Se puede agregar
   `transactionType: "PRE_AUTH"` para autorizar y capturar después con
   `/card/v1/capture`.
2. La respuesta trae `webcheckoutUrl`, que **expira en 15 minutos**. Se
   redirige ahí al pagador (sin iframe) o se incrusta el botón con
   `webcheckoutId`.
3. Al terminar, el pagador vuelve a `redirectURL`; la redirección automática es
   opcional.

**Particularidades para Chile**: en `paymentMethod`, `card-async` corresponde
a débito vía Webpay, `credit-card` a crédito vía Kushki y `card-dynamic` a
ambos. También admite `cash` y `transfer`. Se puede mostrar un mensaje de
cuotas, y con Cuotas Comercio aparece la etiqueta «Sin interés». **No** admite
recurrencias, Webpay OneClick ni captura parcial.

Fuentes:
[payment-forms-and-buttons](https://docs.kushki.com/cl/payment-forms-and-buttons.md) ·
[overview](https://docs.kushki.com/cl/payment-forms-and-buttons/overview.md) ·
[kajita](https://docs.kushki.com/cl/payment-forms-and-buttons/kajita.md) ·
[kajita/payment-form](https://docs.kushki.com/cl/payment-forms-and-buttons/kajita/payment-form.md) ·
[kajita/create-a-payment-form](https://docs.kushki.com/cl/payment-forms-and-buttons/kajita/create-a-payment-form.md) ·
[payment-button](https://docs.kushki.com/cl/payment-forms-and-buttons/payment-button.md) ·
[payment-button/overview](https://docs.kushki.com/cl/payment-forms-and-buttons/payment-button/overview.md) ·
[create-payment-button](https://docs.kushki.com/cl/payment-forms-and-buttons/payment-button/create-payment-button.md)

---

### Resumen y aplicabilidad a DTEx®

DTEx® es una app de cobro **presencial** en terminal Android. Lo online solo
sirve como complemento, para cobros a distancia o para operaciones que no
pasan por el terminal.

| Producto | Endpoint principal | ¿Aplica a DTEx®? |
|---|---|---|
| Tarjeta en un paso | `POST /card/v1/charges` (`/card/v2/charges` sin token) | No: es *card-not-present*; el cobro con tarjeta va por tarjeta presente |
| Dos pasos (autorización y captura) | `POST /card/v1/preAuthorization` → `/card/v1/capture` | No en línea; el concepto sirve como referencia si tarjeta presente ofrece preautorización |
| Devoluciones online | `DELETE /v1/charges/{ticketNumber}` | No: las anulaciones presenciales van por su propio flujo |
| Webpay Plus | `POST /card-async/v1/init` | No (requiere redirección web y modelo Agregador) |
| Network tokens | `POST /card/v1/tokens` (`isNetworkToken`) / `capabilities` | No |
| 3DS | `POST /card/v1/tokens` (`authValidation`, `callbackUrl`) | No (en presencial se autentica con chip y PIN) |
| Recurrentes calendarizados | `POST /subscriptions/v1/card` | Posible a futuro (cobros periódicos del comercio a sus clientes); fuera del alcance actual |
| One-click | `POST /subscriptions/v1/card/{subscriptionId}` | No |
| Webpay OneClick | `POST /subscriptions/v1/card-async/init` | No |
| Transferencias (transfer in) | `POST /transfer/v1/init` | Posible: cobro a distancia con pago desde la cuenta bancaria |
| Efectivo (cash in) | `POST /cash/v1/charges/init` | No como integrador. Ojo: Sencillito figura como punto de recaudación de Kushki en Chile |
| Payouts (transfer out) | `POST /payouts/transfer/v1/init` | Posible (bajo demanda): abonos o pagos a comercios desde una cuenta de dispersión; habría que evaluarlo con MUFIN |
| Plugins (Shopify, VTEX) | — (configuración) | No |
| Smartlinks | Consola / *create a Smartlink* (API) | **Posible**: cobro a distancia (por WhatsApp o correo) sin que el cliente esté frente al terminal |
| Botón de pago (webcheckout) | `POST /smartlink/v1/webcheckout` | **Posible**: generar desde la app un link de cobro de 15 minutos (crédito, débito Webpay, transferencia) |
| Kajita | — (script `kushki-checkout.js`) | No (formulario web embebido) |
