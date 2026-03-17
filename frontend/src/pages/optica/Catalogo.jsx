import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const INITIAL_FRAMES = [
  {
    id: 'f1',
    brand: 'Ray-Ban',
    model: 'RB5154 Clubmaster',
    material: 'Acetato',
    color: 'Carey / Dorado',
    priceMin: 12000,
    priceMax: 18000,
    styles: ['Clásico'],
    arReady: true,
    bgColor: 'bg-amber-800',
  },
  {
    id: 'f2',
    brand: 'Silhouette',
    model: '5500 Rimless',
    material: 'Titanio',
    color: 'Plata',
    priceMin: 22000,
    priceMax: 30000,
    styles: ['Sin aro'],
    arReady: true,
    bgColor: 'bg-slate-400',
  },
  {
    id: 'f3',
    brand: 'Oakley',
    model: 'OX8046 Pitchman',
    material: 'Metal',
    color: 'Negro mate',
    priceMin: 9000,
    priceMax: 14000,
    styles: ['Deportivo'],
    arReady: false,
    bgColor: 'bg-gray-800',
  },
  {
    id: 'f4',
    brand: 'Lindberg',
    model: 'Air Titanium 4481',
    material: 'Titanio',
    color: 'Oro mate',
    priceMin: 35000,
    priceMax: 45000,
    styles: ['Clásico', 'Oversize'],
    arReady: true,
    bgColor: 'bg-yellow-600',
  },
]

const MATERIALS = ['Metal', 'Acetato', 'Titanio', 'Sin aro']
const STYLE_OPTIONS = ['Deportivo', 'Clásico', 'Sin aro', 'Oversize']
const BG_COLORS = [
  'bg-slate-400',
  'bg-gray-800',
  'bg-amber-800',
  'bg-yellow-600',
  'bg-blue-700',
  'bg-emerald-700',
  'bg-rose-700',
]

const EMPTY_FORM = {
  brand: '',
  model: '',
  material: 'Metal',
  color: '',
  priceMin: '',
  priceMax: '',
  styles: [],
  arReady: false,
  bgColor: 'bg-slate-400',
}

export default function Catalogo() {
  const [frames, setFrames] = useState(INITIAL_FRAMES)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const openAddModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEditModal = (frame) => {
    setEditingId(frame.id)
    setForm({
      brand: frame.brand,
      model: frame.model,
      material: frame.material,
      color: frame.color,
      priceMin: frame.priceMin,
      priceMax: frame.priceMax,
      styles: [...frame.styles],
      arReady: frame.arReady,
      bgColor: frame.bgColor,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const toggleStyle = (style) => {
    setForm((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }))
  }

  const handleSave = () => {
    if (!form.brand || !form.model || !form.color || !form.priceMin || !form.priceMax) {
      toast.error('Completá todos los campos obligatorios.')
      return
    }
    if (editingId) {
      setFrames((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? { ...f, ...form, priceMin: Number(form.priceMin), priceMax: Number(form.priceMax) }
            : f
        )
      )
      toast.success('Armazón actualizado.')
    } else {
      const newFrame = {
        ...form,
        id: `f${Date.now()}`,
        priceMin: Number(form.priceMin),
        priceMax: Number(form.priceMax),
      }
      setFrames((prev) => [...prev, newFrame])
      toast.success('Armazón agregado al catálogo.')
    }
    closeModal()
  }

  const handleDelete = (id) => {
    setFrames((prev) => prev.filter((f) => f.id !== id))
    toast.success('Armazón eliminado.')
    setDeleteConfirm(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mi catálogo de armazones</h1>
          <p className="text-sm text-slate-500 mt-0.5">{frames.length} armazones cargados</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4" /> Agregar armazón
        </Button>
      </div>

      {/* Frame grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {frames.map((frame) => (
          <Card key={frame.id} className="overflow-hidden">
            {/* Color image placeholder */}
            <div className={`w-full h-36 ${frame.bgColor} flex items-end p-3`}>
              {frame.arReady && (
                <Badge variant="success" className="shadow-sm">
                  AR Ready
                </Badge>
              )}
            </div>

            <div className="p-4">
              <p className="font-bold text-slate-800 text-sm">{frame.brand}</p>
              <p className="text-sm text-slate-600 leading-snug">{frame.model}</p>

              <div className="flex flex-wrap gap-1 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                  {frame.material}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                  {frame.color}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-1.5">
                {frame.styles.map((s) => (
                  <Badge key={s} variant="purple">
                    {s}
                  </Badge>
                ))}
              </div>

              <p className="text-sm font-semibold text-slate-800 mt-2">
                ${frame.priceMin.toLocaleString('es-AR')} – ${frame.priceMax.toLocaleString('es-AR')}
              </p>

              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => openEditModal(frame)}
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className="flex-1"
                  onClick={() => setDeleteConfirm(frame.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Editar armazón' : 'Agregar armazón'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Image upload placeholder */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Imagen del armazón
                </label>
                <div className="w-full h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 transition-colors">
                  <Upload className="w-6 h-6 text-slate-300" />
                  <span className="text-xs text-slate-400">Clic para subir imagen</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Color de preview:</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {BG_COLORS.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setForm((p) => ({ ...p, bgColor: bg }))}
                      className={`w-7 h-7 rounded-lg ${bg} border-2 transition-all ${
                        form.bgColor === bg ? 'border-primary scale-110' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Marca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="Ej: Ray-Ban"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                  placeholder="Ej: RB5154 Clubmaster"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Material */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Material
                </label>
                <select
                  value={form.material}
                  onChange={(e) => setForm((p) => ({ ...p, material: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Color <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  placeholder="Ej: Negro mate"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Price range */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Rango de precio <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={form.priceMin}
                    onChange={(e) => setForm((p) => ({ ...p, priceMin: e.target.value }))}
                    placeholder="Mín"
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-slate-400 text-sm">–</span>
                  <input
                    type="number"
                    value={form.priceMax}
                    onChange={(e) => setForm((p) => ({ ...p, priceMax: e.target.value }))}
                    placeholder="Máx"
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Style tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Estilos
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((style) => (
                    <label
                      key={style}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={form.styles.includes(style)}
                        onChange={() => toggleStyle(style)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AR Ready toggle */}
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, arReady: !p.arReady }))}
                  className={`relative mt-0.5 flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    form.arReady ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      form.arReady ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Asset 3D disponible</p>
                  <p className="text-xs text-slate-500">
                    Este armazón tiene asset 3D para prueba virtual
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleSave}>
                  {editingId ? 'Guardar cambios' : 'Agregar armazón'}
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
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">¿Eliminar armazón?</h3>
            <p className="text-sm text-slate-500 mb-5">
              Esta acción no se puede deshacer. El armazón será removido del catálogo.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteConfirm)}>
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
