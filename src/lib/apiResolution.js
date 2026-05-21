export const getApiUrl = (endpointPath) => {
  const hostname = window.location.hostname;
  const isDev = import.meta.env.DEV ||
                hostname === 'localhost' || 
                hostname === '127.0.0.1' || 
                hostname.startsWith('192.168.') || 
                hostname.startsWith('10.') || 
                hostname.startsWith('172.') || 
                hostname.endsWith('.local');
  
  if (isDev) {
    // Keep protocol (http/https) matching window location, default to http
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    return `${protocol}://${hostname}:3002${endpointPath}`;
  }
  
  return endpointPath;
};
