import { createBrowserRouter } from 'react-router'

import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { AccountLayout } from '@/components/account/AccountLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'

import HomePage from '@/pages/customer/HomePage'
import ShopPage from '@/pages/customer/ShopPage'
import ProductDetailPage from '@/pages/customer/ProductDetailPage'
import CartPage from '@/pages/customer/CartPage'
import CheckoutPage from '@/pages/customer/CheckoutPage'
import OrderConfirmationPage from '@/pages/customer/OrderConfirmationPage'
import LoginPage from '@/pages/customer/LoginPage'
import RegisterPage from '@/pages/customer/RegisterPage'

import ProfilePage from '@/pages/customer/account/ProfilePage'
import OrdersPage from '@/pages/customer/account/OrdersPage'
import OrderDetailPage from '@/pages/customer/account/OrderDetailPage'
import AddressesPage from '@/pages/customer/account/AddressesPage'

import DashboardPage from '@/pages/admin/DashboardPage'
import AdminProductsPage from '@/pages/admin/products/AdminProductsPage'
import ProductFormPage from '@/pages/admin/products/ProductFormPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AdminOrdersPage from '@/pages/admin/orders/AdminOrdersPage'
import AdminOrderDetailPage from '@/pages/admin/orders/AdminOrderDetailPage'

import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  // Public auth routes (full-bleed, no layout)
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // Customer storefront — public
  {
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:category', element: <ShopPage /> },
      { path: 'product/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },

      // Auth-required under the same customer layout
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'order/success/:id', element: <OrderConfirmationPage /> },
          {
            path: 'account',
            element: <AccountLayout />,
            children: [
              { index: true, element: <ProfilePage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'orders/:id', element: <OrderDetailPage /> },
              { path: 'addresses', element: <AddressesPage /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Admin — requires ADMIN role
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'products/new', element: <ProductFormPage /> },
          { path: 'products/:id', element: <ProductFormPage /> },
          { path: 'categories', element: <AdminCategoriesPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'orders/:id', element: <AdminOrderDetailPage /> },
        ],
      },
    ],
  },
])
