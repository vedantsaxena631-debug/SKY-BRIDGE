import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { SignIn } from './simple/SignIn';
import { Home } from './simple/Home';
import './simple/ios.css';

// Two screens only: sign in, then messages. Everything else is out of the way.
function Shell() {
  const { isAuthenticated, restoring } = useAuth();

  if (restoring) {
    return (
      <div className="ios-app ios-center">
        <p className="ios-note">Loading…</p>
      </div>
    );
  }

  return isAuthenticated ? <Home /> : <SignIn />;
}

export default function SimpleApp() {
  return (
    <AuthProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </AuthProvider>
  );
}
