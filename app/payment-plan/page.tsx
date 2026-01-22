'use client';

import { callGeminiAction } from '@/app/payment-plan/actions';
import type {
  ButtonProps,
  ButtonVariant,
  CardProps,
  ExtractedRow,
  ParsedAIRow,
  ProgressBarProps,
  TesseractLine,
} from '@/app/payment-plan/types';
import {
  Building as BuildingIcon,
  Calculator,
  CheckCircle,
  ChevronDown,
  CloudLightning,
  Code,
  Cpu,
  DollarSign,
  Eye,
  FileText,
  FileType,
  Loader2,
  ScanLine,
  Sparkles,
  Table as TableIcon,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

// --- Types ---

interface BuildingData {
  id: number;
  title: string;
  hand_over_date: string | null;
}

// --- Styles & Components ---

const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>{children}</div>
);

const Button = ({ children, onClick, disabled, variant = 'primary', className = '', icon: Icon }: ButtonProps) => {
  const baseStyle =
    'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-400',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    magic:
      'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 shadow-sm hover:shadow-md border-0',
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const ProgressBar = ({ progress, status }: ProgressBarProps) => (
  <div className="w-full space-y-2">
    <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
      <span>{status || 'Initializing...'}</span>
      <span>{Math.round(progress * 100)}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-600 transition-all duration-300 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  </div>
);

// --- Gemini API Integration (via server action) ---

const callGemini = async (
  prompt: string,
  systemInstruction = '',
  useJsonMode = false,
  imageBase64: string | null = null,
  mimeType = '',
): Promise<string> => {
  const result = await callGeminiAction({
    prompt,
    systemInstruction,
    useJsonMode,
    imageBase64,
    mimeType,
  });
  return result ?? '';
};

// --- Core Logic: Tesseract Integration & Heuristic Parsing ---

export default function PaymentPlanExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalPdfName, setOriginalPdfName] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPdfRendering, setIsPdfRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedRow[]>([]);
  const [rawText, setRawText] = useState('');
  const [jsonResult, setJsonResult] = useState<string | null>(null);
  const [tesseractReady, setTesseractReady] = useState(false);
  const [pdfJsReady, setPdfJsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculation Context
  const [totalValue, setTotalValue] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [handoverDate, setHandoverDate] = useState('');
  const [showContext, setShowContext] = useState(false);

  // AI States
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Building Data
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');

  // Fetch Buildings
  useEffect(() => {
    const fetchBuildings = async () => {
      setIsLoadingBuildings(true);
      try {
        const res = await fetch(`${process.env.ASETTE_BE_API_URL}/buildings/?skip=0&limit=100`, {
          headers: { 'x-api-key': process.env.ASETTE_BE_API_KEY || '' },
        });
        if (res.ok) {
          const data = await res.json();
          setBuildings(data);
        } else {
          console.error('Failed to fetch buildings');
        }
      } catch (error) {
        console.error('Error fetching buildings:', error);
      } finally {
        setIsLoadingBuildings(false);
      }
    };

    fetchBuildings();
  }, []);

  const handleBuildingSelect = (id: string) => {
    setSelectedBuildingId(id);
    const building = buildings.find((b) => b.id.toString() === id);
    if (building && building.hand_over_date) {
      // Format date to YYYY-MM-DD for input[type="date"]
      const dateObj = new Date(building.hand_over_date);
      if (!isNaN(dateObj.getTime())) {
        setHandoverDate(dateObj.toISOString().split('T')[0]);
      }
    }
  };

  // Load Scripts (Tesseract + PDF.js)
  useEffect(() => {
    // 1. Tesseract
    if (!window.Tesseract) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.async = true;
      script.onload = () => {
        console.log('Tesseract loaded');
        setTesseractReady(true);
      };
      document.body.appendChild(script);
    } else {
      setTesseractReady(true);
    }

    // 2. PDF.js
    if (!window.pdfjsLib) {
      const pdfScript = document.createElement('script');
      pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      pdfScript.async = true;
      pdfScript.onload = () => {
        console.log('PDF.js loaded');
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        setPdfJsReady(true);
      };
      document.body.appendChild(pdfScript);
    } else {
      setPdfJsReady(true);
    }
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset state
    setExtractedData([]);
    setJsonResult(null);
    setAiAnalysis('');
    setRawText('');
    setProgress(0);
    setStatus('');
    setOriginalPdfName(null);

    // Handle PDF
    if (selectedFile.type === 'application/pdf') {
      if (!pdfJsReady) {
        alert('PDF Engine is still loading. Please wait a moment and try again.');
        return;
      }
      await renderPdfToImage(selectedFile);
    } else {
      // Handle Image
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const renderPdfToImage = async (pdfFile: File) => {
    setIsPdfRendering(true);
    setOriginalPdfName(pdfFile.name);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await window.pdfjsLib!.getDocument(arrayBuffer).promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get canvas context');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) throw new Error('Failed to create blob from canvas');

      const imageFile = new File([blob], 'converted_pdf_page.jpg', { type: 'image/jpeg' });

      setFile(imageFile);
      setImagePreview(canvas.toDataURL('image/jpeg'));
    } catch (err) {
      console.error('PDF Render Error', err);
      alert('Failed to render PDF. Please try an image file instead.');
    } finally {
      setIsPdfRendering(false);
    }
  };

  // --- Smart Parsing Logic (Legacy Heuristic) ---
  const parseLineToRow = (line: TesseractLine): ExtractedRow | null => {
    const text = line.text.trim();
    if (!text || text.length < 4) return null;

    const percentPattern = /(\d+(\.\d+)?)\s?%/;
    const datePattern =
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,.-]*\d{4})|(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|On\s?Booking|Handover|Completion/i;
    const amountPattern = /(?:AED|USD|\$|SAR)\s?([0-9,]+(\.\d+)?)|([0-9,]{3,}(\.\d+)?)/i;

    const percentMatch = text.match(percentPattern);
    const dateMatch = text.match(datePattern);
    const amountMatch = text.match(amountPattern);

    if (percentMatch || dateMatch || amountMatch) {
      let description = text;
      if (percentMatch) description = description.replace(percentMatch[0], '');
      if (dateMatch) description = description.replace(dateMatch[0], '');
      if (amountMatch) description = description.replace(amountMatch[0], '');

      return {
        id: Math.random().toString(36).substr(2, 9),
        milestone: description.replace(/[|•-]/g, '').trim() || 'Installment',
        percentage: percentMatch ? percentMatch[0] : '',
        date: dateMatch ? dateMatch[0] : '',
        amount: amountMatch ? amountMatch[0] : '',
        originalText: text,
      };
    }
    return null;
  };

  // --- Gemini Functions ---

  const handleAiVisionExtract = async () => {
    if (!file) return;
    setIsAiProcessing(true);
    setRawText('');
    setExtractedData([]);
    setJsonResult(null);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

      const hasContext = totalValue || handoverDate || bookingDate;

      const systemPrompt = `You are a specialized Computer Vision Data Extraction & Calculation AI. 
        Your goal is to look at the image of a property payment plan table and convert it into a structured JSON array.
        
        The JSON objects must have these keys: 
        - 'milestone' (string, description of the payment stage)
        - 'percentage' (string, e.g., '10%')
        - 'date' (string)
        - 'amount' (string)

        ${
          hasContext
            ? `
        CRITICAL CALCULATION INSTRUCTIONS:
        The user has provided the following context. You MUST use this to calculate specific values instead of extracting generic text:
        - Total Property Value: ${totalValue || 'Not provided'}
        - Booking Date (Start Date): ${bookingDate || 'Not provided'}
        - Handover/Completion Date: ${handoverDate || 'Not provided'}

        1. AMOUNT CALCULATION: If 'Total Property Value' is provided, calculate the exact amount for each row based on its percentage. (e.g. if 10% and Total is 1,000,000 -> Amount is 100,000). Format with commas.
        2. DATE CALCULATION: If dates are provided, resolve relative dates to specific dates:
           - "On Booking" -> Use Booking Date.
           - "X months from booking" -> Add X months to Booking Date.
           - "On Handover" -> Use Handover Date.
           - "X months before handover" -> Subtract X months from Handover Date.
           - "X months after handover" -> Add X months to Handover Date.
        Format calculated dates as "DD MMM YYYY".
        `
            : `
        INSTRUCTIONS:
        1. Be extremely precise with numbers.
        2. Infer column headers if they are not clear.
        3. Extract literal values from the image since no calculation context was provided.
        `
        }

        Return ONLY the JSON array. No markdown, no conversation.`;

      const userPrompt = 'Analyze this image and extract the payment plan data into JSON.';

      const result = await callGemini(userPrompt, systemPrompt, true, base64Data, file.type);

      let cleanJson = result.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
      }
      const firstBracket = cleanJson.indexOf('[');
      const lastBracket = cleanJson.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
      }

      const parsed: ParsedAIRow[] = JSON.parse(cleanJson);

      const mapped: ExtractedRow[] = parsed.map((item) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        originalText: 'AI Vision Extracted',
      }));

      setExtractedData(mapped);
      setRawText(
        `Extracted using Gemini Vision.\n${hasContext ? 'Calculations applied based on provided context.' : 'Literal extraction (no context provided).'}`,
      );
    } catch (error) {
      console.error('Vision Parse Error:', error);
      alert('AI Vision extraction failed. Please try the standard scan or check the image.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleAnalyzePlan = async () => {
    if (extractedData.length === 0) return;
    setIsAiAnalyzing(true);

    try {
      const dataString = JSON.stringify(extractedData.map((r) => `${r.milestone}: ${r.percentage} on ${r.date}`));
      const prompt = `Analyze this payment plan structure briefly. 
      1. What is the payment split (e.g., 60/40, 50/50)? 
      2. Is it back-ended (heavy on completion) or balanced? 
      3. Identify the final handover percentage.
      Keep it to 2-3 sentences max.
      Data: ${dataString}`;

      const result = await callGemini(prompt);
      setAiAnalysis(result);
    } catch (error) {
      console.error('Analysis Error:', error);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const processImage = async () => {
    if (!tesseractReady || !file || !window.Tesseract) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus('Starting Engine...');
    setJsonResult(null);

    try {
      const worker = await window.Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress);
            setStatus(`Scanning: ${Math.round(m.progress * 100)}%`);
          } else {
            const statusMap: Record<string, string> = {
              'loading tesseract core': 'Loading Core Engine...',
              'initializing tesseract': 'Initializing...',
              'initialized tesseract': 'Ready',
              'loading language traineddata': 'Downloading Language Data...',
              'loaded language traineddata': 'Language Data Loaded',
              'initializing api': 'Starting API...',
            };
            setStatus(statusMap[m.status] || m.status);
          }
        },
      });

      setStatus('Analyzing Layout...');
      const result = await worker.recognize(file);

      setRawText(result.data.text);

      if (canvasRef.current && imagePreview) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 4;
            result.data.words.forEach((word) => {
              const { x0, y0, x1, y1 } = word.bbox;
              ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
            });
          };
          img.src = imagePreview;
        }
      }

      const rows = result.data.lines.map(parseLineToRow).filter((row): row is ExtractedRow => row !== null);

      if (rows.length === 0) {
        const fallbackRows: ExtractedRow[] = result.data.lines
          .filter((l) => l.text.trim().length > 3)
          .map((line) => ({
            id: Math.random().toString(36).substr(2, 9),
            milestone: line.text,
            percentage: '',
            date: '',
            amount: '',
            originalText: line.text,
          }));
        setExtractedData(fallbackRows);
      } else {
        setExtractedData(rows);
      }

      await worker.terminate();
    } catch (err) {
      console.error(err);
      setStatus('Error: Failed to process image. Please try a clearer image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCellChange = (id: string, field: keyof ExtractedRow, value: string) => {
    setExtractedData((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleDeleteRow = (id: string) => {
    setExtractedData((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAddRow = () => {
    setExtractedData((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        milestone: 'New Milestone',
        percentage: '',
        date: '',
        amount: '',
      },
    ]);
  };

  const handleSubmit = () => {
    const payload = extractedData.map(({ id, originalText, ...rest }) => rest);
    setJsonResult(JSON.stringify(payload, null, 2));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <ScanLine className="w-8 h-8 text-indigo-600" />
              Payment Plan Extractor{' '}
              <span className="text-xs align-top bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-2 py-0.5 rounded-full font-bold ml-1">
                AI ENABLED
              </span>
            </h1>
            <p className="text-slate-500 mt-1">
              Extract tabular data from property payment plans using Computer Vision + Gemini LLM.
            </p>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-5 space-y-6">
            {/* Building Selection */}
            <Card className="p-4 border-indigo-100 bg-white">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <BuildingIcon className="w-4 h-4 text-indigo-600" />
                Select Project / Building
              </label>
              <div className="relative">
                <select
                  className="w-full pl-3 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all disabled:opacity-50 disabled:bg-slate-50 text-slate-700 font-medium"
                  onChange={(e) => handleBuildingSelect(e.target.value)}
                  disabled={isLoadingBuildings}
                  value={selectedBuildingId}
                >
                  <option value="" disabled>
                    {isLoadingBuildings ? 'Loading projects...' : 'Select a building to auto-fill details...'}
                  </option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                  {isLoadingBuildings ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  {originalPdfName ? <FileType className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  {originalPdfName ? ' PDF Document' : ' Source Document'}
                </h3>
                {imagePreview && !isProcessing && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFile(null);
                      setImagePreview(null);
                      setOriginalPdfName(null);
                    }}
                    className="!p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {!imagePreview && !isPdfRendering ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, PDF (Max 5MB)</p>
                </div>
              ) : isPdfRendering ? (
                <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-sm font-medium text-slate-700">Rendering PDF Page...</p>
                  <p className="text-xs text-slate-400 mt-1">Converting first page for processing</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {originalPdfName && (
                    <div className="text-xs bg-indigo-50 text-indigo-700 p-2 rounded border border-indigo-100 flex items-center gap-2 mb-2">
                      <FileType className="w-3 h-3" />
                      Converted <strong>{originalPdfName}</strong> (Page 1) to image for scanning.
                    </div>
                  )}

                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group shadow-inner">
                    <div className="relative max-h-[400px] overflow-auto">
                      {isProcessing || (extractedData.length > 0 && !rawText.includes('Gemini Vision')) ? (
                        <canvas ref={canvasRef} className="w-full h-auto block" />
                      ) : (
                        <img src={imagePreview ?? undefined} alt="Preview" className="w-full h-auto block" />
                      )}
                    </div>
                  </div>

                  {/* Context Inputs - Optional */}
                  <div
                    className={`transition-all duration-300 ${isProcessing || isAiProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <button
                      onClick={() => setShowContext(!showContext)}
                      className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 w-full"
                    >
                      <Calculator className="w-3 h-3" />
                      {showContext ? 'Hide Calculation Context' : 'Add Context for Calculations (Optional)'}
                    </button>

                    {showContext && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3 mb-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Total Property Value
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1.5 w-4 h-4 text-slate-400" />
                            <input
                              type="number"
                              placeholder="e.g. 1000000"
                              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                              value={totalValue}
                              onChange={(e) => setTotalValue(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Booking Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-slate-600"
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Handover Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-slate-600"
                              value={handoverDate}
                              onChange={(e) => setHandoverDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">
                          *Providing these helps AI calculate exact dates & amounts from relative payment plans.
                        </p>
                      </div>
                    )}
                  </div>

                  {isProcessing ? (
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        <span className="text-sm font-semibold text-indigo-900">
                          {status === 'Scanning: 100%' ? 'Finalizing...' : 'Processing...'}
                        </span>
                      </div>
                      <ProgressBar progress={progress} status={status} />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Primary Local OCR Action */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={processImage}
                          disabled={!tesseractReady || isAiProcessing}
                          variant="secondary"
                          className="w-full text-xs font-semibold py-3"
                          icon={Cpu}
                        >
                          Standard Scan
                        </Button>

                        {/* AI Vision Action */}
                        <Button
                          onClick={handleAiVisionExtract}
                          disabled={isAiProcessing}
                          className="w-full text-xs font-semibold py-3 bg-indigo-600 hover:bg-indigo-700"
                          icon={CloudLightning}
                        >
                          {isAiProcessing ? 'Thinking...' : 'AI Vision Scan'}
                        </Button>
                      </div>

                      {!tesseractReady && (
                        <p className="text-xs text-center text-amber-600 flex items-center justify-center gap-1 mt-2">
                          <Loader2 className="w-3 h-3 animate-spin" /> Initializing Local Engines...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* AI Upgrade Option - Show info if not processing */}
            {rawText && !isProcessing && !isAiProcessing && (
              <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">Extraction Mode Used</h4>
                    <p className="text-xs text-indigo-700 mt-1">
                      {rawText.includes('Gemini Vision')
                        ? 'Data was extracted using the Gemini Vision model.'
                        : 'Data was extracted using Standard Tesseract OCR.'}
                    </p>
                    {rawText.includes('Calculations applied') && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Auto-calculations applied.
                      </p>
                    )}
                    {!rawText.includes('Gemini Vision') && (
                      <div className="mt-2">
                        <button
                          onClick={handleAiVisionExtract}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-indigo-300 underline-offset-2"
                        >
                          Try AI Vision Scan instead?
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Debug/Raw Text View */}
            {rawText && (
              <Card className="p-4 bg-slate-50 border-dashed">
                <details>
                  <summary className="text-xs font-bold text-slate-500 cursor-pointer hover:text-indigo-600 flex items-center gap-2 select-none">
                    <Code className="w-3 h-3" /> View Raw OCR/Process Logs
                  </summary>
                  <pre className="mt-2 text-[10px] text-slate-600 whitespace-pre-wrap font-mono h-32 overflow-y-auto p-2 bg-white rounded border border-slate-200">
                    {rawText}
                  </pre>
                </details>
              </Card>
            )}
          </div>

          {/* Right Column: Data Editor & Export */}
          <div className="lg:col-span-7 space-y-6">
            {/* Updated Card: Removed h-full, added flex and min/max heights */}
            <Card className="flex flex-col min-h-[500px] h-auto">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">Extracted Data</h3>
                  <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                    {extractedData.length} Rows
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleAnalyzePlan}
                    disabled={extractedData.length === 0 || isAiAnalyzing}
                    className="!py-1 !px-3 text-xs text-violet-600 hover:bg-violet-50"
                  >
                    {isAiAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                    Analyze
                  </Button>
                  <Button variant="secondary" onClick={handleAddRow} className="!py-1 !px-3 text-xs">
                    + Add Row
                  </Button>
                </div>
              </div>

              {aiAnalysis && (
                <div className="mx-4 mt-4 p-3 bg-violet-50 border border-violet-100 rounded-lg text-xs text-violet-800 flex gap-3 animate-in fade-in slide-in-from-top-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">AI Plan Analysis:</span>
                    {aiAnalysis}
                  </div>
                  <button onClick={() => setAiAnalysis('')} className="ml-auto text-violet-400 hover:text-violet-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-auto bg-slate-50 p-4">
                {extractedData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                      <Eye className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm">Upload an image and click extract to see data here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-2 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-4">Milestone</div>
                      <div className="col-span-2">Percentage</div>
                      <div className="col-span-3">Date</div>
                      <div className="col-span-2">Amount</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Rows */}
                    {extractedData.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors group"
                      >
                        <div className="col-span-4">
                          <input
                            className="w-full text-sm font-medium text-slate-900 border-none p-1 focus:ring-1 focus:ring-indigo-500 rounded bg-transparent"
                            value={row.milestone}
                            onChange={(e) => handleCellChange(row.id, 'milestone', e.target.value)}
                            placeholder="Milestone Desc"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full text-sm text-slate-600 border-none p-1 focus:ring-1 focus:ring-indigo-500 rounded bg-transparent"
                            value={row.percentage}
                            onChange={(e) => handleCellChange(row.id, 'percentage', e.target.value)}
                            placeholder="%"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            className="w-full text-sm text-slate-600 border-none p-1 focus:ring-1 focus:ring-indigo-500 rounded bg-transparent"
                            value={row.date}
                            onChange={(e) => handleCellChange(row.id, 'date', e.target.value)}
                            placeholder="Date"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            className="w-full text-sm text-slate-600 border-none p-1 focus:ring-1 focus:ring-indigo-500 rounded bg-transparent"
                            value={row.amount}
                            onChange={(e) => handleCellChange(row.id, 'amount', e.target.value)}
                            placeholder="Amount"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setExtractedData([])} disabled={extractedData.length === 0}>
                  Clear All
                </Button>
                <Button onClick={handleSubmit} disabled={extractedData.length === 0} icon={CheckCircle}>
                  Confirm & Generate JSON
                </Button>
              </div>
            </Card>

            {/* JSON Result */}
            {jsonResult && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-600" /> API Payload Preview
                  </h3>
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                    Ready to Send
                  </span>
                </div>
                <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">POST /api/payment-plans</span>
                  </div>
                  {/* Added max-h-96 and overflow-y-auto to prevent huge gaps */}
                  <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 overflow-y-auto">
                    {jsonResult}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
