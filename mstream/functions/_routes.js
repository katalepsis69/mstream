// Define which routes should be handled by Functions
export const onRequest = () => {
  return new Response('Not Found', { status: 404 });
};