import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDhB_PG_JDoGo-yc7_H_XZBjNl50Ao0X9A",
  authDomain: "sistema-optica-9278f.firebaseapp.com",
  databaseURL: "https://sistema-optica-9278f-default-rtdb.firebaseio.com",
  projectId: "sistema-optica-9278f",
  storageBucket: "sistema-optica-9278f.firebasestorage.app",
  messagingSenderId: "920449511496",
  appId: "1:920449511496:web:840cefd7eab5a6310ba87d",
  measurementId: "G-YQ5SX0QBB3"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const clientsCollection = collection(db, "clientes");

// Variables Locales
let clientesLocales = [];

const clientForm = document.getElementById("client-form");
const tableBody = document.getElementById("clients-table-body");
const searchInput = document.getElementById("search-input");
const historyModal = document.getElementById("history-modal");
const modalDataContainer = document.getElementById("modal-data-container");
const closeModalBtn = document.querySelector(".close-modal");

// --- GUARDAR EXPEDIENTE ---
clientForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const medicalRecord = {
        nombre: document.getElementById("client-name").value,
        telefono: document.getElementById("client-phone").value,
        edad: document.getElementById("client-age").value,
        motivoConsulta: document.getElementById("anamnesis-motivo").value,
        antecedentes: document.getElementById("anamnesis-antecedentes").value,
        
        rxObjetiva: {
            od: {
                esfera: document.getElementById("od-esfera").value || "",
                cilindro: document.getElementById("od-cilindro").value || "",
                eje: document.getElementById("od-eje").value || ""
            },
            oi: {
                esfera: document.getElementById("oi-esfera").value || "",
                cilindro: document.getElementById("oi-cilindro").value || "",
                eje: document.getElementById("oi-eje").value || ""
            }
        },
        
        adicion: document.getElementById("rx-adicion").value || "",
        agudezaVisual: document.getElementById("rx-av").value || "",
        diagnostico: document.getElementById("diagnostico").value || "",
        notas: document.getElementById("notes").value,
        fechaRegistro: new Date()
    };

    try {
        await addDoc(clientsCollection, medicalRecord);
        clientForm.reset();
        alert("Historia Clínica guardada correctamente");
    } catch (error) {
        console.error("Error: ", error);
        alert("Error al guardar los datos.");
    }
});

// --- OBTENER DATOS TIEMPO REAL ---
const q = query(clientsCollection, orderBy("fechaRegistro", "desc"));

onSnapshot(q, (snapshot) => {
    clientesLocales = [];
    snapshot.forEach((doc) => {
        clientesLocales.push({ id: doc.id, ...doc.data() });
    });
    renderizarTabla(clientesLocales);
});

