/**
 * QR Scanner utility for gym check-in system
 * Handles QR code scanning and backend communication
 */

class QRScanner {
  constructor() {
    this.isScanning = false;
    this.videoElement = null;
    this.canvasElement = null;
    this.stream = null;
  }

  /**
   * Initialize QR scanner with video and canvas elements
   * @param {HTMLVideoElement} videoElement
   * @param {HTMLCanvasElement} canvasElement
   */
  init(videoElement, canvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
  }

  /**
   * Start QR code scanning
   * @param {Function} onScanSuccess - Callback when QR code is successfully scanned
   * @param {Function} onScanError - Callback when scanning fails
   */
  async startScanning(onScanSuccess, onScanError) {
    if (this.isScanning) return;

    try {
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.isScanning = true;

      // Start scanning loop
      this.scanLoop(onScanSuccess, onScanError);

    } catch (error) {
      console.error('Error starting QR scanner:', error);
      onScanError('Failed to access camera. Please check permissions.');
    }
  }

  /**
   * Stop QR code scanning
   */
  stopScanning() {
    this.isScanning = false;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Main scanning loop
   * @param {Function} onScanSuccess
   * @param {Function} onScanError
   */
  scanLoop(onScanSuccess, onScanError) {
    if (!this.isScanning) return;

    try {
      const canvas = this.canvasElement;
      const context = canvas.getContext('2d');

      // Set canvas size to video size
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

      // Get image data for QR code detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Here you would integrate with a QR code library like jsQR
      // For now, we'll simulate QR detection
      const qrCode = this.detectQRCode(imageData);

      if (qrCode) {
        this.processQRCode(qrCode, onScanSuccess, onScanError);
      } else {
        // Continue scanning
        requestAnimationFrame(() => this.scanLoop(onScanSuccess, onScanError));
      }

    } catch (error) {
      console.error('Error in scan loop:', error);
      onScanError('Scanning error occurred');
    }
  }

  /**
   * Detect QR code from image data (placeholder - integrate with jsQR library)
   * @param {ImageData} imageData
   * @returns {string|null} QR code data or null
   */
  detectQRCode(imageData) {
    // Placeholder for QR detection logic
    // TODO: Integrate with jsQR library for actual QR detection
    // const code = jsQR(imageData.data, imageData.width, imageData.height);
    // return code ? code.data : null;

    // For demo purposes, return null (no QR detected)
    return null;
  }

  /**
   * Process detected QR code
   * @param {string} qrData
   * @param {Function} onScanSuccess
   * @param {Function} onScanError
   */
  async processQRCode(qrData, onScanSuccess, onScanError) {
    try {
      // Stop scanning while processing
      this.stopScanning();

      // Parse QR data
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (error) {
        onScanError('Invalid QR code format');
        return;
      }

      // Validate QR structure
      if (!parsedData.purpose || parsedData.purpose !== 'gym_checkin') {
        onScanError('Invalid QR code for gym check-in');
        return;
      }

      // Send to backend for processing
      const response = await this.sendQRToBackend(parsedData);

      if (response.success) {
        onScanSuccess(response.data);
      } else {
        onScanError(response.message || 'Failed to process check-in');
      }

    } catch (error) {
      console.error('Error processing QR code:', error);
      onScanError('Failed to process QR code');
    }
  }

  /**
   * Send QR data to backend for validation and processing
   * @param {Object} qrData
   * @returns {Promise<Object>} Backend response
   */
  async sendQRToBackend(qrData) {
    // Import axiosInstance dynamically to avoid circular dependencies
    const { default: axiosInstance } = await import('../utils/axiosInstance');

    try {
      const response = await axiosInstance.post('/qr-check/in', {
        qrData: JSON.stringify(qrData)
      });

      return response.data;
    } catch (error) {
      console.error('Backend error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error'
      };
    }
  }

  /**
   * Check if QR scanner is supported
   * @returns {boolean}
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

export default QRScanner;
