type Fetch = XMLHttpRequest | ActiveXObject | null;

export function createXHR(): Fetch {
  let xhr: Fetch = null;

  try {
  	xhr = new XMLHttpRequest();
  } catch {
  	try {
  		xhr = new ActiveXObject("Msxml2.XMLHTTP");
  	} catch {
  		xhr = new ActiveXObject("Microsoft.XMLHTTP");
  	}
  }
  
  return xhr;
}

//const methods = ["OPTIONS", "GET", "HEAD", "POST", "PUT", "DELETE", "TRACE", "CONNECT"] as const;
//type Method = methods.concat(methods.map(m => m.toLowerCase()));
type Method = "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT";

type HeadersType = {
  [string: string]: string
}

type FetchOptions = {
  method?: Method,
  headers?: HeadersType,
  body?: null | string | FormData | Blob | BufferSource,
  mode?: "cors" | "no-cors" | "same-origin"
};

type Resource = string | URL;

export function pull(resource: Resource, options?: FetchOptions) {
  const fetchOptions = {
    method: options?.method ?? "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
      ...options?.headers
    },
    body: options?.body ?? null,
    mode: options?.mode ?? "cors",
  };

  return new Promise(resolve => {
    const xhr = createXHR();

	  xhr.onreadystatechange = function() {
	  	switch (this.readyState) {
        case 0:
          console.info("UNSENT");
          break;
        case 1:
          console.info("OPENED");
          break;
        case 2:
          console.info("HEADERS_RECEIVED");
          break;
        case 3:
          console.info("LOADING");
          break;
        case 4:
          console.info("DONE");
	  	    if (this.status == 200)
	  		    resolve(this.response ?? this.responseText);
          break;
      }
	  }

    xhr.open(fetchOptions.method, resource, true);

    xhr.send(fetchOptions.body);

    for (const header in fetchOptions.headers)
      xhr.setRequestHeader(header, fetchOptions.headers[header]);

    manageXHREvents(xhr);
  });
}

export function manageXHREvents(xhr: Fetch) {
  xhr.onload = function() {
    console.log(`Loaded: ${this.status} ${this.response}}`);

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
        (event.lengthComputable ? ` of ${event.total}}` : "")
    );
  };
}

// xhr.timeout = millis if request does not succeed in n ms -> timeout event
// xhr.abort();
