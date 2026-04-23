export type RefreshFn = () => Promise<string>;

export class TeamViewerClient {
  private readonly baseUrl = "https://webapi.teamviewer.com/api/v1";
  private token: string;
  private readonly refreshFn?: RefreshFn;

  constructor(token: string, refreshFn?: RefreshFn) {
    this.token = token;
    this.refreshFn = refreshFn;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && this.refreshFn) {
      this.token = await this.refreshFn();
      return this.request<T>(method, path, body, query);
    }

    if (!response.ok) {
      let errorMessage = `TeamViewer API error: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) errorMessage += ` — ${errorBody}`;
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (response.status === 204 || !contentType.includes("application/json")) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>("GET", path, undefined, query);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  delete<T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>("DELETE", path, body, query);
  }
}
