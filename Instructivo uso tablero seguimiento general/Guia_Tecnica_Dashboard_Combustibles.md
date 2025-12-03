# Guía Técnica de Cálculo de Medidas - Dashboards de Seguimiento

Este documento detalla las reglas de negocio y cálculos matemáticos para los tableros de seguimiento.

## Parte 1: Dashboard Combustibles

### 1. Medidas Base y Fórmulas Explicadas

**Galones Totales**  
Es la suma acumulada de todo el combustible reportado en los informes diarios.
```text
Suma de la columna [Combustible]
```

**Horas Trabajadas (Por registro)**  
Calcula la diferencia entre el horómetro final y el inicial. Si alguno de los datos no existe (está vacío), el resultado se considera vacío para evitar errores.
```text
Horómetro Final - Horómetro Inicial
```

**Kilómetros Trabajados (Por registro)**  
Calcula la diferencia entre el kilometraje final y el inicial. Si la diferencia es cero, se ignora el registro; de lo contrario, muestra la distancia recorrida.
```text
Kilometraje Final - Kilometraje Inicial
```

**Rendimiento: Galones por Hora**  
Indicador de eficiencia temporal. Divide la cantidad de galones del último tanqueo entre la diferencia de horas transcurridas entre tanqueos.
```text
Cantidad Galones Último Tanqueo / Diferencia Horas Tanqueo
```

**Rendimiento: Kilómetros por Galón**  
Indicador de eficiencia por distancia. Divide la diferencia de kilómetros recorridos entre los galones suministrados. Si la cantidad de galones es cero, no realiza el cálculo.
```text
Diferencia Kilómetros Tanqueo / Cantidad Galones Último Tanqueo (k)
```

**Consumo Promedio (Horas)**  
Obtiene el promedio simple de todos los registros de rendimiento calculados en horas.
```text
Promedio de la columna [Galones/hora]
```

**Consumo Promedio (Kilómetros)**  
Obtiene el promedio simple de todos los registros de rendimiento calculados en kilómetros.
```text
Promedio de la columna [Kilometros/Galon]
```

**Consumo Promedio Dinámico**  
Esta medida decide qué promedio mostrar basándose en la selección del usuario (si seleccionó ver por "Horas" o por "Kilómetros").
```text
SI (Selección es "Horas")
    ENTONCES Mostrar [Consumo Promedio (horas)]
SINO
    Mostrar [Consumo Promedio (Kilometros)]
```

**Consumo Promedio Diario**  
Calcula cuántos galones se consumen en promedio por día activo. Divide el total de galones entre la cantidad de días distintos en los que hubo registro de combustible.
```text
[Galones Totales] / Cantidad de Días con registro de Combustible
```

**Consumo Total (Cálculo Inteligente)**  
Es una suma compleja que intenta calcular el consumo priorizando la mejor información disponible en el siguiente orden:
1. Diferencia de horómetros multiplicada por el promedio.
2. Kilometraje de tanqueo directo.
3. Horas de tanqueo multiplicadas por el promedio.
```text
Suma de (Cálculo basado en Horómetros O BIEN Tanqueo Directo)
```

**Máquinas con Consumo**  
Cuenta cuántas máquinas únicas tienen un consumo calculado mayor a cero en el periodo seleccionado.
```text
Contar máquinas donde [Consumo Total] es mayor a 0
```

**Cantidad de Tanqueos**  
Cuenta cuántos registros únicos de suministro de combustible (diferentes de cero) existen en la base de datos.
```text
Conteo distinto de registros en columna [Combustible]
```

### 2. Descripción de Cada Visualización

**Galones Totales por Máquina**
*   **Tipo de Gráfico:** Gráfico de Barras.
*   **Qué muestra:** El volumen total de combustible consumido desglosado por cada equipo individual.
*   **Eje X:** Nombre del equipo (Máquina).
*   **Eje Y:** `**Galones Totales**`.

**Galones Totales y Consumo Promedio por Fecha**
*   **Tipo de Gráfico:** Gráfico de Líneas (Eje doble).
*   **Qué muestra:** La evolución temporal del consumo de combustible comparada con la eficiencia (rendimiento) a lo largo del tiempo.
*   **Eje X:** Fecha.
*   **Eje Y Primario:** `**Galones Totales**` (Volumen consumido).
*   **Eje Y Secundario:** `**Consumo Promedio Dinámico**` (Muestra Galones/Hora o Km/Galón según la selección del usuario).

