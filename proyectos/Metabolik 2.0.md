
Metabolik 2.0: Especificación Técnica y Hoja de Ruta para el Agente de Intervención Molecular


1. Resumen Ejecutivo: La Transición de la Observación a la Intervención

La evolución de la salud digital se ha definido históricamente por la cuantificación: el seguimiento pasivo de pasos, calorías y ciclos de sueño. Las plataformas de primera generación, como Metabolik 1.0 (y sus contemporáneos en el mercado como Levels o January AI), funcionaban como "Gemelos Digitales Predictivos", ofreciendo a los usuarios un espejo retrovisor de su salud metabólica. Sin embargo, la próxima frontera, Metabolik 2.0, representa un cambio de paradigma radical: el paso de la observación a la intervención molecular. Ya no se trata de predecir; se trata de actuar.
Este informe detalla las especificaciones funcionales, arquitectónicas y de experiencia de usuario (UX) para Metabolik 2.0. El concepto redefine el software como un "Laboratorio Biológico en Tiempo Real" que integra tres pilares radicales: Realidad Aumentada (AR) Nutricional, Bio-Logística Autónoma y Sincronización Farmacogenética.
La propuesta de valor central de Metabolik 2.0 es el cierre de la "brecha percepción-acción". Los sistemas actuales cargan al usuario con la responsabilidad cognitiva de interpretar datos complejos (por ejemplo, "Mi glucosa está alta") y determinar la acción correctiva (por ejemplo, "Debería comer fibra"). Metabolik 2.0 descarga esta cognición en una Inteligencia Artificial (IA) agente que superpone consecuencias directamente en el mundo físico (AR) y ejecuta la logística correctiva automáticamente (Compra Autónoma), todo ello respetando las restricciones biológicas duras del ADN y el régimen de medicación del usuario (Farmacogenética).

2. Arquitectura del Agente de Intervención

Para transformar una aplicación estática en un agente activo, la arquitectura debe ir más allá de las operaciones simples de CRUD (Crear, Leer, Actualizar, Borrar) y abrazar un bucle de Sensado-Decisión-Actuación, típicamente encontrado en robótica avanzada más que en aplicaciones móviles de consumo.

2.1 La Capa de "Sensado": Ingesta Multi-Ómica

El sistema requiere la ingesta continua de tres flujos de datos distintos y complejos para construir una imagen de alta fidelidad del estado del usuario:
Datos Fenotípicos en Tiempo Real: Flujos de Monitores Continuos de Glucosa (CGM), variabilidad de la frecuencia cardíaca (VFC) y etapas del sueño provenientes de wearables. Estos datos establecen el estado actual del sistema biológico.1
Datos Genotípicos Estáticos: Datos de secuenciación de ADN centrados en nutrigenómica (p. ej., variantes MTHFR, FTO) y farmacogenética (p. ej., CYP2D6, SLCO1B1). Estos datos definen las "reglas fijas" del sistema operativo biológico del usuario.3
Datos Ambientales y Visuales: Entrada visual desde la cámara (menús, platos de comida) y datos de inventario de minoristas de comestibles. Esto contextualiza al usuario dentro de su entorno obesogénico o terapéutico.5

2.2 La Capa de "Decisión": El Motor Metabólico

A diferencia de los contadores de calorías estándar, el motor de decisión utiliza Aprendizaje Federado para entrenar modelos de predicción de glucosa personalizados directamente en el dispositivo del usuario, preservando la privacidad.7 Este motor sintetiza la lógica de "Semáforo" de impacto glucémico 8 con las matrices de interacción farmacológica.9 Calcula no solo qué sucedió, sino qué sucederá (curvas predictivas a 60-120 minutos) y qué debería suceder (comandos de intervención).

2.3 La Capa de "Actuación": Ejecución vía AR y API

