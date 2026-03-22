import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const EMPTY_FORM = {
  brand: '',
  model: '',
  material: 'Metal',
  color: '',
  price: '',
  arReady: false,
}

export default function Catalogo() {
  const { user } = useAuth()
  const [frames, setFrames] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  const [opticaId, setOpticaId] = useState(null)

  useEffect(() => {
    api('/opticas')
      .then((opticas) => {
        const myOptica = opticas.find((o) => o.user?.id === user?.id)
        if (myOptica) {
          setOpticaId(myOptica.id)
          return api(`/catalog/optica/${myOptica.id}`)
        }
        return []
      })
      .then(setFrames)
      .catch(() => setFrames([]))
      .finally(() => setLoading(false))
  }, [user])

  const openAddModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEditModal = (frame) => {
    setEditingId(frame.id)
    setForm({
      brand: frame.brand || '',
      model: frame.model || '',
      material: frame.material || 'Metal',
      color: frame.color || '',
      price: frame.price || '',
      arReady: frame.arReady || false,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    if (!form.brand || !form.model || !form.price) {
      toast.error('Completá todos los campos obligatorios.')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const updated = await api(`/catalog/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...form, price: Number(form.price) }),
        })
        setFrames((prev) => prev.map((f) => (f.id === editingId ? updated : f)))
        toast.success('Armazón actualizado.')
      } else {
        const created = await api('/catalog', {
          method: 'POST',
          body: JSON.stringify({ ...form, price: Number(form.price), opticaId }),
        })
        setFrames((prev) => [...prev, created])
        toast.success('Armazón agregado al catálogo.')
      }
      closeModal()
    } catch (err) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api(`/catalog/${id}`, { method: 'DELETE' })
      setFrames((prev) => prev.filter((f) => f.id !== id))
      toast.success('Armazón eliminado.')
    } catch (err) {
      toast.error(err.message || 'Error al eliminar')
    }
    setDeleteConfirm(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mi catálogo de armazones</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{frames.length} armazones cargados</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4" /> Agregar armazón
        </Button>
      </div>

      {frames.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No tenés armazones en tu catálogo aún.</p>
          <Button className="mt-4" onClick={openAddModal}>
            <Plus className="w-4 h-4" /> Agregar primer armazón
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {frames.map((frame) => (
            <Card key={frame.id} className="overflow-hidden">
              <div className="w-full h-36 bg-slate-200 dark:bg-slate-700 flex items-end p-3">
                {frame.arReady && <Badge variant="success" className="shadow-sm">AR Ready</Badge>}
              </div>
              <div className="p-4">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{frame.brand}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{frame.model}</p>
                {frame.material && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      {frame.material}
                    </span>
                    {frame.color && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                        {frame.color}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-2">
                  ${Number(frame.price || 0).toLocaleString('es-AR')}
                </p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => openEditModal(frame)}>
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Button>
                  <Button size="sm" variant="danger" className="flex-1" onClick={() => setDeleteConfirm(frame.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingId ? 'Editar armazón' : 'Agregar armazón'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Marca <span className="text-red-500">*</span></label>
                <input type="text" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} placeholder="Ej: Ray-Ban" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Modelo <span className="text-red-500">*</span></label>
                <input type="text" value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} placeholder="Ej: RB5154 Clubmaster" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Material</label>
                <select value={form.material} onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  {['Metal', 'Acetato', 'Titanio', 'Sin aro'].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Color</label>
                <input type="text" value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} placeholder="Ej: Negro mate" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Precio <span className="text-red-500">*</span></label>
                <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="0" className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
              </div>

              {/* AR Ready toggle */}
              <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, arReady: !p.arReady }))}
                  className={`relative mt-0.5 flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.arReady ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.arReady ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Asset 3D disponible</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Este armazón tiene asset 3D para prueba virtual</p>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar armazón'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <Card className="w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">¿Eliminar armazón?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteConfirm)}>Eliminar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
