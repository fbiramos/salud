// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('Error al registrar Service Worker:', err));
    });
}

const appContainer = document.getElementById('app');
const ADMIN_PASSWORD = 'family'; // Contraseña de administrador

// --- VISTAS PRINCIPALES ---

function showLoginScreen() {
    appContainer.innerHTML = `
        <div class="text-center">
            <h2 class="text-2xl font-semibold mb-6">¿Quién eres?</h2>
            <div class="space-y-4">
                <button id="adminBtn" class="w-full max-w-xs bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300">
                    Soy Administrador
                </button>
                <button id="userBtn" class="w-full max-w-xs bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300">
                    Soy Usuario
                </button>
            </div>
        </div>
    `;
    document.getElementById('adminBtn').addEventListener('click', handleAdminLogin);
    document.getElementById('userBtn').addEventListener('click', showUserView);
}

function showAdminView() {
    appContainer.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Pacientes</h2>
            <button id="logoutBtn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md">Salir</button>
        </div>
        <div id="patient-list" class="space-y-4"></div>
        <div class="mt-8">
            <button id="addPatientBtn" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300">
                + Añadir Nuevo Paciente
            </button>
        </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', showLoginScreen);
    document.getElementById('addPatientBtn').addEventListener('click', showAddPatientForm);
    loadPatients(true);
}

function showUserView() {
    appContainer.innerHTML = `
         <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Pacientes</h2>
            <button id="backBtn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md">Volver</button>
        </div>
        <div id="patient-list" class="space-y-4"></div>
    `;
    document.getElementById('backBtn').addEventListener('click', showLoginScreen);
    loadPatients(false);
}

// --- LÓGICA DE ACCESO ---

function handleAdminLogin() {
    const password = prompt('Introduce la contraseña de Administrador:');
    if (password === ADMIN_PASSWORD) {
        showAdminView();
    } else if (password !== null) {
        alert('Contraseña incorrecta.');
    }
}

// --- LÓGICA DE DATOS: PACIENTES ---

