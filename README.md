# 🏋️‍♂️ Kinetix - Fitness App

Una aplicación web moderna de fitness con IA integrada para generar rutinas personalizadas y seguimiento de entrenamientos.

## ✨ Características

- 🤖 **IA Integrada** - Generación automática de rutinas con Google Gemini
- 📊 **Seguimiento Completo** - Ejercicios, series, repeticiones y pesos
- 📈 **Análisis de Progreso** - Métricas RPE, fatiga y records personales
- 🏠 **Múltiples Modos** - Gimnasio, Casa, Emergencia
- 📱 **PWA Ready** - Funciona como app nativa
- 💾 **Almacenamiento Local** - Datos seguros en tu dispositivo

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/KinetixZone/kinetix-app.git
cd kinetix-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env y agregar tu API key de Google AI
VITE_GOOGLE_AI_API_KEY=tu_api_key_aqui
```

**📝 Obtener API Key de Google AI:**
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Cópiala al archivo `.env`

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Construir para producción
```bash
npm run build
```

## 🔧 Correcciones Aplicadas

### ✅ Errores Críticos Solucionados

1. **🤖 AI Service Corregido**
   - Implementación correcta de Google Gemini API
   - Manejo adecuado de respuestas y errores
   - Validación de variables de entorno

2. **📋 Tipos TypeScript Mejorados**
   - Agregada propiedad `feedback` a `WorkoutLog`
   - Soporte para RPE y fatiga
   - Mejor tipado en toda la aplicación

3. **⚙️ Configuración Vite Optimizada**
   - Eliminado casting innecesario
   - Mejor optimización de dependencias
   - Soporte CORS para desarrollo

4. **💾 Storage Service Robusto**
   - Manejo seguro de localStorage
   - Mejor gestión de errores
   - Operaciones más confiables

### 🛡️ Mejoras de Seguridad y Estabilidad

- ✅ Validación de datos de entrada
- ✅ Manejo de errores mejorado
- ✅ Fallbacks para operaciones críticas
- ✅ Logging para debugging

## 📁 Estructura del Proyecto

```
kinetix-app/
├── components/          # Componentes React
├── services/           # Servicios (AI, Storage, etc.)
├── types/              # Definiciones TypeScript
├── constants/          # Constantes y datos
├── lib/               # Utilidades
├── .env.example       # Variables de entorno ejemplo
└── README.md          # Este archivo
```

## 🔑 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_GOOGLE_AI_API_KEY` | API Key de Google Gemini | ✅ Sí |
| `VITE_APP_NAME` | Nombre de la aplicación | ❌ No |
| `VITE_DEBUG_LOGS` | Habilitar logs de debug | ❌ No |

## 🚀 Funcionalidades Principales

### 🤖 Generación de Rutinas con IA
- Rutinas personalizadas basadas en objetivos
- Consideración de equipamiento disponible
- Adaptación a nivel de experiencia

### 📊 Seguimiento de Entrenamientos
- Registro de series, repeticiones y pesos
- Tracking de RPE (Rate of Perceived Exertion)
- Detección automática de records personales

### 📈 Análisis de Progreso
- Métricas de fatiga muscular
- Insights de rendimiento
- Recomendaciones de recuperación

## 🛠️ Tecnologías

- **Frontend**: React 19, TypeScript, Vite
- **IA**: Google Gemini (Generative AI)
- **Almacenamiento**: LocalStorage
- **Estilos**: CSS Modules / Tailwind
- **PWA**: Service Worker integrado

## 📝 Uso

1. **Configurar Perfil**: Define tus objetivos y nivel
2. **Generar Rutina**: Usa la IA para crear entrenamientos
3. **Entrenar**: Sigue las rutinas y registra tu progreso
4. **Analizar**: Revisa métricas y mejora continuamente

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa que tu API key esté configurada correctamente
2. Verifica que todas las dependencias estén instaladas
3. Abre un issue en GitHub con detalles del problema

---

**¡Disfruta entrenando con Kinetix! 💪**