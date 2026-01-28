import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  questionService,
  BulkCreateQuestionInput,
  BulkQuestionItem,
} from "@/lib/questionService";
import { Upload, FileJson, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BulkQuestionImport() {
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<BulkQuestionItem[]>([]);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleParseJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      if (!parsed.items || !Array.isArray(parsed.items)) {
        throw new Error("Invalid format: 'items' array is required");
      }

      // Validasi setiap item
      parsed.items.forEach((item: any, index: number) => {
        if (!item.category_id) {
          throw new Error(`Item ${index + 1}: category_id is required`);
        }
        if (!item.question) {
          throw new Error(`Item ${index + 1}: question text is required`);
        }
        if (!item.options || !Array.isArray(item.options)) {
          throw new Error(`Item ${index + 1}: options array is required`);
        }
        if (item.options.length === 0) {
          throw new Error(`Item ${index + 1}: at least one option is required`);
        }
      });

      setPreviewData(parsed.items);
      setPreviewOpen(true);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description:
          error instanceof Error ? error.message : "Failed to parse JSON",
        variant: "destructive",
      });
    }
  };

  const handleLoadTemplate = () => {
    const template = {
      items: [
        {
          category_id: 1,
          question: "2 + 2 = ?",
          explanation: "2 + 2 = 4",
          options: [
            { label: "A", text: "3", score_value: 0 },
            { label: "B", text: "4", score_value: 5 },
            { label: "C", text: "5", score_value: 1 },
            { label: "D", text: "6", score_value: -1 },
          ],
        },
        {
          category_id: 1,
          question: "10 / 2 = ?",
          explanation: "10 / 2 = 5",
          options: [
            { label: "A", text: "2", score_value: 0 },
            { label: "B", text: "5", score_value: 5 },
          ],
        },
      ],
    };
    setJsonInput(JSON.stringify(template, null, 2));
  };

  const handleSubmitBulk = async () => {
    try {
      setLoading(true);
      const input: BulkCreateQuestionInput = {
        items: previewData,
      };

      const response = await questionService.bulkCreateQuestions(input);
      setResult(response);
      setPreviewOpen(false);
      setResultOpen(true);

      toast({
        title: "Success",
        description: `Created ${response.success} question(s)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setJsonInput(text);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Bulk Import Questions</h1>
          <p className="text-muted-foreground">
            Import multiple questions with options using JSON format
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Import Questions</CardTitle>
            <CardDescription>
              Paste JSON or upload a JSON file to create multiple questions at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 cursor-pointer transition">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">Upload JSON file</p>
                <p className="text-sm text-muted-foreground">
                  or drag and drop
                </p>
              </label>
            </div>

            {/* JSON Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">JSON Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON here..."
                className="w-full h-64 p-3 border rounded-md font-mono text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleLoadTemplate}>
                Load Template
              </Button>
              <Button onClick={handleParseJSON}>
                <FileJson className="mr-2 h-4 w-4" />
                Preview & Validate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* JSON Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">JSON Format Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
{`{
  "items": [
    {
      "category_id": 1,
      "question": "2 + 2 = ?",
      "explanation": "2 + 2 = 4",
      "options": [
        { "label": "A", "text": "3", "score_value": 0 },
        { "label": "B", "text": "4", "score_value": 5 },
        { "label": "C", "text": "5", "score_value": 1 },
        { "label": "D", "text": "6", "score_value": -1 }
      ]
    }
  ]
}`}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Questions</DialogTitle>
            <DialogDescription>
              Review the questions before importing ({previewData.length} items)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {previewData.map((item, index) => (
              <div key={index} className="p-3 border rounded-md bg-muted/50">
                <div className="font-medium mb-2">
                  {index + 1}. {item.question.substring(0, 80)}
                  {item.question.length > 80 ? "..." : ""}
                </div>
                <div className="text-xs space-y-1 ml-2">
                  <div>Category ID: {item.category_id}</div>
                  <div>Options: {item.options.length}</div>
                  {item.explanation && (
                    <div>Explanation: {item.explanation.substring(0, 60)}...</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitBulk} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Result</DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Created
                        </p>
                        <p className="text-2xl font-bold">{result.success}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold">{result.failed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {result.data?.errors && result.data.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Errors:</p>
                  <div className="space-y-1">
                    {result.data.errors.map((err: any, idx: number) => (
                      <div key={idx} className="text-sm p-2 bg-red-50 rounded text-red-700">
                        Item {err.index + 1}: {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">{result.message}</p>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setResultOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}