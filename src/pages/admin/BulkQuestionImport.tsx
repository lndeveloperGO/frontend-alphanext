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
} from "@/lib/questionService";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BulkQuestionImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const TEMPLATE_LINK = "https://docs.google.com/spreadsheets/d/14D2YG23BEtuaZjwelRvhTKfvSiCwVbIZ8xTbRcwjpwI/edit?usp=sharing";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmitImport = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await questionService.importQuestions(file);
      setResult(response);
      setResultOpen(true);

      toast({
        title: "Success",
        description: response.message || `Created ${response.success} question(s)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to import questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout type="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Bulk Import Questions</h1>
          <p className="text-muted-foreground">
            Import multiple questions with options using Excel template
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Import Questions</CardTitle>
            <CardDescription>
              Upload an Excel file (.xlsx, .xls) following the provided template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template Information */}
            <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium">Excel Template</p>
                <p className="text-sm text-muted-foreground">Download or copy the template to ensure correct format</p>
              </div>
              <Button variant="outline" asChild>
                <a href={TEMPLATE_LINK} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Template
                </a>
              </Button>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-muted/50 cursor-pointer transition relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <div className="space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Excel files (.xlsx, .xls)
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleSubmitImport}
                disabled={!file || loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Upload & Import
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Excel Format Guide</CardTitle>
            <CardDescription>Required columns in your Excel file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted text-left">
                    <th className="p-2 border">Column</th>
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border">Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-mono">category_id</td>
                    <td className="p-2 border">ID of the question category</td>
                    <td className="p-2 border text-green-600">Yes</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-mono">question</td>
                    <td className="p-2 border">The question text</td>
                    <td className="p-2 border text-green-600">Yes</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-mono">question_type</td>
                    <td className="p-2 border">'text' or 'image'</td>
                    <td className="p-2 border">No (default: text)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-mono">question_image_url</td>
                    <td className="p-2 border">Public URL for question image</td>
                    <td className="p-2 border">No</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-mono">opt_x_text</td>
                    <td className="p-2 border">Text for option A, B, C...</td>
                    <td className="p-2 border text-green-600">Min 2</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-mono">opt_x_score</td>
                    <td className="p-2 border">Score value for option X</td>
                    <td className="p-2 border text-green-600">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
                    {result.data.errors.map((err: any, idx: number) => (
                      <div key={idx} className="text-sm p-2 bg-red-50 rounded text-red-700 border border-red-100">
                        Item {err.index != null ? err.index + 1 : idx + 1}: {err.error || JSON.stringify(err)}
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
