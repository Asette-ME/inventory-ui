'use client';

import {
  Banknote,
  Building as BuildingIcon,
  CheckCircle,
  ChevronDownIcon,
  CloudLightning,
  Code,
  Cpu,
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
import { toast } from 'sonner';

import { callGeminiAction, savePaymentPlanAction } from '@/app/payment-plan/actions';
import { fetchBuildingsAction } from '@/lib/actions/buildings';
import type { ExtractedRow, ParsedAIRow, TesseractLine } from '@/app/payment-plan/types';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// --- Types ---

interface BuildingData {
  id: number;
  title: string;
  hand_over_date: string | null;
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null);

  // Fetch Buildings
  useEffect(() => {
    const fetchBuildings = async () => {
      setIsLoadingBuildings(true);
      try {
        const data = await fetchBuildingsAction();
        data.sort((a: BuildingData, b: BuildingData) => a.title.localeCompare(b.title));
        setBuildings(data);
      } catch (error) {
        console.error('Error fetching buildings:', error);
        toast.error('Failed to load buildings');
      } finally {
        setIsLoadingBuildings(false);
      }
    };

    fetchBuildings();
  }, []);

  const handleBuildingSelect = (item: BuildingData | null) => {
    if (!item) return;

    setSelectedBuilding(item);

    if (item.hand_over_date) {
      // Format date to YYYY-MM-DD for input[type="date"]
      const dateObj = new Date(item.hand_over_date);
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
    setAiAnalysis('');
    setRawText('');
    setProgress(0);
    setStatus('');
    setOriginalPdfName(null);

    // Handle PDF
    if (selectedFile.type === 'application/pdf') {
      if (!pdfJsReady) {
        toast.warning('PDF Engine is still loading. Please wait a moment and try again.');
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
      toast.error('Failed to render PDF. Please try an image file instead.');
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
      toast.success('AI Vision extraction complete!');
    } catch (error) {
      console.error('Vision Parse Error:', error);
      toast.error('AI Vision extraction failed. Please try the standard scan or check the image.');
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
      toast.success('Plan analysis complete');
    } catch (error) {
      console.error('Analysis Error:', error);
      toast.error('Failed to analyze plan');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const processImage = async () => {
    if (!tesseractReady || !file || !window.Tesseract) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus('Starting Engine...');

    try {
      const worker = await window.Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress);
            setStatus('Scanning');
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
      toast.success('Standard scan complete');
    } catch (err) {
      console.error(err);
      setStatus('Error: Failed to process image.');
      toast.error('Failed to process image. Please try a clearer image.');
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

  const handleSubmit = async () => {
    if (!selectedBuilding) {
      toast.error('Please select a building first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = extractedData.map(({ id, originalText, ...rest }) => rest);
      await savePaymentPlanAction(selectedBuilding.id.toString(), payload);
      toast.success('Payment plan saved successfully!');
    } catch (error) {
      console.error('Failed to save payment plan:', error);
      toast.error('Failed to save payment plan. Please check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="text-primary" />
            <h1 className="text-2xl font-bold mb-0">Payment Plan Extractor</h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground">
          Extract structured property payment plans using Computer Vision + Gemini LLM.
        </p>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Building Selection */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <BuildingIcon className=" text-primary" />
                  Building
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Combobox
                items={buildings}
                onValueChange={handleBuildingSelect}
                itemToStringLabel={(item: BuildingData) => item.title}
                itemToStringValue={(item: BuildingData) => item.title}
              >
                <ComboboxInput
                  disabled={isLoadingBuildings}
                  placeholder={isLoadingBuildings ? 'Loading buildings...' : 'Select a building'}
                />
                <ComboboxContent>
                  <ComboboxEmpty>Building not found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: BuildingData) => (
                      <ComboboxItem key={item.id} value={item}>
                        {item.title}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  {originalPdfName ? <FileType className="text-primary" /> : <FileText className="text-primary" />}
                  {originalPdfName ? ' PDF Document' : ' Source Document'}
                </div>
              </CardTitle>
              <CardAction>
                {imagePreview && (
                  <Button
                    disabled={isProcessing}
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setFile(null);
                      setImagePreview(null);
                      setOriginalPdfName(null);
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 />
                  </Button>
                )}
              </CardAction>
            </CardHeader>

            <CardContent>
              {!imagePreview && !isPdfRendering ? (
                <div className="border-2 border-dashed rounded-xl p-10 text-center hover:bg-slate-50 dark:hover:bg-background/50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 bg-purple-400/10 dark:bg-purple-700/10 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-foreground/70">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs mt-1">Supports JPG, PNG, PDF (Max 5MB)</p>
                  </div>
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
                  <div className="p-3 py-4 rounded-lg border space-y-3 animate-in fade-in slide-in-from-top-2">
                    <Field>
                      <FieldLabel className="text-slate-500 uppercase text-[10px] font-bold" htmlFor="totalValue">
                        Total Property Value
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <Banknote />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="totalValue"
                          type="number"
                          placeholder="e.g. 1000000"
                          value={totalValue}
                          onChange={(e) => setTotalValue(e.target.value)}
                        />
                      </InputGroup>
                    </Field>

                    <FieldGroup className="grid grid-cols-1 sm:grid-cols-2">
                      <Field>
                        <FieldLabel className="text-slate-500 uppercase text-[10px] font-bold" htmlFor="bookingDate">
                          Booking Date
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id="bookingDate"
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                          />
                        </InputGroup>
                      </Field>

                      <Field>
                        <FieldLabel className="text-slate-500 uppercase text-[10px] font-bold" htmlFor="handoverDate">
                          Handover Date
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            id="handoverDate"
                            type="date"
                            value={handoverDate}
                            onChange={(e) => setHandoverDate(e.target.value)}
                          />
                        </InputGroup>
                      </Field>
                    </FieldGroup>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col">
              {imagePreview && !isProcessing && (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button onClick={processImage} disabled={!tesseractReady || isAiProcessing} variant="outline">
                    {tesseractReady ? (
                      <>
                        <Cpu />
                        Standard Scan
                      </>
                    ) : (
                      <>
                        <Loader2 className="animate-spin" /> Initializing OCR...
                      </>
                    )}
                  </Button>

                  <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                    onClick={handleAiVisionExtract}
                    disabled={isAiProcessing}
                  >
                    <CloudLightning />
                    {isAiProcessing ? 'Thinking...' : 'AI Vision Scan'}
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="w-full bg-purple-50 rounded-lg p-4 border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="text-primary animate-spin" />
                    <span className="text-sm font-semibold text-primary">
                      {progress === 1 ? 'Finalizing...' : 'Processing...'}
                    </span>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <span>{status || 'Initializing...'}</span>
                      <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <Progress value={progress * 100} />
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>

          {/* AI Upgrade Option - Show info if not processing */}
          {rawText && !isProcessing && !isAiProcessing && (
            <Card className="bg-gradient-to-br from-purple-100/40 to-blue-100/40 border-purple-400 dark:from-purple-900/10 dark:to-blue-500/10 dark:border-purple-900">
              <CardHeader>
                <CardAction>
                  <div className="p-2 bg-purple-400/20 dark:bg-purple-900/40 rounded-lg text-purple-600">
                    <ScanLine />
                  </div>
                </CardAction>
                <CardTitle>Extraction Mode</CardTitle>
                <CardDescription>
                  {rawText.includes('Gemini Vision')
                    ? 'Data was extracted using the Gemini Vision model.'
                    : 'Data was extracted using OCR.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rawText.includes('Calculations applied') && (
                  <div className="text-emerald-600 flex items-center gap-2">
                    <CheckCircle />
                    <p>Auto-calculations applied.</p>
                  </div>
                )}
                {!rawText.includes('Gemini Vision') && (
                  <Button variant="outline" onClick={handleAiVisionExtract}>
                    Try AI Vision Scan instead?
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Debug/Raw Text View */}
          {rawText && (
            <Card>
              <CardContent>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="group w-full">
                      <Code />
                      View Raw OCR/Process Logs
                      <ChevronDownIcon className="ml-auto group-data-[state=open]:rotate-180 transition-all" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <pre className="text-[10px] text-slate-400 whitespace-pre-wrap font-mono h-32 overflow-y-auto p-2 rounded border border-slate-200">
                      {rawText}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Data Editor & Export */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TableIcon className="text-primary" />
                <CardTitle>Extracted Data</CardTitle>
                <Badge variant="secondary">{extractedData.length} Rows</Badge>
              </div>
              <CardAction>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAnalyzePlan}
                    disabled={extractedData.length === 0 || isAiAnalyzing}
                    className="text-primary hover:bg-primary hover:text-white"
                  >
                    {isAiAnalyzing ? <Loader2 className="animate-spin" /> : <Zap />}
                    Analyze
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAddRow}>
                    + Add Row
                  </Button>
                </div>
              </CardAction>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              {aiAnalysis && (
                <div className="m-4 p-3 bg-violet-50 border border-violet-100 rounded-lg text-xs text-violet-800 flex gap-3 animate-in fade-in slide-in-from-top-2">
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

              <div className="flex-1 overflow-auto bg-slate-50 dark:bg-background/50 p-4">
                {extractedData.length === 0 ? (
                  <div className="min-h-[250px] text-foreground/50 h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-foreground/10 rounded-full flex items-center justify-center">
                      <Eye className="w-8 h-8" />
                    </div>
                    <p className="text-sm">Upload an image and click extract to see data here.</p>
                  </div>
                ) : (
                  <div className="relative border rounded-lg bg-[var(--card)] overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Milestone</TableHead>
                          <TableHead className="min-w-[80px] w-[80px] text-center">%</TableHead>
                          <TableHead className="min-w-[150px] text-center">Date</TableHead>
                          <TableHead className="min-w-[150px] text-center">Amount</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extractedData.map((row) => (
                          <TableRow key={row.id} className="group">
                            <TableCell>
                              <Input
                                className="h-8 text-sm font-medium border-none shadow-none focus-visible:ring-1"
                                value={row.milestone}
                                onChange={(e) => handleCellChange(row.id, 'milestone', e.target.value)}
                                placeholder="Milestone Desc"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm text-center border-none shadow-none focus-visible:ring-1"
                                value={row.percentage}
                                onChange={(e) => handleCellChange(row.id, 'percentage', e.target.value)}
                                placeholder="%"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm text-center border-none shadow-none focus-visible:ring-1"
                                value={row.date}
                                onChange={(e) => handleCellChange(row.id, 'date', e.target.value)}
                                placeholder="Date"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                className="h-8 text-sm text-center border-none shadow-none focus-visible:ring-1"
                                value={row.amount}
                                onChange={(e) => handleCellChange(row.id, 'amount', e.target.value)}
                                placeholder="Amount"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDeleteRow(row.id)}
                                className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setExtractedData([])}
                disabled={extractedData.length === 0 || isSubmitting}
              >
                Clear All
              </Button>
              <Button onClick={handleSubmit} disabled={extractedData.length === 0 || isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                {isSubmitting ? 'Saving...' : 'Confirm & Save'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