**Consumo Total y Promedio x Mes**
*   **Tipo de Gráfico:** Gráfico de Barras.
*   **Qué muestra:** Un resumen mensual acumulado para analizar tendencias estacionales o mensuales.
*   **Eje X:** Mes.
*   **Eje Y:** Utiliza dos medidas comparativas:
    1. `**Galones Totales**`.
    2. `**Consumo Promedio Dinámico**`.

**Tabla Informativa**
*   **Tipo de Visualización:** Tabla de detalle y Tarjetas de Resumen (Cards).
*   **Qué muestra:** Un desglose numérico detallado de la operación y métricas clave de resumen (Etiquetas).

| Nombre Columna | Qué muestra | Medida utilizada |
| :--- | :--- | :--- |
| **Columna 1** | Total de horas operativas | Suma de `**Horas Trabajadas**` |
| **Columna 2** | Total de distancia recorrida | Suma de `**Kilómetros Trabajados**` |
| **Columna 3** | Promedio de galones por día | `**Consumo Promedio Diario**` |
| **Columna 4** | Cantidad de equipos activos | `**Máquinas con Consumo**` |
| **Columna 5** | Frecuencia de abastecimiento | `**Cantidad de Tanqueos**` |

**Etiquetas (Tarjetas/Cards):**
1.  **Etiqueta 1:** `**Galones Totales**`.
2.  **Etiqueta 2:** `**Máquinas con Consumo**`.
3.  **Etiqueta 3:** `**Consumo Promedio**`.

---

## Parte 2: Dashboard Registro de Horas Trabajadas

### 1. Medidas Base y Fórmulas Explicadas

**% Ocupación (Por registro)**
Calcula el porcentaje de ocupación de un equipo. Si la unidad de medida es kilómetros ("k"), no aplica (queda vacío). De lo contrario, divide los días trabajados por los días totales del mes.
```text
SI (Unidad de Medida es "k")
    ENTONCES Vacío
SINO
    Días Trabajados / Días del Mes
```

**% Promedio Ocupación**
Promedio simple de los porcentajes de ocupación calculados individualmente.
```text
Promedio de la columna [% Ocupación]
```

**Horas Máquina**
Suma total de las horas reportadas para la maquinaria en los informes diarios.
```text
Suma de la columna [Horas Máquina]
```

**Horas Hombre**
Suma total de las horas hombre reportadas en los informes diarios.
```text
Suma de la columna [Horas Hombre]
```

**Equipo Fuera de Servicio (Identificador)**
Marca con un 1 si el equipo está en mantenimiento (cuando el "Contratante" es "MANTENIMIENTO") y 0 si está operativo.
```text
SI (Contratante es "MANTENIMIENTO") ENTONCES 1 SINO 0
```

**Cantidad de Máquinas Indisponibles**
Cuenta cuántas máquinas distintas han estado marcadas como fuera de servicio en el periodo seleccionado.
```text
Conteo distinto de Máquinas donde [Equipo Fuera de Servicio] es 1
```

**Días con Equipos Fuera de Servicio**
Cuenta cuántos días (consecutivos) hubo al menos un equipo fuera de servicio.
```text
Conteo distinto de días donde [Equipo Fuera de Servicio] es 1
```

**Reportes Elaborados**
Cuenta la cantidad total de reportes únicos generados.
```text
Conteo distinto de [ID] de reporte
```

**% Equipos No Operativos**
Indicador de inoperatividad. Divide la cantidad de días con equipos fuera de servicio entre el total de reportes elaborados.
```text
[Días con Equipos Fuera de Servicio] / [Reportes Elaborados]
```

**Días Trabajados**
Cuenta la cantidad de fechas distintas en las que hubo actividad registrada.
```text
Conteo distinto de la columna [Fecha]
```

**Días del Mes**
Calcula el número total de días del mes correspondiente a la fecha del registro (ej. 30, 31).
```text
Días totales del mes de la fecha seleccionada
```

### 2. Descripción de Cada Visualización

**Gráfico de Barras: Q Horas por Equipo**
*   **Tipo de Gráfico:** Gráfico de Barras.
*   **Qué muestra:** Total de horas trabajadas por cada equipo.
*   **Eje X:** `**Horas Máquina**`.
*   **Eje Y:** Nombre del Equipo.

