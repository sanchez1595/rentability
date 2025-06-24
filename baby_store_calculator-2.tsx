import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Package, DollarSign, BarChart3, PlusCircle, Edit2, Trash2, Save, Settings, Plus, X, AlertTriangle, Target, TrendingDown, Calendar, Zap, Award, ShoppingCart, Activity, Eye, CheckCircle, Clock, Minus } from 'lucide-react';

const BabyStoreCalculator = () => {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]); // Historial de ventas
  const [ventaActual, setVentaActual] = useState({
    productoId: '',
    cantidad: '',
    precioVenta: '',
    fecha: new Date().toISOString().split('T')[0],
    cliente: '',
    metodoPago: 'efectivo'
  });
  const [productoActual, setProductoActual] = useState({
    nombre: '',
    categoria: 'alimentacion',
    costoCompra: '',
    gastosFijos: '',
    margenDeseado: '30',
    precioVenta: '',
    utilidad: '',
    stock: '',
    ventasUltimos30Dias: '',
    precioCompetencia: '',
    fechaUltimaVenta: '',
    rotacion: 'alta'
  });
  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const [editandoId, setEditandoId] = useState(null);
  const [metas, setMetas] = useState({
    ventasMensuales: 2000000,
    unidadesMensuales: 200,
    margenPromedio: 35,
    rotacionInventario: 12
  });
  const [alertas, setAlertas] = useState({
    margenMinimo: 20,
    stockMinimo: 5,
    diasSinVenta: 30,
    diferenciaPrecioCompetencia: 15
  });
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

  // Registrar una venta
  const registrarVenta = () => {
    if (!ventaActual.productoId || !ventaActual.cantidad || ventaActual.cantidad === '') return;
    
    const producto = productos.find(p => p.id == ventaActual.productoId);
    if (!producto) return;
    
    const cantidad = parseFloat(ventaActual.cantidad) || 0;
    const stockActual = parseFloat(producto.stock) || 0;
    
    if (cantidad > stockActual) {
      alert('No hay suficiente stock para esta venta');
      return;
    }
    
    // Crear registro de venta
    const nuevaVenta = {
      id: Date.now(),
      productoId: ventaActual.productoId,
      productoNombre: producto.nombre,
      cantidad: cantidad,
      precioVenta: parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0,
      costoUnitario: parseFloat(producto.costoCompra) || 0,
      fecha: ventaActual.fecha,
      cliente: ventaActual.cliente || 'Cliente general',
      metodoPago: ventaActual.metodoPago,
      utilidadTotal: ((parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0) - (parseFloat(producto.costoCompra) || 0)) * cantidad,
      ingresoTotal: (parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0) * cantidad
    };
    
    // Agregar venta al historial
    setVentas(prev => [nuevaVenta, ...prev]);
    
    // Actualizar stock del producto
    setProductos(prev => prev.map(p => 
      p.id == ventaActual.productoId 
        ? { ...p, stock: stockActual - cantidad, fechaUltimaVenta: ventaActual.fecha }
        : p
    ));
    
    // Limpiar formulario de venta
    setVentaActual({
      productoId: '',
      cantidad: '',
      precioVenta: '',
      fecha: new Date().toISOString().split('T')[0],
      cliente: '',
      metodoPago: 'efectivo'
    });
    
    // Mostrar confirmación
    alert(`¡Venta registrada! ${cantidad} unidades de ${producto.nombre}`);
  };

  // Calcular ventas reales de los últimos 30 días
  const calcularVentasReales30Dias = (productoId) => {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    return ventas
      .filter(venta => 
        venta.productoId == productoId && 
        new Date(venta.fecha) >= hace30Dias
      )
      .reduce((total, venta) => total + venta.cantidad, 0);
  };

  // Calcular ingresos reales de los últimos 30 días
  const calcularIngresosReales30Dias = (productoId = null) => {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    return ventas
      .filter(venta => {
        const dentroFecha = new Date(venta.fecha) >= hace30Dias;
        return productoId ? (venta.productoId == productoId && dentroFecha) : dentroFecha;
      })
      .reduce((total, venta) => total + venta.ingresoTotal, 0);
  };

  // Obtener tendencia de ventas (últimos 7 días vs 7 días anteriores)
  const obtenerTendenciaVentas = () => {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    const hace14Dias = new Date();
    hace14Dias.setDate(hoy.getDate() - 14);
    
    const ventasUltimos7 = ventas
      .filter(venta => new Date(venta.fecha) >= hace7Dias)
      .reduce((total, venta) => total + venta.ingresoTotal, 0);
      
    const ventas7DiasAnteriores = ventas
      .filter(venta => {
        const fecha = new Date(venta.fecha);
        return fecha >= hace14Dias && fecha < hace7Dias;
      })
      .reduce((total, venta) => total + venta.ingresoTotal, 0);
    
    const cambio = ventas7DiasAnteriores > 0 
      ? ((ventasUltimos7 - ventas7DiasAnteriores) / ventas7DiasAnteriores) * 100 
      : 0;
    
    return {
      ventasUltimos7,
      ventas7DiasAnteriores,
      cambioPortentual: cambio,
      tendencia: cambio > 5 ? 'subiendo' : cambio < -5 ? 'bajando' : 'estable'
    };
  };

  // Calcular punto de equilibrio por producto
  const calcularPuntoEquilibrio = (producto) => {
    const costoUnitario = (parseFloat(producto.costoCompra) || 0) + (parseFloat(producto.gastosFijos) || 0);
    const precioVenta = parseFloat(producto.precioVenta) || 0;
    const contribucionUnitaria = precioVenta - costoUnitario;
    
    if (contribucionUnitaria <= 0) return 'No rentable';
    
    const totalCostosFijos = Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) +
                           Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    const unidadesEquilibrio = Math.ceil(totalCostosFijos / contribucionUnitaria);
    return unidadesEquilibrio;
  };

  // Clasificación ABC de productos
  const clasificacionABC = () => {
    if (productos.length === 0) return { A: [], B: [], C: [] };
    
    const productosConIngreso = productos.map(p => ({
      ...p,
      ingresoMensual: (parseFloat(p.precioVenta) || 0) * (parseFloat(p.ventasUltimos30Dias) || 0)
    })).sort((a, b) => b.ingresoMensual - a.ingresoMensual);
    
    const totalIngresos = productosConIngreso.reduce((sum, p) => sum + p.ingresoMensual, 0);
    let acumulado = 0;
    const clasificados = { A: [], B: [], C: [] };
    
    productosConIngreso.forEach(producto => {
      acumulado += producto.ingresoMensual;
      const porcentajeAcumulado = (acumulado / totalIngresos) * 100;
      
      if (porcentajeAcumulado <= 80) {
        clasificados.A.push(producto);
      } else if (porcentajeAcumulado <= 95) {
        clasificados.B.push(producto);
      } else {
        clasificados.C.push(producto);
      }
    });
    
    return clasificados;
  };

  // Generar alertas del negocio
  const generarAlertas = () => {
    const alertasActivas = [];
    
    productos.forEach(producto => {
      const margen = ((parseFloat(producto.precioVenta) - parseFloat(producto.costoCompra)) / parseFloat(producto.precioVenta)) * 100;
      const stock = parseFloat(producto.stock) || 0;
      const ventasRecientes = parseFloat(producto.ventasUltimos30Dias) || 0;
      const precioCompetencia = parseFloat(producto.precioCompetencia) || 0;
      const precioVenta = parseFloat(producto.precioVenta) || 0;
      
      // Margen bajo
      if (margen < alertas.margenMinimo) {
        alertasActivas.push({
          tipo: 'danger',
          mensaje: `${producto.nombre}: Margen muy bajo (${margen.toFixed(1)}%)`,
          categoria: 'Rentabilidad',
          producto: producto.nombre
        });
      }
      
      // Stock bajo
      if (stock < alertas.stockMinimo) {
        alertasActivas.push({
          tipo: 'warning',
          mensaje: `${producto.nombre}: Stock crítico (${stock} unidades)`,
          categoria: 'Inventario',
          producto: producto.nombre
        });
      }
      
      // Sin ventas recientes
      if (ventasRecientes === 0) {
        alertasActivas.push({
          tipo: 'info',
          mensaje: `${producto.nombre}: Sin ventas en los últimos 30 días`,
          categoria: 'Ventas',
          producto: producto.nombre
        });
      }
      
      // Precio vs competencia
      if (precioCompetencia > 0 && precioVenta > 0) {
        const diferencia = ((precioVenta - precioCompetencia) / precioCompetencia) * 100;
        if (Math.abs(diferencia) > alertas.diferenciaPrecioCompetencia) {
          alertasActivas.push({
            tipo: diferencia > 0 ? 'warning' : 'info',
            mensaje: `${producto.nombre}: Precio ${diferencia > 0 ? 'superior' : 'inferior'} a competencia (${Math.abs(diferencia).toFixed(1)}%)`,
            categoria: 'Competencia',
            producto: producto.nombre
          });
        }
      }
    });
    
    return alertasActivas;
  };

  // Simulador de escenarios
  const simularEscenario = (tipo, porcentaje) => {
    return productos.map(producto => {
      const costoActual = parseFloat(producto.costoCompra) || 0;
      const precioActual = parseFloat(producto.precioVenta) || 0;
      let nuevoCosto = costoActual;
      let nuevoPrecio = precioActual;
      
      switch (tipo) {
        case 'aumento_costo':
          nuevoCosto = costoActual * (1 + porcentaje / 100);
          break;
        case 'reduccion_precio':
          nuevoPrecio = precioActual * (1 - porcentaje / 100);
          break;
        case 'aumento_precio':
          nuevoPrecio = precioActual * (1 + porcentaje / 100);
          break;
      }
      
      const nuevaUtilidad = nuevoPrecio - nuevoCosto;
      const nuevoMargen = nuevoPrecio > 0 ? (nuevaUtilidad / nuevoPrecio) * 100 : 0;
      
      return {
        ...producto,
        nuevoCosto,
        nuevoPrecio,
        nuevaUtilidad,
        nuevoMargen,
        impacto: nuevaUtilidad - (precioActual - costoActual)
      };
    });
  };

  // Calcular KPIs del dashboard
  const calcularKPIs = () => {
    if (productos.length === 0) return {};
    
    const totalInversion = productos.reduce((sum, p) => sum + ((parseFloat(p.costoCompra) || 0) * (parseFloat(p.stock) || 0)), 0);
    
    // Usar datos reales de ventas cuando estén disponibles
    const ventasMensualesReales = calcularIngresosReales30Dias();
    const ventasMensualesEstimadas = productos.reduce((sum, p) => sum + ((parseFloat(p.precioVenta) || 0) * (parseFloat(p.ventasUltimos30Dias) || 0)), 0);
    const ventasMensuales = ventasMensualesReales > 0 ? ventasMensualesReales : ventasMensualesEstimadas;
    
    // Calcular utilidad basada en ventas reales
    const utilidadReal = ventas
      .filter(venta => {
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        return new Date(venta.fecha) >= hace30Dias;
      })
      .reduce((sum, venta) => sum + venta.utilidadTotal, 0);
    
    const utilidadEstimada = productos.reduce((sum, p) => sum + ((parseFloat(p.utilidad) || 0) * (parseFloat(p.ventasUltimos30Dias) || 0)), 0);
    const utilidadMensual = utilidadReal > 0 ? utilidadReal : utilidadEstimada;
    
    const margenPromedio = ventasMensuales > 0 ? (utilidadMensual / ventasMensuales) * 100 : 0;
    
    // Calcular rotación basada en ventas reales
    const rotacionPromedio = productos.reduce((sum, p) => {
      const stock = parseFloat(p.stock) || 0;
      const ventasReales = calcularVentasReales30Dias(p.id);
      const ventas = ventasReales > 0 ? ventasReales : (parseFloat(p.ventasUltimos30Dias) || 0);
      return sum + (stock > 0 ? ventas / stock : 0);
    }, 0) / productos.length;
    
    const alertasActivas = generarAlertas();
    const clasificacion = clasificacionABC();
    const tendencia = obtenerTendenciaVentas();
    
    return {
      totalInversion,
      ventasMensuales,
      utilidadMensual,
      margenPromedio,
      rotacionPromedio,
      alertasActivas,
      clasificacion,
      tendencia,
      progresoMetas: {
        ventas: (ventasMensuales / metas.ventasMensuales) * 100,
        margen: (margenPromedio / metas.margenPromedio) * 100,
        rotacion: (rotacionPromedio / metas.rotacionInventario) * 100
      },
      // Estadísticas adicionales
      totalVentasHoy: ventas
        .filter(venta => venta.fecha === new Date().toISOString().split('T')[0])
        .reduce((sum, venta) => sum + venta.ingresoTotal, 0),
      unidadesVendidasHoy: ventas
        .filter(venta => venta.fecha === new Date().toISOString().split('T')[0])
        .reduce((sum, venta) => sum + venta.cantidad, 0)
    };
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

  useEffect(() => {
    calcularPrecios();
  }, [productoActual.costoCompra, productoActual.gastosFijos, productoActual.margenDeseado, configuracion]);

  const agregarProducto = () => {
    if (!productoActual.nombre || !productoActual.costoCompra || productoActual.costoCompra === '') return;
    
    if (editandoId) {
      setProductos(prev => prev.map(p => 
        p.id === editandoId ? { ...productoActual, id: editandoId } : p
      ));
      setEditandoId(null);
    } else {
      const nuevoProducto = {
        ...productoActual,
        id: Date.now(),
        fechaAgregado: new Date().toLocaleDateString()
      };
      setProductos(prev => [...prev, nuevoProducto]);
    }
    
    setProductoActual({
      nombre: '',
      categoria: 'alimentacion',
      costoCompra: '',
      gastosFijos: '',
      margenDeseado: '30',
      precioVenta: '',
      utilidad: '',
      stock: '',
      ventasUltimos30Dias: '',
      precioCompetencia: '',
      fechaUltimaVenta: '',
      rotacion: 'alta'
    });
  };

  const editarProducto = (producto) => {
    setProductoActual(producto);
    setEditandoId(producto.id);
    setVistaActiva('calculadora');
  };

  const eliminarProducto = (id) => {
    setProductos(prev => prev.filter(p => p.id !== id));
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
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'ventas', label: 'Registrar Venta', icon: ShoppingCart },
              { id: 'calculadora', label: 'Calculadora', icon: Calculator },
              { id: 'inventario', label: 'Inventario', icon: Package },
              { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
              { id: 'abc', label: 'Análisis ABC', icon: Award },
              { id: 'simulador', label: 'Simulador', icon: TrendingUp },
              { id: 'metas', label: 'Metas', icon: Target },
              { id: 'informes', label: 'Informes', icon: BarChart3 },
              { id: 'configuracion', label: 'Configuración', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setVistaActiva(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  vistaActiva === id
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Vista Registrar Ventas */}
        {vistaActiva === 'ventas' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Formulario de Venta */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ShoppingCart className="text-green-500" />
                  Registrar Nueva Venta
                </h2>
                
                {productos.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 mb-4">Primero debes agregar productos a tu inventario</p>
                    <button
                      onClick={() => setVistaActiva('calculadora')}
                      className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Agregar Productos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Producto
                      </label>
                      <select
                        value={ventaActual.productoId}
                        onChange={(e) => {
                          const producto = productos.find(p => p.id == e.target.value);
                          setVentaActual(prev => ({
                            ...prev,
                            productoId: e.target.value,
                            precioVenta: producto ? producto.precioVenta : ''
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar producto...</option>
                        {productos
                          .filter(p => (parseFloat(p.stock) || 0) > 0)
                          .map(producto => (
                            <option key={producto.id} value={producto.id}>
                              {producto.nombre} - Stock: {formatearNumero(producto.stock || 0)} - ${formatearNumero(parseFloat(producto.precioVenta || 0).toFixed(0))}
                            </option>
                          ))}
                      </select>
                    </div>

                    {ventaActual.productoId && (() => {
                      const productoSeleccionado = productos.find(p => p.id == ventaActual.productoId);
                      return (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-blue-700">
                            <p><strong>Stock disponible:</strong> {formatearNumero(productoSeleccionado?.stock || 0)} unidades</p>
                            <p><strong>Precio sugerido:</strong> ${formatearNumero(parseFloat(productoSeleccionado?.precioVenta || 0).toFixed(0))}</p>
                            <p><strong>Costo unitario:</strong> ${formatearNumero(parseFloat(productoSeleccionado?.costoCompra || 0).toFixed(0))}</p>
                          </div>
                        </div>
                      );
                    })()}
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad Vendida
                        </label>
                        <input
                          type="text"
                          value={formatearInput(ventaActual.cantidad)}
                          onChange={(e) => setVentaActual(prev => ({
                            ...prev,
                            cantidad: parsearInput(e.target.value)
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio de Venta ($)
                        </label>
                        <input
                          type="text"
                          value={formatearInput(ventaActual.precioVenta)}
                          onChange={(e) => setVentaActual(prev => ({
                            ...prev,
                            precioVenta: parsearInput(e.target.value)
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cliente (Opcional)
                        </label>
                        <input
                          type="text"
                          value={ventaActual.cliente}
                          onChange={(e) => setVentaActual(prev => ({...prev, cliente: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nombre del cliente"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Método de Pago
                        </label>
                        <select
                          value={ventaActual.metodoPago}
                          onChange={(e) => setVentaActual(prev => ({...prev, metodoPago: e.target.value}))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="efectivo">Efectivo</option>
                          <option value="tarjeta">Tarjeta</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="nequi">Nequi</option>
                          <option value="daviplata">Daviplata</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Venta
                      </label>
                      <input
                        type="date"
                        value={ventaActual.fecha}
                        onChange={(e) => setVentaActual(prev => ({...prev, fecha: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Resumen de Venta */}
                    {ventaActual.productoId && ventaActual.cantidad && ventaActual.precioVenta && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Resumen de la Venta</h4>
                        <div className="space-y-1 text-sm text-green-700">
                          <div className="flex justify-between">
                            <span>Total a cobrar:</span>
                            <span className="font-bold">
                              ${formatearNumero(((parseFloat(ventaActual.cantidad) || 0) * (parseFloat(ventaActual.precioVenta) || 0)).toFixed(0))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Utilidad total:</span>
                            <span className="font-bold">
                              ${formatearNumero((((parseFloat(ventaActual.precioVenta) || 0) - (parseFloat(productos.find(p => p.id == ventaActual.productoId)?.costoCompra) || 0)) * (parseFloat(ventaActual.cantidad) || 0)).toFixed(0))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={registrarVenta}
                      disabled={!ventaActual.productoId || !ventaActual.cantidad || ventaActual.cantidad === ''}
                      className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Registrar Venta
                    </button>
                  </div>
                )}
              </div>

              {/* Ventas de Hoy */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-500" />
                  Ventas de Hoy
                </h3>
                
                {(() => {
                  const ventasHoy = ventas.filter(venta => 
                    venta.fecha === new Date().toISOString().split('T')[0]
                  );
                  
                  if (ventasHoy.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">No hay ventas registradas hoy</p>
                      </div>
                    );
                  }
                  
                  const totalVentasHoy = ventasHoy.reduce((sum, venta) => sum + venta.ingresoTotal, 0);
                  const totalUtilidadHoy = ventasHoy.reduce((sum, venta) => sum + venta.utilidadTotal, 0);
                  
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-600">Total Ventas</p>
                          <p className="text-xl font-bold text-blue-700">${formatearNumero(totalVentasHoy.toFixed(0))}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm text-green-600">Utilidad</p>
                          <p className="text-xl font-bold text-green-700">${formatearNumero(totalUtilidadHoy.toFixed(0))}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {ventasHoy.map(venta => (
                          <div key={venta.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">{venta.productoNombre}</p>
                                <p className="text-sm text-gray-600">
                                  {formatearNumero(venta.cantidad)} unidades × ${formatearNumero(venta.precioVenta.toFixed(0))}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {venta.cliente} • {venta.metodoPago}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">${formatearNumero(venta.ingresoTotal.toFixed(0))}</p>
                                <p className="text-sm text-gray-500">+${formatearNumero(venta.utilidadTotal.toFixed(0))}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Historial de Ventas Recientes */}
            {ventas.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="text-purple-500" />
                  Historial de Ventas Recientes
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Fecha</th>
                        <th className="text-left py-2">Producto</th>
                        <th className="text-center py-2">Cantidad</th>
                        <th className="text-right py-2">Precio Unit.</th>
                        <th className="text-right py-2">Total</th>
                        <th className="text-right py-2">Utilidad</th>
                        <th className="text-left py-2">Cliente</th>
                        <th className="text-left py-2">Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.slice(0, 10).map(venta => (
                        <tr key={venta.id} className="border-b">
                          <td className="py-2">{new Date(venta.fecha).toLocaleDateString()}</td>
                          <td className="py-2 font-medium">{venta.productoNombre}</td>
                          <td className="py-2 text-center">{formatearNumero(venta.cantidad)}</td>
                          <td className="py-2 text-right">${formatearNumero(venta.precioVenta.toFixed(0))}</td>
                          <td className="py-2 text-right font-bold text-blue-600">
                            ${formatearNumero(venta.ingresoTotal.toFixed(0))}
                          </td>
                          <td className="py-2 text-right font-bold text-green-600">
                            ${formatearNumero(venta.utilidadTotal.toFixed(0))}
                          </td>
                          <td className="py-2">{venta.cliente}</td>
                          <td className="py-2 capitalize">{venta.metodoPago}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {ventas.length > 10 && (
                  <p className="text-center text-gray-500 mt-4">
                    Mostrando las 10 ventas más recientes de {ventas.length} total
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vista Dashboard */}
        {vistaActiva === 'dashboard' && (
          <div className="space-y-6">
            {productos.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Activity className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">¡Bienvenido a tu Dashboard Empresarial!</h3>
                <p className="text-gray-500 mb-4">Agrega productos para ver análisis avanzados y métricas clave de tu negocio</p>
                <button
                  onClick={() => setVistaActiva('calculadora')}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Agregar Primer Producto
                </button>
              </div>
            ) : (() => {
              const kpis = calcularKPIs();
              return (
                <>
                  {/* KPIs Principales */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Ventas Hoy</p>
                          <p className="text-2xl font-bold text-blue-600">${formatearNumero(kpis.totalVentasHoy?.toFixed(0) || 0)}</p>
                          <p className="text-xs text-gray-500">{formatearNumero(kpis.unidadesVendidasHoy || 0)} unidades</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                          <ShoppingCart className="text-blue-600" size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Ventas Mensuales</p>
                          <p className="text-2xl font-bold text-green-600">${formatearNumero(kpis.ventasMensuales?.toFixed(0) || 0)}</p>
                          <p className="text-xs text-gray-500">Meta: ${formatearNumero(metas.ventasMensuales)}</p>
                        </div>
                        <div className={`p-3 rounded-full ${kpis.progresoMetas?.ventas >= 100 ? 'bg-green-100' : kpis.progresoMetas?.ventas >= 75 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                          <DollarSign className={`${kpis.progresoMetas?.ventas >= 100 ? 'text-green-600' : kpis.progresoMetas?.ventas >= 75 ? 'text-yellow-600' : 'text-red-600'}`} size={24} />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${kpis.progresoMetas?.ventas >= 100 ? 'bg-green-500' : kpis.progresoMetas?.ventas >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(kpis.progresoMetas?.ventas || 0, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{(kpis.progresoMetas?.ventas || 0).toFixed(1)}% de la meta</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Utilidad Mensual</p>
                          <p className="text-2xl font-bold text-green-600">${formatearNumero(kpis.utilidadMensual?.toFixed(0) || 0)}</p>
                          <p className="text-xs text-gray-500">Margen: {(kpis.margenPromedio || 0).toFixed(1)}%</p>
                        </div>
                        <TrendingUp className="text-green-500" size={32} />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Tendencia 7 días</p>
                          <p className={`text-2xl font-bold ${
                            kpis.tendencia?.tendencia === 'subiendo' ? 'text-green-600' :
                            kpis.tendencia?.tendencia === 'bajando' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {kpis.tendencia?.cambioPortentual >= 0 ? '+' : ''}{(kpis.tendencia?.cambioPortentual || 0).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {kpis.tendencia?.tendencia === 'subiendo' ? '📈 Subiendo' :
                             kpis.tendencia?.tendencia === 'bajando' ? '📉 Bajando' :
                             '➡️ Estable'}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${
                          kpis.tendencia?.tendencia === 'subiendo' ? 'bg-green-100' :
                          kpis.tendencia?.tendencia === 'bajando' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          <Activity className={`${
                            kpis.tendencia?.tendencia === 'subiendo' ? 'text-green-600' :
                            kpis.tendencia?.tendencia === 'bajando' ? 'text-red-600' :
                            'text-gray-600'
                          }`} size={24} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Alertas Activas</p>
                          <p className="text-2xl font-bold text-red-600">{kpis.alertasActivas?.length || 0}</p>
                          <p className="text-xs text-gray-500">Requieren atención</p>
                        </div>
                        <AlertTriangle className="text-red-500" size={32} />
                      </div>
                    </div>
                  </div>

                  {/* Acceso Rápido a Ventas */}
                  {ventas.length === 0 && productos.length > 0 && (
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-2">¡Empieza a registrar tus ventas! 🚀</h3>
                          <p className="opacity-90">Registra ventas para obtener datos reales y análisis más precisos de tu negocio</p>
                        </div>
                        <button
                          onClick={() => setVistaActiva('ventas')}
                          className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <ShoppingCart size={20} />
                          Registrar Primera Venta
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Alertas Críticas */}
                  {kpis.alertasActivas?.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        Alertas Críticas
                      </h3>
                      <div className="space-y-2">
                        {kpis.alertasActivas.slice(0, 5).map((alerta, index) => (
                          <div key={index} className={`p-3 rounded-lg border-l-4 ${
                            alerta.tipo === 'danger' ? 'bg-red-50 border-red-500' :
                            alerta.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-blue-50 border-blue-500'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">{alerta.mensaje}</p>
                                <p className="text-sm text-gray-600">{alerta.categoria}</p>
                              </div>
                              <button
                                onClick={() => setVistaActiva('alertas')}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                              >
                                Ver detalles
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Análisis ABC Resumen */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="text-yellow-500" />
                        Productos Estrella (Clase A)
                      </h3>
                      {kpis.clasificacion?.A.length > 0 ? (
                        <div className="space-y-2">
                          {kpis.clasificacion.A.slice(0, 3).map((producto, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                              <span className="font-medium">{producto.nombre}</span>
                              <span className="text-green-600 font-bold">${formatearNumero(producto.ingresoMensual.toFixed(0))}</span>
                            </div>
                          ))}
                          <button
                            onClick={() => setVistaActiva('abc')}
                            className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                          >
                            Ver análisis completo →
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-500">Agrega más datos de ventas para ver el análisis</p>
                      )}
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="text-blue-500" />
                        Progreso de Metas
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Ventas Mensuales</span>
                            <span>{(kpis.progresoMetas?.ventas || 0).toFixed(1)}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(kpis.progresoMetas?.ventas || 0, 100)}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Margen Promedio</span>
                            <span>{(kpis.progresoMetas?.margen || 0).toFixed(1)}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(kpis.progresoMetas?.margen || 0, 100)}%` }}></div>
                          </div>
                        </div>
                        <button
                          onClick={() => setVistaActiva('metas')}
                          className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                        >
                          Configurar metas →
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Vista Alertas */}
        {vistaActiva === 'alertas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Sistema de Alertas Empresariales
              </h2>
              
              {productos.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Agrega productos para generar alertas inteligentes</p>
                </div>
              ) : (() => {
                const alertasActivas = generarAlertas();
                const alertasPorCategoria = alertasActivas.reduce((acc, alerta) => {
                  acc[alerta.categoria] = acc[alerta.categoria] || [];
                  acc[alerta.categoria].push(alerta);
                  return acc;
                }, {});

                return (
                  <>
                    {/* Configuración de Alertas */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">Configuración de Alertas</h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Margen Mínimo (%)</label>
                          <input
                            type="number"
                            value={alertas.margenMinimo}
                            onChange={(e) => setAlertas(prev => ({...prev, margenMinimo: parseFloat(e.target.value) || 0}))}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Stock Mínimo</label>
                          <input
                            type="number"
                            value={alertas.stockMinimo}
                            onChange={(e) => setAlertas(prev => ({...prev, stockMinimo: parseFloat(e.target.value) || 0}))}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Días Sin Venta</label>
                          <input
                            type="number"
                            value={alertas.diasSinVenta}
                            onChange={(e) => setAlertas(prev => ({...prev, diasSinVenta: parseFloat(e.target.value) || 0}))}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Dif. Competencia (%)</label>
                          <input
                            type="number"
                            value={alertas.diferenciaPrecioCompetencia}
                            onChange={(e) => setAlertas(prev => ({...prev, diferenciaPrecioCompetencia: parseFloat(e.target.value) || 0}))}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resumen de Alertas */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-700">Críticas</h4>
                        <p className="text-2xl font-bold text-red-600">
                          {alertasActivas.filter(a => a.tipo === 'danger').length}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-700">Advertencias</h4>
                        <p className="text-2xl font-bold text-yellow-600">
                          {alertasActivas.filter(a => a.tipo === 'warning').length}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-700">Informativas</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {alertasActivas.filter(a => a.tipo === 'info').length}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-700">Total</h4>
                        <p className="text-2xl font-bold text-green-600">{alertasActivas.length}</p>
                      </div>
                    </div>

                    {/* Alertas por Categoría */}
                    {Object.keys(alertasPorCategoria).length === 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <div className="text-green-600 mb-2">✅</div>
                        <h3 className="font-semibold text-green-800">¡Todo está bajo control!</h3>
                        <p className="text-green-600">No hay alertas activas en este momento</p>
                      </div>
                    ) : (
                      Object.entries(alertasPorCategoria).map(([categoria, alertas]) => (
                        <div key={categoria} className="bg-white border rounded-lg p-4">
                          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            {categoria === 'Rentabilidad' && <TrendingDown className="text-red-500" />}
                            {categoria === 'Inventario' && <Package className="text-yellow-500" />}
                            {categoria === 'Ventas' && <ShoppingCart className="text-blue-500" />}
                            {categoria === 'Competencia' && <Eye className="text-purple-500" />}
                            {categoria}
                          </h3>
                          <div className="space-y-2">
                            {alertas.map((alerta, index) => (
                              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                alerta.tipo === 'danger' ? 'bg-red-50 border-red-500' :
                                alerta.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                                'bg-blue-50 border-blue-500'
                              }`}>
                                <p className="font-medium text-gray-800">{alerta.mensaje}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-sm text-gray-600">Producto: {alerta.producto}</span>
                                  <button className="text-blue-500 hover:text-blue-700 text-sm">
                                    Ver producto →
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Vista Análisis ABC */}
        {vistaActiva === 'abc' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" />
                Análisis ABC - Clasificación de Productos
              </h2>
              
              {productos.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Agrega productos con datos de ventas para ver la clasificación ABC</p>
                </div>
              ) : (() => {
                const clasificacion = clasificacionABC();
                const totalIngresos = [...clasificacion.A, ...clasificacion.B, ...clasificacion.C]
                  .reduce((sum, p) => sum + p.ingresoMensual, 0);

                return (
                  <>
                    {/* Explicación del Análisis ABC */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-800 mb-2">¿Qué es el Análisis ABC?</h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li><strong>Clase A (80%):</strong> Productos que generan el 80% de tus ingresos - PRIORIDAD MÁXIMA</li>
                        <li><strong>Clase B (15%):</strong> Productos de importancia media - GESTIÓN REGULAR</li>
                        <li><strong>Clase C (5%):</strong> Productos de baja rotación - REVISAR CONTINUIDAD</li>
                      </ul>
                    </div>

                    {/* Resumen de Clasificación */}
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-yellow-500 text-white p-2 rounded-full">
                            <Award size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-yellow-800">Clase A - Estrella</h3>
                            <p className="text-sm text-yellow-600">{clasificacion.A.length} productos</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-yellow-700">
                          ${formatearNumero(clasificacion.A.reduce((sum, p) => sum + p.ingresoMensual, 0).toFixed(0))}
                        </p>
                        <p className="text-sm text-yellow-600">
                          {totalIngresos > 0 ? ((clasificacion.A.reduce((sum, p) => sum + p.ingresoMensual, 0) / totalIngresos) * 100).toFixed(1) : 0}% de ingresos
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-blue-500 text-white p-2 rounded-full">
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-blue-800">Clase B - Regular</h3>
                            <p className="text-sm text-blue-600">{clasificacion.B.length} productos</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          ${formatearNumero(clasificacion.B.reduce((sum, p) => sum + p.ingresoMensual, 0).toFixed(0))}
                        </p>
                        <p className="text-sm text-blue-600">
                          {totalIngresos > 0 ? ((clasificacion.B.reduce((sum, p) => sum + p.ingresoMensual, 0) / totalIngresos) * 100).toFixed(1) : 0}% de ingresos
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-gray-500 text-white p-2 rounded-full">
                            <TrendingDown size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">Clase C - Revisar</h3>
                            <p className="text-sm text-gray-600">{clasificacion.C.length} productos</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-700">
                          ${formatearNumero(clasificacion.C.reduce((sum, p) => sum + p.ingresoMensual, 0).toFixed(0))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {totalIngresos > 0 ? ((clasificacion.C.reduce((sum, p) => sum + p.ingresoMensual, 0) / totalIngresos) * 100).toFixed(1) : 0}% de ingresos
                        </p>
                      </div>
                    </div>

                    {/* Listado Detallado por Clase */}
                    {['A', 'B', 'C'].map(clase => (
                      <div key={clase} className="bg-white border rounded-lg overflow-hidden">
                        <div className={`p-4 ${
                          clase === 'A' ? 'bg-yellow-50 border-b border-yellow-200' :
                          clase === 'B' ? 'bg-blue-50 border-b border-blue-200' :
                          'bg-gray-50 border-b border-gray-200'
                        }`}>
                          <h3 className={`font-bold ${
                            clase === 'A' ? 'text-yellow-800' :
                            clase === 'B' ? 'text-blue-800' :
                            'text-gray-800'
                          }`}>
                            Productos Clase {clase}
                            {clase === 'A' && ' - ¡Protege estos productos a toda costa!'}
                            {clase === 'B' && ' - Mantén un control regular'}
                            {clase === 'C' && ' - Considera descontinuar si no mejoran'}
                          </h3>
                        </div>
                        
                        {clasificacion[clase].length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Producto</th>
                                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Ventas/Mes</th>
                                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Ingresos</th>
                                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">% Total</th>
                                  <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">Punto Equilibrio</th>
                                </tr>
                              </thead>
                              <tbody>
                                {clasificacion[clase].map((producto, index) => (
                                  <tr key={index} className="border-t">
                                    <td className="py-2 px-4 font-medium">{producto.nombre}</td>
                                    <td className="py-2 px-4 text-right">{formatearNumero(producto.ventasUltimos30Dias || 0)}</td>
                                    <td className="py-2 px-4 text-right font-bold text-green-600">
                                      ${formatearNumero(producto.ingresoMensual.toFixed(0))}
                                    </td>
                                    <td className="py-2 px-4 text-right">
                                      {totalIngresos > 0 ? ((producto.ingresoMensual / totalIngresos) * 100).toFixed(1) : 0}%
                                    </td>
                                    <td className="py-2 px-4 text-right text-sm">
                                      {calcularPuntoEquilibrio(producto)} unidades
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-gray-500">
                            No hay productos en esta clase
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Vista Simulador */}
        {vistaActiva === 'simulador' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-blue-500" />
                Simulador de Escenarios
              </h2>
              
              {productos.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Agrega productos para simular diferentes escenarios de negocio</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Controles de Simulación */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Configurar Escenario</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => {
                          const resultado = simularEscenario('aumento_costo', 15);
                          console.log('Simulación: Aumento de costos 15%', resultado);
                        }}
                        className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <TrendingUp className="mx-auto mb-2" />
                        <div className="text-sm font-medium">Costos +15%</div>
                        <div className="text-xs opacity-75">¿Qué pasa si suben los costos?</div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          const resultado = simularEscenario('reduccion_precio', 10);
                          console.log('Simulación: Reducción de precios 10%', resultado);
                        }}
                        className="bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <TrendingDown className="mx-auto mb-2" />
                        <div className="text-sm font-medium">Precios -10%</div>
                        <div className="text-xs opacity-75">Competir con precios más bajos</div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          const resultado = simularEscenario('aumento_precio', 5);
                          console.log('Simulación: Aumento de precios 5%', resultado);
                        }}
                        className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <TrendingUp className="mx-auto mb-2" />
                        <div className="text-sm font-medium">Precios +5%</div>
                        <div className="text-xs opacity-75">Mejorar márgenes</div>
                      </button>
                    </div>
                  </div>

                  {/* Resultados de Simulación */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Impacto por Producto</h3>
                    <div className="text-center text-gray-500">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Selecciona un escenario arriba para ver el análisis detallado</p>
                      <p className="text-sm mt-2">Podrás ver cómo cada cambio afecta la rentabilidad de tus productos</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista Metas */}
        {vistaActiva === 'metas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="text-blue-500" />
                Metas y Seguimiento
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Configuración de Metas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Configurar Metas Mensuales</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Meta de Ventas Mensuales ($)
                      </label>
                      <input
                        type="text"
                        value={formatearInput(metas.ventasMensuales)}
                        onChange={(e) => setMetas(prev => ({
                          ...prev,
                          ventasMensuales: parsearInput(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Meta de Unidades Mensuales
                      </label>
                      <input
                        type="text"
                        value={formatearInput(metas.unidadesMensuales)}
                        onChange={(e) => setMetas(prev => ({
                          ...prev,
                          unidadesMensuales: parsearInput(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Margen Promedio Objetivo (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={metas.margenPromedio}
                        onChange={(e) => setMetas(prev => ({
                          ...prev,
                          margenPromedio: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Progreso Actual */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Progreso Actual</h3>
                  {productos.length > 0 ? (() => {
                    const kpis = calcularKPIs();
                    return (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Ventas Mensuales</span>
                            <span className="text-sm text-gray-600">
                              ${formatearNumero(kpis.ventasMensuales?.toFixed(0) || 0)} / ${formatearNumero(metas.ventasMensuales)}
                            </span>
                          </div>
                          <div className="bg-blue-200 rounded-full h-3">
                            <div 
                              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((kpis.progresoMetas?.ventas || 0), 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {(kpis.progresoMetas?.ventas || 0).toFixed(1)}% completado
                          </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Margen Promedio</span>
                            <span className="text-sm text-gray-600">
                              {(kpis.margenPromedio || 0).toFixed(1)}% / {metas.margenPromedio}%
                            </span>
                          </div>
                          <div className="bg-green-200 rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((kpis.progresoMetas?.margen || 0), 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {(kpis.progresoMetas?.margen || 0).toFixed(1)}% completado
                          </p>
                        </div>

                        {/* Recomendaciones */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">💡 Recomendaciones</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {(kpis.progresoMetas?.ventas || 0) < 75 && (
                              <li>• Considera estrategias de marketing para aumentar ventas</li>
                            )}
                            {(kpis.progresoMetas?.margen || 0) < 75 && (
                              <li>• Revisa los precios de productos con bajo margen</li>
                            )}
                            {(kpis.progresoMetas?.ventas || 0) > 100 && (
                              <li>• ¡Excelente! Considera aumentar tus metas para el próximo mes</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="mx-auto mb-4 opacity-50" size={48} />
                      <p>Agrega productos para ver el progreso de tus metas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
                
                <div className="grid md:grid-cols-2 gap-4">
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
                      Stock Actual
                    </label>
                    <input
                      type="text"
                      value={formatearInput(productoActual.stock)}
                      onChange={(e) => manejarCambioInput('stock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
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
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ventas Últimos 30 Días
                    </label>
                    <input
                      type="text"
                      value={formatearInput(productoActual.ventasUltimos30Dias)}
                      onChange={(e) => manejarCambioInput('ventasUltimos30Dias', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Unidades vendidas</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Competencia ($)
                    </label>
                    <input
                      type="text"
                      value={formatearInput(productoActual.precioCompetencia)}
                      onChange={(e) => manejarCambioInput('precioCompetencia', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Precio de referencia</p>
                  </div>
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
                      <th className="text-center py-3 px-2">Stock</th>
                      <th className="text-center py-3 px-2">Ventas/30d</th>
                      <th className="text-right py-3 px-2">Costo</th>
                      <th className="text-right py-3 px-2">Precio</th>
                      <th className="text-right py-3 px-2">Competencia</th>
                      <th className="text-right py-3 px-2">Utilidad</th>
                      <th className="text-right py-3 px-2">Margen</th>
                      <th className="text-center py-3 px-2">P.Equilibrio</th>
                      <th className="text-center py-3 px-2">ABC</th>
                      <th className="text-center py-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(producto => {
                      const clasificacionProducto = clasificacionABC();
                      let claseABC = 'C';
                      if (clasificacionProducto.A.find(p => p.id === producto.id)) claseABC = 'A';
                      else if (clasificacionProducto.B.find(p => p.id === producto.id)) claseABC = 'B';
                      
                      const puntoEquilibrio = calcularPuntoEquilibrio(producto);
                      const precioCompetencia = parseFloat(producto.precioCompetencia) || 0;
                      const precioVenta = parseFloat(producto.precioVenta) || 0;
                      const diferenciaPrecio = precioCompetencia > 0 && precioVenta > 0 
                        ? ((precioVenta - precioCompetencia) / precioCompetencia) * 100 
                        : 0;

                      // Datos de ventas reales vs estimadas
                      const ventasReales30Dias = calcularVentasReales30Dias(producto.id);
                      const ventasEstimadas = parseFloat(producto.ventasUltimos30Dias) || 0;
                      const ventasMostrar = ventasReales30Dias > 0 ? ventasReales30Dias : ventasEstimadas;
                      const esVentaReal = ventasReales30Dias > 0;

                      // Stock crítico basado en ventas
                      const stockActual = parseFloat(producto.stock) || 0;
                      const esStockCritico = stockActual < alertas.stockMinimo;
                      const diasInventario = ventasMostrar > 0 ? Math.ceil((stockActual / ventasMostrar) * 30) : 999;

                      return (
                        <tr key={producto.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">{producto.nombre}</td>
                          <td className="py-3 px-2 capitalize">{producto.categoria}</td>
                          <td className="py-3 px-2 text-center">
                            <div className="space-y-1">
                              <span className={`px-2 py-1 rounded text-sm block ${esStockCritico ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {formatearNumero(producto.stock || 0)}
                              </span>
                              {ventasMostrar > 0 && (
                                <div className="text-xs text-gray-500">
                                  {diasInventario < 30 ? `${diasInventario}d restantes` : '30d+'}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="space-y-1">
                              <span className={`${esVentaReal ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                                {formatearNumero(ventasMostrar)}
                              </span>
                              <div className="text-xs">
                                {esVentaReal ? (
                                  <span className="text-green-600">✓ Real</span>
                                ) : (
                                  <span className="text-gray-500">📊 Estimado</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            ${formatearNumero(((parseFloat(producto.costoCompra) || 0) + (parseFloat(producto.gastosFijos) || 0)).toFixed(0))}
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-blue-600">
                            ${formatearNumero((parseFloat(producto.precioVenta) || 0).toFixed(0))}
                          </td>
                          <td className="py-3 px-2 text-right">
                            {precioCompetencia > 0 ? (
                              <div>
                                <div>${formatearNumero(precioCompetencia.toFixed(0))}</div>
                                {diferenciaPrecio !== 0 && (
                                  <div className={`text-xs ${diferenciaPrecio > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {diferenciaPrecio > 0 ? '+' : ''}{diferenciaPrecio.toFixed(1)}%
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-green-600">
                            ${formatearNumero((parseFloat(producto.utilidad) || 0).toFixed(0))}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className={`${
                              parseFloat(producto.margenDeseado) < alertas.margenMinimo 
                                ? 'text-red-600 font-bold' 
                                : 'text-gray-600'
                            }`}>
                              {producto.margenDeseado}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center text-sm">
                            {typeof puntoEquilibrio === 'number' ? formatearNumero(puntoEquilibrio) : puntoEquilibrio}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              claseABC === 'A' ? 'bg-yellow-100 text-yellow-800' :
                              claseABC === 'B' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {claseABC}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex justify-center gap-2">
                              {stockActual > 0 && (
                                <button
                                  onClick={() => {
                                    setVentaActual(prev => ({
                                      ...prev,
                                      productoId: producto.id,
                                      precioVenta: producto.precioVenta,
                                      cantidad: '1'
                                    }));
                                    setVistaActiva('ventas');
                                  }}
                                  className="text-green-500 hover:text-green-700"
                                  title="Venta rápida"
                                >
                                  <ShoppingCart size={16} />
                                </button>
                              )}
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
                      );
                    })}
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
                <p className="text-gray-500">Agrega productos para ver los informes avanzados</p>
              </div>
            ) : (
              <>
                {/* Resumen Ejecutivo */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="text-blue-500" />
                    Informe Ejecutivo - Resumen del Negocio
                  </h2>
                  
                  {(() => {
                    const kpis = calcularKPIs();
                    const clasificacion = clasificacionABC();
                    const totalCostosFijos = Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) +
                                           Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                    
                    return (
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Métricas Financieras */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-4">💰 Métricas Financieras</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ingresos Mensuales:</span>
                              <span className="font-bold text-green-600">${formatearNumero(kpis.ventasMensuales?.toFixed(0) || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Utilidad Neta:</span>
                              <span className="font-bold text-green-600">${formatearNumero(kpis.utilidadMensual?.toFixed(0) || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Margen Promedio:</span>
                              <span className="font-bold">{(kpis.margenPromedio || 0).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Costos Fijos:</span>
                              <span className="font-bold text-red-600">${formatearNumero(totalCostosFijos)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Inversión en Inventario:</span>
                              <span className="font-bold text-purple-600">${formatearNumero(kpis.totalInversion?.toFixed(0) || 0)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-600 font-semibold">ROI Mensual:</span>
                              <span className="font-bold text-blue-600">
                                {kpis.totalInversion > 0 ? ((kpis.utilidadMensual / kpis.totalInversion) * 100).toFixed(1) : 0}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Análisis de Productos */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Análisis de Productos</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total de Productos:</span>
                              <span className="font-bold">{productos.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Productos Clase A:</span>
                              <span className="font-bold text-yellow-600">{clasificacion.A.length} (⭐ Estrella)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Productos Clase B:</span>
                              <span className="font-bold text-blue-600">{clasificacion.B.length} (📈 Regular)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Productos Clase C:</span>
                              <span className="font-bold text-gray-600">{clasificacion.C.length} (⚠️ Revisar)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Alertas Activas:</span>
                              <span className="font-bold text-red-600">{kpis.alertasActivas?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rotación Promedio:</span>
                              <span className="font-bold">{(kpis.rotacionPromedio || 0).toFixed(1)}x/mes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Punto de Equilibrio del Negocio */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Target className="text-green-500" />
                    Punto de Equilibrio del Negocio
                  </h3>
                  
                  {(() => {
                    const totalCostosFijos = Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) +
                                           Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                    const ventasPromedio = productos.reduce((sum, p) => sum + (parseFloat(p.precioVenta) || 0), 0) / productos.length;
                    const costosPromedio = productos.reduce((sum, p) => sum + ((parseFloat(p.costoCompra) || 0) + (parseFloat(p.gastosFijos) || 0)), 0) / productos.length;
                    const contribucionPromedio = ventasPromedio - costosPromedio;
                    const unidadesEquilibrio = contribucionPromedio > 0 ? Math.ceil(totalCostosFijos / contribucionPromedio) : 0;
                    const ventasEquilibrio = unidadesEquilibrio * ventasPromedio;
                    
                    return (
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-700 mb-2">Costos Fijos Mensuales</h4>
                          <p className="text-2xl font-bold text-red-600">${formatearNumero(totalCostosFijos)}</p>
                          <p className="text-sm text-red-500">Debes cubrir estos costos cada mes</p>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-700 mb-2">Unidades de Equilibrio</h4>
                          <p className="text-2xl font-bold text-blue-600">{formatearNumero(unidadesEquilibrio)}</p>
                          <p className="text-sm text-blue-500">Productos a vender para no perder</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-700 mb-2">Ventas de Equilibrio</h4>
                          <p className="text-2xl font-bold text-green-600">${formatearNumero(ventasEquilibrio.toFixed(0))}</p>
                          <p className="text-sm text-green-500">Ingresos mínimos mensuales</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Análisis por Categoría */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Análisis por Categoría</h3>
                  
                  {(() => {
                    const stats = calcularEstadisticas();
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Categoría</th>
                              <th className="text-center py-2">Productos</th>
                              <th className="text-right py-2">Ingresos</th>
                              <th className="text-right py-2">Utilidad</th>
                              <th className="text-right py-2">% del Total</th>
                              <th className="text-center py-2">Rendimiento</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(stats.productosPorCategoria || {}).map(([categoria, cantidad]) => {
                              const ingresosCategoria = productos
                                .filter(p => p.categoria === categoria)
                                .reduce((sum, p) => sum + ((parseFloat(p.precioVenta) || 0) * (parseFloat(p.ventasUltimos30Dias) || 0)), 0);
                              const utilidadCategoria = stats.utilidadPorCategoria[categoria] || 0;
                              const porcentajeTotal = parseFloat(stats.totalVentas) > 0 ? (ingresosCategoria / parseFloat(stats.totalVentas)) * 100 : 0;
                              
                              return (
                                <tr key={categoria} className="border-b">
                                  <td className="py-2 capitalize font-medium">{categoria}</td>
                                  <td className="py-2 text-center">{cantidad}</td>
                                  <td className="py-2 text-right font-bold text-blue-600">
                                    ${formatearNumero(ingresosCategoria.toFixed(0))}
                                  </td>
                                  <td className="py-2 text-right font-bold text-green-600">
                                    ${formatearNumero(utilidadCategoria.toFixed(0))}
                                  </td>
                                  <td className="py-2 text-right">{porcentajeTotal.toFixed(1)}%</td>
                                  <td className="py-2 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      porcentajeTotal > 30 ? 'bg-green-100 text-green-800' :
                                      porcentajeTotal > 15 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {porcentajeTotal > 30 ? 'Excelente' :
                                       porcentajeTotal > 15 ? 'Bueno' : 'Mejorar'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>

                {/* Recomendaciones Estratégicas */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" />
                    Recomendaciones Estratégicas
                  </h3>
                  
                  {(() => {
                    const kpis = calcularKPIs();
                    const clasificacion = clasificacionABC();
                    const recomendaciones = [];
                    
                    // Generar recomendaciones inteligentes
                    if (clasificacion.C.length > clasificacion.A.length) {
                      recomendaciones.push({
                        tipo: 'warning',
                        titulo: 'Demasiados productos de baja rotación',
                        descripcion: `Tienes ${clasificacion.C.length} productos clase C vs ${clasificacion.A.length} clase A. Considera descontinuar productos que no generen valor.`,
                        accion: 'Revisar productos clase C en la sección Análisis ABC'
                      });
                    }
                    
                    if ((kpis.margenPromedio || 0) < 25) {
                      recomendaciones.push({
                        tipo: 'danger',
                        titulo: 'Margen promedio bajo',
                        descripcion: `Tu margen promedio es ${(kpis.margenPromedio || 0).toFixed(1)}%. Para un negocio sostenible, se recomienda mínimo 25%.`,
                        accion: 'Ajustar precios o negociar mejores costos con proveedores'
                      });
                    }
                    
                    if (kpis.alertasActivas?.length > 5) {
                      recomendaciones.push({
                        tipo: 'warning',
                        titulo: 'Múltiples alertas activas',
                        descripcion: `Tienes ${kpis.alertasActivas.length} alertas que requieren atención inmediata.`,
                        accion: 'Revisar la sección de Alertas y tomar acciones correctivas'
                      });
                    }
                    
                    if ((kpis.progresoMetas?.ventas || 0) > 120) {
                      recomendaciones.push({
                        tipo: 'success',
                        titulo: '¡Excelente rendimiento!',
                        descripcion: `Has superado tus metas de ventas en ${((kpis.progresoMetas?.ventas || 0) - 100).toFixed(1)}%. `,
                        accion: 'Considera aumentar tus metas o expandir tu inventario'
                      });
                    }
                    
                    // Si no hay recomendaciones específicas, agregar algunas generales
                    if (recomendaciones.length === 0) {
                      recomendaciones.push({
                        tipo: 'info',
                        titulo: 'Optimización continua',
                        descripcion: 'Tu negocio se ve saludable. Mantén un seguimiento regular de tus métricas.',
                        accion: 'Revisa semanalmente tus KPIs y ajusta estrategias según sea necesario'
                      });
                    }
                    
                    return (
                      <div className="space-y-4">
                        {recomendaciones.map((rec, index) => (
                          <div key={index} className={`p-4 rounded-lg border-l-4 ${
                            rec.tipo === 'danger' ? 'bg-red-50 border-red-500' :
                            rec.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                            rec.tipo === 'success' ? 'bg-green-50 border-green-500' :
                            'bg-blue-50 border-blue-500'
                          }`}>
                            <h4 className={`font-semibold mb-2 ${
                              rec.tipo === 'danger' ? 'text-red-800' :
                              rec.tipo === 'warning' ? 'text-yellow-800' :
                              rec.tipo === 'success' ? 'text-green-800' :
                              'text-blue-800'
                            }`}>
                              {rec.titulo}
                            </h4>
                            <p className="text-gray-700 mb-2">{rec.descripcion}</p>
                            <p className={`text-sm font-medium ${
                              rec.tipo === 'danger' ? 'text-red-600' :
                              rec.tipo === 'warning' ? 'text-yellow-600' :
                              rec.tipo === 'success' ? 'text-green-600' :
                              'text-blue-600'
                            }`}>
                              💡 Acción recomendada: {rec.accion}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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