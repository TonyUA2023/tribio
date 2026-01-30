import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/WebLayout';

export default function TermsAndConditions() {
    return (
        <WebLayout showFooter={true}>
            <Head title="Términos y Condiciones - Tribio" />

            <div className="min-h-screen bg-slate-50 pt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Términos y Condiciones
                        </h1>
                        <p className="mt-4 text-slate-600">
                            Última actualización: Enero 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
                        {/* Introducción */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                1. Introducción
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Bienvenido a Tribio. Estos Términos y Condiciones rigen el uso de nuestra plataforma
                                de perfiles digitales y tarjetas NFC. Al acceder o utilizar nuestros servicios,
                                usted acepta estar sujeto a estos términos. Si no está de acuerdo con alguna parte
                                de estos términos, no podrá acceder al servicio.
                            </p>
                        </section>

                        {/* Definiciones */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                2. Definiciones
                            </h2>
                            <ul className="list-disc list-inside text-slate-600 space-y-2">
                                <li><strong>"Tribio"</strong> se refiere a la plataforma, aplicación web y servicios relacionados.</li>
                                <li><strong>"Usuario"</strong> se refiere a cualquier persona que acceda o utilice nuestros servicios.</li>
                                <li><strong>"Cuenta"</strong> se refiere al perfil digital creado por el usuario en nuestra plataforma.</li>
                                <li><strong>"Tarjeta NFC"</strong> se refiere a las tarjetas físicas con tecnología NFC que comercializamos.</li>
                                <li><strong>"Suscripción"</strong> se refiere a los planes de pago disponibles en la plataforma.</li>
                            </ul>
                        </section>

                        {/* Uso del Servicio */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                3. Uso del Servicio
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Al utilizar Tribio, usted se compromete a:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Proporcionar información veraz y actualizada durante el registro.</li>
                                    <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
                                    <li>No utilizar la plataforma para fines ilegales o no autorizados.</li>
                                    <li>No interferir con el funcionamiento normal de la plataforma.</li>
                                    <li>Respetar los derechos de propiedad intelectual de terceros.</li>
                                    <li>No publicar contenido ofensivo, difamatorio o que viole derechos de terceros.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Registro y Cuenta */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                4. Registro y Cuenta
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Para utilizar ciertos servicios de Tribio, debe crear una cuenta proporcionando:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Nombre del negocio o perfil profesional.</li>
                                    <li>Dirección de correo electrónico válida (@tribio.info será asignado).</li>
                                    <li>Número de teléfono/WhatsApp para comunicaciones.</li>
                                    <li>Contraseña segura de al menos 6 caracteres.</li>
                                </ul>
                                <p>
                                    Usted es responsable de todas las actividades que ocurran bajo su cuenta y de
                                    mantener la seguridad de su contraseña.
                                </p>
                            </div>
                        </section>

                        {/* Planes y Pagos */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                5. Planes y Pagos
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Tribio ofrece diferentes planes de suscripción:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Plan Personal (Gratuito):</strong> Funcionalidades básicas para perfiles personales.</li>
                                    <li><strong>Plan Pro:</strong> Funcionalidades avanzadas para negocios, con facturación mensual o anual.</li>
                                    <li><strong>Plan Corporativo:</strong> Soluciones personalizadas para empresas y equipos.</li>
                                </ul>
                                <p>
                                    Los pagos se procesan a través de Culqi, nuestra pasarela de pagos autorizada.
                                    Aceptamos tarjetas de crédito/débito (Visa, Mastercard) y Yape.
                                </p>
                                <p>
                                    Las suscripciones se renuevan automáticamente al finalizar el período contratado,
                                    salvo que el usuario cancele antes de la fecha de renovación.
                                </p>
                            </div>
                        </section>

                        {/* Tarjetas NFC */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                6. Tarjetas NFC
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Las tarjetas NFC son productos físicos opcionales que se envían al domicilio indicado:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>El diseño personalizado se coordina vía WhatsApp después de la compra.</li>
                                    <li>El tiempo de entrega estimado es de 5-10 días hábiles en Lima y 10-15 días en provincias.</li>
                                    <li>La tarjeta NFC es un pago único, no una suscripción.</li>
                                    <li>Se ofrece garantía de 30 días por defectos de fabricación.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Política de Reembolsos */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                7. Política de Reembolsos
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Ofrecemos una garantía de satisfacción de 7 días:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Si no está satisfecho con el servicio, puede solicitar un reembolso completo dentro de los primeros 7 días.</li>
                                    <li>Para tarjetas NFC, el reembolso solo aplica si la tarjeta presenta defectos de fabricación.</li>
                                    <li>Las solicitudes de reembolso deben enviarse a soporte@tribio.info.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Propiedad Intelectual */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                8. Propiedad Intelectual
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Todo el contenido de la plataforma Tribio, incluyendo pero no limitado a: diseños,
                                    logotipos, textos, gráficos, interfaces y código fuente, es propiedad exclusiva de
                                    Tribio o sus licenciantes.
                                </p>
                                <p>
                                    El usuario conserva los derechos sobre el contenido que publique en su perfil,
                                    otorgando a Tribio una licencia no exclusiva para mostrar dicho contenido en la plataforma.
                                </p>
                            </div>
                        </section>

                        {/* Limitación de Responsabilidad */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                9. Limitación de Responsabilidad
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Tribio no será responsable por:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Daños indirectos, incidentales o consecuentes derivados del uso del servicio.</li>
                                    <li>Interrupciones temporales del servicio por mantenimiento o causas de fuerza mayor.</li>
                                    <li>Contenido publicado por los usuarios en sus perfiles.</li>
                                    <li>Pérdida de datos por causas ajenas a nuestro control.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Modificaciones */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                10. Modificaciones
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                                Los cambios significativos serán notificados a través de la plataforma o por correo electrónico.
                                El uso continuado del servicio después de las modificaciones constituye la aceptación de los nuevos términos.
                            </p>
                        </section>

                        {/* Terminación */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                11. Terminación
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Tribio puede suspender o terminar su cuenta si:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Viola estos términos y condiciones.</li>
                                    <li>Utiliza la plataforma para actividades ilegales.</li>
                                    <li>Publica contenido que infringe derechos de terceros.</li>
                                    <li>No realiza el pago de su suscripción.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Ley Aplicable */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                12. Ley Aplicable
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Estos términos se rigen por las leyes de la República del Perú.
                                Cualquier disputa será resuelta en los tribunales competentes de Lima, Perú.
                            </p>
                        </section>

                        {/* Contacto */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                13. Contacto
                            </h2>
                            <div className="text-slate-600 space-y-2">
                                <p>
                                    Para consultas sobre estos términos, puede contactarnos:
                                </p>
                                <ul className="list-none space-y-1 ml-4">
                                    <li><strong>Email:</strong> soporte@tribio.info</li>
                                    <li><strong>WhatsApp:</strong> +51 999 999 999</li>
                                    <li><strong>Web:</strong> tribio.info</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* Back link */}
                    <div className="mt-8 text-center">
                        <a
                            href="/registro"
                            className="text-sky-600 hover:text-sky-700 font-medium text-sm"
                        >
                            &larr; Volver al registro
                        </a>
                    </div>
                </div>
            </div>
        </WebLayout>
    );
}
