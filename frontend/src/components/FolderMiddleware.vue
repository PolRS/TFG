<template>
  <FolderPage
    :user="user"
    :carpeta="carpeta"
    :documents="documents"
    :selectedDocuments="selectedDocuments"
    :savedSummaries="savedSummaries"
    :activeSummary="activeSummary"
    :savedDiagrams="savedDiagrams"
    :activeDiagram="activeDiagram"
    @logout="$emit('logout')"
    @tancaCarpeta="$emit('tancaCarpeta')"
    @uploadFile="handleUploadFile"
    @eliminaDocument="handleEliminaDocument"
    @toggleDocumentSelection="handleToggleDocumentSelection"
    @generateSummary="handleGenerateSummary"
    @closeSummary="activeSummary = null"
    @openSummary="activeSummary = $event"
    @deleteSummary="handleDeleteSummary"
    @generateDiagram="handleGenerateDiagram"
    @closeDiagram="activeDiagram = null"
    @openDiagram="activeDiagram = $event"
    @deleteDiagram="handleDeleteDiagram"
    :fetchDocumentContent="handleGetDocumentContent"
    
    :savedTests="savedTests"
    @closeTest="activeTest = null"
    @deleteTest="handleDeleteTest"

    :savedReports="savedReports"
    :activeReport="activeReport"
    @generateReport="handleGenerateReport"
    @openReport="activeReport = $event"
    @closeReport="activeReport = null"
    @deleteReport="handleDeleteReport"
  />
</template>

<script>
import api from "@/api.js";
import FolderPage from "@/base_components/FolderPage.vue";