El resultado de este procesamiento no es una simple notificación push, sino una intervención directa en la realidad del usuario:
Intervención Visual: Sobrescribir el campo visual del usuario a través de AR para alterar la toma de decisiones en el punto de venta (restaurantes), modificando la percepción del valor de los alimentos.
Intervención Logística: Ejecutar llamadas API a proveedores de comestibles (Kroger, Instacart, Whisk) para mover físicamente los nutrientes necesarios al hogar del usuario, cerrando el ciclo de suministro biológico.10

3. Módulo I: Realidad Aumentada Nutricional (La "Lente Viva")

El componente de AR de Metabolik 2.0 resuelve el problema de la "Ambigüedad del Menú". Cuando un usuario mira un menú, ve texto y precio. Metabolik 2.0 le permite ver el costo metabólico y el impacto neurocognitivo.

3.1 Requisito Funcional: Decodificación de Menús en Tiempo Real

La "Lente Viva" es la interfaz principal para cenar fuera. Utiliza la entrada de la cámara para escanear menús de texto o platos físicos y superponer datos críticos.

3.1.1 Pila Tecnológica y Flujo de Datos

El proceso de transformación de una imagen de menú en una predicción biológica implica una cadena compleja de tecnologías:
Reconocimiento Óptico de Caracteres (OCR): El sistema aprovecha la API de Google Cloud Vision 6 para extraer texto de menús físicos. La función TEXT_DETECTION identifica nombres de platos (p. ej., "Fettuccine Alfredo") y descripciones en tiempo real, superando las limitaciones de los menús estáticos.
Análisis Semántico y Nutrimental: El Procesamiento del Lenguaje Natural (NLP) analiza la salida del OCR para identificar términos culinarios clave y compararlos con una base de datos nutricional robusta, como la API de Análisis Nutricional de Edamam.13 Este paso reconstruye el perfil probable de macronutrientes del plato basándose en formulaciones estándar de restaurantes y ajustando por factores de "exceso de restaurante" (grasa y sal añadidas).
Inferencia Personalizada (El Motor de Curvas): El sistema alimenta los macronutrientes estimados en el modelo de predicción de glucosa patentado del usuario. Este modelo, entrenado con datos históricos de CGM del usuario (similar a los modelos generativos de January AI 8), predice la respuesta glucémica específica.
Superposición AR: Utilizando ARKit (iOS) 15 o ARCore (Android) 16, la aplicación ancla un tablero de visualización de datos virtual junto al elemento del menú físico, asegurando que la información persista incluso si el usuario mueve el dispositivo.

3.1.2 Patrón de Diseño UI: La Superposición "Glucoscape"

La interfaz de usuario debe ser no intrusiva pero altamente informativa, adoptando un patrón de "Anotación de Datos" donde las tarjetas digitales flotan sobre el texto reconocido.17
Elementos Visuales Clave:
La Proyección de la Curva: Un gráfico lineal que aparece sobre el plato mostrando la trayectoria de glucosa prevista para los próximos 60-120 minutos.
Señal Visual: Las zonas verdes indican "Tiempo en Rango" (70–140 mg/dL). Las zonas rojas indican "Excursión Hiperglucémica" (>140 mg/dL), alertando visualmente sobre el estrés fisiológico inminente.2
El Pronóstico Cognitivo: En lugar de simplemente mostrar "Carbohidratos: 80g", la UI traduce la curva en una experiencia sentida, conectando la biología con el rendimiento laboral y personal:
Etiqueta de Advertencia: "La pasta te dará sueño a las 15:00." (Disparado por una caída de glucosa prevista después de un pico, conocida como hipoglucemia reactiva).
Etiqueta de Beneficio: "El pescado te mantendrá en foco." (Disparado por una curva plana y estable, asociada con la función cognitiva sostenida).
El "Prompt" de Intervención: Si un plato se marca como de alto riesgo, la interfaz AR sugiere un "Hack Molecular" (p. ej., "Pide vinagre balsámico extra para reducir este pico en un 20%" o "Camina 15 minutos después de comer").14

3.2 Experiencia de Usuario: Escenario en Restaurante

