"use strict";

import Resource from "./Resource.js";

//type Fetch = XMLHttpRequest | ActiveXObject | null;
type Fetch = XMLHttpRequest;

export function createXHR(): Fetch {
  let xhr: Fetch | null = null;

  xhr = new XMLHttpRequest();
  //try {
  //	xhr = new XMLHttpRequest();
  //} catch {
  //	try {
  //		xhr = new ActiveXObject("Msxml2.XMLHTTP");
  //	} catch {
  //		xhr = new ActiveXObject("Microsoft.XMLHTTP");
  //	}
  //}

  return xhr;
}

const METHODS = [
  "OPTIONS",
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "DELETE",
  "TRACE",
  "CONNECT",
] as const;

type Method = typeof METHODS[number];

type HeadersType = Record<string, string>;

type Body = Document | XMLHttpRequestBodyInit | null | undefined;

type CorsMode = "cors" | "no-cors" | "same-origin";

type FetchOptions = {
  method: Method;
  headers: HeadersType;
  body: Body;
  mode: CorsMode;
  credentials: boolean;
  referrer: string | URL;
  referrerPolicy: ReferrerPolicy;
};

type ResourceURL = string | URL;

const DEFAULT_OPTIONS: FetchOptions = {
  method: "GET",
  headers: {
    //"Content-Type": "text/plain;charset=UTF-8",
    //"X-Requested-With": "XMLHttpRequest",
  },
  body: null,
  mode: "cors",
  credentials: false,
  referrer: "",
  referrerPolicy: "",
} as const;

function createOptions(userOptions: Partial<FetchOptions> = {}): FetchOptions {
  const options: FetchOptions = Object.assign(DEFAULT_OPTIONS, userOptions);

  options.headers = {
    ...DEFAULT_OPTIONS.headers,
    ...userOptions.headers,
  };

  return options;
}

export function pull(
  resource: ResourceURL,
  options?: Partial<FetchOptions>,
): Promise<Resource> {
  const fetchOptions: FetchOptions = createOptions(options);

  return new Promise((resolve) => {
    const xhr = createXHR();

    xhr.onreadystatechange = function () {
      switch (this.readyState) {
        case XMLHttpRequest.UNSENT:
          break;
        case XMLHttpRequest.OPENED:
          fetchOptions.headers["Content-Type"] ??= calcContentType(
            fetchOptions.body,
          );

          this.setRequestHeader(
            "Content-Type",
            fetchOptions.headers["Content-Type"],
          );

          for (const header in fetchOptions.headers) {
            const headerValue = fetchOptions.headers[header as string];

            if (typeof headerValue == "string") {
              // check forbidden headers
              xhr.setRequestHeader(header.trim(), headerValue.trim());
            }
          }

          this.send(fetchOptions.body);

          break;
        case XMLHttpRequest.HEADERS_RECEIVED:
          break;
        case XMLHttpRequest.LOADING:
          break;
        case XMLHttpRequest.DONE:
          if (this.status == 200) {
            resolve(
              new Resource(
                {
                  response: this.response,
                  responseText: ["", "text"].includes(this.responseType)
                    ? this.responseText
                    : null,
                  responseXML: ["", "document"].includes(this.responseType)
                    ? this.responseXML
                    : null,
                },
                {
                  status: this.status,
                  statusText: this.statusText,
                  headers: Object.fromEntries(
                    this.getAllResponseHeaders()
                      .split(/\r\n/)
                      .slice(0, -1)
                      .map((h) =>
                        h.split(/:/)
                          .map((i) => i.trim())
                      ),
                  ),
                },
              ),
            );
          }
          break;
      }
    };

    xhr.responseType = "blob";

    xhr.withCredentials = fetchOptions.credentials;

    xhr.open(fetchOptions.method, resource, true);

    manageXHREvents(xhr);
  });
}

export function manageXHREvents(xhr: Fetch) {
  xhr.onload = function () {
    //console.log(`Loaded: ${this.status} ${this.statusText}`);

    if (this.status != 200) {
      console.error(`Error ${this.status}: ${this.statusText}`);
    } else {
      //console.log(`Done, got ${this.response.length
      //  ?? this.response.size} bytes`);
    }
  };

  xhr.onerror = function () {
    throw new Error("Network Error. Request failed");
  };

  xhr.onprogress = function (_event: ProgressEvent) {
    //console.info(
    //    `Received ${event.loaded}` +
    //    (event.lengthComputable ? ` of ${event.total}` : "")
    //);
  };
}

function calcContentType(content: Body): string {
  if (content instanceof XMLDocument) {
    return "text/xml";
  }

  if (content instanceof Document) {
    return "text/html";
  }

  if (content instanceof FormData) {
    return "multipart/form-data";
  }

  if (content instanceof URLSearchParams) {
    return "x-www-form-urlencoded";
  }

  if (content instanceof Blob) {}

  return "text/plain;charset=UTF-8";
}

// xhr.timeout = millis if request does not succeed in n ms -> timeout event
// xhr.abort();
