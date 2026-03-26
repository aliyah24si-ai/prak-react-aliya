// Child 1: Header profil
function ProfileHeader({ nama, prodi, nim }) {
    return (
        <div>
            <h1>{nama}</h1>
            <small>{prodi} &mdash; {nim}</small>
            <hr />
        </div>
    );
}

// Child 2: Info pribadi
function InfoPribadi({ ttl, jenisKelamin, agama, alamat }) {
    return (
        <div>
            <h2>Info Pribadi</h2>
            <ul>
                <li><span className="info-label">Tempat, Tgl Lahir</span>: {ttl}</li>
                <li><span className="info-label">Jenis Kelamin</span>: {jenisKelamin}</li>
                <li><span className="info-label">Agama</span>: {agama}</li>
                <li><span className="info-label">Alamat</span>: {alamat}</li>
            </ul>
            <hr />
        </div>
    );
}

// Child 3: Pendidikan
function Pendidikan({ riwayat }) {
    return (
        <div>
            <h2>Pendidikan</h2>
            <ul>
                {riwayat.map((item, i) => (
                    <li key={i}>
                        <span className="info-label">{item.institusi}</span>: {item.jurusan} ({item.tahun})
                    </li>
                ))}
            </ul>
            <hr />
        </div>
    );
}

// Child 4: Keahlian
function Keahlian({ skills }) {
    return (
        <div>
            <h2>Keahlian</h2>
            <p>
                {skills.map((skill, i) => (
                    <span className="skill-badge" key={i}>{skill}</span>
                ))}
            </p>
            <hr />
        </div>
    );
}

// Child 5: Hobi
function Hobi({ hobi }) {
    return (
        <div>
            <h2>Hobi</h2>
            <ul>
                {hobi.map((item, i) => <li key={i}>- {item}</li>)}
            </ul>
            <hr />
        </div>
    );
}

// Child 6: Kontak
function Kontak({ email, instagram, github }) {
    return (
        <div>
            <h2>Kontak</h2>
            <ul>
                <li><span className="info-label">Email</span>: {email}</li>
                <li><span className="info-label">Instagram</span>: @{instagram}</li>
                <li><span className="info-label">GitHub</span>: github.com/{github}</li>
            </ul>
        </div>
    );
}

// Parent: BiodataDiri
export default function BiodataDiri() {
    const data = {
        nama: 'Aliyah Reysyafawi',
        nim: '2457301010',
        prodi: 'D4 Sistem Informasi',
        ttl: 'Pekanbaru, 11 agustus 2006',
        jenisKelamin: 'Perempuan',
        agama: 'Islam',
        alamat: 'Pekanbaru, Riau',
        pendidikan: [
            { institusi: 'Politeknik Caltex Riau', jurusan: 'D4 Sistem Informasi', tahun: '2024 - Sekarang' },
            { institusi: 'IBS', jurusan: 'IPS', tahun: '2020 - 2023' },
        ],
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Python', 'Git'],
        hobi: ['Membaca', 'Mendengarkan Musik'],
        email: 'aliya@gmail.com',
        instagram: 'alea',
        github: 'aliya',
    };

    return (
        <div className="card">
            <ProfileHeader nama={data.nama} prodi={data.prodi} nim={data.nim} />
            <InfoPribadi ttl={data.ttl} jenisKelamin={data.jenisKelamin} agama={data.agama} alamat={data.alamat} />
            <Pendidikan riwayat={data.pendidikan} />
            <Keahlian skills={data.skills} />
            <Hobi hobi={data.hobi} />
            <Kontak email={data.email} instagram={data.instagram} github={data.github} />
            <footer>2025 &copy; Aliya &mdash; Politeknik Caltex Riau</footer>
        </div>
    );
}
