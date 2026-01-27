import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import { RefreshCw, Loader2, Users, UserPlus, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  created_at: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city?: string | null;
  avatar?: string | null;
}

// Datos de preregistro
const PREREGISTRO_DATA: UserProfile[] = [
  { "id": "0062ddfa-b328-47ce-b194-a706752a8f5b", "email": "cimpoesu4@gmail.com", "first_name": "Elena ", "last_name": "Cimpoesu", "phone": "666940663", "city": "Alicante ", "created_at": "2025-11-25 16:20:15.742515+00", "avatar": "sifrina" },
  { "id": "03e77cea-b0f3-4097-9b8e-631e642d2844", "email": "beaglomm@gmail.com", "first_name": "Beatriz", "last_name": "Martin Sanchez", "phone": "+34627889030", "city": "Alicante", "created_at": "2025-10-22 18:01:03.086404+00", "avatar": "coolcat" },
  { "id": "04575c88-983b-46a6-8f1f-abc70b1249fd", "email": "joseba.deblas@gmail.com", "first_name": "Joseba ", "last_name": "De Blas", "phone": "629932618", "city": "Pamplona ", "created_at": "2025-10-23 06:55:45.915972+00", "avatar": "buck" },
  { "id": "08b1059a-4261-457c-a29e-838650f6b1d5", "email": "jarv.vrj@gmail.com", "first_name": "Javier", "last_name": "Rodríguez ", "phone": "+34691451503", "city": "Alicante ", "created_at": "2025-10-25 19:41:33.54662+00", "avatar": "coolcat" },
  { "id": "0a481ae5-29ca-4a1e-8696-ca954bfd3222", "email": "programroll@gmail.com", "first_name": "Maria", "last_name": "de  Feo", "phone": "+541131339091", "city": "Alicante ", "created_at": "2025-11-07 22:14:35.895508+00", "avatar": "coolcat" },
  { "id": "1194c704-0c0c-4a9d-aa7a-2f81089157ce", "email": "antoniobernaldez@gmail.com", "first_name": "Antonio ", "last_name": "Bernaldez ", "phone": "655666362", "city": "Alicante", "created_at": "2025-11-13 07:38:44.511951+00", "avatar": "coolcat" },
  { "id": "1a61a38f-fe3e-45e8-a11f-48815f08eb89", "email": "polina.teterieva92@gmail.com", "first_name": "Polina", "last_name": "Teterieva", "phone": "632103337", "city": "Alicante ", "created_at": "2025-10-22 09:54:09.552208+00", "avatar": "candela" },
  { "id": "220f8474-690b-4f04-b05f-8a3863a8f9fc", "email": "imirallesrubert@hotmail.com", "first_name": "Isabel ", "last_name": "Miralles ", "phone": "648710176", "city": "Valencia ", "created_at": "2025-10-22 06:41:55.769339+00", "avatar": "medusa" },
  { "id": "23678f89-4cb0-420a-bfd6-f70e35a66fdb", "email": "alejalacan@hotmail.com", "first_name": "Alex", "last_name": "Diaz", "phone": "636882252", "city": "Alicante ", "created_at": "2025-10-22 17:59:54.550267+00", "avatar": "buck" },
  { "id": "2ef69bbe-f743-4b85-8a01-7f6467e0e714", "email": "ricky.sofer1012@gmail.com", "first_name": "Ricardo", "last_name": "Soria Fernandez", "phone": "695935546", "city": "Alicante", "created_at": "2025-10-22 19:09:59.698876+00", "avatar": "buck" },
  { "id": "33a57e20-adb2-416c-8ecd-5afdadb22a76", "email": "j.bousse@gmail.com", "first_name": "Julien", "last_name": "Bousse", "phone": "+34 665 013 125", "city": "Alicante ", "created_at": "2025-11-15 23:36:27.779611+00", "avatar": "coolcat" },
  { "id": "389ad076-1474-49a3-a6cb-7b3262c3bc9c", "email": "teresamartinsanchez87@gmail.com", "first_name": "Teresa", "last_name": "Martin", "phone": "681907062", "city": "Alicante", "created_at": "2025-10-22 18:33:49.686523+00", "avatar": "coolcat" },
  { "id": "38bc4db9-de69-48d6-af9e-51457019548b", "email": "karolaincarrenop@gmail.com", "first_name": "Karolain", "last_name": "Carreño", "phone": "624299559", "city": "Alicante ", "created_at": "2025-10-27 10:56:08.963933+00", "avatar": "sifrina" },
  { "id": "4bcf32ce-ed03-494e-bc21-5a3348e48367", "email": "asuka45@gmail.com", "first_name": "Ana Cristina ", "last_name": "Ramírez Pérez ", "phone": "+34693462395", "city": "Alicante ", "created_at": "2025-10-21 10:24:34.812684+00", "avatar": "guajira" },
  { "id": "4f0ab76e-359b-44b1-aa14-5444bf1851c0", "email": "selinapreister@gmail.com", "first_name": "Selina", "last_name": "Preister", "phone": "+34 711 042 029", "city": "Alicante", "created_at": "2025-11-13 18:26:19.763388+00", "avatar": "medusa" },
  { "id": "504b30c0-682b-471c-a20a-e8d87c350eed", "email": "ruedajose1986@gmail.com", "first_name": "José Luis ", "last_name": "Rueda", "phone": "654962276", "city": "Alicante", "created_at": "2025-10-25 20:45:07.876701+00", "avatar": "buck" },
  { "id": "5db47438-9173-4dcd-ac68-f898eb1878f5", "email": "lorenasusrez@gmail.con", "first_name": "Lara ", "last_name": "Torres", "phone": "663366793", "city": "Alicante ", "created_at": "2025-11-21 11:47:11.053016+00", "avatar": "coolcat" },
  { "id": "75b63fd1-9921-4bed-ad5a-9e42bb7e2b6c", "email": "joseluisgb55@gmail.com", "first_name": "Jose Luis ", "last_name": "García ", "phone": "633032027", "city": "Alicante ", "created_at": "2025-10-22 12:18:05.88368+00", "avatar": "buck" },
  { "id": "764b4a88-8e7e-4d8f-9bc6-8aa6252c7d95", "email": "kldavis1126@gmail.com", "first_name": "Kristen", "last_name": "Davis", "phone": "6025022252", "city": "Alicante", "created_at": "2025-10-22 06:08:26.613074+00", "avatar": "coolcat" },
  { "id": "768d01a4-d3ab-435d-b7f3-b51ef236d130", "email": "esneruo@hotmail.com", "first_name": "Ramón ", "last_name": "Bouzo ", "phone": "691201468", "city": "Alicante ", "created_at": "2025-11-12 19:57:59.982722+00", "avatar": "buck" },
  { "id": "7721b370-9687-4f35-8a09-9583c421a635", "email": "athaissandrea123@gmail.com", "first_name": "Athais ", "last_name": "Sandrea", "phone": "624464694", "city": "Alicante ", "created_at": "2025-10-28 10:55:25.958994+00", "avatar": "guajira" },
  { "id": "77c43bba-0ab7-4fa2-9dff-79fe7060087f", "email": "serranovilla@gmail.com", "first_name": "Francisco ", "last_name": "Serrano ", "phone": "627356915", "city": "Petrer", "created_at": "2025-11-12 18:20:05.176865+00", "avatar": "coolcat" },
  { "id": "78f90937-dc68-4363-a4f5-f792cd795868", "email": "soypablocabezuelo@gmail.com", "first_name": "Pa", "last_name": "Po", "phone": "639852421", "city": "Alicante ", "created_at": "2025-10-22 18:39:43.471065+00", "avatar": "catira" },
  { "id": "842354b4-6408-4f06-b862-9f976009affe", "email": "cupecakeanni@gmail.com", "first_name": "Anais ", "last_name": "Ruiz", "phone": "654458498", "city": "Alicante ", "created_at": "2025-10-24 09:46:08.392759+00", "avatar": "guajira" },
  { "id": "86a6ea03-abb6-414f-be62-193ce548412f", "email": "crawlerrobo@gmail.com", "first_name": "kxtyqh", "last_name": "jytiul", "phone": "5749768326", "city": "tsywwq", "created_at": "2025-11-24 02:12:26.379536+00", "avatar": "buck" },
  { "id": "941cce83-a049-4e1c-b015-00a90aef6717", "email": "anaromerodominguez479@gmail.com", "first_name": "Ana ", "last_name": "Romero Domínguez", "phone": "601375025", "city": "Alicante", "created_at": "2025-10-22 18:07:43.764205+00", "avatar": "medusa" },
  { "id": "9a33aae6-577c-493c-85c5-f8fbd7fed169", "email": "coachgizeh@gmail.com", "first_name": "Gizeh", "last_name": "Parra", "phone": "614420149", "city": "Alicante ", "created_at": "2025-11-14 21:16:05.976368+00", "avatar": "sifrina" },
  { "id": "9a6a43a3-0d44-4b03-9245-f82592d9ff44", "email": "eduardoortegaperez@hotmail.com", "first_name": "Eduardo ", "last_name": "Ortega Pérez ", "phone": "722175185", "city": "Elche ", "created_at": "2025-11-16 07:00:04.780046+00", "avatar": "coolcat" },
  { "id": "a05b541b-f91a-437d-91ab-93428ca97582", "email": "jorgeguerrero50@gmail.com", "first_name": "Jorge ", "last_name": "Guerrero ", "phone": "642119995", "city": "Alicante", "created_at": "2025-10-21 10:24:57.873076+00", "avatar": "coolcat" },
  { "id": "a40d4d2f-c4e1-4bed-8f49-285929479289", "email": "marga.w14ifnb.paid@icloud.com", "first_name": "Test", "last_name": "Apple", "phone": "6567876543", "city": "Madrid", "created_at": "2025-10-22 08:23:05.163373+00", "avatar": "coolcat" },
  { "id": "a7b684db-5773-4c81-89a3-b63b0a4b2620", "email": "seva90394@gmail.com", "first_name": "Seva ", "last_name": "Avdeev", "phone": "+34657643567", "city": "Alicante ", "created_at": "2025-10-22 16:19:09.971988+00", "avatar": "buck" },
  { "id": "acd7e187-5292-45c8-bdef-00b8d38c9523", "email": "mardeliamontiel1@gmail.com", "first_name": "Mardelia ", "last_name": "Montiel", "phone": "623186032", "city": "Madrid ", "created_at": "2025-10-23 05:33:14.100255+00", "avatar": "sifrina" },
  { "id": "b523a94b-3584-4915-8146-eb9b4c320748", "email": "margus.numadez@gmail.com", "first_name": "Agus", "last_name": "Numadez", "phone": "+393520189679", "city": "Alicante ", "created_at": "2025-11-25 12:12:26.677481+00", "avatar": "coolcat" },
  { "id": "b611f8cf-e32c-4a37-9337-069e3d68d48a", "email": "ANPM1904@gmail.com", "first_name": "Abril", "last_name": "Paredes", "phone": "602559339", "city": "Alicante ", "created_at": "2025-11-17 17:42:25.421088+00", "avatar": "coolcat" },
  { "id": "b811464e-9b0e-4f65-ab9d-a7164bea84fc", "email": "carol.n2nkp54.paid@icloud.com", "first_name": "Apple", "last_name": "App,e", "phone": "+16693334444", "city": "Cupertino", "created_at": "2025-10-23 06:21:33.355896+00", "avatar": "coolcat" },
  { "id": "b82dfd24-fad9-4640-b557-842a75a95451", "email": "deliamar.mrcoolcat@gmail.com", "first_name": "Deliamar ", "last_name": "Montiel ", "phone": "+34663406728", "city": "Alicante ", "created_at": "2025-10-21 08:23:38.479923+00", "avatar": "guajira" },
  { "id": "b84d269b-4e65-4e1f-aa89-7af8c7fc9bf5", "email": "silxdsadaarseb@gmail.com", "first_name": "Juan", "last_name": "Jose", "phone": "68352962934", "city": "Valencia", "created_at": "2025-10-27 12:28:16.778322+00", "avatar": "buck" },
  { "id": "b8d00600-f7d2-488e-a063-c8ffd074c7d4", "email": "juanantoniopina1997@gmail.com", "first_name": "Juan Antonio ", "last_name": "Pina Peñalver ", "phone": "677771112", "city": "Sax Alicante ", "created_at": "2025-10-25 15:35:01.972878+00", "avatar": "buck" },
  { "id": "b93be647-e92f-4678-9284-9bdcdd83c0a8", "email": "martinlegovich.22@gmail.com", "first_name": "Martín ", "last_name": "Legovich ", "phone": "+34675171157", "city": "Alicante ", "created_at": "2025-10-22 08:16:19.073824+00", "avatar": "coolcat" },
  { "id": "b9a8f12c-7761-4d04-8fde-6c4531f1db28", "email": "iryna.hue@gmail.com", "first_name": "Iryna", "last_name": "Shapoval", "phone": "+380932044012", "city": "Alicante ", "created_at": "2025-11-10 18:41:24.736722+00", "avatar": "medusa" },
  { "id": "bd888944-615f-40be-bc18-cce8d5b63768", "email": "venderfry@hotmail.com", "first_name": "Iván ", "last_name": "Gómez Miquel ", "phone": "663697895", "city": "Alicante ", "created_at": "2025-10-27 21:56:56.086465+00", "avatar": "coolcat" },
  { "id": "be211ad2-1802-459d-a193-7b92caff9ce5", "email": "laletyleon@gmail.com", "first_name": "Lety", "last_name": "Kaos", "phone": "+34604149600", "city": "Alicante ", "created_at": "2025-11-16 02:05:27.176727+00", "avatar": "buck" },
  { "id": "c5063a12-f3d8-412d-bcd3-46d312b80356", "email": "anapaulapestana7@gmail.com", "first_name": "Ana Paual", "last_name": "Pestana ", "phone": "697788630", "city": "Alicante", "created_at": "2025-10-22 21:11:53.514932+00", "avatar": "sifrina" },
  { "id": "c9864d1b-7802-4ac0-99df-f15e729c10a1", "email": "girottigabriel@gmail.com", "first_name": "Gabriel ", "last_name": "Girotti ", "phone": "633761298", "city": "Alicante ", "created_at": "2025-11-12 17:45:08.96247+00", "avatar": "coolcat" },
  { "id": "cb308ffd-f717-4beb-b30d-17aaaeca6b9f", "email": "shawnpaulcoon83@gmail.com", "first_name": "Shawn ", "last_name": "Coon", "phone": "633 596 880", "city": "Alicante ", "created_at": "2025-11-25 16:15:39.266988+00", "avatar": "buck" },
  { "id": "e1bc7d72-65fc-41b4-b72a-1a1a67ba7a7b", "email": "maxivelloso@gmail.com", "first_name": "Maxi", "last_name": "Velloso ", "phone": "640142138", "city": "Alicante ", "created_at": "2025-10-25 18:37:55.485456+00", "avatar": "coolcat" },
  { "id": "e32e064e-39f3-4c1d-8efb-7f0be7a0c882", "email": "roelalgababrizuela1997@gmail.com", "first_name": "Roel", "last_name": "Algaba Brizuela ", "phone": "641374610", "city": "Alicante", "created_at": "2025-11-05 12:16:47.888682+00", "avatar": "buck" },
  { "id": "e54c9c1c-150d-4907-8ece-a879da47d1f2", "email": "gleibersclv@gmail.com", "first_name": "Gleibers ", "last_name": "Linares", "phone": "614400218", "city": "Alicante", "created_at": "2025-11-15 00:18:59.335261+00", "avatar": "sifrina" },
  { "id": "eae90f0d-f2e8-4a98-aabf-b95ec7868a0d", "email": "silxaadsadsarseb@gmail.com", "first_name": "Juan", "last_name": "Jose", "phone": "6835296294545", "city": "Valencia", "created_at": "2025-10-26 16:35:25.717723+00", "avatar": "coolcat" },
  { "id": "ed1b55e5-0b06-4990-ae5c-b16289e93600", "email": "garciaarnes1997@gmail.com", "first_name": "Andrés Mena", "last_name": "García Arnés ", "phone": "673508712", "city": "Alicante ", "created_at": "2025-10-22 20:01:56.248072+00", "avatar": "coolcat" },
  { "id": "ee68eed0-3863-45ab-99af-f7ab9e0df750", "email": "jv4latasturbo@gmail.com", "first_name": "Josevi", "last_name": "Herrera ", "phone": "605455488", "city": "Alicante ", "created_at": "2025-10-22 21:51:23.785166+00", "avatar": "coolcat" },
  { "id": "ee872f44-818f-4503-a0fd-c5cf7ceeef47", "email": "Nandini.devi369108@gmail.com", "first_name": "Florence", "last_name": "Gomez Robert ", "phone": "640288095", "city": "Alicante ", "created_at": "2025-11-19 21:44:47.118207+00", "avatar": "sifrina" },
  { "id": "f0bf2c90-51ed-45aa-aa60-994d733b929f", "email": "lfelipe.lfontana@gmail.com", "first_name": "Felipe", "last_name": "Fontana", "phone": "603807923", "city": "Alicante", "created_at": "2025-10-22 19:57:20.12586+00", "avatar": "buck" },
  { "id": "f2cd8cf8-f950-4202-b0b3-6c4a188fe6b9", "email": "cmzamudio81@hotmail.com", "first_name": "Carlos ", "last_name": "Zamudio ", "phone": "692055410", "city": "Valencia ", "created_at": "2025-10-25 09:23:38.324874+00", "avatar": "coolcat" },
  { "id": "f6d3cd35-9003-4c31-bad1-e7ec2a4d7c4d", "email": "debi_88@hotmail.com", "first_name": "DEBORAH", "last_name": "Rodríguez", "phone": "697897293", "city": "Valencia", "created_at": "2025-11-13 14:37:38.206134+00", "avatar": "catira" },
  { "id": "f78dc2c3-0c25-4e55-8a5a-05dae300bae8", "email": "patox_castro@hotmail.com.ar", "first_name": "Patricio Nicolas ", "last_name": "Castro Popity", "phone": "623723308", "city": "Palma De Mallorca", "created_at": "2025-10-22 20:44:38.660646+00", "avatar": "buck" },
  { "id": "f7b88f4c-37ba-48a7-b8a0-59fcb3c946d4", "email": "gabo1821@gmail.com", "first_name": "Gabriel ", "last_name": "Bastardo Venegas", "phone": "624159072", "city": "Alicante", "created_at": "2025-10-22 19:22:18.280658+00", "avatar": "coolcat" },
  { "id": "f859b22a-1695-4ded-919e-f90ae0682c7b", "email": "moncadaortizm@gmail.com", "first_name": "majo", "last_name": "moncada ", "phone": "622776938", "city": "valència ", "created_at": "2025-11-11 18:03:09.66094+00", "avatar": "catira" },
  { "id": "f8e7d15a-1eea-4eae-9b7f-fc72b62389d4", "email": "michaelolofevans@gmail.com", "first_name": "Michael ", "last_name": "Evans", "phone": "680731826", "city": "Alicante", "created_at": "2025-10-21 07:11:43.34591+00", "avatar": "coolcat" },
  { "id": "fbff7a00-e338-4f42-84f4-c72a9b657394", "email": "mikaelevans@gmail.com", "first_name": "Michael ", "last_name": "Evans", "phone": "689863989", "city": "Alicante", "created_at": "2025-10-24 14:38:33.18999+00", "avatar": "coolcat" },
  { "id": "fcb9dc2a-03c3-4890-b63f-df69f2647884", "email": "alexrodriguezperez17@gmail.com", "first_name": "Álex", "last_name": "Rodríguez Pérez", "phone": "657788789", "city": "Elche", "created_at": "2025-11-12 09:59:49.071707+00", "avatar": "guajira" }
];

