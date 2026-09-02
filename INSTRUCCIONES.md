# Seguimiento Físico — Guía de instalación

Esta app queda funcionando en internet, con login por contraseña, y los datos
guardados en la nube (Supabase). La puedes abrir desde tu celular, tablet o PC
con la misma URL, y agregarla a la pantalla de inicio del celular como si
fuera una app nativa.

Vas a necesitar crear **dos cuentas gratuitas**: Supabase (la base de datos)
y Vercel (donde vive la página web). Ninguna pide tarjeta de crédito para el
plan gratuito.

---

## Parte 1 — Crear la base de datos en Supabase

1. Entra a **https://supabase.com** y crea una cuenta gratis (con tu correo o Google).
2. Click en **"New project"**.
   - Nombre: el que quieras, ej. `seguimiento-fisico`.
   - Contraseña de base de datos: genera una y **guárdala** (no la necesitarás
     seguido, pero consérvala).
   - Región: la más cercana a Chile (ej. São Paulo).
3. Espera 1-2 minutos a que el proyecto termine de crearse.
4. En el menú lateral, ve a **SQL Editor** → **New query**.
5. Abre el archivo `supabase-schema.sql` (incluido en esta carpeta), copia
   todo su contenido, pégalo en el editor, y click en **Run**.
   - Esto crea la tabla donde se guardan tus datos, y las reglas de seguridad
     para que nadie más pueda verlos.
6. Ve a **Project Settings** (ícono de engranaje) → **API**.
   - Copia el valor de **Project URL** → lo vas a pegar como `VITE_SUPABASE_URL`.
   - Copia el valor de **anon public** (una clave larga) → lo vas a pegar como
     `VITE_SUPABASE_ANON_KEY`.

### Crear tu usuario (para el login)

7. Ve a **Authentication** → **Users** → **Add user** → **Create new user**.
   - Ingresa tu correo y una contraseña.
   - Marca "Auto Confirm User" si aparece la opción (así no necesitas
     confirmar por correo).
8. (Recomendado, seguridad extra) Ve a **Authentication** → **Providers** →
   **Email**, y desactiva **"Allow new users to sign up"**. Así, aunque
   alguien encuentre la URL de tu app, no podrá crear una cuenta nueva —
   solo tú puedes entrar, con el usuario que creaste en el paso 7.

---

## Parte 2 — Configurar el proyecto

1. Abre el archivo `.env.example` de esta carpeta, y guárdalo como `.env`
   (mismo contenido, solo cambia el nombre — quitando el `.example`).
2. Reemplaza los valores con los que copiaste en el paso 6:
   ```
   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

---

## Parte 3 — Subir la app a Vercel (para tener una URL)

**Opción A — Sin usar la terminal (más simple):**

1. Sube esta carpeta completa a una cuenta de **GitHub** (crea un repositorio
   nuevo y arrastra los archivos, o usa GitHub Desktop si prefieres algo
   visual).
2. Entra a **https://vercel.com**, crea una cuenta gratis (puedes usar tu
   cuenta de GitHub para entrar directo).
3. Click en **"Add New" → "Project"**, y selecciona el repositorio que subiste.
4. Antes de darle a "Deploy", abre la sección **"Environment Variables"** y
   agrega las dos variables:
   - `VITE_SUPABASE_URL` → tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` → tu clave anon
5. Click en **Deploy**. En 1-2 minutos te da una URL tipo
   `seguimiento-fisico.vercel.app`.

**Opción B — Con terminal (si te sientes cómodo):**

```bash
npm install -g vercel
cd seguimiento-fisico        # esta carpeta
npm install
vercel
```
Sigue las preguntas en pantalla; cuando pregunte por variables de entorno,
pega las mismas dos de arriba. Al final te entrega la URL.

---

## Parte 4 — Usarla desde el celular

1. Abre la URL que te dio Vercel en Chrome o Safari del celular.
2. Entra con el correo/contraseña que creaste en el paso 7 de Supabase.
3. Menú del navegador → **"Agregar a pantalla de inicio"** (Android) o
   **"Compartir" → "Agregar a inicio"** (iPhone).
4. Queda como un ícono más en tu celular, se abre a pantalla completa.

Puedes repetir esto en cualquier otro dispositivo (tablet, PC) con la misma
URL y el mismo login — los datos son los mismos porque viven en Supabase, no
en el dispositivo.

---

## ¿Y si quiero probarlo en mi computador antes de subirlo?

```bash
npm install
npm run dev
```
Abre la URL que aparece (típicamente `http://localhost:5173`) en tu navegador.
Necesitas tener el archivo `.env` ya configurado (Parte 2) para que funcione.

---

## Preguntas frecuentes

**¿Cuánto cuesta esto?** Nada, mientras te mantengas en los planes gratuitos
de Supabase y Vercel — de sobra para el uso de un solo profesional con
decenas o cientos de deportistas.

**¿Puedo agregar más usuarios (otros evaluadores) más adelante?** Sí — cada
fila de datos queda ligada al usuario que la creó (gracias a las reglas de
seguridad del paso 5), así que si más adelante creas más usuarios en
Supabase, cada uno vería solo sus propias fichas, a menos que decidamos
cambiar esa regla para compartir datos entre evaluadores.

**¿Qué pasa si olvido mi contraseña?** Entra a Supabase → Authentication →
Users → busca tu usuario → puedes resetear la contraseña ahí directamente.
