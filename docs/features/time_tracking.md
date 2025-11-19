# Módulo 5: Time Tracking & Rentabilidad

## 📋 Descripción General
Este módulo tiene como objetivo fundamental permitir al freelancer conocer el valor real de su tiempo y maximizar la rentabilidad de sus proyectos. No se trata solo de contar horas, sino de entender cómo se invierten y qué retorno generan.

## 🛠️ Especificaciones Técnicas de Implementación

**Ubicación del Código:**
El código fuente de este módulo debe residir estrictamente en la siguiente estructura de directorios:

```
src/features/time-tracking/
├── pages/       # Componentes de página (vistas completas)
├── components/  # Componentes reutilizables específicos del módulo
└── api/         # Lógica de comunicación con el backend y gestión de datos
```

### 5.4. Componentes UI
*   **TimerWidget:** Un componente visual interactivo que mostrará el cronómetro activo, el proyecto/tarea actual, y botones para iniciar/pausar/detener el registro de tiempo. Deberá ser accesible desde cualquier parte de la aplicación (ej. en la cabecera o una barra lateral) para una interacción rápida.

## 🌟 Funcionalidades Clave

### 5.1. Cronómetro Contextual
El sistema debe ofrecer herramientas para facilitar el registro del tiempo con la menor fricción posible.

*   **Detección de Contexto (Futuro/Desktop):** Capacidad para detectar la aplicación activa (ej. VS Code, Figma) y sugerir la asignación de tiempo al proyecto correspondiente.
*   **Entrada Manual Rápida:** Interfaz optimizada para registrar bloques de tiempo rápidamente (ej. "1h 30m en Reunión Cliente X") sin necesidad de navegar por múltiples menús.
*   **Persistencia del Estado:**
    *   **Local Storage/IndexedDB:** Utilizar el almacenamiento local del navegador (Local Storage o IndexedDB) para guardar el estado del cronómetro (tiempo transcurrido, proyecto asociado, tarea) en tiempo real. Esto asegura que, si el usuario cierra la pestaña o el navegador, al regresar, el cronómetro pueda reanudarse desde el último estado guardado.
    *   **Sincronización con Backend:** En intervalos regulares o al detectar un evento de `beforeunload`, sincronizar el estado del cronómetro con el backend para una persistencia robusta y acceso multi-dispositivo.

### 5.2. Calculadora de Rentabilidad en Tiempo Real
Monitorización continua de la salud financiera del proyecto basada en el tiempo invertido vs. el presupuesto.

*   **Cálculo Dinámico:**
    *   *Inputs:* Presupuesto Total (ej. 2.000€), Horas Estimadas (ej. 20h), Precio Hora Objetivo (ej. 100€/h).
    *   *Proceso:* Comparación en tiempo real del tiempo registrado.
    *   **Algoritmo de Rentabilidad:** La rentabilidad se calculará como `(Ingresos Totales del Proyecto - (Horas Registradas en el Proyecto * Coste por Hora del Freelancer))`. El "Coste por Hora del Freelancer" puede ser un valor configurado por el usuario o estimado por el sistema.
*   **Alertas de Desviación:**
    *   El sistema debe alertar proactivamente si la rentabilidad cae.
    *   *Ejemplo:* "¡Peligro! Llevas 15 horas (75% del tiempo estimado) pero el progreso es del 50%. Tu precio hora real está bajando a 60€".

### 5.3. Reportes de Productividad
Análisis de datos para optimizar los hábitos de trabajo del freelancer.

*   **Patrones de Eficiencia:** Identificación de momentos de alta productividad (ej. "Eres más productivo los martes por la mañana").
*   **Análisis de Distribución:** Desglose del tiempo invertido en diferentes tipos de tareas (ej. "Las reuniones te consumen el 40% de la semana").
