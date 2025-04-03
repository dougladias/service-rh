"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, XCircle, Aperture } from 'lucide-react';
import Image from 'next/image';

interface WebcamCaptureProps {
  onCapture: (photoData: string | null) => void;
  photoData: string | null;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, photoData }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  // Função inspirada no show_frame() do código Python
  // Usa requestAnimationFrame em vez de setTimeout para melhor performance
  const processVideoFrame = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      // O vídeo está pronto e reproduzindo - não precisamos fazer nada
      // No código Python, atualizamos um Label com a imagem, mas no React
      // o elemento de vídeo já mostra o stream automaticamente
      console.log("Frame processado - vídeo reproduzindo corretamente");
    }
    
    // Continuar o loop de animação (como o lbl_video.after() do Python)
    animationRef.current = requestAnimationFrame(processVideoFrame);
  }, []);

  // Equivalente ao start_webcam() do código Python
  const startCamera = useCallback(async () => {
    try {
      setIsLoadingCamera(true);
      setCameraError(null);
      
      // Parar qualquer stream anterior (equivalente a cap.release())
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Cancelar qualquer animação anterior
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      console.log("Solicitando acesso à câmera...");
      
      // Equivalente ao cv2.VideoCapture(0)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }, 
        audio: false
      });
      
      console.log("Acesso à câmera concedido", stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        // Configurar o stream no elemento de vídeo
        videoRef.current.srcObject = stream;
        
        // Explicitamente definir os atributos para maximizar compatibilidade
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        
        // Forçar estilo de exibição
        videoRef.current.style.display = 'block';
        videoRef.current.style.width = '100%';
        videoRef.current.style.height = 'auto';
        
        // Quando o vídeo estiver pronto para reprodução
        videoRef.current.onloadeddata = () => {
          console.log("Vídeo pronto para reprodução");
          setIsStreaming(true);
          setIsLoadingCamera(false);
          
          // Iniciar o processamento de frames (como show_frame no Python)
          animationRef.current = requestAnimationFrame(processVideoFrame);
          
          // Reproduzir o vídeo explicitamente
          videoRef.current?.play().catch(err => {
            console.error("Erro ao iniciar reprodução:", err);
            setCameraError(`Erro ao iniciar reprodução: ${err.message}`);
          });
        };
        
        // Detectar erros
        videoRef.current.onerror = (event) => {
          console.error("Erro no elemento de vídeo:", event);
          setCameraError("Erro ao exibir vídeo da câmera");
          setIsLoadingCamera(false);
        };
      }
    } catch (err) {
      console.error("Erro ao acessar a webcam:", err);
      
      if (err instanceof Error) {
        switch (err.name) {
          case 'NotAllowedError':
            setCameraError('Acesso à câmera foi negado. Verifique as permissões.');
            break;
          case 'NotFoundError':
            setCameraError('Nenhuma câmera encontrada no dispositivo.');
            break;
          case 'NotReadableError':
            setCameraError('A câmera está sendo usada por outro aplicativo.');
            break;
          default:
            setCameraError(`Erro: ${err.message}`);
        }
      } else {
        setCameraError('Erro desconhecido ao acessar a câmera');
      }
      setIsLoadingCamera(false);
    }
  }, [processVideoFrame]);

  // Equivalente ao stop_webcam() do código Python
  const stopCamera = useCallback(() => {
    // Parar o loop de animação
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Liberar a câmera (equivalente a cap.release())
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Limpar o elemento de vídeo
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Forçar recarregamento
    }
    
    setIsStreaming(false);
  }, []);

  // Capturar foto (como no componente original)
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Configurar o tamanho do canvas para corresponder ao vídeo
        const width = video.videoWidth;
        const height = video.videoHeight;
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar a imagem do vídeo no canvas
        context.drawImage(video, 0, 0, width, height);
        
        // Converter para formato de imagem
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataURL);
        
        // Desligar a câmera após capturar
        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  // Auto-iniciar câmera (para algumas implementações)
  useEffect(() => {
    if (!isStreaming && !photoData) {
      const timerId = setTimeout(() => {
        console.log("Iniciando câmera automaticamente");
        startCamera();
      }, 500);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [isStreaming, photoData, startCamera]);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      console.log("Componente desmontando, parando câmera");
      stopCamera();
    };
  }, [stopCamera]);

  // O layout é semelhante ao seu componente original, mas com alguns ajustes
  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {photoData ? (
        // Mostrar foto capturada
        <div className="relative">
          <Image 
            src={photoData}
            alt="Foto capturada"
            width={320}
            height={320}
            className="w-full h-auto rounded-lg border border-gray-300 shadow-md"
            unoptimized
          />
          <button 
            onClick={() => onCapture(null)} 
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Remover foto"
          >
            <XCircle size={24} />
          </button>
        </div>
      ) : (
        // Área da câmera
        <div className="w-full max-w-md mx-auto relative">
          {isStreaming ? (
            <div className="relative rounded-lg overflow-hidden shadow-md">
              <video 
                ref={videoRef} 
                className="w-full h-auto bg-black rounded-lg block" 
                style={{ 
                  aspectRatio: '4/3', 
                  minHeight: '240px',
                  minWidth: '320px',
                  visibility: 'visible',
                  opacity: 1
                }}
                playsInline
                muted
              />
              {isLoadingCamera && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                </div>
              )}
              <button 
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-colors"
                title="Capturar foto"
              >
                <Aperture className="text-blue-600 hover:text-blue-700" size={32} />
              </button>
            </div>
          ) : (
            <div className="w-full aspect-video bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              {cameraError ? (
                <div className="text-center text-red-500 p-4">{cameraError}</div>
              ) : (
                <>
                  {isLoadingCamera ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                  ) : (
                    <Camera size={64} className="text-gray-400 mb-4" />
                  )}
                  <p className="text-gray-500 text-center mb-4">
                    {isLoadingCamera ? "Iniciando câmera..." : "Clique para ativar a câmera"}
                  </p>
                </>
              )}
            </div>
          )}
          
          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div className="flex space-x-2 w-full max-w-md mx-auto">
        {!photoData && (
          !isStreaming ? (
            <Button 
              type="button" 
              onClick={startCamera} 
              variant="secondary" 
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Câmera
            </Button>
          ) : null
        )}
        
        {photoData && (
          <Button 
            type="button" 
            onClick={() => { onCapture(null); startCamera(); }} 
            variant="outline" 
            className="w-full"
          >
            Tirar Nova Foto
          </Button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;