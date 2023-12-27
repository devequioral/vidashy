function formatRequest(req) {
  const { body, method, query, cookies, headers } = req;
  const { v1 } = query;
  //GET "Authorization: Bearer YOUR_SECRET_API_TOKEN"
  const apikey = headers.authorization;
  return {
    organization: v1 && v1.length > 0 ? v1[0] : null,
    collection: v1 && v1.length > 1 ? v1[1] : null,
    object: v1 && v1.length > 2 ? v1[2] : null,
    method,
    params: query,
    body,
    apikey,
    cookies,
  };
}

export { formatRequest };
