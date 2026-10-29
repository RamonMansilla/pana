# Fila Fácil · Panadería

Primera versión PWA de una app para reservar pan y retirarlo sin hacer fila. La demo funciona sin credenciales: la vista Cliente y la vista Comercio comparten el mismo pedido usando `localStorage`.

## Flujo implementado

- Cliente: agenda → elige kilos rápidos o una fracción → define el tiempo aproximado → revisa → reserva/pago simulado → recibe código.
- Comercio: cambia a la vista Comercio y presiona **Pedido embolsado · Marcar como listo**.
- Cliente: recibe una notificación en pantalla y un contador de 15 minutos para retirar.
- El pago en línea es solo una simulación; nunca se almacenan datos de tarjeta ni se afirma un pago real.

## Ejecutar localmente

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Supabase y Vercel

1. Crea un proyecto en Supabase y ejecuta `supabase/migrations/001_initial.sql` en el SQL Editor.
2. Cuando se conecte la app, agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en las variables de entorno de Vercel. No incluyas claves secretas en el navegador.
3. Activa Supabase Auth para el personal del comercio y reemplaza las políticas de prueba por políticas vinculadas al usuario/rol del comercio antes de producción.
4. Para notificaciones fuera de la pantalla abierta, añadir Web Push o WhatsApp/SMS con consentimiento explícito. Esta demo usa notificación dentro de la app.

La integración externa y el despliegue no se ejecutan hasta contar con el proyecto, credenciales y confirmación correspondientes.
