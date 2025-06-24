export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  costoCompra: string;
  gastosFijos: string;
  margenDeseado: string;
  precioVenta: string;
  utilidad: string;
  stock: string;
  ventasUltimos30Dias: string;
  precioCompetencia: string;
  fechaUltimaVenta: string;
  rotacion: string;
}

export interface Venta {
  id: string;
  productoId: string;
  cantidad: string;
  precioVenta: string;
  fecha: string;
  cliente: string;
  metodoPago: string;
  producto?: Producto;
  total?: number;
}

export interface VentaActual {
  productoId: string;
  cantidad: string;
  precioVenta: string;
  fecha: string;
  cliente: string;
  metodoPago: string;
}

export interface ProductoActual {
  nombre: string;
  categoria: string;
  costoCompra: string;
  gastosFijos: string;
  margenDeseado: string;
  precioVenta: string;
  utilidad: string;
  stock: string;
  ventasUltimos30Dias: string;
  precioCompetencia: string;
  fechaUltimaVenta: string;
  rotacion: string;
}

export interface Metas {
  ventasMensuales: number;
  unidadesMensuales: number;
  margenPromedio: number;
  rotacionInventario: number;
}

export interface Alertas {
  margenMinimo: number;
  stockMinimo: number;
  diasSinVenta: number;
  diferenciaPrecioCompetencia: number;
}

export interface Configuracion {
  porcentajes: {
    contabilidad: number;
    mercadeo: number;
    ventas: number;
    salarios: number;
    compras: number;
    extras: number;
  };
  costosFijos: {
    arriendo: number;
    energia: number;
    gas: number;
    aseo: number;
    internet: number;
    agua: number;
    servidores: number;
  };
  herramientas: {
    figma: number;
    chatgpt: number;
    correos: number;
    servidor: number;
    dominio: number;
  };
  ventasEstimadas: number;
}

export type Vista = 'dashboard' | 'productos' | 'ventas' | 'configuracion';
export type Categoria = 'alimentacion' | 'pañales' | 'ropa' | 'juguetes' | 'higiene' | 'accesorios' | 'mobiliario' | 'otros';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';
export type Rotacion = 'alta' | 'media' | 'baja';