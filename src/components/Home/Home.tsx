import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Package, Plus, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TopProduct, Product, Sale } from '../../types';
import { dbHelpers } from '../../utils/supabaseClient';
import ProductModal from './ProductModal';
import SaleModal from './SaleModal';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTopProducts(),
        loadProducts()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopProducts = async () => {
    try {
      const { data: salesData, error } = await dbHelpers.getTopProductsThisMonth();
      if (error) {
        console.error('Error loading top products:', error);
        return;
      }

      // Agrupar ventas por producto
      const productSales = new Map();
      
      salesData?.forEach((sale: any) => {
        const productId = sale.product_id;
        if (!productSales.has(productId)) {
          productSales.set(productId, {
            product: {
              id: sale.products.id,
              name: sale.products.name,
              description: sale.products.description,
              price: sale.products.price,
              imageUrl: sale.products.image_url,
              platform: sale.products.platform,
              platformId: sale.products.platform_id,
            },
            totalSales: 0,
            totalRevenue: 0
          });
        }
        
        const current = productSales.get(productId);
        current.totalSales += sale.quantity;
        current.totalRevenue += sale.total_amount;
      });

      // Convertir a array y ordenar por ventas
      const topProductsArray = Array.from(productSales.values())
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 3);

      setTopProducts(topProductsArray);
    } catch (error) {
      console.error('Error processing top products:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await dbHelpers.getProducts();
      if (error) {
        console.error('Error loading products:', error);
        return;
      }
      
      const formattedProducts = data?.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.image_url,
        platform: product.platform,
        platformId: product.platform_id,
        userId: product.user_id,
        createdAt: product.created_at
      })) || [];
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mercadolibre':
        return '🛒';
      case 'tiendanube':
        return '☁️';
      case 'shopify':
        return '🛍️';
      default:
        return '📦';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'mercadolibre':
        return 'MercadoLibre';
      case 'tiendanube':
        return 'Tienda Nube';
      case 'shopify':
        return 'Shopify';
      default:
        return platform;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-8 text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard de Ventas
          </h1>
          <p className="text-gray-300">
            Bienvenido, {user?.email} - Resumen de tus productos más vendidos
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600/20 p-3 rounded-2xl">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Agregar Producto</h3>
                <p className="text-gray-400 text-sm">Registra un nuevo producto</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsSaleModalOpen(true)}
            className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-600/20 p-3 rounded-2xl">
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Registrar Venta</h3>
                <p className="text-gray-400 text-sm">Agrega una nueva venta</p>
              </div>
            </div>
          </button>

          <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-600/20 p-3 rounded-2xl">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Eventos</h3>
                <p className="text-gray-400 text-sm">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products Section */}
        <div className="backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Top 3 Productos del Mes</h2>
                <p className="text-gray-400">Los productos más vendidos en {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay ventas registradas</h3>
              <p className="text-gray-500">Agrega productos y registra ventas para ver el ranking</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topProducts.map((item, index) => (
                <div
                  key={item.product.id}
                  className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 p-6 relative overflow-hidden"
                >
                  {/* Ranking Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-yellow-900' :
                      index === 1 ? 'bg-gray-400 text-gray-900' :
                      'bg-orange-500 text-orange-900'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-32 bg-gray-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {item.product.imageUrl ? (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-500" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">
                      {item.product.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getPlatformIcon(item.product.platform)}</span>
                      <span className="text-sm text-gray-400">{getPlatformName(item.product.platform)}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {item.product.description}
                    </p>
                  </div>

                  {/* Sales Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Vendidos</span>
                      </div>
                      <span className="text-lg font-bold text-white">{item.totalSales}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">Ingresos</span>
                      </div>
                      <span className="text-lg font-bold text-green-400">
                        {formatCurrency(item.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onProductSaved={loadData}
      />

      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSaleSaved={loadData}
        products={products}
      />
    </div>
  );
};

export default Home;