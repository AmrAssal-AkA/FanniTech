"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ZoomIn, ExternalLink, ImageOff } from "lucide-react";
import type { RequestPhoto } from "@/types/requests";

interface PhotoPreviewModalProps {
  photo: RequestPhoto | null;
  onClose: () => void;
}

export function PhotoPreviewModal({ photo, onClose }: PhotoPreviewModalProps) {
  const [hasError, setHasError] = useState(false);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-sky-600" />
            <h3 id="photo-preview-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {photo.caption || "Customer Attached Hardware Photograph"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-md"
              title="Open original image"
              aria-label="Open original image in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-md"
              aria-label="Close photo preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="p-4 bg-zinc-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
          <div className="relative w-full h-96">
            {!hasError ? (
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
                unoptimized
                onError={() => setHasError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                <ImageOff className="w-8 h-8 text-zinc-500" />
                <p className="text-xs">Unable to load image directly.</p>
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:underline inline-flex items-center gap-1 mt-1"
                >
                  View full image <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 flex items-center justify-between">
          <p>{photo.alt}</p>
          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
          >
            Open Original <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
