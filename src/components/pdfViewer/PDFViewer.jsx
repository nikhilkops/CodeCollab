import React from "react";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
export const PdfViewer = ({ pdfUrl }) => {
    return (
      <div style={{ height: '500px' }}>
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}>
          <Viewer fileUrl={pdfUrl} />
        </Worker>
      </div>
    );
  };
  