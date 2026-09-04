import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import AppLayout from '../components/AppLayout';

export const metadata = {
  title: 'UniPortal - Modern University Management System',
  description: 'Academic portal for Students & Faculty to view notices, class routines, and official campus announcements.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
