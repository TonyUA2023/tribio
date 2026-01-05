# 📱 Prompt para Desarrollo de App Móvil - TRIBIO

---

## 🎯 CONTEXTO DEL PROYECTO

Eres un desarrollador experto en React Native / Expo que va a crear una **app móvil nativa** para TRIBIO, una plataforma NFC que permite a dueños de negocios gestionar sus perfiles digitales.

---

## 📋 OBJETIVO PRINCIPAL

Desarrollar una aplicación móvil (iOS + Android) que permita a los **dueños de negocio** gestionar su cuenta de forma completa desde sus dispositivos móviles.

### Funcionalidades Principales:
1. ✅ Login / Autenticación
2. ✅ Editar perfil del negocio
3. ✅ Gestionar galería (subir, eliminar, reordenar fotos/videos)
4. ✅ Publicar y gestionar Stories
5. ✅ Ver y gestionar reservas/citas
6. ✅ Ver y moderar reseñas
7. ✅ Dashboard con estadísticas
8. ✅ Notificaciones push
9. ✅ Cambiar logo y portada del negocio

---

## 🛠️ STACK TECNOLÓGICO REQUERIDO

### Framework Base
```
React Native con Expo (Expo SDK 50+)
TypeScript
```

### Librerías Esenciales
```javascript
// Navegación
@react-navigation/native
@react-navigation/native-stack
@react-navigation/bottom-tabs

// Estado global
@tanstack/react-query (React Query v5)
zustand (estado ligero)

// HTTP Client
axios

// UI Components
react-native-paper (Material Design)
// O usar componentes custom con NativeWind (Tailwind para RN)

// Formularios
react-hook-form
zod (validación)

// Imágenes y Media
expo-image-picker
expo-media-library
react-native-fast-image

// Notificaciones
expo-notifications

// Storage local
@react-native-async-storage/async-storage

// Drag & Drop para reordenar
react-native-draggable-flatlist

// Charts/Gráficas
react-native-chart-kit

// Utilidades
date-fns (manejo de fechas)
react-native-toast-message
```

---

## 🏗️ ARQUITECTURA DE LA APP

### Estructura de Carpetas
```
mobile-app/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── profile.ts
│   │   │   ├── gallery.ts
│   │   │   ├── stories.ts
│   │   │   ├── bookings.ts
│   │   │   ├── reviews.ts
│   │   │   └── analytics.ts
│   │   └── types.ts               # TypeScript types
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SplashScreen.tsx
│   │   ├── home/
│   │   │   └── DashboardScreen.tsx
│   │   ├── profile/
│   │   │   ├── EditProfileScreen.tsx
│   │   │   └── EditLogoScreen.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryListScreen.tsx
│   │   │   ├── GalleryUploadScreen.tsx
│   │   │   └── GalleryReorderScreen.tsx
│   │   ├── stories/
│   │   │   ├── StoriesListScreen.tsx
│   │   │   └── StoryCreateScreen.tsx
│   │   ├── bookings/
│   │   │   ├── BookingsListScreen.tsx
│   │   │   └── BookingDetailScreen.tsx
│   │   ├── reviews/
│   │   │   └── ReviewsListScreen.tsx
│   │   └── analytics/
│   │       └── AnalyticsScreen.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryItem.tsx
│   │   │   └── MediaUploader.tsx
│   │   ├── bookings/
│   │   │   ├── BookingCard.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── charts/
│   │       ├── StatsCard.tsx
│   │       └── LineChart.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProfile.ts
│   │   ├── useGallery.ts
│   │   ├── useStories.ts
│   │   ├── useBookings.ts
│   │   └── useAnalytics.ts
│   │
│   ├── store/
│   │   ├── authStore.ts          # Zustand store
│   │   └── notificationStore.ts
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   └── types/
│       ├── api.types.ts
│       ├── navigation.types.ts
│       └── models.types.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── app.json
├── tsconfig.json
└── package.json
```

---

## 🔐 API INTEGRATION

### Base URL y Configuración

