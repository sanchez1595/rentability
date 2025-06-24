import { supabase } from './supabase'

// Funciones para productos
export const guardarProducto = async (producto) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error guardando producto:', error)
    throw error
  }
}

export const obtenerProductos = async () => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    return []
  }
}

export const actualizarProducto = async (id, producto) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update(producto)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error actualizando producto:', error)
    throw error
  }
}

export const eliminarProducto = async (id) => {
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error eliminando producto:', error)
    throw error
  }
}

// Funciones para configuración
export const guardarConfiguracion = async (configuracion) => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .upsert([{ id: 1, ...configuracion }])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error guardando configuración:', error)
    throw error
  }
}

export const obtenerConfiguracion = async () => {
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    console.error('Error obteniendo configuración:', error)
    return null
  }
}