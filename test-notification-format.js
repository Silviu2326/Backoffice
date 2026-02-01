/**
 * Script de prueba para verificar el formato de las notificaciones
 * Este es el formato exacto que debe enviarse a la API de Expo
 */

// FORMATO CORRECTO según la documentación oficial de Expo
// https://docs.expo.dev/push-notifications/sending-notifications/

const exampleNotificationWithImage = {
  to: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  sound: 'default',
  title: 'Prueba de Notificación',
  body: 'Esta es una notificación con imagen',
  data: {
    // Data personalizada - accesible desde la app
    image: 'https://example.com/image.jpg',
    someData: 'customData'
  },
  // Para Android
  android: {
    channelId: 'default',
    priority: 'high',
    sound: 'default',
    // CAMPO CRÍTICO: image (no imageUrl)
    // Este campo muestra la imagen en la notificación expandida en Android
    image: 'https://example.com/image.jpg',
  },
  // Para iOS (requiere Notification Service Extension)
  ios: {
    sound: 'default',
    _displayInForeground: true,
    attachments: [{
      url: 'https://example.com/image.jpg',
    }],
  },
};

// IMPORTANTE: La URL de la imagen debe:
// 1. Ser pública (accesible sin autenticación)
// 2. Usar HTTPS
// 3. Ser una imagen válida (JPG, PNG, GIF)
// 4. Ser menor a 10MB (recomendado < 2MB)
// 5. Responder rápido (timeout de descarga es corto)

console.log('📝 Formato correcto de notificación con imagen:');
console.log(JSON.stringify(exampleNotificationWithImage, null, 2));

// Verificación de URL de imagen
async function verifyImageUrl(url) {
  console.log('\n🔍 Verificando URL de imagen:', url);

  try {
    const response = await fetch(url, {
      method: 'HEAD', // Solo obtener headers, no descargar la imagen
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Content-Type:', response.headers.get('content-type'));
    console.log('✅ Content-Length:', response.headers.get('content-length'), 'bytes');

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('image')) {
      console.warn('⚠️ ADVERTENCIA: El Content-Type no es una imagen:', contentType);
    }

    const sizeBytes = parseInt(response.headers.get('content-length') || '0');
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    console.log('📏 Tamaño:', sizeMB, 'MB');

    if (sizeBytes > 10 * 1024 * 1024) {
      console.warn('⚠️ ADVERTENCIA: La imagen es muy grande (> 10MB)');
    }

    if (!url.startsWith('https://')) {
      console.warn('⚠️ ADVERTENCIA: La URL no usa HTTPS');
    }

    return true;
  } catch (error) {
    console.error('❌ Error verificando URL:', error.message);
    return false;
  }
}

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    exampleNotificationWithImage,
    verifyImageUrl
  };
}

// Si se ejecuta directamente, hacer una prueba
if (require.main === module) {
  // Ejemplo de URL para probar (reemplazar con tu URL real)
  const testImageUrl = 'https://backendmrcoolcat-production.up.railway.app/images/app-icon.png';
  verifyImageUrl(testImageUrl);
}