const PAGE_SIZE = 10;

type TabType = 'registered' | 'preregistro';

const UserRecords: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('registered');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, created_at, email, first_name, last_name, phone')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los registros de usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentData = activeTab === 'registered' ? users : PREREGISTRO_DATA;

  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha Registro', 'Email', 'Nombre', 'Apellido', 'Teléfono', 'Ciudad'];
    const csvContent = [
      headers.join(','),
      ...currentData.map(user => [
        user.id,
        user.created_at,
        user.email,
        user.first_name || '',
        user.last_name || '',
        user.phone || '',
        user.city || ''
      ].map(field => `"${field ? String(field).replace(/"/g, '""') : ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<UserProfile>[] = [
    {
      header: 'Fecha de Registro',
      accessorKey: 'created_at',
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      render: (row: UserProfile) => (
        <span className="text-white font-medium">
          {row.email}
        </span>
      ),
    },
    {
      header: 'Nombre',
      accessorKey: 'first_name',
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {row.first_name || '-'}
        </span>
      ),
    },
    {
      header: 'Apellido',
      accessorKey: 'last_name',
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {row.last_name || '-'}
        </span>
      ),
    },
    {
      header: 'Teléfono',
      accessorKey: 'phone',
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {row.phone || '-'}
        </span>
      ),
    },
    ...(activeTab === 'preregistro' ? [{
      header: 'Ciudad',
      accessorKey: 'city' as keyof UserProfile,
      render: (row: UserProfile) => (
        <span className="text-text-secondary">
          {row.city || '-'}
        </span>
      ),
    }] : []),
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Registros de Usuarios</h1>
          <p className="text-text-secondary mt-1">
            Lista de usuarios registrados y pre-registrados en la plataforma
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExportCSV}
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exportar CSV
          </Button>
          <Button
            onClick={fetchUsers}
            disabled={isLoading}
            leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('registered')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'registered'
              ? 'bg-brand-orange text-white'
              : 'bg-[#2C2C2C] text-text-secondary hover:bg-[#3C3C3C]'
            }`}
        >
          <Users className="h-4 w-4" />
          Usuarios Registrados ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('preregistro')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'preregistro'
              ? 'bg-brand-orange text-white'
              : 'bg-[#2C2C2C] text-text-secondary hover:bg-[#3C3C3C]'
            }`}
        >
          <UserPlus className="h-4 w-4" />
          Pre-registros ({PREREGISTRO_DATA.length})
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#2C2C2C] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange/10 rounded-lg">
              <Users className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">
                {activeTab === 'registered' ? 'Usuarios Registrados' : 'Pre-registros'}
              </p>
              <p className="text-2xl font-bold text-white">{currentData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#2C2C2C] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Total General</p>
              <p className="text-2xl font-bold text-white">{users.length + PREREGISTRO_DATA.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        {isLoading && activeTab === 'registered' ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            <span className="ml-3 text-text-secondary">Cargando registros...</span>
          </div>
        ) : error && activeTab === 'registered' ? (
          <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-4 text-status-error">
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={currentData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
            pagination={{
              page: currentPage,
              pageSize: PAGE_SIZE,
              total: currentData.length,
              onPageChange: setCurrentPage,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserRecords;