**Gráfico de Líneas: % Promedio Ocupación y Equipos Operando**
*   **Tipo de Gráfico:** Gráfico de Líneas y Columnas.
*   **Qué muestra:** Comparativa mensual de la ocupación y el estado de la flota.
*   **Eje X:** Mes.
*   **Eje Y Primario:** `**% Promedio Ocupación**` y porcentaje de equipos fuera de servicio.
*   **Eje Y Secundario:** Cantidad de equipos (Recuento de Máquinas).

**Tabla Informativa**
*   **Tipo de Visualización:** Tabla de detalle y Tarjetas de Resumen (Cards).
*   **Qué muestra:** Un desglose numérico detallado de la actividad operativa.

| Nombre Columna | Qué muestra | Medida utilizada |
| :--- | :--- | :--- |
| **Columna 1** | Días Trabajados | `**Días Trabajados**` |
| **Columna 2** | Días Mes | `**Días del Mes**` |
| **Columna 3** | % Ocupación | `**Días Trabajados**` / `**Días del Mes**` |
| **Columna 4** | Reportes Elaborados | `**Reportes Elaborados**` |
| **Columna 5** | Horas Máquina | `**Horas Máquina**` |
| **Columna 6** | Horas Hombre | `**Horas Hombre**` |

**Etiquetas (Tarjetas/Cards):**
1.  **Etiqueta 1:** `**% Promedio Ocupación**`.
2.  **Etiqueta 2:** `**Horas Máquina**`.
3.  **Etiqueta 3:** `**Cantidad de Máquinas Indisponibles**`.
4.  **Etiqueta 4:** `**% Equipos No Operativos**`.

---

## Parte 3: Dashboard Detallado de Servicios

### 1. Medidas Base y Fórmulas Explicadas

**Horas Hombre Trabajadas**
Calcula el tiempo neto de trabajo en horas. Toma el tiempo total de trabajo, lo convierte a horas y le resta el tiempo de descanso.
```text
(Tiempo Total Trabajo * 24) - Tiempo Descanso en Horas
```

**Fecha Mínima Seleccionada**
Identifica la fecha más antigua dentro del rango de fechas filtrado por el usuario.
```text
Mínimo valor de la columna [Fecha] en la selección actual
```

**Fecha Máxima Seleccionada**
Identifica la fecha más reciente dentro del rango de fechas filtrado por el usuario.
```text
Máximo valor de la columna [Fecha] en la selección actual
```

**Días Seleccionados**
Calcula la duración en días del periodo seleccionado. Es la diferencia entre la fecha máxima y la mínima, más uno (para incluir el día inicial).
```text
(Fecha Máxima - Fecha Mínima) + 1
```

**Clasificación de Jornada**
Esta es una lógica compleja que categoriza cada turno de trabajo basándose en la hora de inicio, fin y la fecha. Determina si es **Diurno** o **Nocturno**, y si es **Ordinario**, **Dominical** o **Festivo**.

*Reglas:*
1.  Calcula la duración del turno (ajustando si cruza la medianoche).
2.  Calcula cuántas horas caen en horario nocturno (21:00 - 06:00).
3.  Si más de la mitad del turno es nocturno, se clasifica como "Nocturno", de lo contrario "Diurno".
4.  Verifica si la fecha es Domingo o Festivo.
5.  Combina el tipo (Diurno/Nocturno) con la condición del día (Festivo/Dominical).

```text
SI (Horas Nocturnas >= Total Horas / 2) ENTONCES "Nocturno" SINO "Diurno"
+
SI (Es Festivo) ENTONCES " Festivo"
SINO SI (Es Domingo) ENTONCES " Dominical"
```

### 2. Descripción de Cada Visualización

**Horas Trabajadas por Jornada**
*   **Tipo de Gráfico:** Gráfico de Barras.
*   **Qué muestra:** Distribución de las horas trabajadas agrupadas por el tipo de jornada (Ej: Diurno, Nocturno festivo, etc.).
*   **Eje Y:** `**Clasificación de Jornada**`.
*   **Eje X:** `**Horas Hombre Trabajadas**`.

**Horas Trabajadas por Día**
*   **Tipo de Gráfico:** Gráfico de Líneas.
*   **Qué muestra:** Tendencia diaria de las horas hombre consumidas.
*   **Eje X:** Fecha.
*   **Eje Y:** `**Horas Hombre Trabajadas**`.

**Tabla Detallada**
*   **Tipo de Visualización:** Tabla.
*   **Qué muestra:** Listado pormenorizado de los registros con columnas seleccionadas de los informes diarios.

