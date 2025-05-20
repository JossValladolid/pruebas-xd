// Variables globales
let activeSection = "home";
let activeReportId = null;

// Funciones de utilidad
function formatDate(fecha) {
    return fecha || 'Fecha no disponible';
}

function generateReportId() {
    return 'REP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Listeners de eventos cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    loadReports();
    setupNavigationEvents();
    setupModalEvents();
    setupFormEvents();
    setupAccordion();

    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        switchSection(sectionId);
    }
});

// Gestión de la navegación
function setupNavigationEvents() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            switchSection(sectionId);

            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }

            window.location.hash = sectionId;
        });
    });

    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModal = document.querySelector('.close-help-modal');

    helpButton.addEventListener('click', function(e) {
        e.preventDefault();
        helpModal.style.display = 'block';
    });

    closeHelpModal.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });
}

function switchSection(sectionId) {
    const activeSectionEl = document.querySelector('.section.active-section');
    if (activeSectionEl) activeSectionEl.classList.remove('active-section');

    document.getElementById(sectionId).classList.add('active-section');

    const currentActiveLink = document.querySelector('.nav-menu a.active');
    if (currentActiveLink) currentActiveLink.classList.remove('active');

    const newActiveLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
    if (newActiveLink) newActiveLink.classList.add('active');

    activeSection = sectionId;
}

function setupModalEvents() {
    const panicButton = document.getElementById('panic-button');
    const reportModal = document.getElementById('report-modal');
    const closeModal = document.querySelector('.close-modal');

    panicButton.addEventListener('click', function() {
        reportModal.style.display = 'block';
    });

    closeModal.addEventListener('click', function() {
        reportModal.style.display = 'none';
    });

    const cancelConfirmationModal = document.getElementById('cancel-confirmation-modal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const abortCancel = document.getElementById('abort-cancel');

    confirmCancel.addEventListener('click', function() {
        if (activeReportId) cancelReport(activeReportId);
        cancelConfirmationModal.style.display = 'none';
    });

    abortCancel.addEventListener('click', function() {
        cancelConfirmationModal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === reportModal) reportModal.style.display = 'none';
        if (e.target === cancelConfirmationModal) cancelConfirmationModal.style.display = 'none';
        if (e.target === helpModal) helpModal.style.display = 'none';
    });
}

function setupFormEvents() {
    const reportForm = document.getElementById('reportForm');

    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const codigoEstudiante = document.getElementById('codigoEstudiante').value;
        const nombre = document.getElementById('nombre').value;
        const descripcion = document.getElementById('descripcion').value;

        let isValid = true;

        if (!codigoEstudiante || isNaN(codigoEstudiante)) {
            document.getElementById('errorCodigo').textContent = 'Código de estudiante inválido';
            isValid = false;
        } else {
            document.getElementById('errorCodigo').textContent = '';
        }

        if (!descripcion) {
            document.getElementById('errorDescripcion').textContent = 'La descripción es obligatoria';
            isValid = false;
        } else {
            document.getElementById('errorDescripcion').textContent = '';
        }

        if (isValid) {
            if (activeReportId) {
                updateReport(activeReportId, codigoEstudiante, nombre, descripcion);
            } else {
                submitReport(codigoEstudiante, nombre, descripcion);
            }
        }
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('contactExito').textContent = 'Mensaje enviado con éxito';
            contactForm.reset();
            setTimeout(() => document.getElementById('contactExito').textContent = '', 3000);
        });
    }
}

