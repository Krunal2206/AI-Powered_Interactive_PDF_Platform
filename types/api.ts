export type RouteParams<T extends Record<string, string> = Record<string, string>> = {
  params: Promise<T>;
};

export type DocumentIdParam = RouteParams<{ documentId: string }>;

export type IdParam = RouteParams<{ id: string }>;

