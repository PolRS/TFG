<template>
  <div class="folder">

    <!-- TOPBAR -->
    <header class="topbar">
      <div class="user-info">
        <img :src="user.avatar_url" alt="Profile" class="avatar" />
        <span>{{ user.nom }}</span>
      </div>

      <div class="topbar-actions">
        <button class="back-btn" @click="$emit('tancaCarpeta')">← Enrere</button>
        <button class="logout" @click="$emit('logout')">Tanca sessió</button>
      </div>
    </header>

    <!-- COS PRINCIPAL -->
    <div class="folder-view">
      <aside class="sidebar">
        <h2>{{ carpeta.nom }}</h2>

        <h3>Documents</h3>
        
        <!-- DOCUMENT LIST (shown if no preview) -->
        <ul v-if="!previewDoc && !isLoadingPreview" class="doc-list">
          <li
            v-for="doc in documents"
            :key="doc.id"
            class="document-item"
            :class="{ selected: selectedDocuments.some(d => d.id === doc.id) }"
          >
            <label class="doc-label">
              <input 
                type="checkbox" 
                :checked="selectedDocuments.some(d => d.id === doc.id)"
                @change="$emit('toggleDocumentSelection', doc)"
              />
              <!-- Click name to preview -->
              <span class="doc-name" @click.prevent="openDocumentPreview(doc)" title="Veure contingut">{{ doc.nom }}</span>
            </label>
            <button class="delete-btn" @click.stop="$emit('eliminaDocument', doc.id)">
              🗑️
            </button>
          </li>
        </ul>

        <!-- LOADING INDICATOR -->
        <div v-if="isLoadingPreview" class="loading-preview">
          Carregant document...
        </div>

        <!-- DOCUMENT PREVIEW PANEL -->
        <div v-if="previewDoc" class="preview-panel">
          <div class="preview-header">
            <button class="back-link" @click="closeDocumentPreview">← Tornar</button>
            <h4 :title="previewDoc.nom">{{ previewDoc.nom }}</h4>
          </div>
          <div class="preview-body">
             <pre>{{ previewDoc.content_text }}</pre>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          style="display:none"
          @change="$emit('uploadFile', $event)"
        />
        <button class="add-btn" @click="$refs.fileInput.click()">
          + Pujar document
        </button>
      </aside>

      <main class="chat-panel">
        <div v-if="selectedDocuments.length === 0" class="chat-placeholder">
          <h3>Xat</h3>
          <p>Selecciona un o més documents per començar el Xat</p>
        </div>
        <DocumentChat
          v-else
          :carpeta-id="carpeta.id"
          :document-ids="selectedDocuments.map(d => d.id)"
          :document-titles="selectedDocuments.map(d => d.nom)"
        />
      </main>

      <aside class="options-panel">
        <h3>Eines</h3>
        <div class="tools-grid">
          <button class="tool-btn" @click="requestSummary">
            📄 Generar Resum
          </button>
          <button class="tool-btn" @click="requestDiagram">
            📊 Generar Diagrama
          </button>
          <button class="tool-btn" @click="requestTest">
             🧠 Generar Test
          </button>
          <button class="tool-btn" @click="requestReport">
             📋 Generar Informe
          </button>
        </div>

        <div class="results-section">
          <h3>Resultats Guardats</h3>
          
          <div v-if="savedSummaries.length === 0 && savedDiagrams.length === 0 && savedTests.length === 0 && savedReports.length === 0" class="no-results">
            Cap resultat guardat.
          </div>

          <ul class="results-list">
             <!-- Summaries -->
             <li 
                v-for="summary in savedSummaries" 
                :key="'s-'+summary.id"
                @click="$emit('openSummary', summary)"
                class="result-item"
              >
                <span class="result-icon">📄</span>
                <span class="result-info">
                   <span class="result-title">Resum</span>
                   <div class="result-meta">
                     <span class="result-date">{{ summary.date }}</span>
                     <span v-if="summary.fonts && summary.fonts.length > 0" class="result-fonts"> • {{ summary.fonts.join(', ') }}</span>
                   </div>
                </span>
                <button class="remove-btn" @click.stop="$emit('deleteSummary', summary.id)">🗑️</button>
             </li>
 
             <!-- Diagrams -->
             <li 
                v-for="diagram in savedDiagrams" 
                :key="'d-'+diagram.id"
                @click="$emit('openDiagram', diagram)"
                class="result-item"
              >
                <span class="result-icon">📊</span>
                <span class="result-info">
                   <span class="result-title">Diagrama</span>
                   <div class="result-meta">
                     <span class="result-date">{{ diagram.date }}</span>
                     <span v-if="diagram.fonts && diagram.fonts.length > 0" class="result-fonts"> • {{ diagram.fonts.join(', ') }}</span>
                   </div>
                </span>
                <button class="remove-btn" @click.stop="$emit('deleteDiagram', diagram.id)">🗑️</button>
             </li>

             <!-- Tests -->
             <li 
                v-for="test in savedTests" 
                :key="'t-'+test.id"
                @click="$emit('openTest', test)"
                class="result-item"
              >
                <span class="result-icon">🧠</span>
                <span class="result-info">
                   <span class="result-title">Test</span>
                   <div class="result-meta">
                     <span class="result-date">{{ test.date }}</span>
                     <span v-if="test.fonts && test.fonts.length > 0" class="result-fonts"> • {{ test.fonts.join(', ') }}</span>
                   </div>
                </span>
                <button class="remove-btn" @click.stop="$emit('deleteTest', test.id)">🗑️</button>
             </li>

             <!-- Reports -->
             <li 
                v-for="report in savedReports" 
                :key="'r-'+report.id"
                @click="$emit('openReport', report)"
                class="result-item"
              >
                <span class="result-icon">📋</span>
                <span class="result-info">
                   <span class="result-title">Informe</span>
                   <div class="result-meta">
                     <span class="result-date">{{ report.date }}</span>
                     <span v-if="report.fonts && report.fonts.length > 0" class="result-fonts"> • {{ report.fonts.join(', ') }}</span>
                   </div>
                </span>
                <button class="remove-btn" @click.stop="$emit('deleteReport', report.id)">🗑️</button>
             </li>
          </ul>
        </div>
        
        <!-- EMBEDDED PANELS (Only one valid at a time ideally, or stacked) -->
        
        <!-- Summary Panel -->
        <div v-if="activeSummary" class="summary-panel-embedded">
          <div class="summary-header">
            <h4>Resum ({{ activeSummary.date }})</h4>
            <div class="header-actions">
              <button class="icon-btn" @click="isSummaryFullscreen = true" title="Ampliar">⤢</button>
              <button class="close-btn" @click="$emit('closeSummary')">✖</button>
            </div>
          </div>
          <div class="summary-content">
            <div v-if="activeSummary.fonts && activeSummary.fonts.length > 0" class="source-attribution">
              <strong>Fonts:</strong> {{ activeSummary.fonts.join(', ') }}
            </div>
            <pre>{{ activeSummary.text }}</pre>
          </div>
          <div class="summary-actions">
            <button class="download-btn-small" @click="downloadSummary">📥 Descarregar</button>
          </div>
        </div>

        <!-- Diagram Panel -->
        <div v-if="activeDiagram" class="summary-panel-embedded">
          <div class="summary-header">
            <h4 v-if="activeDiagram">Diagrama ({{ activeDiagram.date }})</h4>
            <div class="header-actions">
              <button class="icon-btn" @click="isDiagramFullscreen = true" title="Ampliar">⤢</button>
              <button class="close-btn" @click="$emit('closeDiagram')">✖</button>
            </div>
          </div>
          <div v-if="activeDiagram.fonts && activeDiagram.fonts.length > 0" class="source-attribution sidebar-source">
            <strong>Fonts:</strong> {{ activeDiagram.fonts.join(', ') }}
          </div>
          <div class="summary-content diagram-content" ref="diagramContainer">
             <div v-if="isRendering" class="diagram-status">
               <span class="spinner-small"></span> Renderitzant diagrama...
             </div>
             <div v-if="renderingError" class="diagram-status error">
               <p><strong>⚠️ Error:</strong> {{ renderingError }}</p>
               <button @click="renderMermaid(activeDiagram?.code)" class="retry-link">Reintentar</button>
             </div>
             
             <!-- Diagram output -->
             <div 
               v-show="!isRendering && renderedDiagram"
               class="mermaid-viewer" 
               v-html="renderedDiagram"
               :key="activeDiagram?.id"
             ></div>

             <div v-if="!isRendering && !renderedDiagram && !renderingError" class="diagram-status">
                Selecciona un diagrama per visualitzar-lo.
             </div>
          </div>
          <div class="summary-actions">
            <button class="download-btn-small" @click="downloadDiagram('svg')">📥 SVG</button>
            <button class="download-btn-small" @click="downloadDiagram('mmd')" style="margin-top:4px">📥 Codi</button>
          </div>
        </div>

        <!-- Test Panel -->
        <div v-if="activeTest" class="summary-panel-embedded">
            <div class="summary-header">
              <h4>Test ({{ activeTest.date }})</h4>
              <div class="header-actions">
                <button class="icon-btn" @click="isTestFullscreen = true" title="Ampliar">⤢</button>
                <button class="close-btn" @click="$emit('closeTest')">✖</button>
              </div>
            </div>
            <div v-if="activeTest.fonts && activeTest.fonts.length > 0" class="source-attribution sidebar-source">
              <strong>Fonts:</strong> {{ activeTest.fonts.join(', ') }}
            </div>
            <div class="summary-content test-content">
              <div v-for="(q, qIndex) in activeTest.questions" :key="qIndex" class="question-block">
                <p class="question-text"><strong>{{ qIndex + 1 }}. {{ q.question }}</strong></p>
                <div class="options-list">
                  <button 
                    v-for="(opt, optIndex) in q.options" 
                    :key="optIndex"
                    class="option-btn"
                    :class="getOptionClass(q, qIndex, optIndex)"
                    @click="selectOption(qIndex, optIndex)"
                    :disabled="testAnswers[qIndex] !== undefined"
                  >
                   {{ ["A","B","C","D"][optIndex] }}. {{ opt }}
                  </button>
                </div>
              </div>
            </div>
          </div>

        <!-- Report Panel -->
        <div v-if="activeReport" class="summary-panel-embedded">
          <div class="summary-header">
            <h4>Informe ({{ activeReport.date }})</h4>
            <div class="header-actions">
              <button class="icon-btn" @click="isReportFullscreen = true" title="Ampliar">⤢</button>
              <button class="close-btn" @click="$emit('closeReport')">✖</button>
            </div>
          </div>
          <div class="summary-content">
            <div v-if="activeReport.fonts && activeReport.fonts.length > 0" class="source-attribution">
              <strong>Fonts:</strong> {{ activeReport.fonts.join(', ') }}
            </div>
            <pre>{{ activeReport.text }}</pre>
          </div>
          <div class="summary-actions">
            <button class="download-btn-small" @click="downloadReport">📥 Descarregar</button>
          </div>
        </div>

      </aside>
    </div>

    <!-- Fullscreen Diagram Modal -->
    <div v-if="activeDiagram && isDiagramFullscreen" class="fullscreen-modal" @click.self="isDiagramFullscreen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Diagrama ({{ activeDiagram.date }})</h3>
          <button class="close-btn-large" @click="isDiagramFullscreen = false">✖ Tancar</button>
        </div>
        <div class="modal-body" 
             @wheel="handleWheel"
             @mousedown="startDrag"
             @mousemove="onDrag"
             @mouseup="endDrag"
             @mouseleave="endDrag">
           <div 
             class="mermaid-large" 
             :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoomScale})` }"
             v-html="renderedDiagram"
           ></div>
        </div>
        <div class="modal-footer">
            <button class="download-btn" @click="downloadDiagram('svg')">📥 Descarregar SVG</button>
        </div>
      </div>
    </div>

    <!-- Fullscreen Summary Modal -->
    <div v-if="activeSummary && isSummaryFullscreen" class="fullscreen-modal" @click.self="isSummaryFullscreen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Resum ({{ activeSummary.date }})</h3>
          <button class="close-btn-large" @click="isSummaryFullscreen = false">✖ Tancar</button>
        </div>
        <div class="modal-body">
          <div class="modal-text-content">
             <pre>{{ activeSummary.text }}</pre>
          </div>
        </div>
        <div class="modal-footer">
            <button class="download-btn" @click="downloadSummary">📥 Descarregar Resum</button>
        </div>
      </div>
    </div>

    <!-- Fullscreen Test Modal -->
    <div v-if="activeTest && isTestFullscreen" class="fullscreen-modal" @click.self="isTestFullscreen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Test ({{ activeTest.date }})</h3>
          <button class="close-btn-large" @click="isTestFullscreen = false">✖ Tancar</button>
        </div>
        <div class="modal-body">
          <div class="modal-text-content test-content">
            <div v-for="(q, qIndex) in activeTest.questions" :key="qIndex" class="question-block">
              <p class="question-text"><strong>{{ qIndex + 1 }}. {{ q.question }}</strong></p>
              <div class="options-list">
                <button 
                  v-for="(opt, optIndex) in q.options" 
                  :key="optIndex"
                  class="option-btn"
                  :class="getOptionClass(q, qIndex, optIndex)"
                  @click="selectOption(qIndex, optIndex)"
                  :disabled="testAnswers[qIndex] !== undefined"
                >
                 {{ ["A","B","C","D"][optIndex] }}. {{ opt }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
            <button class="close-btn-large" @click="isTestFullscreen = false">Tancar</button>
        </div>
      </div>
    </div>

    <!-- Fullscreen Report Modal -->
    <div v-if="activeReport && isReportFullscreen" class="fullscreen-modal" @click.self="isReportFullscreen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Informe ({{ activeReport.date }})</h3>
          <button class="close-btn-large" @click="isReportFullscreen = false">✖ Tancar</button>
        </div>
        <div class="modal-body">
          <div class="modal-text-content">
             <pre>{{ activeReport.text }}</pre>
          </div>
        </div>
        <div class="modal-footer">
            <button class="download-btn" @click="downloadReport">📥 Descarregar Informe</button>
        </div>
      </div>
    </div>

    <!-- Summary Modal / Panel moved inside sidebar structure -->
    <!-- (Removed from here) -->

    <!-- Hidden container for Mermaid rendering -->
    <div id="mermaid-render-container" style="position: fixed; top: -1000px; left: -1000px; visibility: hidden; pointer-events: none;"></div>

  </div>
</template>

<script>
import DocumentChatMiddleware from "@/components/DocumentChatMiddleware.vue"
import mermaid from "mermaid";

// Note: initialization moved inside the component for better control if needed, 
// but we keep this as a default.
// Note: Mermaid v10+ initialization
mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit'
});
export default {
  name: "FolderPage",
  components: {
    DocumentChat: DocumentChatMiddleware
  },
  props: {
    user: { type: Object, required: true },
    carpeta: { type: Object, required: true },
    documents: { type: Array, required: true },

    selectedDocuments: { type: Array, required: false, default: () => [] },
    savedSummaries: { type: Array, required: false, default: () => [] },
    activeSummary: { type: Object, required: false, default: null },
    savedDiagrams: { type: Array, required: false, default: () => [] },
    activeDiagram: { type: Object, required: false, default: null },
    fetchDocumentContent: { type: Function, required: true },
    savedTests: { type: Array, required: false, default: () => [] },
    activeTest: { type: Object, required: false, default: null },
    savedReports: { type: Array, required: false, default: () => [] },
    activeReport: { type: Object, required: false, default: null }
  },

  data() {
    return {
      renderedDiagram: "",
      isRendering: false,
      renderingError: null,
      isDiagramFullscreen: false,
      zoomScale: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
      
      // Preview logic
      previewDoc: null,
      isLoadingPreview: false,
      
      // Test Logic
      testAnswers: {}, // map questionIndex -> optionIndex

      // Fullscreen logic
      isSummaryFullscreen: false,
      isTestFullscreen: false,
      isReportFullscreen: false
    };
  },
  mounted() {
    // Ensure mermaid is initialized correctly on the client side
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit'
      });
      console.log("FolderPage: Mermaid initialized in mounted()");
    } catch (e) {
      console.error("FolderPage: Mermaid init error", e);
    }
  },
  watch: {
    activeDiagram: {
      immediate: true,
      handler(newVal) {
        console.log("FolderPage Watch: activeDiagram changed", newVal ? newVal.id : 'null');
        if (newVal) {
          // Reset before rendering
          this.renderedDiagram = "";
          this.isRendering = true;
          this.$nextTick(() => {
            this.renderMermaid(newVal.code);
          });
        } else {
          this.renderedDiagram = "";
          this.isRendering = false;
        }
      }
    },
    activeTest(newVal) {
      if (newVal) {
        this.resetTest();
      }
    }
  },
  methods: {
    requestSummary() {
      if (this.selectedDocuments.length === 0) {
        alert("Selecciona almenys un document per generar un resum.");
        return;
      }
      this.$emit('generateSummary', this.selectedDocuments.map(d => d.id));
    },
    requestDiagram() {
      if (this.selectedDocuments.length === 0) {
        alert("Selecciona almenys un document per generar un diagrama.");
        return;
      }
      this.$emit('generateDiagram', this.selectedDocuments.map(d => d.id));
    },
    /**
     * Downloads the current summary as a text file.
     */
    downloadSummary() {
      if (!this.activeSummary) return;
      const blob = new Blob([this.activeSummary.text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resum_${this.carpeta.nom}_${this.activeSummary.date.replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    async renderMermaid(code) {
      if (!code) {
        this.renderedDiagram = "";
        this.isRendering = false;
        return;
      }

      console.log("FolderPage: Starting renderMermaid...");
      this.isRendering = true;
      this.renderingError = null;
      // Keep old diagram while rendering to avoid white flashes, 
      // but if it's been problematic, clearing it is safer for debugging.
      this.renderedDiagram = ""; 

      try {
        // ID must start with a letter for Mermaid
        const id = 'mermaid_svg_' + Math.random().toString(36).substring(2, 10);
        
        // We need an element in the DOM for Mermaid to work reliably in some versions
        let container = document.getElementById('mermaid-render-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'mermaid-render-container';
          container.style.display = 'none';
          document.body.appendChild(container);
        }

        console.log("FolderPage: Calling mermaid.render with", id);
        
        // Mermaid v10+ render returns { svg, bindFunctions }
        const { svg } = await mermaid.render(id, code, container);

        if (!svg) throw new Error("Resultat buit de Mermaid");

        console.log("FolderPage: Render success. Length:", svg.length);

        // Responsive SVG: Remove fixed width/height and add style
        // We do it more carefully to not break the XML
        let cleanSvg = svg;
        const svgTagMatch = cleanSvg.match(/<svg[^>]*>/);
        if (svgTagMatch) {
          let svgTag = svgTagMatch[0];
          const newSvgTag = svgTag
            .replace(/\s(width|height|style)=["'][^"']*["']/g, '')
            .replace(/<svg/, '<svg style="max-width:100%; height:auto; display:block; margin:0 auto;"');
          cleanSvg = cleanSvg.replace(svgTag, newSvgTag);
        }

        this.renderedDiagram = cleanSvg;
        this.zoomScale = 1;
        this.panX = 0;
        this.panY = 0;

      } catch (err) {
        console.error("FolderPage: Mermaid Render Error:", err);
        this.renderingError = "Error al renderitzar: " + (err.message || "format no vàlid");
      } finally {
        this.isRendering = false;
      }
    },
    downloadDiagram(format) {
      if (!this.activeDiagram) return;
      let content, type, ext;
      if (format === 'svg') {
        content = this.renderedDiagram;
        type = "image/svg+xml";
        ext = "svg";
      } else {
        content = this.activeDiagram.code;
        type = "text/plain";
        ext = "mmd";
      }
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diagrama_${this.carpeta.nom}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    // --- Pan & Zoom Logic ---
    // Handles mouse wheel to zoom in/out of the diagram
    handleWheel(e) {
      e.preventDefault();
      const scaleAmount = 0.1;
      if (e.deltaY < 0) {
        this.zoomScale += scaleAmount;
      } else {
        this.zoomScale = Math.max(0.1, this.zoomScale - scaleAmount);
      }
    },
    startDrag(e) {
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      document.body.style.cursor = 'grabbing';
    },
    onDrag(e) {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
    },
    endDrag() {
      this.isDragging = false;
      document.body.style.cursor = 'default';
    },

    async openDocumentPreview(doc) {
      this.isLoadingPreview = true;
      this.previewDoc = null; // Reset prev

      try {
        const fullDoc = await this.fetchDocumentContent(doc.id);
        if (fullDoc) {
          this.previewDoc = fullDoc;
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.isLoadingPreview = false;
      }
    },
    
    closeDocumentPreview() {
      this.previewDoc = null;
    },
    
    requestTest() {
      if (this.selectedDocuments.length === 0) {
        alert("Selecciona almenys un document per generar un test.");
        return;
      }
      this.$emit('generateTest', this.selectedDocuments.map(d => d.id));
    },
    requestReport() {
      if (this.selectedDocuments.length === 0) {
        alert("Selecciona almenys un document per generar un informe.");
        return;
      }
      this.$emit('generateReport', this.selectedDocuments.map(d => d.id));
    },
    /**
     * Downloads the current report as a text file.
     */
    downloadReport() {
      if (!this.activeReport) return;
      const blob = new Blob([this.activeReport.text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `informe_${this.carpeta.nom}_${this.activeReport.date.replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    selectOption(questionIndex, optionIndex) {
      // Use Vue.set or spread to ensure reactivity if needed, but in basic Vue 3 reactivity proxy works.
      // In Vue 2: this.$set(this.testAnswers, questionIndex, optionIndex);
      // In Vue 3:
      this.testAnswers[questionIndex] = optionIndex;
    },
    getOptionClass(question, qIndex, optIndex) {
      // If not answered, default
      if (this.testAnswers[qIndex] === undefined) return '';
      
      const isSelected = this.testAnswers[qIndex] === optIndex;
      const isCorrect = question.correctAnswer === optIndex;
      
      if (isCorrect) return 'correct-option';
      if (isSelected && !isCorrect) return 'incorrect-option';
      return '';
    },
    resetTest() {
      this.testAnswers = {};
    }
  },

};
</script>