```typescript
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api'
  : 'https://tribio.info/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Interceptor para agregar token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - logout
      await AsyncStorage.removeItem('access_token');
      // Navegar a login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Endpoints Implementation

```typescript
// src/api/endpoints/auth.ts
import apiClient from '../client';
import { LoginRequest, LoginResponse, User } from '../types';

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
```

```typescript
// src/api/endpoints/gallery.ts
import apiClient from '../client';
import { GalleryItem } from '../types';

export const galleryAPI = {
  getAll: async (): Promise<GalleryItem[]> => {
    const response = await apiClient.get('/account/gallery');
    return response.data;
  },

  upload: async (file: FormData): Promise<GalleryItem> => {
    const response = await apiClient.post('/account/gallery', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/account/gallery/${id}`);
  },

  reorder: async (order: number[]): Promise<void> => {
    await apiClient.post('/account/gallery/reorder', { order });
  },
};
```

---

## 📱 PANTALLAS PRINCIPALES

### 1. Login Screen

```typescript
// src/screens/auth/LoginScreen.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    await login(data);
  };

  return (
    <View className="flex-1 justify-center p-6 bg-slate-950">
      <Text className="text-white text-3xl font-bold mb-8">
        TRIBIO Owner
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <View className="mb-4">
            <TextInput
              {...field}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-slate-800 text-white p-4 rounded-xl"
            />
            {fieldState.error && (
              <Text className="text-red-500 text-sm mt-1">
                {fieldState.error.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <View className="mb-6">
            <TextInput
              {...field}
              placeholder="Contraseña"
              secureTextEntry
              className="bg-slate-800 text-white p-4 rounded-xl"
            />
            {fieldState.error && (
              <Text className="text-red-500 text-sm mt-1">
                {fieldState.error.message}
              </Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
        className="bg-amber-500 p-4 rounded-xl"
      >
        <Text className="text-black font-bold text-center text-lg">
          {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 2. Dashboard Screen

```typescript
// src/screens/home/DashboardScreen.tsx
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/api/endpoints/analytics';
import { StatsCard } from '@/components/charts/StatsCard';

export const DashboardScreen = () => {
  const { data: stats } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsAPI.getOverview('month'),
  });

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="p-6">
        <Text className="text-white text-2xl font-bold mb-6">
          Dashboard
        </Text>

        <View className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Visitas"
            value={stats?.profile_views || 0}
            icon="eye"
            color="#3b82f6"
          />
          <StatsCard
            title="Reservas"
            value={stats?.bookings_total || 0}
            icon="calendar"
            color="#10b981"
          />
          <StatsCard
            title="Reseñas"
            value={stats?.reviews_count || 0}
            icon="star"
            color="#f59e0b"
          />
          <StatsCard
            title="Rating"
            value={stats?.average_rating?.toFixed(1) || '0'}
            icon="heart"
            color="#ef4444"
          />
        </View>

        {/* Gráfica de visitas */}
        <View className="mt-6">
          <Text className="text-white text-lg font-semibold mb-4">
            Visitas últimos 7 días
          </Text>
          {/* LineChart component aquí */}
        </View>
      </View>
    </ScrollView>
  );
};
```

### 3. Gallery Screen

```typescript
// src/screens/gallery/GalleryListScreen.tsx
import React from 'react';
import { FlatList, TouchableOpacity, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryAPI } from '@/api/endpoints/gallery';
import { GalleryItem } from '@/components/gallery/GalleryItem';