// --- RENDERIZAR TABLA ---
function renderizarTabla(listaClientes) {
    tableBody.innerHTML = "";

    if (listaClientes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No se encontraron clientes.</td></tr>`;
        return;
    }

    listaClientes.forEach((client) => {
        const fecha = client.fechaRegistro ? new Date(client.fechaRegistro.seconds * 1000).toLocaleDateString() : "---";
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td>${fecha}</td>
            <td><strong>${client.nombre}</strong></td>
            <td>${client.telefono}</td>
            <td><span style="color: #10b981;">${client.diagnostico || 'N/A'}</span></td>
            <td><button class="btn-view" data-id="${client.id}">Ver Historial</button></td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll(".btn-view").forEach(button => {
        button.addEventListener("click", (e) => {
            abrirModalExpediente(e.target.getAttribute("data-id"));
        });
    });
}

// --- MODAL Y GENERACIÓN DE PDF ---
function abrirModalExpediente(id) {
    const expediente = clientesLocales.find(c => c.id === id);
    if (!expediente) return;

    const fechaCompleta = expediente.fechaRegistro ? new Date(expediente.fechaRegistro.seconds * 1000).toLocaleString() : "---";

    modalDataContainer.innerHTML = `
        <div id="pdf-content" style="background-color: #ffffff; color: #000000; padding: 30px; border-radius: 8px; font-family: sans-serif;">
            <h3 style="color: #000000; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 20px;">Historia Clínica G&M</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Paciente</span>
                    <p style="margin-top: 5px; font-weight: bold; font-size: 15px;">${expediente.nombre}</p>
                </div>
                <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Fecha de Consulta</span>
                    <p style="margin-top: 5px; font-size: 14px;">${fechaCompleta}</p>
                </div>
                <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Teléfono</span>
                    <p style="margin-top: 5px; font-size: 14px;">${expediente.telefono}</p>
                </div>
                <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Edad</span>
                    <p style="margin-top: 5px; font-size: 14px;">${expediente.edad} años</p>
                </div>
                
                <div style="grid-column: span 2; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Motivo de Consulta</span>
                    <p style="margin-top: 5px; font-size: 14px;">${expediente.motivoConsulta || "No registrado"}</p>
                </div>
                <div style="grid-column: span 2; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Antecedentes</span>
                    <p style="margin-top: 5px; font-size: 14px;">${expediente.antecedentes || "Ninguno"}</p>
                </div>
                
                <div style="grid-column: span 2; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Refracción Objetiva (Retinoscopía)</span>
                    <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f1f5f9;">
                                <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 14px;">Ojo</th>
                                <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 14px;">Esfera</th>
                                <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 14px;">Cilindro</th>
                                <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 14px;">Eje</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">OD</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${expediente.rxObjetiva?.od?.esfera || '-'}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${expediente.rxObjetiva?.od?.cilindro || '-'}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${expediente.rxObjetiva?.od?.eje || '-'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">OI</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${expediente.rxObjetiva?.oi?.esfera || '-'}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${expediente.rxObjetiva?.oi?.cilindro || '-'}</td>
                                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${expediente.rxObjetiva?.oi?.eje || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Adición</span>
                    <p style="margin-top: 5px; font-size: 14px;">${expediente.adicion || "N/A"}</p>
                </div>
                <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Agudeza Visual</span>
                    <p style="margin-top: 5px; font-size: 14px;">${expediente.agudezaVisual || "N/A"}</p>
                </div>
                
                <div style="grid-column: span 2; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #10b981; font-size: 12px; font-weight: bold; text-transform: uppercase;">Diagnóstico</span>
                    <p style="margin-top: 5px; font-weight: bold; font-size: 15px;">${expediente.diagnostico || "N/A"}</p>
                </div>

                <div style="grid-column: span 2; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px;">
                    <span style="color: #3b82f6; font-size: 12px; font-weight: bold; text-transform: uppercase;">Conducta y Tratamiento</span>
                    <p style="margin-top: 5px; font-size: 14px;">${expediente.notas || "Sin observaciones."}</p>
                </div>
            </div>
        </div>
        
        <button id="btn-descargar-pdf" style="margin-top: 20px; width: 100%; padding: 12px; background-color: #ef4444; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer;">
            Descargar Historia en PDF
        </button>
    `;

    historyModal.style.display = "block";

    document.getElementById("btn-descargar-pdf").addEventListener("click", () => {
        const elemento = document.getElementById("pdf-content");
        const opciones = {
            margin:       0.5,
            filename:     `Historia_${expediente.nombre.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opciones).from(elemento).save();
    });
}

// Cerrar modal
closeModalBtn.addEventListener("click", () => historyModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === historyModal) historyModal.style.display = "none"; });

// --- FILTRO DE BÚSQUEDA ---
searchInput.addEventListener("input", (e) => {
    const queryBusqueda = e.target.value.toLowerCase().trim();
    if (queryBusqueda === "") {
        renderizarTabla(clientesLocales);
        return;
    }
    const filtrados = clientesLocales.filter(c => {
        const nom = c.nombre ? c.nombre.toLowerCase() : "";
        const tel = c.telefono ? c.telefono : "";
        const diag = c.diagnostico ? c.diagnostico.toLowerCase() : "";
        return nom.includes(queryBusqueda) || tel.includes(queryBusqueda) || diag.includes(queryBusqueda);
    });
    renderizarTabla(filtrados);
});