<style scoped>
.folder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-color);
}

/* TOPBAR */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.back-btn {
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.back-btn:hover {
  background-color: #4b5563;
}

.folder-view {
  display: grid;
  grid-template-columns: 3fr 3fr 4fr; /* 30% 30% 40% using fraction units */
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar h2 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.sidebar h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-top: 1rem;
}

.doc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

/* Document Preview Styles */
.loading-preview {
  color: #64748b;
  font-style: italic;
  padding: 1rem 0;
  text-align: center;
}

.preview-panel {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.preview-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #edf2f7;
}

.preview-header h4 {
  margin: 0.5rem 0;
  font-size: 1rem;
  word-break: break-all;
  color: var(--text-primary);
  font-weight: 600;
}

.back-link {
  background: var(--bg-item-hover);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.back-link:hover {
  background: #bee3f8;
}

.preview-body {
  flex: 1;
  overflow-y: auto;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.preview-body pre {
  white-space: pre-wrap;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.875rem;
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-item);
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.document-item:hover {
  border-color: var(--border-accent);
  background: var(--bg-item-hover);
}

.document-item.selected {
  background: var(--bg-item-selected);
  border-color: var(--border-accent);
}

.doc-label {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  cursor: pointer;
  overflow: hidden;
}

.doc-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.doc-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: #ffffff; /* High contrast for dark mode */
}

.document-item.selected .doc-name {
  color: var(--text-accent);
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.4;
  transition: opacity 0.2s, transform 0.2s;
  padding: 4px;
}
.delete-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #ef4444;
}

.add-btn {
  margin-top: 0.5rem;
  background: var(--text-accent);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: transform 0.2s;
}

.add-btn:hover {
  transform: translateY(-1px);
  background: #2563eb;
}

/* Chat panel */
.chat-panel {
  padding: 1.5rem;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.chat-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-align: center;
  gap: 1rem;
}

.chat-placeholder h3 {
  color: #64748b;
  font-size: 1.5rem;
  margin: 0;
}

/* Options panel */
.options-panel {
  padding: 1.5rem;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  box-sizing: border-box;
}

.options-panel h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.85rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.results-section {
  flex: 1;
}

.no-results {
  color: #94a3b8;
  font-style: italic;
  font-size: 1rem;
  text-align: center;
  padding: 2rem 0;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-item);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}