**Etiquetas (Tarjetas/Cards):**
1.  **Etiqueta 1:** `**Horas Hombre Trabajadas**` (Total).
2.  **Etiqueta 2:** `**Fecha Mínima Seleccionada**`.
3.  **Etiqueta 3:** `**Fecha Máxima Seleccionada**`.
4.  **Etiqueta 4:** `**Días Seleccionados**`.

---

## Parte 4: Dashboard de Mantenimientos Correctivos

### 1. Medidas Base y Fórmulas Explicadas

**Q Correctivos**
Realiza un conteo de los registros únicos de mantenimientos correctivos realizados. Se basa en el consecutivo único de cada reporte.
```text
Conteo distinto de [Consecutivo]
```

**Días Entre Mantenimientos (Por registro)**
Calcula el tiempo transcurrido en días desde el último mantenimiento hasta la fecha actual del registro. Si no hay fecha anterior, queda vacío.
```text
Fecha Actual - Fecha Mantenimiento Anterior
```

**Promedio Días Entre Mantenimientos (MTTB)**
Calcula el promedio de días que transcurren entre fallas o mantenimientos (Mean Time To Between Failures).
```text
Promedio de la columna [Días Entre Mantenimientos]
```

**Normalización Tiempo**
Filtra valores atípicos de tiempo. Si el tiempo reportado es mayor o igual a 100, se considera un error y se excluye (queda vacío).
```text
SI (Tiempo >= 100) ENTONCES Vacío SINO Tiempo
```

**Promedio Horas Mantenimiento (MTTR)**
Calcula la duración promedio de las reparaciones (Mean Time To Repair), utilizando el tiempo normalizado.
```text
Promedio de la columna [Normalización Tiempo]
```

### 2. Descripción de Cada Visualización

**Q Correctivos por Equipo**
*   **Tipo de Gráfico:** Gráfico de Barras.
*   **Qué muestra:** Cantidad de mantenimientos correctivos desglosados por máquina.
*   **Eje Y:** Nombre del Equipo.
*   **Eje X:** `**Q Correctivos**`.

**Cantidad Equipos Intervenidos y Correctivos Totales Realizados x Mes**
*   **Tipo de Gráfico:** Gráfico de Líneas (Eje doble).
*   **Qué muestra:** Evolución mensual del volumen de trabajo de mantenimiento.
*   **Eje X:** Mes.
*   **Eje Y Primario:** `**Q Correctivos**`.
*   **Eje Y Secundario:** Cantidad de Máquinas (Recuento de equipos distintos intervenidos).

**Tabla Detalle**
*   **Tipo de Visualización:** Tabla de detalle.
*   **Qué muestra:** Indicadores clave de rendimiento (KPIs) de mantenimiento.

| Nombre Columna | Qué muestra | Medida utilizada |
| :--- | :--- | :--- |
| **Columna 1 (MTTB)** | Promedio días entre mantenimientos | `**Promedio Días Entre Mantenimientos**` |
| **Columna 2 (MTTR)** | Promedio horas duración mantenimiento | `**Promedio Horas Mantenimiento**` |
| **Columna 3** | Cantidad total de correctivos | `**Q Correctivos**` |

**Etiquetas (Tarjetas/Cards):**
1.  **Etiqueta 1:** `**Q Correctivos**`.
2.  **Etiqueta 2:** `**Promedio Días Entre Mantenimientos**`.

---

## Parte 5: Dashboard de Mantenimientos Preventivos

### 1. Medidas Base y Fórmulas Explicadas

**Frecuencia Vigente (h)**
Determina cada cuántas horas se debe hacer mantenimiento al equipo. Toma la máxima frecuencia configurada para el tipo "h" (horas) en el registro marcado como último mantenimiento.
```text
Máximo de [Frecuencia] donde es el último mantenimiento y tipo es "horas"
```

**Fecha Último Mantenimiento**
Identifica la fecha en la que se realizó el último mantenimiento preventivo registrado.
```text
Máxima Fecha donde [Último Mantenimiento] es Verdadero
```

**Horómetro Último Mantenimiento**
Obtiene el valor del horómetro registrado en el último mantenimiento preventivo.
```text
Máximo Horómetro donde [Último Mantenimiento] es Verdadero
```

**Horas Desde Último Mantenimiento (Acumulado)**
Calcula cuántas horas ha trabajado la máquina desde la fecha de su último mantenimiento hasta hoy.
```text
Suma de [Horas Máquina] donde Fecha > Fecha Último Mantenimiento
```

