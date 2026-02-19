import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'net.peptidelog.app',
    appName: 'PeptideLog',
    webDir: 'dist',

    // Server configuration for development
    server: {
        // For development, you can enable this to connect to your dev server
        // url: 'http://localhost:5173',
        // cleartext: true, // Allow HTTP for development
        androidScheme: 'https'
    },

    // iOS-specific configuration
    ios: {
        contentInset: 'automatic',
        preferredContentMode: 'mobile',
        scheme: 'peptidelog',
        backgroundColor: '#0f172a'
    },

    // Android-specific configuration
    android: {
        backgroundColor: '#0f172a',
        allowMixedContent: false,
        captureInput: true,
        webContentsDebuggingEnabled: false // Set to true for debugging
    },

    // Plugin configurations
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#0f172a',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true
        },
        StatusBar: {
            style: 'dark',
            backgroundColor: '#0f172a'
        },
        Keyboard: {
            resizeOnFullScreen: true
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert']
        },
        LocalNotifications: {
            smallIcon: 'ic_stat_icon',
            iconColor: '#8b5cf6'
        }
    }
};

export default config;