.result-item:hover {
  background: var(--bg-item-hover);
  border-color: var(--border-accent);
}

.result-icon {
  font-size: 1.25rem;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.result-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.result-fonts {
  font-size: 0.75rem;
  color: var(--text-accent);
  font-style: italic;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-item:hover .result-title,
.result-item:hover .result-date {
  color: white;
}

.remove-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.remove-btn:hover {
  opacity: 1;
}

.summary-panel-embedded {
  background: var(--bg-item);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.summary-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.summary-content {
  max-height: 600px;
  overflow-y: auto;
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.diagram-content {
  min-height: 450px;
  max-height: 850px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.source-attribution {
  font-size: 0.8rem;
  color: var(--text-accent);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  font-style: italic;
}

.sidebar-source {
  margin: 0 1rem 0.5rem 1rem;
}

.summary-content pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}

.summary-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* MODALS & MISC */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  margin-right: 8px;
  color: var(--text-secondary);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
}

.summary-item:hover {
  background: var(--bg-item-hover);
  border-radius: 4px;
}


.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  width: 90%;
  height: 90%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: var(--bg-sidebar);
  border-radius: 8px;
  position: relative;
  border: 1px solid var(--border-color);
  padding: 2rem;
}

.modal-text-content {
  width: 100%;
  max-width: 900px;
  color: var(--text-primary);
  font-size: 1.1rem;
  line-height: 1.7;
}

.modal-text-content pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
  color: var(--text-secondary);
}

.modal-body:active {
  cursor: grabbing;
}

/* SVG scaling in modal */
.mermaid, .mermaid-large {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mermaid-large {
  transform-origin: center center; /* Zoom from center */
  transition: transform 0.1s ease-out; /* Smooth zoom */
}

.mermaid-large svg {
  width: 100% !important;
  height: auto !important;
  max-width: none !important;
}

.modal-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: 1rem;
  text-align: right;
}

.close-btn-large {
  background: #cbd5e1;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.close-btn-large:hover {
  background: #94a3b8;
}
/* Test UI Styles */
.question-block {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.question-text {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-btn {
  background: var(--bg-item);
  border: 1px solid var(--border-color);
  padding: 8px;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.option-btn:hover:not(:disabled) {
  background: var(--bg-item-hover);
  border-color: var(--border-accent);
}

.option-btn:disabled {
  cursor: default;
  opacity: 0.8;
}

.correct-option {
  background-color: rgba(34, 197, 94, 0.2) !important;
  border-color: #22c55e !important;
  color: #4ade80 !important;
  font-weight: bold;
}

.incorrect-option {
  background-color: rgba(239, 68, 68, 0.2) !important;
  border-color: #ef4444 !important;
  color: #f87171 !important;
}


:deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
  background: white; /* Graphs are usually better with light background for legibility */
  padding: 1rem;
  border-radius: 8px;
}

.mermaid-large svg {
  width: 100% !important;
  height: auto !important;
  max-width: none !important;
}

.diagram-status {
  padding: 20px;
  text-align: center;
  font-size: 1rem;
  color: var(--text-secondary);
}

.diagram-status.rendering {
  color: var(--text-accent);
  font-style: italic;
}

.mermaid-viewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-top-color: var(--text-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-link {
  background: none;
  border: none;
  color: var(--text-accent);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 5px;
}

@media (max-width: 1024px) {
  .folder-view {
    grid-template-columns: 250px 1fr 250px;
  }
}
</style>