**Promedio Horas Diarias (Últimos 30 días)**
Calcula el ritmo de trabajo diario de la máquina basándose en los últimos 30 días de actividad registrada. Se excluyen los días sin trabajo (horas > 0) para no sesgar el promedio.
```text
Promedio de [Horas Máquina] en los últimos 30 registros válidos
```

**% Avance a Mantenimiento**
Calcula qué porcentaje del ciclo de mantenimiento se ha consumido.
```text
[Horas Desde Último Mantenimiento] / [Frecuencia Vigente]
```

**Estado Mantenimiento**
Clasifica el estado actual de la máquina según su porcentaje de avance:
*   **Vencido/Realizar Ya:** Avance > 100%
*   **Próximo:** Avance entre 80% y 100%
*   **OK:** Avance < 80%

```text
SI (Avance > 100%) ENTONCES "Vencido"
SINO SI (Avance >= 80%) ENTONCES "Próximo"
SINO "OK"
```

**Próximo Mantenimiento (Tipo)**
Predice qué tipo de mantenimiento toca (A, B, C, etc.) basándose en el último realizado, siguiendo una secuencia cíclica (ej: A -> B -> A1 -> C -> A).
```text
SI (Último fue "A") ENTONCES "B"
SI (Último fue "B") ENTONCES "A1"
...
```

**Horas Restantes para Mantenimiento**
Calcula cuántas horas de trabajo le quedan a la máquina antes de llegar a su límite de frecuencia.
```text
[Frecuencia Vigente] - [Horas Desde Último Mantenimiento]
```

**Días Restantes (Estimación)**
Estima en cuántos días calendario se vencerá el mantenimiento, asumiendo que la máquina seguirá trabajando a su ritmo promedio actual.
```text
[Horas Restantes] / [Promedio Horas Diarias]
```

**Próximo Horómetro (Proyección)**
Calcula en qué horómetro exacto debería realizarse el siguiente mantenimiento.
```text
[Horómetro Último Mantenimiento] + [Frecuencia Vigente]
```

**Fecha Estimada Próximo Mantenimiento**
Calcula la fecha calendario probable para el próximo servicio.
```text
Fecha de Hoy + [Días Restantes]
```

### 2. Descripción de Cada Visualización

**Cantidad de Intervenciones**
*   **Tipo:** Etiqueta (Card).
*   **Qué muestra:** Número total de máquinas distintas a las que se les hace seguimiento de preventivos.
*   **Medida:** Recuento de Máquinas en la tabla de preventivos.

**% Avance Próximo Mantenimiento**
*   **Tipo de Gráfico:** Gráfico de Barras.
*   **Qué muestra:** El nivel de desgaste o avance hacia el próximo servicio para cada equipo.
*   **Eje Y:** Nombre del Equipo.
*   **Eje X:** `**% Avance a Mantenimiento**`.

**Cantidad Preventivos por Mes**
*   **Tipo de Gráfico:** Gráfico de Líneas.
*   **Qué muestra:** Historial de cuántos mantenimientos preventivos se han ejecutado mensualmente.
*   **Eje X:** Mes.
*   **Eje Y:** Cantidad de Máquinas (Recuento).

**Tabla Detalle**
*   **Tipo de Visualización:** Tabla.
*   **Qué muestra:** Un panel de control completo para planificar los próximos mantenimientos.

| Nombre Columna | Qué muestra | Medida utilizada |
| :--- | :--- | :--- |
| **Columna 1** | Estado (Alerta) | `**Estado Mantenimiento**` |
| **Columna 2** | Tipo de servicio sugerido | `**Próximo Mantenimiento (Tipo)**` |
| **Columna 3** | Fecha del servicio anterior | `**Fecha Último Mantenimiento**` |
| **Columna 4** | Fecha estimada del siguiente | `**Fecha Estimada Próximo Mantenimiento**` |
| **Columna 5** | Días que faltan | `**Días Restantes (Estimación)**` |
| **Columna 6** | Horas que faltan | `**Horas Restantes para Mantenimiento**` |
| **Columna 7** | Horómetro del servicio anterior | `**Horómetro Último Mantenimiento**` |
| **Columna 8** | Horómetro meta del siguiente | `**Próximo Horómetro (Proyección)**` |
| **Columna 9** | Horas trabajadas desde el último | `**Horas Desde Último Mantenimiento**` |
| **Columna 10** | Ritmo de trabajo diario | `**Promedio Horas Diarias**` |
| **Columna 11** | % de desgaste actual | `**% Avance a Mantenimiento**` |
