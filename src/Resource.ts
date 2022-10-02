type Body =  null | undefined |
  ArrayBuffer |
  Blob |
  Document |
  Record<string, unknown> |
  string |
  ReadableStream |
  DataView |
  FormData |
  URLSearchParams |
  String;

interface Bodies {
  response: Body;
  responseText: string | null;
  responseXML: Document | XMLDocument | null;
}

type ResponseHeaders = Headers | Record<string, string>;

interface Options {
  status?: number,
  statusText?: string,
  headers?: ResponseHeaders,
}

export default class Resource {
  response: Body = null;
  #responseText: string | null = null;
  #responseXML: Document | null = null;

  status: number = 0;
  statusText: string = "";

  ok: boolean = false;

  headers: ResponseHeaders = {}

  constructor(
    bodies: Bodies = {
      response: null,
      responseText: null,
      responseXML: null,
    },
    options: Options = {}
  ) {
    this.response = bodies['response'];
    this.#responseText = bodies['responseText'];
    this.#responseXML = bodies['responseXML'];

    if (options.status) this.setStatus(options.status);
    if (options.statusText) this.statusText = options.statusText;
    if (options.headers) this.headers = options.headers;
  }

  setStatus(statusCode: number) {
    this.status = statusCode;

    if (Math.ceil(statusCode / 100))
      this.ok = true;
  }

  async text(): Promise<string | null> {
    return this.#responseText;
  }
  async json() {
    return JSON.parse(this.#responseText ?? "");
  }
  async formData() {

  }
  async blob(): Promise<Blob | null> {
    return this.response instanceof Blob ?
      this.response :
      null;
  }
  async arrayBuffer(): Promise<ArrayBuffer | null> {
    return this.response instanceof ArrayBuffer ?
      this.response :
      null;
  }
  async document(): Promise<Document | XMLDocument | null> {
    return this.#responseXML;
  }
}
