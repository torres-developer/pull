"use strict";

import { default as pullResponse } from "./Resource.js";

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
  "CONNECT"
] as const;

type Method = typeof METHODS[number];

type HeadersType = Record<string, string>;

type Body = Document | XMLHttpRequestBodyInit | null | undefined

type CorsMode = "cors" | "no-cors" | "same-origin";

type FetchOptions = {
  method: Method,
  headers: HeadersType,
  body: Body,
  mode: CorsMode,
};

type Resource = string | URL;

const DEFAULT_OPTIONS: FetchOptions = {
  method: "GET",
  headers: {
    //"Content-Type": "application/x-www-form-urlencoded",
    //"X-Requested-With": "XMLHttpRequest",
  },
  body: null,
  mode: "cors",
} as const;

function createOptions(userOptions: Partial<FetchOptions> = {}): FetchOptions {
  const options: FetchOptions = Object.assign(DEFAULT_OPTIONS, userOptions);

  options.headers = {
    ...DEFAULT_OPTIONS.headers,
    ...userOptions.headers
  };

  return options;
}

export function pull(
  resource: Resource,
  options?: Partial<FetchOptions>
): Promise<pullResponse> {
  const fetchOptions: FetchOptions = createOptions(options);

  return new Promise(resolve => {
    const xhr = createXHR();

	  xhr.onreadystatechange = function() {
	  	switch (this.readyState) {
        case XMLHttpRequest.UNSENT:
          break;
        case XMLHttpRequest.OPENED:
          for (const header in fetchOptions.headers) {
            const headerValue = fetchOptions.headers[header as string];
      
            if (typeof headerValue == "string")
              xhr.setRequestHeader(header, headerValue);
          }

          break;
        case XMLHttpRequest.HEADERS_RECEIVED:
          break;
        case XMLHttpRequest.LOADING:
          break;
        case XMLHttpRequest.DONE:
	  	    if (this.status == 200)
	  		    resolve(new pullResponse(
              {
                response: this.response,
                responseText: this.responseText,
                responseXML: this.responseXML,
              },
              {
                status: this.status,
                statusText: this.statusText,
                headers: {}
              }
            ));
          break;
      }
	  }

    xhr.open(fetchOptions.method, resource, true);

    xhr.send(fetchOptions.body);

    //manageXHREvents(xhr);
  });
}

export function manageXHREvents(xhr: Fetch) {
  xhr.onload = function() {
    console.log(`Loaded: ${this.status} ${this.statusText}`);

    if (this.status != 200)
      console.error(`Error ${this.status}: ${this.statusText}`);
    else
      console.log(`Done, got ${this.response.length} bytes`);
  };

  xhr.onerror = function() {
    console.error("Network Error. Request failed");
  };

  xhr.onprogress = function(event: ProgressEvent) {
    console.info(
      `Received ${event.loaded}` +
        (event.lengthComputable ? ` of ${event.total}` : "")
    );
  };
}

// xhr.timeout = millis if request does not succeed in n ms -> timeout event
// xhr.abort();
