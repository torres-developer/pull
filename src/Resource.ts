//type Body =  null | undefined |
//  ArrayBuffer |
//  Blob |
//  Document |
//  Record<string, unknown> |
//  string |
//  ReadableStream |
//  DataView |
//  FormData |
//  URLSearchParams |
//  String;

interface Bodies {
  // response: Body;
  response: Blob | null;
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
  //#response: Body = null;
  response: Blob | null = null;
  responseText: string | null = null;
  responseXML: Document | null = null;

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
    this.responseText = bodies['responseText'];
    this.responseXML = bodies['responseXML'];

    if (options.status) this.setStatus(options.status);
    if (options.statusText) this.statusText = options.statusText;
    if (options.headers) this.headers = options.headers;
  }

  setStatus(statusCode: number) {
    this.status = statusCode;

    if (Math.ceil(statusCode / 100))
      this.ok = true;
  }

  text = async (): Promise<string | null> => {
    return this.responseText ?? await this.response?.text() ?? null;
  }
  json = async () => {
    return JSON.parse(await this.text() ?? "");
  }
  formData = async () => {

  }
  blob = async (): Promise<Blob | null | any> => {
    return this.response instanceof Blob ?
      this.response :
      null;
  }
  arrayBuffer = async (): Promise<ArrayBuffer | null> => {
    return this.response instanceof ArrayBuffer ?
      this.response :
      this.response instanceof Blob ?
        await this.response.arrayBuffer() :
        null;
  }
  document = async (): Promise<Document | XMLDocument | null> => {
    return this.responseXML;
  }
  readableStrem = async (): Promise<ReadableStream | null> => {
    return this.response instanceof ReadableStream ?
      this.response :
      this.response instanceof Blob ?
        this.response.stream() :
        null;
  }
}