export const GalleryListScreen = ({ navigation }) => {
  const queryClient = useQueryClient();

  const { data: gallery } = useQuery({
    queryKey: ['gallery'],
    queryFn: galleryAPI.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: galleryAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  return (
    <View className="flex-1 bg-slate-950">
      <FlatList
        data={gallery}
        numColumns={3}
        renderItem={({ item }) => (
          <GalleryItem
            item={item}
            onDelete={() => deleteMutation.mutate(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('GalleryUpload')}
        className="absolute bottom-6 right-6 bg-amber-500 w-16 h-16 rounded-full items-center justify-center"
      >
        <Text className="text-black text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 4. Upload Media Screen

```typescript
// src/screens/gallery/GalleryUploadScreen.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryAPI } from '@/api/endpoints/gallery';

export const GalleryUploadScreen = ({ navigation }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: galleryAPI.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      navigation.goBack();
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedMedia) return;

    const formData = new FormData();
    formData.append('media', {
      uri: selectedMedia.uri,
      type: selectedMedia.type === 'video' ? 'video/mp4' : 'image/jpeg',
      name: 'upload.' + (selectedMedia.type === 'video' ? 'mp4' : 'jpg'),
    } as any);

    uploadMutation.mutate(formData);
  };

  return (
    <View className="flex-1 bg-slate-950 p-6">
      {selectedMedia ? (
        <>
          <Image
            source={{ uri: selectedMedia.uri }}
            className="w-full h-96 rounded-xl"
            resizeMode="cover"
          />

          <TouchableOpacity
            onPress={handleUpload}
            disabled={uploadMutation.isPending}
            className="bg-amber-500 p-4 rounded-xl mt-6"
          >
            <Text className="text-black font-bold text-center">
              {uploadMutation.isPending ? 'Subiendo...' : 'Publicar'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={pickImage}
          className="flex-1 border-2 border-dashed border-slate-700 rounded-xl items-center justify-center"
        >
          <Text className="text-slate-500 text-lg">
            Toca para seleccionar foto/video
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### 5. Bookings Screen

```typescript
// src/screens/bookings/BookingsListScreen.tsx
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsAPI } from '@/api/endpoints/bookings';
import { BookingCard } from '@/components/bookings/BookingCard';

export const BookingsListScreen = () => {
  const [filter, setFilter] = useState('pending');
  const queryClient = useQueryClient();

  const { data: bookings } = useQuery({
    queryKey: ['bookings', filter],
    queryFn: () => bookingsAPI.getAll({ status: filter }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return (
    <View className="flex-1 bg-slate-950">
      {/* Tabs para filtrar */}
      <View className="flex-row p-4 gap-2">
        {['pending', 'confirmed', 'completed'].map((status) => (
          <TouchableOpacity
            key={status}
            onPress={() => setFilter(status)}
            className={`flex-1 p-3 rounded-xl ${
              filter === status ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <Text className="text-center font-semibold capitalize">
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={bookings?.data}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onConfirm={() => updateStatusMutation.mutate({
              id: item.id,
              status: 'confirmed'
            })}
            onCancel={() => updateStatusMutation.mutate({
              id: item.id,
              status: 'cancelled'
            })}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};
```

---

## 🎨 DISEÑO UI/UX

### Paleta de Colores
```javascript
const colors = {
  background: '#020617',    // slate-950
  surface: '#1e293b',       // slate-800
  primary: '#f59e0b',       // amber-500
  secondary: '#3b82f6',     // blue-500
  success: '#10b981',       // green-500
  error: '#ef4444',         // red-500
  text: '#ffffff',
  textMuted: '#94a3b8',     // slate-400
};
```

### Componentes Reutilizables

```typescript
// src/components/common/Button.tsx
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}) => {
  const styles = {
    primary: 'bg-amber-500',
    secondary: 'bg-slate-800',
    outline: 'border-2 border-amber-500 bg-transparent',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`p-4 rounded-xl ${styles[variant]} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Text className={`font-bold text-center ${
        variant === 'outline' ? 'text-amber-500' : 'text-black'
      }`}>
        {loading ? 'Cargando...' : title}
      </Text>
    </TouchableOpacity>
  );
};
```

---

## 🔔 NOTIFICACIONES PUSH

```typescript
// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data;

  return token;
}

// Enviar token al backend
export async function sendPushTokenToServer(token: string) {
  await apiClient.post('/account/push-token', { token });
}
```

---

## 📊 STATE MANAGEMENT

### Zustand Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  account: Account | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, account: Account, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  account: null,
  token: null,
  isAuthenticated: false,

  setAuth: async (user, account, token) => {
    await AsyncStorage.setItem('access_token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('account', JSON.stringify(account));

    set({ user, account, token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'user', 'account']);
    set({ user: null, account: null, token: null, isAuthenticated: false });
  },
}));
```

---

## 🧪 TESTING

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## 🚀 DEPLOYMENT

### Build para iOS
```bash
eas build --platform ios --profile production
```

### Build para Android
```bash
eas build --platform android --profile production
```

### Configuración en `app.json`
```json
{
  "expo": {
    "name": "TRIBIO Owner",
    "slug": "tribio-owner",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "tribio",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#020617"
    },
    "ios": {
      "bundleIdentifier": "com.tribio.owner",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.tribio.owner",
      "versionCode": 1
    }
  }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Setup Inicial (Día 1-2)
- [ ] Inicializar proyecto Expo con TypeScript
- [ ] Instalar dependencias esenciales
- [ ] Configurar ESLint + Prettier
- [ ] Setup NativeWind (Tailwind para RN)
- [ ] Crear estructura de carpetas

### Fase 2: Autenticación (Día 3-4)
- [ ] Implementar API client con Axios
- [ ] Crear endpoints de auth
- [ ] Login screen con validación
- [ ] Splash screen
- [ ] Zustand store para auth
- [ ] Persistent login (AsyncStorage)

### Fase 3: Navegación (Día 5)
- [ ] Setup React Navigation
- [ ] Auth stack
- [ ] Tab navigator (Home, Gallery, Bookings, Profile)
- [ ] Navegación condicional según auth

### Fase 4: Dashboard (Día 6-7)
- [ ] Dashboard screen
- [ ] Stats cards
- [ ] Analytics charts
- [ ] React Query setup

### Fase 5: Perfil (Día 8-9)
- [ ] Ver perfil screen
- [ ] Editar perfil screen
- [ ] Upload logo/cover
- [ ] Formulario con validación

### Fase 6: Galería (Día 10-12)
- [ ] Lista de galería
- [ ] Upload photos/videos
- [ ] Image picker
- [ ] Delete media
- [ ] Reorder con drag & drop

### Fase 7: Stories (Día 13-14)
- [ ] Lista de stories
- [ ] Create story screen
- [ ] Upload story media
- [ ] Ver stats de views

### Fase 8: Reservas (Día 15-17)
- [ ] Lista de bookings
- [ ] Filtros por estado
- [ ] Detalle de booking
- [ ] Cambiar estado (confirmar/cancelar)
- [ ] Stats de bookings

### Fase 9: Reseñas (Día 18)
- [ ] Lista de reviews
- [ ] Marcar como featured
- [ ] Moderación (eliminar)

### Fase 10: Notificaciones (Día 19-20)
- [ ] Setup Expo Notifications
- [ ] Request permissions
- [ ] Lista de notificaciones
- [ ] Mark as read
- [ ] Push notifications handler

### Fase 11: Polish (Día 21-23)
- [ ] Loading states
- [ ] Error handling
- [ ] Toast messages
- [ ] Animaciones
- [ ] Optimización de imágenes
- [ ] Offline handling

### Fase 12: Testing & Deploy (Día 24-25)
- [ ] Testing manual completo
- [ ] Fix bugs
- [ ] Build para iOS
- [ ] Build para Android
- [ ] Submit a stores

---

## 📝 NOTAS IMPORTANTES

1. **Usar TypeScript** en todo el proyecto
2. **React Query** para todas las peticiones HTTP
3. **Validación con Zod** en formularios
4. **Manejar errores** de forma consistente
5. **Loading states** en todas las operaciones async
6. **Optimistic updates** donde sea posible
7. **Imágenes optimizadas** con `expo-image` o `react-native-fast-image`
8. **Dark mode** como tema principal
9. **Responsive** para tablets también
10. **Accesibilidad** con labels apropiados

---

## 🎯 OBJETIVO FINAL

Una app móvil profesional, rápida y fácil de usar que permita a los dueños de negocio gestionar completamente su presencia digital desde cualquier lugar.

---

Buena suerte con el desarrollo! 🚀
