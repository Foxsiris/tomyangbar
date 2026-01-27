import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, Smartphone } from 'lucide-react';

const PDF_URL = '/menu_pdf.pdf';

const MenuPdf = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pdfCheckDone, setPdfCheckDone] = useState(false);
  const [pdfAvailable, setPdfAvailable] = useState(false);

  const pdfHref = typeof window !== 'undefined' ? `${window.location.origin}${PDF_URL}` : PDF_URL;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const controller = new AbortController();
    fetch(pdfHref, { method: 'HEAD', signal: controller.signal })
      .then((r) => {
        setPdfAvailable(r.ok);
        if (!r.ok) setLoadError(true);
      })
      .catch(() => {
        setLoadError(true);
        setPdfAvailable(false);
      })
      .finally(() => setPdfCheckDone(true));
    return () => controller.abort();
  }, [pdfHref]);

  const openPdfInNewTab = () => {
    window.open(pdfHref, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Меню Tom Yang Bar
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm">Полное меню ресторана</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Open in new tab */}
              <button
                onClick={openPdfInNewTab}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Открыть в новой вкладке"
              >
                <ExternalLink className="w-5 h-5 text-gray-600" />
              </button>

              {/* Download */}
              <a
                href={pdfHref}
                download="Tom_Yang_Bar_Menu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Скачать</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
        {(!pdfCheckDone || loadError || !pdfAvailable) && pdfCheckDone ? (
          /* Ошибка загрузки — показываем кнопки вместо пустого блока */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center"
          >
            <FileText className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Меню не загрузилось</h3>
            <p className="text-gray-600 mb-6">
              Откройте меню в новой вкладке или скачайте файл
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={openPdfInNewTab}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Открыть меню в новой вкладке
              </button>
              <a
                href={pdfHref}
                download="Tom_Yang_Bar_Menu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
              >
                <Download className="w-5 h-5" />
                Скачать PDF
              </a>
            </div>
          </motion.div>
        ) : !pdfCheckDone ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Проверка доступности меню...</p>
          </motion.div>
        ) : isMobile ? (
          /* Mobile View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="relative" style={{ height: 'calc(100vh - 160px)' }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка меню...</p>
                  </div>
                </div>
              )}
              <object
                data={`${pdfHref}#view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                type="application/pdf"
                className="w-full h-full"
                onLoad={() => { setIsLoading(false); setLoadError(false); }}
                onError={() => setLoadError(true)}
              >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Smartphone className="w-16 h-16 text-orange-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Просмотр PDF</h3>
                  <p className="text-gray-600 mb-6">
                    Для просмотра меню на вашем устройстве нажмите кнопку ниже
                  </p>
                  <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                    <button
                      onClick={openPdfInNewTab}
                      type="button"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Открыть меню
                    </button>
                    <a
                      href={pdfHref}
                      download="Tom_Yang_Bar_Menu.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Скачать PDF
                    </a>
                  </div>
                </div>
              </object>
            </div>
          </motion.div>
        ) : (
          /* Desktop View - iframe */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden relative"
            style={{ height: 'calc(100vh - 180px)' }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Загрузка меню...</p>
                </div>
              </div>
            )}
            <iframe
              id="pdf-viewer"
              src={`${pdfHref}#view=FitH&toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title="Меню Tom Yang Bar"
              onLoad={() => setIsLoading(false)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPdf;
