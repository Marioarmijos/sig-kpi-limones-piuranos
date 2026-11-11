/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pantalla de Inicio de Sesión Corporativa con validación de PIN de 4 dígitos y enrutamiento por proceso
 * Limones Piuranos S.A.C. · ISO 9001:2015 & BASC
 */

import React, { useState, useMemo } from 'react';
import { UserAccount, ProcessDefinition } from '../types/sig';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  users: UserAccount[];
  processes: ProcessDefinition[];
  onLoginSuccess: (user: UserAccount, targetView: 'dashboard' | 'entry', targetProcessId?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, processes, onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('siglimonespiuranos@gmail.com');
  const [pin, setPin] = useState<string>('9001');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Match user based on current email input
  const detectedUser = useMemo(() => {
    return users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
  }, [users, email]);

  // Determine authorized processes names for detected user
  const userProcessNames = useMemo(() => {
    if (!detectedUser) return [];
    if (detectedUser.role === 'ADMIN') return ['Acceso Total (Todos los procesos del SIG)'];
    return detectedUser.processIds.map(pid => {
      const p = processes.find(proc => proc.id === pid);
      return p ? p.name : pid;
    });
  }, [detectedUser, processes]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const user = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      setErrorMsg('El correo ingresado no está registrado en la lista de usuarios autorizados.');
      return;
    }

    if (!user.active) {
      setErrorMsg('Esta cuenta ha sido suspendida por el Administrador General SIG.');
      return;
    }

    if (pin.trim() !== user.pin.trim()) {
      setErrorMsg('La clave de 4 dígitos ingresada es incorrecta.');
      return;
    }

    // Direct routing:
    // If ADMIN: directs to dashboard
    // If PROCESS USER: directs directly to entry (registro del proceso asignado)
    if (user.role === 'ADMIN') {
      onLoginSuccess(user, 'dashboard');
    } else {
      const targetProcId = user.processIds.length > 0 ? user.processIds[0] : undefined;
      onLoginSuccess(user, 'entry', targetProcId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Lockup */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-800 text-white font-extrabold text-2xl shadow-md mb-3">
          LP
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Limones Piuranos S.A.C.
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mt-1">
          Sistema de Monitoreo de Indicadores de Gestión · LP-SIG-FR-011 V.04
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Conforme a ISO 9001:2015 · BRCGs · Estándar de Seguridad BASC
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email input */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Correo Electrónico Autorizado (Gmail / Corporativo)
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono text-slate-900 font-medium"
                  placeholder="ejemplo@limonespiuranos.com"
                />
              </div>
            </div>

            {/* 4-Digit PIN input */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="login-pin" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Clave de Acceso (Solo 4 dígitos)
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Formato: 4 dígitos numéricos</span>
              </div>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="login-pin"
                  type="password"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => {
                    // Only allow numeric
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(val);
                    setErrorMsg(null);
                  }}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono tracking-widest text-slate-900 font-bold"
                  placeholder="••••"
                />
              </div>
            </div>

            {/* Detected Role & Assigned Process Card */}
            {detectedUser && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>{detectedUser.name}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      detectedUser.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : detectedUser.role === 'STRATEGIC_USER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {detectedUser.role === 'ADMIN'
                      ? 'Nivel 1: Administrador General'
                      : detectedUser.role === 'STRATEGIC_USER'
                      ? 'Nivel 2: Proceso Estratégico'
                      : 'Nivel 3: Proceso Operativo/Soporte'}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-200 space-y-1 text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">Proceso Asignado: </span>
                    <span>{userProcessNames.join(', ')}</span>
                    {detectedUser.operationalLineId && (
                      <span className="text-emerald-800 font-semibold block mt-0.5">
                        Línea Operativa: {detectedUser.operationalLineId.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {detectedUser.role === 'ADMIN'
                        ? 'Redirige al Tablero Ejecutivo de Gerencia'
                        : 'Redirige directamente al Módulo de Registro de su Proceso'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-colors cursor-pointer"
            >
              <span>Ingresar al Sistema SIG</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Secure Login Information */}
          <div className="pt-3 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500">
              ¿Olvidó su clave o requiere cambio de proceso? Comuníquese con la Administración de Gestión SIG (<span className="font-mono text-emerald-800 font-medium">siglimonespiuranos@gmail.com</span>).
            </p>
          </div>
        </div>

        {/* Security Trust Footnote */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Acceso restringido exclusivamente a cuentas registradas en el padrón oficial SIG.</span>
        </div>
      </div>
    </div>
  );
};
