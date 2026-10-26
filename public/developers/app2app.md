# App2App: cobrar con tarjeta a través de DTEx®

> Revisión 2026-10-26.5. Versión web: https://www.dtex.cl/developers/app2app

Una app Android instalada en el mismo terminal que DTEx® puede pedirle un **cobro con tarjeta**, y opcionalmente que emita e imprima el documento. DTEx® pasa al frente y abre de inmediato el cobro con el adquirente configurado en el equipo; el cajero confirma o cancela en la pantalla del adquirente. Al terminar, DTEx® devuelve el resultado y la app que llamó vuelve al frente.

Si tu app muere a mitad de camino, puedes preguntarle a DTEx® en qué etapa quedó la transacción con la [consulta de estado](#consulta-de-estado). Si Android cerró DTEx®, tu app puede [despertarlo](#despertar-dtex) para que el próximo cobro no espere el arranque.

Esta es la versión 1 del contrato. Todos los campos JSON van en `snake_case`.

## Requisitos

- **DTEx® instalado en el mismo equipo.** El paquete es `dev.mufin.dtex`. En terminales TUU Pro 2 es `dev.mufin.dtex.tuu_pro2`.
- **Equipo en modo integración y paquete de tu app autorizado.** Mufin enciende el *modo integración* en cada equipo que trabaja con tu app y autoriza tu paquete (ver [Solicitar autorización](#solicitar-autorización)). Si el equipo no está en modo integración, o tu paquete no está en la lista, DTEx® responde `NOT_AUTHORIZED`.
- **DTEx® con permiso "Mostrar sobre otras apps"** (`SYSTEM_ALERT_WINDOW`), concedido en el equipo o por MDM. Algunos adquirentes, como Kushki ONE, dejan su pantalla encima al terminar el cobro, y sin este permiso Android no deja que DTEx® devuelva tu app al frente: la respuesta llega igual, pero recién cuando el operador vuelve a tu app.
- **Llamar con `startActivityForResult`** o `registerForActivityResult`. DTEx® identifica tu app con `getCallingPackage()`, que solo existe cuando se pide un resultado. Una llamada con `startActivity` responde `INVALID_REQUEST`.
- **Android 11+:** declara `<queries><package android:name="dev.mufin.dtex"/></queries>` en tu manifest. Es obligatorio para [Mantener DTEx® listo](#mantener-dtex-listo); para las demás acciones es opcional y sirve para comprobar si DTEx® está instalado antes de llamar.

## Solicitud de cobro

Usa la acción `dev.mufin.dtex.action.PAYMENT` con el paquete de DTEx®. El extra `request` lleva un JSON:

```json
{
  "version": 1,
  "request_id": "4f1c2b9e-6a0d-4a51-9c1e-2a7b0d3e8f11",
  "amount": 1500.00,
  "tip": 0,
  "cashback": 0,
  "currency": "CLP",
  "document": "cl_sii_boleta",
  "print": true
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `version` | int | Siempre `1`. |
| `request_id` | string | Identificador único que generas tú (recomendado: UUID). Guárdalo antes de llamar: con él se consulta el estado. |
| `amount` | number | Monto sin propina, con decimales. En CLP debe ser entero (`1500` o `1500.00`). Rango: 1 a 1.000.000. |
| `tip` | number | Propina; por defecto `0`. Se cobra aparte del monto y se suma al total. No lleva impuesto: el ticket o la boleta se emiten solo por `amount`. Sí paga la comisión del adquirente, con el mismo porcentaje que la venta. |
| `cashback` | number | Vuelto: efectivo que el comercio le entrega al cliente y que se carga a la tarjeta junto con el monto; por defecto `0`. Igual que la propina, no lleva impuesto y sí paga la comisión del adquirente. Está disponible con todos los adquirentes; requiere una versión compatible de DTEx® y la opción Vuelto activa en el equipo. Si no está activa, responde `NOT_SUPPORTED` sin cobrar. |
| `currency` | string | Código ISO 4217. Esta versión solo acepta `CLP`. |
| `document` | string | Qué genera DTEx® después del cobro (ver la tabla siguiente); por defecto `ticket`. |
| `print` | bool | Si DTEx® imprime el documento; por defecto `false`. |

**Valores de `document`:**

| Valor | Qué hace | Con `print: false` |
|---|---|---|
| `none` | Solo el cobro. Tu app emite su propio documento. | `print` se ignora. |
| `ticket` | Ticket electrónico (tipo 0): comprobante del pago, sin valor tributario. Su número es un contador interno de DTEx®, sin validez ante el adquirente ni el SII. Valor por defecto. | Se emite sin imprimir. |
| `cl_sii_boleta` | Boleta electrónica (tipo 39). | Se emite sin imprimir. |
| `cl_sii_boleta_exenta` | Boleta exenta (tipo 41). | Se emite sin imprimir. |

Si pides un ticket o una boleta y el equipo no tiene folios de ese tipo, DTEx® intenta descargarlos; si no lo logra, responde `NO_FOLIO` **antes de cobrar**.

## Respuesta

DTEx® siempre responde `RESULT_OK` con el extra `response`, un JSON. Solo vas a recibir `RESULT_CANCELED` sin datos si el proceso de DTEx® muere en medio de la operación. En ese caso usa la [consulta de estado](#consulta-de-estado).

```json
{
  "version": 1,
  "request_id": "4f1c2b9e-6a0d-4a51-9c1e-2a7b0d3e8f11",
  "status": "APPROVED",
  "payment": {
    "acquirer": "Kushki",
    "auth_code": "123456",
    "last4": "****1234",
    "card_type": "credit",
    "sequence": "8f0a…",
    "ticket_number": "000123",
    "amount": 1500,
    "currency": "CLP"
  },
  "document": { "type": "cl_sii_boleta", "dte_type": 39, "folio": 4521, "printed": true }
}
```

| Campo | Cuándo viene |
|---|---|
| `status` | Siempre. Ver la tabla siguiente. |
| `error_code`, `error_message` | Cuando algo no salió bien. Puede venir junto con `APPROVED` (ver `DTE_FAILED`). |
| `payment` | Con `APPROVED`. `acquirer` es el adquirente que procesó el cobro: depende del equipo y de las reglas de Mufin, y puede sumar valores nuevos sin aviso. Guárdalo para conciliar, pero no lo uses para decidir si hubo cobro ni lo compares con una lista fija. `amount` es el total cargado a la tarjeta: `amount` + `tip` + `cashback` de la solicitud. |
| `document` | Con `APPROVED`, si se pidió un documento y se generó. |

**Valores de `status`:**

| `status` | Significado |
|---|---|
| `APPROVED` | El cobro se hizo. |
| `DECLINED` | El adquirente rechazó la tarjeta. No hubo cobro. |
| `CANCELED` | El cajero o el cliente canceló. No hubo cobro. |
| `ERROR` | No se pudo cobrar, o no se sabe si se cobró. Ver `error_code`. |

**Valores de `error_code`:**

| Código | ¿Hubo cobro? | Qué hacer |
|---|---|---|
| `INVALID_REQUEST` | No | Corrige la solicitud: JSON, versión, `request_id`, `document` o `print`. |
| `INVALID_AMOUNT` | No | `amount`, `tip` o `cashback` no son numéricos, tienen decimales en CLP o son negativos; `amount` también debe estar entre 1 y 1.000.000. |
| `UNSUPPORTED_CURRENCY` | No | Moneda distinta de CLP. |
| `NOT_AUTHORIZED` | No | Tu paquete no está autorizado en este equipo o el equipo no está en modo integración. Ver [Solicitar autorización](#solicitar-autorización). |
| `BUSY` | No | DTEx® está en otra venta o en otra solicitud. Reintenta en unos segundos con el mismo `request_id`. |
| `NOT_ACTIVATED` | No | El equipo no tiene un comercio activado, o su registro o activación están pendientes. Contacta a Mufin. |
| `NO_CONNECTION` | No | DTEx® no tiene internet ni datos del comercio guardados en el equipo. |
| `MERCHANT_NOT_ACTIVE` | No | El comercio fue dado de baja o su validación fue rechazada; DTEx® muestra el aviso y no emite. Contacta a Mufin. DTEx® revisa el estado del comercio en la sincronización diaria; sin conexión vale el último estado guardado, así que una baja reciente puede tardar hasta la próxima sincronización. |
| `NO_ACQUIRER` | No | El equipo no tiene cobro con tarjeta habilitado. |
| `NO_FOLIO` | No | No hay folios para el documento pedido. |
| `NOT_SUPPORTED` | No | El comercio exige el RUT del receptor en la boleta (esta versión no lo admite), o pediste `cashback` y el equipo no tiene el vuelto habilitado. |
| `TERMINAL_NOT_READY` | No | El terminal de pago no está listo para cobrar (configuración del adquirente). |
| `DECLINED` / `CANCELED` | No | El mensaje trae el detalle y el código del adquirente. |
| `INCOMPLETE` | **Desconocido** | Ese `request_id` quedó a medias en una ejecución anterior (ver Idempotencia). |
| `ACQUIRER_ERROR` | **Desconocido** | Falló la comunicación con el adquirente. Revisa el cobro antes de reintentar. |
| `DTE_FAILED` | **Sí** (viene con `APPROVED`) | El ticket o la boleta no se pudo emitir. No vuelvas a cobrar; emite el documento por tu cuenta. |

## Idempotencia

**Un `request_id` se procesa una sola vez.** Desde que DTEx® muestra la pantalla de cobro, ese `request_id` queda usado.

- Si lo repites cuando ya terminó, recibes la misma respuesta, sea cual sea su `status`, sin que se vuelva a cobrar.
- Para un cobro nuevo, por ejemplo después de un `DECLINED`, usa un `request_id` nuevo.
- Las solicitudes rechazadas antes de mostrar la pantalla no dejan el `request_id` usado y se pueden repetir tal cual. Son los errores de validación, `NOT_AUTHORIZED` y `BUSY`.
- Si repites un `request_id` que quedó a medias porque DTEx® murió en medio del cobro o de la emisión, la respuesta es `INCOMPLETE`. DTEx® no puede saber si la tarjeta se cobró: revisa con el adquirente antes de cobrar con otro `request_id`.
- Si quedó a medias antes de pedir la tarjeta (`preparing`), no hubo cobro y DTEx® lo procesa de nuevo.

## Consulta de estado

Si tu app murió mientras DTEx® cobraba (o recibiste `RESULT_CANCELED` sin datos), pregunta en qué quedó con la acción `dev.mufin.dtex.action.STATUS`.
- **Llamada:** también con `startActivityForResult`. Extra `request`: `{"version": 1, "request_id": "..."}`.
- **Cómo responde:** al instante, sin traer DTEx® al frente, aunque DTEx® esté cerrado.
- **Alcance:** solo devuelve las solicitudes creadas por tu misma app.

```json
{
  "version": 1,
  "request_id": "4f1c2b9e-6a0d-4a51-9c1e-2a7b0d3e8f11",
  "stage": "completed",
  "updated_at": "2026-10-22T15:04:11Z",
  "response": { "status": "APPROVED", "payment": { "…": "…" } }
}
```

**Valores de `stage`:**

| `stage` | Qué significa | Qué hacer |
|---|---|---|
| `not_found` | DTEx® no empezó a procesarla: no llegó, se rechazó antes de mostrar la pantalla, o salió de los últimos 50 registros. | Es seguro reintentar con el mismo `request_id`. |
| `preparing` | DTEx® la recibió y revisa adquirente y folios antes de pedir la tarjeta. | Esperar y volver a consultar. |
| `charging` | La tarjeta se está cobrando. | Esperar y volver a consultar. |
| `issuing_document` | Cobro aprobado; DTEx® está emitiendo o imprimiendo el documento. | Esperar y volver a consultar. |
| `completed` | Terminó. En `response` viene la respuesta completa, igual a la que habrías recibido. | Usar `response`. |
| `interrupted` | DTEx® murió a mitad de camino. En `last_stage` viene la etapa en la que quedó. | Ver la tabla siguiente. |

**Valores de `last_stage` en una solicitud `interrupted`:**

| `last_stage` | ¿Hubo cobro? |
|---|---|
| `preparing` | No. Puedes reintentar con el mismo `request_id`. |
| `charging` | **Desconocido.** Revisa con el adquirente. |
| `issuing_document` | **Sí.** El documento puede no haberse emitido. |

Si la consulta falla (por ejemplo, sin `request_id`), responde `{"status": "ERROR", "error_code": "INVALID_REQUEST", ...}`.

DTEx® conserva las últimas 50 solicitudes por equipo.

## Despertar DTEx®

Tu app es la que está siempre al frente, y Android puede cerrar DTEx® cuando lleva tiempo en segundo plano. Un cobro igual funciona con DTEx® cerrado, pero primero tiene que pasar por el arranque (y por el login, si la sesión venció) con el cliente esperando. Para evitarlo, despierta DTEx® antes.

- **Llamada:** acción `dev.mufin.dtex.action.WAKE_UP`, con `startActivityForResult`. No lleva extras.
- **Si DTEx® ya está listo:** responde al instante, sin pasar al frente.
- **Si no:** DTEx® pasa al frente, arranca, pide el login si hace falta y, al llegar a la pantalla principal, responde y tu app vuelve al frente.
- **Respuesta:** `{"version": 1, "status": "READY"}`. Si hay un cobro en curso, `{"status": "ERROR", "error_code": "BUSY", ...}`. Si el equipo no puede cobrar, `NOT_ACTIVATED`, `MERCHANT_NOT_ACTIVE` o `NO_CONNECTION`: DTEx® queda en la pantalla que explica el problema y tu app vuelve al frente con el error, sin quedar esperando.
- **No requiere** que tu paquete esté autorizado: no cobra ni entrega datos.

**Cuándo llamarlo:** si usas [Mantener DTEx® listo](#mantener-dtex-listo), solo cuando la conexión diga que no está listo. Si no, al iniciar tu app, al abrir caja o al empezar una venta, antes de que el cliente pague. No lo llames en `onResume`: la respuesta de DTEx® vuelve a disparar `onResume` y quedarías en un ciclo.

## Mantener DTEx® listo

Despertar DTEx® no basta si Android lo vuelve a cerrar mientras tu app está al frente: el P2 SE y otros terminales tienen poca memoria y cierran primero lo que está en segundo plano. Para evitarlo, conéctate a DTEx® mientras tu app esté visible.

- **Llamada:** `bindService` con la acción `dev.mufin.dtex.action.KEEP_ALIVE` y `BIND_AUTO_CREATE`. Conéctate en `onStart` y desconéctate en `onStop`.
- **Efecto:** Android le da a DTEx® la prioridad de tu app y no lo cierra por memoria, así que el cobro no pasa por el arranque.
- **Saber si DTEx® está listo, sin mostrarlo:** al conectar recibes un `IBinder`. La transacción `IBinder.FIRST_CALL_TRANSACTION` responde un `int`: `1` si DTEx® está listo para cobrar y `0` si no. La conexión levanta el proceso de DTEx® si estaba cerrado, pero no su pantalla principal; con `0`, llama a `WAKE_UP`.
- **Si DTEx® se cierra mientras estás conectado** (por ejemplo, porque falló): recibes `onServiceDisconnected`. Llama a `WAKE_UP` en ese momento, no en el próximo cobro.
- **Evita el ciclo:** si `WAKE_UP` no responde `READY` (equipo sin activar, comercio dado de baja, sin conexión), no lo vuelvas a llamar solo en cada conexión; espera una acción del operador.
- **No requiere** que tu paquete esté autorizado: no cobra ni entrega datos.
- **Android 11 o superior:** aquí `<queries>` es obligatorio (ver Requisitos). Sin él, Android no deja ver el servicio y `bindService` devuelve false.
- **Reemplaza** la llamada a `WAKE_UP` al iniciar tu app: la conexión ya lo resuelve.

```kotlin
private var autoDespertar = true // false si un WAKE_UP no respondió READY

private val keepAlive = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
        if (autoDespertar && !dtexListo(service)) despertar() // WAKE_UP
    }
    override fun onServiceDisconnected(name: ComponentName?) {
        if (autoDespertar) despertar()
    }
}

private fun dtexListo(service: IBinder?): Boolean {
    val data = Parcel.obtain()
    val reply = Parcel.obtain()
    return try {
        service?.transact(IBinder.FIRST_CALL_TRANSACTION, data, reply, 0) == true && reply.readInt() == 1
    } catch (e: RemoteException) {
        false
    } finally {
        data.recycle()
        reply.recycle()
    }
}

override fun onStart() {
    super.onStart()
    bindService(Intent("dev.mufin.dtex.action.KEEP_ALIVE").setPackage("dev.mufin.dtex"), keepAlive, BIND_AUTO_CREATE)
}

override fun onStop() {
    super.onStop()
    unbindService(keepAlive)
}
```

## Activar un equipo (emergencia)

Para el caso excepcional de un equipo que se instaló sin activar: tu app le indica a DTEx® a qué comercio pertenece y DTEx® lo asocia al instante.

- **Llamada:** acción `dev.mufin.dtex.action.ACTIVATE`, con `startActivityForResult`. Extra `request`: `{"version": 1, "commerce_rut": "77135262-6"}` (RUT con guion y dígito verificador; con o sin puntos).
- **Qué hace DTEx®:** envía al backend el RUT junto con lo que el equipo sabe con certeza (serie, marca, modelo y versión de la app) y el paquete de tu app, que queda registrado. Luego repite el arranque hasta la pantalla principal.
- **No requiere** lista autorizada ni modo integración: un equipo sin activar todavía no tiene perfil.
- **Datos del chip:** DTEx® no los envía. Se asignan desde el dashboard.

`ACTIVATED` y `ALREADY_ACTIVE` traen el terminal y la fecha de alta del equipo:

```json
{"version": 1, "status": "ACTIVATED", "tid": "30054774", "activated_at": "2026-10-23T13:13:30Z"}
```

`activated_at` va en ISO 8601 UTC y puede venir `null` si DTEx® aún no la conoce.

| `status` / `error_code` | Cuándo |
|---|---|
| `ACTIVATED` | El equipo quedó asociado y llegó a la pantalla principal. |
| `ALREADY_ACTIVE` | El equipo ya estaba activo. |
| `MERCHANT_NOT_FOUND` | El RUT no está registrado en DTEx®. |
| `MERCHANT_NOT_ACTIVE` | El comercio existe pero no está activo. |
| `MERCHANT_WITHOUT_HEADQUARTERS` | El comercio no tiene casa matriz y el equipo no tiene dónde quedar. Se corrige en el dashboard. |
| `SERIAL_IN_OTHER_MERCHANT` | El equipo pertenece a otro comercio. No se reasigna desde aquí: se hace en el dashboard. |
| `INVALID_REQUEST` | Falta `commerce_rut`. |
| `NO_CONNECTION` | DTEx® no pudo conectarse con el servidor. |
| `VALIDATION_ERROR` | El RUT u otro dato no es válido; `error_message` trae el detalle. |
| `ACTIVATION_FAILED` | Error sin código conocido (por ejemplo, servidor no disponible); `error_message` trae el detalle. |

## Descargar folios

Tu app puede pedirle a DTEx® que descargue folios de un tipo de documento (ticket electrónico, boleta o boleta exenta), por ejemplo al abrir caja o cuando quedan pocos. DTEx® descarga en segundo plano, sin pasar al frente, y responde cuántos folios quedan disponibles.

- **Llamada:** acción `dev.mufin.dtex.action.DOWNLOAD_FOLIOS`, con `startActivityForResult` y el extra `request`:

```json
{"version": 1, "document": "ticket"}
```

- **`document`:** `ticket` (ticket electrónico, tipo 0), `cl_sii_boleta` (tipo 39) o `cl_sii_boleta_exenta` (tipo 41). Son los mismos nombres del cobro. Otro valor responde `INVALID_REQUEST`.
  - `ticket` es el más común, porque es el documento que DTEx® emite por defecto en cada cobro.
- **Respuesta:** `{"version": 1, "status": "OK", "document": "ticket", "available": 120}`. `available` cuenta los folios disponibles después de descargar; si el backend no entregó nuevos (o no hubo conexión), es lo que ya había en el equipo.
- **Errores:** `NOT_AUTHORIZED` si tu paquete no está autorizado, `BUSY` si DTEx® está emitiendo o cobrando, y `NOT_ACTIVATED`, `MERCHANT_NOT_ACTIVE` o `NO_CONNECTION` si el equipo no puede operar.
- **Si DTEx® no está listo** (cerrado o en el arranque), pasa al frente, arranca y descarga al llegar a la pantalla principal. Con [Mantener DTEx® listo](#mantener-dtex-listo) esto no ocurre.
- **Mientras descarga**, tu app sigue visible pero no recibe toques (DTEx® deja una actividad transparente encima, como en las demás acciones). Suele tardar unos segundos.

No hace falta llamarla antes de cada boleta: si al cobrar no hay folios, DTEx® los descarga solo y, si aun así no hay, responde `NO_FOLIO` sin cobrar.

## Abrir la Configuración de DTEx®

Tu app puede llevar al operador directo a la Configuración de DTEx® (venta exprés, propina, copias de impresión, documento por defecto, folios, etc.) con la acción `dev.mufin.dtex.action.SETTINGS`.

- **Llamada:** con `startActivityForResult`. No lleva extras.
- **Requiere** que tu paquete esté autorizado, igual que el cobro.
- **Qué pasa:** DTEx® pasa al frente con la Configuración abierta. Cuando el operador sale, tu app vuelve al frente.
- **Actualizar datos:** abierta desde tu app, la Configuración trae arriba la opción *Actualizar datos*. Vuelve a descargar los datos del comercio, los folios y la configuración del equipo, igual que *Empresa › Actualizar* dentro de DTEx®.
- **Descargar folios:** también arriba, por si el equipo se queda sin folios. Abre la pantalla de folios de DTEx®: muestra cuántos quedan de cada tipo (boleta, boleta exenta y ticket) y descarga el tipo que elija el operador.
- **Respuesta:** `{"version": 1, "status": "OK"}`. Errores posibles: `NOT_AUTHORIZED`, `BUSY` (DTEx® en medio de una venta), `NOT_ACTIVATED`, `MERCHANT_NOT_ACTIVE` o `NO_CONNECTION`.
- La Configuración se protege igual que cuando se entra desde el menú de DTEx®.

## Ejemplos

Los tres ejemplos hacen lo mismo:
1. Generan y guardan el `request_id`.
2. Piden el cobro.
3. Si no llega respuesta, consultan el estado.
4. Despiertan DTEx® antes de la venta.

### Java (Android nativo)

```java
public class CajaActivity extends AppCompatActivity {
    private static final String DTEX = "dev.mufin.dtex"; // TUU Pro 2: dev.mufin.dtex.tuu_pro2

    private String requestId; // Persístelo (SharedPreferences/DB) antes de llamar.

    private final ActivityResultLauncher<Intent> cobro = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), r -> {
                String json = r.getData() == null ? null : r.getData().getStringExtra("response");
                if (json == null) {
                    consultarEstado(); // DTEx® murió a mitad de camino.
                    return;
                }
                procesar(json);
            });

    private final ActivityResultLauncher<Intent> estado = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), r -> {
                try {
                    JSONObject s = new JSONObject(r.getData().getStringExtra("response"));
                    switch (s.getString("stage")) {
                        case "completed": procesar(s.getJSONObject("response").toString()); break;
                        case "not_found": /* Seguro reintentar con el mismo requestId. */ break;
                        case "interrupted": /* Mirar s.getString("last_stage"). */ break;
                        default: /* En curso: volver a consultar en unos segundos. */
                    }
                } catch (JSONException e) { /* ... */ }
            });

    void cobrar(long monto) throws JSONException {
        requestId = UUID.randomUUID().toString();
        JSONObject request = new JSONObject()
                .put("version", 1)
                .put("request_id", requestId)
                .put("amount", monto)
                .put("tip", 0)
                .put("currency", "CLP")
                .put("document", "cl_sii_boleta")
                .put("print", true);
        cobro.launch(new Intent("dev.mufin.dtex.action.PAYMENT")
                .setPackage(DTEX)
                .putExtra("request", request.toString()));
    }

    private final ActivityResultLauncher<Intent> despertar = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), r -> { /* {"status":"READY"} */ });

    void despertarDtex() { // Al abrir caja o al empezar una venta.
        despertar.launch(new Intent("dev.mufin.dtex.action.WAKE_UP").setPackage(DTEX));
    }

    void consultarEstado() {
        try {
            JSONObject request = new JSONObject().put("version", 1).put("request_id", requestId);
            estado.launch(new Intent("dev.mufin.dtex.action.STATUS")
                    .setPackage(DTEX)
                    .putExtra("request", request.toString()));
        } catch (JSONException e) { /* ... */ }
    }

    void procesar(String json) {
        try {
            JSONObject response = new JSONObject(json);
            if ("APPROVED".equals(response.getString("status"))) {
                JSONObject payment = response.getJSONObject("payment");
                JSONObject document = response.optJSONObject("document");
                // ...
            } else {
                String errorCode = response.optString("error_code");
                // ...
            }
        } catch (JSONException e) { /* ... */ }
    }
}
```

### Flutter

Flutter no trae una forma de recibir el resultado de otra Activity con sus extras. Se resuelve con un `MethodChannel` y unas pocas líneas en la `MainActivity` de tu app.

**`android/app/src/main/kotlin/.../MainActivity.kt`:**

```kotlin
class MainActivity : FlutterActivity() {
    private var pendiente: MethodChannel.Result? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "mi_app/dtex")
            .setMethodCallHandler { call, result ->
                val action = when (call.method) {
                    "payment" -> "dev.mufin.dtex.action.PAYMENT"
                    "status" -> "dev.mufin.dtex.action.STATUS"
                    "wake_up" -> "dev.mufin.dtex.action.WAKE_UP"
                    else -> return@setMethodCallHandler result.notImplemented()
                }
                pendiente = result
                val intent = Intent(action)
                    .setPackage(call.argument<String>("package"))
                    .putExtra("request", call.argument<String>("request"))
                @Suppress("DEPRECATION")
                startActivityForResult(intent, REQ_DTEX)
            }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != REQ_DTEX) return
        pendiente?.success(data?.getStringExtra("response")) // null = sin respuesta
        pendiente = null
    }

    companion object { const val REQ_DTEX = 4242 }
}
```

**Dart:**

```dart
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';

