/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Administración de Usuarios, Permisos y Límite por Línea Operativa (ISO 9001 / BASC)
 * Limones Piuranos S.A.C.
 */

import React, { useState, useMemo } from 'react';
import { UserAccount, ProcessDefinition, OperationalLineDefinition, OperationalLineId } from '../types/sig';
import { UserPlus, Shield, Check, X, AlertTriangle, Users, KeyRound, Search } from 'lucide-react';

interface UserManagementViewProps {
  users: UserAccount[];
  processes: ProcessDefinition[];
  lines: OperationalLineDefinition[];
  currentUser: UserAccount;
  onUpdateUser: (payload: {
    userId: string;
    processIds: string[];
    operationalLineId?: OperationalLineId;
    active: boolean;
  }) => Promise<void>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  processes,
  lines,
  currentUser,
  onUpdateUser
}) => {
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedLine, setSelectedLine] = useState<OperationalLineId | 'GENERAL'>('GENERAL');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.pin && u.pin.includes(q))
    );
  }, [users, userSearch]);

  const handleStartEdit = (user: UserAccount) => {
    setEditingUser(user);
    setSelectedProcesses([...user.processIds]);
    setSelectedLine(user.operationalLineId || 'GENERAL');
    setIsActive(user.active);
    setErrorMessage(null);
  };

  const toggleProcess = (procId: string) => {
    setSelectedProcesses(prev =>
      prev.includes(procId) ? prev.filter(id => id !== procId) : [...prev, procId]
    );
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await onUpdateUser({
        userId: editingUser.id,
        processIds: selectedProcesses,
        operationalLineId: selectedLine === 'GENERAL' ? undefined : selectedLine,
        active: isActive
      });
      setEditingUser(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate line occupancy (max 3 users per operational line)
  const lineOccupancy = lines.map(line => {
    const count = users.filter(u => u.operationalLineId === line.id && u.active).length;
    return {
      ...line,
      currentCount: count
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Control de Accesos y Seguridad BASC
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Padrón Oficial de Usuarios Autorizados y Claves PIN
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualización confidencial exclusiva para el Administrador SIG (<span className="font-mono text-emerald-800 font-bold">siglimonespiuranos@gmail.com</span>). Mapeo completo según Mapa de Procesos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-mono">
            Admin Principal: siglimonespiuranos@gmail.com
          </div>
        </div>
      </div>

      {/* Operational Lines Capacity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lineOccupancy.map(line => (
          <div key={line.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-slate-800">{line.name}</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mb-3">{line.description}</p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-600">Usuarios Activos:</span>
              <span className="font-mono font-bold text-slate-900">
                {line.currentCount} / {line.maxUsers} max
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${
                  line.currentCount >= line.maxUsers ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${(line.currentCount / line.maxUsers) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cuentas Autorizadas ({filteredUsers.length} de {users.length})
            </h3>
            <span className="text-xs text-slate-500">
              Claves PIN confidenciales de 4 dígitos para cada proceso del Mapa de Procesos.
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o PIN..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nombre / Responsable</th>
                <th className="py-3 px-4">Correo Autorizado</th>
                <th className="py-3 px-4 w-24 text-center">Clave PIN</th>
                <th className="py-3 px-4 w-32">Nivel de Acceso</th>
                <th className="py-3 px-4 w-36">Línea Asignada</th>
                <th className="py-3 px-4">Procesos Autorizados</th>
                <th className="py-3 px-4 w-20 text-center">Estado</th>
                <th className="py-3 px-4 w-20 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {u.email}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {u.pin || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {u.role === 'ADMIN' ? 'Nivel 1 (Admin)' : u.role === 'STRATEGIC_USER' ? 'Nivel 2 (Estratégico)' : 'Nivel 3 (Operativo/Soporte)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {u.operationalLineId ? u.operationalLineId.replace('_', ' ') : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {u.role === 'ADMIN' ? (
                      <span className="text-emerald-700 font-semibold">Todos los procesos (Acceso Total)</span>
                    ) : (
                      u.processIds.map(pid => {
                        const proc = processes.find(p => p.id === pid);
                        return proc?.name;
                      }).filter(Boolean).join(', ')
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.active ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleStartEdit(u)}
                      className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs text-slate-500">{editingUser.email}</span>
                <h3 className="text-base font-bold text-slate-900">{editingUser.name}</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Operational Line */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Línea Operativa (máximo 3 usuarios activos):</label>
                <select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="GENERAL">Sin Línea Operativa Específica (General)</option>
                  <option value="JUGOS_TROPICALES">Línea Jugos Tropicales</option>
                  <option value="CITRICOS">Línea Cítricos (Limón)</option>
                  <option value="FRUTA_FRESCA">Línea Fruta Fresca</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="user-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="user-active" className="font-semibold text-slate-700 cursor-pointer">
                  Cuenta activa y autorizada para ingresar al sistema
                </label>
              </div>

              {/* Process Checklist */}
              {editingUser.role !== 'ADMIN' && (
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block">
                    Procesos Asignados a este usuario:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                    {processes.map(p => (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProcesses.includes(p.id)}
                          onChange={() => toggleProcess(p.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Guardar Asignación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
