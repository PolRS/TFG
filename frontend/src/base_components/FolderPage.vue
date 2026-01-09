<template>
  <div class="folder">

    <!-- TOPBAR (igual que HomePage) -->
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
        </div>

        <div class="results-section">
          <h3>Resultats Guardats</h3>
          
          <div v-if="savedSummaries.length === 0 && savedDiagrams.length === 0 && savedTests.length === 0" class="no-results">
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
                   <span class="result-date">{{ summary.date }}</span>
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
                   <span class="result-date">{{ diagram.date }}</span>
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
                   <span class="result-date">{{ test.date }}</span>
                </span>
                <button class="remove-btn" @click.stop="$emit('deleteTest', test.id)">🗑️</button>
             </li>
          </ul>
        </div>
        
        <!-- EMBEDDED PANELS (Only one valid at a time ideally, or stacked) -->
        
        <!-- Summary Panel -->
        <div v-if="activeSummary" class="summary-panel-embedded">
          <div class="summary-header">
            <h4>Resum ({{ activeSummary.date }})</h4>
            <button class="close-btn" @click="$emit('closeSummary')">✖</button>
          </div>
          <div class="summary-content">
            <pre>{{ activeSummary.text }}</pre>
          </div>
          <div class="summary-actions">
            <button class="download-btn-small" @click="downloadSummary">📥 Descarregar</button>
          </div>
        </div>

        <!-- Diagram Panel -->
        <div v-if="activeDiagram" class="summary-panel-embedded">
          <div class="summary-header">
            <h4>Diagrama ({{ activeDiagram.date }})</h4>
            <div class="header-actions">
              <button class="icon-btn" @click="isDiagramFullscreen = true" title="Ampliar">⤢</button>
              <button class="close-btn" @click="$emit('closeDiagram')">✖</button>
            </div>
          </div>
          <div class="summary-content diagram-content" ref="diagramContainer">
             <!-- DEBUG: Showing length to verify content -->
             <div v-if="renderedDiagram.length === 0" style="color:gray; padding:10px;">Renderitzant...</div>
             <div class="mermaid" v-html="renderedDiagram"></div>
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
              <button class="close-btn" @click="$emit('closeTest')">✖</button>
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

    <!-- Summary Modal / Panel moved inside sidebar structure -->
    <!-- (Removed from here) -->

  </div>
</template>

<script>
import DocumentChat from "@/components/DocumentChat.vue"
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: 'default' });

