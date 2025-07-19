import React, { useState } from 'react';
import { X, Package, Save } from 'lucide-react';
import { dbHelpers } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSaved: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onProductSaved }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    platform: 'mercadolibre' as 'mercadolibre' | 'tiendanube' | 'shopify',
    platformId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    if (!formData.platformId.trim()) {
      setError('El ID de la plataforma es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: createError } = await dbHelpers.createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
        platform: formData.platform,
        platformId: formData.platformId,
        userId: user.id
      });

      if (createError) {
        console.error('Error creating product:', createError);
        setError('Error al crear el producto');
        return;
      }

      onProductSaved();
      onClose();
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        platform: 'mercadolibre',
        platformId: ''
      });
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Error inesperado al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Package className="w-6 h-6" />
            <span>Agregar Producto</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Producto
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: iPhone 15 Pro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plataforma
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="mercadolibre">MercadoLibre</option>
                <option value="tiendanube">Tienda Nube</option>
                <option value="shopify">Shopify</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ID de la Plataforma
            </label>
            <input
              type="text"
              name="platformId"
              value={formData.platformId}
              onChange={handleInputChange}
              className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="ID del producto en la plataforma"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL de Imagen (opcional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full p-4 bg-black/30 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://ejemplo.com/imagen.jpg"
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
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;