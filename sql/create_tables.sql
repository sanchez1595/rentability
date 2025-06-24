-- Tabla para productos
CREATE TABLE productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  costo_compra DECIMAL NOT NULL,
  gastos_fijos DECIMAL DEFAULT 0,
  margen_deseado DECIMAL NOT NULL,
  precio_venta DECIMAL NOT NULL,
  utilidad DECIMAL NOT NULL,
  costo_fijo_por_producto DECIMAL DEFAULT 0,
  costo_con_porcentajes DECIMAL DEFAULT 0,
  fecha_agregado DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para configuración
CREATE TABLE configuracion (
  id INTEGER PRIMARY KEY DEFAULT 1,
  porcentajes JSONB NOT NULL DEFAULT '{}',
  costos_fijos JSONB NOT NULL DEFAULT '{}',
  herramientas JSONB NOT NULL DEFAULT '{}',
  ventas_estimadas INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_config CHECK (id = 1)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_created_at ON productos(created_at);

-- Configuración inicial por defecto
INSERT INTO configuracion (id, porcentajes, costos_fijos, herramientas, ventas_estimadas) 
VALUES (
  1,
  '{"contabilidad": 2, "mercadeo": 5, "ventas": 15, "salarios": 10, "compras": 2, "extras": 5}',
  '{"arriendo": 1000000, "energia": 200000, "gas": 50000, "aseo": 800000, "internet": 200000, "agua": 200000, "servidores": 110000}',
  '{"figma": 51600, "chatgpt": 86000, "correos": 51600, "servidor": 100000, "dominio": 120000}',
  100
) ON CONFLICT (id) DO NOTHING;