Imagine al usuario en un almuerzo de negocios.
Escaneo: Abre Metabolik 2.0 y desliza a "Lente Viva". Apunta el teléfono al menú del restaurante italiano.
Procesamiento: La aplicación resalta los platos reconocibles con un brillo tenue.
Selección: El usuario toca "Lasaña".
Simulación: Una superposición holográfica se expande.
Titular: "Comida de Alto Impacto".
Gráfico: Muestra un pico a 180 mg/dL a los 45 minutos, cayendo a 60 mg/dL a los 120 minutos.
Texto: "Este choque coincide con tu reunión de las 15:00. Riesgo de somnolencia: Alto".
Alternativa: El motor AR resalta el "Salmón a la Parrilla" cercano con un aura verde, mostrando una curva estable y la etiqueta: "Óptimo para el Foco Cognitivo".

4. Módulo II: La Compra Autónoma (Bio-Logística Basada en Biomarcadores)

Este módulo evoluciona más allá de las "recetas sugeridas" hacia el "abastecimiento automatizado". Actúa como un puente logístico entre el estado biológico del usuario y la cadena de suministro de comestibles.

4.1 Requisito Funcional: Ingesta e Interpretación de Biomarcadores

El sistema requiere una relación de "lectura-escritura" con la biología del usuario.
Entrada (Lectura): Integración con API de resultados de laboratorio (p. ej., conexión a proveedores como Quest Diagnostics o análisis de PDF mediante OCR) para identificar deficiencias críticas (p. ej., Ferritina < 30 ng/mL, Vitamina D < 30 ng/mL).
Lógica (Interpretación): El "Motor de Lógica de Deficiencia" mapea biomarcadores a alimentos densos en micronutrientes específicos.
Ejemplo de Lógica: SI (Ferritina < Umbral_Bajo) Y (Estado_Genético_HFE == Normal) ENTONCES (Priorizar Fuentes_Hierro_Hemo Y Fuentes_Vitamina_C).

4.2 Requisito Funcional: Población Automatizada del Carrito

Una vez establecida la necesidad nutricional, la aplicación interactúa con las API de comestibles para satisfacerla.

4.2.1 Pila Tecnológica

Búsqueda de Productos: La API de Productos de Kroger 20 o la API de Whisk 22 permite que la aplicación busque artículos específicos (p. ej., "Hígado de Pollo", "Espinacas", "Cítricos") dentro del inventario de las tiendas locales.
Gestión del Carrito: La aplicación utiliza el alcance shopping_list:write de la API de Whisk o los puntos finales de cart de las API de minoristas (p. ej., la funcionalidad "Add to Cart" de Kroger 11) para construir el pedido.
Filtrado de Inventario: El sistema filtra los alimentos a los que el usuario es alérgico o que no le gustan, asegurando que la "prescripción" sea apetecible y cumpla con las restricciones dietéticas.

4.2.2 El Algoritmo de "Despensa Inteligente"

La aplicación no se limita a añadir artículos aleatorios. Construye un Plan de Comidas Coherente.
Entrada: El usuario necesita hierro (según su último análisis de ferritina).
Acción: El algoritmo no solo añade "Hígado". Añade "Hígado", "Cebollas" y "Tocino" (para sabor), y "Naranjas" (Vitamina C para potenciar la absorción). Luego genera una tarjeta de receta para "Hígado Encebollado con Acompañamiento Cítrico" y añade todos los ingredientes necesarios al carrito.22

4.3 Diseño UI: Flujo de "Revisión y Aprobación"