export default {
  name: "FolderPage",
  components: {
    DocumentChat
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
    activeTest: { type: Object, required: false, default: null }
  },

  data() {
    return {
      renderedDiagram: "",
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
      testAnswers: {} // map questionIndex -> optionIndex
    };
  },
  watch: {
    activeDiagram: {
      immediate: true,
      async handler(newVal) {
        console.log("FolderPage: Watch activeDiagram triggered:", newVal);
        if (newVal) {
          await this.renderMermaid(newVal.code);
        } else {
          this.renderedDiagram = "";
        }
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
      if (!code) return;
      try {
        const { svg } = await mermaid.render('mermaid-graph-' + Date.now(), code);
        
        // Safer approach: Only modify the opening <svg> tag
        let cleanSvg = svg.replace(/<svg([^>]*)>/, (match, attributes) => {
          // Remove width, height, and style from the attributes part ONLY of the root tag
          let newAttrs = attributes
            .replace(/width="[^"]*"/g, "")
            .replace(/height="[^"]*"/g, "")
            .replace(/style="[^"]*"/g, ""); // Remove style completely from root
          
          return `<svg${newAttrs} style="width: 100%; height: 100%; pointer-events: none;">`;
        });

        this.renderedDiagram = cleanSvg;
        
        // Reset zoom state
        this.zoomScale = 1;
        this.panX = 0;
        this.panY = 0;
      } catch (err) {
        console.error("Mermaid error:", err);
        this.renderedDiagram = `<div style="color:red">Error renderitzant diagrama: ${err.message}</div>`;
      }
    },
    downloadDiagram(format) {
      if (!this.activeDiagram) return;
      
      let content, type, ext;
      
      if (format === 'svg') {
        content = this.renderedDiagram; // The SVG HTML string
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
      a.download = `diagrama_${this.carpeta.nom}_${this.activeDiagram.date.replace(/:/g, '-')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    // --- Pan & Zoom Logic ---
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
  watch: {
    activeTest(newVal) {
      if (newVal) {
        this.resetTest();
      }
    }
  }
};
</script>

<style scoped>
.folder {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 🔵 TOPBAR */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
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
  grid-template-columns: 250px 1fr 250px;
  flex: 1;
}

/* 🔵 Sidebar */
.sidebar {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 1rem;
}

.doc-list {
  list-style: none; /* Remove bullets */
  padding: 0;
  margin: 0;
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
  height: calc(100vh - 250px); /* Fill remaining sidebar height approx */
}

.preview-header {
  margin-bottom: 0.5rem;
}

.preview-header h4 {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  word-break: break-all;
  color: #334155;
}

.back-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  text-decoration: underline;
}

.preview-body {
  flex: 1;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.5rem;
}

.preview-body pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.8rem;
  margin: 0;
  color: #475569;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e2e8f0;
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s;
}

.document-item.selected {
  background: #cbd5e1; /* Slightly darker when selected */
  border: 1px solid #94a3b8;
}

.doc-label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
  overflow: hidden; /* Handle long names */
}

.doc-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.delete-btn:hover {
  color: #ef4444;
}

.add-btn {
  margin-top: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

/* 🔵 Chat panel */
.chat-panel {
  padding: 1rem;
  border-right: 1px solid #e2e8f0;
}

.chat-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-align: center;
}

/* 🔵 Options panel */
.options-panel {
  background: #f9fafb;
  padding: 1rem;
  border-left: 1px solid #e2e8f0;
  overflow-y: auto; /* Allow scrolling if content fits */
  display: flex;
  flex-direction: column;
}

/* 🔵 Summary Panel Embedded */
.summary-panel-embedded {
  margin-top: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.8rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1; /* Take available space */
  min-height: 200px; /* Minimum height */
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #64748b;
}

.close-btn:hover {
  color: #ef4444;
}

.summary-content {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #f1f5f9;
  border-radius: 4px;
  background: #f8fafc;
}

.summary-content pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.5rem;
  margin: 0;
  color: #334155;
}

.download-btn-small {
  width: 100%;
  background: #10b981;
  color: white;
  border: none;
  padding: 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.download-btn-small:hover {
  background: #059669;
}



.sub-list ul {
  list-style: none;
  padding-left: 1rem;
  margin-top: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 4px;
  cursor: pointer;
  color: #4b5563;
}

.summary-item:hover {
  background: #e2e8f0;
  border-radius: 4px;
}

.remove-x {
  color: #ef4444;
  font-weight: bold;
}
.remove-x:hover {
  background: #fee2e2;
  border-radius: 50%;
  padding: 0 4px;
}

/* Modals & Fullscreen */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  margin-right: 8px;
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
  background: white;
  width: 90%;
  height: 90%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
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
  overflow: hidden; /* Hide overflow for zoom/pan */
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  border-radius: 4px;
  cursor: grab; /* Indicate draggable */
  position: relative;
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
  border-bottom: 1px solid #e2e8f0;
}

.question-text {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-btn {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 8px;
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  color: #475569;
}

.option-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.option-btn:disabled {
  cursor: default;
  opacity: 0.8;
}

.correct-option {
  background-color: #dcfce7 !important;
  border-color: #22c55e !important;
  color: #15803d !important;
  font-weight: bold;
}

.incorrect-option {
  background-color: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #b91c1c !important;
}

/* Sidebar Tools Grid */
.tools-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.tool-btn {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 10px;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  font-weight: 500;
  color: #334155;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.tool-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

/* Results List */
.results-section h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.8rem;
  letter-spacing: 0.05em;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.result-icon {
  font-size: 1.2rem;
  margin-right: 10px;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #1e293b;
}

.result-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.6;
  padding: 4px;
}

.remove-btn:hover {
  opacity: 1;
  background: #fee2e2;
  border-radius: 4px;
}

.no-results {
  color: #94a3b8;
  font-style: italic;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
}

/* Fix Diagram Visibility? Ensure default stroke/fill */
:deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
}

.mermaid-large svg {
  width: 100% !important;
  height: auto !important;
  max-width: none !important;
}

.mermaid-large svg {
  width: 100% !important;
  height: auto !important;
  max-width: none !important;
}
</style>
