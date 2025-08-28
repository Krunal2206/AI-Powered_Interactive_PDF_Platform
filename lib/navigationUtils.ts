import { useRouter } from "next/navigation";

export const useDocumentNavigation = () => {
  const router = useRouter();

  return {
    goToDashboard: () => router.push("/dashboard"),
    goToUpload: () => router.push("/dashboard/upload"),
    goToDocument: (id: string) => router.push(`/dashboard/document/${id}`),
    goToDocumentEdit: (id: string) =>
      router.push(`/dashboard/document/${id}/edit`),
    goToChat: (id: string) => router.push(`/dashboard/chat/${id}`),
    goBack: () => router.back(),
  };
};
