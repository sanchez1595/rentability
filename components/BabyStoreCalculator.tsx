import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Package, DollarSign, BarChart3, PlusCircle, Edit2, Trash2, Save, Settings, Plus, X } from 'lucide-react';
import { guardarProducto, obtenerProductos, actualizarProducto, eliminarProducto as eliminarProductoDB, guardarConfiguracion, obtenerConfiguracion } from '../lib/database';

const BabyStoreCalculator = () => {
  const [productos, setProductos] = useState([]);
  const [productoActual, setProductoActual] = useState({
    nombre: '',
    categoria: 'alimentacion',
    costoCompra: '',
    gastosFijos: '',
    margenDeseado: '30',
    precioVenta: '',
    utilidad: ''
  });
  const [vistaActiva, setVistaActiva] = useState('calculadora');
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [configuracion, setConfiguracion] = useState({
    porcentajes: {
      contabilidad: 2,
      mercadeo: 5,
      ventas: 15,
      salarios: 10,
      compras: 2,
      extras: 5
    },
    costosFijos: {
      arriendo: 1000000,
      energia: 200000,
      gas: 50000,
      aseo: 800000,
      internet: 200000,
      agua: 200000,
      servidores: 110000
    },
    herramientas: {
      figma: 51600,
      chatgpt: 86000,
      correos: 51600,
      servidor: 100000,
      dominio: 120000
    },
    ventasEstimadas: 100 // productos por mes para distribuir costos fijos
  });

  const categorias = [
    'alimentacion',
    'pañales',
    'ropa',
    'juguetes',
    'higiene',
    'accesorios',
    'mobiliario',
    'otros'
  ];

  // Formatear números en estilo colombiano
  const formatearNumero = (numero) => {
    return new Intl.NumberFormat('es-CO').format(numero);
  };

  // Formatear input mientras se escribe
  const formatearInput = (valor) => {
    if (!valor) return '';
    // Remover todo excepto números
    const soloNumeros = valor.toString().replace(/\D/g, '');
    if (!soloNumeros) return '';
    // Formatear con puntos
    return new Intl.NumberFormat('es-CO').format(parseInt(soloNumeros));
  };

  // Parsear input formateado de vuelta a número
  const parsearInput = (valor) => {
    if (!valor) return '';
    const soloNumeros = valor.toString().replace(/\D/g, '');
    return soloNumeros ? parseInt(soloNumeros) : '';
  };

  // Manejar cambios en inputs de dinero
  const manejarCambioInput = (campo, valor) => {
    const valorParseado = parsearInput(valor);
    setProductoActual(prev => ({
      ...prev,
      [campo]: valorParseado
    }));
  };

  // Funciones para agregar/eliminar items de configuración
  const agregarCostoFijo = () => {
    const nombre = prompt('Nombre del nuevo costo fijo:');
    if (nombre && nombre.trim()) {
      setConfiguracion(prev => ({
        ...prev,
        costosFijos: {
          ...prev.costosFijos,
          [nombre.toLowerCase().replace(/\s+/g, '_')]: 0
        }
      }));
    }
  };

  const eliminarCostoFijo = (key) => {
    if (confirm('¿Estás seguro de eliminar este costo fijo?')) {
      setConfiguracion(prev => {
        const nuevosCostos = { ...prev.costosFijos };
        delete nuevosCostos[key];
        return {
          ...prev,
          costosFijos: nuevosCostos
        };
      });
    }
  };

  const agregarHerramienta = () => {
    const nombre = prompt('Nombre de la nueva herramienta:');
    if (nombre && nombre.trim()) {
      setConfiguracion(prev => ({
        ...prev,
        herramientas: {
          ...prev.herramientas,
          [nombre.toLowerCase().replace(/\s+/g, '_')]: 0
        }
      }));
    }
  };

  const eliminarHerramienta = (key) => {
    if (confirm('¿Estás seguro de eliminar esta herramienta?')) {
      setConfiguracion(prev => {
        const nuevasHerramientas = { ...prev.herramientas };
        delete nuevasHerramientas[key];
        return {
          ...prev,
          herramientas: nuevasHerramientas
        };
      });
    }
  };

  const agregarPorcentaje = () => {
    const nombre = prompt('Nombre del nuevo porcentaje operativo:');
    if (nombre && nombre.trim()) {
      setConfiguracion(prev => ({
        ...prev,
        porcentajes: {
          ...prev.porcentajes,
          [nombre.toLowerCase().replace(/\s+/g, '_')]: 0
        }
      }));
    }
  };

  const eliminarPorcentaje = (key) => {
    if (confirm('¿Estás seguro de eliminar este porcentaje?')) {
      setConfiguracion(prev => {
        const nuevosPorcentajes = { ...prev.porcentajes };
        delete nuevosPorcentajes[key];
        return {
          ...prev,
          porcentajes: nuevosPorcentajes
        };
      });
    }
  };

  // Calcular precio de venta y utilidad
  const calcularPrecios = () => {
    const costo = parseFloat(productoActual.costoCompra) || 0;
    const gastos = parseFloat(productoActual.gastosFijos) || 0;
    const margen = parseFloat(productoActual.margenDeseado) || 0;
    
    // Calcular costos fijos distribuidos por producto
    const totalCostosFijos = Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalHerramientas = Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const costoFijoPorProducto = (totalCostosFijos + totalHerramientas) / (configuracion.ventasEstimadas || 1);
    
    // Calcular porcentajes adicionales
    const totalPorcentajes = Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    const costoBase = costo + gastos + costoFijoPorProducto;
    const precioConPorcentajes = costoBase / (1 - (totalPorcentajes / 100));
    const precioVenta = precioConPorcentajes / (1 - margen / 100);
    const utilidad = precioVenta - costoBase;
    
    setProductoActual(prev => ({
      ...prev,
      precioVenta: precioVenta.toFixed(2),
      utilidad: utilidad.toFixed(2),
      costoFijoPorProducto: costoFijoPorProducto.toFixed(2),
      costoConPorcentajes: (precioConPorcentajes - costoBase).toFixed(2)
    }));
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    calcularPrecios();
  }, [productoActual.costoCompra, productoActual.gastosFijos, productoActual.margenDeseado, configuracion]);

  // Guardar configuración automáticamente cuando cambie
  useEffect(() => {
    if (!cargando) {
      guardarConfiguracionAutomatica();
    }
  }, [configuracion, cargando]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar productos
      const productosData = await obtenerProductos();
      setProductos(productosData);
      
      // Cargar configuración
      const configData = await obtenerConfiguracion();
      if (configData) {
        setConfiguracion({
          porcentajes: configData.porcentajes || configuracion.porcentajes,
          costosFijos: configData.costos_fijos || configuracion.costosFijos,
          herramientas: configData.herramientas || configuracion.herramientas,
          ventasEstimadas: configData.ventas_estimadas || configuracion.ventasEstimadas
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const guardarConfiguracionAutomatica = async () => {
    try {
      await guardarConfiguracion({
        porcentajes: configuracion.porcentajes,
        costos_fijos: configuracion.costosFijos,
        herramientas: configuracion.herramientas,
        ventas_estimadas: configuracion.ventasEstimadas
      });
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  };

  const agregarProducto = async () => {
    if (!productoActual.nombre || !productoActual.costoCompra || productoActual.costoCompra === '') return;
    
    try {
      if (editandoId) {
        // Actualizar producto existente
        const productoActualizado = await actualizarProducto(editandoId, {
          nombre: productoActual.nombre,
          categoria: productoActual.categoria,
          costo_compra: parseFloat(productoActual.costoCompra) || 0,
          gastos_fijos: parseFloat(productoActual.gastosFijos) || 0,
          margen_deseado: parseFloat(productoActual.margenDeseado) || 0,
          precio_venta: parseFloat(productoActual.precioVenta) || 0,
          utilidad: parseFloat(productoActual.utilidad) || 0,
          costo_fijo_por_producto: parseFloat(productoActual.costoFijoPorProducto) || 0,
          costo_con_porcentajes: parseFloat(productoActual.costoConPorcentajes) || 0
        });
        
        setProductos(prev => prev.map(p => 
          p.id === editandoId ? {
            id: productoActualizado.id,
            nombre: productoActualizado.nombre,
            categoria: productoActualizado.categoria,
            costoCompra: productoActualizado.costo_compra,
            gastosFijos: productoActualizado.gastos_fijos,
            margenDeseado: productoActualizado.margen_deseado,
            precioVenta: productoActualizado.precio_venta,
            utilidad: productoActualizado.utilidad,
            costoFijoPorProducto: productoActualizado.costo_fijo_por_producto,
            costoConPorcentajes: productoActualizado.costo_con_porcentajes,
            fechaAgregado: new Date(productoActualizado.fecha_agregado).toLocaleDateString()
          } : p
        ));
        setEditandoId(null);
      } else {
        // Crear nuevo producto
        const nuevoProducto = await guardarProducto({
          nombre: productoActual.nombre,
          categoria: productoActual.categoria,
          costo_compra: parseFloat(productoActual.costoCompra) || 0,
          gastos_fijos: parseFloat(productoActual.gastosFijos) || 0,
          margen_deseado: parseFloat(productoActual.margenDeseado) || 0,
          precio_venta: parseFloat(productoActual.precioVenta) || 0,
          utilidad: parseFloat(productoActual.utilidad) || 0,
          costo_fijo_por_producto: parseFloat(productoActual.costoFijoPorProducto) || 0,
          costo_con_porcentajes: parseFloat(productoActual.costoConPorcentajes) || 0
        });
        
        setProductos(prev => [...prev, {
          id: nuevoProducto.id,
          nombre: nuevoProducto.nombre,
          categoria: nuevoProducto.categoria,
          costoCompra: nuevoProducto.costo_compra,
          gastosFijos: nuevoProducto.gastos_fijos,
          margenDeseado: nuevoProducto.margen_deseado,
          precioVenta: nuevoProducto.precio_venta,
          utilidad: nuevoProducto.utilidad,
          costoFijoPorProducto: nuevoProducto.costo_fijo_por_producto,
          costoConPorcentajes: nuevoProducto.costo_con_porcentajes,
          fechaAgregado: new Date(nuevoProducto.fecha_agregado).toLocaleDateString()
        }]);
      }
      
      setProductoActual({
        nombre: '',
        categoria: 'alimentacion',
        costoCompra: '',
        gastosFijos: '',
        margenDeseado: '30',
        precioVenta: '',
        utilidad: ''
      });
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error guardando el producto. Por favor verifica tu conexión.');
    }
  };

  const editarProducto = (producto) => {
    setProductoActual(producto);
    setEditandoId(producto.id);
    setVistaActiva('calculadora');
  };

  const eliminarProducto = async (id) => {
    try {
      await eliminarProductoDB(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error eliminando el producto. Por favor verifica tu conexión.');
    }
  };

  // Cálculos para informes
  const calcularEstadisticas = () => {
    if (productos.length === 0) return {};
    
    const totalCostos = productos.reduce((sum, p) => sum + ((parseFloat(p.costoCompra) || 0) + (parseFloat(p.gastosFijos) || 0)), 0);
    const totalVentas = productos.reduce((sum, p) => sum + (parseFloat(p.precioVenta) || 0), 0);
    const totalUtilidad = productos.reduce((sum, p) => sum + (parseFloat(p.utilidad) || 0), 0);
    const margenPromedio = totalVentas > 0 ? (totalUtilidad / totalVentas) * 100 : 0;
    
    const productosPorCategoria = productos.reduce((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + 1;
      return acc;
    }, {});
    
    const utilidadPorCategoria = productos.reduce((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + (parseFloat(p.utilidad) || 0);
      return acc;
    }, {});
    
    return {
      totalProductos: productos.length,
      totalCostos: totalCostos.toFixed(0),
      totalVentas: totalVentas.toFixed(0),
      totalUtilidad: totalUtilidad.toFixed(0),
      margenPromedio: margenPromedio.toFixed(1),
      productosPorCategoria,
      utilidadPorCategoria,
      productoMasRentable: productos.reduce((max, p) => 
        (parseFloat(p.utilidad) || 0) > (parseFloat(max.utilidad) || 0) ? p : max, {}),
      productoMenosRentable: productos.reduce((min, p) => 
        (parseFloat(p.utilidad) || 0) < (parseFloat(min.utilidad) || Infinity) ? p : min, {})
    };
  };

  const stats = calcularEstadisticas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Package className="text-pink-500" />
            Tienda de Bebés - Calculadora de Precios
          </h1>
          <p className="text-gray-600">Calcula precios, márgenes y analiza la rentabilidad de tu negocio</p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex flex-wrap gap-2 p-4">
            {[
              { id: 'calculadora', label: 'Calculadora', icon: Calculator },
              { id: 'inventario', label: 'Inventario', icon: Package },
              { id: 'informes', label: 'Informes', icon: BarChart3 },
              { id: 'configuracion', label: 'Configuración', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setVistaActiva(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  vistaActiva === id
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Vista Calculadora */}
        {vistaActiva === 'calculadora' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calculator className="text-blue-500" />
                {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={productoActual.nombre}
                    onChange={(e) => setProductoActual(prev => ({...prev, nombre: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ej: Pañales Huggies Talla M"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={productoActual.categoria}
                    onChange={(e) => setProductoActual(prev => ({...prev, categoria: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de Compra ($)
                  </label>
                  <input
                    type="text"
                    value={formatearInput(productoActual.costoCompra)}
                    onChange={(e) => manejarCambioInput('costoCompra', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gastos Fijos Asignados ($)
                  </label>
                  <input
                    type="text"
                    value={formatearInput(productoActual.gastosFijos)}
                    onChange={(e) => manejarCambioInput('gastosFijos', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Transporte, almacenamiento, etc.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Margen de Ganancia Deseado (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={productoActual.margenDeseado}
                    onChange={(e) => setProductoActual(prev => ({...prev, margenDeseado: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                
                <button
                  onClick={agregarProducto}
                  disabled={!productoActual.nombre || !productoActual.costoCompra || productoActual.costoCompra === ''}
                  className="w-full bg-pink-500 text-white py-3 rounded-lg font-medium hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editandoId ? 'Actualizar Producto' : 'Agregar Producto'}
                </button>
              </div>
            </div>
            
            {/* Resultados */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-500" />
                Resultados del Cálculo
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Costo Base del Producto</div>
                  <div className="text-lg font-bold text-gray-800">
                    ${formatearNumero(((parseFloat(productoActual.costoCompra) || 0) + (parseFloat(productoActual.gastosFijos) || 0)).toFixed(0))}
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-orange-600">Costo Fijo Distribuido</div>
                  <div className="text-lg font-bold text-orange-700">
                    ${formatearNumero(parseFloat(productoActual.costoFijoPorProducto || 0).toFixed(0))}
                  </div>
                  <div className="text-xs text-orange-500">Arriendo, servicios, herramientas</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600">Gastos Operativos ({Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)}%)</div>
                  <div className="text-lg font-bold text-purple-700">
                    ${formatearNumero(parseFloat(productoActual.costoConPorcentajes || 0).toFixed(0))}
                  </div>
                  <div className="text-xs text-purple-500">Contabilidad, mercadeo, ventas, etc.</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600">Precio de Venta Final</div>
                  <div className="text-2xl font-bold text-blue-700">
                    ${formatearNumero(parseFloat(productoActual.precioVenta || 0).toFixed(0))}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600">Utilidad Neta</div>
                  <div className="text-2xl font-bold text-green-700">
                    ${formatearNumero(parseFloat(productoActual.utilidad || 0).toFixed(0))}
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-600">Margen de Ganancia</div>
                  <div className="text-lg font-bold text-yellow-700">
                    {productoActual.margenDeseado || 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista Inventario */}
        {vistaActiva === 'inventario' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="text-purple-500" />
              Inventario de Productos
            </h2>
            
            {productos.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No hay productos agregados aún</p>
                <button
                  onClick={() => setVistaActiva('calculadora')}
                  className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Agregar Primer Producto
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Producto</th>
                      <th className="text-left py-3 px-2">Categoría</th>
                      <th className="text-right py-3 px-2">Costo</th>
                      <th className="text-right py-3 px-2">Precio Venta</th>
                      <th className="text-right py-3 px-2">Utilidad</th>
                      <th className="text-right py-3 px-2">Margen</th>
                      <th className="text-center py-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(producto => (
                      <tr key={producto.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{producto.nombre}</td>
                        <td className="py-3 px-2 capitalize">{producto.categoria}</td>
                        <td className="py-3 px-2 text-right">
                          ${formatearNumero(((parseFloat(producto.costoCompra) || 0) + (parseFloat(producto.gastosFijos) || 0)).toFixed(0))}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-blue-600">
                          ${formatearNumero((parseFloat(producto.precioVenta) || 0).toFixed(0))}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-green-600">
                          ${formatearNumero((parseFloat(producto.utilidad) || 0).toFixed(0))}
                        </td>
                        <td className="py-3 px-2 text-right">
                          {producto.margenDeseado}%
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => editarProducto(producto)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => eliminarProducto(producto.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Vista Informes */}
        {vistaActiva === 'informes' && (
          <div className="space-y-6">
            {productos.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Agrega productos para ver los informes</p>
              </div>
            ) : (
              <>
                {/* Resumen General */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Productos</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalProductos}</p>
                      </div>
                      <Package className="text-purple-500" size={32} />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Costos Totales</p>
                        <p className="text-2xl font-bold text-red-600">${formatearNumero(stats.totalCostos)}</p>
                      </div>
                      <DollarSign className="text-red-500" size={32} />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Ventas Potenciales</p>
                        <p className="text-2xl font-bold text-blue-600">${formatearNumero(stats.totalVentas)}</p>
                      </div>
                      <TrendingUp className="text-blue-500" size={32} />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Utilidad Total</p>
                        <p className="text-2xl font-bold text-green-600">${formatearNumero(stats.totalUtilidad)}</p>
                      </div>
                      <Calculator className="text-green-500" size={32} />
                    </div>
                  </div>
                </div>

                {/* Análisis Detallado */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Análisis de Rentabilidad</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Margen Promedio:</span>
                        <span className="font-bold text-green-600">{stats.margenPromedio}%</span>
                      </div>
                      {stats.productoMasRentable?.nombre && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Producto Más Rentable:</p>
                          <p className="font-bold">{stats.productoMasRentable.nombre}</p>
                          <p className="text-sm">Utilidad: ${formatearNumero((parseFloat(stats.productoMasRentable.utilidad) || 0).toFixed(0))}</p>
                        </div>
                      )}
                      {stats.productoMenosRentable?.nombre && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-yellow-600 font-medium">Producto Menos Rentable:</p>
                          <p className="font-bold">{stats.productoMenosRentable.nombre}</p>
                          <p className="text-sm">Utilidad: ${formatearNumero((parseFloat(stats.productoMenosRentable.utilidad) || 0).toFixed(0))}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución por Categoría</h3>
                    <div className="space-y-3">
                      {Object.entries(stats.productosPorCategoria || {}).map(([categoria, cantidad]) => (
                        <div key={categoria} className="flex justify-between items-center">
                          <span className="capitalize text-gray-600">{categoria}:</span>
                          <div className="text-right">
                            <span className="font-bold">{cantidad} productos</span>
                            <br />
                            <span className="text-sm text-green-600">
                              ${formatearNumero(((stats.utilidadPorCategoria[categoria] || 0)).toFixed(0))} utilidad
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Vista Configuración */}
        {vistaActiva === 'configuracion' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="text-indigo-500" />
                Configuración de Costos y Porcentajes
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Porcentajes Operativos */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-700">Porcentajes Operativos</h3>
                    <button
                      onClick={agregarPorcentaje}
                      className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(configuracion.porcentajes).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                            {key.replace(/_/g, ' ')} (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={value}
                            onChange={(e) => setConfiguracion(prev => ({
                              ...prev,
                              porcentajes: {
                                ...prev.porcentajes,
                                [key]: parseFloat(e.target.value) || 0
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          onClick={() => eliminarPorcentaje(key)}
                          className="text-red-500 hover:text-red-700 mt-6"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <div className="text-sm text-indigo-600">Total Porcentajes:</div>
                      <div className="font-bold text-indigo-700">
                        {Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ventas Estimadas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Distribución de Costos</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Ventas Estimadas (productos/mes)
                      </label>
                      <input
                        type="text"
                        value={formatearInput(configuracion.ventasEstimadas)}
                        onChange={(e) => setConfiguracion(prev => ({
                          ...prev,
                          ventasEstimadas: parsearInput(e.target.value) || 1
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Para distribuir costos fijos entre productos
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-600">Costo Fijo por Producto:</div>
                      <div className="font-bold text-green-700">
                        ${formatearNumero(((Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) + 
                           Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)) / 
                           (configuracion.ventasEstimadas || 1)).toFixed(0))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Costos Fijos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Costos Fijos Mensuales</h3>
                <button
                  onClick={agregarCostoFijo}
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(configuracion.costosFijos).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                        {key.replace(/_/g, ' ')} ($)
                      </label>
                      <input
                        type="text"
                        value={formatearInput(value)}
                        onChange={(e) => setConfiguracion(prev => ({
                          ...prev,
                          costosFijos: {
                            ...prev.costosFijos,
                            [key]: parsearInput(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => eliminarCostoFijo(key)}
                      className="text-red-500 hover:text-red-700 mt-6"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 p-3 rounded-lg mt-4">
                <div className="text-sm text-red-600">Total Costos Fijos:</div>
                <div className="font-bold text-red-700">
                  ${formatearNumero(Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0))}
                </div>
              </div>
            </div>
            
            {/* Herramientas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Herramientas y Servicios</h3>
                <button
                  onClick={agregarHerramienta}
                  className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(configuracion.herramientas).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                        {key.replace(/_/g, ' ')} ($)
                      </label>
                      <input
                        type="text"
                        value={formatearInput(value)}
                        onChange={(e) => setConfiguracion(prev => ({
                          ...prev,
                          herramientas: {
                            ...prev.herramientas,
                            [key]: parsearInput(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => eliminarHerramienta(key)}
                      className="text-red-500 hover:text-red-700 mt-6"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 p-3 rounded-lg mt-4">
                <div className="text-sm text-blue-600">Total Herramientas:</div>
                <div className="font-bold text-blue-700">
                  ${formatearNumero(Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0))}
                </div>
              </div>
            </div>
            
            {/* Resumen Total */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Resumen de Configuración</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Costos Fijos Totales:</span>
                    <span className="font-bold text-red-600">
                      ${formatearNumero(Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) + 
                         Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Porcentajes Operativos:</span>
                    <span className="font-bold text-purple-600">
                      {Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ventas Estimadas:</span>
                    <span className="font-bold text-blue-600">
                      {formatearNumero(configuracion.ventasEstimadas || 0)} productos/mes
                    </span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 mb-2">Impacto por Producto:</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Costo fijo:</span>
                      <span className="font-bold">
                        ${formatearNumero(((Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) + 
                           Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)) / 
                           (configuracion.ventasEstimadas || 1)).toFixed(0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Porcentajes operativos:</span>
                      <span className="font-bold">
                        {Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(1)}% del costo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BabyStoreCalculator;