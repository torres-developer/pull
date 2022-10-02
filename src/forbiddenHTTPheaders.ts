const forbiddenHTTPheaders: RegExp[] = [
  /^Accept-(Charset|Encoding)$/g,
  /^Access-Control-Request-Headers$/g,
  /^Access-Control-Request-Method$/g,
  /^Connection$/g,
  /^Content-Length$/g,
  /^Cookie2?$/g,
  /^Date$/g,
  /^DNT$/g,
  /^Expect$/g,
  /^Host$/g,
  /^Keep-Alive$/g,
  /^Origin$/g,
  /^Referer$/g,
  /^TE$/g,
  /^Trailer$/g,
  /^Transfer-Encoding$/g,
  /^Upgrade$/g,
  /^Via$/g,
  /^Proxy-/g,
  /^Sec-/g,
];

export default Object.freeze(forbiddenHTTPheaders);
