import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // --- ESTADOS ---
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    id: null,
    nombre: '',
    precio: '',
    stock: ''
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // --- FUNCIONES ---

  // 1. GET: Obtener productos
  const fetchProductos = async (useCache = false) => {
    setLoading(true);
    setError(null);
    if (useCache) {
      const cachedData = loadFromCache();
      if (cachedData.length > 0) {
        setProductos(cachedData);
      }
    }

    try {
      const response = await fetch(`${API_URL}/productos`);
      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();
      setProductos(data);
      saveToCache(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      if (productos.length === 0) {
        setError("No se pudo conectar con el servidor. Verifica tu conexión.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos(true);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 2. POST / PUT: Guardar o Actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = form.id ? 'PUT' : 'POST';
    const endpoint = form.id ? `${API_URL}/productos/${form.id}` : `${API_URL}/productos`;

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          precio: parseFloat(form.precio),
          stock: parseInt(form.stock)
        })
      });

      if (response.ok) {
        alert(form.id ? "Producto actualizado" : "Producto creado");
        setForm({ id: null, nombre: '', precio: '', stock: '' });
        fetchProductos();
      } else {
        alert("Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 3. DELETE: Eliminar
  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProductos();
      }
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  const handleEdit = (producto) => {
    setForm({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock
    });
  };


  // --- RETO 4: CACHEO LIGERO ---
  const saveToCache = (data) => {
    localStorage.setItem('productos_cache', JSON.stringify(data));
  };

  const loadFromCache = () => {
    const cached = localStorage.getItem('productos_cache');
    return cached ? JSON.parse(cached) : [];
  };

  // --- VISTA (HTML) ---
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Gestión de Inventario (Lab 15)</h1>

      {error && <div className="error-msg">{error}</div>}

      {/* Formulario */}
      <div style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>{form.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            name="nombre"
            placeholder="Nombre del producto"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            required
            step="0.01"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
          <button type="submit" style={{ background: form.id ? 'orange' : 'blue', color: 'white', border: 'none', padding: '0.5rem 1rem' }}>
            {form.id ? 'Actualizar' : 'Guardar'}
          </button>

          {form.id && (
            <button type="button" onClick={() => setForm({ id: null, nombre: '', precio: '', stock: '' })}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Listado */}
      {loading && <div className="loader"></div>}

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr><td colSpan="5">No hay productos registrados.</td></tr>
          ) : (
            productos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>S/. {p.precio}</td>
                <td>{p.stock}</td>
                <td>
                  <button onClick={() => handleEdit(p)} style={{ marginRight: '5px' }}>✏️ Editar</button>
                  <button onClick={() => handleDelete(p.id)} style={{ color: 'red' }}>🗑️ Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App