// frontend/src/pages/pos/POS.jsx
import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingCart, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getProducts, getProductByBarcode, createSale } from '../../services/api';
import MainLayout from '../../components/layout/MainLayout';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [customerName, setCustomerName] = useState('');
  const barcodeRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    barcodeRef.current?.focus();
  }, []);

  const fetchProducts = async (searchTerm = '') => {
    try {
      const response = await getProducts({ search: searchTerm, limit: 20, isActive: true });
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Error al cargar productos');
    }
  };

  const handleBarcodeSearch = async (e) => {
    if (e.key === 'Enter' && search.trim()) {
      try {
        const response = await getProductByBarcode(search.trim());
        if (response.data.product) {
          addToCart(response.data.product);
          setSearch('');
        }
      } catch (error) {
        toast.error('Producto no encontrado');
      }
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Stock insuficiente');
        return;
      }
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.stock < 1) {
        toast.error('Producto sin stock');
        return;
      }
      setCart([...cart, { 
        productId: product.id, 
        name: product.name, 
        price: parseFloat(product.price), 
        quantity: 1, 
        stock: product.stock 
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) {
          toast.error('Stock insuficiente');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({ productId: item.productId, quantity: item.quantity }));
      await createSale({ items, paymentMethod, customerName: customerName || null });
      
      toast.success('¡Venta registrada correctamente!');
      
      // Limpiar carrito y formulario
      setCart([]);
      setCustomerName('');
      setSearch('');
      
      // 🔥 IMPORTANTE: Recargar productos para actualizar stock
      await fetchProducts();
      
      // Volver a poner foco en búsqueda
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
        {/* Panel izquierdo - Productos */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={barcodeRef}
                type="text"
                placeholder="Buscar por código de barras o nombre..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); fetchProducts(e.target.value); }}
                onKeyDown={handleBarcodeSearch}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock < 1}
                  className={`p-4 border rounded-xl text-left transition hover:shadow-md ${
                    product.stock < 1 
                      ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                      : 'hover:border-blue-500'
                  }`}
                >
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-lg font-bold text-blue-600">${parseFloat(product.price).toFixed(2)}</p>
                  <p className={`text-xs ${product.stock < 1 ? 'text-red-600 font-semibold' : product.stock < 5 ? 'text-red-500' : 'text-gray-500'}`}>
                    {product.stock < 1 ? 'Sin stock' : `Stock: ${product.stock}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Carrito */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <FiShoppingCart className="text-xl text-blue-600" />
              <h2 className="text-lg font-bold">Carrito</h2>
              <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{cart.length}</span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <FiShoppingCart className="text-6xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Carrito vacío</p>
                <p className="text-sm text-gray-400 mt-1">Agrega productos para comenzar</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-gray-200 rounded"><FiMinus /></button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-gray-200 rounded"><FiPlus /></button>
                  </div>
                  <p className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.productId)} className="p-1 text-red-500 hover:bg-red-50 rounded"><FiTrash2 /></button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t space-y-4">
            <input
              type="text"
              placeholder="Nombre del cliente (opcional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />

            <div className="flex gap-2">
              <button 
                onClick={() => setPaymentMethod('EFECTIVO')} 
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                  paymentMethod === 'EFECTIVO' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FiDollarSign /> Efectivo
              </button>
              <button 
                onClick={() => setPaymentMethod('TARJETA')} 
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
                  paymentMethod === 'TARJETA' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FiCreditCard /> Tarjeta
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>IVA (21%):</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <FiShoppingCart />
                  Finalizar Venta
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default POS;