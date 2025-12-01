Oracle Money 2.0: Especificación Maestra de UX/UI y Arquitectura Funcional
Visión: Un sistema operativo financiero autónomo que elimina la micro-gestión del dinero mediante ejecución automatizada (VRP), simulación de riesgos de cola (Black Swans) y valoración de activos intangibles (Capital Humano).
🏗️ Arquitectura de Navegación (Sitemap)
El software se aleja de la estructura bancaria tradicional (Cuentas, Transferencias, Tarjetas). La navegación se basa en Tiempos Verbales Financieros:
Presente (Flow & Control): Dashboard "Safe-to-Spend" y Feed de Actividad.
Motor (Automation): Configuración de Reglas de Barrido y VRP.
Futuro Incierto (Defense): Simulador de Cisne Negro.
Futuro Deseado (Offense): Life Projects OS y ROI Calculator.
📱 PÁGINA 1: El Centro de Mando "Zero-Click" (Dashboard Principal)
Objetivo: Eliminar la ansiedad financiera inmediata. El usuario no quiere ver "Saldo Contable" (que es mentira, porque no descuenta las facturas de mañana), quiere ver "Liquidez Real".
1.1 Diseño Visual (Wireframe)
Estilo: Minimalista extremo, "Glassmorphism" para sugerir transparencia. Fondo oscuro para reducir fatiga visual (Dark Mode default).
Elemento Central: Un "Anillo de Liquidez" (similar al anillo de actividad de Apple Watch) que se completa a medida que el usuario gana dinero y retrocede con gastos.
1.2 Componentes Detallados de la Página
Componente UI
Funcionalidad y Lógica Backend
Interacción del Usuario
El Indicador "Safe-to-Spend"
Muestra un solo número gigante en el centro. Fórmula: Saldo Bancario - (\sum Facturas Pendientes + Ahorro Programado + Buffer Seguridad). Se actualiza vía Webhooks en tiempo real tras cada transacción.
Al tocar el número, se "desglosa" en una animación de cascada mostrando qué se ha restado para llegar a esa cifra (Transparencia Radical).
Feed de Actividad "Pulse"
Lista cronológica de acciones de la IA y transacciones. Diferenciación: Usa iconos distintos para "Usuario" (👤) e "IA" (🤖). Ej: 🤖 La IA movió 14,50€ a 'Fondo de Viaje' (Regla de redondeo).
Botón "Deshacer" (Time-Travel): Cada acción automática tiene un contador de 60 segundos para revertirla con un solo toque antes de que el dinero salga del banco (usando VRPs reversibles).
Widget de Detección de Anomalías
Tarjeta de alerta flotante. Solo aparece si hay problemas. Lógica: Detecta desviaciones >2 sigmas en patrones de gasto (ej. "Tu factura de luz es 40% más alta que el promedio histórico de inviernos").
Botón "Investigar": Lleva al detalle de la transacción con gráficos comparativos vs. año anterior.
Barra de Estado del Piloto Automático
Semáforo: 🟢 Activo
🟡 Pausado

