import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const MenuPdf = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(100);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 25, 50));
  };

  const handleFullscreen = () => {
    const iframe = document.getElementById('pdf-viewer');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
    }
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Меню Tom Yang Bar
                </h1>
                <p className="text-gray-500 text-sm">Полное меню в формате PDF</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="Уменьшить"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                <span className="px-3 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {scale}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="Увеличить"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="На весь экран"
              >
                <Maximize2 className="w-5 h-5 text-gray-600" />
              </button>

              {/* Download */}
              <a
                href="/menu_pdf.pdf"
                download="Tom_Yang_Bar_Menu.pdf"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Скачать</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden relative"
          style={{ height: 'calc(100vh - 180px)' }}
        >
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Загрузка меню...</p>
              </div>
            </div>
          )}

          {/* PDF iframe */}
          <iframe
            id="pdf-viewer"
            src={`/menu_pdf.pdf#zoom=${scale}&toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title="Меню Tom Yang Bar"
            onLoad={() => setIsLoading(false)}
            style={{ 
              transform: `scale(${scale / 100})`,
              transformOrigin: 'top left',
              width: `${10000 / scale}%`,
              height: `${10000 / scale}%`
            }}
          />
        </motion.div>

        {/* Mobile hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm mt-4 sm:hidden"
        >
          Для лучшего просмотра используйте кнопку &quot;На весь экран&quot; или скачайте PDF
        </motion.p>
      </div>
    </div>
  );
};

export default MenuPdf;
