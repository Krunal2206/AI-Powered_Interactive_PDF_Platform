"use client";

import { Document } from "@/types/upload";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { deleteDocument, getUserDocuments } from "@/lib/firebaseops";
import { Button } from "@/components/ui/button";
import DocumentCard from "@/components/DashboardPage/DocumentCard";
import { LoadingSpinner } from "@/components/DashboardPage/LoadingSpinner";
import { DocumentSearchFilters } from "@/components/DashboardPage/DocumentSearchFilters";
import { AddDocumentCard } from "@/components/DashboardPage/AddDocumentCard";
import { useDocumentNavigation } from "@/lib/navigationUtils";

const Page = () => {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const { goToUpload, goToDocument, goToDocumentEdit } =
    useDocumentNavigation();

  useEffect(() => {
    if (user?.id) {
      fetchDocuments();
    }
  }, [user?.id]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, statusFilter]);

  const fetchDocuments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userDocuments = await getUserDocuments(user.id);
      setDocuments(userDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.originalFilename
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await deleteDocument(documentId);
      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  const handleDownloadDocument = (document: Document) => {
    window.open(document.cloudinaryUrl, "_blank");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-gray-300 mb-2">My Documents</h1>
        <p className="text-slate-400">
          {documents.length} document{documents.length > 1 ? "s" : ""} stored
        </p>
      </div>

      <DocumentSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AddDocumentCard onClick={goToUpload} />

        {filteredDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onView={(document) => goToDocument(document.id)}
            onEdit={(document) => goToDocumentEdit(document.id)}
            onDelete={handleDeleteDocument}
            onDownload={handleDownloadDocument}
          />
        ))}

        {filteredDocuments.length === 0 && documents.length > 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">
              No documents match your search criteria
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              variant="outline"
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-slate-300 border-slate-700/50 cursor-pointer hover:bg-gradient-to-br hover:from-purple-600/10 hover:to-purple-900/10 hover:border-purple-500/50 hover:text-slate-300 transition-all duration-300"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