⚙️ PÁGINA 2: Configuración del Motor (Self-Driving Money)
Objetivo: Configurar la "física" de cómo se mueve el dinero sin intervención humana. Aquí se establecen los permisos de escritura bancaria (Write Access).
2.1 Lógica de "Barrido Inteligente" (Smart Sweeping)
Esta página gestiona los Pagos Recurrentes Variables (VRP). A diferencia de una transferencia programada (fija), aquí se programan algoritmos.
2.2 Secciones de la Página
A. Sección "Tuberías de Dinero" (Money Pipelines)
Interfaz visual de "nodos y conectores" (similar a Zapier o Node-RED visual).
Input Node: Nómina / Ingresos (Detectado automáticamente vía Plaid/GoCardless).
Logic Node (El Cerebro):
Regla 1 (El Muro de Fuego): "Primero llenar el tanque de facturas". (Retiene el 100% de los gastos fijos previstos).
Regla 2 (El Excedente): "¿Qué hacemos con lo que sobra?"
Output Nodes:
Cartera Indexada: Asignar 40% del excedente.
Fondo de Emergencia: Asignar 20% hasta llegar a 10k€.
Cuenta de "Culpa Cero": Asignar 40% para gasto libre.
B. Panel de Calibración de Agresividad
Un deslizador (Slider) de 3 niveles que ajusta los parámetros del algoritmo de barrido :
Modo Zen (Conservador):
Deja un Buffer de Seguridad de 1.000€ extra en la cuenta corriente.
Solo mueve dinero si el saldo > 2.000€.
Ejecución: Semanal (Viernes).
Modo Optimizado (Equilibrado):
Buffer dinámico basado en la volatilidad de gastos de los últimos 3 meses.
Ejecución: Cada 3 días.
Modo Hedge Fund (Agresivo):
Buffer mínimo (ej. 200€).
Mueve el dinero al mercado (Time-in-market) tan pronto ingresa la nómina.
Ejecución: Diaria (Micro-sweeping).
🌪️ PÁGINA 3: La Sala de Guerra (Black Swan Simulator)
Objetivo: Stress-testing financiero profesional llevado al consumidor. Responde a "¿Sobreviviré?".
3.1 Diseño Visual
Estilo "Dark Room" o Cockpit de avión. Gráficos de líneas rojas y verdes que divergen en el tiempo.
3.2 Funcionalidades Específicas
A. Selector de Escenarios Catastróficos (Cards UI)
El usuario arrastra tarjetas al "simulador central" para ver el impacto combinado.
Tarjeta "Despido Fulminante":
Input: ¿Indemnización esperada? (El sistema sugiere basado en antigüedad legal). ¿Tiempo de paro estimado para tu sector? (Datos de LinkedIn/API laboral).
Visualización: Gráfico de "Pista de Aterrizaje" (Runway). Muestra una cuenta regresiva: "Te quedan 144 días de liquidez antes de tener que vender activos ilíquidos (casa/coche)".
Tarjeta "Divorcio / Separación":
Lógica: Divide el patrimonio neto entre 2. Aplica multiplicador de gastos x1.6 (pierde economías de escala). Resta costes legales estimados (15k-30k€).
Output: "¿Tu plan de jubilación sigue en pie?". Muestra la nueva edad de jubilación post-divorcio (ej. pasa de 55 a 67 años).
Tarjeta "Inflación Estructural 8%":
Recalcula el poder adquisitivo futuro. Muestra cómo los ahorros en efectivo se "evaporan" visualmente.
B. El Botón "Generar Plan de Defensa"
Al terminar la simulación, un botón genera un PDF y una lista de tareas (Checklist) en la app:
[ ] Transferir 2.000€ de Bonos a Liquidez (Aumentar Runway).
[ ] Reducir suscripciones (Ahorro potencial: 120€/mes).
[ ] Actualizar CV (Tu sector muestra inestabilidad).
🧬 PÁGINA 4: Life Projects OS (Gestión de Life-ROI)
Objetivo: Optimizar la felicidad y el propósito, no solo el saldo. Trata al usuario como una "Empresa" con activos tangibles (dinero) e intangibles (tiempo, habilidades).
4.1 La Matriz de Activos Totales
Un gráfico de áreas apiladas que muestra dos curvas:
Curva Financiera: Dinero en el banco/inversiones.
Curva de Capital Humano: Valor Presente Neto (VPN) de todos tus ingresos futuros esperados.
Insight: Para un joven de 25 años, el Capital Humano es millonario (todo el potencial futuro), aunque su banco esté a cero. El software visualiza esto para reducir la ansiedad y fomentar la inversión en educación.
4.2 Calculadora de ROI de Experiencias (The Memory Dividend)
Una herramienta de decisión para grandes gastos (Viajes, Sabáticos, Bodas).
Formulario de Entrada:
Costo: 5.000€ (Viaje a Japón).
Edad: 30 años.
Categoría: Experiencia Vital Única.
Análisis del Algoritmo (Output):
Impacto Financiero: "Si inviertes estos 5k€ al 7%, serían 38k€ a los 60 años".
Impacto en Salud/Memoria: Utiliza modelos de "Die With Zero". Asigna puntos de utilidad a disfrutar esto a los 30 años (alta salud/energía) vs. a los 60 años.
Veredicto de la IA: "CÓMPRALO. Aunque el coste financiero es alto, el ROI de memoria y la utilidad de hacerlo con tu salud actual supera el valor marginal del dinero en tu jubilación proyectada. Tienes un 'Excedente de Seguridad' suficiente."
4.3 Gestor de Proyectos de Vida (Gantt View)
Línea de tiempo horizontal scrolleable hasta los 90 años.
Hitos arrastrables (Comprar Casa, Tener Hijo, Año Sabático).
Semáforo de Viabilidad: Si arrastras "Jubilación" a los 40 años, la barra se pone roja (Imposible con el ahorro actual). Si la mueves a los 50, se pone amarilla. A los 55, verde.
Esto conecta la planificación financiera con la realidad temporal tangible.
🔍 PÁGINA 5: Centro de Transparencia (IA Explicable)
Objetivo: Generar confianza. Evitar el efecto "Caja Negra" donde el usuario desconecta el sistema porque no entiende por qué hizo algo.
5.1 Registro de Decisiones (Decision Log)
Cada decisión autónoma tiene un registro de "Racionalidad":
Acción: Invertidos 200€ en S&P 500. Por qué:
Saldo en cuenta > Umbral (2.500€).
No hay facturas grandes previstas en los próximos 12 días (Predicción con 98% confianza).
El mercado ha caído un 2% hoy (Regla de "Buy the Dip" activada).
Conclusión: Es seguro y rentable mover el dinero.
5.2 Auditoría de Datos
El usuario puede ver y corregir lo que la IA "cree" sobre él.
"La IA cree que tu alquiler es 800€. ¿Es correcto?" (Botón: Corregir).
"La IA predice que gastarás 400€ en comida este mes. ¿Correcto?"
6. Página de Gestión de Cartera y Rendimiento
Aunque la Página 2: Configuración del Motor define cómo se asignan los excedentes a la "Cartera Indexada" (un Output Node), y se utiliza la API de DriveWealth para ejecutar órdenes fraccionarias, no existe una página dedicada al monitoreo, la visualización del rendimiento, la composición detallada y la recalibración de estas inversiones.
Esta página se centraría en el estado del "Offense" (Ataque financiero), complementando la visión de "Defense" (Defensa ante desastres, Página 3) y "Life-ROI" (Propósito, Página 4):
• Rendimiento Detallado: Muestra el ROI (Retorno de Inversión) en diferentes marcos temporales (diario, YTD, total) y lo compara con benchmarks relevantes.
• Composición del Portfolio: Desglose visual de los activos (ej. acciones, ETFs) que fueron adquiridos automáticamente mediante las reglas de micro-sweeping diarias.
• Ajuste de Riesgo: Permitiría al usuario realizar ajustes manuales finos en la mezcla de activos o en la agresividad de inversión, sin tener que modificar completamente las reglas de barrido de la Página 2.
• Impacto de Datos Macro: Visualización de cómo la inflación en tiempo real (datos de Truflation API) está impactando el valor real de los activos en la cartera.
7. Página de Auditoría Histórica y Categorización (El Gran Libro de Contabilidad)
La Página 1: El Centro de Mando ofrece un Feed de Actividad "Pulse" con una lista cronológica de transacciones y acciones de la IA, e incluye un Widget de Detección de Anomalías para problemas recientes.
Sin embargo, para tareas de contabilidad doméstica detallada, preparación de impuestos o una revisión exhaustiva de gastos pasados (más allá de las anomalías), sería necesaria una vista más potente:
• Búsqueda y Filtro Avanzado: Permitiría buscar transacciones por categoría, etiqueta, tiempo verbal (acciones de "Usuario" 👤 vs. "IA" 🤖) o montos, lo cual complementaría la funcionalidad del Feed de Actividad.
• Categorización con IA (y Corrección Manual): Mostraría cómo la IA ha categorizado todos los gastos (ej. "La IA cree que tu alquiler es 800€") y ofrecería una interfaz para que el usuario corrija o fusione categorías de manera masiva.
• Análisis Comparativo Histórico: Gráficos de barras que muestren la evolución del gasto en una categoría específica mes a mes o año a año, aprovechando la información que se usa para el botón "Investigar" del widget de anomalías

