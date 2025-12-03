# Épica: Reporte Diario de Personal

## Título
Implementación del Módulo Independiente "Reporte Diario de Personal"

## Descripción
Crear un formulario completamente independiente para reportes de jornada laboral del personal, separado de los reportes de maquinaria existentes. El módulo incluye validaciones, firma digital, persistencia sin conexión, sincronización automática y generación de PDF corporativo.

## Objetivo de Negocio
- Eliminar contaminación cruzada de datos entre reportes de personal y maquinaria
- Reducir tiempo de reporte de jornadas laborales mediante formulario simplificado
- Mejorar calidad y precisión de datos de personal en proyectos de construcción

## Valor Entregado
- Separación completa de datos reduce errores en un 70%
- Formulario 3x más rápido que el actual de maquinaria
- Mejor trazabilidad de jornadas laborales por empleado
- Flexibilidad para activar/desactivar por cliente según necesidades (funcion que se puede realizar solo para el admin)

---

# Historias de Usuario

## HU-001: Como trabajador quiero ver mis datos personales pre-cargados para verificar mi identidad en el reporte
**Criterios de aceptación:**
- Dado que: Usuario conectado en la aplicación
- Cuando: Accede al formulario "Reporte Diario de Personal"
- Entonces: Se muestran automáticamente nombre completo, cédula y cargo del empleado
- Y: Los campos son de solo lectura
- Y: Se incluye fecha y hora de creación del reporte
**Notas técnicas:** Usar datos del contexto de autenticación actual. Campos no editables visualmente bloqueados.

## HU-002: Como trabajador quiero seleccionar la fecha del reporte para registrar jornadas pasadas o futuras
**Criterios de aceptación:**
- Dado que: Formulario abierto
- Cuando: Selecciona fecha del informe
- Entonces: Campo obligatorio validado
- Y: Selector de fecha muestra calendario completo
- Y: Formato DD/MM/YYYY
**Notas técnicas:** Componente selector de fecha nativo del marco de trabajo actual.

## HU-003: Como trabajador quiero seleccionar el tipo de informe para categorizar mi jornada laboral
**Criterios de aceptación:**
- Nombre campo: Tipo de trabajo
- Dado que: Formulario abierto
- Cuando: Selecciona tipo de informe del menú desplegable
- Entonces: Opciones exactas: "Trabajo de Aparejadores", "Desplazamientos", "Mantenimientos", "Trabajo Administrativo", "Otros"
- Y: Campo obligatorio con validación
- Y: Para opciones 1-4: "Tipo de trabajo" se autocompleta con mismo texto y queda bloqueado
- Y: Para "Otros": Aparece campo texto obligatorio "Frente de trabajo (especificar)"
**Notas técnicas:** Lógica condicional. Campo dinámico que cambia de solo lectura a editable.

## HU-004: Como trabajador quiero registrar mis horas de jornada para calcular tiempo efectivo trabajado
**Criterios de aceptación:**
- Dado que: Formulario abierto
- Cuando: Ingresa hora inicio, fin y descanso
- Entonces: Selectores de tiempo obligatorios con formato HH:MM
- Y: Campo descanso numérico con valor por defecto 60 minutos
- Y: Validación hora fin > hora inicio
- Y: Validación descanso ≤ (hora fin - hora inicio)
**Notas técnicas:** Selectores de tiempo nativos. Cálculos en tiempo real para validaciones.

## HU-005: Como trabajador quiero agregar observaciones opcionales para detallar mi jornada
**Criterios de aceptación:**
- Dado que: Formulario abierto
- Cuando: Escribe en observaciones
- Entonces: Área de texto opcional con límite 500 caracteres
- Y: Contador de caracteres visible
- Y: Validación de longitud máxima
**Notas técnicas:** Área de texto con límite máximo y contador dinámico.

## HU-006: Como trabajador quiero firmar digitalmente mi reporte para validar mi identidad
**Criterios de aceptación:**
- Dado que: Formulario con datos completos
- Cuando: Dibuja firma en lienzo
- Entonces: Lienzo de firma igual al formulario actual de informes diarios
- Y: Solo firma del empleado (sin supervisor)
- Y: Opción de limpiar y rehacer firma
- Y: Firma obligatoria para guardar
**Notas técnicas:** Reutilizar componente de firma existente. Guardar como imagen en base64.

## HU-007: Como trabajador quiero guardar y sincronizar mi reporte sin conexión para trabajar desconectado
**Criterios de aceptación:**
- Dado que: Dispositivo sin conexión
- Cuando: Completa y guarda formulario
- Entonces: Datos guardados en Base de Datos Indexada local
- Y: Sincronización automática al recuperar conexión
- Y: Generación de PDF con diseño corporativo igual al de informes diarios
- Y: Nuevo punto final API: POST /api/reportes-diarios-personal para conexion en PBI
- Y: Datos en colección completamente separada
**Notas técnicas:** Mismo mecanismo de Aplicación Web Progresiva actual. Servicio trabajador para sincronización. Plantilla PDF corporativo adaptada.

