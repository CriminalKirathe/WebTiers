import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: { // ეს სექცია ეხება მხოლოდ .container კლასის მაქსიმალურ სიგანეს სხვადასხვა breakpoint-ზე
            center: true,
            padding: '2rem',
            screens: { // ეს არ არის გლობალური breakpoint-ები .container-ისთვის
                '2xl': '1400px'
            }
        },
        extend: { // აქ ვამატებთ ახალ გლობალურ breakpoint-ს
            screens: {
                'xs': '520px', // <<< დამატებული breakpoint-ი 520 პიქსელისთვის
                'navbreak': '1280px', // <<< თქვენი არსებული breakpoint-ი
                // Tailwind-ის სტანდარტული breakpoint-ები (sm, md, lg, xl, 2xl) ავტომატურად შენარჩუნდება,
                // რადგან "screens"-ს ვამატებთ "extend" ბლოკში.
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                },
                minecraft: {
                    'dirt': '#866043',
                    'grass': '#5D8F3F',
                    'stone': '#7F7F7F',
                    'diamond': '#4AEDD9',
                    'redstone': '#FF0000',
                    'gold': '#FFDA4A',
                    'emerald': '#17DD62',
                    'netherite': '#654740',
                },
                tier: {
                    '1': '#FF6B6B',
                    '2': '#FF9E4A',
                    '3': '#FFDA4A',
                    '4': '#9AE66E',
                    '5': '#4AEDD9',
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                },
                'minecraft-float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' },
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'minecraft-float': 'minecraft-float 3s ease-in-out infinite',
            },
            fontFamily: {
                'minecraft': ['Minecraft', 'monospace'],
            },
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;