import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Pill,
  Search,
  Building,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  Plus,
  Send,
  Package,
} from 'lucide-react';

export function MedicineStockModal() {
  const {
    isMedicineModalOpen,
    setIsMedicineModalOpen,
    medicineStock,
    requestMedicineRestock,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [indentNotice, setIndentNotice] = useState<string | null>(null);

  if (!isMedicineModalOpen) return null;

  const categories = ['All', 'Cardiovascular', 'Maternal/Iron', 'Antidiabetic', 'Antibiotics', 'Emergency'];

  const filteredStock = medicineStock.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRestock = (id: string, name: string) => {
    requestMedicineRestock(id, 'subCentre');
    setIndentNotice(`Electronic Re-Indent issued for ${name}. +250 units dispatched to Sub-Centre.`);
    setTimeout(() => setIndentNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900">
                Essential Drugs List (EDL) &amp; Diagnostic Stock
              </h2>
              <p className="text-xs text-stone-600">
                Real-time visibility across Sub-Centres, PHCs, and District Medical Stores
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMedicineModalOpen(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {indentNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs text-emerald-900 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{indentNotice}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search generic name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1 p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                <th className="pb-3 px-3">Medicine / Formulation</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3 text-center">Sub-Centre Stock</th>
                <th className="pb-3 px-3 text-center">PHC Stock</th>
                <th className="pb-3 px-3 text-center">District Hub</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStock.map((med) => (
                <tr key={med.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-stone-900">{med.name}</div>
                    <div className="text-[11px] text-stone-500">{med.genericName} &bull; {med.form}</div>
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    <span className="px-2 py-0.5 rounded bg-stone-100 font-medium text-[11px]">
                      {med.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-stone-800">
                    {med.subCentreStock} {med.unit}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-stone-700">
                    {med.phcStock} {med.unit}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-stone-700">
                    {med.districtHospitalStock} {med.unit}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        med.status === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-800'
                          : med.status === 'Low Stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {med.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleRestock(med.id, med.name)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-blue-50 hover:text-blue-700 text-stone-700 font-semibold text-[11px] transition-colors cursor-pointer border border-stone-200"
                    >
                      Re-Indent +250
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
