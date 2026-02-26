/**
 * Customer Settings Page - Nike Style
 */

import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
  FiChevronLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiLock,
  FiLogOut,
} from 'react-icons/fi';
import type { StoreConfig } from './types';

interface Address {
  id: string;
  label: string;
  address: string;
  district: string;
  city: string;
  is_default: boolean;
}

interface CustomerSettingsProps {
  data: {
    config: StoreConfig;
    account_slug: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
    customer: {
      id: number;
      name: string;
      phone: string;
      addresses: Address[];
    } | null;
  };
}

export default function CustomerSettings() {
  const pageProps = usePage<{ data: CustomerSettingsProps['data'] }>().props;
  const { config, account_slug, user, customer } = pageProps.data;

  const primaryColor = config.colors?.primary || '#000000';

  const { data, setData, post, processing, errors } = useForm({
    name: customer?.name || user.name,
    phone: customer?.phone || '',
    addresses: customer?.addresses || [],
  });

  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    label: '',
    address: '',
    district: '',
    city: '',
    is_default: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/${account_slug}/cuenta/configuracion`);
  };

  const handleAddAddress = () => {
    const id = Date.now().toString();
    const updatedAddresses = [
      ...data.addresses,
      { ...newAddress, id },
    ];

    // If this is the first address or marked as default, update defaults
    if (newAddress.is_default || updatedAddresses.length === 1) {
      updatedAddresses.forEach((addr, i) => {
        addr.is_default = addr.id === id;
      });
    }

    setData('addresses', updatedAddresses);
    setNewAddress({ label: '', address: '', district: '', city: '', is_default: false });
    setShowNewAddress(false);
  };

  const handleRemoveAddress = (id: string) => {
    const updatedAddresses = data.addresses.filter((a) => a.id !== id);

    // If removed address was default and there are other addresses, make first one default
    const removedWasDefault = data.addresses.find((a) => a.id === id)?.is_default;
    if (removedWasDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].is_default = true;
    }

    setData('addresses', updatedAddresses);
  };

  const handleSetDefault = (id: string) => {
    const updatedAddresses = data.addresses.map((a) => ({
      ...a,
      is_default: a.id === id,
    }));
    setData('addresses', updatedAddresses);
  };

  return (
    <>
      <Head title={`Configuracion | ${config.name}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href={`/${account_slug}/cuenta`}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Mi cuenta</span>
            </Link>

            <h1 className="text-lg font-bold text-black">Configuracion</h1>

            <div className="w-20" />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <section className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Informacion Personal
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black
                             focus:outline-none focus:border-black transition-colors"
                    placeholder="Tu nombre"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg text-gray-500
                               bg-gray-50 cursor-not-allowed"
                    />
                    <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    El email no se puede cambiar
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black
                             focus:outline-none focus:border-black transition-colors"
                    placeholder="999 999 999"
                  />
                </div>
              </div>
            </section>

            {/* Addresses */}
            <section className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <FiMapPin className="w-5 h-5" />
                Direcciones de Envio
              </h2>

              {data.addresses.length === 0 && !showNewAddress ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <FiMapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No tienes direcciones guardadas</p>
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium
                             border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Agregar direccion
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 border-2 rounded-xl ${addr.is_default ? 'border-black' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-black">{addr.label}</p>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 bg-black text-white text-xs font-medium rounded">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{addr.address}</p>
                          <p className="text-gray-500 text-sm">{addr.district}, {addr.city}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!addr.is_default && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(addr.id)}
                              className="p-2 text-gray-400 hover:text-black transition-colors"
                              title="Establecer como principal"
                            >
                              <FiCheck className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAddress(addr.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!showNewAddress && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(true)}
                      className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed
                               border-gray-200 rounded-xl text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                      Agregar nueva direccion
                    </button>
                  )}
                </div>
              )}

              {/* New Address Form */}
              {showNewAddress && (
                <div className="mt-4 p-6 bg-gray-50 rounded-xl space-y-4">
                  <h4 className="font-bold text-black">Nueva direccion</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiqueta (ej: Casa, Oficina)
                    </label>
                    <input
                      type="text"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="Mi casa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Direccion completa
                    </label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      placeholder="Av. Principal 123, Dpto 456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distrito
                      </label>
                      <input
                        type="text"
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        placeholder="Miraflores"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        placeholder="Lima"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddress.is_default}
                      onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                    />
                    <span className="text-sm text-gray-600">Establecer como direccion principal</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(false)}
                      className="flex-1 py-3 rounded-full font-medium border-2 border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAddress}
                      disabled={!newAddress.label || !newAddress.address}
                      className="flex-1 py-3 rounded-full font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Save Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 rounded-full font-bold text-white transition-all
                       hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </form>

          {/* Logout */}
          <div className="mt-8 text-center">
            <Link
              href={`/${account_slug}/cuenta/logout`}
              method="post"
              as="button"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              Cerrar sesion
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
