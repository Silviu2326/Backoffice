import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Image, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase, supabaseUrl } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

const logoImage = require('../assets/gato1.png');

// Traducciones
const translations = {
  es: {
    greeting: 'HOLA,',
    tabs: {
      INICIO: 'Inicio',
      EVENTOS: 'Eventos',
      CERVEZAS: 'Cervezas',
      PERSONAJES: 'Personajes',
      BARES: 'Bares',
      'EL GATO COOL PUB': 'El Gato Cool Pub',
      LOGROS: 'Logros y Recompensas',
      'BEER RUN': 'Beer Run',
      'CHAT IA': 'Chat IA',
      CONTACTO: 'Contacto',
    }
  },
  en: {
    greeting: 'HELLO,',
    tabs: {
      INICIO: 'Home',
      EVENTOS: 'Events',
      CERVEZAS: 'Beers',
      PERSONAJES: 'Characters',
      BARES: 'Bars',
      'EL GATO COOL PUB': 'El Gato Cool Pub',
      LOGROS: 'Achievements & Rewards',
      'BEER RUN': 'Beer Run',
      'CHAT IA': 'AI Chat',
      CONTACTO: 'Contact',
    }
  }
};

const tabs = [
  { key: 'INICIO', icon: 'home' },
  { key: 'CHAT IA', icon: 'chatbubbles' },
  { key: 'EVENTOS', icon: 'calendar' },
  { key: 'CERVEZAS', icon: 'wine' },
  { key: 'PERSONAJES', icon: 'people' },
  { key: 'BARES', icon: 'storefront' },
  { key: 'EL GATO COOL PUB', icon: 'map' },
  { key: 'LOGROS', icon: 'trophy' },
  { key: 'BEER RUN', icon: 'bicycle' },
  { key: 'CONTACTO', icon: 'mail' },
];

