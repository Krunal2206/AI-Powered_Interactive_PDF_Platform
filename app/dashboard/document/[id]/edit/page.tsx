"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, FileText, Loader2 } from "lucide-react";
import { Document } from "@/types/upload";
import { getDocument, updateDocument } from "@/lib/firebaseops";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/DashboardPage/LoadingSpinner";
import { ErrorMessage } from "@/components/DashboardPage/ErrorMessage";
import { useDocumentNavigation } from "@/lib/navigationUtils";

const DocumentEditPage = () => {
  const params = useParams();
  const { user } = useUser();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const {goToDocument, goToDashboard} = useDocumentNavigation();

  const documentId = params.id as string;

  useEffect(() => {
    if (documentId && user?.id) {
      fetchDocument();
    }
  }, [documentId, user?.id]);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setDescription(document.description || "");
    }
  }, [document]);

  useEffect(() => {
    if (document) {
      const titleChanged = title !== document.title;
      const descriptionChanged = description !== (document.description || "");
      setHasChanges(titleChanged || descriptionChanged);
    }
  }, [title, description, document]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const doc = await getDocument(documentId);

      if (!doc) {
        setError("Document not found");
        return;
      }

      // Check if user owns this document
      if (doc.userId !== user?.id) {
        setError("Access denied");
        return;
      }

      setDocument(doc);
    } catch (err) {
      console.error("Error fetching document:", err);
      setError("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!document || !hasChanges) return;

    try {
      setSaving(true);

      const updateData: { title?: string; description?: string } = {};

      if (title !== document.title) {
        updateData.title = title.trim();
      }

      if (description !== (document.description || "")) {
        updateData.description = description.trim();
      }

      await updateDocument(documentId, updateData);

      // Update local state
      setDocument((prev) => (prev ? { ...prev, ...updateData } : null));
      setHasChanges(false);

      // Show success message or redirect
      goToDocument(documentId);
    } catch (err) {
      console.error("Error updating document:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        goToDocument(documentId);
      }
    } else {
      goToDocument(documentId);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !document) {
    return (
      <ErrorMessage
        title={error || "Document not found"}
        message="The document you're looking for doesn't exist or you don't have access to it."
        onBackClick={goToDashboard}
      />
    );
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 mb-4 p-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Document
          </Button>

          <h1 className="text-3xl font-light text-gray-300 mb-2">
            Edit Document
          </h1>
          <p className="text-slate-400">Update your document information</p>
        </div>

        {/* Edit Form */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 p-6">
          {/* Document Info Header */}
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-700/50">
            <div className="p-3 rounded-lg bg-slate-700/30">
              <FileText size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Original Filename</p>
              <p className="text-slate-200">{document.originalFilename}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-slate-300 text-sm font-medium"
              >
                Document Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="bg-slate-800/50 border-slate-700 text-slate-300 placeholder-slate-500 focus:border-purple-500"
                required
              />
              <p className="text-slate-500 text-xs">
                This is how your document will be displayed in your library
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-slate-300 text-sm font-medium"
              >
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your document"
                className="bg-slate-800/50 border-slate-700 text-slate-300 placeholder-slate-500 focus:border-purple-500 min-h-[100px]"
                rows={4}
              />
              <p className="text-slate-500 text-xs">
                Add notes or context about this document
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-700/50">
            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving || !title.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-white/20 hover:bg-white/10 hover:text-white hover:shadow-purple-500/25 shadow-2xl transition-all duration-300 cursor-pointer"
              >
                Cancel
              </Button>
            </div>

            {hasChanges && (
              <p className="text-yellow-400 text-sm">
                You have unsaved changes
              </p>
            )}
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Preview</h3>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
            <h4 className="text-slate-300 font-medium mb-2">
              {title || "Untitled Document"}
            </h4>
            {description && (
              <p className="text-slate-400 text-sm mb-2">{description}</p>
            )}
            <p className="text-slate-500 text-xs">
              {document.originalFilename}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditPage;