export default {
  name: "FolderMiddleware",
  components: { FolderPage },
  props: {
    user: { type: Object, required: true },
    carpeta: { type: Object, required: true }
  },
  data() {
    return {
      documents: [],
      selectedDocuments: [],
      savedSummaries: [], // Array de { id, text, date }
      activeSummary: null, // Resum actualment obert
      savedDiagrams: [], // Array de { id, code, date }
      activeDiagram: null, // Diagrama actualment obert
      savedTests: [],
      activeTest: null,
      savedReports: [],
      activeReport: null,
      isLoading: false
    };
  },
  async created() {
    await this.fetchDocuments();
  },
  methods: {
    async fetchDocuments() {
      if (!this.carpeta) return;
      try {
        const resDocs = await api.get(`/carpeta/${this.carpeta.id}`);
        this.documents = resDocs.data.documents;

        const resResults = await api.get(`/carpeta/${this.carpeta.id}/resultats`);
        const results = resResults.data.results;

        this.savedSummaries = results.filter(r => r.tipus === 'resum').map(r => ({
          id: r.id,
          date: r.date,
          text: r.contingut
        }));

        this.savedDiagrams = results.filter(r => r.tipus === 'diagrama').map(r => ({
          id: r.id,
          date: r.date,
          code: r.contingut
        }));
        
        this.savedTests = results.filter(r => r.tipus === 'test').map(r => ({
          id: r.id,
          date: r.date,
          questions: JSON.parse(r.contingut) // Parse JSON string
        }));

        this.savedReports = results.filter(r => r.tipus === 'informe').map(r => ({
          id: r.id,
          date: r.date,
          text: r.contingut
        }));

      } catch (err) {
        console.error("Error carregant dades carpeta:", err);
      }
    },

    async handleUploadFile(event) {
      const fitxer = event.target.files[0];
      if (!fitxer) return;

      const formData = new FormData();
      formData.append("fitxer", fitxer);

      try {
        const res = await api.post(`/carpeta/${this.carpeta.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        this.documents.unshift(res.data.document);
      } catch (err) {
        console.error("Error pujant document:", err);
      }
    },

    async handleEliminaDocument(documentId) {
      if (!confirm("Segur que vols eliminar aquest document?")) return;

      try {
        await api.delete(`/carpeta/${this.carpeta.id}/${documentId}`);
        this.documents = this.documents.filter(d => d.id !== documentId);
        // Also remove from selection if present
        this.selectedDocuments = this.selectedDocuments.filter(d => d.id !== documentId);
      } catch (err) {
        console.error("Error eliminant document:", err);
      }
    },

    handleToggleDocumentSelection(doc) {
      const index = this.selectedDocuments.findIndex(d => d.id === doc.id);
      if (index >= 0) {
        this.selectedDocuments.splice(index, 1);
      } else {
        this.selectedDocuments.push(doc);
      }
    },

    async handleGenerateSummary(documentIds) {
      try {
        const res = await api.post(`/carpeta/${this.carpeta.id}/resum`, { documentIds });
        
        const newSummary = {
          id: res.data.result.id,
          text: res.data.result.contingut,
          date: res.data.result.date
        };
        
        this.savedSummaries.unshift(newSummary);
        // this.activeSummary = newSummary; // Don't auto-open
        
      } catch (err) {
        console.error("Error generant resum:", err);
        alert("Error generant el resum. Comprova la consola.");
      }
    },

    async handleDeleteSummary(summaryId) {
      if (!confirm("Segur que vols eliminar aquest resum?")) return;

      try {
        await api.delete(`/carpeta/${this.carpeta.id}/resultats/${summaryId}`);
        this.savedSummaries = this.savedSummaries.filter(s => s.id !== summaryId);
        if (this.activeSummary && this.activeSummary.id === summaryId) {
          this.activeSummary = null;
        }
      } catch (err) {
        console.error("Error eliminant resum:", err);
      }
    },

    async handleGenerateDiagram(documentIds) {
      this.isLoading = true;
      try {
        const res = await api.post(`/carpeta/${this.carpeta.id}/diagrama`, { documentIds });
        
        const newDiagram = {
          id: res.data.result.id,
          code: res.data.result.contingut,
          date: res.data.result.date
        };
        
        this.savedDiagrams.unshift(newDiagram);
      } catch (err) {
        console.error("Error generant diagrama:", err);
        alert("Error generant el diagrama.");
      } finally {
        this.isLoading = false;
      }
    },

    async handleDeleteDiagram(diagramId) {
      if (!confirm("Segur que vols eliminar aquest diagrama?")) return;

      try {
        await api.delete(`/carpeta/${this.carpeta.id}/resultats/${diagramId}`);
        this.savedDiagrams = this.savedDiagrams.filter(s => s.id !== diagramId);
        if (this.activeDiagram && this.activeDiagram.id === diagramId) {
          this.activeDiagram = null;
        }
      } catch (err) {
        console.error("Error eliminant diagrama:", err);
      }
    },

    async handleGetDocumentContent(documentId) {
      try {
        const res = await api.get(`/carpeta/${this.carpeta.id}/${documentId}`);
        return res.data.document;
      } catch (err) {
        console.error("Error recuperant contingut document:", err);
        return null;
      }
    },

    async handleGenerateTest(documentIds) {
      this.isLoading = true;
      try {
        const res = await api.post(`/carpeta/${this.carpeta.id}/test`, { documentIds });
        const newTest = {
          id: res.data.result.id,
          date: res.data.result.date,
          questions: JSON.parse(res.data.result.contingut)
        };
        this.savedTests.unshift(newTest);
        // this.activeTest = newTest; // Don't auto-open
      } catch (err) {
        console.error("Error generant test:", err);
        alert("Error generant el test via IA.");
      } finally {
        this.isLoading = false;
      }
    },

    async handleDeleteTest(testId) {
      if (!confirm("Segur que vols eliminar aquest test?")) return;
      try {
        await api.delete(`/carpeta/${this.carpeta.id}/resultats/${testId}`);
        this.savedTests = this.savedTests.filter(t => t.id !== testId);
        if (this.activeTest && this.activeTest.id === testId) {
          this.activeTest = null;
        }
      } catch (err) {
        console.error("Error eliminant test:", err);
      }
    },

    async handleGenerateReport(documentIds) {
      this.isLoading = true;
      try {
        const res = await api.post(`/carpeta/${this.carpeta.id}/informe`, { documentIds });
        const newReport = {
          id: res.data.result.id,
          text: res.data.result.contingut,
          date: res.data.result.date
        };
        this.savedReports.unshift(newReport);
      } catch (err) {
        console.error("Error generant informe:", err);
        alert("Error generant l'informe via IA.");
      } finally {
        this.isLoading = false;
      }
    },

    async handleDeleteReport(reportId) {
      if (!confirm("Segur que vols eliminar aquest informe?")) return;
      try {
        await api.delete(`/carpeta/${this.carpeta.id}/resultats/${reportId}`);
        this.savedReports = this.savedReports.filter(r => r.id !== reportId);
        if (this.activeReport && this.activeReport.id === reportId) {
          this.activeReport = null;
        }
      } catch (err) {
        console.error("Error eliminant informe:", err);
      }
    }
  }
};
</script>