## HU-008: Como administrador quiero activar/desactivar el módulo por cliente para controlar acceso
**Criterios de aceptación:**
- Dado que: Usuario con permisos de administrador
- Cuando: Accede al panel de administración de cliente
- Entonces: Interruptor "Habilitar Reporte Diario de Personal" visible
- Y: Al desactivar: menú y opción desaparecen para ese cliente
- Y: Al activar: módulo disponible inmediatamente
- Y: Configuración por cuenta/cliente (no global)
**Notas técnicas:** Nuevo campo en tabla de clientes. Validación en interfaz para mostrar/ocultar menú.

---

# Definición de Terminado (DoD)

La épica se considera completada cuando:

- ✅ Todas las historias de usuario implementadas y probadas en dispositivo móvil
- ✅ Formulario funciona 100% sin conexión con Base de Datos Indexada
- ✅ Sincronización automática al recuperar conexión
- ✅ PDF generado con diseño corporativo idéntico al de maquinaria
- ✅ Punto final API POST /api/reportes-diarios-personal creado y funcional
- ✅ Datos almacenados en colección separada de maquinaria
- ✅ Interruptor de activación/desactivación por cliente operativo
- ✅ Código revisado, sin errores de linter, siguiendo patrones del proyecto
- ✅ Pruebas funcionales en Android/iOS con diferentes tipos de informe
- ✅ Validaciones de negocio implementadas (firmas, campos obligatorios, lógica condicional)
- ✅ Documentación técnica actualizada con nuevos puntos finales y estructuras de datos

---

# Diagrama de Flujo del Formulario
mermaid
flowchart TD
    A[Acceder a Reporte Diario de Personal] --> B[Mostrar metadatos automáticos]
    B --> C[Seleccionar fecha del informe]
    C --> D[Seleccionar tipo de informe]
    D --> E{¿Tipo = 'Otros'?}
    E -->|No| F[Autocompletar 'Frente de trabajo' con tipo seleccionado]
    E -->|Sí| G[Mostrar campo 'Frente de trabajo (especificar)' obligatorio]
    F --> H[Ingresar hora inicio]
    G --> H
    H --> I[Ingresar hora fin]
    I --> J[Ingresar tiempo descanso]
    J --> K[Agregar observaciones opcionales]
    K --> L[Capturar firma digital]
    L --> M{¿Todos campos válidos?}
    M -->|No| N[Mostrar errores de validación]
    N --> C
    M -->|Sí| O[Guardar en Base de Datos Indexada]
    O --> P{¿Conexión disponible?}
    P -->|Sí| Q[Sincronizar con API]
    P -->|No| R[Marcar como pendiente de sincronización]
    Q --> S[Generar PDF corporativo]
    R --> S
    S --> T[Mostrar confirmación de guardado]---

# Boceto Móvil - Descripción Textual

## Pantalla Principal del Formulario
- **Encabezado:** Título "Reporte Diario de Personal" centrado, con botón atrás en esquina superior izquierda
- **Sección Metadatos:** Recuadro gris claro con información del empleado (3 líneas: Nombre, Cédula, Cargo) y marca temporal de creación. Campos no editables, fuente pequeña
- **Campo Fecha:** Selector de fecha de ancho completo con icono calendario. Marcador de posición "Seleccionar fecha"
- **Campo Tipo de Informe:** Menú desplegable obligatorio con 5 opciones exactas. Estilo Material Design con chevrón derecho
- **Campo Frente de Trabajo:** Inicialmente oculto. Aparece dinámicamente según selección anterior. Si autocompletado: campo de solo lectura con fondo gris. Si "Otros": entrada de texto obligatorio
- **Sección Horarios:** Tres campos en fila o columna según pantalla:
  - Hora inicio: Selector de tiempo con icono reloj
  - Hora fin: Selector de tiempo con icono reloj
  - Descanso: Entrada numérica con unidad "minutos", valor predeterminado 60
- **Campo Observaciones:** Área de texto expandible con contador "0/500" en esquina inferior derecha
- **Sección Firma:** Lienzo rectangular de firma con línea punteada "Firmar aquí". Botones "Limpiar" y área de dibujo táctil
- **Botón Guardar:** Botón primario azul de ancho completo en parte inferior, fijo al desplazamiento
- **Espaciado:** 16px entre secciones, relleno 16px lateral
- **Colores:** Tema corporativo actual, campos obligatorios con asterisco rojo
- **Validaciones:** Mensajes de error en rojo debajo de cada campo inválido
- **Adaptable:** Columna única en móvil, campos de tiempo en cuadrícula de 2 columnas en tableta+