class Dtex {
  static const _channel = MethodChannel('mi_app/dtex');
  static const _package = 'dev.mufin.dtex'; // TUU Pro 2: dev.mufin.dtex.tuu_pro2

  /// Devuelve la respuesta de DTEx®, o null si DTEx® murió a mitad de camino.
  /// Guarda [requestId] antes de llamar para poder consultar el estado.
  static Future<Map<String, dynamic>?> cobrar({
    required String requestId,
    required int amount,
    int tip = 0,
    String document = 'cl_sii_boleta',
    bool print = true,
  }) async {
    final raw = await _channel.invokeMethod<String>('payment', {
      'package': _package,
      'request': jsonEncode({
        'version': 1,
        'request_id': requestId,
        'amount': amount,
        'tip': tip,
        'currency': 'CLP',
        'document': document,
        'print': print,
      }),
    });
    return raw == null ? null : jsonDecode(raw) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> estado(String requestId) async {
    final raw = await _channel.invokeMethod<String>('status', {
      'package': _package,
      'request': jsonEncode({'version': 1, 'request_id': requestId}),
    });
    return jsonDecode(raw!) as Map<String, dynamic>;
  }

  /// Llámalo al abrir caja o al empezar una venta. Responde {"status": "READY"}.
  static Future<Map<String, dynamic>?> despertar() async {
    final raw = await _channel.invokeMethod<String>('wake_up', {'package': _package});
    return raw == null ? null : jsonDecode(raw) as Map<String, dynamic>;
  }
}

// Uso
final requestId = const Uuid().v4(); // persístelo antes de cobrar
final r = await Dtex.cobrar(requestId: requestId, amount: 1500);
if (r == null) {
  final s = await Dtex.estado(requestId);
  if (s['stage'] == 'completed') { /* s['response'] */ }
} else if (r['status'] == 'APPROVED') {
  /* r['payment'], r['document'] */
}
```

### React Native

Igual que en Flutter, se necesita un módulo nativo pequeño que lance la Activity y devuelva el extra `response` como una `Promise`.

**`android/app/src/main/java/.../DtexModule.kt`:**

```kotlin
class DtexModule(private val ctx: ReactApplicationContext) :
    ReactContextBaseJavaModule(ctx), ActivityEventListener {

    private var pendiente: Promise? = null

    init { ctx.addActivityEventListener(this) }

    override fun getName() = "Dtex"

    @ReactMethod
    fun payment(pkg: String, request: String, promise: Promise) =
        launch("dev.mufin.dtex.action.PAYMENT", pkg, request, promise)

    @ReactMethod
    fun status(pkg: String, request: String, promise: Promise) =
        launch("dev.mufin.dtex.action.STATUS", pkg, request, promise)

    @ReactMethod
    fun wakeUp(pkg: String, promise: Promise) =
        launch("dev.mufin.dtex.action.WAKE_UP", pkg, null, promise)

    private fun launch(action: String, pkg: String, request: String?, promise: Promise) {
        val activity = currentActivity ?: return promise.reject("NO_ACTIVITY", "Sin Activity")
        pendiente = promise
        val intent = Intent(action).setPackage(pkg).putExtra("request", request)
        activity.startActivityForResult(intent, REQ_DTEX)
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode != REQ_DTEX) return
        pendiente?.resolve(data?.getStringExtra("response")) // null = sin respuesta
        pendiente = null
    }