Los usuarios pueden desconfiar de una IA que gasta su dinero sin supervisión. La función "Auto-Buy" requiere una interfaz de aprobación con fricción reducida pero alta transparencia.
La Propuesta Semanal: El domingo por la noche, el usuario recibe una notificación: "Reabastecimiento Biológico Semanal Listo".
El Contexto del "Por Qué": La vista del carrito está segmentada por intención biológica en lugar de por pasillo de supermercado.
Sección 1: Protocolo de Hierro (Ferritina Baja Detectada)
Artículo: Hígado de Pollo Orgánico (500g).
Artículo: Espinacas (2 bolsas).
Sección 2: Estabilidad Glucémica (Mantenimiento)
Artículo: Aguacates (4 unidades).
Artículo: Nueces (1 bolsa).
Ejecución con Un Toque: El usuario revisa, desmarca cualquier artículo no deseado y desliza "Autorizar Compra". El backend maneja la transacción a través de Instacart Connect o la API de Kroger.10

5. Módulo III: Sincronización Farmacogenética (La Capa de Seguridad)

Este módulo asegura que la intervención alimentaria no entre en conflicto con la realidad farmacéutica del usuario. Introduce una capa de seguridad crítica a menudo ausente en las aplicaciones de dieta estándar.

5.1 Fundamento Científico: Interacciones Fármaco-Nutriente

El sistema utiliza una "Matriz de Contraindicaciones" basada en pautas farmacogenómicas (PGx) (p. ej., CPIC, Tabla de Biomarcadores Farmacogenómicos de la FDA 9).
Metabolismo CYP450: Alimentos como el pomelo contienen furanocumarinas que inhiben el enzima CYP3A4. Si un usuario toma un sustrato de CYP3A4 (p. ej., estatinas como Simvastatina), la aplicación debe bloquear estrictamente el pomelo de la Despensa Autónoma y marcarlo en rojo en la Lente AR para prevenir toxicidad.25
Tríada Gen-Fármaco-Dieta:
Escenario: Un usuario toma Metformina para la diabetes.
Riesgo: La Metformina puede agotar la Vitamina B12.
Genética: Si el usuario también tiene una mutación en el gen TCN2 (reduciendo el transporte de B12), el riesgo de neuropatía se agrava.27
Intervención: La aplicación añade automáticamente alimentos fortificados con B12 o suplementos al carrito de la compra.

5.2 Requisito Funcional: El "Guardián de Interacción"

Armario de Medicación: Una página segura donde los usuarios registran medicamentos (mediante escaneo de cámara de la botella o búsqueda manual).
Importación de Perfil Genético: Los usuarios conectan su archivo de datos brutos de 23andMe o AncestryDNA. La aplicación analiza SNPs clave (p. ej., rs776746 para CYP3A5, rs4149056 para SLCO1B1).26
Verificación Dinámica de Conflictos:
Contexto AR: Si un usuario escanea un elemento del menú con "Glaseado de Pomelo" y está tomando Atorvastatina, la superposición AR se vuelve ROJA con una "Alerta de Interacción con Medicación".
Contexto de Compra: La aplicación evita la adición de alimentos que causan interacción al carrito, mostrando una notificación de "Bloqueado por Seguridad".

6. Especificaciones Detalladas de Páginas y Funcionalidades

Esta sección desglosa las pantallas y funcionalidades específicas necesarias para entregar la experiencia Metabolik 2.0, sirviendo como guía para el equipo de desarrollo de producto.

6.1 Página: Centro de Mando Molecular (Dashboard)

Rol: El hub central para el estado actual y las intervenciones inmediatas.
Componentes Clave:
El Avatar de Bio-Estado: Un gemelo digital 3D que visualiza el estado actual.
Visuales: Una silueta humana. Los órganos brillantes indican áreas de enfoque (p. ej., un estómago brillante para la digestión, un pulso rojo en la cabeza para glucosa baja/niebla mental).
La Tarjeta de "Próxima Intervención":
Contenido: Asesoramiento dinámico basado en la hora del día y biomarcadores.
Ejemplo: "11:30 AM. Glucosa bajando. Come las nueces compradas la semana pasada para mantener el foco en tu llamada de la 1:00 PM."
Protocolos Activos:
Lista de procesos en segundo plano: "Restauración de Hierro (Semana 2 de 4)", "Soporte B12 por Metformina (Activo)".

6.2 Página: La Lente Viva (Interfaz AR)

