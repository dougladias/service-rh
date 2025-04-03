"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, XCircle } from 'lucide-react';
import Image from 'next/image';

// Declaração para carregar o OpenCV.js
interface Mat {
  delete(): void;
}

interface OpenCV {
  Mat: new () => Mat;
  imread: (canvas: HTMLCanvasElement) => Mat;
  imshow: (canvas: HTMLCanvasElement, mat: Mat) => void;
  cvtColor: (src: Mat, dst: Mat, code: number) => void;
  COLOR_RGBA2GRAY: number;
  onRuntimeInitialized?: () => void;
}

declare global {
  interface Window {
    cv?: OpenCV;
  }
}

// Após as declarações globais, antes do componente
interface WebcamCaptureProps {
  onCapture: (data: string | null) => void;
  photoData: string | null;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, photoData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Função para carregar o script do OpenCV.js
  const loadOpenCv = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.cv) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.5.2/opencv.js';
      script.async = true;
      script.onload = () => {
        if (window.cv) {
          window.cv.onRuntimeInitialized = () => {
            resolve();
          };
        }
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // Função para iniciar a webcam
  const startWebcam = useCallback(async () => {
    try {
      // Garantir que o OpenCV está carregado
      await loadOpenCv();

      // Obter acesso à câmera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: "user" 
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Erro ao iniciar webcam:", error);
    }
  }, []);

  // Função para processar frame (similar ao show_frame do Python)
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || !window.cv) return;

    // Definir tamanho do canvas igual ao vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame atual do vídeo no canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para Mat do OpenCV
    const src = window.cv.imread(canvas);
    const dst = new window.cv.Mat();

    // Exemplo de processamento de imagem (pode ser removido ou personalizado)
    window.cv.cvtColor(src, dst, window.cv.COLOR_RGBA2GRAY);

    // Desenhar de volta no canvas
    window.cv.imshow(canvas, dst);

    // Liberar memória
    src.delete();
    dst.delete();
  }, []);

  // Capturar foto
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Definir tamanho do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame atual
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para base64
    const dataURL = canvas.toDataURL('image/jpeg');
    // Substituir setCapturedImage por onCapture
    onCapture(dataURL);

    // Parar webcam
    const stream = video.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    setIsStreaming(false);
  }, [onCapture]); // Adicione onCapture como dependência

  // Loop de processamento de frame
  useEffect(() => {
    let animationFrameId: number;

    const processLoop = () => {
      if (isStreaming && window.cv) {
        processFrame();
      }
      animationFrameId = requestAnimationFrame(processLoop);
    };

    if (isStreaming) {
      animationFrameId = requestAnimationFrame(processLoop);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isStreaming, processFrame]);

  // Limpar foto
  const clearPhoto = () => {
    onCapture(null);
    startWebcam();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {photoData ? (
        <div className="relative">
          <Image 
            src={photoData}
            alt="Foto capturada"
            width={640}
            height={480}
            className="max-w-full h-auto rounded border border-gray-300"
            style={{ maxHeight: "480px" }}
          />
          <button 
            onClick={clearPhoto} 
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            title="Remover foto"
          >
            <XCircle size={20} />
          </button>
        </div>
      ) : (
        <div className="relative border border-gray-300 rounded overflow-hidden">
          <video 
            ref={videoRef} 
            className="w-full h-auto" 
            style={{ maxHeight: "480px" }}
            onCanPlay={() => {
              if (!isStreaming) startWebcam();
            }}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div className="flex space-x-2">
        {!photoData && (
          isStreaming ? (
            <Button type="button" onClick={capturePhoto} variant="secondary">
              Capturar Foto
            </Button>
          ) : (
            <Button type="button" onClick={startWebcam} variant="secondary">
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Câmera
            </Button>
          )
        )}
        
        {photoData && (
          <Button type="button" onClick={clearPhoto} variant="outline">
            Nova Foto
          </Button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;