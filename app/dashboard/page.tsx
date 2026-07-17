"use client";

import { Document } from "@/types/upload";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { deleteDocument, getUserDocuments } from "@/lib/firebaseops";
import { Button } from "@/components/ui/button";
import DocumentCard from "@/components/DashboardPage/DocumentCard";
import { DocumentGridSkeleton } from "@/components/DashboardPage/DocumentCardSkeleton";
import {
  DocumentSearchFilters,
  SortOption,
} from "@/components/DashboardPage/DocumentSearchFilters";
import { AddDocumentCard } from "@/components/DashboardPage/AddDocumentCard";
import { useDocumentNavigation } from "@/lib/navigationUtils";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Page = () => {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const { goToUpload, goToDocument, goToDocumentEdit } =
    useDocumentNavigation();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const ITEMS_PER_PAGE = 10;

  const totalPages =
    filteredDocuments.length <= ITEMS_PER_PAGE - 1
      ? 1
      : 1 +
        Math.ceil(
          (filteredDocuments.length - (ITEMS_PER_PAGE - 1)) / ITEMS_PER_PAGE,
        );

  const startIndex =
    currentPage === 1 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE - 1;
  const endIndex = currentPage * ITEMS_PER_PAGE - 1;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  useEffect(() => {
    if (user?.id) {
      fetchDocuments();
    }
  }, [user?.id]);

  useEffect(() => {
    setCurrentPage(1);
    filterDocuments();
  }, [documents, searchTerm, sortOption]);

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

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.originalFilename
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          );
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "size-desc":
          return b.fileSize - a.fileSize;
        case "most-chats":
          return (b.totalChats ?? 0) - (a.totalChats ?? 0);
        default:
          return 0;
      }
    });

    setFilteredDocuments(sorted);
  };

  const handleDeleteDocument = async (documentId: string) => {
    const confirmed = await confirm({
      title: "Delete Document",
      message:
        "This will permanently delete the document and all its chat history. This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      destructive: true,
    });
    if (!confirmed) return;

    try {
      await deleteDocument(documentId);
      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document. Please try again.");
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const response = await fetch(document.cloudinaryUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.originalFilename || `${document.title}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download document. Please try again.");
    }
  };

  return (
    <div className="p-8 min-h-screen">
      {ConfirmDialogComponent}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-gray-300 mb-2">My Documents</h1>
        <p className="text-slate-400">
          {loading
            ? "Loading documents..."
            : (() => {
                const count = documents.length;
                const pluralSuffix = count === 1 ? "" : "s";
                return `${count} document${pluralSuffix} stored`;
              })()}
        </p>
      </div>

      <DocumentSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading ? (
          <DocumentGridSkeleton count={10} />
        ) : (
          <>
            {currentPage === 1 && <AddDocumentCard onClick={goToUpload} />}

            {paginatedDocuments.map((document) => (
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
              <div className="text-center py-12 col-span-full">
                <p className="text-slate-400 text-lg mb-4">
                  No documents match your search criteria
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSortOption("newest");
                  }}
                  variant="outline"
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 text-slate-300 border-slate-700/50 cursor-pointer hover:bg-gradient-to-br hover:from-purple-600/10 hover:to-purple-900/10 hover:border-purple-500/50 hover:text-slate-300 transition-all duration-300"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 py-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="ghost"
            className="cursor-pointer text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-slate-400 text-sm">
            Page{" "}
            <strong className="text-slate-200 font-semibold">
              {currentPage}
            </strong>{" "}
            of{" "}
            <strong className="text-slate-200 font-semibold">
              {totalPages}
            </strong>
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            variant="ghost"
            className="cursor-pointer text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Page;
