import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
