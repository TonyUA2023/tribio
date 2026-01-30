import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/WebLayout';

export default function PrivacyPolicy() {
    return (
        <WebLayout showFooter={true}>
            <Head title="Política de Privacidad - Tribio" />

            <div className="min-h-screen bg-slate-50 pt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Política de Privacidad
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
                                En Tribio, nos comprometemos a proteger su privacidad y sus datos personales.
                                Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y
                                protegemos su información cuando utiliza nuestra plataforma de perfiles digitales
                                y tarjetas NFC.
                            </p>
                        </section>

                        {/* Información que Recopilamos */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                2. Información que Recopilamos
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>Recopilamos los siguientes tipos de información:</p>

                                <div className="ml-4 space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">2.1 Información proporcionada directamente:</h3>
                                        <ul className="list-disc list-inside space-y-1 mt-2">
                                            <li>Nombre del negocio o perfil profesional</li>
                                            <li>Dirección de correo electrónico</li>
                                            <li>Número de teléfono/WhatsApp</li>
                                            <li>Contraseña (almacenada de forma encriptada)</li>
                                            <li>Información de perfil (fotos, descripción, servicios, redes sociales)</li>
                                            <li>Información de pago (procesada por Culqi)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-slate-800">2.2 Información recopilada automáticamente:</h3>
                                        <ul className="list-disc list-inside space-y-1 mt-2">
                                            <li>Dirección IP</li>
                                            <li>Tipo de navegador y dispositivo</li>
                                            <li>Páginas visitadas y tiempo de permanencia</li>
                                            <li>Estadísticas de uso del perfil</li>
                                            <li>Cookies y tecnologías similares</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Uso de la Información */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                3. Uso de la Información
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>Utilizamos su información para:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Crear y gestionar su cuenta y perfil digital</li>
                                    <li>Procesar pagos y suscripciones</li>
                                    <li>Enviar notificaciones sobre su cuenta y servicios</li>
                                    <li>Coordinar la entrega de tarjetas NFC</li>
                                    <li>Proporcionar soporte técnico y atención al cliente</li>
                                    <li>Mejorar nuestros servicios y experiencia de usuario</li>
                                    <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
                                    <li>Cumplir con obligaciones legales</li>
                                    <li>Prevenir fraudes y garantizar la seguridad de la plataforma</li>
                                </ul>
                            </div>
                        </section>

                        {/* Compartir Información */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                4. Compartir Información
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    No vendemos su información personal. Podemos compartir su información únicamente en los siguientes casos:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Proveedores de servicios:</strong> Culqi (procesamiento de pagos), servicios de hosting y análisis.</li>
                                    <li><strong>Información pública del perfil:</strong> La información que usted publique en su perfil será visible públicamente.</li>
                                    <li><strong>Obligaciones legales:</strong> Cuando sea requerido por ley o autoridades competentes.</li>
                                    <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, privacidad, seguridad o propiedad.</li>
                                    <li><strong>Transferencia de negocio:</strong> En caso de fusión, adquisición o venta de activos.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Seguridad de los Datos */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                5. Seguridad de los Datos
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Encriptación SSL/TLS para todas las comunicaciones</li>
                                    <li>Almacenamiento seguro de contraseñas con hash bcrypt</li>
                                    <li>Acceso restringido a datos personales solo al personal autorizado</li>
                                    <li>Monitoreo continuo de seguridad</li>
                                    <li>Copias de seguridad regulares</li>
                                    <li>Procesamiento de pagos PCI-DSS compliant a través de Culqi</li>
                                </ul>
                            </div>
                        </section>

                        {/* Cookies */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                6. Cookies y Tecnologías Similares
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Utilizamos cookies para:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento de la plataforma y mantener su sesión activa.</li>
                                    <li><strong>Cookies de preferencias:</strong> Para recordar sus configuraciones y preferencias.</li>
                                    <li><strong>Cookies analíticas:</strong> Para entender cómo utiliza nuestra plataforma y mejorar el servicio.</li>
                                </ul>
                                <p>
                                    Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del servicio.
                                </p>
                            </div>
                        </section>

                        {/* Retención de Datos */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                7. Retención de Datos
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Conservamos su información personal mientras su cuenta esté activa o según sea necesario para:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Proporcionar nuestros servicios</li>
                                    <li>Cumplir con obligaciones legales (registros contables, fiscales)</li>
                                    <li>Resolver disputas</li>
                                    <li>Hacer cumplir nuestros acuerdos</li>
                                </ul>
                                <p>
                                    Tras la eliminación de su cuenta, sus datos se eliminarán o anonimizarán dentro de los 30 días,
                                    excepto cuando la ley requiera su conservación por períodos más largos.
                                </p>
                            </div>
                        </section>

                        {/* Derechos del Usuario */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                8. Sus Derechos
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    De acuerdo con la Ley N° 29733 (Ley de Protección de Datos Personales del Perú), usted tiene derecho a:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales.</li>
                                    <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos.</li>
                                    <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos.</li>
                                    <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos en ciertos casos.</li>
                                    <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado.</li>
                                </ul>
                                <p>
                                    Para ejercer estos derechos, contáctenos a través de soporte@tribio.info.
                                    Responderemos a su solicitud dentro de los 10 días hábiles establecidos por ley.
                                </p>
                            </div>
                        </section>

                        {/* Menores de Edad */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                9. Menores de Edad
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos
                                intencionalmente información de menores. Si descubrimos que hemos recopilado
                                información de un menor, la eliminaremos de inmediato.
                            </p>
                        </section>

                        {/* Transferencias Internacionales */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                10. Transferencias Internacionales
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Sus datos pueden ser procesados en servidores ubicados fuera del Perú.
                                En estos casos, garantizamos que los proveedores cumplan con estándares
                                adecuados de protección de datos equivalentes a los establecidos por la
                                legislación peruana.
                            </p>
                        </section>

                        {/* Cambios a la Política */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                11. Cambios a esta Política
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos
                                sobre cambios significativos a través de la plataforma o por correo electrónico.
                                Le recomendamos revisar esta política regularmente. La fecha de última actualización
                                se indica al inicio del documento.
                            </p>
                        </section>

                        {/* Contacto */}
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                12. Contacto
                            </h2>
                            <div className="text-slate-600 space-y-4">
                                <p>
                                    Si tiene preguntas sobre esta Política de Privacidad o sobre el tratamiento
                                    de sus datos personales, puede contactarnos:
                                </p>
                                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                    <p><strong>Tribio</strong></p>
                                    <p><strong>Email:</strong> soporte@tribio.info</p>
                                    <p><strong>WhatsApp:</strong> +51 999 999 999</p>
                                    <p><strong>Web:</strong> tribio.info</p>
                                </div>
                                <p className="text-sm">
                                    También puede presentar una reclamación ante la Autoridad Nacional de Protección
                                    de Datos Personales del Perú si considera que sus derechos han sido vulnerados.
                                </p>
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
