import React, { useState } from 'react';
import { X, ShoppingCart, Save } from 'lucide-react';
import { Product } from '../../types';
import { dbHelpers } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleSaved: () => void;
  products: Product[];
}

const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, onSaleSaved, products }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    totalAmount: '',
    saleDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    if (!formData.productId) {
      setError('Selecciona un producto');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      setError('El monto total debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedProduct = products.find(p => p.id === formData.productId);
      if (!selectedProduct) {
        setError('Producto no encontrado');
        return;
      }

      const { error: createError } = await dbHelpers.createSale({
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        totalAmount: parseFloat(formData.totalAmount),
        saleDate: formData.saleDate,
        platform: selectedProduct.platform,
        userId: user.id
      });

      if (createError) {
        console.error('Error creating sale:', createError);
        setError('Error al registrar la venta');
        return;
      }

      onSaleSaved();
      onClose();
      setFormData({
        productId: '',
        quantity: '1',
        totalAmount: '',
        saleDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error saving sale:', error);
      setError('Error inesperado al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    // Auto-calculate total amount based on product price and quantity
    if (name === 'productId' || name === 'quantity') {
      const productId = name === 'productId' ? value : formData.productId;
      const quantity = name === 'quantity' ? parseInt(value) || 0 : parseInt(formData.quantity) || 0;
      
      const selectedProduct = products.find(p => p.id === productId);
      if (selectedProduct && quantity > 0) {
        const total = selectedProduct.price * quantity;
        setFormData(prev => ({ ...prev, totalAmount: total.toString() }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6" />
            <span>Registrar Venta</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No tienes productos registrados</p>
            <button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-2xl transition-colors"
            >
              Agregar Producto Primero
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Producto
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Selecciona un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto Total
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Venta
              </label>
              <input
                type="date"
                name="saleDate"
                value={formData.saleDate}
                onChange={handleInputChange}
                className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-2xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Registrar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SaleModal;