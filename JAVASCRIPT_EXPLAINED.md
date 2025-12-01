# Introducción a JavaScript

JavaScript (comúnmente abreviado como JS) es un lenguaje de programación interpretado, ligero y orientado a objetos con funciones de primera clase. Es conocido principalmente como el lenguaje de scripting para páginas web, pero también se utiliza en muchos entornos fuera del navegador, como Node.js, Apache CouchDB y Adobe Acrobat.

## Historia Breve
Fue creado por Brendan Eich en 1995 mientras trabajaba en Netscape Communications. Inicialmente se llamó Mocha, luego LiveScript, y finalmente JavaScript.

## Características Principales

1.  **Tipado Débil y Dinámico:** No es necesario declarar el tipo de dato de una variable, y este puede cambiar durante la ejecución.
2.  **Multiparadigma:** Soporta estilos de programación orientada a eventos, funcional e imperativa (incluyendo orientada a objetos basada en prototipos).
3.  **Ejecución del lado del cliente (Navegador):** Originalmente diseñado para ejecutarse en navegadores web para crear interactividad.
4.  **Ejecución del lado del servidor (Node.js):** Ahora es ampliamente usado en el backend gracias al entorno de ejecución Node.js.

## Sintaxis Básica

### Variables
En JavaScript moderno (ES6+), se utilizan `let` y `const`. `var` es la forma antigua.

```javascript
let nombre = "Carlos"; // Variable que puede cambiar
const edad = 30;       // Constante, no puede reasignarse
var antiguo = "uso no recomendado";
```

### Tipos de Datos
*   **Primitivos:** String, Number, Boolean, Null, Undefined, Symbol, BigInt.
*   **Objetos:** Object, Array, Function, Date, etc.

### Funciones

```javascript
// Función tradicional
function saludar(nombre) {
    return "Hola " + nombre;
}

// Arrow Function (ES6)
const sumar = (a, b) => a + b;
```

### Estructuras de Control

```javascript
if (edad > 18) {
    console.log("Es mayor de edad");
} else {
    console.log("Es menor de edad");
}

for (let i = 0; i < 5; i++) {
    console.log(i);
}
```

## Manipulación del DOM
El DOM (Document Object Model) es la representación del HTML que JavaScript puede modificar.

```javascript
// Seleccionar un elemento
const boton = document.getElementById('miBoton');

// Agregar un evento
boton.addEventListener('click', () => {
    alert('¡Hiciste clic!');
});
```

## Asincronía
JavaScript maneja operaciones largas (como pedir datos a un servidor) sin bloquear el hilo principal usando Promesas y Async/Await.

```javascript
async function obtenerDatos() {
    try {
        const respuesta = await fetch('https://api.ejemplo.com/datos');
        const datos = await respuesta.json();
        console.log(datos);
    } catch (error) {
        console.error("Error:", error);
    }
}
```

## Ecosistema Moderno
JavaScript ha crecido enormemente:
*   **Frontend:** React, Vue, Angular, Svelte.
*   **Backend:** Node.js, Express, NestJS.
*   **Herramientas:** TypeScript (JS con tipos estáticos), Webpack, Vite.

---
*Este documento es una breve introducción. JavaScript es un lenguaje vasto y poderoso.*
