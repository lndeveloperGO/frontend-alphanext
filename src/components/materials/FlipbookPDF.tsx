import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set worker URL using the correct extension for version 5.x (.mjs)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FlipbookPDFProps {
    url: string;
}

const PDFPage = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
        <div className="page pb-4 bg-white shadow-sm" ref={ref}>
            <div className="page-content flex items-center justify-center h-full">
                <Page
                    pageNumber={props.number}
                    width={props.width}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    loading={<div className="h-full w-full bg-muted animate-pulse" />}
                />
            </div>
        </div>
    );
});

export const FlipbookPDF: React.FC<FlipbookPDFProps> = ({ url }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const flipBookRef = useRef<any>(null);
    const [width, setWidth] = useState(400);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const parentWidth = containerRef.current.clientWidth;
            // In flipbook (double page), width is per page.
            // So width * 2 should fit in parentWidth.
            const calculatedWidth = Math.min((parentWidth / 2) - 40, 500);
            setWidth(calculatedWidth > 300 ? calculatedWidth : parentWidth - 40);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isFullScreen]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const nextButtonClick = () => {
        flipBookRef.current?.pageFlip()?.flipNext();
    };

    const prevButtonClick = () => {
        flipBookRef.current?.pageFlip()?.flipPrev();
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`flex flex-col items-center justify-center p-4 ${isFullScreen ? 'bg-background h-screen' : 'bg-muted/30 rounded-lg min-h-[600px] mt-4'}`}
        >
            <div className="mb-6 flex items-center justify-between w-full max-w-4xl px-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={prevButtonClick} disabled={currentPage === 0}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Prev
                    </Button>
                    <div className="px-3 py-1 bg-background rounded-md border text-xs font-medium">
                        Hal {currentPage + 1} / {numPages || '?'}
                    </div>
                    <Button variant="outline" size="sm" onClick={nextButtonClick} disabled={numPages ? currentPage + 2 >= numPages : true}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>

                <Button variant="ghost" size="sm" onClick={toggleFullScreen}>
                    {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">{isFullScreen ? 'Keluar' : 'Layar Penuh'}</span>
                </Button>
            </div>

            <div className="relative w-full flex justify-center items-center overflow-auto max-h-[calc(100vh-150px)]">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex flex-col items-center p-12">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="mt-4 text-muted-foreground animate-pulse">Menyiapkan lembaran buku...</p>
                        </div>
                    }
                    error={
                        <div className="p-12 text-center text-destructive bg-destructive/10 rounded-lg">
                            <p className="font-semibold text-lg">Gagal memuat PDF</p>
                            <p className="text-sm mt-2 opacity-80">Pastikan file tersedia dan dapat diakses.</p>
                        </div>
                    }
                >
                    {numPages && (
                        <HTMLFlipBook
                            width={width}
                            height={Math.round(width * 1.41)}
                            size="fixed"
                            minWidth={300}
                            maxWidth={800}
                            minHeight={400}
                            maxHeight={1200}
                            maxShadowOpacity={0.5}
                            showCover={true}
                            mobileScrollSupport={true}
                            onFlip={(e: any) => setCurrentPage(e.data)}
                            className="flipbook shadow-2xl mx-auto"
                            style={{}}
                            startPage={0}
                            drawShadow={true}
                            flippingTime={800}
                            usePortrait={false}
                            startZIndex={0}
                            autoSize={true}
                            clickEventForward={true}
                            useMouseEvents={true}
                            swipeDistance={30}
                            showPageCorners={true}
                            disableFlipByClick={false}
                            ref={flipBookRef}
                        >
                            {[...Array(numPages)].map((_, index) => (
                                <PDFPage key={`page_${index + 1}`} number={index + 1} width={width} />
                            ))}
                        </HTMLFlipBook>
                    )}
                </Document>
            </div>

            {!isFullScreen && (
                <p className="mt-6 text-xs text-muted-foreground italic">
                    Tip: Gunakan tombol panah atau geser ujung halaman untuk membalik lembaran.
                </p>
            )}
        </div>
    );
};