function submitReport(codigoEstudiante, nombre, descripcion) {
    const reportData = {
        codigoEstudiante: codigoEstudiante,
        nombre: nombre || null,
        descripcion: descripcion
    };

    fetch('http://localhost:8000/tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al enviar el reporte');
        return response.json();
    })
    .then(() => {
        document.getElementById('exitoEnvio').textContent = 'Reporte enviado con éxito';
        document.getElementById('reportForm').reset();
        loadReports();
        setTimeout(() => {
            document.getElementById('report-modal').style.display = 'none';
            document.getElementById('exitoEnvio').textContent = '';
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('exitoEnvio').textContent = 'Error al enviar el reporte. Inténtalo de nuevo.';
    });
}

function updateReport(reportId, codigoEstudiante, nombre, descripcion) {
    const reportData = {
        codigoEstudiante: codigoEstudiante,
        nombre: nombre || null,
        descripcion: descripcion
    };

    fetch(`http://localhost:8000/tasks/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al actualizar el reporte');
        return response.json();
    })
    .then(() => {
        document.getElementById('exitoEnvio').textContent = 'Reporte actualizado con éxito';
        activeReportId = null;
        document.getElementById('reportForm').reset();
        loadReports();
        setTimeout(() => {
            document.getElementById('report-modal').style.display = 'none';
            document.getElementById('exitoEnvio').textContent = '';
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('exitoEnvio').textContent = 'Error al actualizar el reporte.';
    });
}

function loadReports() {
    const reportsContainer = document.getElementById('reports-list');

    fetch('http://localhost:8000/tasks/')
    .then(response => {
        if (!response.ok) throw new Error('Error al obtener reportes');
        return response.json();
    })
    .then(reports => {
        reports.sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at));
        reportsContainer.innerHTML = '';

        if (reports.length === 0) {
            reportsContainer.innerHTML = '<p>No hay reportes pendientes</p>';
            return;
        }

        reports.forEach(report => {
            const reportElement = document.createElement('div');
            const isCanceled = report.estado === 'Cancelado';
            
            // Agregar clase CSS según el estado
            reportElement.className = isCanceled ? 'report-item canceled-report' : 'report-item';
            
            reportElement.innerHTML = `
                <div class="report-header">
                    <span class="report-id">${report.id}</span>
                    <span class="report-date-time">${formatDate(report.fecha)} ${report.hora || ''}</span>
                </div>
                <div class="report-description">${report.descripcion}</div>
                <div class="report-status">Estado: ${report.estado || 'Pendiente'}</div>
                <div class="report-actions">
                    <button class="action-button form-button ${isCanceled ? 'disabled' : ''}" 
                            data-id="${report.id}" 
                            ${isCanceled ? 'disabled' : ''}>
                        Formulario
                    </button>
                    <button class="action-button cancel-button ${isCanceled ? 'disabled' : ''}" 
                            data-id="${report.id}" 
                            ${isCanceled ? 'disabled' : ''}>
                        ${isCanceled ? 'Cancelado' : 'Cancelar Reporte'}
                    </button>
                </div>
            `;

            reportsContainer.appendChild(reportElement);
        });

        // Solo agregar event listeners a botones no deshabilitados
        document.querySelectorAll('.form-button:not(.disabled)').forEach(button => {
            button.addEventListener('click', function() {
                const reportId = this.getAttribute('data-id');
                editReport(reportId);
            });
        });

        document.querySelectorAll('.cancel-button:not(.disabled)').forEach(button => {
            button.addEventListener('click', function() {
                const reportId = this.getAttribute('data-id');
                confirmCancelReport(reportId);
            });
        });
    })
    .catch(error => {
        console.error('Error al cargar los reportes:', error);
        reportsContainer.innerHTML = '<p>Error al cargar los reportes</p>';
    });
}

function editReport(reportId) {
    fetch(`http://localhost:8000/tasks/${reportId}`)
    .then(response => {
        if (!response.ok) throw new Error('No se pudo obtener el reporte');
        return response.json();
    })
    .then(report => {
        document.getElementById('codigoEstudiante').value = report.codigoEstudiante;
        document.getElementById('nombre').value = report.nombre || '';
        document.getElementById('descripcion').value = report.descripcion;
        activeReportId = reportId;
        document.getElementById('report-modal').style.display = 'block';
    })
    .catch(error => console.error('Error al cargar el reporte:', error));
}

function confirmCancelReport(reportId) {
    activeReportId = reportId;
    document.getElementById('cancel-confirmation-modal').style.display = 'block';
}

function cancelReport(reportId) {
    fetch(`http://localhost:8000/tasks/${reportId}`)
    .then(response => response.json())
    .then(task => {
        task.estado = "Cancelado";

        return fetch(`http://localhost:8000/tasks/${reportId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task)
        });
    })
    .then(response => {
        if (!response.ok) throw new Error("Error al cancelar el reporte");
        return response.json();
    })
    .then(() => {
        activeReportId = null; 
        loadReports();
        switchSection("home");
    })
    .catch(error => console.error("Error:", error));
}

function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
        });
    });
}