    override fun onNewIntent(intent: Intent) {}

    companion object { const val REQ_DTEX = 4242 }
}

class DtexPackage : ReactPackage {
    override fun createNativeModules(ctx: ReactApplicationContext) = listOf(DtexModule(ctx))
    override fun createViewManagers(ctx: ReactApplicationContext) = emptyList<ViewManager<*, *>>()
}
// Registrar DtexPackage() en getPackages() de MainApplication.
```

**JavaScript / TypeScript:**

```ts
import { NativeModules } from 'react-native';
import { v4 as uuid } from 'uuid';

const { Dtex } = NativeModules;
const DTEX = 'dev.mufin.dtex'; // TUU Pro 2: dev.mufin.dtex.tuu_pro2

export async function cobrar(requestId: string, amount: number) {
  const raw: string | null = await Dtex.payment(DTEX, JSON.stringify({
    version: 1,
    request_id: requestId,
    amount,
    tip: 0,
    currency: 'CLP',
    document: 'cl_sii_boleta',
    print: true,
  }));
  return raw ? JSON.parse(raw) : null; // null = DTEx® murió a mitad de camino
}

export async function estado(requestId: string) {
  const raw: string = await Dtex.status(DTEX, JSON.stringify({ version: 1, request_id: requestId }));
  return JSON.parse(raw);
}

