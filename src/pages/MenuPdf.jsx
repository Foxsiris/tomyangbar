import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

// PDF.js будет загружен динамически
let pdfjsLib = null;

const PDF_URL = '/menu_pdf.pdf';
const PDFJS_VERSION = '3.11.174';

const MenuPdf = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [pdfjsReady, setPdfjsReady] = useState(false);
  const [renderedPages, setRenderedPages] = useState([]);
  
  const containerRef = useRef(null);
  const canvasRefs = useRef([]);

  const pdfHref = typeof window !== 'undefined' ? `${window.location.origin}${PDF_URL}` : PDF_URL;

  // Загрузка PDF.js из CDN
  useEffect(() => {
    if (pdfjsLib) {
      setPdfjsReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
    script.async = true;
    script.onload = () => {
      pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
      setPdfjsReady(true);
    };
    script.onerror = () => {
      console.error('Failed to load PDF.js');
      setLoadError(true);
      setIsLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  // Загрузка PDF документа
  useEffect(() => {
    if (!pdfjsReady || !pdfjsLib) return;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);
        
        const loadingTask = pdfjsLib.getDocument(pdfHref);
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setRenderedPages(new Array(pdf.numPages).fill(false));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setLoadError(true);
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfHref, pdfjsReady]);

  // Рендер всех страниц
  useEffect(() => {
    if (!pdfDoc || totalPages === 0) return;

    const renderAllPages = async () => {
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth - 32;
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const canvas = canvasRefs.current[pageNum - 1];
        if (!canvas) continue;

        try {
          const page = await pdfDoc.getPage(pageNum);
          const context = canvas.getContext('2d');
          
          const viewport = page.getViewport({ scale: 1 });
          const optimalScale = (containerWidth / viewport.width) * scale * 0.95;
          const scaledViewport = page.getViewport({ scale: optimalScale });
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: scaledViewport
          }).promise;

          setRenderedPages(prev => {
            const newState = [...prev];
            newState[pageNum - 1] = true;
            return newState;
          });
        } catch (error) {
          console.error(`Error rendering page ${pageNum}:`, error);
        }
      }
    };

    renderAllPages();
  }, [pdfDoc, totalPages, scale]); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1);
  const openFullscreen = () => window.open(pdfHref, '_blank');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Меню Tom Yang Bar
                </h1>
                <p className="text-gray-500 text-xs hidden sm:block">Полное меню ресторана</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={zoomOut}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Уменьшить"
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600 min-w-[3rem] text-center hidden sm:block">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Увеличить"
                  disabled={scale >= 3}
                >
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={resetZoom}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors hidden sm:block"
                  title="Сбросить масштаб"
                >
                  <Maximize className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Open fullscreen */}
              <button
                onClick={openFullscreen}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Открыть в новой вкладке"
              >
                <Maximize className="w-5 h-5 text-gray-600" />
              </button>

              {/* Download */}
              <a
                href={pdfHref}
                download="Tom_Yang_Bar_Menu.pdf"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Скачать</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка меню...</p>
          </motion.div>
        ) : loadError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center"
          >
            <FileText className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Не удалось загрузить меню</h3>
            <p className="text-gray-600 mb-6">
              Попробуйте скачать файл или открыть в новой вкладке
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={openFullscreen}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                <Maximize className="w-5 h-5" />
                Открыть в новой вкладке
              </button>
              <a
                href={pdfHref}
                download="Tom_Yang_Bar_Menu.pdf"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
              >
                <Download className="w-5 h-5" />
                Скачать PDF
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Scrollable Container with all pages */}
            <div 
              ref={containerRef}
              className="overflow-auto bg-gray-100"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            >
              <div className="flex flex-col items-center gap-4 p-4">
                {Array.from({ length: totalPages }, (_, index) => (
                  <div key={index} className="relative">
                    {!renderedPages[index] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    )}
                    <canvas
                      ref={el => canvasRefs.current[index] = el}
                      className="shadow-lg rounded-lg bg-white"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPdf;
