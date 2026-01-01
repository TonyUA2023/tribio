import { Head, usePage } from '@inertiajs/react';

// Definimos los 'props' que esperamos de Laravel
interface Link {
    title: string;
    url: string;
}
interface ProfileData {
    bio?: string;
    links?: Link[];
}
interface Profile {
    id: number;
    name: string;
    title: string;
    data: ProfileData;
}
interface PageProps {
    profile: Profile;
    [key: string]: any; // <--- AÑADE ESTA LÍNEA
}

// Este es tu componente de plantilla SaaS
export default function Standard() {
    // Obtenemos los 'props' que el controlador envió
    const { profile } = usePage<PageProps>().props;

    return (
        <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
            <Head title={profile.name} />

            <h1 style={{ fontSize: '1.5rem' }}>Plantilla React SaaS Estándar</h1>
            
            <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{profile.name}</h2>
            <p style={{ fontSize: '1.2rem', margin: 0 }}>{profile.title}</p>

            <hr style={{ margin: '20px 0' }} />
            
            <h3>Datos (desde JSON):</h3>
            <p>{profile.data.bio || 'Sin biografía'}</p>

            <h3>Enlaces:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {profile.data.links?.map((link, index) => (
                    <li key={index} style={{ margin: '10px 0' }}>
                        <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'block', padding: '15px', background: '#eee', textDecoration: 'none', color: '#333' }}
                        >
                            {link.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}