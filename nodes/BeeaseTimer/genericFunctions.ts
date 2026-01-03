// nodes/Beease/GenericFunctions.ts
import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestOptions,
	INodeExecutionData,
	IDataObject,
} from "n8n-workflow";

type N8nThis = IExecuteFunctions | ILoadOptionsFunctions;
type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toIDataObject(value: unknown): IDataObject {
	if (isRecord(value)) return value as IDataObject;
	return { value } as IDataObject;
}

export async function beeaseTrpcCall<T = unknown>(
	this: N8nThis,
	procedure: string,
	input: unknown,
	method: 'GET' | 'POST' = 'POST',
): Promise<T> {
	// URL de production - Pour développement local, remplacer par 'http://localhost:3001'
	const baseUrl = 'http://79.137.37.169:8020/api'.replace(/\/$/, "");

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/api/${procedure}`,
		json: true,
	};

	if (method === 'POST') {
		options.url += '?batch=1';
		options.body = { 0: input ?? null };
	} else {
		// Pour GET, utiliser le format batch tRPC
		options.url += '?batch=1&input=' + encodeURIComponent(JSON.stringify({ 0: input ?? null }));
	}

	const res = await this.helpers.httpRequestWithAuthentication.call(
		this,
		"beeaseTimerApi",
		options,
	);

	return extractTrpcJson<T>(res);
}

function extractTrpcJson<T>(res: unknown): T {
  // Si c'est un tableau direct, on le retourne
  if (Array.isArray(res)) {
    // Vérifier si c'est un tableau de réponses batch [{ result: ... }]
    if (res.length > 0 && isRecord(res[0]) && "result" in res[0]) {
      const first = res[0];
      if (isRecord(first.result) && "data" in first.result) {
        const data = (first.result as UnknownRecord).data;
        if (isRecord(data) && "json" in data) {
          return (data as UnknownRecord).json as T;
        }
        return data as T;
      }
    }
    return res as T;
  }

  // Format batch avec clé "0"
  const first = isRecord(res) && "0" in res
    ? (res["0"] as unknown)
    : res;

  if (isRecord(first) && isRecord(first.result) && "data" in first.result) {
    const data = (first.result as UnknownRecord).data;

    // certains montages mettent data.json
    if (isRecord(data) && "json" in data) {
      return (data as UnknownRecord).json as T;
    }

    // ton cas probable: data = array
    return data as T;
  }

  return first as T;
}

export function toNodeItems(data: unknown): INodeExecutionData[] {
	if (data === null || data === undefined) return [{ json: {} }];

	if (Array.isArray(data)) {
		return data.map((d) => ({ json: toIDataObject(d) }));
	}

	return [{ json: toIDataObject(data) }];
}

export function pickNonEmptyObject(input: unknown): UnknownRecord {
	if (!isRecord(input)) return {};

	const out: UnknownRecord = {};
	for (const [k, v] of Object.entries(input)) {
		// n8n collection renvoie parfois "" par défaut → on ignore
		if (v === "" || v === null || v === undefined) continue;
		out[k] = v;
	}
	return out;
}

export function safeString(value: unknown): string {
	return typeof value === "string" ? value : "";
}
