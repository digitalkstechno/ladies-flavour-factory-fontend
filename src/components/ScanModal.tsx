"use client";

import { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MdQrCodeScanner, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { toast } from "react-hot-toast";
import { stockService } from "@/services/stockService";

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ScanModal({ isOpen, onClose, onSuccess }: ScanModalProps) {
  const [sku, setSku] = useState("");
  const [type, setType] = useState<'IN' | 'OUT'>('OUT');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) return;

    setIsLoading(true);
    try {
      await stockService.scanQR({ sku, type });
      toast.success(`Successfully scanned ${type}: ${sku}`);
      setSku("");
      if (onSuccess) onSuccess();
      // Keep modal open for continuous scanning? 
      // User might want to close it manually or scan next item.
      // Let's keep it open and clear input.
      inputRef.current?.focus();
    } catch (error: any) {
      console.error("Scan error", error);
      const msg = error.response?.data?.message || "Error processing scan";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan Item"
      className="max-w-md"
    >
      <div className="space-y-6">
        {/* Type Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setType('IN')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              type === 'IN' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MdArrowDownward className="w-4 h-4" />
            Stock IN
          </button>
          <button
            type="button"
            onClick={() => setType('OUT')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
              type === 'OUT' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MdArrowUpward className="w-4 h-4" />
            Stock OUT
          </button>
        </div>

        {/* Scan Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdQrCodeScanner className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              ref={inputRef}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Scan barcode or enter SKU..."
              className="pl-10 h-12 text-lg"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${type === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              disabled={isLoading || !sku.trim()}
            >
              {isLoading ? "Processing..." : `Confirm ${type}`}
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-gray-500">
          Use your barcode scanner or manually enter the SKU and press Enter.
        </p>
      </div>
    </Modal>
  );
}