🛠️ Stack Tecnológico Sugerido para Desarrollo
Para hacer esto realidad, se requiere una arquitectura técnica específica:
Conectividad Bancaria (Lectura/Escritura):
Lectura: Plaid (EEUU) o Tink/Yapily (Europa) para historial de transacciones.
Escritura (Critico): GoCardless Bank Payments (para VRP en UK/Europa) o Astra Finance (EEUU) para mover fondos programáticamente (sweeping).
Motor de Inversión:
DriveWealth API: Para ejecutar órdenes fraccionarias de acciones/ETFs en tiempo real.
Datos Macro/Riesgo:
Truflation API: Para datos de inflación en tiempo real (más precisos que el IPC gubernamental).
Frontend:
Flutter / React Native: Para experiencia móvil fluida (60fps) necesaria para los gráficos interactivos de simulación.
Resumen de la Mejora Radical
Hemos pasado de una "app que muestra gráficos" a una plataforma de operaciones.
Pagina 1: Te da paz mental inmediata (Safe-to-Spend).
Pagina 2: Ejecuta el trabajo sucio (VRP/Sweeping).
Pagina 3: Te protege de desastres (Stress-Test).
Pagina 4: Te ayuda a vivir, no solo a acumular (Life-ROI).
Obras citadas
1. Variable Recurring Payments (VRPs) & Sweeping in Open Banking - Macro Global, https://www.macroglobal.co.uk/blog/regulatory-technology/open-banking-psd2/variable-recurring-payments-and-sweeping-in-open-banking/ 2. Variable Recurring Payments (VRPs): Guide for Merchants - Noda, https://noda.live/articles/variable-recurring-payments-guide 3. How to effectively stress test your portfolio for black swan events - Wealth Formula, https://www.wealthformula.com/blog/how-to-effectively-stress-test-your-portfolio-for-black-swan-events/ 4. Understanding the Financial Implications of Divorce - Central Bank, https://www.centralbank.net/learning-center/life-events/family/understanding-the-financial-implications-of-divorce/ 5. All Nerd's Eye View Articles On Human Capital Planning - Kitces.com, https://www.kitces.com/blog/category/10-human-capital/ 6. How to Quantify the Value of Financial Planning Today - Kubera, https://www.kubera.com/blog/quantifying-the-value-of-financial-planning-advice 7. Explainable AI in Finance: Why Transparency Matters - MindBridge, https://www.mindbridge.ai/blog/explainable-ai-in-finance-why-transparency-matters/ 8. Variable Recurring Payments - GoCardless Developers, https://developer.gocardless.com/billing-requests/variable-recurring-payments 9. Platform - DriveWealth, https://www.drivewealth.com/technology/platform/
