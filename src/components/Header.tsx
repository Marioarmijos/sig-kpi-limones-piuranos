/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Header empresarial con estricto Top Bar Contract y barra de contexto de roles
 */

import React from 'react';
import { UserAccount } from '../types/sig';
import { FileDown, ShieldCheck, UserCheck, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
  currentView: 'dashboard' | 'entry' | 'matrix' | 'completeness' | 'audit' | 'users' | 'storage';
  onViewChange: (view: 'dashboard' | 'entry' | 'matrix' | 'completeness' | 'audit' | 'users' | 'storage') => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSwitchUser: (user: UserAccount) => void;
  onExportPDF: () => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  currentUser,
  allUsers,
  onSwitchUser,
  onExportPDF,
  onResetData,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Strict Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            LP
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Limones Piuranos SIG
          </span>
        </div>

        {/* Zone 2: 4–5 single-line clean nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentView === 'dashboard'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                : 'hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('entry')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentView === 'entry'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                : 'hover:text-slate-900'
            }`}
          >
            Registro
          </button>
          <button
            onClick={() => onViewChange('matrix')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentView === 'matrix'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                : 'hover:text-slate-900'
            }`}
          >
            Matriz
          </button>
          <button
            onClick={() => onViewChange('completeness')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentView === 'completeness'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                : 'hover:text-slate-900'
            }`}
          >
            Cierre
          </button>
          <button
            onClick={() => onViewChange('audit')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentView === 'audit'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                : 'hover:text-slate-900'
            }`}
          >
            Auditoría
          </button>
          {currentUser.role === 'ADMIN' && (
            <>
              <button
                onClick={() => onViewChange('storage')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                  currentView === 'storage'
                    ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                    : 'hover:text-slate-900'
                }`}
              >
                Archivos & Espacio
              </button>
              <button
                onClick={() => onViewChange('users')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                  currentView === 'users'
                    ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                    : 'hover:text-slate-900'
                }`}
              >
                Usuarios
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action and logout */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
            title="Generar y descargar informe ejecutivo oficial en PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Cerrar sesión actual"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* Role Context & Demo Switcher Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sesión activa:</span>
            </span>
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-500">{currentUser.email}</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-700 font-medium">
              {currentUser.role === 'ADMIN'
                ? 'Administrador General SIG'
                : currentUser.operationalLineId
                ? `Línea ${currentUser.operationalLineId.replace('_', ' ')}`
                : 'Usuario de Proceso'}
            </span>
          </div>

          {currentUser.role === 'ADMIN' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Simular rol:</span>
              </span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const selected = allUsers.find(u => u.id === e.target.value);
                  if (selected) onSwitchUser(selected);
                }}
                className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
              <button
                onClick={onResetData}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Restablecer datos originales del PDF 2026"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