function loadPatients(isAdmin) {
    const patientListContainer = document.getElementById('patient-list');
    db.collection('patients').orderBy('name', 'asc').onSnapshot(querySnapshot => {
        if (querySnapshot.empty) {
            patientListContainer.innerHTML = '<p class="text-center text-gray-500">No hay pacientes registrados.</p>';
            return;
        }
        let html = '';
        querySnapshot.forEach(doc => {
            const patient = doc.data();
            const patientId = doc.id;
            const patientName = patient.name.replace(/'/g, "'");
            const patientAge = patient.age || '';
            const patientSexo = patient.sexo || 'N/A';
            html += `
                <div class="bg-white p-5 rounded-lg shadow-md">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold text-indigo-700">${patient.name}</h3>
                            <p class="text-gray-600">Edad: ${patient.age || 'N/A'}</p>
                            <p class="text-gray-600">Sexo: ${patientSexo}</p>
                        </div>
                        <button onclick="showPatientDetails('${patientId}', '${patientName}', ${isAdmin})" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Ver Historial</button>
                    </div>
                    ${isAdmin ? `
                    <div class="flex space-x-2 mt-4">
                        <button onclick="showEditPatientForm('${patientId}', '${patientName}', '${patientAge}', '${patientSexo}')" class="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded">Editar Datos</button>
                        <button onclick="deletePatient('${patientId}')" class="text-sm bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded">Eliminar Paciente</button>
                    </div>
                    ` : ''}
                </div>
            `;
        });
        patientListContainer.innerHTML = html;
    }, error => {
        console.error("Error al cargar pacientes: ", error);
        patientListContainer.innerHTML = '<p class="text-center text-red-500">Error al cargar los datos.</p>';
    });
}

function showAddPatientForm() {
    appContainer.innerHTML = `
        <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 class="text-2xl font-bold mb-6">Añadir Nuevo Paciente</h2>
            <div class="space-y-4">
                <input type="text" id="patientName" placeholder="Nombre completo" class="w-full px-4 py-2 border rounded-lg">
                <input type="number" id="patientAge" placeholder="Edad" class="w-full px-4 py-2 border rounded-lg">
                <div>
                    <label class="text-gray-700">Sexo:</label>
                    <div class="mt-2 flex items-center space-x-4">
                        <label class="inline-flex items-center">
                            <input type="radio" name="sexo" value="Varón" class="form-radio text-indigo-600">
                            <span class="ml-2">Varón</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" name="sexo" value="Mujer" class="form-radio text-pink-600">
                            <span class="ml-2">Mujer</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="mt-8 flex space-x-4">
                <button id="saveBtn" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg">Guardar</button>
                <button id="cancelBtn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg">Cancelar</button>
            </div>
        </div>
    `;
    document.getElementById('saveBtn').addEventListener('click', savePatient);
    document.getElementById('cancelBtn').addEventListener('click', showAdminView);
}

function savePatient() {
    const name = document.getElementById('patientName').value;
    const age = document.getElementById('patientAge').value || null;
    const sexo = document.querySelector('input[name="sexo"]:checked')?.value || null;

    if (!name) { alert('El nombre es obligatorio.'); return; }
    if (!sexo) { alert('Debe seleccionar el sexo.'); return; }

    db.collection('patients').add({ name, age, sexo })
        .then(() => showAdminView())
        .catch(error => console.error("Error al guardar paciente: ", error));
}

function showEditPatientForm(patientId, name, age, sexo) {
    appContainer.innerHTML = `
        <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 class="text-2xl font-bold mb-6">Editar Datos del Paciente</h2>
            <div class="space-y-4">
                <input type="text" id="patientName" value="${name}" class="w-full px-4 py-2 border rounded-lg">
                <input type="number" id="patientAge" value="${age}" class="w-full px-4 py-2 border rounded-lg">
                <div>
                    <label class="text-gray-700">Sexo:</label>
                    <div class="mt-2 flex items-center space-x-4">
                        <label class="inline-flex items-center">
                            <input type="radio" name="sexo" value="Varón" class="form-radio text-indigo-600" ${sexo === 'Varón' ? 'checked' : ''}>
                            <span class="ml-2">Varón</span>
                        </label>
                        <label class="inline-flex items-center">
                            <input type="radio" name="sexo" value="Mujer" class="form-radio text-pink-600" ${sexo === 'Mujer' ? 'checked' : ''}>
                            <span class="ml-2">Mujer</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="mt-8 flex space-x-4">
                <button id="saveBtn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg">Actualizar</button>
                <button id="cancelBtn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg">Cancelar</button>
            </div>
        </div>
    `;
    document.getElementById('saveBtn').addEventListener('click', () => updatePatient(patientId));
    document.getElementById('cancelBtn').addEventListener('click', showAdminView);
}

function updatePatient(patientId) {
    const name = document.getElementById('patientName').value;
    const age = document.getElementById('patientAge').value || null;
    const sexo = document.querySelector('input[name="sexo"]:checked')?.value || null;

    if (!name) { alert('El nombre es obligatorio.'); return; }
    if (!sexo) { alert('Debe seleccionar el sexo.'); return; }

    db.collection('patients').doc(patientId).update({ name, age, sexo })
        .then(() => showAdminView())
        .catch(error => console.error("Error al actualizar paciente: ", error));
}

function deletePatient(patientId) {
    if (confirm('¿Estás seguro de que quieres eliminar a este paciente? Se borrará todo su historial. Esta acción no se puede deshacer.')) {
        db.collection('patients').doc(patientId).delete()
            .catch(error => console.error("Error al eliminar paciente: ", error));
    }
}

// --- LÓGICA DE DATOS: HISTORIAL DE MEDICIONES ---

function showPatientDetails(patientId, patientName, isAdmin) {
    const backFunction = isAdmin ? 'showAdminView()' : 'showUserView()';
    appContainer.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-indigo-800">Historial de: ${patientName}</h2>
            <button onclick="${backFunction}" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Volver</button>
        </div>
        <div id="readings-list" class="space-y-4"></div>
        ${isAdmin ? `
        <div class="mt-8">
            <button onclick="showAddReadingForm('${patientId}', '${patientName}')" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg">
                + Añadir Nueva Medición
            </button>
        </div>
        ` : ''}
    `;
    loadReadings(patientId);
}

function loadReadings(patientId) {
    const readingsListContainer = document.getElementById('readings-list');
    db.collection('patients').doc(patientId).collection('readings').orderBy('date', 'desc').onSnapshot(querySnapshot => {
        if (querySnapshot.empty) {
            readingsListContainer.innerHTML = '<p class="text-center text-gray-500">No hay mediciones registradas.</p>';
            return;
        }
        let html = '';
        querySnapshot.forEach(doc => {
            const reading = doc.data();
            const date = reading.date ? reading.date.toDate() : new Date(); // Manejar timestamp de Firebase
            html += `
                <div class="bg-white p-5 rounded-lg shadow-md">
                    <h4 class="font-bold text-lg">${date.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</h4>
                    <ul class="list-disc list-inside mt-2 text-gray-700">
                        ${reading.weight ? `<li>Peso: <strong>${reading.weight}</strong> kg</li>` : ''}
                        ${reading.height ? `<li>Talla: <strong>${reading.height}</strong> cm</li>` : ''}
                        ${reading.pressure ? `<li>Presión: <strong>${reading.pressure}</strong></li>` : ''}
                        ${reading.glucose ? `<li>Glucosa: <strong>${reading.glucose}</strong> mg/dL</li>` : ''}
                        ${reading.oximeter ? `<li>Oxímetro: <strong>${reading.oximeter}</strong> %</li>` : ''}
                    </ul>
                </div>
            `;
        });
        readingsListContainer.innerHTML = html;
    });
}

function showAddReadingForm(patientId, patientName) {
    appContainer.innerHTML = `
        <div class="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 class="text-2xl font-bold mb-2">Nueva Medición para</h2>
            <h3 class="text-xl text-indigo-700 mb-6">${patientName}</h3>
            <div class="space-y-4">
                <input type="text" id="readingWeight" placeholder="Peso (kg)" class="w-full px-4 py-2 border rounded-lg">
                <input type="text" id="readingHeight" placeholder="Talla (cm)" class="w-full px-4 py-2 border rounded-lg">
                <input type="text" id="readingPressure" placeholder="Presión Arterial" class="w-full px-4 py-2 border rounded-lg">
                <input type="text" id="readingGlucose" placeholder="Glucosa (mg/dL)" class="w-full px-4 py-2 border rounded-lg">
                <input type="text" id="readingOximeter" placeholder="Oxímetro (%)" class="w-full px-4 py-2 border rounded-lg">
            </div>
            <div class="mt-8 flex space-x-4">
                <button id="saveBtn" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg">Guardar Medición</button>
                <button id="cancelBtn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg">Cancelar</button>
            </div>
        </div>
    `;
    document.getElementById('saveBtn').addEventListener('click', () => saveReading(patientId, patientName));
    document.getElementById('cancelBtn').addEventListener('click', () => showPatientDetails(patientId, patientName, true));
}

function saveReading(patientId, patientName) {
    const readingData = {
        date: firebase.firestore.FieldValue.serverTimestamp(), // Fecha y hora automáticas
        weight: document.getElementById('readingWeight').value || null,
        height: document.getElementById('readingHeight').value || null,
        pressure: document.getElementById('readingPressure').value || null,
        glucose: document.getElementById('readingGlucose').value || null,
        oximeter: document.getElementById('readingOximeter').value || null
    };

    // Filtrar campos que no se rellenaron
    const cleanData = Object.fromEntries(Object.entries(readingData).filter(([_, v]) => v !== null));
    if (Object.keys(cleanData).length <= 1) { // Si solo tiene la fecha
        alert('Debes rellenar al menos un campo de medición.');
        return;
    }

    db.collection('patients').doc(patientId).collection('readings').add(cleanData)
        .then(() => showPatientDetails(patientId, patientName, true))
        .catch(error => console.error("Error al guardar medición: ", error));
}

// --- INICIO ---
showLoginScreen();