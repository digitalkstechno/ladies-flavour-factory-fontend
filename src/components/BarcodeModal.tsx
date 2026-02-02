import React, { useRef } from "react";
import Barcode from "react-barcode";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MdPrint } from "react-icons/md";

interface BarcodeModalProps {
  sku: string;
  onClose: () => void;
  productName?: string;
}

const BarcodeModal = ({ sku, onClose, productName }: BarcodeModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const windowUrl = "about:blank";
      const uniqueName = new Date();
      const windowName = "Print" + uniqueName.getTime();
      const printWindow = window.open(windowUrl, windowName, "left=50000,top=50000,width=0,height=0");

      if (printWindow) {
        // Add basic styles for printing
        printWindow.document.write(`
          <html>
            <head>
              <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .barcode-container { text-align: center; }
                h4 { font-family: sans-serif; margin-bottom: 5px; font-size: 14px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Product Barcode"
      className="max-w-md"
    >
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        <div ref={printRef} className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-xl bg-white">
          {productName && <h4 className="text-sm font-bold mb-2 text-gray-900">{productName}</h4>}
          <Barcode value={sku} width={2} height={60} fontSize={16} />
        </div>
        
        <div className="flex w-full gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            className="flex-1 flex items-center justify-center gap-2"
            onClick={handlePrint}
          >
            <MdPrint className="w-4 h-4" />
            Print Label
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeModal;
