# Contrato Tomahawk — carga de saldo de servicios

Este documento es el contrato de implementación que se debe entregar al equipo de
Tomahawk. Define los endpoints que DTEx consumirá y las responsabilidades de Tomahawk
al crear y confirmar pagos con Mercado Pago.

La web `dtex.cl/pay-services/{uuid}` no crea pagos ni acredita saldo por sí sola.
Consulta una intención inmutable en Tomahawk y solicita una URL de Checkout Pro.
Tomahawk conserva la responsabilidad sobre monto, idempotencia, webhook y abono.

Base por defecto: `https://api.dtex.app/api/pay-services/v1`.
La web puede enviar `x-api-key: DTEX_PAYMENTS_API_KEY` desde el servidor; la key
nunca se expone al navegador.

## GET `/:uuid`

```json
{
  "error": false,
  "data": {
    "uuid": "0f905cce-e6ee-4c5e-938d-52797c61f235",
    "status": "ready",
    "amount": 20000,
    "commerce": { "name": "Almacén Versalles" },
    "expiresAt": "2026-08-10T23:59:59.000Z"
  }
}
```

- `amount` es un entero positivo en CLP y corresponde al saldo que recibirá el comercio.
- Estados: `ready`, `pending`, `processing`, `paid`, `expired`, `cancelled`.
- `404` para UUID inexistente; `410` puede usarse para una intención expirada.
- No incluir RUT, email, teléfono ni otros datos privados: la URL es pública para quien la posea.
- El costo mostrado es `round(amount × 0,06 × 1,19)` y el total es `amount + costo`.

## POST `/:uuid/checkout`

Body vacío (`{}`). Tomahawk vuelve a leer el monto de la intención; no acepta un monto
enviado por el navegador.

```json
{
  "error": false,
  "data": {
    "url": "https://www.mercadopago.cl/checkout/v1/redirect?pref_id=..."
  }
}
```

La creación debe ser idempotente por UUID y rechazar con `409` una intención pagada,
expirada o que ya esté procesándose. La preferencia cobra `amount + costo` y usa el UUID
como `external_reference`/metadata. La web solo acepta URLs HTTPS de los dominios
`mercadopago.cl` y `mercadopago.com` (incluidos sus subdominios).

## Confirmación

El webhook de Mercado Pago debe:

1. validar firma y consultar el pago en Mercado Pago;
2. comprobar moneda, monto y `external_reference` contra la intención persistida;
3. registrar el `payment_id` con restricción única;
4. acreditar `amount` (sin el costo de servicio) mediante un movimiento
   `deposito_comercio` en el ledger Sencillito, dentro de una operación idempotente;
5. cambiar la intención a `paid` solo después de acreditar el saldo.

La preferencia de Mercado Pago debe configurar:

```json
{
  "back_urls": {
    "success": "https://www.dtex.cl/pay-services/{uuid}/success",
    "failure": "https://www.dtex.cl/pay-services/{uuid}/failure",
    "pending": "https://www.dtex.cl/pay-services/{uuid}/success"
  },
  "auto_return": "approved"
}
```

- `/success` muestra el pago acreditado, en proceso o aún sin confirmar según el estado
  consultado en Tomahawk.
- `/failure` informa que el pago no se completó y permite reintentarlo. Si el webhook ya
  confirmó el pago, muestra éxito para evitar un falso fracaso.
- Ninguna pantalla considera pagado un monto basándose en la URL ni en los query params
  enviados por Mercado Pago; Tomahawk y su webhook son la fuente de verdad.
