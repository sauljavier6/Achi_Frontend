import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'flowbite';
import { CartProvider } from './context/CartContext.tsx'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer position="top-right" />
    </QueryClientProvider>
    </CartProvider>
  </StrictMode>,
)
