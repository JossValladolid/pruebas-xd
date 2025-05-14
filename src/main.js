// Variables globales
let activeSection = "home";
let activeReportId = null;

// Funciones de utilidad
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('es-ES', options);
}

function generateReportId() {
    return 'REP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Listeners de eventos cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicialización de elementos
    loadReports();
    setupNavigationEvents();
    setupModalEvents();
    setupFormEvents();
    setupAccordion();
    
    // Verificar si hay un hash en la URL para navegación directa
    if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        switchSection(sectionId);
    }
});

// Gestión de la navegación
function setupNavigationEvents() {
    // Toggle del menú lateral
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            switchSection(sectionId);
            
            // Cerrar menú en móvil después de clic
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
            
            // Actualizar URL con hash
            window.location.hash = sectionId;
        });
    });

    // Botón de ayuda
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
    // Desactivar sección actual
    document.querySelector('.section.active-section').classList.remove('active-section');
    
    // Activar nueva sección
    document.getElementById(sectionId).classList.add('active-section');
    
    // Actualizar enlaces activos
    document.querySelector('.nav-menu a.active').classList.remove('active');
    document.querySelector(`.nav-menu a[href="#${sectionId}"]`).classList.add('active');
    
    // Actualizar sección activa
    activeSection = sectionId;
}

// Gestión de modales
function setupModalEvents() {
    // Modal de reportes
    const panicButton = document.getElementById('panic-button');
    const reportModal = document.getElementById('report-modal');
    const closeModal = document.querySelector('.close-modal');
    
    panicButton.addEventListener('click', function() {
        reportModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', function() {
        reportModal.style.display = 'none';
    });
    
    // Modal de cancelación
    const cancelConfirmationModal = document.getElementById('cancel-confirmation-modal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const abortCancel = document.getElementById('abort-cancel');
    
    confirmCancel.addEventListener('click', function() {
        if (activeReportId) {
            cancelReport(activeReportId);
        }
        cancelConfirmationModal.style.display = 'none';
    });
    
    abortCancel.addEventListener('click', function() {
        cancelConfirmationModal.style.display = 'none';
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === reportModal) {
            reportModal.style.display = 'none';
        }
        if (e.target === cancelConfirmationModal) {
            cancelConfirmationModal.style.display = 'none';
        }
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
}

// Gestión de formularios
function setupFormEvents() {
    // Formulario de reporte
    const reportForm = document.getElementById('reportForm');
    
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const codigoEstudiante = document.getElementById('codigoEstudiante').value;
        const nombre = document.getElementById('nombre').value;
        const descripcion = document.getElementById('descripcion').value;
        
        // Validación
        let isValid = true;
        
        if (!codigoEstudiante) {
            document.getElementById('errorCodigo').textContent = 'El código de estudiante es obligatorio';
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
            submitReport(codigoEstudiante, nombre, descripcion);
        }
    });
    
    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envío exitoso
            document.getElementById('contactExito').textContent = 'Mensaje enviado con éxito';
            contactForm.reset();
            
            // Limpiar mensaje después de 3 segundos
            setTimeout(function() {
                document.getElementById('contactExito').textContent = '';
            }, 3000);
        });
    }
}

// Gestión de reportes
function submitReport(codigoEstudiante, nombre, descripcion) {
    // Crear objeto de reporte
    const report = {
        id: generateReportId(),
        codigoEstudiante: codigoEstudiante,
        nombre: nombre || 'Anónimo',
        descripcion: descripcion,
        fecha: new Date(),
        estado: 'Pendiente'
    };
    
    // Obtener reportes existentes
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    
    // Añadir nuevo reporte
    reports.push(report);
    
    // Guardar en localStorage
    localStorage.setItem('reports', JSON.stringify(reports));
    
    // Mostrar mensaje de éxito
    document.getElementById('exitoEnvio').textContent = 'Reporte enviado con éxito';
    
    // Limpiar formulario
    document.getElementById('reportForm').reset();
    
    // Recargar lista de reportes
    loadReports();
    
    // Cerrar modal después de 2 segundos
    setTimeout(function() {
        document.getElementById('report-modal').style.display = 'none';
        document.getElementById('exitoEnvio').textContent = '';
    }, 2000);
}

function loadReports() {
    const reportsContainer = document.getElementById('reports-list');
    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    
    // Ordenar reportes por fecha (más reciente primero)
    reports.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Limpiar contenedor
    reportsContainer.innerHTML = '';
    
    if (reports.length === 0) {
        reportsContainer.innerHTML = '<p>No hay reportes pendientes</p>';
        return;
    }
    
    // Mostrar reportes
    reports.forEach(report => {
        const reportElement = document.createElement('div');
        reportElement.className = 'report-item';
        reportElement.innerHTML = `
            <div class="report-header">
                <span class="report-id">${report.id}</span>
                <span class="report-date-time">${formatDate(report.fecha)}</span>
            </div>
            <div class="report-description">${report.descripcion}</div>
            <div class="report-status">Estado: ${report.estado}</div>
            <div class="report-actions">
                <button class="action-button form-button" data-id="${report.id}">Formulario</button>
                <button class="action-button cancel-button" data-id="${report.id}">Cancelar Reporte</button>
            </div>
        `;
        
        reportsContainer.appendChild(reportElement);
    });
    
    // Añadir eventos a los botones
    const formButtons = document.querySelectorAll('.form-button');
    const cancelButtons = document.querySelectorAll('.cancel-button');
    
    formButtons.forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            editReport(reportId);
        });
    });
    
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            confirmCancelReport(reportId);
        });
    });
}

function editReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
        // Llenar formulario con datos del reporte
        document.getElementById('codigoEstudiante').value = report.codigoEstudiante;
        document.getElementById('nombre').value = report.nombre !== 'Anónimo' ? report.nombre : '';
        document.getElementById('descripcion').value = report.descripcion;
        
        // Guardar ID de reporte activo para actualización
        activeReportId = reportId;
        
        // Mostrar modal
        document.getElementById('report-modal').style.display = 'block';
    }
}

function confirmCancelReport(reportId) {
    activeReportId = reportId;
    document.getElementById('cancel-confirmation-modal').style.display = 'block';
}

function cancelReport(reportId) {
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    
    // Encontrar índice del reporte
    const index = reports.findIndex(r => r.id === reportId);
    
    if (index !== -1) {
        // Actualizar estado a cancelado
        reports[index].estado = 'Cancelado';
        
        // Guardar cambios
        localStorage.setItem('reports', JSON.stringify(reports));
        
        // Recargar reportes
        loadReports();
    }
}

// Funcionalidad del acordeón para preguntas frecuentes
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Toggle clase activa
            this.classList.toggle('active');
            
            // Toggle contenido del acordeón
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}