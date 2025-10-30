import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

// --- COMPONENTES Y PÁGINAS PÚBLICAS ---
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './components/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetail from './components/profile/OrderDetail';

// --- ADMINISTRACIÓN ---
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './pages/Admin/AdminLayout';
import DashboardPage from './pages/Admin/DashboardPage';
import ProductsPage from './pages/Admin/ProductsPage';
import OrdersPage from './pages/Admin/OrdersPage';
import AdminMediaUploader from './pages/Admin/AdminMediaUploader'; // 👈 ¡NUEVO!
import './styles/index.css';

const MainLayout = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <main className="container mx-auto px-4 py-8 flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <Routes>
            {/* --- RUTAS PÚBLICAS CON HEADER Y FOOTER --- */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/order-detail/:orderId" element={<OrderDetail />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            </Route>

            {/* --- RUTAS PRIVADAS DE ADMINISTRACIÓN --- */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="media" element={<AdminMediaUploader />} /> {/* 👈 ¡NUEVO! */}
            </Route>
          </Routes>
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