Rol: La herramienta de punto de decisión para entornos alimentarios.
Características Clave:
Visor: Vista de cámara a pantalla completa.
Retículas de Detección: Cajas delimitadoras que identifican texto de menú u objetos físicos de comida.5
La Superposición "Future-Cast":
Curva de Glucosa: Un gráfico XY simplificado (Tiempo vs. Glucosa) flotando sobre la comida.
Insignia de Puntuación: Un solo número (1-10) que indica la calidad metabólica para este usuario específico.
Etiqueta Contextual: "Riesgo de Sueño" o "Potenciador de Energía".
Modo de Comparación: Tocar dos elementos (p. ej., "Pasta" vs. "Bistec") genera una vista "Versus", superponiendo ambas curvas para mostrar la diferencia relativa en el impacto.14

6.3 Página: La Auto-Despensa (Lógica de Compra)

Rol: El puente entre biología y logística.
Características Clave:
Inventario de Biomarcadores: Una lista de "Por qué estamos comprando esto".
Encabezado: "Hierro Bajo Detectado (Ferritina: 22 ng/mL)."
Artículos: "Hígado de Pollo", "Espinacas", "Potenciador de Vitamina C".
El Filtro de Interacción: Un interruptor que muestra "Artículos Ocultos".
Explicación: "Eliminamos el Pomelo de tu pedido recurrente porque comenzaste a tomar Simvastatina el martes."
Checkout de Un Clic: Integración con APIs de Instacart/Kroger para finalizar la transacción.
Control de Presupuesto: Un control deslizante que establece el gasto máximo semanal, obligando a la IA a optimizar la densidad de nutrientes por dólar.

6.4 Página: El Casillero Farmacogenético

Rol: Gestión de medicamentos, suplementos y datos de ADN.
Características Clave:
Línea de Tiempo de Medicación: Muestra cuándo se tomaron los medicamentos y sugiere el horario de las comidas.
Ejemplo: "Medicación tiroidea tomada a las 7:00 AM. Seguro comer alimentos ricos en calcio (Yogur) después de las 11:00 AM." (Previniendo interferencia de absorción).
Panel de Insights de ADN:
Estado MTHFR: "Conversión de Folato Reducida." -> Acción: "Añadiendo alimentos ricos en Folato Metilado (Verduras de Hoja) a la despensa."
Metabolismo de Cafeína (CYP1A2): "Metabolizador Lento." -> Acción: La Lente AR advierte "Riesgo Alto de Ansiedad" en un espresso doble después de las 2:00 PM.
Cartera de Recetas Digital: Permite escanear botellas de RX para actualizar automáticamente la matriz de interacción.

7. Estructuras de Datos Funcionales y Tablas de Lógica

Para implementar Metabolik 2.0, el backend debe mantener relaciones complejas entre tipos de datos dispares. Las siguientes tablas describen la lógica requerida para el "Agente de Intervención", sirviendo como referencia para los arquitectos de bases de datos.

7.1 El Mapa Lógico Biomarcador-a-Comestibles

Esta lógica impulsa el módulo de Compra Autónoma. Traduce un valor de laboratorio en una consulta de comestibles específica (SKU).
Biomarcador
Indicador de Estado
Modificador Genético del Usuario
Estrategia de Intervención Dietética
Palabras Clave de Consulta API de Comestibles
Ferritina
< 30 ng/mL (Deficiencia)
Normal
Alto Hierro Hemo + Vit C
Hígado de Pollo, Carne Magra, Pimientos Rojos, Naranjas
Ferritina
< 30 ng/mL (Deficiencia)
Mutación HFE (Riesgo Hemocromatosis)
Solo Monitorizar (No auto-comprar hierro; Alertar Médico)
NULL (Bloquear Suplementos de Hierro)
Vitamina B12
< 200 pg/mL
TCN2 (Transporte reducido)
B12 de Alta Biodisponibilidad
Almejas, Sardinas, Levadura Nutricional, Leche Fortificada B12
Glucosa
HbA1c > 5.7% (Prediabético)
TCF7L2 (Alta Sensibilidad a Carbohidratos)
Carga Glucémica Baja, Fibra Alta
Semillas de Chía, Lentejas, Frambuesas, Raíz de Konjac
Homocisteína
Alta
MTHFR C677T (Metilación Pobre)
Fuentes de Folato Metilado
Espinacas, Espárragos, Lechuga Romana (Bloquear Ácido Fólico sintético)


