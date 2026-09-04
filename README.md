# Pruebas Automatizadas — Componentes de Producto y Carrito

Este repositorio contiene pruebas unitarias/de integración escritas con **Vitest** y **React Testing Library** para tres componentes de una aplicación de comercio (farmacia/tienda) construida en React.

## 📁 Archivos incluidos

| Archivo | Componente probado | Ficha técnica |
|---|---|---|
| `CarritoTabla.test.jsx` | `CarritoTabla.jsx` | TC-AUTO-010 |
| `ProductoForm.test.jsx` | `ProductoForm.jsx` | TC-AUTO-009 |
| `ProductoCard.test.jsx` | `ProductoCard.jsx` | TC-AUTO-008 |

## 🧪 Descripción de los casos de prueba

### `CarritoTabla.test.jsx` — TC-AUTO-010
Prueba el componente que muestra la tabla del carrito de compras.

- **TC-AUTO-010**: Verifica que los productos del carrito se listen correctamente y que el subtotal por ítem y el total general se calculen bien (ej. cantidad `2` × precio `Q10` = subtotal `Q20`, total `Q20.00`).
- **TC-AUTO-010b**: Verifica que al hacer clic en el botón "Eliminar" se dispare la llamada `axios.delete` al endpoint `/carrito/eliminar` con el `id_cliente` e `id_producto` correctos.

> **Nota:** la ficha original mencionaba un botón "+" para incrementar cantidad, pero el componente real no lo implementa (solo lista, calcula el total y permite eliminar). El caso se ajustó al comportamiento real del componente.

Mocks utilizados: `axios` y el hook `useAuth` del contexto de autenticación de cliente (`AuthContextCli`).

### `ProductoForm.test.jsx` — TC-AUTO-009
Prueba el formulario de creación/edición de productos.

- **TC-AUTO-009**: Verifica que el formulario **no** se envíe si faltan campos obligatorios, mostrando un `window.alert('Nombre es requerido')` y sin invocar `onSubmit`.
- **TC-AUTO-009b**: Verifica que, completando nombre, descripción, precio unitario, categoría y proveedor, el formulario se envíe correctamente (`onSubmit` se llama una vez y no se dispara ningún `alert`).

> **Nota:** los `<input required>` nativos del navegador interceptan el envío por clic antes de llegar a la validación del componente, por lo que el primer caso dispara el evento `submit` directamente sobre el `<form>` para poder ejercitar la lógica de `handleSubmit()`.

Mocks utilizados: `axios` (para la carga de proveedores) y `useAuth` del contexto de autenticación general (`AuthContext`).

### `ProductoCard.test.jsx` — TC-AUTO-008
Prueba la tarjeta individual de producto usada en el catálogo.

- **TC-AUTO-008**: Verifica que se muestre correctamente la información del producto (nombre y precio) y que al hacer clic en el botón "Agregar" se dispare el callback `onAgregar` exactamente una vez.

## 🛠️ Tecnologías

- [Vitest](https://vitest.dev/) — corredor de pruebas
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) — renderizado y consultas del DOM
- [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) — simulación de interacciones de usuario
- `vi.mock` — mocking de `axios` y de los contextos de autenticación

## ▶️ Cómo ejecutar las pruebas

```bash
# Instalar dependencias
npm install

# Ejecutar todas las pruebas
npx vitest run

# Ejecutar en modo watch
npx vitest

# Ejecutar un archivo específico
npx vitest run src/components/CarritoTabla.test.jsx
```

> Ajusta las rutas según la ubicación real de los archivos de prueba dentro de tu proyecto (los `import` de cada test asumen una estructura de carpetas específica, por ejemplo `../context/AuthContextCli` o `../../../../context/AuthContext`).

## 📋 Requisitos previos

- Node.js 18+
- Dependencias de testing instaladas en el proyecto:

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

- Configuración de Vitest con entorno `jsdom` (en `vite.config.js` o `vitest.config.js`):

```js
export default {
  test: {
    environment: 'jsdom',
  },
}
```

## 📌 Notas generales

- Todos los tests usan `vi.clearAllMocks()` en `beforeEach` para evitar interferencia entre casos.
- Las llamadas HTTP están completamente mockeadas (no se realizan peticiones reales).
- Las fichas técnicas (TC-AUTO-008, 009, 010) referencian un informe técnico externo con los casos de prueba originales; los comentarios en cada archivo documentan los ajustes hechos frente al comportamiento real de los componentes.
