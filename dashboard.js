import { dbInstance } from './services/db.js';
import { RenderHeader } from './components/header.js';
import { RenderSidebar } from './components/sidebar.js';
import { RenderFooter } from './components/footer.js';

// Page Views - Ensure paths and filenames match perfectly
import { LoadDashboardHome } from './pages/dashboardHome.js';
import { LoadPatientsView } from './pages/patients.js';
import { LoadPatientProfile } from './pages/patientProfile.js'; // <-- Verify this file exists!
import { LoadReportEngine } from './pages/reports.js';
import { LoadPrintPreview } from './pages/printPreview.js';

class AppController {
  constructor() {
    // CRITICAL: The key string names must precisely match what you pass to router.route()
    this.modules = {
      dashboard: LoadDashboardHome,
      patients: LoadPatientsView,
      patientProfile: LoadPatientProfile, // <-- MUST be camelCase exactly like this
      reports: LoadReportEngine,
      printPreview: LoadPrintPreview
    };
  }

  async bootstrap() {
    await dbInstance.init();
    
    RenderHeader(document.getElementById('app-header'));
    RenderSidebar(document.getElementById('app-sidebar'), (targetView) => this.route(targetView));
    RenderFooter(document.getElementById('app-footer'));
    
    this.route('dashboard');
  }

  async route(viewName, ContextParameters = {}) {
    const mainCanvas = document.getElementById('app-content');
    mainCanvas.innerHTML = ''; 
    
    if (this.modules[viewName]) {
      await this.modules[viewName](mainCanvas, ContextParameters, this);
    } else {
      // This is what triggered on your screen!
      mainCanvas.innerHTML = `<h2 style="padding:20px; color:var(--danger);">Module "${viewName}" is under active development.</h2>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const SystemInstance = new AppController();
  SystemInstance.bootstrap();
});