7.2 La Matriz de Interacción Farmacogenética

Esta lógica impulsa la "Capa de Seguridad" tanto en los módulos AR como de Compra.
Clase de Medicación
Fármaco Específico
Gen Involucrado
Interacción Dietética (Riesgo)
Acción del Sistema
Estatinas
Simvastatina
SLCO1B1 / CYP3A4
Pomelo (Inhibe CYP3A4, aumenta toxicidad/riesgo miopatía)
AR: Alerta Roja en Pomelo. Compra: Auto-eliminar del carrito.
SSRI
Sertralina
CYP2C19
Tiramina (Contexto MAOI, pero para SSRI + MTHFR, foco en Folato)
Compra: Asegurar ingesta alta de Folato para síntesis de neurotransmisores.
Anticoagulante
Warfarina
VKORC1
Vitamina K (Espinacas, Col Rizada) altera tiempo coagulación.
AR: "Alerta de Consistencia" - Mantener ingesta K estable, no picar.
Diabetes
Metformina
N/A
Agotamiento B12 (Mecanismo: altera absorción dependiente de Calcio)
Compra: Auto-añadir alimentos B12. AR: Resaltar fuentes B12.
Tiroides
Levotiroxina
N/A
Calcio/Hierro (Interfiere absorción si se toma en < 4 horas)
Dashboard: "Espera para comer yogur hasta las 11:00 AM."


8. Implementación Técnica y Viabilidad


8.1 Ecosistema de API

Metabolik 2.0 actúa como una "Meta-API", orquestando llamadas entre servicios de salud, visión y comercio.
Visión y OCR:
Google Cloud Vision API: Para TEXT_DETECTION en menús, permitiendo la lectura de platos complejos.6
Modelo Edge Personalizado: Un modelo TFLite ligero entrenado en imágenes de comida para reconocimiento de platos (cajas delimitadoras alrededor de "bistec", "patatas fritas").5
Comestibles y Nutrición:
API de Whisk/Samsung Food: Para convertir recetas en listas de compra a través de múltiples minoristas, facilitando la logística de ingredientes complejos.22
API de Edamam: Para análisis nutricional en tiempo real del texto del menú analizado (NLP a Micro-nutrientes).13
APIs de Kroger/Instacart: Para verificar inventario local y ejecutar el comando "Add to Cart".10
Datos de Salud:
Apple HealthKit / Google Fit: Agregando datos de CGM y Sueño para el contexto fenotípico.
Terra API / Human API: Conectores universales para la ingesta de resultados de laboratorio y datos genéticos.

8.2 El Modelo de IA "Gemelo Digital"

Para lograr AR predictiva, el sistema no puede depender de tablas genéricas de Índice Glucémico (IG). Requiere un modelo de Respuesta Glucémica Personalizada (PGR).
Datos de Entrenamiento: Los primeros 14 días de datos de CGM del usuario + Registro de Alimentos (Fotos).
Arquitectura: Una Red Neuronal Recurrente (RNN) o LSTM (Long Short-Term Memory) que aprende el tiempo de retraso específico y la magnitud del pico del usuario.
Características de Entrada: Carbohidratos de la Comida, Grasa de la Comida, Hora del Día, Sueño de la Noche Anterior, Glucosa Pre-Comida, Medicación Activa (S/N).
Salida: Un vector de glucosa predicho (mg/dL) para $t+0$ a $t+120$ minutos, que se visualiza en la AR.

8.3 Privacidad y Cumplimiento GDPR

