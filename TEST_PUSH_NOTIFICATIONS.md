# Test de Notificaciones Push con Imágenes

## ✅ Cambios Implementados

### 1. Frontend (project/src/pages/Notifications.tsx)
- Cambiado de enviar un mensaje con múltiples destinatarios a enviar mensajes individuales
- Actualizado formato de Android: `android.imageUrl` para mostrar imagen en notificación expandida
- Actualizado formato de iOS: `ios.attachments` para adjuntar imágenes (requiere build nativo)
- Mejorada la estructura del payload para cumplir con la API de Expo Push Notifications

### 2. App Móvil (MiAppExpo/app.json)
- Agregado `mode: "production"` al plugin de notificaciones
- Agregado `sounds: ["default"]` para sonidos personalizados

### 3. Documentación
- Creado `NOTIFICACIONES_CON_IMAGENES.md` con guía completa de configuración

## 🧪 Cómo Probar

### Paso 1: Verificar Formato de Notificación
El nuevo formato enviado al backend es:

```javascript
[
  {
    to: "ExponentPushToken[xxxxx]",
    sound: "default",
    title: "Tu título",
    body: "Tu mensaje",
    priority: "high",
    channelId: "default",
    data: {
      image: "https://url-de-tu-imagen.jpg",
      imageUrl: "https://url-de-tu-imagen.jpg"
    },
    android: {
      channelId: "default",
      priority: "high",
      sound: "default",
      imageUrl: "https://url-de-tu-imagen.jpg"
    },
    ios: {
      sound: "default",
      _displayInForeground: true,
      subtitle: "Mr. Cool Cat",
      attachments: [{
        url: "https://url-de-tu-imagen.jpg"
      }]
    }
  },
  // ... más mensajes para otros tokens
]
```

### Paso 2: Preparar Imagen de Prueba
1. Sube una imagen a Supabase Storage (bucket "notifications")
2. La URL debe ser pública y accesible
3. Formatos soportados: JPG, PNG, GIF
4. Tamaño recomendado: 1200x600px (ratio 2:1)
5. La URL debe usar HTTPS

### Paso 3: Probar en Android (EAS Build)

**IMPORTANTE**: Las imágenes NO funcionan en Expo Go. Debes usar un build nativo.

#### Opción A: Crear Build de Desarrollo
```bash
cd MiAppExpo
eas build --profile development --platform android
```

#### Opción B: Crear Build de Producción
```bash
cd MiAppExpo
eas build --profile production --platform android
```

Una vez instalado el build:
1. Abre la app
2. Inicia sesión
3. Desde el panel de admin, envía una notificación con imagen
4. La imagen debería aparecer en la notificación expandida

### Paso 4: Probar en iOS (EAS Build)

**NOTA**: iOS requiere configuración adicional para imágenes.

#### Para desarrollo:
```bash
cd MiAppExpo
eas build --profile development --platform ios
```

#### Configuración adicional necesaria para iOS:
Para que las imágenes funcionen en iOS, necesitas agregar un Notification Service Extension:

1. Crea `app.config.js`:
```javascript
export default {
  expo: {
    ...require('./app.json').expo,
    plugins: [
      ...require('./app.json').expo.plugins,
      [
        "@config-plugins/react-native-nse",
        {
          appGroup: "group.com.mrcoolcat.craftbeer"
        }
      ]
    ]
  }
};
```

2. Instala el plugin:
```bash
npm install @config-plugins/react-native-nse
```

3. Reconstruye:
```bash
eas build --profile production --platform ios
```

## 🔍 Verificación de Funcionamiento

### Android
✅ **Debería verse:**
- Título de la notificación
- Mensaje de la notificación
- Icono de la app
- **Imagen grande al expandir la notificación**

### iOS
✅ **Debería verse:**
- Título de la notificación
- Mensaje de la notificación
- Icono de la app
- **Imagen adjunta (si se configuró Service Extension)**

## 🐛 Troubleshooting

### "No veo la imagen en Android"
1. ✅ Verifica que estés en un build nativo (no Expo Go)
2. ✅ Verifica que la URL de la imagen sea pública
3. ✅ Verifica que la URL use HTTPS
4. ✅ Prueba la URL en un navegador
5. ✅ Revisa los logs: `adb logcat | grep -i notif`

### "No veo la imagen en iOS"
1. ⚠️ **CRÍTICO**: Necesitas un Notification Service Extension
2. ✅ Verifica que la URL use HTTPS
3. ✅ Verifica el tamaño de la imagen (< 10MB)
4. ✅ Verifica el formato (JPG, PNG, GIF)

### Backend
Verifica que el backend esté enviando correctamente:

```bash
# En los logs de Railway deberías ver:
📨 Enviando notificación push: {
  to_count: X,
  title: "Tu título",
  image: "https://..."
}
```

## 📊 Formato de Respuesta de Expo

La API de Expo devuelve:
```json
{
  "data": [
    {
      "status": "ok",
      "id": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
    }
  ]
}
```

O en caso de error:
```json
{
  "data": [
    {
      "status": "error",
      "message": "\"ExponentPushToken[xxx]\" is not a registered push notification recipient",
      "details": {...}
    }
  ]
}
```

## 🎯 Checklist de Verificación

Antes de probar:
- [ ] La app está en un build nativo (no Expo Go)
- [ ] El usuario tiene permisos de notificaciones activados
- [ ] El token push está guardado en la base de datos
- [ ] La imagen está en Supabase Storage y es pública
- [ ] La URL de la imagen usa HTTPS
- [ ] El backend en Railway está funcionando
- [ ] La notificación se envía desde el panel de admin

Para Android específicamente:
- [ ] El canal "default" está configurado en la app
- [ ] El campo `android.imageUrl` está presente en el payload

Para iOS específicamente:
- [ ] Se ha configurado el Notification Service Extension (opcional pero recomendado)
- [ ] El campo `ios.attachments` está presente en el payload
- [ ] La app tiene permisos de notificaciones

## 📝 Logs Útiles

### Frontend (Panel Admin)
```javascript
console.log('📨 Enviando notificación:', {
  tokens: tokens.length,
  title,
  hasImage: !!imageUrl
});
```

### Backend (Railway)
```javascript
console.log('📨 Payload enviado a Expo:', JSON.stringify(payload, null, 2));
```

### App Móvil
Revisa los logs en:
- Android: `adb logcat | grep -E "Notif|Expo"`
- iOS: Xcode Console con filtro "Notification"