export default function CustomHeader({
  activeTab,
  onTabPress,
  onNotificationPress,
  onCartPress,
  onAvatarPress,
  onLanguageChange, // Callback para notificar cambios de idioma
  onAvatarChange, // Callback para notificar cambios de avatar
  cartItemCount = 0,
  notificationCount = 0,
  userName = '[NAME]',
  userAvatar = null,
  session = null, // Sesión pasada como prop para evitar getSession() que se cuelga
}) {
  const [displayUserName, setDisplayUserName] = useState(userName);
  const [currentLanguage, setCurrentLanguage] = useState('es'); // Idioma por defecto: español

  // Sincronizar estado si cambia la prop
  useEffect(() => {
    if (userName !== '[NAME]') {
      setDisplayUserName(userName);
    }
  }, [userName]);

  // Notificar al padre cuando cambie el idioma
  useEffect(() => {
    if (onLanguageChange) {
      console.log('📢 [Header] Notificando cambio de idioma al padre:', currentLanguage);
      onLanguageChange(currentLanguage);
    }
  }, [currentLanguage, onLanguageChange]);

  // Mapeo de avatar_url a imágenes locales (definido fuera del componente para reutilización)
  const AVATAR_MAP = {
    '/assets/avatares/BUCK.png': require('../assets/avatares-20250930T165915Z-1-001/avatares/BUCK.png'),
    '/assets/avatares/CANDELA.png': require('../assets/avatares-20250930T165915Z-1-001/avatares/CANDELA.png'),
    '/assets/avatares/CATIRA.png': require('../assets/avatares-20250930T165915Z-1-001/avatares/CATIRA.png'),
    '/assets/avatares/COOL CAT.png': require('../assets/avatares-20250930T165915Z-1-001/avatares/COOL CAT.png'),
    '/assets/avatares/GUAJIRA.png': require('../assets/avatares-20250930T165915Z-1-001/avatares/GUAJIRA.png'),
    '/assets/avatares/MEDUSA.png': require('../assets/avatares-20250930T165915Z-1-001/avatares/MEDUSA.png'),
    '/assets/avatares/morena.png': require('../assets/avatares-20250930T165915Z-1-001/avatares/morena.png'),
    '/assets/avatares/SIFRINA.png': require('../assets/avatares-20250930T165915Z-1-001/avatares/SIFRINA.png'),
  };

  const [userAvatarImage, setUserAvatarImage] = useState(userAvatar);
  const [userAvatarId, setUserAvatarId] = useState(null); // ID del avatar (ej: 'sifrina', 'buck')

  // Función para convertir avatar path a character ID
  const avatarPathToCharacterId = (avatarPath) => {
    if (!avatarPath) return null;

    // Mapeo de rutas de avatar a IDs de personaje
    const pathToId = {
      '/assets/avatares/COOL CAT.png': 'gatoCool',
      '/assets/avatares/BUCK.png': 'buck',
      '/assets/avatares/CATIRA.png': 'catira',
      '/assets/avatares/morena.png': 'morena',
      '/assets/avatares/CANDELA.png': 'candela',
      '/assets/avatares/GUAJIRA.png': 'guajira',
      '/assets/avatares/MEDUSA.png': 'medusa',
      '/assets/avatares/SIFRINA.png': 'sifrina',
    };

    // Si el path está en el mapa, retornar el ID
    if (pathToId[avatarPath]) {
      return pathToId[avatarPath];
    }

    // Si es un texto simple como 'sifrina', 'buck', etc.
    const lowercasePath = avatarPath.toLowerCase();
    if (lowercasePath === 'sifrina') return 'sifrina';
    if (lowercasePath === 'buck') return 'buck';
    if (lowercasePath === 'catira') return 'catira';
    if (lowercasePath === 'morena') return 'morena';
    if (lowercasePath === 'candela') return 'candela';
    if (lowercasePath === 'guajira') return 'guajira';
    if (lowercasePath === 'medusa') return 'medusa';
    if (lowercasePath === 'cool cat' || lowercasePath === 'gato cool') return 'gatoCool';

    return null;
  };

  // Notificar al padre cuando cambie el avatar desde props
  useEffect(() => {
    if (onAvatarChange && userAvatar && !userAvatarImage) {
      // Solo si viene del prop y no hemos cargado de DB aún
      console.log('📢 [Header] Notificando cambio de avatar desde props al padre:', { image: !!userAvatar });
      onAvatarChange(userAvatar, null);
    }
  }, [userAvatar, onAvatarChange]);

  // Cliente con service_role para bypasear RLS (solo para operaciones de lectura)
  // ⚠️ IMPORTANTE: Esto solo funciona si EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY está en las variables de entorno
  const getServiceRoleClient = () => {
    const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.warn('[Header] SUPABASE_SERVICE_ROLE_KEY no configurado, usando cliente normal');
      return supabase;
    }
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  };

  // Función para cargar idioma desde la base de datos
  const loadLanguageFromDB = async (userId) => {
    try {
      console.log('🌐 [Header] Cargando idioma para userId:', userId);

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://uxcuxmyvnkdsmvgqrkrs.supabase.co';
      const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

      if (!serviceRoleKey) {
        console.warn('⚠️ [Header] No hay service_role key para idioma, usando cliente normal');
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('language')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && profile?.language) {
          console.log('✅ [Header] Idioma encontrado:', profile.language);
          return profile.language;
        }
        return 'es'; // Default
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `${supabaseUrl}/rest/v1/user_profiles?select=language&user_id=eq.${userId}&limit=1`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const profile = Array.isArray(data) && data.length > 0 ? data[0] : null;

          if (profile?.language) {
            console.log('✅ [Header] Idioma cargado:', profile.language);
            return profile.language;
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('⏱️ [Header] Timeout cargando idioma');
        }
      }
    } catch (error) {
      console.error('🌐 [Header] Error cargando idioma:', error);
    }

    return 'es'; // Default español
  };

  // Función para cargar avatar desde la base de datos usando fetch directo
  const loadAvatarFromDB = async (userId) => {
    try {
      console.log('🔍 [Header] Buscando avatar para userId:', userId);
      
      // Usar fetch directo con timeout para evitar que se cuelgue
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://uxcuxmyvnkdsmvgqrkrs.supabase.co';
      const serviceRoleKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      
      if (!serviceRoleKey) {
        console.warn('⚠️ [Header] No hay service_role key, usando cliente normal');
        // Fallback al cliente normal
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('avatar_url, avatar')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (!profileError && profile) {
          const avatarValue = profile.avatar_url || profile.avatar;
          if (avatarValue) {
            const avatarSource = AVATAR_MAP[avatarValue];
            if (avatarSource) {
              console.log('✅ [Header] Avatar encontrado con cliente normal');
              return { image: avatarSource, path: avatarValue };
            }
          }
        }
        return null;
      }
      
      console.log('⏳ [Header] Iniciando fetch directo con timeout de 5s...');
      
      // Usar AbortController para timeout real
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏱️ [Header] TIMEOUT: Cancelando consulta después de 5 segundos');
        controller.abort();
      }, 5000);
      
      const url = `${supabaseUrl}/rest/v1/user_profiles?select=avatar_url,avatar&user_id=eq.${userId}&limit=1`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [Header] Fetch completado exitosamente');
        
        const profile = Array.isArray(data) && data.length > 0 ? data[0] : (data || null);
        console.log('📊 [Header] Resultado de consulta avatar:');
        console.log('  - Profile data:', profile);
        console.log('  - Profile completo (JSON):', JSON.stringify(profile, null, 2));

        if (profile) {
          const avatarValue = profile.avatar_url || profile.avatar;
          console.log('🖼️ [Header] Avatar value encontrado:', avatarValue);
          console.log('  - avatar_url:', profile.avatar_url);
          console.log('  - avatar (legacy):', profile.avatar);
          console.log('  - Valor usado:', avatarValue);
          
          if (avatarValue) {
            console.log('🖼️ [Header] Avatar encontrado en DB:', avatarValue);
            const avatarSource = AVATAR_MAP[avatarValue];
            console.log('🖼️ [Header] Avatar mapeado:', avatarSource ? '✅ Encontrado' : '❌ No encontrado');
            console.log('  - Keys disponibles en AVATAR_MAP:', Object.keys(AVATAR_MAP));
            
            if (avatarSource) {
              console.log('🖼️ [Header] Avatar mapeado correctamente');
              return { image: avatarSource, path: avatarValue };
            } else {
              console.warn('🖼️ [Header] Avatar no encontrado en mapa:', avatarValue);
              console.warn('  - Buscando:', avatarValue);
              console.warn('  - Keys en mapa:', Object.keys(AVATAR_MAP));
            }
          } else {
            console.log('⚠️ [Header] No hay avatar en el perfil');
          }
        } else {
          console.warn('⚠️ [Header] Perfil no encontrado');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('⏱️ [Header] Fetch cancelado por timeout');
          throw new Error('Timeout: La consulta de avatar tardó más de 5 segundos');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('🖼️ [Header] ❌ Error cargando avatar:');
      console.error('  - Error name:', error.name);
      console.error('  - Error message:', error.message);
      console.error('  - Error stack:', error.stack);
      console.error('  - Error completo:', JSON.stringify(error, null, 2));
      
      // Si es un timeout, intentar una vez más con el cliente normal
      if (error.message && error.message.includes('Timeout')) {
        console.warn('⚠️ [Header] Timeout detectado, intentando con cliente normal...');
        try {
          const retryTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout en reintento')), 3000)
          );
          
          const retryQuery = supabase
            .from('user_profiles')
            .select('avatar_url, avatar')
            .eq('user_id', userId)
            .maybeSingle();
          
          const { data: profile, error: profileError } = await Promise.race([retryQuery, retryTimeout]);
          
          if (!profileError && profile) {
            const avatarValue = profile.avatar_url || profile.avatar;
            if (avatarValue) {
              const avatarSource = AVATAR_MAP[avatarValue];
              if (avatarSource) {
                console.log('✅ [Header] Avatar encontrado con cliente normal después de timeout');
                return { image: avatarSource, path: avatarValue };
              }
            }
          }
        } catch (retryError) {
          console.error('❌ [Header] Error en reintento con cliente normal:', retryError);
        }
      }
    }
    return null;
  };

  // Sincronizar avatar si cambia la prop
  useEffect(() => {
    if (userAvatar) {
      setUserAvatarImage(userAvatar);
    }
  }, [userAvatar]);

  // Cargar avatar al montar y cuando cambie la sesión
  useEffect(() => {
    let isMounted = true;

    const loadUserAndAvatar = async () => {
      try {
        // Usar la sesión pasada como prop en lugar de llamar a getSession()
        const currentSession = session;
        console.log('👤 [Header] Usando sesión de props:', !!currentSession);
        console.log('👤 [Header] Session data:', currentSession);
        
        if (currentSession?.user) {
          console.log('👤 [Header] ✅ Sesión encontrada');
          console.log('  - User ID:', currentSession.user.id);
          console.log('  - Email:', currentSession.user.email);
          console.log('  - User completo:', JSON.stringify(currentSession.user, null, 2));
          
          if (isMounted) {
            // 1. Mostrar email inmediatamente como fallback
            console.log('👤 [Header] Estableciendo email como nombre:', currentSession.user.email);
            setDisplayUserName(currentSession.user.email);
          }

          // 2. Cargar idioma inmediatamente
          console.log('🌐 [Header] Iniciando carga de idioma...');
          const language = await loadLanguageFromDB(currentSession.user.id);
          console.log('🌐 [Header] Idioma cargado:', language);
          if (language && isMounted) {
            setCurrentLanguage(language);
          }

          // 3. Cargar avatar inmediatamente
          console.log('🖼️ [Header] Iniciando carga de avatar...');
          const avatarData = await loadAvatarFromDB(currentSession.user.id);
          console.log('🖼️ [Header] Avatar cargado:', avatarData ? '✅ Encontrado' : '❌ No encontrado');
          console.log('🖼️ [Header] Avatar data:', avatarData);
          if (avatarData && isMounted) {
            console.log('🖼️ [Header] Estableciendo avatar en estado con:', avatarData);
            setUserAvatarImage(avatarData.image);
            const characterId = avatarPathToCharacterId(avatarData.path);
            setUserAvatarId(characterId);
            console.log('🖼️ [Header] ✅ Estado actualizado - Image:', !!avatarData.image, 'ID:', characterId);

            // Notificar al padre inmediatamente con los valores calculados (no esperar a que el estado se actualice)
            if (onAvatarChange) {
              console.log('📢 [Header] Notificando cambio de avatar al padre:', { image: !!avatarData.image, id: characterId });
              onAvatarChange(avatarData.image, characterId);
            }
          } else {
            console.warn('🖼️ [Header] ⚠️ No se pudo establecer avatar:', {
              avatarData: !!avatarData,
              isMounted,
              reason: !avatarData ? 'No hay avatarData' : !isMounted ? 'Componente desmontado' : 'Desconocido'
            });
          }

          // 4. Intentar buscar nombre real en perfil
          // Usar cliente con service_role para bypasear RLS
          const supabaseClient = getServiceRoleClient();
          console.log('🔍 [Header] Buscando nombre completo para userId:', currentSession.user.id);
          console.log('🔍 [Header] Iniciando consulta a user_profiles...');
          console.log('🔍 [Header] Usando service_role client:', !!process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
          
          const profilePromise = supabaseClient
            .from('user_profiles')
            .select('first_name, last_name, avatar_url, avatar, email, phone, full_name')
            .eq('user_id', currentSession.user.id)
            .maybeSingle();
          
          console.log('🔍 [Header] Promise de perfil creada, esperando respuesta...');
          const { data: profile, error: profileError } = await profilePromise;
          console.log('🔍 [Header] ✅ Consulta de perfil completada');

          console.log('📊 [Header] Resultado de consulta perfil completo:');
          console.log('  - Profile data:', profile);
          console.log('  - Profile error:', profileError);
          console.log('  - Profile completo (JSON):', JSON.stringify(profile, null, 2));

          if (!profileError && profile && isMounted) {
            console.log('✅ [Header] Perfil encontrado:');
            console.log('  - first_name:', profile.first_name);
            console.log('  - last_name:', profile.last_name);
            console.log('  - full_name:', profile.full_name);
            console.log('  - email:', profile.email);
            console.log('  - phone:', profile.phone);
            console.log('  - avatar_url:', profile.avatar_url);
            console.log('  - avatar:', profile.avatar);
            
            const fullName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            if (fullName) {
              console.log('👤 [Header] Nombre completo a mostrar:', fullName);
              setDisplayUserName(fullName);
            } else {
              console.log('⚠️ [Header] No hay nombre completo disponible');
            }
          } else {
            console.warn('⚠️ [Header] Error o perfil no encontrado');
            console.warn('  - Profile error:', profileError);
            console.warn('  - Profile data:', profile);
            if (profileError) {
              console.warn('  - Error code:', profileError.code);
              console.warn('  - Error message:', profileError.message);
              console.warn('  - Error details:', JSON.stringify(profileError, null, 2));
            }
          }
        } else {
          console.log('👤 [Header] ⚠️ No hay sesión activa');
          console.log('  - Session:', session);
          console.log('  - Session?.user:', session?.user);
        }
      } catch (error) {
        console.error('👤 [Header] ❌ Excepción al cargar usuario:');
        console.error('  - Error name:', error.name);
        console.error('  - Error message:', error.message);
        console.error('  - Error stack:', error.stack);
        console.error('  - Error completo:', JSON.stringify(error, null, 2));
      }
    };

    loadUserAndAvatar();

    return () => {
      isMounted = false;
    };
  }, [session]); // Re-ejecutar cuando cambie la sesión

  // Recargar avatar e idioma periódicamente para mantenerlos actualizados
  useEffect(() => {
    if (!session?.user) return; // No hacer nada si no hay sesión

    const interval = setInterval(async () => {
      try {
        // Usar la sesión de props en lugar de getSession() que se cuelga
        if (session?.user) {
          console.log('🔄 [Header] Recargando avatar e idioma periódicamente para userId:', session.user.id);

          // Recargar avatar
          const avatarData = await loadAvatarFromDB(session.user.id);
          if (avatarData) {
            console.log('✅ [Header] Avatar recargado correctamente');
            setUserAvatarImage(avatarData.image);
            const characterId = avatarPathToCharacterId(avatarData.path);
            setUserAvatarId(characterId);

            // Notificar al padre inmediatamente con los valores calculados
            if (onAvatarChange) {
              console.log('📢 [Header] Notificando cambio de avatar recargado al padre:', { image: !!avatarData.image, id: characterId });
              onAvatarChange(avatarData.image, characterId);
            }
          } else {
            console.log('⚠️ [Header] No se pudo recargar avatar');
          }

          // Recargar idioma
          const language = await loadLanguageFromDB(session.user.id);
          if (language) {
            console.log('✅ [Header] Idioma recargado correctamente:', language);
            setCurrentLanguage(language);
          }
        }
      } catch (error) {
        console.error('❌ [Header] Error al recargar avatar/idioma:', error);
      }
    }, 3000); // Verificar cada 3 segundos

    return () => clearInterval(interval);
  }, [session?.user?.id]); // Re-ejecutar cuando cambie el userId

  // Default avatar - use loaded avatar or provided prop or fallback to icon
  const avatarSource = userAvatarImage || userAvatar;

  // Obtener traducciones para el idioma actual
  const t = translations[currentLanguage] || translations.es;

  // Debug: Log del userName recibido y avatar
  console.log('🎯 [CustomHeader] Render - displayUserName:', displayUserName);
  console.log('🎯 [CustomHeader] Render - userAvatarImage:', !!userAvatarImage, userAvatarImage);
  console.log('🎯 [CustomHeader] Render - userAvatar prop:', !!userAvatar);
  console.log('🎯 [CustomHeader] Render - avatarSource final:', !!avatarSource, avatarSource);
  console.log('🎯 [CustomHeader] Render - currentLanguage:', currentLanguage);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ff6b35" />
      {/* Orange Header Section */}
      <View style={styles.orangeHeader}>
        {/* Left: Avatar and Greeting */}
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
              {avatarSource ? (
                <Image 
                  source={avatarSource}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person-circle" size={46} color="#ff6b35" />
              )}
            </View>
          </TouchableOpacity>
          {/* Greeting text only on INICIO */}
          {activeTab === 'INICIO' && (
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>{t.greeting}</Text>
              <Text style={styles.userNameText}>{displayUserName}</Text>
            </View>
          )}
        </View>

        {/* Center: Logo */}
        <View style={styles.centerSection}>
          <View style={styles.logoCircle}>
            <Image 
              source={logoImage}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Right: Notifications and Cart */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationPress}
          >
            <Ionicons name="notifications-outline" size={24} color="#000000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onCartPress}
          >
            <Ionicons name="bag-outline" size={24} color="#000000" />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* White Navigation Bar with Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive
              ]}
              onPress={() => onTabPress && onTabPress(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={activeTab === tab.key ? 'white' : '#4a4a4a'}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive
                ]}
              >
                {t.tabs[tab.key]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0),
    backgroundColor: '#ff6b35',
    width: '100%',
  },
  orangeHeader: {
    backgroundColor: '#ff6b35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    width: '100%',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    marginRight: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  userNameText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 50,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffb88c',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff6b35',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabsScroll: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginRight: 4,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#ff6b35',
  },
  tabIcon: {
    marginRight: 0,
  },
  tabText: {
    color: '#4a4a4a',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
});
