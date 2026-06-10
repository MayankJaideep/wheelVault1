import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import { Layout } from './components/layout/Layout';

import { HomePage } from './pages/HomePage';
import { SignInPage, SignUpPage } from './pages/AuthPages';
import { MarketplacePage } from './pages/MarketplacePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { SellPage } from './pages/SellPage';
import { DashboardPage } from './pages/DashboardPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MessagesPage } from './pages/MessagesPage';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="auctions" element={<MarketplacePage />} />
              <Route path="listing/:id" element={<ListingDetailPage />} />
              <Route path="collections" element={<MarketplacePage />} />
              <Route path="sell" element={<SellPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="messages/:conversationId" element={<MessagesPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="dashboard/*" element={<DashboardPage />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="profile/:username" element={<DashboardPage />} />
              <Route path="wishlist" element={<DashboardPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