// Llámalo al abrir caja o al empezar una venta. Responde { status: 'READY' }.
export async function despertar() {
  const raw: string | null = await Dtex.wakeUp(DTEX);
  return raw ? JSON.parse(raw) : null;
}

// Uso
const requestId = uuid(); // persístelo antes de cobrar
const r = await cobrar(requestId, 1500);
if (r === null) {
  const s = await estado(requestId);
  if (s.stage === 'completed') { /* s.response */ }
} else if (r.status === 'APPROVED') {
  /* r.payment, r.document */
}
```

En [github.com/morello-cl/dtex_app2app_demo](https://github.com/morello-cl/dtex_app2app_demo) hay una app Android completa, con licencia MIT, para probar la integración en un terminal: cobro, reintento, consulta de estado, `WAKE_UP`, `KEEP_ALIVE`, activación, descarga de folios y configuración.

## Solicitar autorización

Para cobrar, descargar folios y abrir la Configuración, el paquete Android debe estar autorizado y cada equipo debe tener habilitado el modo integración. Solicita la habilitación en https://www.dtex.cl/contacto e indica:

- El nombre de tu app y su paquete Android (por ejemplo, `cl.miempresa.caja`).
- El comercio o los comercios donde se usará (RUT).
- Los equipos que trabajarán con tu app, si ya los conoces.