El procesamiento de datos genéticos (Artículo 9 GDPR - Categorías Especiales) requiere consentimiento explícito y protocolos de alta seguridad.31
Procesamiento en el Borde (Edge Computing): Las verificaciones de interacción genética (p. ej., verificar el estado de CYP2D6 contra un fármaco) deben ocurrir teóricamente localmente en el dispositivo para evitar que los datos de ADN sensibles residan en un servidor central.
Minimización de Datos: El servidor en la nube recibe solo el "Resultado de Interacción" (p. ej., "Pomelo = Prohibido"), no la secuencia genética bruta "Variante TCN2 detectada".

9. Conclusión: El Ascenso del Agente Biológico

Metabolik 2.0 no es simplemente una actualización de software; es una redefinición de categoría. Al pasar de lo Informativo (Metabolik 1.0) a lo Intervencional (Metabolik 2.0), la plataforma aborda el fallo fundamental del bienestar moderno: la parálisis de la elección.
La Lente AR resuelve la Asimetría de Información en los restaurantes, donde los productores conocen los ingredientes pero los consumidores asumen el costo metabólico.
La Despensa Autónoma resuelve la Brecha de Ejecución, asegurando que la "elección correcta" sea la elección por defecto en el hogar.
La Sincronización Farmacogenética resuelve la Falacia de Talla Única, adaptando el entorno químico de la dieta a la realidad química de la medicación y genética del usuario.
Construir esto requiere una fusión multidisciplinaria de ingeniería de API, bioinformática y diseño conductual. Sin embargo, el resultado es la "Killer App" definitiva para la salud: un sistema que no solo te observa vivir, sino que te ayuda activamente a sobrevivir.
Recomendación Final: Iniciar el desarrollo con el módulo de Despensa Autónoma. Tiene la barrera técnica más baja (APIs de Comestibles existentes) y el potencial de retención más alto (utilidad semanal recurrente). Seguir con la Lente AR a medida que los modelos de visión por computadora maduren para el despliegue móvil en el borde.
Obras citadas
January AI | Where AI Meets Precision Health, fecha de acceso: noviembre 28, 2025, https://www.january.ai/
Digital health application integrating wearable data and behavioral patterns improves metabolic health - PMC - NIH, fecha de acceso: noviembre 28, 2025, https://pmc.ncbi.nlm.nih.gov/articles/PMC10673832/
Nutrigenomics Solutions - LifeNome, fecha de acceso: noviembre 28, 2025, https://lifenomeapi.com/nutrigenomics-solutions
Simvastatin Therapy and SLCO1B1 Genotype - Medical Genetics Summaries - NCBI - NIH, fecha de acceso: noviembre 28, 2025, https://www.ncbi.nlm.nih.gov/books/NBK602238/
Recommendation Method Based on Glycemic Index for Intake Order of Foods Detected by Deep Learning - MDPI, fecha de acceso: noviembre 28, 2025, https://www.mdpi.com/2079-9292/14/3/457
OCR With Google AI, fecha de acceso: noviembre 28, 2025, https://cloud.google.com/use-cases/ocr
AI that delivers smarter glucose predictions without compromising privacy - NSF, fecha de acceso: noviembre 28, 2025, https://www.nsf.gov/news/ai-delivers-smarter-glucose-predictions-without-compromising
How Does January's AI Work?, fecha de acceso: noviembre 28, 2025, https://www.january.ai/ai-info
For Healthcare Professionals | FDA's Examples of Drugs that Interact with CYP Enzymes and Transporter Systems, fecha de acceso: noviembre 28, 2025, https://www.fda.gov/drugs/drug-interactions-labeling/healthcare-professionals-fdas-examples-drugs-interact-cyp-enzymes-and-transporter-systems
Instacart Connect APIs, fecha de acceso: noviembre 28, 2025, https://docs.instacart.com/connect/
APIs | Kroger Developers, fecha de acceso: noviembre 28, 2025, https://developer.kroger.com/reference/
Vision AI: Image and visual AI tools | Google Cloud, fecha de acceso: noviembre 28, 2025, https://cloud.google.com/vision
Nutrition Analysis API Documentation - Edamam, fecha de acceso: noviembre 28, 2025, https://developer.edamam.com/edamam-docs-nutrition-api
January AI Unveils New Glucose Prediction & Nutrition Features with HealthKit Integration, fecha de acceso: noviembre 28, 2025, https://insider.fitt.co/press-release/january-ai-unveils-new-glucose-prediction-nutrition-features-with-healthkit-integration/
ARKit 6 - Augmented Reality - Apple Developer, fecha de acceso: noviembre 28, 2025, https://developer.apple.com/augmented-reality/arkit/
Top Augmented Reality SDK for iOS and Android In November 2025 - Pixelcrayons, fecha de acceso: noviembre 28, 2025, https://www.pixelcrayons.com/blog/digital-transformation/augmented-reality-sdk-for-ios-and-android/
Design Patterns for Mobile Augmented Reality User Interfaces—An Incremental Review, fecha de acceso: noviembre 28, 2025, https://www.mdpi.com/2078-2489/13/4/159
Augmented reality | Apple Developer Documentation, fecha de acceso: noviembre 28, 2025, https://developer.apple.com/design/human-interface-guidelines/augmented-reality
Glide: improving metabolic health with a companion app concept for wearable continuous glucose monitors - UX studio, fecha de acceso: noviembre 28, 2025, https://www.uxstudioteam.com/ux-blog/cgm-app-design
Products API - APIs | Kroger Developers, fecha de acceso: noviembre 28, 2025, https://developer.kroger.com/reference/api/product-api-public
Products API - APIs | Kroger Developers, fecha de acceso: noviembre 28, 2025, https://developer.kroger.com/reference/api/product-api-partner
Create a Shopping List | Whisk Docs, fecha de acceso: noviembre 28, 2025, https://docs.whisk.com/api/shopping-lists/create-a-shopping-list
Overview | Whisk Docs, fecha de acceso: noviembre 28, 2025, https://docs.whisk.com/shopping-list-mobile-api/overview
Refinement of a pharmacogenomics app for dosing guidelines for oncology: findings from the usability evaluation - PubMed Central, fecha de acceso: noviembre 28, 2025, https://pmc.ncbi.nlm.nih.gov/articles/PMC9816840/
The Effect of Cytochrome P450 Metabolism on Drug Response, Interactions, and Adverse Effects | AAFP, fecha de acceso: noviembre 28, 2025, https://www.aafp.org/pubs/afp/issues/2007/0801/p391.html
Molecular mechanisms of statin intolerance - Archives of Medical Science, fecha de acceso: noviembre 28, 2025, https://www.archivesofmedicalscience.com/pdf-62308-58171?filename=58171.pdf
The Consequences of Lowering Vitamin B12 With Chronic Metformin Therapy, fecha de acceso: noviembre 28, 2025, https://www.researchgate.net/publication/373357300_The_consequences_of_lowering_vitamin_B12_with_chronic_metformin_therapy
Vitamin B12 deficiency | MedLink Neurology, fecha de acceso: noviembre 28, 2025, https://www.medlink.com/articles/vitamin-b12-deficiency
Statin Toxicity | Circulation Research - American Heart Association Journals, fecha de acceso: noviembre 28, 2025, https://www.ahajournals.org/doi/10.1161/CIRCRESAHA.118.312782
Cloud Vision API documentation, fecha de acceso: noviembre 28, 2025, https://docs.cloud.google.com/vision/docs
Art. 9 GDPR – Processing of special categories of personal data, fecha de acceso: noviembre 28, 2025, https://gdpr-info.eu/art-9-gdpr/
What personal data is considered sensitive? - European Commission, fecha de acceso: noviembre 28, 2025, https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/legal-grounds-processing-data/sensitive-data/what-personal-data-considered-sensitive_en
