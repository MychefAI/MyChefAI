
export const colors = {
    // Brand Colors
    primary: '#EA580C', // Orange-600: Deep, vibrant orange for primary actions
    primaryLight: '#FFF7ED', // Orange-50: Very subtle orange tint for backgrounds
    secondary: '#10B981', // Emerald-500: Fresh green for success/health
    accent: '#F43F5E', // Rose-500: Friendly pink/red for highlights
    health: '#F43F5E', // Rose-500: For health related icons

    // Backgrounds
    background: '#FAFAF9', // Warm Gray-50: Softer than pure white, premium feel
    surface: '#FFFFFF', // Pure white for cards
    surfaceAlt: '#F5F5F4', // Warm Gray-100 for secondary surfaces

    // Typography
    text: '#1C1917', // Warm Gray-900: High contrast, softer than black
    textSecondary: '#57534E', // Warm Gray-600: Readable secondary text
    textTertiary: '#A8A29E', // Warm Gray-400: Subtle placeholders

    // Borders
    border: '#E7E5E4', // Warm Gray-200: Subtle separation
    borderHighlight: '#D6D3D1', // Warm Gray-300: Slightly stronger border

    // Functional
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Shadows (Standardized for reusability)
    shadow: {
        sm: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: "#1C1917", // Warm shadow
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: "#EA580C", // Colored shadow hint
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
        }
    }
};
